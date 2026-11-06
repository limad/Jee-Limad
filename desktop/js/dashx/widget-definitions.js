"use strict";

window.JeeDashWidgetDefinitions = {
  summary: {
    cmds: [],
    extraFields: [
      { key: "fields", label: "Champs (CSV)", default: "lights,messages,updates" },
    ],
  },
  divider: {
    cmds: [],
    extraFields: [
      { key: "title", label: "Titre de section", default: "" },
    ],
  },
  equipment: {
    usesEqLogic: true,
    cmds: [],
    extraFields: [
      { key: "show_actions", label: "Afficher actions (1/0)", default: "1" },
      { key: "columns", label: "Colonnes commandes (1-6)", default: "2" },
    ],
  },
  scene: {
    cmds: [
      { key: "cmd_action", label: "Action", type: "action", genericTypes: [] },
      { key: "cmd_state", label: "Etat retour", type: "info", genericTypes: [] },
    ],
    extraFields: [
      { key: "active_label", label: "Label actif", default: "Actif" },
      { key: "inactive_label", label: "Label inactif", default: "Inactif" },
    ],
  },
  select: {
    cmds: [
      { key: "cmd_action", label: "Commande select", type: "action", genericTypes: [] },
      { key: "cmd_state", label: "Etat courant", type: "info", genericTypes: [] },
    ],
    extraFields: [
      { key: "options", label: "Options (val:label,...)", default: "" },
    ],
  },
  media: {
    cmds: [
      { key: "cmd_state", label: "Etat", type: "info", genericTypes: ["MEDIA_STATE", "MEDIA_POWER"] },
      { key: "cmd_status", label: "Statut", type: "info", genericTypes: ["MEDIA_STATUS"] },
      { key: "cmd_title", label: "Titre", type: "info", genericTypes: ["MEDIA_TITLE"] },
      { key: "cmd_artist", label: "Artiste", type: "info", genericTypes: ["MEDIA_ARTIST"] },
      { key: "cmd_album", label: "Album", type: "info", genericTypes: ["MEDIA_ALBUM"] },
      { key: "cmd_play", label: "Lecture", type: "action", genericTypes: ["MEDIA_RESUME", "MEDIA_ON"] },
      { key: "cmd_pause", label: "Pause", type: "action", genericTypes: ["MEDIA_PAUSE"] },
      { key: "cmd_stop", label: "Stop", type: "action", genericTypes: ["MEDIA_STOP"] },
      { key: "cmd_next", label: "Suivant", type: "action", genericTypes: ["MEDIA_NEXT"] },
      { key: "cmd_prev", label: "Prec.", type: "action", genericTypes: ["MEDIA_PREVIOUS"] },
      { key: "cmd_volume", label: "Volume", type: "action", genericTypes: ["SET_VOLUME"] },
    ],
    extraFields: [],
  },
  electricity: {
    cmds: [
      { key: "cmd_power", label: "Puissance (W)", type: "info", genericTypes: ["POWER"] },
      { key: "cmd_consumption", label: "Conso (kWh)", type: "info", genericTypes: ["CONSUMPTION"] },
      { key: "cmd_daily", label: "Conso/jour (kWh)", type: "info", genericTypes: ["DAILY_CONSUMPTION"] },
      { key: "cmd_voltage", label: "Tension (V)", type: "info", genericTypes: ["VOLTAGE"] },
    ],
    extraFields: [
      { key: "cmd_history", label: "Historique (ID cmd, optionnel)", default: "" },
      { key: "history_hours", label: "Periode historique (h)", default: "24" },
    ],
  },
  weather: {
    cmds: [
      { key: "cmd_wind_speed", label: "Vitesse vent", type: "info", genericTypes: ["WIND_SPEED", "WEATHER_WIND_SPEED"] },
      { key: "cmd_wind_dir", label: "Direction vent", type: "info", genericTypes: ["WIND_DIRECTION", "WEATHER_WIND_DIRECTION"] },
      { key: "cmd_rain", label: "Pluie", type: "info", genericTypes: ["RAIN_CURRENT"] },
      { key: "cmd_pressure", label: "Pression (hPa)", type: "info", genericTypes: ["PRESSURE", "WEATHER_PRESSURE"] },
    ],
    extraFields: [],
  },
  alarm: {
    cmds: [
      { key: "cmd_state", label: "Etat alarme", type: "info", genericTypes: ["ALARM_STATE"] },
      { key: "cmd_enable", label: "Activee", type: "info", genericTypes: ["ALARM_ENABLE_STATE"] },
      { key: "cmd_mode", label: "Mode", type: "info", genericTypes: ["ALARM_MODE"] },
      { key: "cmd_arm", label: "Armer", type: "action", genericTypes: ["ALARM_ARMED"] },
      { key: "cmd_disarm", label: "Desarmer", type: "action", genericTypes: ["ALARM_RELEASED"] },
    ],
    extraFields: [],
  },
  fan: {
    cmds: [
      { key: "cmd_speed_state", label: "Vitesse etat", type: "info", genericTypes: ["FAN_SPEED_STATE"] },
      { key: "cmd_speed", label: "Vitesse cmd", type: "action", genericTypes: ["FAN_SPEED"] },
      { key: "cmd_on", label: "Marche", type: "action", genericTypes: ["ENERGY_ON"] },
      { key: "cmd_off", label: "Arret", type: "action", genericTypes: ["ENERGY_OFF"] },
    ],
    extraFields: [],
  },
  garage: {
    cmds: [
      { key: "cmd_state", label: "Etat", type: "info", genericTypes: ["BARRIER_STATE", "GARAGE_STATE"] },
      { key: "cmd_open", label: "Ouvrir", type: "action", genericTypes: ["GB_OPEN"] },
      { key: "cmd_close", label: "Fermer", type: "action", genericTypes: ["GB_CLOSE"] },
      { key: "cmd_toggle", label: "Toggle", type: "action", genericTypes: ["GB_TOGGLE"] },
    ],
    extraFields: [
      { key: "invert", label: "Inverser etat (1=ferme)", default: "0" },
    ],
  },
  message: {
    cmds: [
      { key: "cmd_action", label: "Commande message", type: "action", genericTypes: [] },
    ],
    extraFields: [
      { key: "show_title", label: "Afficher titre (1/0)", default: "1" },
      { key: "placeholder_title", label: "Placeholder titre", default: "" },
      { key: "placeholder_msg", label: "Placeholder message", default: "" },
    ],
  },
  dialogue: {
    cmds: [
      { key: "cmd_action", label: "Commande envoi", type: "action", genericTypes: [] },
      { key: "cmd_response", label: "Reponse (info)", type: "info", genericTypes: [] },
    ],
    extraFields: [
      { key: "placeholder", label: "Placeholder input", default: "Votre message..." },
    ],
  },
  text: {
    cmds: [
      { key: "cmd_action", label: "Commande texte", type: "action", genericTypes: [] },
      { key: "cmd_state", label: "Valeur courante (info)", type: "info", genericTypes: [] },
    ],
    extraFields: [
      { key: "placeholder", label: "Placeholder", default: "" },
    ],
  },
  timer: {
    cmds: [
      { key: "cmd_remaining", label: "Temps restant (s)", type: "info", genericTypes: [] },
      { key: "cmd_state", label: "Etat (pause/run)", type: "info", genericTypes: ["TIMER_STATE"] },
      { key: "cmd_set", label: "Duree (s)", type: "action", genericTypes: ["SET_TIMER"] },
      { key: "cmd_pause", label: "Pause", type: "action", genericTypes: ["TIMER_PAUSE"] },
      { key: "cmd_resume", label: "Reprendre", type: "action", genericTypes: ["TIMER_RESUME"] },
    ],
    extraFields: [],
  },
  hygrostat: {
    cmds: [
      { key: "cmd_setpoint", label: "Consigne (Info)", type: "info", genericTypes: ["HUMIDITY_SETPOINT"] },
      { key: "cmd_set_setpoint", label: "Modifier consigne", type: "action", genericTypes: ["HUMIDITY_SET_SETPOINT"] },
      { key: "cmd_humidity", label: "Humidite mesuree", type: "info", genericTypes: [] },
    ],
    extraFields: [],
  },
  battery: {
    cmds: [
      { key: "cmd_level", label: "Niveau batterie", type: "info", genericTypes: ["BATTERY"] },
      { key: "cmd_status", label: "Etat batterie", type: "info", genericTypes: ["BATTERY_STATUS"] },
    ],
    extraFields: [
      { key: "low_threshold", label: "Seuil bas (%)", default: "20" },
    ],
  },
  airQuality: {
    cmds: [
      { key: "cmd_co2", label: "CO2", type: "info", genericTypes: ["CO2"] },
      { key: "cmd_voc", label: "COV", type: "info", genericTypes: ["VOC"] },
      { key: "cmd_pm25", label: "PM2.5", type: "info", genericTypes: ["PM25", "PM2_5"] },
      { key: "cmd_aqi", label: "AQI", type: "info", genericTypes: ["AQI"] },
    ],
    extraFields: [],
  },
  presence: {
    cmds: [
      { key: "cmd_state", label: "Presence", type: "info", genericTypes: ["PRESENCE", "OCCUPANCY"] },
    ],
    extraFields: [
      { key: "present_label", label: "Label present", default: "Present" },
      { key: "absent_label", label: "Label absent", default: "Absent" },
    ],
  },
  systemHealth: {
    cmds: [],
    extraFields: [
      { key: "refresh", label: "Rafraichissement (s)", default: "60" },
    ],
  },
  light: {
    cmds: [
      { key: "cmd_state", label: "Etat", type: "info", genericTypes: ["LIGHT_STATE", "ENERGY_STATE"] },
      { key: "cmd_on", label: "ON", type: "action", genericTypes: ["LIGHT_ON", "ENERGY_ON"] },
      { key: "cmd_off", label: "OFF", type: "action", genericTypes: ["LIGHT_OFF", "ENERGY_OFF"] },
    ],
    extraFields: [],
  },
  color: {
    cmds: [
      { key: "cmd_state", label: "Etat", type: "info", genericTypes: ["LIGHT_STATE"] },
      { key: "cmd_color", label: "Couleur", type: "action", genericTypes: ["LIGHT_COLOR"] },
      { key: "cmd_color_temp", label: "Temp. couleur (Info)", type: "info", genericTypes: ["LIGHT_COLOR_TEMP"] },
      { key: "cmd_set_color_temp", label: "Temp. couleur (Cmd)", type: "action", genericTypes: ["LIGHT_SET_COLOR_TEMP"] },
      { key: "cmd_on", label: "Allumer", type: "action", genericTypes: ["LIGHT_ON"] },
      { key: "cmd_off", label: "Eteindre", type: "action", genericTypes: ["LIGHT_OFF"] },
    ],
    extraFields: [],
  },
  dimmer: {
    cmds: [
      { key: "cmd_brightness", label: "Luminosite", type: "info", genericTypes: ["LIGHT_BRIGHTNESS"] },
      { key: "cmd_slider", label: "Variateur", type: "action", genericTypes: ["LIGHT_SLIDER"] },
    ],
    extraFields: [],
  },
  sensor: {
    cmds: [
      { key: "cmd_value", label: "Valeur", type: "info", genericTypes: ["TEMPERATURE", "HUMIDITY", "PRESSURE", "BATTERY", "POWER", "ENERGY"] },
    ],
    extraFields: [
      { key: "cmd_history", label: "Historique (ID cmd, optionnel)", default: "" },
      { key: "history_hours", label: "Periode historique (h)", default: "24" },
    ],
  },
  chart: {
    cmds: [
      { key: "cmd_value", label: "Commande historisee", type: "info", genericTypes: [] },
    ],
    extraFields: [
      { key: "hours", label: "Periode (heures)", default: "24" },
    ],
  },
  camera: {
    cmds: [
      { key: "cmd_url", label: "URL camera", type: "info", genericTypes: ["CAMERA_URL"] },
    ],
    extraFields: [
      { key: "refresh", label: "Rafraichissement snapshot (s)", default: "10" },
    ],
  },
  binary: {
    cmds: [
      { key: "cmd_state", label: "Etat", type: "info", genericTypes: ["DOOR", "MOTION", "SMOKE", "FLOOD", "LOCK_STATE", "OPENING"] },
    ],
    extraFields: [
      { key: "icon", label: "Icone", default: "State" },
      { key: "active_label", label: "Libelle actif", default: "Actif" },
      { key: "inactive_label", label: "Libelle inactif", default: "OK" },
    ],
  },
  lock: {
    cmds: [
      { key: "cmd_state", label: "Etat", type: "info", genericTypes: ["LOCK_STATE"] },
      { key: "cmd_open", label: "Ouvrir", type: "action", genericTypes: ["LOCK_OPEN"] },
      { key: "cmd_close", label: "Fermer", type: "action", genericTypes: ["LOCK_CLOSE"] },
    ],
    extraFields: [],
  },
  switch: {
    cmds: [
      { key: "cmd_state", label: "Etat", type: "info", genericTypes: ["ENERGY_STATE", "LIGHT_STATE"] },
      { key: "cmd_toggle", label: "Toggle", type: "action", genericTypes: ["GENERIC_ACTION", "ENERGY_ON", "LIGHT_ON"] },
    ],
    extraFields: [],
  },
  cover: {
    cmds: [
      { key: "cmd_state", label: "Etat", type: "info", genericTypes: ["FLAP_STATE"] },
      { key: "cmd_up", label: "Monter", type: "action", genericTypes: ["FLAP_UP"] },
      { key: "cmd_down", label: "Descendre", type: "action", genericTypes: ["FLAP_DOWN"] },
      { key: "cmd_stop", label: "Stop", type: "action", genericTypes: ["FLAP_STOP"] },
      { key: "cmd_slider", label: "Position", type: "action", genericTypes: ["FLAP_SLIDER"] },
    ],
    extraFields: [],
  },
  climate: {
    cmds: [
      { key: "cmd_temp", label: "Temperature", type: "info", genericTypes: ["TEMPERATURE", "THERMOSTAT_TEMPERATURE"] },
      { key: "cmd_humidity", label: "Humidite", type: "info", genericTypes: ["HUMIDITY"] },
    ],
    extraFields: [
      { key: "cmd_history", label: "Historique (ID cmd, optionnel)", default: "" },
      { key: "history_hours", label: "Periode historique (h)", default: "24" },
    ],
  },
  thermostat: {
    cmds: [
      { key: "cmd_temp", label: "Temperature", type: "info", genericTypes: ["THERMOSTAT_TEMPERATURE"] },
      { key: "cmd_setpoint", label: "Consigne", type: "info", genericTypes: ["THERMOSTAT_SETPOINT"] },
      { key: "cmd_set_setpoint", label: "Regler", type: "action", genericTypes: ["THERMOSTAT_SET_SETPOINT"] },
      { key: "cmd_mode", label: "Mode", type: "info", genericTypes: ["THERMOSTAT_MODE", "THERMOSTAT_STATE_NAME"] },
    ],
    extraFields: [
      { key: "cmd_history", label: "Historique (ID cmd, optionnel)", default: "" },
      { key: "history_hours", label: "Periode historique (h)", default: "24" },
    ],
  },
};
