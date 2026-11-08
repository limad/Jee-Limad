#!/usr/bin/env node
/* Test de fumée navigateur de la page de connexion Jeedom (Playwright).
 * Variables : JEEDOM_BASE_URL, JEEDOM_LOGIN, JEEDOM_PASSWORD, JEEDOM_CHROME, JEEDOM_SMOKE_SCREENSHOT.
 */

import { existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = await import('playwright');
} catch {
  playwright = require('../dashx/node_modules/playwright');
}
const { chromium } = playwright;

const BASE = (process.env.JEEDOM_BASE_URL || 'http://127.0.0.1:8096').replace(/\/+$/, '');
const LOGIN = process.env.JEEDOM_LOGIN || 'ci_admin';
const PASSWORD = process.env.JEEDOM_PASSWORD || 'ci_admin_test_pwd';
const SCREENSHOT = process.env.JEEDOM_SMOKE_SCREENSHOT || '';

function findChrome() {
  if (process.env.JEEDOM_CHROME) return process.env.JEEDOM_CHROME;
  try {
    const defaultPath = chromium.executablePath();
    if (defaultPath && existsSync(defaultPath)) return defaultPath;
  } catch {
    // Ignore et tente le cache local
  }
  const base = `${homedir()}/.cache/ms-playwright`;
  if (!existsSync(base)) return undefined;
  for (const d of readdirSync(base).filter((x) => x.startsWith('chromium-'))) {
    for (const sub of ['chrome-linux64/chrome', 'chrome-linux/chrome']) {
      const p = `${base}/${d}/${sub}`;
      if (existsSync(p)) return p;
    }
  }
  return undefined;
}

let failures = 0;

async function runStep(label, fn) {
  try {
    await fn();
    console.log(`[OK] ${label}`);
    return true;
  } catch (err) {
    failures++;
    console.error(`[ÉCHEC] ${label} — ${err?.message || err}`);
    return false;
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: findChrome(),
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(`console.error: ${msg.text()}`);
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(`pageerror: ${err.message}`);
    });

    // 1. GET de la page de connexion : statut < 400, formulaire présent
    await runStep('1. GET page de connexion (statut < 400, formulaire présent)', async () => {
      const response = await page.goto(`${BASE}/index.php?v=d`, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });
      if (!response || response.status() >= 400) {
        throw new Error(`Statut HTTP inattendu : ${response ? response.status() : 'aucune réponse'}`);
      }
      await page.locator('#login').waitFor({ state: 'visible', timeout: 10000 });
      await page.locator('#in_login_username').waitFor({ state: 'visible', timeout: 5000 });
      await page.locator('#in_login_password').waitFor({ state: 'visible', timeout: 5000 });
      await page.locator('.bt_showPassConnection').waitFor({ state: 'visible', timeout: 5000 });
      await page.locator('#bt_login_validate').waitFor({ state: 'visible', timeout: 5000 });
    });

    // 2. Champ mot de passe de type password ; clic sur l'œil → type text ; second clic → password
    await runStep('2. Bascule visibilité du mot de passe (password -> text -> password)', async () => {
      const passInput = page.locator('#in_login_password');
      const eyeBtn = page.locator('.bt_showPassConnection');

      const initialType = await passInput.getAttribute('type');
      if (initialType !== 'password') {
        throw new Error(`Type initial attendu "password", obtenu "${initialType}"`);
      }

      await eyeBtn.click();
      const toggledType = await passInput.getAttribute('type');
      if (toggledType !== 'text') {
        throw new Error(`Type après 1er clic attendu "text", obtenu "${toggledType}"`);
      }

      await eyeBtn.click();
      const finalType = await passInput.getAttribute('type');
      if (finalType !== 'password') {
        throw new Error(`Type après 2nd clic attendu "password", obtenu "${finalType}"`);
      }
    });

    // 3. Saisie login + mot de passe, validation par la touche Entrée (pas par le bouton)
    await runStep('3. Saisie identifiants et validation par la touche Entrée', async () => {
      await page.locator('#in_login_username').fill(LOGIN);
      const passInput = page.locator('#in_login_password');
      await passInput.fill(PASSWORD);
      await passInput.focus();
      await passInput.press('Enter');
    });

    // 4. Arrivée sur le dashboard dans les 20 s : URL p=dashboard, barre de menu affichée, formulaire de
    //    connexion disparu (une base vide n'a pas d'objet racine, donc pas de contenu de dashboard à attendre)
    await runStep('4. Arrivée sur le dashboard en moins de 20 s', async () => {
      await page.waitForURL(/[?&]p=dashboard/, { timeout: 20000 });
      await page.locator('#jeedomMenuBar').waitFor({ state: 'visible', timeout: 20000 });
      if (await page.locator('#in_login_password').count() > 0) {
        throw new Error('Le formulaire de connexion est toujours affiché');
      }
    });

    if (SCREENSHOT) {
      await page.screenshot({ path: SCREENSHOT, fullPage: true });
    }

    // 5. Aucune erreur console (console.error, pageerror) pendant tout le parcours ; liste-les si échec
    await runStep('5. Aucune erreur console (console.error, pageerror)', async () => {
      if (consoleErrors.length > 0) {
        throw new Error(`Erreurs détectées :\n  - ${consoleErrors.join('\n  - ')}`);
      }
    });

    // 6. Les chemins sensibles renvoient 403
    await runStep('6. Chemins sensibles protégés (403)', async () => {
      const sensitivePaths = [
        '/data/jeedom_encryption.key',
        '/core/config/common.config.php',
        '/log/http.error',
      ];
      for (const path of sensitivePaths) {
        const res = await page.request.get(`${BASE}${path}`);
        if (res.status() !== 403) {
          throw new Error(`${path} a renvoyé ${res.status()} au lieu de 403`);
        }
      }
    });
  } finally {
    await browser.close();
  }

  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(`[ÉCHEC] Erreur fatale : ${err?.message || err}`);
  process.exit(1);
});
