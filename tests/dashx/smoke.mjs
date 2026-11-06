#!/usr/bin/env node
/* Smoke test RUNTIME du dashboard core "dashx" (Playwright headless).
 * Charge le dashboard, crée chaque type de tuile, vérifie 0 erreur console,
 * teste la connexion SSE. SAUVEGARDE et RESTAURE le layout utilisateur
 * (dashx::layout) autour du test — ne perd jamais ton dashboard.
 *
 * Prérequis : npm i  (dans tests/dashx) — voir README.
 * Usage : node tests/dashx/smoke.mjs   (en root ou www-data)
 */
"use strict";

import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { unlinkSync, existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import assert from "node:assert/strict";

/* Trouve un binaire chromium en cache (~/.cache/ms-playwright/chromium-*),
   indépendamment de la révision exacte attendue par la version de playwright. */
function findChrome() {
  if (process.env.DASHX_CHROME) return process.env.DASHX_CHROME;
  const base = `${homedir()}/.cache/ms-playwright`;
  if (!existsSync(base)) return undefined;
  for (const d of readdirSync(base).filter((x) => x.startsWith("chromium-"))) {
    for (const sub of ["chrome-linux64/chrome", "chrome-linux/chrome"]) {
      const p = `${base}/${d}/${sub}`;
      if (existsSync(p)) return p;
    }
  }
  return undefined;
}

const BASE = process.env.DASHX_BASE_URL ?? "http://127.0.0.1";
const ROOT = process.env.DASHX_JEEDOM_ROOT ?? "/var/www/html";
// PHP n'accepte que [a-zA-Z0-9,-] dans un session id (pas d'underscore).
const SID = "dashxsmoke" + process.pid;
const BOOT = `require_once "${ROOT}/core/php/core.inc.php"; `;
const LAYOUT_BACKUP = `/tmp/dashx-smoke-layout-${process.pid}.json`;

const php = (code) => execFileSync("php", ["-r", BOOT + code], { encoding: "utf8" });

let passed = 0;
const pass = (l) => { passed++; console.log(`  \x1b[32m[PASS]\x1b[0m ${l}`); };

async function main() {
  console.log("--- dashx runtime smoke (Playwright) ---");

  // 1. Sauvegarde du layout utilisateur dans un fichier temp (restore garanti).
  php(`$r=config::byKey("dashx::layout","core",""); file_put_contents("${LAYOUT_BACKUP}", is_string($r)?$r:json_encode($r));`);
  pass("layout utilisateur sauvegardé");

  // 2. Session admin (chown www-data pour qu'Apache lise+écrive le fichier session).
  php(`session_id("${SID}"); session_start(); $_SESSION["user"]=user::byId(1); session_write_close(); $f=session_save_path()."/sess_${SID}"; @chown($f,"www-data"); @chmod($f,0660);`);

  const browser = await chromium.launch({ headless: true, executablePath: findChrome() });
  try {
    const ctx = await browser.newContext();
    await ctx.addCookies([{ name: "PHPSESSID", value: SID, domain: "127.0.0.1", path: "/", httpOnly: true }]);
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

    // 3. Chargement du dashboard.
    await page.goto(`${BASE}/index.php?v=d&p=dashx&m=core`, { waitUntil: "load", timeout: 15000 });
    await page.waitForTimeout(1500);
    assert.ok(await page.locator("#app").count() > 0, "conteneur #app absent (session ?)");
    pass("dashboard chargé");

    // 4. SSE connecté (statut "Temps reel connecte").
    await page.waitForFunction(() => {
      const s = document.querySelector(".sse-status");
      return s && /connect/i.test(s.getAttribute("title") || "");
    }, null, { timeout: 8000 }).catch(() => { throw new Error("SSE non connecté"); });
    pass("SSE connecté");

    // 5. Création de chaque type de tuile + check erreurs.
    await page.locator("#btn-edit").click();
    await page.waitForTimeout(300);
    await page.locator("#btn-add").click();
    await page.waitForTimeout(400);
    const types = ["sensor", "switch", "equipment", "divider", "summary", "chart", "thermostat", "light", "cover"];
    for (const t of types) {
      await page.locator("#widget-type").selectOption(t);
      await page.waitForTimeout(250);
      await page.locator("#btn-create-widget").click();
      await page.waitForTimeout(250);
    }
    const tiles = await page.locator("#grid .widget-shell").count();
    assert.ok(tiles >= types.length, `seulement ${tiles} tuiles pour ${types.length} types`);
    pass(`${tiles} tuiles créées (${types.length} types)`);

    // 6. Aucune erreur console/page sur tout le parcours.
    assert.equal(errors.length, 0, "erreurs détectées:\n    " + errors.join("\n    "));
    pass("0 erreur console/page");
  } finally {
    await browser.close();
    // 7. RESTAURATION du layout utilisateur + nettoyage session.
    php(`config::save("dashx::layout", file_get_contents("${LAYOUT_BACKUP}"), "core");`);
    try { unlinkSync(LAYOUT_BACKUP); } catch {}
    try { execFileSync("rm", ["-f", `/var/lib/php/sessions/sess_${SID}`]); } catch {}
    console.log("  \x1b[32m[PASS]\x1b[0m layout utilisateur restauré + session nettoyée");
  }

  console.log(`\n--- ${passed} PASS / 0 FAIL ---`);
}

main().catch((e) => {
  console.error(`\n  \x1b[31m[FAIL]\x1b[0m ${e.message}`);
  // Filet : tenter la restauration même en cas d'échec précoce.
  try { php(`if (is_file("${LAYOUT_BACKUP}")) config::save("dashx::layout", file_get_contents("${LAYOUT_BACKUP}"), "core");`); } catch {}
  process.exit(1);
});
