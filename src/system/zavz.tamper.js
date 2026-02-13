// ==UserScript==
// @name         ERA CX TOOL
// @namespace    http://tampermonkey.net/
// @version      15.0
// @description  Overlay ERA CX TOOLS + auto-login UC2BBH. Enabled liga/desliga o bot. Era/Goto disparam login automático só em /, /index.php ou /login.php dos domínios UC2BBH/SobreIP/MyUC2B/ERACloud. Visuals -> "Hide YS Icon" esconde o botão flutuante ¥$ definitivamente; a UI fica acessível só por CTRL+I. Legit -> Clear Cache limpa todos os dados do site atual. Misc -> Omni Domain detecta o domínio do Omni em configs.php.
// @author       You
// @match        https://*/*
// @match        http://*/*
// @match        *://uc2bbh.com.br/*
// @match        *://*.uc2bbh.com.br/*
// @match        *://sobreip.com.br/*
// @match        *://*.sobreip.com.br/*
// @match        *://myuc2b.com/*
// @match        *://*.myuc2b.com/*
// @match        *://eracloud.com/*
// @match        *://*.eracloud.com/*
// @match        *://cloudcanal.com.br/*
// @match        *://*.cloudcanal.com.br/*
// @match        *://fonetalk.com.br/*
// @match        *://*.fonetalk.com.br/*
// @match        *://voicemanager.cloud/*
// @match        *://*.voicemanager.cloud/*
// @match        *://silvernetdns.net.br/*
// @match        *://*.silvernetdns.net.br/*
// @match        *://fibertel.com.br/*
// @match        *://*.fibertel.com.br/*
// @match        *://easytecbrasil.com.br/*
// @match        *://*.easytecbrasil.com.br/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @connect      api.ssllabs.com
// @connect      api.allorigins.win
// @connect      r.jina.ai
// @connect      api.sslchecker.com
// @connect      api.hackertarget.com
// @connect      corsproxy.io
// @connect      api.github.com
// ==/UserScript==

(() => {
  'use strict';

  // =========================================================
  // ===============  AUTO-LOGIN ===============
  // =========================================================

  const CONTAS = {
    era:  { user: 'calliope', senhas: ['era@2UcvE48', 'era@2Ualb22', 'era@1Calb17', 'calliope@1234'] },
    goto: { user: 'goto.ccp', senhas: ['era@2UcvE48', 'goTo@1838@j'] },
    fibertel: { user: 'dev', senhas: ['era@2UcvE48', 'era@1Calb17', 'era@2Ualb22'] }
  };

  const STATE_KEY    = 'uc2bbh_state_v15';
  const SETTINGS_KEY = 'zavz_uc2bbh_settings_v5';
  const SUCCESS_KEY  = 'zavz_uc2bbh_success_v1';
  const STATUS_HISTORY_KEY = 'zavz_uc2bbh_status_history_v1';
  const WINDOW_POS_KEY = 'zavz_window_pos_v1';

  const THEME_PRESETS = Object.freeze({
    black: '#262a35',
    blue: '#4c83ff',
    purple: '#c500ff',
    green: '#2dc86a',
    orange: '#ff861a',
    pink: '#e1489f',
    cyan: '#20b7d3',
    yellow: '#f0c10b',
    gray: '#6e7385',
    sunset: '#ff5a70'
  });
  const THEME_MODES = Object.freeze(['dark', 'black', 'contrast']);
  const THEME_ACCENT_STYLES = Object.freeze(['solid', 'two', 'fade', 'rainbow']);
  const DEFAULT_THEME_SETTINGS = Object.freeze({
    mode: 'dark',
    preset: 'purple',
    customHue: 286,
    customHex: '#C500FF',
    customHex2: '#4C83FF',
    accentStyle: 'solid',
    savedColors: [],
    useCustom: false,
    glow: true
  });
  const DEFAULT_UI_SCALE = 0.9;
  const UI_SCALE_MIN = 0.65;
  const UI_SCALE_MAX = 1.0;

  function clampNumber(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function normalizeUiScale(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return DEFAULT_UI_SCALE;
    return clampNumber(num, UI_SCALE_MIN, UI_SCALE_MAX);
  }

  function normalizeFabPos(pos) {
    if (!pos || typeof pos !== 'object') return null;
    const x = Number(pos.x);
    const y = Number(pos.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x, y };
  }

  function normalizeHexColor(value, fallback = '#C500FF') {
    const raw = String(value || '').trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(raw)) {
      return `#${raw.split('').map((char) => char + char).join('').toUpperCase()}`;
    }
    if (/^[0-9a-f]{6}$/i.test(raw)) {
      return `#${raw.toUpperCase()}`;
    }
    return fallback;
  }

  function hslToHex(h, s = 100, l = 50) {
    const sat = clampNumber(Number(s), 0, 100) / 100;
    const lig = clampNumber(Number(l), 0, 100) / 100;
    const range = ((Number(h) % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * lig - 1)) * sat;
    const x = c * (1 - Math.abs((range / 60) % 2 - 1));
    const m = lig - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;
    if (range < 60) [r, g, b] = [c, x, 0];
    else if (range < 120) [r, g, b] = [x, c, 0];
    else if (range < 180) [r, g, b] = [0, c, x];
    else if (range < 240) [r, g, b] = [0, x, c];
    else if (range < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    const toHex = (num) => Math.round((num + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  function normalizeThemeSettings(theme) {
    const source = theme && typeof theme === 'object' ? theme : {};
    const mode = THEME_MODES.includes(source.mode) ? source.mode : DEFAULT_THEME_SETTINGS.mode;
    const preset = Object.prototype.hasOwnProperty.call(THEME_PRESETS, source.preset)
      ? source.preset
      : DEFAULT_THEME_SETTINGS.preset;
    const customHueRaw = Number(source.customHue);
    const customHue = Number.isFinite(customHueRaw)
      ? clampNumber(Math.round(customHueRaw), 0, 360)
      : DEFAULT_THEME_SETTINGS.customHue;
    const customHex = normalizeHexColor(source.customHex, hslToHex(customHue, 100, 50));
    const accentStyle = THEME_ACCENT_STYLES.includes(source.accentStyle)
      ? source.accentStyle
      : DEFAULT_THEME_SETTINGS.accentStyle;
    const customHex2 = normalizeHexColor(source.customHex2, DEFAULT_THEME_SETTINGS.customHex2);

    const savedColorsRaw = Array.isArray(source.savedColors)
      ? source.savedColors
      : DEFAULT_THEME_SETTINGS.savedColors;
    const savedColors = Array.isArray(savedColorsRaw)
      ? Array.from(new Set(savedColorsRaw.map((c) => normalizeHexColor(c, '')).filter(Boolean))).slice(0, 24)
      : [];
    return {
      mode,
      preset,
      customHue,
      customHex,
      customHex2,
      accentStyle,
      savedColors,
      useCustom: !!source.useCustom,
      glow: source.glow !== false
    };
  }

  let state = { ativo: false, modo: null, indice: 0, nextTryAt: 0 };
  try { const s = sessionStorage.getItem(STATE_KEY); if (s) state = JSON.parse(s); } catch {}

  function salvarState() {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  let settings = {
    enabled: false,  // default OFF
    era: false,      // default OFF
    goto: false,
    fibertel: false, // default OFF
    brtrix: false,
    delay: 180,
    hideFab: false,
    allowAllDomains: true,
    showPasswordHover: true,
    autoDetectMode: false,
    autoDetectAnyDomain: false,
    smartAttempts: true,
    performanceMode: false,
    theme: { ...DEFAULT_THEME_SETTINGS },
    uiScale: DEFAULT_UI_SCALE,
    uiScaleAuto: true,
    fabPos: null,
    profiles: [],
    favoriteDomains: [],
    activeProfileId: null,
    shortcuts: {
      toggleUI: 'Ctrl+I',
      quickEra: 'Ctrl+Shift+E',
      quickGoto: 'Ctrl+Shift+G',
      quickFibertel: 'Ctrl+Shift+F',
      quickBrtrix: 'Ctrl+Shift+B'
    },
    accessDefaultsApplied: false,
    lastMode: null,
    omniDomainLast: null,
    pabxDomainLast: null
  };
  try {
    const s = localStorage.getItem(SETTINGS_KEY);
    if (s) settings = Object.assign(settings, JSON.parse(s));
  } catch {}
  settings.theme = normalizeThemeSettings(settings.theme);
  settings.uiScale = normalizeUiScale(settings.uiScale);
  settings.uiScaleAuto = settings.uiScaleAuto !== false;
  settings.fabPos = normalizeFabPos(settings.fabPos);

  let successStats = {};
  try {
    const s = localStorage.getItem(SUCCESS_KEY);
    if (s) successStats = JSON.parse(s) || {};
  } catch {}

  let statusHistory = [];
  try {
    const s = localStorage.getItem(STATUS_HISTORY_KEY);
    if (s) statusHistory = JSON.parse(s) || [];
  } catch {}

  if (!settings.accessDefaultsApplied) {
    settings.allowAllDomains = true;
    settings.showPasswordHover = true;
    settings.accessDefaultsApplied = true;
    try { salvarSettings(); } catch {}
  }

  function salvarSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function salvarSuccessStats() {
    localStorage.setItem(SUCCESS_KEY, JSON.stringify(successStats));
  }

  function salvarStatusHistory() {
    localStorage.setItem(STATUS_HISTORY_KEY, JSON.stringify(statusHistory));
  }

  function salvarWindowPos(pos) {
    localStorage.setItem(WINDOW_POS_KEY, JSON.stringify(pos));
  }

  function carregarWindowPos() {
    try {
      const s = localStorage.getItem(WINDOW_POS_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }

  const trustedHtmlPolicy = typeof trustedTypes !== 'undefined' && trustedTypes.createPolicy
    ? trustedTypes.createPolicy('zavz-safe', { createHTML: (s) => s })
    : null;

  const setHTML = (el, html) => {
    if (!el) return;
    el.innerHTML = trustedHtmlPolicy ? trustedHtmlPolicy.createHTML(html) : html;
  };

  function deriveBrtrixUser() {
    const base = (settings.pabxDomainLast || location.hostname || location.host || '').trim();
    const domain = cleanDomain(base);
    return domain ? `calliope@${domain}` : 'calliope';
  }

  const DEFAULT_MODE_MAP = [
    { re: /(\.|^)fibertel\.com\.br$/i, mode: 'fibertel' },
    { re: /(\.|^)brtrix\.com\.br$/i, mode: 'brtrix' },
    { re: /(\.|^)goto\./i, mode: 'goto' },
    { re: /(\.|^)uc2bbh\.com\.br$|(\.|^)sobreip\.com\.br$|(\.|^)myuc2b\.com$|(\.|^)eracloud\.com$|(\.|^)cloudcanal\.com\.br$|(\.|^)fonetalk\.com\.br$|(\.|^)voicemanager\.cloud$|(\.|^)silvernetdns\.net\.br$|(\.|^)easytecbrasil\.com\.br$/i, mode: 'era' }
  ];

  const normalizeDomain = (value = '') =>
    value.trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');

  function getCurrentDomainKey() {
    return normalizeDomain(location.hostname || location.host || '');
  }

  function findProfileForDomain(domainKey) {
    if (!Array.isArray(settings.profiles)) return null;
    return settings.profiles.find((profile) =>
      Array.isArray(profile.domains) &&
      profile.domains.map(normalizeDomain).includes(domainKey)
    ) || null;
  }

  function detectLoginMode() {
    const domainKey = getCurrentDomainKey();
    const profile = findProfileForDomain(domainKey);
    if (profile?.mode) return profile.mode;
    const match = DEFAULT_MODE_MAP.find((entry) => entry.re.test(domainKey));
    if (match?.mode) return match.mode;
    if (settings.autoDetectAnyDomain) return 'era';
    return settings.lastMode || null;
  }

  function getSmartPasswords(conta, mode, domainKey) {
    const base = Array.isArray(conta?.senhas) ? conta.senhas.slice() : [];
    if (!settings.smartAttempts || !mode || !domainKey) return base;
    const domainStats = successStats?.[domainKey]?.[mode];
    if (!domainStats) return base;
    return base
      .map((senha, idx) => ({ senha, idx, score: Number(domainStats[senha]) || 0 }))
      .sort((a, b) => (b.score - a.score) || (a.idx - b.idx))
      .map((item) => item.senha);
  }

  function registerLoginSuccess({ domainKey, mode, senha }) {
    if (!domainKey || !mode || !senha) return;
    successStats[domainKey] = successStats[domainKey] || {};
    successStats[domainKey][mode] = successStats[domainKey][mode] || {};
    successStats[domainKey][mode][senha] = (successStats[domainKey][mode][senha] || 0) + 1;
    salvarSuccessStats();
  }

    function hostPermitida() {
        if (settings.allowAllDomains) return true;
        return /(\.|^)uc2bbh\.com\.br$|(\.|^)sobreip\.com\.br$|(\.|^)myuc2b\.com$|(\.|^)eracloud\.com$|(\.|^)cloudcanal\.com\.br$|(\.|^)fonetalk\.com\.br$|(\.|^)voicemanager\.cloud$|(\.|^)silvernetdns\.net\.br$|(\.|^)fibertel\.com\.br$|(\.|^)easytecbrasil\.com\.br$|(\.|^)brtrix\.com\.br$/i
            .test(location.hostname);
    }

  function hostPermitidaParaAutoLogin() {
    if (hostPermitida()) return true;
    return !!(settings.autoDetectMode && settings.autoDetectAnyDomain);
  }

  const showPassBindings = [];
  let showPassObserver = null;

  function bindPasswordField(input) {
    if (!input || input.dataset?.zavzShowPass) return;
    const prevType = input.type;
    const onOver = () => {
      input.dataset.zavzPrevType = prevType;
      input.type = 'text';
    };
    const onOut = () => {
      input.type = input.dataset?.zavzPrevType || 'password';
    };
    input.addEventListener('mouseover', onOver);
    input.addEventListener('mouseout', onOut);
    input.dataset.zavzShowPass = '1';
    showPassBindings.push({ input, onOver, onOut });
  }

  function enableShowPasswordHover() {
    document.querySelectorAll("input[type='password']").forEach(bindPasswordField);
    if (!showPassObserver) {
      showPassObserver = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          m.addedNodes?.forEach((n) => {
            if (n.nodeType !== 1) return;
            if (n.matches?.("input[type='password']")) bindPasswordField(n);
            n.querySelectorAll?.("input[type='password']").forEach(bindPasswordField);
          });
        });
      });
      showPassObserver.observe(document.body, { childList: true, subtree: true });
    }
  }

  function disableShowPasswordHover() {
    while (showPassBindings.length) {
      const { input, onOver, onOut } = showPassBindings.pop();
      input.removeEventListener('mouseover', onOver);
      input.removeEventListener('mouseout', onOut);
      if (input.dataset) {
        input.type = input.dataset.zavzPrevType || 'password';
        delete input.dataset.zavzShowPass;
        delete input.dataset.zavzPrevType;
      }
    }
    if (showPassObserver) {
      showPassObserver.disconnect();
      showPassObserver = null;
    }
  }

  function deveMostrarBotoes() {
    if (!hostPermitidaParaAutoLogin()) return false;

    const path = location.pathname.toLowerCase();
    const ehRaizOuLogin = path === '/' || path === '/index.php' || path.endsWith('login.php');
    if (!ehRaizOuLogin) return false;

    return !!document.querySelector(
      'input[type="text"], input[name="username"], input[placeholder*="login" i], input[type="password"]'
    );
  }

  function getDelay() {
    let d = Number(settings.delay);
    if (!Number.isFinite(d) || d < 0) d = 180;
    return d;
  }

  function parar(totalReset = false) {
    state.ativo = false;
    state.modo = null;
    state.indice = 0;
    state.passwords = null;
    state.nextTryAt = 0;
    salvarState();
    if (totalReset) sessionStorage.removeItem(STATE_KEY);
    clearAttemptTimer();
    missingFieldCount = 0;
    hideAttemptBadge();
  }

  function autoDesativarDepoisDeFalharTudo() {
    settings.enabled = false;
    if (state.modo === 'era') settings.era = false;
    if (state.modo === 'goto') settings.goto = false;
    if (state.modo === 'fibertel') settings.fibertel = false;
    if (state.modo === 'brtrix') settings.brtrix = false;
    salvarSettings();

    if (window.__zavz_ref) {
      const { swEnabled, swEra, swGoto, swFibertel } = window.__zavz_ref;
      if (swEnabled) swEnabled.checked = false;
      if (swEra && state.modo === 'era') swEra.checked = false;
      if (swGoto && state.modo === 'goto') swGoto.checked = false;
      if (swFibertel && state.modo === 'fibertel') swFibertel.checked = false;
    }
  }

  function iniciar(modo) {
    if (!settings.enabled) return;
    if (state.ativo || !deveMostrarBotoes()) return;

    const conta = CONTAS[modo];
    if (!conta) return;

    const domainKey = getCurrentDomainKey();
    const passwordList = getSmartPasswords(conta, modo, domainKey);

    state.ativo = true;
    state.modo = modo;
    state.indice = 0;
    state.passwords = passwordList;
    state.nextTryAt = 0;
    salvarState();

    settings.lastMode = modo;
    salvarSettings();

    updateUIStatus();
    tentar();
  }

  function iniciarAutoDetect() {
    if (!settings.autoDetectMode) return;
    const detected = detectLoginMode();
    if (!detected) return;
    iniciar(detected);
  }

  let attemptTimer = null;
  const BASE_POLL_INTERVAL = 350;
  let missingFieldCount = 0;
  let loginCache = { user: null, pass: null, submit: null };
  let lastAttempt = null;

  function clearAttemptTimer() {
    if (attemptTimer) {
      clearTimeout(attemptTimer);
      attemptTimer = null;
    }
  }

  function scheduleNextAttempt(delay = BASE_POLL_INTERVAL) {
    clearAttemptTimer();
    attemptTimer = setTimeout(() => {
      attemptTimer = null;
      if (!state.ativo || !settings.enabled) return;
      tentar();
    }, delay);
  }

  function invalidateLoginCache() {
    loginCache = { user: null, pass: null, submit: null };
  }

  function getLoginElements() {
    if (settings.performanceMode) {
      const cachedValid = loginCache.user?.isConnected && loginCache.pass?.isConnected && loginCache.submit?.isConnected;
      if (cachedValid) return loginCache;
    }

    const user = document.querySelector(
      'input[type="text"],input[name="username"],input[placeholder*="login" i]'
    );
    const pass = document.querySelector(
      'input[type="password"],input[name="password"]'
    );
    const submit = document.querySelector('button,input[type="submit"]');

    loginCache = { user, pass, submit };
    return loginCache;
  }

  function tentar() {
    if (!state.ativo || !settings.enabled || !deveMostrarBotoes()) return;

    const now = Date.now();
    if (state.nextTryAt && now < state.nextTryAt) {
      scheduleNextAttempt(state.nextTryAt - now);
      return;
    }

    const conta = CONTAS[state.modo];
    if (!conta) { parar(true); return; }

    const passwordList = Array.isArray(state.passwords) && state.passwords.length
      ? state.passwords
      : getSmartPasswords(conta, state.modo, getCurrentDomainKey());
    const total = passwordList.length;

    if (state.indice >= total) {
      autoDesativarDepoisDeFalharTudo();
      parar(true);
      updateUIStatus('FALHOU TODAS \u2014 DESATIVADO', true);
      setTimeout(mostrarPopupGigante, getDelay() * 4);
      return;
    }

    const { user, pass, submit: sub } = getLoginElements();

    const delay = Math.max(80, getDelay());
    const retryDelay = Math.max(400, delay * 5);

    if (!user || !pass || !sub) {
      missingFieldCount += 1;
      const backoff = settings.performanceMode
        ? Math.min(retryDelay + (missingFieldCount * 350), 7000)
        : retryDelay;
      state.nextTryAt = now + backoff;
      salvarState();
      scheduleNextAttempt(backoff);
      return;
    }
    missingFieldCount = 0;

    const tentativaAtual = state.indice + 1;
    updateUIStatus(`${state.modo.toUpperCase()} ${tentativaAtual}/${total}`);
    showAttemptBadge(`${state.modo.toUpperCase()} ${tentativaAtual}/${total}`);
    addRecentAction(`Tentativa ${state.modo.toUpperCase()} ${tentativaAtual}/${total}`, getCurrentDomainKey());

    const username = typeof conta.user === 'function' ? conta.user() : conta.user;
    user.value = username;
    const senhaAtual = passwordList[state.indice];
    pass.value = senhaAtual;

    [user, pass].forEach(el =>
      ['input', 'change', 'keyup', 'blur'].forEach(ev =>
        el.dispatchEvent(new Event(ev, { bubbles: true }))
      )
    );

    lastAttempt = {
      domainKey: getCurrentDomainKey(),
      mode: state.modo,
      senha: senhaAtual,
      at: Date.now()
    };

    state.indice++;
    state.nextTryAt = now + retryDelay;
    salvarState();

    setTimeout(() => sub.click(), delay);
    scheduleNextAttempt(retryDelay);
    setTimeout(() => {
      if (!lastAttempt) return;
      if (!deveMostrarBotoes()) {
        registerLoginSuccess(lastAttempt);
        addRecentAction(`Login OK (${lastAttempt.mode.toUpperCase()})`, lastAttempt.domainKey);
        lastAttempt = null;
      }
    }, Math.max(600, delay * 3));
  }

  function mostrarPopupGigante() {
    if (document.getElementById('popup_gigante')) return;

    const overlay = document.createElement('div');
    overlay.id = 'popup_gigante';
    overlay.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.95);z-index:2147483647;display:flex;align-items:center;justify-content:center;';

    setHTML(overlay, `
      <div style="background:#fff;padding:60px;border-radius:40px;text-align:center;max-width:90%;box-shadow:0 40px 120px rgba(0,0,0,0.8);">
        <h1 style="font-size:60px;color:#d32f2f;margin:0;">FALHOU TODAS</h1>
        <p style="font-size:32px;margin:40px 0;line-height:1.6;">
          Servidor exige <strong>VPN</strong> ou<br>
          a senha foi <strong>alterada</strong>.
        </p>
        <p style="font-size:28px;color:#d32f2f;">Tente via IP direto</p>
        <button
          onclick="this.closest('#popup_gigante').remove(); sessionStorage.removeItem('${STATE_KEY}')"
          style="background:#d32f2f;color:white;border:none;padding:25px 80px;border-radius:100px;font-size:30px;cursor:pointer;margin-top:40px;">
          FECHAR
        </button>
        </div>
      `);

    document.documentElement.appendChild(overlay);
  }

  function showAttemptBadge(text){
    let el = document.getElementById('zavz-attempt-badge');
    if (!el) {
      el = document.createElement('div');
      el.id = 'zavz-attempt-badge';
      el.style.cssText = `
        position:fixed;top:18px;right:18px;z-index:2147483647;
        background:rgba(10,12,16,.92);color:#fff;border:1px solid rgba(255,255,255,.12);
        padding:10px 14px;border-radius:10px;font:700 14px system-ui;
        box-shadow:0 10px 28px rgba(0,0,0,.6);
      `;
      document.documentElement.appendChild(el);
    }
    el.textContent = text;
  }
  function hideAttemptBadge(){
    const el = document.getElementById('zavz-attempt-badge');
    if (el) el.remove();
  }

  new MutationObserver(() => {
    if (settings.performanceMode) {
      invalidateLoginCache();
    }
    if (!deveMostrarBotoes()) {
      if (state.ativo) {
        parar(true);
        updateUIStatus();
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  if (state.ativo && settings.enabled) {
    scheduleNextAttempt(0);
  }

  // =========================================================
  // ===================  UI OVERLAY (ZAVZ) ==================
  // =========================================================

  const ID_ROOT = 'zavz-root';
  const ID_BTN  = 'zavz-fab';

  const ICONS = {
    bolt: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>`,
    arrow:`<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 12h11l-4-4 1.4-1.4L21.8 12l-8.4 5.4L12 16l4-4H5z"/></svg>`,
    eye:  `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>`,
    box:  `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 7 12 3l8 4-8 4-8-4zm0 3 8 4v7l-8-4v-7zm16 0v7l-8 4v-7l8-4z"/></svg>`,
    sliders:`<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 4h2v10H7V4zm8 0h2v6h-2V4zM7 18h2v2H7v-2zm8-4h2v6h-2v-6zM3 14h18v2H3v-2zM3 10h18v2H3v-2z"/></svg>`,
    pulse:`<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 13h4l2-6 4 12 2-6h6v-2h-4l-2 6-4-12-2 6H3z"/></svg>`,
    bug:`<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 3a2 2 0 0 0-4 0H7v2h10V3h-3zm6 8V9h-2.09A6 6 0 0 0 13 7V6h-2v1a6 6 0 0 0-4.91 2H4v2h1.09c-.06.33-.09.66-.09 1v1H4v2h2v2c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2v-2h2v-2h-1v-1c0-.34-.03-.67-.09-1H20zM9 18c-1.1 0-2-.9-2-2v-3a4 4 0 0 1 8 0v3c0 1.1-.9 2-2 2H9z"/></svg>`,
    user:`<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-4.4 0-8 2.24-8 5v1h16v-1c0-2.76-3.6-5-8-5Z"/></svg>`,
    lock:`<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17 9h-1V7a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-7-2a2 2 0 1 1 4 0v2h-4V7z"/></svg>`
  };

  let root = null;
  let fab = null;
  let statusEl = null;
  let activePanelId = 'main';
  let omniBusy = false;
  let logViewerEl = null;

  const OMNI_STATUS_DEFAULT = 'Caminho: /omni/accounts/accounts.php \u2192 configs.php \u2192 status services.';
  const PABX_STATUS_DEFAULT = 'Use o domínio do servidor atual para consultas e ping.';
  const CERT_STATUS_OMNI_DEFAULT = 'Valide o certificado SSL do Omni para checar expiração, issuer e grade.';
  const CERT_STATUS_PABX_DEFAULT = 'Valide o certificado SSL do PABX para garantir conexão segura.';
  const WA_STATUS_DEFAULT = 'Checa a versão mais recente do whatsapp-web.js no GitHub.';
  const WA_COMMIT_STATUS_DEFAULT = 'Veja o commit mais recente (nightly) e links rápidos.';
  const FDP_STATUS_DEFAULT = 'Veja release e commit recentes do FDPClient.';

  const SSL_LABS_API = 'https://api.ssllabs.com/api/v3/analyze';
  const requestGuards = {};

  function createRequestGuard(key) {
    if (!key) return null;
    if (requestGuards[key]) requestGuards[key].canceled = true;
    const guard = { canceled: false };
    requestGuards[key] = guard;
    return guard;
  }

  async function fetchJsonCors(url, guard) {
    const targets = [
      { url },
      { url: `https://corsproxy.io/?${encodeURIComponent(url)}` },
      { url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, unwrap: true },
      { url: `https://r.jina.ai/http://${url.replace(/^https?:\/\//i, '')}` }
    ];

    let lastError = null;

    const requestJson = (target) => new Promise((resolve, reject) => {
      const parseBody = (body) => {
        if (target.unwrap) {
          try {
            const wrapped = JSON.parse(body);
            if (wrapped && typeof wrapped.contents === 'string') {
              return JSON.parse(wrapped.contents);
            }
          } catch {}
        }

        try {
          return JSON.parse(body);
        } catch {
          const preview = (body || '').slice(0, 120).replace(/\s+/g, ' ');
          throw new Error(`Resposta inválida (${preview || 'vazia'})`);
        }
      };

      const onSuccess = (body) => {
        try {
          if (guard?.canceled) throw new Error('Cancelado');
          resolve(parseBody(body || ''));
        } catch (err) {
          reject(err);
        }
      };

      if (typeof GM_xmlhttpRequest === 'function') {
        GM_xmlhttpRequest({
          method: 'GET',
          url: target.url,
          headers: { 'Accept': 'application/json,text/plain,*/*' },
          timeout: 12000,
          onload: (res) => {
            if (res.status < 200 || res.status >= 300) {
              reject(new Error(`HTTP ${res.status}`));
              return;
            }
            onSuccess(res.responseText || '');
          },
          onerror: () => reject(new Error('Erro de rede ou bloqueio.')),
          ontimeout: () => reject(new Error('Timeout ao buscar JSON.'))
        });
      } else {
        fetch(target.url, { cache: 'no-store' })
          .then(resp => {
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return resp.text();
          })
          .then((body) => {
            if (guard?.canceled) throw new Error('Cancelado');
            onSuccess(body);
          })
          .catch(reject);
      }
    });

    for (const target of targets) {
      try {
        if (guard?.canceled) throw new Error('Cancelado');
        return await requestJson(target);
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Falha ao buscar JSON.');
  }

  async function fetchTextCors(url, guard) {
    const targets = [
      { url },
      { url: `https://corsproxy.io/?${encodeURIComponent(url)}` },
      { url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, unwrap: true }
    ];

    let lastError = null;

    const requestText = (target) => new Promise((resolve, reject) => {
      const onSuccess = (body) => {
        if (guard?.canceled) {
          reject(new Error('Cancelado'));
          return;
        }
        if (target.unwrap) {
          try {
            const wrapped = JSON.parse(body || '');
            if (wrapped && typeof wrapped.contents === 'string') {
              resolve(wrapped.contents);
              return;
            }
          } catch {}
        }
        resolve(body || '');
      };

      if (typeof GM_xmlhttpRequest === 'function') {
        GM_xmlhttpRequest({
          method: 'GET',
          url: target.url,
          headers: { 'Accept': 'text/plain,*/*' },
          timeout: 12000,
          onload: (res) => {
            if (res.status < 200 || res.status >= 300) {
              reject(new Error(`HTTP ${res.status}`));
              return;
            }
            onSuccess(res.responseText || '');
          },
          onerror: () => reject(new Error('Erro de rede ou bloqueio.')),
          ontimeout: () => reject(new Error('Timeout ao buscar texto.'))
        });
      } else {
        fetch(target.url, { cache: 'no-store' })
          .then(resp => {
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return resp.text();
          })
          .then((body) => {
            if (guard?.canceled) throw new Error('Cancelado');
            onSuccess(body);
          })
          .catch(reject);
      }
    });

    for (const target of targets) {
      try {
        if (guard?.canceled) throw new Error('Cancelado');
        return await requestText(target);
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Falha ao buscar texto.');
  }

  async function fetchLatestGithubRelease(repo) {
    const apiUrl = `https://api.github.com/repos/${repo}/releases?per_page=1`;
    const data = await fetchJsonCors(apiUrl);
    const release = Array.isArray(data) ? data[0] : data;
    if (!release || (!release.tag_name && !release.name)) {
      throw new Error('Release não encontrada.');
    }
    return {
      tag: release.tag_name || release.name,
      date: release.published_at || release.created_at || null
    };
  }

  async function fetchLatestGithubCommit(repo) {
    const apiUrl = `https://api.github.com/repos/${repo}/commits?per_page=1`;
    const data = await fetchJsonCors(apiUrl);
    const commit = Array.isArray(data) ? data[0] : data;
    if (!commit || !commit.sha) throw new Error('Commit não encontrado.');
    return {
      sha: commit.sha,
      shortSha: commit.sha.slice(0, 7),
      date: commit.commit?.author?.date || commit.commit?.committer?.date || commit.author?.date || null,
      message: commit.commit?.message || commit.message || ''
    };
  }

  const cleanDomain = (d) => (d || '').replace(/^https?:\/\//i, '').replace(/\/+$/, '').trim();
  const escapeHtml = (s = '') => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));

  function hexToRgb(hex) {
    const normalized = normalizeHexColor(hex, '#000000').slice(1);
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
    };
  }

  function rgbToHsl(r, g, b) {
    const rn = clampNumber(Number(r), 0, 255) / 255;
    const gn = clampNumber(Number(g), 0, 255) / 255;
    const bn = clampNumber(Number(b), 0, 255) / 255;

    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case rn:
          h = ((gn - bn) / delta) % 6;
          break;
        case gn:
          h = (bn - rn) / delta + 2;
          break;
        default:
          h = (rn - gn) / delta + 4;
      }
      h *= 60;
      if (h < 0) h += 360;
    }

    return {
      h: clampNumber(Math.round(h), 0, 360),
      s: clampNumber(Math.round(s * 100), 0, 100),
      l: clampNumber(Math.round(l * 100), 0, 100)
    };
  }

  function hexToHue(hex, fallbackHue = DEFAULT_THEME_SETTINGS.customHue) {
    try {
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return clampNumber(Number(hsl.h), 0, 360);
    } catch {
      return fallbackHue;
    }
  }

  function mixHex(a, b, ratio = 0.5) {
    const pct = clampNumber(Number(ratio), 0, 1);
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    const r = Math.round(ca.r + (cb.r - ca.r) * pct);
    const g = Math.round(ca.g + (cb.g - ca.g) * pct);
    const bl = Math.round(ca.b + (cb.b - ca.b) * pct);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`.toUpperCase();
  }

  function rgbaFromHex(hex, alpha = 1) {
    const rgb = hexToRgb(hex);
    const a = clampNumber(Number(alpha), 0, 1);
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
  }

  function createThemePalette(themeState) {
    const modeSet = {
      dark: {
        bg: '#070B14',
        bg2: '#0C1320',
        bg3: '#101A29',
        bg4: '#0A101A',
        text: '#E8F0FF',
        muted: '#8D9BB8',
        offBase: '#253247',
        lineBase: '#9FB4DC'
      },
      black: {
        bg: '#030405',
        bg2: '#090B0E',
        bg3: '#101215',
        bg4: '#07090C',
        text: '#F2F4FF',
        muted: '#8C96B0',
        offBase: '#1C2029',
        lineBase: '#95A4C3'
      },
      contrast: {
        bg: '#0A0F1C',
        bg2: '#111B2F',
        bg3: '#15233B',
        bg4: '#0D1628',
        text: '#EDF6FF',
        muted: '#8EA2CC',
        offBase: '#2A3D62',
        lineBase: '#B3C8EF'
      }
    };

    const mode = modeSet[themeState.mode] || modeSet.dark;
    const presetAccent = THEME_PRESETS[themeState.preset] || THEME_PRESETS.purple;
    const customAccent = normalizeHexColor(themeState.customHex, hslToHex(themeState.customHue, 100, 50));
    const accent = themeState.useCustom ? customAccent : presetAccent;
    const accent2 = (themeState.accentStyle === 'two' || themeState.accentStyle === 'fade')
      ? normalizeHexColor(themeState.customHex2, mixHex(accent, '#FFFFFF', 0.28))
      : mixHex(accent, '#FFFFFF', 0.28);
    const off = mixHex(mode.offBase, accent, 0.23);
    const line = mixHex(mode.lineBase, accent, 0.2);
    const line2 = mixHex(mode.bg2, line, 0.35);

    const accentA08 = rgbaFromHex(accent, 0.08);
    const accentA12 = rgbaFromHex(accent, 0.12);
    const accentA18 = rgbaFromHex(accent, 0.18);
    const accentA24 = rgbaFromHex(accent, 0.24);
    const accentA35 = rgbaFromHex(accent, 0.35);
    const accentA55 = rgbaFromHex(accent, 0.55);
    const accentA75 = rgbaFromHex(accent, 0.75);

    const accent2A18 = rgbaFromHex(accent2, 0.18);
    const accent2A24 = rgbaFromHex(accent2, 0.24);

    return {
      ...mode,
      accent,
      accent2,
      accentA08,
      accentA12,
      accentA18,
      accentA24,
      accentA35,
      accentA55,
      accentA75,
      accent2A18,
      accent2A24,
      off,
      line: rgbaFromHex(line, 0.42),
      line2: rgbaFromHex(line2, 0.28),
      overlayGlow1: rgbaFromHex(accent, 0.23),
      overlayGlow2: rgbaFromHex(accent2, 0.18),
      fabStart: mixHex(mode.bg2, accent, 0.34),
      fabMid: mixHex(mode.bg3, accent, 0.52),
      fabEnd: accent,
      glowShadow: themeState.glow
        ? `0 0 0 1px ${rgbaFromHex(accent, 0.3)}, 0 12px 30px ${rgbaFromHex(accent, 0.45)}`
        : '0 0 0 1px rgba(255,255,255,.14), 0 10px 22px rgba(0,0,0,.45)'
    };
  }

  CONTAS.brtrix = { user: () => deriveBrtrixUser(), senhas: CONTAS.era.senhas };

  const sleep = (ms = 4000) => new Promise(res => setTimeout(res, ms));

  const siteLogs = [];
  const MAX_LOGS = 200;
  const recentActions = [];
  const MAX_ACTIONS = 12;

  function addLog(type, message, detail) {
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const entry = { type, message: String(message || ''), detail: detail ? String(detail) : '', time };
    siteLogs.push(entry);
    if (siteLogs.length > MAX_LOGS) siteLogs.shift();
    renderLogs();
  }

  function addRecentAction(title, detail) {
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    recentActions.unshift({ title, detail: detail || '', time });
    if (recentActions.length > MAX_ACTIONS) recentActions.pop();
    renderRecentActions();
  }

  const originalConsole = { ...console };
  ['log', 'info', 'warn', 'error'].forEach(method => {
    const orig = originalConsole[method] || console.log;
    console[method] = (...args) => {
      try {
        addLog(method.toUpperCase(), args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '));
      } catch {}
      return orig.apply(console, args);
    };
  });

  window.onerror = (msg, source, lineno, colno, error) => {
    const detail = error?.stack || '';
    const location = `${source || 'unknown'}:${lineno || 0}:${colno || 0}`;
    addLog('ERROR', `${msg} @ ${location}`, detail);
    return false;
  };

  function setDomainStatus(ui, text, color = 'var(--muted)') {
    if (!ui) return;
    ui.status.textContent = text;
    ui.status.style.color = color;
  }

  async function fetchCertFallback(alvo, guard) {
    try {
      const texto = await fetchTextCors(`https://api.hackertarget.com/sslcheck/?q=${encodeURIComponent(alvo)}`, guard);
      const issuerMatch = texto.match(/Issuer\s*:\s*(.+)/i);
      const notAfterMatch = texto.match(/Not valid after\s*:\s*(.+)/i);
      const validade = notAfterMatch ? new Date(notAfterMatch[1].trim()) : null;
      return {
        validade: validade && !isNaN(validade.getTime()) ? validade : null,
        issuer: issuerMatch ? issuerMatch[1].trim() : null
      };
    } catch (err) {
      addLog('WARN', 'Fallback cert lookup falhou', err?.message || String(err));
      return null;
    }
  }

  async function pingDomain(domain, ui, prefix = 'IP de', rememberKey) {
    const alvo = cleanDomain(domain);
    if (!alvo) {
      setDomainStatus(ui, 'Informe um domínio para pingar.', 'var(--muted)');
      return;
    }

    const guard = createRequestGuard(`ping:${alvo}`);
    if (ui) ui.lastIP = null;

    try {
      setDomainStatus(ui, `Pingando ${alvo} ...`, 'var(--muted)');

      const resp = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(alvo)}&type=A`,
        { cache: 'no-store' }
      );
      if (!resp.ok) throw new Error('Falha ao consultar DNS.');

      const data = await resp.json();
      if (guard?.canceled) throw new Error('Cancelado');
      const answer = (data.Answer || []).find(a => a.type === 1 && a.data);
      if (!answer) throw new Error('IP não encontrado.');

      if (rememberKey) {
        settings[rememberKey] = alvo;
        salvarSettings();
      }
      if (ui.input) ui.input.value = alvo;
      if (ui) ui.lastIP = answer.data;
      if (ui) ui.lastDomain = alvo;

      setDomainStatus(ui, `${prefix} ${alvo}: ${answer.data}`, '#7CFF9B');
    } catch (err) {
      if (guard?.canceled) return;
      setDomainStatus(ui, `Ping falhou: ${err?.message || err}`, '#ff8a8a');
    }
  }

  async function testConnection(domain, ui) {
    const alvo = cleanDomain(domain);
    if (!alvo) {
      setDomainStatus(ui, 'Informe um domínio para testar.', 'var(--muted)');
      return;
    }

    const guard = createRequestGuard(`test:${alvo}`);
    const url = /^https?:\/\//i.test(alvo) ? alvo : `https://${alvo}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const start = performance.now();

    try {
      setDomainStatus(ui, `Testando conexão com ${alvo} ...`, 'var(--muted)');
      await fetch(url, { mode: 'no-cors', cache: 'no-store', signal: controller.signal });
      if (guard?.canceled) throw new Error('Cancelado');
      const latency = Math.round(performance.now() - start);
      setDomainStatus(ui, `Conexão OK (${latency} ms)`, '#7CFF9B');
    } catch (err) {
      if (guard?.canceled) return;
      setDomainStatus(ui, `Conexão falhou: ${err?.message || err}`, '#ff8a8a');
    } finally {
      clearTimeout(timeout);
    }
  }

  async function validateCert(domain, ui, rememberKey) {
    const alvo = cleanDomain(domain);
    if (!alvo) {
      setDomainStatus(ui, 'Informe um domínio para validar.', 'var(--muted)');
      return;
    }

      const guard = createRequestGuard(`cert:${alvo}`);
      const buildUrl = (startNew = false, fromCache = 'on') =>
        `${SSL_LABS_API}?host=${encodeURIComponent(alvo)}&fromCache=${fromCache}&all=done&maxAge=48${startNew ? '&startNew=on&ignoreMismatch=on' : ''}`;

    try {
      if (rememberKey) {
        settings[rememberKey] = alvo;
        salvarSettings();
      }

        setDomainStatus(ui, `Validando certificado de ${alvo} ...`, 'var(--muted)');

        let data = await fetchJsonCors(buildUrl(true, 'off'), guard);

        if (data.status === 'ERROR' && data.statusMessage?.includes('Rate limit')) {
          data = await fetchJsonCors(buildUrl(false), guard);
        }

      let tentativas = 0;
      let endpoint = data.endpoints?.find(e => e.details?.cert) || null;

      while (
        tentativas < 12 &&
        data.status &&
        data.status !== 'ERROR' &&
        (!endpoint || !endpoint.details?.cert || data.status !== 'READY')
      ) {
        await sleep();
          data = await fetchJsonCors(buildUrl(true, 'off'), guard);
          endpoint = data.endpoints?.find(e => e.details?.cert) || null;
          tentativas++;
        }

      if (data.status === 'ERROR' || !data.endpoints?.length) {
        throw new Error(data.statusMessage || 'Análise indisponível no momento.');
      }

        endpoint = endpoint || data.endpoints.find(e => e.details) || data.endpoints[0];
        const cert = endpoint?.details?.cert || {};

        let validade = cert.notAfter ? new Date(cert.notAfter) : null;
        let issuer = cert.issuerLabel || cert.issuerSubject || null;

        if (!validade || !issuer) {
          const fallback = await fetchCertFallback(alvo, guard);
          if (fallback) {
            validade = validade || fallback.validade;
            issuer = issuer || fallback.issuer;
          }
        }

        const diasRestantes = validade ? Math.ceil((validade - Date.now()) / 86400000) : null;
        const grade = endpoint?.grade || endpoint?.statusMessage || data.statusMessage || 'N/A';
        const issuerTexto = issuer || 'Issuer desconhecido';

        const validadeTexto = validade
          ? `Válido até ${validade.toLocaleDateString('pt-BR')}`
          : 'Validade indisponível';

        const statusTexto = `${validadeTexto}, Grade ${grade}, Issuer: ${issuerTexto}`;

      const cor = diasRestantes === null
        ? 'var(--muted)'
        : diasRestantes > 30 ? '#7CFF9B' : diasRestantes > 0 ? '#ffd166' : '#ff8a8a';

      setDomainStatus(ui, statusTexto, cor);
      addLog('INFO', 'Certificado validado', `${alvo} \u2192 ${statusTexto}`);
    } catch (err) {
      if (guard?.canceled) return;
      setDomainStatus(ui, `Validação de certificado falhou: ${err?.message || err}`, '#ff8a8a');
      addLog('ERROR', 'Cert validator', err?.message || String(err));
    }
  }

  function renderStatusResult(el, data, label) {
    if (!el) return;
    const statusInfo = extractStatusInfo(data);
    const color = statusInfo.isOutage ? '#ff8a8a' : '#7CFF9B';
    el.textContent = `${label}: ${statusInfo.status}${statusInfo.timestamp}`;
    el.style.color = color;
  }

  function extractStatusInfo(data) {
    const statusCandidates = [
      data?.status?.description,
      data?.status?.indicator,
      data?.page?.status,
      data?.summary?.status,
      data?.overall_status,
      data?.overall?.status,
      data?.data?.status,
      data?.status
    ].filter(Boolean);

    let status = statusCandidates[0] || '';
    if (!status && Array.isArray(data?.components)) {
      const severityOrder = ['major_outage', 'partial_outage', 'degraded_performance', 'maintenance', 'operational'];
      const worst = data.components.reduce((acc, comp) => {
        const idx = severityOrder.indexOf(comp.status);
        if (idx === -1) return acc;
        if (!acc || idx < acc.idx) return { idx, status: comp.status };
        return acc;
      }, null);
      status = worst?.status || '';
    }

    if (!status && Array.isArray(data?.incidents) && data.incidents.length) {
      status = data.incidents[0].status || data.incidents[0].impact || '';
    }

    const updatedAt = data?.page?.updated_at || data?.updated_at || data?.generated_at || '';
    const timestamp = updatedAt ? ` · ${new Date(updatedAt).toLocaleString('pt-BR')}` : '';
    const normalized = status ? String(status) : 'desconhecido';
    const isOutage = /major|critical|down|outage|partial|disruption/i.test(normalized);

    return { status: normalized, timestamp, isOutage };
  }

  function recordStatusHistory(label, info) {
    if (!info?.isOutage) return;
    statusHistory.unshift({
      label,
      status: info.status,
      at: new Date().toISOString()
    });
    if (statusHistory.length > 60) statusHistory.pop();
    salvarStatusHistory();
    renderStatusHistory();
    showAttemptBadge(`ALERTA: ${label} ${info.status}`);
    setTimeout(hideAttemptBadge, 2200);
    addRecentAction(`Alerta ${label}`, info.status);
  }

  async function checkStatusApi(label, urls, el) {
    if (!el) return;
    el.textContent = `Checando ${label}...`;
    el.style.color = 'var(--muted)';
    const guard = createRequestGuard(`status:${label}`);
    try {
      const targets = Array.isArray(urls) ? urls : [urls];
      let data = null;
      for (const target of targets) {
        if (guard?.canceled) return;
        try {
          data = await fetchJsonCors(target, guard);
          break;
        } catch (err) {
          data = null;
        }
      }
      if (!data) throw new Error('Sem resposta válida.');
      const info = extractStatusInfo(data);
      if (guard?.canceled) return;
      renderStatusResult(el, data, label);
      addLog('INFO', `${label} status`, info.status || 'OK');
      recordStatusHistory(label, info);
    } catch (err) {
      if (guard?.canceled) return;
      el.textContent = `Falha ao checar ${label}: ${err?.message || err}`;
      el.style.color = '#ff8a8a';
      addLog('ERROR', `${label} status`, err?.message || String(err));
    }
  }

  function renderLogs() {
    if (!logViewerEl) return;
    if (!siteLogs.length) {
      setHTML(logViewerEl, '<div class="zavz-empty">No logs yet.</div>');
      return;
    }
    setHTML(logViewerEl, siteLogs.map(log => {
      const pillClass = (log.type || '').toLowerCase();
      return `
        <div class="zavz-log-entry">
          <div class="zavz-log-head">
            <span class="zavz-log-pill ${pillClass}">${escapeHtml(log.type)}</span>
            <span class="zavz-log-time">${escapeHtml(log.time)}</span>
          </div>
          <div class="zavz-log-message">${escapeHtml(log.message)}</div>
          ${log.detail ? `<div class="zavz-log-detail">${escapeHtml(log.detail)}</div>` : ''}
        </div>
      `;
    }).join(''));
  }

  function renderRecentActions() {
    const list = root?.querySelector('#zavz-recent-actions');
    if (!list) return;
    if (!recentActions.length) {
      setHTML(list, '<div class="zavz-empty">Sem ações recentes.</div>');
      return;
    }
    setHTML(list, recentActions.map((item) => `
      <div class="zavz-log-entry">
        <div class="zavz-log-head">
          <span class="zavz-log-pill info">A\u00c7\u00c3O</span>
          <span class="zavz-log-time">${escapeHtml(item.time)}</span>
        </div>
        <div class="zavz-log-message">${escapeHtml(item.title)}</div>
        ${item.detail ? `<div class="zavz-log-detail">${escapeHtml(item.detail)}</div>` : ''}
      </div>
    `).join(''));
  }

  function renderStatusHistory() {
    const list = root?.querySelector('#zavz-status-history');
    if (!list) return;
    if (!statusHistory.length) {
      setHTML(list, '<div class="zavz-empty">Sem indisponibilidades registradas.</div>');
      return;
    }
    setHTML(list, statusHistory.map((entry) => `
      <div class="zavz-log-entry">
        <div class="zavz-log-head">
          <span class="zavz-log-pill error">${escapeHtml(entry.label)}</span>
          <span class="zavz-log-time">${escapeHtml(new Date(entry.at).toLocaleString('pt-BR'))}</span>
        </div>
        <div class="zavz-log-message">${escapeHtml(entry.status)}</div>
      </div>
    `).join(''));
  }

  function onReady(fn){
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else fn();
  }

  function updateUIStatus(text, isFail){
    if (!root) return;

    if (!statusEl) {
      const card = root.querySelector('.zavz-card[data-card="login"]');
      if (card) {
        statusEl = document.createElement('div');
        statusEl.style.cssText =
          'margin-top:10px;font-size:12px;color:var(--muted);display:flex;justify-content:space-between;gap:10px;padding:9px 10px;border-radius:9px;background:rgba(15,24,39,.72);border:1px solid var(--line-2);';
          setHTML(statusEl, `<div data-status-left>status: idle</div><div data-status-right></div>`);
        card.appendChild(statusEl);
      }
    }
    if (!statusEl) return;

    const left = statusEl.querySelector('[data-status-left]');
    const right= statusEl.querySelector('[data-status-right]');
    const total = CONTAS[state.modo]?.senhas?.length || 0;

    if (text) {
      left.textContent = `status: ${text}`;
      left.style.color = isFail ? '#ff6b6b' : 'var(--text)';
    } else if (state.ativo) {
      left.textContent = `status: ${state.modo.toUpperCase()} ${Math.min(state.indice, total)}/${total}`;
      left.style.color = 'var(--text)';
    } else {
      left.textContent = settings.enabled ? 'status: idle' : 'status: disabled';
      left.style.color = 'var(--muted)';
    }

    right.textContent = deveMostrarBotoes() ? 'login page \u2713' : '';
  }

  function normalizeDomainList(raw) {
    return (raw || '')
      .split(/[\n,]+/)
      .map(normalizeDomain)
      .filter(Boolean);
  }

  function upsertProfile({ name, mode, domains }) {
    if (!name) return null;
    const trimmed = name.trim();
    if (!trimmed) return null;
    const list = Array.isArray(settings.profiles) ? settings.profiles : [];
    const existing = list.find((p) => p.name?.toLowerCase() === trimmed.toLowerCase());
    const profileData = {
      id: existing?.id || `profile-${Date.now()}`,
      name: trimmed,
      mode,
      domains
    };
    if (existing) {
      Object.assign(existing, profileData);
    } else {
      list.push(profileData);
    }
    settings.profiles = list;
    settings.activeProfileId = profileData.id;
    salvarSettings();
    return profileData;
  }

  function removeProfile(name) {
    if (!Array.isArray(settings.profiles)) return;
    const trimmed = (name || '').trim().toLowerCase();
    settings.profiles = settings.profiles.filter((p) => p.name?.toLowerCase() !== trimmed);
    if (settings.activeProfileId && !settings.profiles.find(p => p.id === settings.activeProfileId)) {
      settings.activeProfileId = null;
    }
    salvarSettings();
  }

  function getActiveProfile() {
    if (!Array.isArray(settings.profiles)) return null;
    return settings.profiles.find((p) => p.id === settings.activeProfileId) || null;
  }

  function applyProfile(profile) {
    if (!profile) return;
    settings.activeProfileId = profile.id;
    salvarSettings();
  }

  function getExportPayload() {
    return {
      version: 1,
      settings: {
        ...settings,
        profiles: settings.profiles || [],
        favoriteDomains: settings.favoriteDomains || [],
        shortcuts: settings.shortcuts || {}
      },
      successStats
    };
  }

  function applyImportPayload(payload) {
    if (!payload || typeof payload !== 'object') return false;
    if (payload.settings) {
      settings = Object.assign(settings, payload.settings);
      settings.theme = normalizeThemeSettings(settings.theme);
      settings.uiScale = normalizeUiScale(settings.uiScale);
      settings.uiScaleAuto = settings.uiScaleAuto !== false;
      settings.fabPos = normalizeFabPos(settings.fabPos);
    }
    if (payload.successStats) {
      successStats = payload.successStats;
      salvarSuccessStats();
    }
    salvarSettings();
    return true;
  }

  // ========= CLEAR CACHE (site atual) =========
  async function clearSiteData() {
    try { parar(true); } catch {}

    const ov = document.createElement('div');
    ov.id = 'zavz-clear-overlay';
    ov.style.cssText = `
      position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.9);
      display:flex;align-items:center;justify-content:center;color:white;
      font:800 18px system-ui;
    `;
    ov.textContent = 'Limpando dados do site...';
    document.documentElement.appendChild(ov);

    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}

    try {
      const cookieNames = document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(Boolean);
      const host = location.hostname;
      const parts = host.split('.');
      const apex = parts.length >= 2 ? parts.slice(-2).join('.') : host;

      const domains = [host, '.' + host, apex, '.' + apex];
      const paths = ['/', location.pathname];

      const segs = location.pathname.split('/').filter(Boolean);
      let p = '';
      for (const s of segs) { p += '/' + s; paths.push(p); }

      for (const name of cookieNames) {
        for (const d of domains) {
          for (const path of paths) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${d}`;
          }
        }
        for (const path of paths) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
        }
      }
    } catch {}

    try {
      if (indexedDB.databases) {
        const dbs = await indexedDB.databases();
        await Promise.all(
          dbs.map(db => new Promise(res => {
            const req = indexedDB.deleteDatabase(db.name);
            req.onsuccess = req.onerror = req.onblocked = () => res();
          }))
        );
      }
    } catch {}

    try {
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    } catch {}

    try {
      if (navigator.serviceWorker) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } catch {}

    ov.textContent = 'Dados limpos! Recarregando...';
    setTimeout(() => location.reload(), 600);
  }
  // ===========================================

  // ========= OMNI DOMAIN DETECTOR ===========
  async function detectarOmniDomain(ui) {
    if (omniBusy) return;
    omniBusy = true;

    const setUI = (msg, ok=false) => setDomainStatus(ui, msg, ok ? '#7CFF9B' : 'var(--muted)');

    try {
      if (!hostPermitida()) {
        setUI('Host não permitido.', false);
        omniBusy = false;
        return;
      }

      setUI('Buscando /omni/accounts/accounts.php ...');

      const origin = location.origin;
      const accountsUrl = new URL('/omni/accounts/accounts.php', origin).toString();

      const rAcc = await fetch(accountsUrl, { credentials: 'include' });
      if (!rAcc.ok) throw new Error('accounts.php não abriu (talvez não esteja logado).');

      const accHtml = await rAcc.text();
      const accDoc = new DOMParser().parseFromString(accHtml, 'text/html');

      // tenta achar o botão/link de configs.php dentro do accounts
      let cfgHref =
        accDoc.querySelector('a[href$="configs.php"]')?.getAttribute('href') ||
        accDoc.querySelector('a[href*="configs.php"]')?.getAttribute('href');

      // fallback: assume configs.php no mesmo dir de accounts.php
      const configsUrl = new URL(cfgHref || 'configs.php', accountsUrl).toString();

      setUI('Abrindo configs.php ...');

      const rCfg = await fetch(configsUrl, { credentials: 'include' });
      if (!rCfg.ok) throw new Error('configs.php não abriu.');

      const cfgHtml = await rCfg.text();
      const cfgDoc = new DOMParser().parseFromString(cfgHtml, 'text/html');

      let serverText = '';

      // 1) caminho "oficial": row-status-services
      const row = cfgDoc.querySelector('.row-status-services');
      if (row) {
        const bList = [...row.querySelectorAll('b')];
        const hit = bList.find(b => /https?:\/\//i.test(b.textContent || ''));
        if (hit) serverText = (hit.textContent || '').trim();
      }

      // 2) fallback regex full page
      if (!serverText) {
        const m = cfgHtml.match(/https?:\/\/[a-z0-9.-]+\.[a-z]{2,}(?::\d+)?/i);
        if (m) serverText = m[0];
      }

      if (!serverText) throw new Error('Não achei o domínio no configs.php.');

      // normaliza pra devolver só o domain (sem https)
      let domain = cleanDomain(serverText);

      settings.omniDomainLast = domain;
      salvarSettings();

      if (ui) {
        ui.lastDomain = domain;
        ui.lastIP = null;
      }

      if (ui.input) ui.input.value = domain;
      setUI('Dom\u00ednio encontrado \u2713', true);

    } catch (e) {
      setUI('Erro: ' + (e?.message || e), false);
    } finally {
      omniBusy = false;
    }
  }
  // ===========================================

  onReady(() => {
    if (document.getElementById(ID_ROOT) || document.getElementById(ID_BTN)) return;

    const css = `
    :root{
      --bg:#0e1014; --bg-2:#11141a; --bg-3:#151922; --bg-4:#0b0d12;
      --line:rgba(255,255,255,.06); --line-2:rgba(255,255,255,.04);
      --text:#e7e9ee; --muted:rgba(231,233,238,.62);
      --accent:#7a5cff; --accent-2:#8b75ff; --off:#2a2f3b;
    }
    #${ID_BTN}{
      position:fixed;left:50%;bottom:22px;transform:translateX(-50%);
      width:54px;height:54px;border-radius:12px;
      background:radial-gradient(120% 120% at 10% 10%, #8c7aff 0%, #6a5cff 45%, #4b3cff 100%);
      color:#fff;font:800 19px/1 system-ui;display:grid;place-items:center;cursor:pointer;user-select:none;
      z-index:2147483647;box-shadow:0 10px 28px rgba(0,0,0,.5), inset 0 0 0 1px rgba(255,255,255,.12);
      transition:transform .12s ease, filter .12s ease;
    }
    #${ID_BTN}:hover{transform:translateX(-50%) translateY(-2px);filter:brightness(1.06);}
    #${ID_BTN}:active{transform:translateX(-50%) translateY(0);}
    #${ID_ROOT}{
      position:fixed;inset:0;z-index:2147483646;display:none;background:rgba(0,0,0,.55);backdrop-filter:blur(2px);
    }
    #${ID_ROOT}.open{display:block;}
    #${ID_ROOT} *{box-sizing:border-box;}
    #${ID_ROOT} .zavz-window{
      position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      width:min(1120px,94vw);height:min(900px,95vh);max-height:95vh;background:var(--bg);color:var(--text);
      border-radius:12px;box-shadow:0 30px 90px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.04);
      display:grid;grid-template-columns:255px 1fr;overflow:hidden;font-family:system-ui;min-height:0;
    }
    #${ID_ROOT} .zavz-sidebar{background:var(--bg-4);border-right:1px solid var(--line);display:flex;flex-direction:column;padding:16px 12px;gap:12px;min-height:0;overflow:auto;}
    #${ID_ROOT} .zavz-brand{display:flex;align-items:center;gap:10px;padding:8px;}
    #${ID_ROOT} .zavz-logo{width:42px;height:42px;border-radius:10px;display:grid;place-items:center;background:radial-gradient(110% 110% at 20% 10%, #6fd3ff 0%, #3a8bff 45%, #285bff 100%);}
    #${ID_ROOT} .zavz-title{font-weight:800;letter-spacing:.6px;}
    #${ID_ROOT} .zavz-subtitle{font-size:12px;color:var(--muted);margin-top:2px;}
    #${ID_ROOT} .zavz-side-label{font-size:11px;letter-spacing:1.2px;color:var(--muted);padding:8px 10px 0;}
    #${ID_ROOT} .zavz-nav{display:grid;gap:6px;padding:6px;}
    #${ID_ROOT} .zavz-nav-item{display:flex;align-items:center;gap:10px;padding:10px;border-radius:9px;color:#cfd3dc;cursor:pointer;transition:background .12s ease,color .12s ease;}
    #${ID_ROOT} .zavz-nav-item .zavz-ico{width:16px;height:16px;color:#aeb3bf;display:inline-grid;place-items:center;}
    #${ID_ROOT} .zavz-nav-item .zavz-ico svg{width:16px;height:16px;}
    #${ID_ROOT} .zavz-nav-item.active{background:rgba(124,108,255,.12);color:#fff;box-shadow:inset 0 0 0 1px rgba(124,108,255,.55);}
    #${ID_ROOT} .zavz-nav-item:hover{background:rgba(255,255,255,.04);}
    #${ID_ROOT} .zavz-spacer{flex:1;}
    #${ID_ROOT} .zavz-profile{display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-2);border:1px solid var(--line);border-radius:10px;}
    #${ID_ROOT} .zavz-avatar{width:34px;height:34px;border-radius:50%;background:#1e2230;border:1px solid var(--line);}
    #${ID_ROOT} .zavz-profile .name{font-weight:600;}
    #${ID_ROOT} .zavz-profile small{color:var(--muted);}
    #${ID_ROOT} .zavz-content{display:grid;grid-template-rows:auto 1fr;background:var(--bg);min-height:0;}
    #${ID_ROOT} .zavz-topbar{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--line);background:#0f1217;}
    #${ID_ROOT} .zavz-topbar{cursor:move;}
    #${ID_ROOT} .zavz-topbar input{cursor:text;}
    #${ID_ROOT} .zavz-topbar button{cursor:pointer;}
    #${ID_ROOT} .chip{background:var(--bg-2);color:var(--text);border:1px solid var(--line);border-radius:8px;padding:7px 12px;height:34px;font-size:13px;display:inline-flex;align-items:center;white-space:nowrap;user-select:none;}
    #${ID_ROOT} .chip.link{cursor:pointer;}
    #${ID_ROOT} .chip.link:hover{border-color:rgba(124,108,255,.9);box-shadow:0 0 0 2px rgba(124,108,255,.10);}

    #${ID_ROOT} #zavz-site-chip{position:relative;padding-right:22px;}
    #${ID_ROOT} #zavz-site-chip::after{
      content:"";position:absolute;right:9px;top:50%;
      width:7px;height:7px;transform:translateY(-50%) rotate(-45deg);
      border-right:2px solid currentColor;border-bottom:2px solid currentColor;
      opacity:.55;pointer-events:none;
    }
    #${ID_ROOT} #zavz-site-chip:hover::after{opacity:.9;}

    #${ID_ROOT} input[type="text"]{background:var(--bg-2);color:var(--text);border:1px solid var(--line);border-radius:8px;padding:7px 10px;height:34px;outline:none;font-size:13px;}
    #${ID_ROOT} .zavz-search{margin-left:auto;width:240px;}
    #${ID_ROOT} .zavz-search:focus{border-color:rgba(124,108,255,.9);box-shadow:0 0 0 2px rgba(124,108,255,.12);}
    #${ID_ROOT} .zavz-close{width:34px;height:34px;border-radius:8px;display:grid;place-items:center;cursor:pointer;color:#b8bcc8;background:transparent;border:1px solid var(--line);font-size:18px;line-height:0;}
    #${ID_ROOT} .zavz-close:hover{background:rgba(255,255,255,.05);color:#fff;}
    #${ID_ROOT} .zavz-body{padding:14px;overflow:auto;min-height:0;scrollbar-width:thin;scrollbar-color:rgba(124,108,255,.85) rgba(255,255,255,.04);}
    #${ID_ROOT} .panel{display:none;}
    #${ID_ROOT} .panel.active{display:block;}
    #${ID_ROOT} .zavz-card{width:min(520px,100%);margin-top:6px;background:var(--bg-3);border:1px solid var(--line);border-radius:12px;padding:12px;}
    #${ID_ROOT} .zavz-card h4{margin:0 0 6px 0;font-size:11px;letter-spacing:1.2px;color:var(--muted);}
    #${ID_ROOT} .zavz-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;font-size:14px;border-top:1px solid var(--line-2);}
    #${ID_ROOT} .zavz-row:first-of-type{border-top:none;}
    #${ID_ROOT} .zavz-label{font-weight:600;}
    #${ID_ROOT} .zavz-dots{color:var(--muted);letter-spacing:2px;margin-right:6px;font-weight:700;user-select:none;}
    #${ID_ROOT} .zavz-switch{position:relative;width:46px;height:24px;}
    #${ID_ROOT} .zavz-switch input{display:none;}
    #${ID_ROOT} .zavz-track{position:absolute;inset:0;border-radius:999px;background:var(--off);border:1px solid var(--line);transition:.15s ease;}
    #${ID_ROOT} .zavz-thumb{position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#cfd3dc;transition:.15s ease;box-shadow:0 2px 6px rgba(0,0,0,.6);}
    #${ID_ROOT} .zavz-switch input:checked + .zavz-track{background:var(--accent);border-color:rgba(124,108,255,.9);}
    #${ID_ROOT} .zavz-switch input:checked + .zavz-track .zavz-thumb{left:24px;background:#fff;}
    #${ID_ROOT} .zavz-slider-wrap{display:flex;align-items:center;gap:10px;width:72%;}
    #${ID_ROOT} .zavz-slider{-webkit-appearance:none;appearance:none;width:100%;height:4px;border-radius:999px;background:linear-gradient(90deg,var(--accent) 0%,var(--accent) 36%,#d9dbe1 36%,#d9dbe1 100%);outline:none;}
    #${ID_ROOT} .zavz-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;background:var(--accent-2);border:2px solid #e8e9ee;box-shadow:0 2px 8px rgba(0,0,0,.6);cursor:pointer;margin-top:-5px;}
    #${ID_ROOT} .zavz-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:var(--accent-2);border:2px solid #e8e9ee;box-shadow:0 2px 8px rgba(0,0,0,.6);cursor:pointer;}
    #${ID_ROOT} .zavz-pill{font-size:12px;color:#e6e7ec;padding:3px 7px;border-radius:6px;background:#0f1217;border:1px solid var(--line);min-width:58px;text-align:center;}
    #${ID_ROOT} .zavz-empty{color:var(--muted);font-size:13px;padding-top:8px;}
    #${ID_ROOT} .placeholder{width:min(520px,100%);padding:14px;background:var(--bg-3);border:1px solid var(--line);border-radius:12px;color:var(--muted);font-size:14px;}
    #${ID_ROOT} .placeholder .title{color:var(--text);font-weight:700;margin-bottom:6px;letter-spacing:.4px;}

    #${ID_ROOT} .zavz-btn{
      background:var(--bg-2); color:var(--text);
      border:1px solid var(--line); border-radius:8px;
      padding:7px 12px; height:32px; font-size:12px; font-weight:800;
      cursor:pointer; transition:.12s ease; letter-spacing:.4px;
    }
    #${ID_ROOT} .zavz-btn:hover{filter:brightness(1.1);}
    #${ID_ROOT} .zavz-btn-danger{
      background:#d32f2f; border-color:rgba(255,255,255,.14);
      box-shadow:0 6px 16px rgba(0,0,0,.6);
    }
    #${ID_ROOT} .zavz-btn-accent{
      background:rgba(124,108,255,.18);
      border-color:rgba(124,108,255,.55);
    }
    #${ID_ROOT} .zavz-input{
      width:100%; height:30px; font-size:12px;
    }
    #${ID_ROOT} .zavz-log-viewer{
      background:linear-gradient(135deg, rgba(22,26,34,.9), rgba(18,21,28,.9));
      border:1px solid var(--line);
      border-radius:10px;
      padding:12px;
      font-size:12px;
      color:var(--text);
      max-height:320px;
      overflow:auto;
      scrollbar-width:thin;
      scrollbar-color:rgba(124,108,255,.85) rgba(255,255,255,.04);
      white-space:pre-wrap;
      line-height:1.5;
      box-shadow:0 10px 30px rgba(0,0,0,.35);
    }
    #${ID_ROOT} .zavz-sidebar{scrollbar-width:thin;scrollbar-color:rgba(124,108,255,.85) rgba(255,255,255,.04);}
    #${ID_ROOT} ::-webkit-scrollbar{width:9px;height:9px;}
    #${ID_ROOT} ::-webkit-scrollbar-thumb{background:linear-gradient(180deg, rgba(124,108,255,.9), rgba(95,80,210,.85));border-radius:10px;border:2px solid rgba(0,0,0,.25);}
    #${ID_ROOT} ::-webkit-scrollbar-track{background:rgba(255,255,255,.04);border-radius:10px;}
    #${ID_ROOT} .zavz-log-entry{border-bottom:1px solid var(--line-2);padding:8px 0;}
    #${ID_ROOT} .zavz-log-entry:last-child{border-bottom:none;}
    #${ID_ROOT} .zavz-log-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;}
    #${ID_ROOT} .zavz-log-pill{padding:2px 8px;border-radius:999px;font-weight:800;font-size:11px;letter-spacing:.3px;}
    #${ID_ROOT} .zavz-log-pill.info{background:rgba(124,108,255,.15);color:#cfd2ff;border:1px solid rgba(124,108,255,.4);}
    #${ID_ROOT} .zavz-log-pill.warn{background:rgba(255,193,7,.15);color:#ffdd87;border:1px solid rgba(255,193,7,.35);}
    #${ID_ROOT} .zavz-log-pill.error{background:rgba(211,47,47,.18);color:#ffc0c0;border:1px solid rgba(211,47,47,.35);}
    #${ID_ROOT} .zavz-log-pill.cmd{background:rgba(76,175,80,.16);color:#c0ffc8;border:1px solid rgba(76,175,80,.4);}
    #${ID_ROOT} .zavz-log-time{color:var(--muted);font-size:11px;}
    #${ID_ROOT} .zavz-log-message{font-weight:700;}
    #${ID_ROOT} .zavz-log-detail{color:var(--muted);margin-top:4px;font-family:ui-monospace, SFMono-Regular, SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;word-break:break-word;}
    #${ID_ROOT} .zavz-note{font-size:12px;color:var(--muted);margin:-6px 0 10px;line-height:1.5;word-break:break-word;}
    #${ID_ROOT} .zavz-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;}
    #${ID_ROOT} .zavz-mini-card{background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:8px;}
    #${ID_ROOT} .zavz-mini-title{font-weight:700;font-size:13px;display:flex;align-items:center;gap:6px;}
    #${ID_ROOT} .zavz-mini-desc{font-size:12px;color:var(--muted);line-height:1.4;}
    #${ID_ROOT} .zavz-inline{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
    #${ID_ROOT} .zavz-hint{font-size:12px;color:var(--muted);line-height:1.4;}
    #${ID_ROOT} .zavz-preview{font-size:12px;color:#cbd0ff;background:rgba(124,108,255,.12);border:1px dashed rgba(124,108,255,.45);padding:8px 10px;border-radius:8px;line-height:1.4;word-break:break-all;}
    #${ID_ROOT} .zavz-mini-actions{display:flex;flex-wrap:wrap;gap:6px;align-items:center;}
    #${ID_ROOT} .zavz-profile-list{display:flex;flex-wrap:wrap;gap:6px;padding:6px 0 0;}
    #${ID_ROOT} .zavz-profile-chip{
      display:flex;align-items:center;gap:8px;max-width:100%;
      border:1px solid var(--line-2);
      background:linear-gradient(180deg,var(--bg-3) 0%, var(--bg-2) 100%);
      color:var(--text);
      border-radius:999px;
      padding:6px 10px;
      height:30px;
      cursor:pointer;
      user-select:none;
    }
    #${ID_ROOT} .zavz-profile-chip .title{font-weight:900;font-size:11px;letter-spacing:.6px;text-transform:uppercase;}
    #${ID_ROOT} .zavz-profile-chip .meta{font-size:10px;color:var(--muted);border-left:1px solid var(--line-2);padding-left:8px;}
    #${ID_ROOT} .zavz-profile-chip:hover{border-color:var(--accent-a55);box-shadow:0 0 0 2px var(--accent-a12);}
    #${ID_ROOT} .zavz-profile-chip.domain{border-color:var(--accent-a55);}
    #${ID_ROOT} .zavz-profile-chip.active{
      border-color:var(--accent-a75);
      box-shadow:0 0 0 2px var(--accent-a12);
      background:linear-gradient(180deg,var(--accent-a18),var(--accent-a12));
    }
    #${ID_ROOT} .zavz-btn-ghost{background:rgba(255,255,255,.05);border-color:var(--line-2);color:var(--muted);height:28px;padding:6px 9px;font-weight:700;font-size:11px;}
    #${ID_ROOT} .zavz-btn-ghost:hover{color:#fff;border-color:rgba(124,108,255,.8);}

    :root{
      --bg:#070b14;
      --bg-2:#0c1320;
      --bg-3:#101a29;
      --bg-4:#0a101a;
      --line:rgba(130,160,220,.22);
      --line-2:rgba(130,160,220,.12);
      --text:#e8f0ff;
      --muted:#8d9bb8;
      --accent:#4f7dff;
      --accent-2:#8cabff;
      --off:#253247;
    }
    #${ID_BTN}{
      left:50%;
      top:50%;
      bottom:auto;
      transform:translate(-50%,-50%);
      width:34px;
      height:34px;
      border-radius:12px;
      background:linear-gradient(140deg,#12253f 0%,#1f3e70 48%,#4f7dff 100%);
      box-shadow:0 10px 26px rgba(0,0,0,.48), inset 0 0 0 1px rgba(255,255,255,.14);
      font:800 12px/1 'Trebuchet MS', Tahoma, sans-serif;
      letter-spacing:.6px;
      cursor:grab;
      touch-action:none;
    }
    #${ID_BTN}:hover{transform:translate(-50%,-50%) translateY(-2px);}
    #${ID_BTN}:active{transform:translate(-50%,-50%) translateY(0);cursor:grabbing;}

    #${ID_BTN}.pinned{transform:none;}
    #${ID_BTN}.pinned:hover{transform:translateY(-2px);}
    #${ID_BTN}.pinned:active{transform:translateY(0);cursor:grabbing;}
    #${ID_BTN}.dragging{transition:none;cursor:grabbing;}

    #${ID_ROOT}{
      background:
        radial-gradient(900px 460px at 8% 8%, rgba(58,95,180,.23), transparent 62%),
        radial-gradient(780px 420px at 90% 92%, rgba(36,71,138,.22), transparent 60%),
        rgba(3,7,13,.78);
      backdrop-filter:blur(5px);
    }
    #${ID_ROOT} .zavz-window{
      width:min(1240px,95vw);
      height:min(790px,94vh);
      border-radius:16px;
      border:1px solid var(--line);
      box-shadow:0 34px 100px rgba(0,0,0,.62), inset 0 1px 0 rgba(255,255,255,.05);
      background:linear-gradient(180deg,rgba(13,20,33,.98) 0%,rgba(8,13,23,.98) 100%);
      grid-template-columns:220px 1fr;
      font-family:'Trebuchet MS', Verdana, Tahoma, sans-serif;
    }
    #${ID_ROOT}.open .zavz-window{animation:zavzWindowIn .22s ease;}
    @keyframes zavzWindowIn{
      from{opacity:0;filter:blur(2px);}
      to{opacity:1;filter:blur(0);}
    }

    #${ID_ROOT} .zavz-sidebar{
      background:linear-gradient(180deg,#0f1723 0%,#0b111b 100%);
      border-right:1px solid var(--line-2);
      padding:14px 10px 12px;
      gap:10px;
    }
    #${ID_ROOT} .zavz-brand{
      margin-bottom:4px;
      padding:8px 10px;
      border:1px solid var(--line-2);
      border-radius:12px;
      background:rgba(255,255,255,.02);
    }
    #${ID_ROOT} .zavz-logo{
      width:32px;
      height:32px;
      border-radius:8px;
      background:linear-gradient(165deg,#0f223f 0%,#153760 56%,#3c75ff 100%);
      color:#cfe0ff;
      font-size:14px;
      font-weight:900;
      letter-spacing:.7px;
    }
    #${ID_ROOT} .zavz-title{
      font-size:24px;
      line-height:1;
      font-weight:800;
      letter-spacing:.2px;
    }
    #${ID_ROOT} .zavz-subtitle{
      margin-top:4px;
      font-size:11px;
      text-transform:uppercase;
      letter-spacing:.75px;
      color:#6f7f9c;
    }
    #${ID_ROOT} .zavz-side-label{
      padding:6px 12px 2px;
      color:#61708d;
      font-size:10px;
      letter-spacing:1.25px;
      text-transform:uppercase;
    }
    #${ID_ROOT} .zavz-nav{
      gap:5px;
      padding:0 4px 4px;
    }
    #${ID_ROOT} .zavz-nav-item{
      height:38px;
      border-radius:9px;
      padding:0 10px;
      border:1px solid transparent;
      color:#becde9;
      background:transparent;
    }
    #${ID_ROOT} .zavz-nav-item .zavz-ico{color:#7087b4;}
    #${ID_ROOT} .zavz-nav-item.active{
      background:linear-gradient(180deg,rgba(78,123,236,.2),rgba(55,92,184,.2));
      border-color:rgba(88,127,224,.55);
      color:#edf3ff;
      box-shadow:none;
    }
    #${ID_ROOT} .zavz-nav-item:hover{
      border-color:rgba(96,121,172,.35);
      background:rgba(255,255,255,.03);
    }

    #${ID_ROOT} .zavz-profile{
      margin-top:6px;
      border:1px solid var(--line-2);
      background:rgba(255,255,255,.02);
      border-radius:12px;
      padding:9px;
      gap:8px;
    }
    #${ID_ROOT} .zavz-avatar{
      width:30px;
      height:30px;
      border-radius:50%;
      background:radial-gradient(circle at 30% 25%,#2b2f3a 0%,#0b0d12 52%,#000000 100%);
      border-color:rgba(255,255,255,.14);
    }
    #${ID_ROOT} .zavz-profile .name{
      font-size:14px;
      font-weight:700;
    }
    #${ID_ROOT} .zavz-profile small{
      color:#7f8eaa;
      font-size:11px;
    }

    #${ID_ROOT} .zavz-content{
      background:
        linear-gradient(180deg,rgba(13,20,33,.9) 0%,rgba(8,13,23,.96) 100%),
        linear-gradient(90deg,rgba(92,126,198,.08) 0%,transparent 26%);
    }
    #${ID_ROOT} .zavz-topbar{
      padding:12px 14px;
      gap:10px;
      border-bottom:1px solid var(--line-2);
      background:linear-gradient(180deg,rgba(13,20,32,.95),rgba(9,14,24,.95));
    }
    #${ID_ROOT} .zavz-lock{
      width:22px;
      height:22px;
      display:grid;
      place-items:center;
      color:#9fb4df;
      opacity:.9;
      flex:0 0 auto;
    }
    #${ID_ROOT} .zavz-lock svg{width:15px;height:15px;}

    #${ID_ROOT} .chip{
      height:34px;
      border-radius:9px;
      padding:7px 12px;
      border:1px solid var(--line-2);
      background:linear-gradient(180deg,#121d2f,#0d1727);
      color:#dce8ff;
      font-size:13px;
      font-weight:600;
    }
    #${ID_ROOT} .chip.link:hover{
      border-color:rgba(86,124,220,.8);
      box-shadow:none;
    }
    #${ID_ROOT} .chip.dropdown{
      position:relative;
      padding-right:22px;
    }
    #${ID_ROOT} .chip.dropdown::after{
      content:"";
      position:absolute;
      right:9px;
      top:50%;
      width:6px;
      height:6px;
      transform:translateY(-65%) rotate(45deg);
      border-right:1.6px solid currentColor;
      border-bottom:1.6px solid currentColor;
      opacity:.7;
      pointer-events:none;
    }

    #${ID_ROOT} input[type="text"],
    #${ID_ROOT} textarea,
    #${ID_ROOT} select{
      background:linear-gradient(180deg,#121d2f,#0f1a2b);
      color:var(--text);
      border:1px solid var(--line-2);
      border-radius:8px;
      padding:7px 10px;
      outline:none;
      font-size:13px;
      transition:border-color .15s ease, box-shadow .15s ease;
    }
    #${ID_ROOT} input[type="text"]:focus,
    #${ID_ROOT} textarea:focus,
    #${ID_ROOT} select:focus{
      border-color:rgba(84,121,217,.85);
      box-shadow:0 0 0 2px rgba(84,121,217,.15);
    }
    #${ID_ROOT} .zavz-search{
      margin-left:auto;
      width:42px;
      padding-left:34px;
      color:transparent;
      cursor:pointer;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238b9ab8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cline x1='16.65' y1='16.65' x2='21' y2='21'/%3E%3C/svg%3E");
      background-repeat:no-repeat;
      background-size:14px;
      background-position:12px center;
      transition:width .2s ease,color .2s ease,border-color .2s ease,box-shadow .2s ease;
    }
    #${ID_ROOT} .zavz-search::placeholder{color:transparent;}
    #${ID_ROOT} .zavz-search:focus,
    #${ID_ROOT} .zavz-search:not(:placeholder-shown){
      width:240px;
      color:var(--text);
      cursor:text;
    }
    #${ID_ROOT} .zavz-search:focus{
      border-color:rgba(84,121,217,.85);
      box-shadow:0 0 0 2px rgba(84,121,217,.15);
    }
    #${ID_ROOT} .zavz-search:focus::placeholder{color:var(--muted);}
    #${ID_ROOT} .zavz-close{
      width:32px;
      height:32px;
      border-radius:8px;
      border:1px solid var(--line-2);
      background:linear-gradient(180deg,#121d2f,#0f1827);
      color:#c7d8f7;
      font-size:16px;
      line-height:1;
    }
    #${ID_ROOT} .zavz-close:hover{
      border-color:rgba(214,87,100,.58);
      background:linear-gradient(180deg,#241824,#1a121d);
      color:#ffe8ec;
    }

    #${ID_ROOT} .zavz-body{
      padding:14px;
      background:
        linear-gradient(180deg,rgba(255,255,255,.01),rgba(255,255,255,0)),
        repeating-linear-gradient(0deg, rgba(148,174,230,.035) 0px, rgba(148,174,230,.035) 1px, transparent 1px, transparent 36px);
    }
    #${ID_ROOT} .panel.active{
      display:grid;
      gap:12px;
      align-content:start;
    }
    #${ID_ROOT} .panel[data-panel-id="main"].active{
      grid-template-columns:repeat(2,minmax(0,1fr));
    }
    #${ID_ROOT} .panel[data-panel-id="main"].active .zavz-card[data-card="login"]{grid-column:1;grid-row:1;}
    #${ID_ROOT} .panel[data-panel-id="main"].active .zavz-card[data-card="cert-validator"]{grid-column:2;grid-row:1;}
    #${ID_ROOT} .panel[data-panel-id="main"].active .zavz-card[data-card="access"]{grid-column:1;grid-row:2;}
    #${ID_ROOT} .panel[data-panel-id="main"].active .zavz-card[data-card="recent-actions"]{grid-column:2;grid-row:2;}
    #${ID_ROOT} .panel[data-panel-id="misc"].active,
    #${ID_ROOT} .panel[data-panel-id="status"].active,
    #${ID_ROOT} .panel[data-panel-id="legit"].active{
      grid-template-columns:repeat(auto-fit,minmax(320px,1fr));
    }

    #${ID_ROOT} .zavz-card{
      width:100%;
      margin-top:0;
      border-radius:12px;
      padding:12px 14px;
      border:1px solid var(--line-2);
      background:linear-gradient(180deg,rgba(16,25,40,.96),rgba(11,18,30,.96));
      box-shadow:inset 0 1px 0 rgba(255,255,255,.03);
    }
    #${ID_ROOT}.open .panel.active .zavz-card{animation:zavzCardIn .22s ease both;}
    #${ID_ROOT}.open .panel.active .zavz-card:nth-child(2){animation-delay:.03s;}
    #${ID_ROOT}.open .panel.active .zavz-card:nth-child(3){animation-delay:.06s;}
    #${ID_ROOT}.open .panel.active .zavz-card:nth-child(4){animation-delay:.09s;}
    @keyframes zavzCardIn{
      from{opacity:0;transform:translateY(7px);}
      to{opacity:1;transform:translateY(0);}
    }

    #${ID_ROOT} .zavz-card h4{
      margin:0 0 6px;
      font-size:11px;
      letter-spacing:1.15px;
      color:#6f809e;
      text-transform:uppercase;
      font-weight:700;
    }
    #${ID_ROOT} .zavz-row{
      gap:10px;
      min-height:42px;
      padding:10px 0;
      border-top:1px solid var(--line-2);
      font-size:14px;
    }
    #${ID_ROOT} .zavz-label{
      color:#dde9ff;
      font-weight:600;
      letter-spacing:.15px;
    }
    #${ID_ROOT} .zavz-dots{
      color:#6f83ab;
      letter-spacing:2px;
      margin-right:5px;
    }
    #${ID_ROOT} .zavz-note,
    #${ID_ROOT} .zavz-hint{
      color:#8fa2c6;
      line-height:1.45;
      font-size:12px;
    }
    #${ID_ROOT} .zavz-note{
      margin:-2px 0 8px;
    }

    #${ID_ROOT} .zavz-switch{
      width:46px;
      height:24px;
      flex:0 0 auto;
    }
    #${ID_ROOT} .zavz-switch input{
      position:absolute;
      opacity:0;
      width:0;
      height:0;
    }
    #${ID_ROOT} .zavz-track{
      background:linear-gradient(180deg,#2a3953,#1f2c42);
      border:1px solid rgba(114,138,188,.35);
    }
    #${ID_ROOT} .zavz-thumb{
      top:3px;
      left:3px;
      width:16px;
      height:16px;
      background:#9dadc9;
      border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,.45);
    }
    #${ID_ROOT} .zavz-switch input:checked + .zavz-track{
      border-color:rgba(86,126,226,.78);
      background:linear-gradient(180deg,rgba(84,124,224,.88),rgba(67,106,206,.82));
    }
    #${ID_ROOT} .zavz-switch input:checked + .zavz-track .zavz-thumb{
      left:25px;
      background:#f4f8ff;
    }

    #${ID_ROOT} .zavz-slider-wrap{
      width:min(78%,330px);
      min-width:170px;
    }
    #${ID_ROOT} .zavz-slider{
      height:4px;
      background:linear-gradient(90deg,var(--accent) 0%,var(--accent) 36%,#2b3b55 36%,#2b3b55 100%);
    }
    #${ID_ROOT} .zavz-slider::-webkit-slider-thumb{
      width:14px;
      height:14px;
      border:2px solid #d9e6ff;
      background:#f2f7ff;
      margin-top:-5px;
    }
    #${ID_ROOT} .zavz-slider::-moz-range-thumb{
      width:14px;
      height:14px;
      border:2px solid #d9e6ff;
      background:#f2f7ff;
    }
    #${ID_ROOT} .zavz-pill{
      min-width:62px;
      font-size:11px;
      color:#d2e0ff;
      border:1px solid var(--line-2);
      background:linear-gradient(180deg,#121d30,#0d1727);
    }

    #${ID_ROOT} .zavz-btn{
      height:30px;
      border-radius:8px;
      border:1px solid var(--line-2);
      background:linear-gradient(180deg,#162238,#111d31);
      color:#dce9ff;
      font-size:11px;
      letter-spacing:.55px;
      font-weight:800;
    }
    #${ID_ROOT} .zavz-btn:hover{
      filter:none;
      border-color:rgba(86,125,221,.72);
      box-shadow:0 0 0 2px rgba(77,115,212,.14);
    }
    #${ID_ROOT} .zavz-btn-danger{
      background:linear-gradient(180deg,#5b232c,#42171f);
      border-color:rgba(226,108,124,.48);
      color:#ffd8de;
      box-shadow:none;
    }
    #${ID_ROOT} .zavz-btn-accent{
      background:linear-gradient(180deg,rgba(79,124,222,.45),rgba(60,100,193,.42));
      border-color:rgba(90,130,228,.75);
    }
    #${ID_ROOT} .zavz-btn-ghost{
      background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.03));
      border-color:var(--line-2);
      color:#98acd3;
      height:28px;
    }
    #${ID_ROOT} .zavz-btn-ghost:hover{
      border-color:rgba(100,140,235,.7);
      color:#deebff;
    }

    #${ID_ROOT} .zavz-theme-lab{
      margin-top:10px;
      padding:12px;
      border-radius:12px;
      border:1px solid var(--line-2);
      background:linear-gradient(180deg,rgba(8,13,22,.86),rgba(9,14,24,.9));
      display:grid;
      gap:12px;
      --theme-preview-accent:var(--accent);
      --theme-preview-accent-2:var(--accent-2);
      --theme-preview-shadow:0 8px 26px rgba(0,0,0,.45);
    }
    #${ID_ROOT} .zavz-theme-title{
      font-size:24px;
      line-height:1.1;
      font-weight:800;
      color:#eef4ff;
    }
    #${ID_ROOT} .zavz-theme-subtitle{
      margin-top:-6px;
      color:#95a9cf;
      font-size:12px;
      line-height:1.4;
    }
    #${ID_ROOT} .zavz-theme-block{display:grid;gap:8px;}
    #${ID_ROOT} .zavz-theme-block-title{
      color:#7f93b8;
      font-size:12px;
      text-transform:uppercase;
      letter-spacing:1px;
      font-weight:700;
    }
    #${ID_ROOT} .zavz-theme-presets{
      display:grid;
      grid-template-columns:repeat(5,minmax(0,1fr));
      gap:8px;
    }
    #${ID_ROOT} .zavz-theme-preset{
      height:42px;
      border:none;
      border-radius:10px;
      background:var(--theme-swatch);
      cursor:pointer;
      position:relative;
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.16);
      transition:transform .12s ease, box-shadow .12s ease;
    }
    #${ID_ROOT} .zavz-theme-preset:hover{transform:translateY(-1px);}
    #${ID_ROOT} .zavz-theme-preset.active{
      box-shadow:0 0 0 2px rgba(255,255,255,.95), 0 0 0 5px rgba(125,90,255,.5);
    }
    #${ID_ROOT} .zavz-theme-preset.active::after{
      content:"\u2713";
      position:absolute;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      color:#fff;
      font-weight:800;
      text-shadow:0 1px 5px rgba(0,0,0,.5);
    }
    #${ID_ROOT} .zavz-theme-grid{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:10px;
    }
    #${ID_ROOT} .zavz-theme-custom,
    #${ID_ROOT} .zavz-theme-preview{
      border:1px solid var(--line-2);
      border-radius:10px;
      padding:10px;
      background:linear-gradient(180deg,rgba(18,26,40,.84),rgba(12,18,30,.88));
      display:grid;
      gap:10px;
      align-content:start;
      min-height:132px;
    }
    #${ID_ROOT} .zavz-theme-hue{
      appearance:none;
      width:100%;
      height:28px;
      border-radius:8px;
      border:1px solid rgba(255,255,255,.08);
      background:linear-gradient(90deg,#ff4b4b,#ffa500,#ffee00,#38d16a,#19b7d9,#3a69ff,#c500ff,#ff4b4b);
      cursor:pointer;
    }
    #${ID_ROOT} .zavz-theme-hue::-webkit-slider-thumb{
      appearance:none;
      width:18px;
      height:18px;
      border-radius:50%;
      background:#fff;
      border:2px solid rgba(0,0,0,.35);
      box-shadow:0 2px 8px rgba(0,0,0,.45);
    }
    #${ID_ROOT} .zavz-theme-hue::-moz-range-thumb{
      width:18px;
      height:18px;
      border-radius:50%;
      background:#fff;
      border:2px solid rgba(0,0,0,.35);
      box-shadow:0 2px 8px rgba(0,0,0,.45);
    }
    #${ID_ROOT} .zavz-theme-custom-row{
      display:grid;
      grid-template-columns:auto 1fr auto;
      gap:8px;
      align-items:center;
    }
    #${ID_ROOT} .zavz-theme-custom-row.zavz-theme-custom-row-secondary{
      grid-template-columns:1fr auto;
    }
    #${ID_ROOT} .zavz-theme-effects{
      display:flex;
      flex-wrap:wrap;
      gap:6px;
    }
    #${ID_ROOT} .zavz-theme-fx{
      height:28px;
      padding:6px 10px;
      font-weight:800;
      letter-spacing:.5px;
    }
    #${ID_ROOT} .zavz-theme-fx.active{
      border-color:var(--accent-a75);
      color:var(--text);
      box-shadow:0 0 0 2px var(--accent-a12);
      background:linear-gradient(180deg,var(--accent-a18),var(--accent-a12));
    }
    #${ID_ROOT} .zavz-theme-color{
      width:34px;
      height:30px;
      padding:0;
      border-radius:8px;
      border:1px solid var(--line-2);
      background:transparent;
      cursor:pointer;
      overflow:hidden;
    }
    #${ID_ROOT} .zavz-theme-color::-webkit-color-swatch-wrapper{padding:0;}
    #${ID_ROOT} .zavz-theme-color::-webkit-color-swatch{border:none;border-radius:7px;}
    #${ID_ROOT} .zavz-theme-color::-moz-color-swatch{border:none;border-radius:7px;}
    #${ID_ROOT} .zavz-theme-secondary{
      display:none;
      gap:8px;
    }
    #${ID_ROOT}[data-accent-style="two"] .zavz-theme-secondary,
    #${ID_ROOT}[data-accent-style="fade"] .zavz-theme-secondary{
      display:grid;
    }
    #${ID_ROOT} .zavz-theme-palette{
      display:grid;
      gap:8px;
      margin-top:2px;
    }
    #${ID_ROOT} .zavz-theme-palette-row{
      display:flex;
      align-items:center;
      gap:8px;
      flex-wrap:wrap;
    }
    #${ID_ROOT} .zavz-theme-swatches{
      display:flex;
      align-items:center;
      gap:6px;
      flex-wrap:wrap;
    }
    #${ID_ROOT} .zavz-theme-swatch{
      width:26px;
      height:26px;
      border-radius:8px;
      border:1px solid var(--line-2);
      background:var(--swatch);
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);
      cursor:pointer;
      transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease;
    }
    #${ID_ROOT} .zavz-theme-swatch:hover{
      transform:translateY(-1px);
      border-color:var(--accent-a55);
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.14), 0 0 0 2px var(--accent-a12);
    }
    #${ID_ROOT} #zavz-theme-custom.active{
      border-color:rgba(165,123,255,.9);
      box-shadow:0 0 0 2px rgba(150,112,255,.22);
    }
    #${ID_ROOT} #zavz-theme-hex{
      font-family:ui-monospace,SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace;
      letter-spacing:.4px;
      text-transform:uppercase;
    }
    #${ID_ROOT} .zavz-theme-preview-btn{
      border:none;
      height:32px;
      border-radius:8px;
      color:#fff;
      font-weight:800;
      letter-spacing:.2px;
      background:var(--accent-grad, linear-gradient(180deg,var(--theme-preview-accent),var(--theme-preview-accent-2,#5f3fd4)));
      box-shadow:var(--theme-preview-shadow);
    }
    #${ID_ROOT} .zavz-theme-preview-slider{
      height:10px;
      border-radius:999px;
      background:rgba(255,255,255,.1);
      overflow:hidden;
      width:66%;
      margin:auto;
    }
    #${ID_ROOT} .zavz-theme-preview-slider .fill{
      height:100%;
      width:58%;
      border-radius:999px;
      background:var(--accent-grad, linear-gradient(90deg,var(--theme-preview-accent),var(--theme-preview-accent-2,#5f3fd4)));
    }
    #${ID_ROOT} .zavz-theme-footer{
      border-top:1px solid var(--line-2);
      padding-top:10px;
      display:grid;
      gap:10px;
    }
    #${ID_ROOT} .zavz-theme-glow{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
    }
    #${ID_ROOT} .zavz-theme-lab.no-glow .zavz-theme-preview-btn{box-shadow:none;}
    #${ID_ROOT} .zavz-theme-lab.no-glow .zavz-card,
    #${ID_ROOT} .zavz-theme-lab.no-glow .zavz-btn{box-shadow:none;}

    #${ID_ROOT} .zavz-input{
      width:100%;
      min-height:30px;
      font-size:12px;
    }
    #${ID_ROOT} textarea.zavz-input{min-height:86px;resize:vertical;}
    #${ID_ROOT} select.zavz-input{
      appearance:none;
      background-image:linear-gradient(45deg,transparent 50%,#88a0cd 50%),linear-gradient(135deg,#88a0cd 50%,transparent 50%);
      background-position:calc(100% - 16px) 52%,calc(100% - 11px) 52%;
      background-size:5px 5px,5px 5px;
      background-repeat:no-repeat;
      padding-right:30px;
    }
    #${ID_ROOT} select.zavz-input option{
      background:var(--bg-2);
      color:var(--text);
    }

    #${ID_ROOT} .zavz-log-viewer{
      max-height:300px;
      border-radius:10px;
      border:1px solid var(--line-2);
      background:linear-gradient(180deg,rgba(12,20,34,.9),rgba(10,17,29,.92));
      box-shadow:none;
    }
    #${ID_ROOT} .zavz-log-entry{border-bottom:1px solid var(--line-2);}
    #${ID_ROOT} .zavz-log-time{color:#8ea2c8;}
    #${ID_ROOT} .zavz-log-message{color:#dfe9ff;}
    #${ID_ROOT} .zavz-log-detail{color:#9cb0d6;}
    #${ID_ROOT} .zavz-preview{
      color:#cfe0ff;
      background:rgba(75,112,200,.14);
      border:1px dashed rgba(100,140,230,.46);
    }
    #${ID_ROOT} .zavz-grid{
      gap:10px;
      grid-template-columns:repeat(auto-fit,minmax(270px,1fr));
    }
    #${ID_ROOT} .zavz-mini-card{
      border:1px solid var(--line-2);
      border-radius:10px;
      background:linear-gradient(180deg,rgba(17,26,41,.86),rgba(12,20,34,.86));
    }
    #${ID_ROOT} .zavz-mini-title{color:#dbe7ff;}
    #${ID_ROOT} .zavz-empty{color:#87a0ca;}

    #${ID_ROOT} .zavz-sidebar{
      scrollbar-color:rgba(87,124,216,.85) rgba(255,255,255,.03);
    }
    #${ID_ROOT} ::-webkit-scrollbar{width:8px;height:8px;}
    #${ID_ROOT} ::-webkit-scrollbar-thumb{
      border-radius:10px;
      background:linear-gradient(180deg,rgba(83,119,211,.92),rgba(67,98,180,.88));
      border:2px solid rgba(0,0,0,.22);
    }
    #${ID_ROOT} ::-webkit-scrollbar-track{background:rgba(255,255,255,.03);}

    @media (max-width: 1080px){
      #${ID_ROOT} .zavz-window{
        width:min(990px,96vw);
        height:min(920px,95vh);
        grid-template-columns:1fr;
      }
      #${ID_ROOT} .zavz-sidebar{
        border-right:none;
        border-bottom:1px solid var(--line-2);
        max-height:220px;
      }
      #${ID_ROOT} .zavz-nav{
        grid-template-columns:repeat(3,minmax(0,1fr));
      }
      #${ID_ROOT} .zavz-spacer,
      #${ID_ROOT} .zavz-profile{
        display:none;
      }
      #${ID_ROOT} .panel[data-panel-id="main"].active{
        grid-template-columns:1fr;
      }
      #${ID_ROOT} .panel[data-panel-id="main"].active .zavz-card{grid-column:auto;grid-row:auto;}
    }
    @media (max-width: 700px){
      #${ID_BTN}{
        width:32px;
        height:32px;
        font-size:11px;
      }
      #${ID_ROOT} .zavz-window{
        width:96vw;
        height:96vh;
        border-radius:12px;
      }
      #${ID_ROOT} .zavz-topbar{
        flex-wrap:wrap;
      }
      #${ID_ROOT} .chip{
        flex:1 1 140px;
      }
      #${ID_ROOT} .zavz-search{
        order:5;
        flex:1 0 100%;
      }
      #${ID_ROOT} .zavz-search:focus,
      #${ID_ROOT} .zavz-search:not(:placeholder-shown){
        width:100%;
      }
      #${ID_ROOT} .panel.active{
        grid-template-columns:1fr !important;
      }
      #${ID_ROOT} .zavz-grid{
        grid-template-columns:1fr;
      }
      #${ID_ROOT} .zavz-theme-presets{
        grid-template-columns:repeat(2,minmax(0,1fr));
      }
      #${ID_ROOT} .zavz-theme-grid{
        grid-template-columns:1fr;
      }
      #${ID_ROOT} .zavz-theme-custom-row{
        grid-template-columns:1fr;
      }
    }

    /* Theme + layout overrides (keep at end for precedence) */
    #${ID_ROOT}{
      background:
        radial-gradient(900px 460px at 8% 8%, var(--overlay-glow-1), transparent 62%),
        radial-gradient(780px 420px at 90% 92%, var(--overlay-glow-2), transparent 60%),
        linear-gradient(120deg, var(--accent-a08) 0%, transparent 55%, var(--accent2-a18) 100%),
        rgba(3,7,13,.78);
      color-scheme:dark;
      --accent-grad:linear-gradient(180deg,var(--accent),var(--accent-2));
    }
    #${ID_ROOT} .zavz-body{
      background:
        linear-gradient(180deg,rgba(255,255,255,.01),rgba(255,255,255,0)),
        repeating-linear-gradient(0deg, var(--accent-a08) 0px, var(--accent-a08) 1px, transparent 1px, transparent 36px);
    }
    #${ID_ROOT}[data-accent-style="fade"]{
      --accent-grad:linear-gradient(90deg,var(--accent) 0%, var(--accent-2) 50%, var(--accent) 100%);
    }
    #${ID_ROOT}[data-accent-style="rainbow"]{
      --accent-grad:linear-gradient(90deg,#ff004d,#ff7a00,#ffe600,#2dff74,#00c2ff,#7a5cff,#ff00f7,#ff004d);
    }
    @keyframes zavzAccentShift{
      0%{background-position:0% 50%;}
      50%{background-position:100% 50%;}
      100%{background-position:0% 50%;}
    }
    @keyframes zavzRainbowShift{
      0%{background-position:0% 50%;}
      100%{background-position:220% 50%;}
    }
    #${ID_ROOT}[data-accent-style="two"] .zavz-btn-accent,
    #${ID_ROOT}[data-accent-style="fade"] .zavz-btn-accent,
    #${ID_ROOT}[data-accent-style="rainbow"] .zavz-btn-accent{
      background:var(--accent-grad);
      border-color:var(--accent-a55);
      color:#fff;
    }
    #${ID_ROOT}[data-accent-style="fade"] .zavz-btn-accent,
    #${ID_ROOT}[data-accent-style="fade"] .zavz-switch input:checked + .zavz-track,
    #${ID_ROOT}[data-accent-style="fade"] .zavz-theme-preview-btn,
    #${ID_ROOT}[data-accent-style="fade"] .zavz-theme-preview-slider .fill,
    #${ID_ROOT}[data-accent-style="fade"] ::-webkit-scrollbar-thumb{
      background:var(--accent-grad);
      background-size:200% 200%;
      animation:zavzAccentShift 3.6s ease-in-out infinite;
    }
    #${ID_ROOT}[data-accent-style="rainbow"] .zavz-btn-accent,
    #${ID_ROOT}[data-accent-style="rainbow"] .zavz-switch input:checked + .zavz-track,
    #${ID_ROOT}[data-accent-style="rainbow"] .zavz-theme-preview-btn,
    #${ID_ROOT}[data-accent-style="rainbow"] .zavz-theme-preview-slider .fill,
    #${ID_ROOT}[data-accent-style="rainbow"] ::-webkit-scrollbar-thumb{
      background:var(--accent-grad);
      background-size:400% 400%;
      animation:zavzRainbowShift 7.5s linear infinite;
    }
    #${ID_ROOT} .zavz-window{
      background:
        radial-gradient(900px 480px at 12% 10%, var(--accent-a12), transparent 62%),
        radial-gradient(720px 420px at 92% 92%, var(--accent2-a18), transparent 60%),
        linear-gradient(180deg,var(--bg-2) 0%, var(--bg) 100%);
      border-color:var(--line);
      transform:translate(-50%,-50%) scale(var(--ui-scale, 1));
      transform-origin:50% 50%;
    }
    #${ID_ROOT} .zavz-window.positioned{
      transform:scale(var(--ui-scale, 1));
      transform-origin:top left;
    }
    #${ID_ROOT} .zavz-sidebar{
      background:
        linear-gradient(180deg,var(--accent-a08) 0%, transparent 55%),
        linear-gradient(180deg,var(--bg-4) 0%, var(--bg) 100%);
      border-right-color:var(--line-2);
    }
    #${ID_ROOT} .zavz-content{
      background:
        radial-gradient(700px 420px at 80% 0%, var(--accent2-a18), transparent 62%),
        linear-gradient(180deg,var(--bg-2) 0%, var(--bg) 100%);
    }
    #${ID_ROOT} .zavz-topbar{
      background:linear-gradient(180deg,var(--bg-2) 0%, var(--bg-4) 100%);
      border-bottom-color:var(--line-2);
    }
    #${ID_ROOT} .chip{
      background:linear-gradient(180deg,var(--bg-3) 0%, var(--bg-2) 100%);
      border-color:var(--line-2);
      color:var(--text);
    }
    #${ID_ROOT} .chip.link:hover{
      border-color:var(--accent-a55);
      box-shadow:0 0 0 2px var(--accent-a12);
    }
    #${ID_ROOT} input[type=\"text\"],
    #${ID_ROOT} textarea,
    #${ID_ROOT} select{
      background:linear-gradient(180deg,var(--bg-3) 0%, var(--bg-2) 100%);
      border-color:var(--line-2);
      color:var(--text);
    }
    #${ID_ROOT} input[type=\"text\"]:focus,
    #${ID_ROOT} textarea:focus,
    #${ID_ROOT} select:focus{
      border-color:var(--accent-a55);
      box-shadow:0 0 0 2px var(--accent-a12);
    }
    #${ID_ROOT} input.zavz-pill{
      width:68px;
      text-align:center;
      padding:0 8px;
      height:30px;
      font-size:11px;
      font-weight:800;
      letter-spacing:.4px;
      background:linear-gradient(180deg,var(--bg-3) 0%, var(--bg-2) 100%);
      border:1px solid var(--line-2);
      border-radius:8px;
      color:var(--text);
      outline:none;
    }
    #${ID_ROOT} input.zavz-pill:focus{
      border-color:var(--accent-a55);
      box-shadow:0 0 0 2px var(--accent-a12);
    }
    #${ID_ROOT} .zavz-card{
      background:
        linear-gradient(180deg, var(--accent-a08) 0%, transparent 35%),
        linear-gradient(180deg,var(--bg-3) 0%, var(--bg-2) 100%);
      border-color:var(--line-2);
    }
    #${ID_ROOT} .zavz-side-label,
    #${ID_ROOT} .zavz-subtitle,
    #${ID_ROOT} .zavz-note,
    #${ID_ROOT} .zavz-hint{
      color:var(--muted);
    }
    #${ID_ROOT} .zavz-nav-item{
      position:relative;
      overflow:hidden;
    }
    #${ID_ROOT} .zavz-nav-item > *{
      position:relative;
      z-index:1;
    }
    #${ID_ROOT} .zavz-nav-item.active{
      background:linear-gradient(180deg,var(--accent-a18),var(--accent-a08));
      border-color:var(--accent-a55);
      color:var(--text);
    }
    #${ID_ROOT} .zavz-nav-item.active::before{
      content:"";
      position:absolute;
      inset:0;
      border-radius:inherit;
      background:var(--accent-grad);
      opacity:.18;
      pointer-events:none;
    }
    #${ID_ROOT}[data-accent-style="fade"] .zavz-nav-item.active::before{
      background-size:200% 200%;
      animation:zavzAccentShift 3.6s ease-in-out infinite;
    }
    #${ID_ROOT}[data-accent-style="rainbow"] .zavz-nav-item.active::before{
      background-size:400% 400%;
      animation:zavzRainbowShift 7.5s linear infinite;
    }
    #${ID_ROOT} .zavz-nav-item.active .zavz-ico{color:var(--accent-2);}
    #${ID_ROOT} .zavz-nav-item:hover{
      border-color:var(--accent-a18);
    }
    #${ID_ROOT} .zavz-track{
      background:linear-gradient(180deg,var(--off) 0%, var(--bg-4) 100%);
      border-color:var(--line-2);
    }
    #${ID_ROOT} .zavz-switch input:checked + .zavz-track{
      background:linear-gradient(180deg,var(--accent) 0%, var(--accent-2) 100%);
      border-color:var(--accent-a55);
    }
    #${ID_ROOT} .zavz-btn:hover{
      border-color:var(--accent-a55);
      box-shadow:0 0 0 2px var(--accent-a12);
    }
    #${ID_ROOT} .zavz-btn-accent{
      background:linear-gradient(180deg,var(--accent-a24),var(--accent-a18));
      border-color:var(--accent-a55);
    }
    #${ID_ROOT} .zavz-btn-ghost:hover{
      border-color:var(--accent-a55);
      color:var(--text);
    }
    #${ID_ROOT} .zavz-log-pill.info{
      background:var(--accent-a18);
      color:var(--text);
      border-color:var(--accent-a35);
    }
    #${ID_ROOT} .zavz-preview{
      background:var(--accent-a12);
      border-color:var(--accent-a35);
      color:var(--text);
    }
    #${ID_ROOT} .zavz-theme-preset.active{
      box-shadow:0 0 0 2px rgba(255,255,255,.95), 0 0 0 5px var(--accent-a35);
    }
    #${ID_ROOT} #zavz-theme-custom.active{
      border-color:var(--accent-a75);
      box-shadow:0 0 0 2px var(--accent-a12);
    }
    #${ID_ROOT} ::-webkit-scrollbar-thumb{
      background:linear-gradient(180deg,var(--accent),var(--accent-2));
    }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.documentElement.appendChild(style);

    fab = document.createElement('div');
    fab.id = ID_BTN;
    fab.textContent = '\u00A5$';
    fab.title = 'Open ERA CX TOOLS (Ctrl+I)';
    document.body.appendChild(fab);

    root = document.createElement('div');
    root.id = ID_ROOT;
    setHTML(root, `
      <div class="zavz-window" role="dialog" aria-modal="true">
        <aside class="zavz-sidebar">
          <div class="zavz-brand">
            <div class="zavz-logo">&#165;$</div>
            <div>
              <div class="zavz-title">&#165;$</div>
              <div class="zavz-subtitle">ERA CX TOOLS</div>
            </div>
          </div>

          <div class="zavz-side-label">AUTO LOGIN</div>
          <div class="zavz-nav">
            <div class="zavz-nav-item active" data-panel="main">
              <div class="zavz-ico">${ICONS.bolt}</div><div>Auto Login</div>
            </div>
            <div class="zavz-nav-item" data-panel="legit">
              <div class="zavz-ico">${ICONS.arrow}</div><div>Legit</div>
            </div>
          </div>

          <div class="zavz-side-label">COMMON</div>
          <div class="zavz-nav">
            <div class="zavz-nav-item" data-panel="visuals">
              <div class="zavz-ico">${ICONS.eye}</div><div>Visuals</div>
            </div>
            <div class="zavz-nav-item" data-panel="inventory">
              <div class="zavz-ico">${ICONS.box}</div><div>Inventory</div>
            </div>
            <div class="zavz-nav-item" data-panel="misc">
              <div class="zavz-ico">${ICONS.sliders}</div><div>Miscellaneous</div>
            </div>
            <div class="zavz-nav-item" data-panel="profiles">
              <div class="zavz-ico">${ICONS.user}</div><div>Profiles</div>
            </div>
            <div class="zavz-nav-item" data-panel="status">
              <div class="zavz-ico">${ICONS.pulse}</div><div>Status</div>
            </div>
          </div>

          <div class="zavz-side-label">TOOLS</div>
          <div class="zavz-nav">
            <div class="zavz-nav-item" data-panel="debug">
              <div class="zavz-ico">${ICONS.bug}</div><div>Debug</div>
            </div>
          </div>

          <div class="zavz-spacer"></div>
          <div class="zavz-profile">
            <div class="zavz-avatar"></div>
            <div>
              <div class="name">Zywl</div>
              <small>lucsp.lima</small>
            </div>
          </div>
        </aside>

        <main class="zavz-content">
          <div class="zavz-topbar">
            <div class="zavz-lock" aria-hidden="true">${ICONS.lock}</div>
            <div class="chip link dropdown" id="zavz-site-chip">www.lucas-lima.xyz</div>
            <div class="chip dropdown" id="zavz-ver-chip">v1.2</div>
            <input class="zavz-search" type="text" placeholder="Search settings" />
            <button class="zavz-close" aria-label="Close">x</button>
          </div>

          <div class="zavz-body">
            <section class="panel active" data-panel-id="main">
              <div class="zavz-card" data-card="login">
                <h4>AUTO LOGIN</h4>

                <div class="zavz-row setting-row" data-label="enabled">
                  <div class="zavz-label">Enabled</div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div class="zavz-dots">\u00b7\u00b7\u00b7</div>
                    <label class="zavz-switch">
                      <input type="checkbox">
                      <span class="zavz-track"><span class="zavz-thumb"></span></span>
                    </label>
                  </div>
                </div>

                <div class="zavz-row setting-row" data-label="goto">
                  <div class="zavz-label">Goto</div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div class="zavz-dots">\u00b7\u00b7\u00b7</div>
                    <label class="zavz-switch">
                      <input type="checkbox">
                      <span class="zavz-track"><span class="zavz-thumb"></span></span>
                    </label>
                  </div>
                </div>

                <div class="zavz-row setting-row" data-label="era">
                  <div class="zavz-label">ERA</div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <label class="zavz-switch">
                      <input type="checkbox">
                      <span class="zavz-track"><span class="zavz-thumb"></span></span>
                    </label>
                  </div>
                </div>

                <div class="zavz-row setting-row" data-label="fibertel">
                  <div class="zavz-label">Fibertel</div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <label class="zavz-switch">
                      <input type="checkbox">
                      <span class="zavz-track"><span class="zavz-thumb"></span></span>
                    </label>
                  </div>
                </div>

                <div class="zavz-row setting-row" data-label="brtrix">
                  <div class="zavz-label">BRTRIX</div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <label class="zavz-switch">
                      <input type="checkbox">
                      <span class="zavz-track"><span class="zavz-thumb"></span></span>
                    </label>
                  </div>
                </div>

                <div class="zavz-row setting-row" data-label="auto-detect">
                  <div class="zavz-label">Auto Detect Mode</div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <label class="zavz-switch">
                      <input type="checkbox" id="zavz-auto-detect">
                      <span class="zavz-track"><span class="zavz-thumb"></span></span>
                    </label>
                    <div class="zavz-hint">Detecta o modo pelo domínio/perfil e ignora toggles manuais.</div>
                  </div>
                </div>

                <div class="zavz-row setting-row" data-label="auto-detect-any-domain">
                  <div class="zavz-label">Auto Detect Any Domain</div>
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <label class="zavz-switch">
                      <input type="checkbox" id="zavz-auto-detect-any-domain">
                      <span class="zavz-track"><span class="zavz-thumb"></span></span>
                    </label>
                    <div class="zavz-hint">No Auto Detect, libera dominios fora da whitelist e usa login calliope (modo ERA) quando o dominio nao estiver mapeado.</div>
                  </div>
                </div>

                <div class="zavz-row setting-row" data-label="smart-attempts">
                  <div class="zavz-label">Smart Attempts</div>
                  <label class="zavz-switch">
                    <input type="checkbox" id="zavz-smart-attempts">
                    <span class="zavz-track"><span class="zavz-thumb"></span></span>
                  </label>
                </div>
                <div class="zavz-note">Prioriza senhas com base em histórico de sucesso por domínio.</div>

                <div class="zavz-row setting-row" data-label="performance-mode">
                  <div class="zavz-label">Performance Mode</div>
                  <label class="zavz-switch">
                    <input type="checkbox" id="zavz-performance-mode">
                    <span class="zavz-track"><span class="zavz-thumb"></span></span>
                  </label>
                </div>
                <div class="zavz-note">Ativa cache de campos, backoff progressivo e menos polling.</div>

                <div class="zavz-row setting-row" data-label="delay">
                  <div class="zavz-label">Delay</div>
                  <div class="zavz-slider-wrap">
                    <input class="zavz-slider" type="range" min="0" max="500" value="180" />
                    <div class="zavz-pill">180 ms</div>
                  </div>
                </div>

                <div class="zavz-empty" data-empty>No results.</div>
              </div>

              <div class="zavz-card" data-card="access">
                <h4>ACCESS</h4>

                <div class="zavz-row setting-row" data-label="domain-guard">
                  <div class="zavz-label">Domínios permitidos</div>
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <label class="zavz-switch">
                      <input type="checkbox" id="zavz-allow-all-domains">
                      <span class="zavz-track"><span class="zavz-thumb"></span></span>
                    </label>
                    <div class="zavz-hint">Ative para liberar todos os domínios. Desative para usar apenas a whitelist atual.</div>
                  </div>
                </div>

                <div class="zavz-row setting-row" data-label="show-pass-hover">
                  <div class="zavz-label">Show password on hover</div>
                  <label class="zavz-switch">
                    <input type="checkbox" id="zavz-show-pass-hover">
                    <span class="zavz-track"><span class="zavz-thumb"></span></span>
                  </label>
                </div>
                <div class="zavz-note">Revela campos de senha ao passar o mouse e volta ao normal ao sair.</div>
              </div>

              <div class="zavz-card" data-card="recent-actions">
                <h4>HISTORY</h4>
                <div class="zavz-note">\u00daltimos logins e tentativas do auto-login.</div>
                <div class="zavz-log-viewer" id="zavz-recent-actions"></div>
              </div>

              <div class="zavz-card" data-card="cert-validator">
                <h4>CERTS</h4>

              <div class="zavz-row setting-row" data-label="cert-omni">
                <div class="zavz-label">Omni Cert</div>
                <button class="zavz-btn" id="zavz-cert-omni">VALIDATE</button>
              </div>
              <div id="zavz-cert-omni-status" style="font-size:12px;color:var(--muted);margin:-6px 0 12px 0;">${CERT_STATUS_OMNI_DEFAULT}</div>

              <div class="zavz-row setting-row" data-label="cert-pabx">
                <div class="zavz-label">PABX Cert</div>
                <button class="zavz-btn" id="zavz-cert-pabx">VALIDATE</button>
              </div>
              <div id="zavz-cert-pabx-status" style="font-size:12px;color:var(--muted);margin:-6px 0 0 0;">${CERT_STATUS_PABX_DEFAULT}</div>
            </div>
          </section>

            <section class="panel" data-panel-id="legit">
              <div class="zavz-card" data-card="legit">
                <h4>LEGIT</h4>

                <div class="zavz-row setting-row" data-label="clearcache">
                  <div class="zavz-label">Clear Cache</div>
                  <button class="zavz-btn zavz-btn-danger" id="zavz-clear-cache">CLEAR</button>
                </div>

                <div style="font-size:12px;color:var(--muted);margin-top:6px;line-height:1.5;">
                  Limpa os dados do site atual (local/session storage, cookies, IndexedDB, Cache Storage, Service Workers)
                  e recarrega a página. Não limpa cache global do navegador.
                </div>
              </div>

              <div class="zavz-card" data-card="easy-command">
                <h4>DOCKER</h4>
                <div class="zavz-grid">
                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">Containers</div>
                    <div class="zavz-mini-desc">Liste, pegue o ID e já entre no bash.</div>

                    <div class="zavz-inline">
                      <button class="zavz-btn" id="zavz-cmd-docker-ps">FILTRAR</button>
                      <div class="zavz-hint">docker ps -a --format "{{.ID}}\t{{.Names}}"</div>
                    </div>

                    <div class="zavz-inline">
                      <input class="zavz-input" id="zavz-container-id" type="text" placeholder="ID do container" style="min-width:160px;" />
                      <button class="zavz-btn" id="zavz-cmd-docker-exec">ENTRAR</button>
                    </div>
                    <div class="zavz-hint">docker exec -u 0 -it &lt;ID&gt; /bin/bash</div>
                    <div class="zavz-preview" id="zavz-prev-exec">docker exec -u 0 -it &lt;ID&gt; /bin/bash</div>
                  </div>

                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">Copiar para o container</div>
                    <div class="zavz-mini-desc">Do host para o container (local \u2192 container).</div>

                    <div class="zavz-inline">
                      <input class="zavz-input" id="zavz-cp-src" type="text" placeholder="/root/lucas/app.whatsappQrCode/package.json" />
                    </div>
                    <div class="zavz-inline">
                      <input class="zavz-input" id="zavz-cp-container-id" type="text" placeholder="ID do container" style="min-width:130px;" />
                      <input class="zavz-input" id="zavz-cp-dest" type="text" placeholder="/app/app.whatsappQrCode/" />
                    </div>
                    <div class="zavz-inline">
                      <button class="zavz-btn" id="zavz-cmd-docker-cp">COPIAR</button>
                      <div class="zavz-hint">docker cp /root/lucas/&lt;arquivo&gt; &lt;ID&gt;:&lt;destino&gt;</div>
                    </div>
                    <div class="zavz-preview" id="zavz-prev-cp">docker cp /root/lucas/&lt;arquivo&gt; &lt;ID&gt;:&lt;destino&gt;</div>
                  </div>

                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">Copiar do container</div>
                    <div class="zavz-mini-desc">Do container para o host (container \u2192 local).</div>

                    <div class="zavz-inline">
                      <input class="zavz-input" id="zavz-cpfrom-container-id" type="text" placeholder="ID do container" style="min-width:130px;" />
                      <input class="zavz-input" id="zavz-cpfrom-src" type="text" placeholder="/app/app.whatsappQrCode/api/551931672244.txt" />
                    </div>

                    <div class="zavz-inline">
                      <input class="zavz-input" id="zavz-cpfrom-dest" type="text" placeholder="/root/lucas/app.whatsappQrCode/api/" />
                    </div>
                    <div class="zavz-inline">
                      <button class="zavz-btn" id="zavz-cmd-docker-cp-from">COPIAR</button>
                      <div class="zavz-hint">docker cp &lt;ID&gt;:&lt;origem&gt; &lt;destino local&gt;</div>
                    </div>
                    <div class="zavz-preview" id="zavz-prev-cp-from">docker cp &lt;ID&gt;:&lt;origem&gt; &lt;destino local&gt;</div>
                  </div>
                </div>
              </div>

              <div class="zavz-card" data-card="server-tools">
                <h4>SERVER</h4>
                <div class="zavz-grid">
                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">Data e timezone</div>
                    <div class="zavz-mini-desc">Ver hora, ajustar timezone e reiniciar o app.</div>
                    <div class="zavz-inline">
                      <button class="zavz-btn" id="zavz-cmd-date">DATE</button>
                      <button class="zavz-btn" id="zavz-cmd-tzdata">TZDATA</button>
                      <button class="zavz-btn" id="zavz-cmd-pm2">PM2</button>
                    </div>
                    <div class="zavz-hint">date · dpkg-reconfigure tzdata · pm2 restart app.chatbot</div>
                  </div>
                </div>
              </div>

              <div class="zavz-card" data-card="services-tools">
                <h4>SERVICES</h4>
                <div class="zavz-grid">
                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">MongoDB</div>
                    <div class="zavz-mini-desc">Reinicie, suba ou consulte o serviço mongod.</div>
                    <div class="zavz-inline">
                      <button class="zavz-btn" id="zavz-cmd-mongo-restart">RESTART</button>
                      <button class="zavz-btn" id="zavz-cmd-mongo-start">START</button>
                      <button class="zavz-btn" id="zavz-cmd-mongo-status">STATUS</button>
                    </div>
                    <div class="zavz-hint">restart (reinicia) · start (sobe) · status (logs/estado) do mongod.service</div>
                  </div>

                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">NGINX</div>
                    <div class="zavz-mini-desc">Copie o tail do log ou reinicie o serviço rapidamente.</div>
                    <div class="zavz-inline">
                      <button class="zavz-btn" id="zavz-cmd-nginx-tail">TAIL</button>
                      <button class="zavz-btn" id="zavz-cmd-nginx-restart">RESTART</button>
                    </div>
                    <div class="zavz-hint">tail -f /var/log/nginx/error.log (segue erros) · /etc/init.d/nginx restart</div>
                  </div>
                </div>
              </div>

              <div class="zavz-card" data-card="permissions-tools">
                <h4>PERMISSIONS</h4>
                <div class="zavz-grid">
                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">Permissões</div>
                    <div class="zavz-mini-desc">Ajuste dono ou permissões recursivamente.</div>
                    <div class="zavz-inline">
                      <input class="zavz-input" id="zavz-perm-path" type="text" placeholder="/var/www/html" />
                    </div>
                    <div class="zavz-inline">
                      <button class="zavz-btn" id="zavz-cmd-chown-www">CHOWN</button>
                      <button class="zavz-btn" id="zavz-cmd-chmod-777">CHMOD</button>
                    </div>
                    <div class="zavz-hint">chown troca o dono para www-data; chmod 777 libera tudo (use com cuidado).</div>
                    <div class="zavz-preview" id="zavz-prev-perm-chown">chown www-data:www-data &lt;alvo&gt; -R</div>
                    <div class="zavz-preview" id="zavz-prev-perm-chmod">chmod 777 &lt;alvo&gt; -R</div>
                  </div>
                </div>
              </div>
            </section>
            <section class="panel" data-panel-id="visuals">
              <div class="zavz-card" data-card="visuals">
                <h4>VISUALS</h4>

                <div class="zavz-row setting-row" data-label="hideicon">
                  <div class="zavz-label">Hide YS Icon</div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div class="zavz-dots">\u00b7\u00b7\u00b7</div>
                    <label class="zavz-switch">
                      <input type="checkbox">
                      <span class="zavz-track"><span class="zavz-thumb"></span></span>
                    </label>
                  </div>
                </div>

                <div class="zavz-note">
                  Quando esta opção estiver ON, o botão flutuante &#165;$ desaparece definitivamente.
                  Para abrir este menu use apenas <b>CTRL + I</b>.
                </div>

                <div class="zavz-row setting-row" data-label="ui-scale">
                  <div class="zavz-label">UI Scale</div>
                  <div class="zavz-slider-wrap">
                    <input class="zavz-slider" id="zavz-ui-scale" type="range" min="65" max="100" value="90" />
                    <input class="zavz-pill" id="zavz-ui-scale-pill" type="text" value="90%" inputmode="numeric" spellcheck="false" />
                  </div>
                </div>

                <div class="zavz-row setting-row" data-label="ui-scale-auto">
                  <div class="zavz-label">Auto Fit (Resolution)</div>
                  <label class="zavz-switch">
                    <input type="checkbox" id="zavz-ui-scale-auto">
                    <span class="zavz-track"><span class="zavz-thumb"></span></span>
                  </label>
                </div>
                <div class="zavz-note">Ajuste o tamanho do menu. Auto Fit reduz automaticamente para caber na sua tela.</div>

                <div class="zavz-row setting-row" data-label="theme-mode">
                  <div class="zavz-label">Theme Mode</div>
                  <div class="zavz-inline" id="zavz-theme-modes">
                    <button type="button" class="zavz-btn zavz-btn-ghost zavz-theme-fx zavz-theme-mode" data-theme-mode="dark">DARK</button>
                    <button type="button" class="zavz-btn zavz-btn-ghost zavz-theme-fx zavz-theme-mode" data-theme-mode="black">BLACK</button>
                    <button type="button" class="zavz-btn zavz-btn-ghost zavz-theme-fx zavz-theme-mode" data-theme-mode="contrast">CONTRAST</button>
                  </div>
                </div>

                <div class="zavz-theme-lab" id="zavz-theme-lab">
                  <div class="zavz-theme-title">Interface Customization</div>
                  <div class="zavz-theme-subtitle">Personalize sua interface com presets, modo e cor custom.</div>

                  <div class="zavz-theme-block">
                    <div class="zavz-theme-block-title">Color Presets</div>
                    <div class="zavz-theme-presets">
                      <button type="button" class="zavz-theme-preset" data-theme-preset="black" style="--theme-swatch:${THEME_PRESETS.black};" aria-label="Black"></button>
                      <button type="button" class="zavz-theme-preset" data-theme-preset="blue" style="--theme-swatch:${THEME_PRESETS.blue};" aria-label="Blue"></button>
                      <button type="button" class="zavz-theme-preset" data-theme-preset="purple" style="--theme-swatch:${THEME_PRESETS.purple};" aria-label="Purple"></button>
                      <button type="button" class="zavz-theme-preset" data-theme-preset="green" style="--theme-swatch:${THEME_PRESETS.green};" aria-label="Green"></button>
                      <button type="button" class="zavz-theme-preset" data-theme-preset="orange" style="--theme-swatch:${THEME_PRESETS.orange};" aria-label="Orange"></button>
                      <button type="button" class="zavz-theme-preset" data-theme-preset="pink" style="--theme-swatch:${THEME_PRESETS.pink};" aria-label="Pink"></button>
                      <button type="button" class="zavz-theme-preset" data-theme-preset="cyan" style="--theme-swatch:${THEME_PRESETS.cyan};" aria-label="Cyan"></button>
                      <button type="button" class="zavz-theme-preset" data-theme-preset="yellow" style="--theme-swatch:${THEME_PRESETS.yellow};" aria-label="Yellow"></button>
                      <button type="button" class="zavz-theme-preset" data-theme-preset="gray" style="--theme-swatch:${THEME_PRESETS.gray};" aria-label="Gray"></button>
                      <button type="button" class="zavz-theme-preset" data-theme-preset="sunset" style="--theme-swatch:${THEME_PRESETS.sunset};" aria-label="Sunset"></button>
                    </div>
                  </div>

                  <div class="zavz-theme-block">
                    <div class="zavz-theme-block-title">Accent FX</div>
                    <div class="zavz-theme-effects" id="zavz-theme-effects">
                      <button type="button" class="zavz-btn zavz-btn-ghost zavz-theme-fx" data-accent-style="solid">SOLID</button>
                      <button type="button" class="zavz-btn zavz-btn-ghost zavz-theme-fx" data-accent-style="two">TWO COLOR</button>
                      <button type="button" class="zavz-btn zavz-btn-ghost zavz-theme-fx" data-accent-style="fade">FADE</button>
                      <button type="button" class="zavz-btn zavz-btn-ghost zavz-theme-fx" data-accent-style="rainbow">RAINBOW</button>
                    </div>
                    <div class="zavz-hint">Use Two Color/Fade para definir uma 2ª cor. Rainbow/Fade animam botões e switches.</div>
                  </div>

                  <div class="zavz-theme-grid">
                    <div class="zavz-theme-custom">
                      <div class="zavz-theme-block-title">Custom Hue</div>
                      <input class="zavz-theme-hue" id="zavz-theme-hue" type="range" min="0" max="360" value="286" />
                      <div class="zavz-theme-custom-row">
                        <button class="zavz-btn zavz-btn-accent" id="zavz-theme-custom" type="button">USE CUSTOM</button>
                        <input class="zavz-input" id="zavz-theme-hex" type="text" value="#C500FF" maxlength="7" />
                        <input class="zavz-theme-color" id="zavz-theme-color" type="color" value="#C500FF" aria-label="Pick color" />
                      </div>

                      <div class="zavz-theme-secondary" id="zavz-theme-secondary">
                        <div class="zavz-theme-block-title">Second Color</div>
                        <div class="zavz-theme-custom-row zavz-theme-custom-row-secondary">
                          <input class="zavz-input" id="zavz-theme-hex-2" type="text" value="#4C83FF" maxlength="7" />
                          <input class="zavz-theme-color" id="zavz-theme-color-2" type="color" value="#4C83FF" aria-label="Pick second color" />
                        </div>
                      </div>

                      <div class="zavz-theme-palette">
                        <div class="zavz-theme-block-title">My Palette</div>
                        <div class="zavz-theme-palette-row">
                          <button class="zavz-btn" id="zavz-theme-swatch-add" type="button">ADD</button>
                          <div class="zavz-theme-swatches" id="zavz-theme-swatches"></div>
                        </div>
                        <div class="zavz-hint">Clique numa cor para usar no Custom.</div>
                      </div>
                    </div>

                    <div class="zavz-theme-preview" id="zavz-theme-preview">
                      <div class="zavz-theme-block-title">Live Preview</div>
                      <button class="zavz-theme-preview-btn" id="zavz-theme-preview-btn" type="button">Active Button \u2713</button>
                      <div class="zavz-theme-preview-slider"><div class="fill"></div></div>
                    </div>
                  </div>

                  <div class="zavz-theme-footer">
                    <div class="zavz-theme-glow">
                      <div>
                        <div class="zavz-label">Glow Effect</div>
                        <div class="zavz-hint">Sombra colorida nos botões e cards.</div>
                      </div>
                      <label class="zavz-switch">
                        <input type="checkbox" id="zavz-theme-glow">
                        <span class="zavz-track"><span class="zavz-thumb"></span></span>
                      </label>
                    </div>
                    <div class="zavz-mini-actions">
                      <button class="zavz-btn zavz-btn-ghost" id="zavz-theme-reset" type="button">CANCEL</button>
                      <button class="zavz-btn zavz-btn-accent" id="zavz-theme-apply" type="button">APPLY THEME</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section class="panel" data-panel-id="inventory">
              <div class="zavz-card" data-card="inventory">
                <h4>INVENTORY</h4>

                <div class="zavz-grid">
                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">whatsapp-web.js</div>
                    <div class="zavz-mini-actions">
                      <button class="zavz-btn" id="zavz-wa-check">RELEASE</button>
                      <button class="zavz-btn" id="zavz-wa-nightly">NIGHTLY</button>
                      <button class="zavz-btn zavz-btn-ghost" id="zavz-wa-open">GIT</button>
                      <button class="zavz-btn zavz-btn-ghost" id="zavz-wa-docs">DOCS</button>
                    </div>
                    <div id="zavz-wa-status" class="zavz-hint">${WA_STATUS_DEFAULT}</div>
                    <div id="zavz-wa-commit" class="zavz-preview">${WA_COMMIT_STATUS_DEFAULT}</div>
                  </div>

                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">FDPClient</div>
                    <div class="zavz-mini-actions">
                      <button class="zavz-btn" id="zavz-fdp-release">RELEASE</button>
                      <button class="zavz-btn" id="zavz-fdp-commit">NIGHTLY</button>
                      <button class="zavz-btn zavz-btn-ghost" id="zavz-fdp-open">GIT</button>
                      <button class="zavz-btn zavz-btn-ghost" id="zavz-fdp-site">SITE</button>
                    </div>
                    <div id="zavz-fdp-status" class="zavz-hint">${FDP_STATUS_DEFAULT}</div>
                    <div id="zavz-fdp-commit" class="zavz-preview">Commit não verificado ainda.</div>
                  </div>
                </div>
              </div>
            </section>

            <section class="panel" data-panel-id="status">
              <div class="zavz-card" data-card="status">
                <h4>STATUS</h4>
                <div class="zavz-note">Cheque serviços críticos para ter visibilidade total.</div>
                <div class="zavz-grid">
                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">GitHub Status</div>
                    <div class="zavz-mini-actions">
                      <button class="zavz-btn" id="zavz-status-github">CHECK</button>
                      <button class="zavz-btn zavz-btn-ghost" id="zavz-status-github-open">OPEN</button>
                    </div>
                    <div id="zavz-status-github-text" class="zavz-hint">Clique em CHECK para ver o status.</div>
                  </div>

                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">Gupshup Status</div>
                    <div class="zavz-mini-actions">
                      <button class="zavz-btn" id="zavz-status-gupshup">CHECK</button>
                      <button class="zavz-btn zavz-btn-ghost" id="zavz-status-gupshup-open">OPEN</button>
                    </div>
                    <div id="zavz-status-gupshup-text" class="zavz-hint">Clique em CHECK para ver o status.</div>
                  </div>

                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">WhatsApp Status</div>
                    <div class="zavz-mini-actions">
                      <button class="zavz-btn" id="zavz-status-whatsapp">CHECK</button>
                      <button class="zavz-btn zavz-btn-ghost" id="zavz-status-whatsapp-open">OPEN</button>
                    </div>
                    <div id="zavz-status-whatsapp-text" class="zavz-hint">Clique em CHECK para ver o status.</div>
                  </div>

                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">Claude (Anthropic)</div>
                    <div class="zavz-mini-actions">
                      <button class="zavz-btn" id="zavz-status-claude">CHECK</button>
                      <button class="zavz-btn zavz-btn-ghost" id="zavz-status-claude-open">OPEN</button>
                    </div>
                    <div id="zavz-status-claude-text" class="zavz-hint">Clique em CHECK para ver o status.</div>
                  </div>

                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">OpenAI / ChatGPT</div>
                    <div class="zavz-mini-actions">
                      <button class="zavz-btn" id="zavz-status-openai">CHECK</button>
                      <button class="zavz-btn zavz-btn-ghost" id="zavz-status-openai-open">OPEN</button>
                    </div>
                    <div id="zavz-status-openai-text" class="zavz-hint">Clique em CHECK para ver o status.</div>
                  </div>

                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">Gemini (Google)</div>
                    <div class="zavz-mini-actions">
                      <button class="zavz-btn" id="zavz-status-gemini">CHECK</button>
                      <button class="zavz-btn zavz-btn-ghost" id="zavz-status-gemini-open">OPEN</button>
                    </div>
                    <div id="zavz-status-gemini-text" class="zavz-hint">Clique em CHECK para ver o status.</div>
                  </div>

                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">Twitter / X</div>
                    <div class="zavz-mini-actions">
                      <button class="zavz-btn" id="zavz-status-twitter">CHECK</button>
                      <button class="zavz-btn zavz-btn-ghost" id="zavz-status-twitter-open">OPEN</button>
                    </div>
                    <div id="zavz-status-twitter-text" class="zavz-hint">Clique em CHECK para ver o status.</div>
                  </div>
                </div>
              </div>

              <div class="zavz-card" data-card="status-history">
                <h4>HIST\u00d3RICO DE INDISPONIBILIDADES</h4>
                <div class="zavz-log-viewer" id="zavz-status-history"></div>
              </div>
            </section>

            <section class="panel" data-panel-id="misc">
              <div class="zavz-card" data-card="misc">
                <h4>MISCELLANEOUS</h4>

                <div class="zavz-row setting-row" data-label="omnidomain">
                  <div class="zavz-label">Omni Domain</div>
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <button class="zavz-btn zavz-btn-accent" id="zavz-omni-detect">GET</button>
                    <button class="zavz-btn" id="zavz-omni-ping">PING</button>
                    <button class="zavz-btn" id="zavz-omni-test">MS</button>
                    <button class="zavz-btn" id="zavz-omni-copy">COPY</button>
                    <button class="zavz-btn" id="zavz-omni-copy-ip">COPY IP</button>
                  </div>
                </div>

                <div style="margin-top:8px;display:grid;gap:6px;">
                  <input class="zavz-input" id="zavz-omni-input" type="text" readonly placeholder="domínio do omni aparecerá aqui..." />
                  <div id="zavz-omni-status" style="font-size:12px;color:var(--muted);">${OMNI_STATUS_DEFAULT}</div>
                </div>
              </div>

              <div class="zavz-card" data-card="pabx">
                <h4>PABX DOMAIN</h4>

                <div class="zavz-row setting-row" data-label="pabxdomain">
                  <div class="zavz-label">PABX Domain</div>
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <button class="zavz-btn zavz-btn-accent" id="zavz-pabx-get">GET</button>
                    <button class="zavz-btn" id="zavz-pabx-ping">PING</button>
                    <button class="zavz-btn" id="zavz-pabx-test">MS</button>
                    <button class="zavz-btn" id="zavz-pabx-copy">COPY</button>
                    <button class="zavz-btn" id="zavz-pabx-copy-ip">COPY IP</button>
                  </div>
                </div>

                <div style="margin-top:8px;display:grid;gap:6px;">
                  <input class="zavz-input" id="zavz-pabx-input" type="text" placeholder="domínio do PABX aparecerá aqui..." />
                  <div id="zavz-pabx-status" style="font-size:12px;color:var(--muted);">${PABX_STATUS_DEFAULT}</div>
                </div>
              </div>

              <div class="zavz-card" data-card="config">
                <h4>EXPORT / IMPORT</h4>
                <div class="zavz-note">Exporte ou importe configurações e perfis.</div>
                <textarea class="zavz-input" id="zavz-config-json" rows="4" placeholder="Cole aqui um JSON para importar"></textarea>
                <div class="zavz-mini-actions" style="margin-top:8px;">
                  <button class="zavz-btn" id="zavz-config-export">EXPORTAR</button>
                  <button class="zavz-btn zavz-btn-accent" id="zavz-config-import">IMPORTAR</button>
                </div>
                <div class="zavz-hint" id="zavz-config-status" style="margin-top:6px;"></div>
              </div>

              <div class="zavz-card" data-card="shortcuts">
                <h4>ATALHOS DE TECLADO</h4>
                <div class="zavz-note">Defina atalhos no formato Ctrl+Shift+X.</div>
                <div class="zavz-grid">
                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">Abrir/Fechar UI</div>
                    <input class="zavz-input" id="zavz-shortcut-toggle" type="text" placeholder="Ctrl+I" />
                  </div>
                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">Atalho ERA</div>
                    <input class="zavz-input" id="zavz-shortcut-era" type="text" placeholder="Ctrl+Shift+E" />
                  </div>
                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">Atalho Goto</div>
                    <input class="zavz-input" id="zavz-shortcut-goto" type="text" placeholder="Ctrl+Shift+G" />
                  </div>
                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">Atalho Fibertel</div>
                    <input class="zavz-input" id="zavz-shortcut-fibertel" type="text" placeholder="Ctrl+Shift+F" />
                  </div>
                  <div class="zavz-mini-card">
                    <div class="zavz-mini-title">Atalho BRTRIX</div>
                    <input class="zavz-input" id="zavz-shortcut-brtrix" type="text" placeholder="Ctrl+Shift+B" />
                  </div>
                </div>
                <div class="zavz-mini-actions" style="margin-top:8px;">
                  <button class="zavz-btn" id="zavz-shortcut-save">SALVAR</button>
                </div>
              </div>
            </section>

            <section class="panel" data-panel-id="profiles">
              <div class="zavz-card" data-card="profiles">
                <h4>PROFILES</h4>
                <div class="zavz-note">Crie perfis por cliente/servidor com modo e domínios associados.</div>

                <div class="zavz-profile-list" id="zavz-profile-list"></div>

                <div class="zavz-inline" style="margin:10px 0 8px;">
                  <input class="zavz-input" id="zavz-profile-name" type="text" placeholder="Nome do perfil" style="min-width:180px;" />
                  <select class="zavz-input" id="zavz-profile-mode" style="min-width:140px;">
                    <option value="era">ERA</option>
                    <option value="goto">Goto</option>
                    <option value="fibertel">Fibertel</option>
                    <option value="brtrix">BRTRIX</option>
                  </select>
                </div>
                <textarea class="zavz-input" id="zavz-profile-domains" rows="3" placeholder="Domínios (um por linha ou separados por vírgula)"></textarea>
                <div class="zavz-mini-actions" style="margin-top:8px;">
                  <button class="zavz-btn" id="zavz-profile-save">SALVAR</button>
                  <button class="zavz-btn" id="zavz-profile-apply">APLICAR</button>
                  <button class="zavz-btn zavz-btn-danger" id="zavz-profile-delete">REMOVER</button>
                </div>
                <div class="zavz-hint" id="zavz-profile-status" style="margin-top:6px;">Nenhum perfil selecionado.</div>
                <div class="zavz-hint" style="margin-top:6px;">Dica: clique em um perfil acima para carregar no formulário.</div>
              </div>
            </section>

            <section class="panel" data-panel-id="debug">
              <div class="zavz-card" data-card="debug">
                <h4>DEBUG</h4>

                <div class="zavz-row setting-row" data-label="logs">
                  <div class="zavz-label">Site Logs</div>
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <button class="zavz-btn" id="zavz-log-refresh">REFRESH</button>
                    <button class="zavz-btn zavz-btn-danger" id="zavz-log-clear">CLEAR</button>
                  </div>
                </div>

                <div class="zavz-log-viewer" id="zavz-log-viewer"></div>
              </div>
            </section>
          </div>
        </main>
      </div>
    `);
    document.body.appendChild(root);

    const toggleUI = () => root.classList.toggle('open');
    const closeUI  = () => root.classList.remove('open');

    function clampFabPos(x, y) {
      const margin = 6;
      const w = fab.offsetWidth || 34;
      const h = fab.offsetHeight || 34;
      const maxX = window.innerWidth - w - margin;
      const maxY = window.innerHeight - h - margin;
      return {
        x: clampNumber(Number(x), margin, Math.max(margin, maxX)),
        y: clampNumber(Number(y), margin, Math.max(margin, maxY))
      };
    }

    function applyFabPosition() {
      const pos = normalizeFabPos(settings.fabPos);
      if (!pos) {
        fab.classList.remove('pinned');
        fab.style.removeProperty('left');
        fab.style.removeProperty('top');
        fab.style.removeProperty('bottom');
        return;
      }

      const clamped = clampFabPos(pos.x, pos.y);
      if (!settings.fabPos || settings.fabPos.x !== clamped.x || settings.fabPos.y !== clamped.y) {
        settings.fabPos = clamped;
        salvarSettings();
      }

      fab.classList.add('pinned');
      fab.style.left = `${clamped.x}px`;
      fab.style.top = `${clamped.y}px`;
      fab.style.bottom = 'auto';
    }

    applyFabPosition();

    let fabPointerId = null;
    let fabDragStart = null;
    let fabWasDragged = false;

    fab.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      fabPointerId = e.pointerId;
      fabWasDragged = false;

      const rect = fab.getBoundingClientRect();
      fabDragStart = {
        x: e.clientX,
        y: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top
      };

      fab.classList.add('dragging', 'pinned');
      fab.style.left = `${rect.left}px`;
      fab.style.top = `${rect.top}px`;
      fab.style.bottom = 'auto';

      fab.setPointerCapture?.(fabPointerId);
      e.preventDefault();
    });

    fab.addEventListener('pointermove', (e) => {
      if (fabPointerId === null || e.pointerId !== fabPointerId || !fabDragStart) return;
      const dx = Math.abs(e.clientX - fabDragStart.x);
      const dy = Math.abs(e.clientY - fabDragStart.y);
      if (dx + dy > 4) fabWasDragged = true;

      const clamped = clampFabPos(e.clientX - fabDragStart.offsetX, e.clientY - fabDragStart.offsetY);
      fab.style.left = `${clamped.x}px`;
      fab.style.top = `${clamped.y}px`;
      settings.fabPos = clamped;
    });

    function endFabPointer(e) {
      if (fabPointerId === null || e.pointerId !== fabPointerId) return;
      fab.releasePointerCapture?.(fabPointerId);
      fabPointerId = null;
      fabDragStart = null;
      fab.classList.remove('dragging');

      if (settings.fabPos) {
        settings.fabPos = clampFabPos(settings.fabPos.x, settings.fabPos.y);
        salvarSettings();
      }

      applyFabPosition();
    }

    fab.addEventListener('pointerup', endFabPointer);
    fab.addEventListener('pointercancel', endFabPointer);

    fab.addEventListener('click', (e) => {
      if (fabWasDragged) {
        fabWasDragged = false;
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      toggleUI();
    });
    root.addEventListener('click', (e) => { if (e.target === root) closeUI(); });
    root.querySelector('.zavz-close').addEventListener('click', closeUI);

    const windowEl = root.querySelector('.zavz-window');
    const topbarEl = root.querySelector('.zavz-topbar');
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let dragRect = { width: 0, height: 0 };

    function clamp(val, min, max) {
      return Math.min(Math.max(val, min), max);
    }

    function applyWindowPosition(pos) {
      if (!windowEl || !pos) return;
      const rect = windowEl.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      const x = clampNumber(pos.x, 8, Math.max(8, maxX - 8));
      const y = clampNumber(pos.y, 8, Math.max(8, maxY - 8));
      windowEl.classList.add('positioned');
      windowEl.style.left = `${x}px`;
      windowEl.style.top = `${y}px`;
    }

    const savedPos = carregarWindowPos();
    if (savedPos) applyWindowPosition(savedPos);

    topbarEl?.addEventListener('mousedown', (e) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (e.target.closest('input,textarea,select,button,.chip,.zavz-lock')) return;
      if (!windowEl) return;
      const rect = windowEl.getBoundingClientRect();
      windowEl.classList.add('positioned');
      windowEl.style.left = `${rect.left}px`;
      windowEl.style.top = `${rect.top}px`;

      isDragging = true;
      dragRect = { width: rect.width, height: rect.height };
      dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging || !windowEl) return;
      const maxX = window.innerWidth - dragRect.width;
      const maxY = window.innerHeight - dragRect.height;
      const x = clamp(e.clientX - dragOffset.x, 8, Math.max(8, maxX - 8));
      const y = clamp(e.clientY - dragOffset.y, 8, Math.max(8, maxY - 8));
      applyWindowPosition({ x, y });
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging || !windowEl) return;
      isDragging = false;
      const rect = windowEl.getBoundingClientRect();
      salvarWindowPos({ x: rect.left, y: rect.top });
    });

    function isTypingTarget(t){
      if (!t) return false;
      const tag = (t.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
      if (t.isContentEditable) return true;
      return false;
    }

    function parseShortcut(str) {
      if (!str) return null;
      const parts = String(str).split('+').map(p => p.trim().toLowerCase()).filter(Boolean);
      if (!parts.length) return null;
      const has = (key) => parts.includes(key);
      const keyPart = parts.find(p => !['ctrl', 'shift', 'alt', 'meta'].includes(p));
      return {
        ctrl: has('ctrl'),
        shift: has('shift'),
        alt: has('alt'),
        meta: has('meta'),
        key: keyPart || null
      };
    }

    function matchesShortcut(e, shortcut) {
      const parsed = parseShortcut(shortcut);
      if (!parsed || !parsed.key) return false;
      if (!!parsed.ctrl !== e.ctrlKey) return false;
      if (!!parsed.shift !== e.shiftKey) return false;
      if (!!parsed.alt !== e.altKey) return false;
      if (!!parsed.meta !== e.metaKey) return false;
      return e.key.toLowerCase() === parsed.key.toLowerCase();
    }

    function handleShortcut(mode) {
      if (!settings.enabled) {
        swEnabled.checked = true;
      }
      selectMode(mode);
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeUI();
      if (isTypingTarget(e.target)) return;

      if (matchesShortcut(e, settings.shortcuts?.toggleUI || 'Ctrl+I')) {
        e.preventDefault(); e.stopPropagation(); toggleUI();
        return;
      }
      if (matchesShortcut(e, settings.shortcuts?.quickEra)) {
        e.preventDefault(); e.stopPropagation(); handleShortcut('era'); return;
      }
      if (matchesShortcut(e, settings.shortcuts?.quickGoto)) {
        e.preventDefault(); e.stopPropagation(); handleShortcut('goto'); return;
      }
      if (matchesShortcut(e, settings.shortcuts?.quickFibertel)) {
        e.preventDefault(); e.stopPropagation(); handleShortcut('fibertel'); return;
      }
      if (matchesShortcut(e, settings.shortcuts?.quickBrtrix)) {
        e.preventDefault(); e.stopPropagation(); handleShortcut('brtrix'); return;
      }
    }, true);

    root.querySelector('#zavz-site-chip').addEventListener('click', () => {
      window.open('https://www.lucas-lima.xyz', '_blank', 'noopener,noreferrer');
    });

    const EASY_CMDS = {
      dockerPs: 'docker ps -a --format "{{.ID}}\t{{.Names}}"',
      date: 'date',
      tzdata: 'dpkg-reconfigure tzdata',
      pm2: 'pm2 restart app.chatbot',
      mongoRestart: 'systemctl restart mongod.service',
      mongoStart: 'systemctl start mongod.service',
      mongoStatus: 'systemctl status mongod.service',
      nginxTail: 'tail -f /var/log/nginx/error.log',
      nginxRestart: '/etc/init.d/nginx restart'
    };

    const containerIdInput = root.querySelector('#zavz-container-id');
    const cpContainerIdInput = root.querySelector('#zavz-cp-container-id');
    const cpSrcInput = root.querySelector('#zavz-cp-src');
    const cpDestInput = root.querySelector('#zavz-cp-dest');
    const cpFromContainerIdInput = root.querySelector('#zavz-cpfrom-container-id');
    const cpFromSrcInput = root.querySelector('#zavz-cpfrom-src');
    const cpFromDestInput = root.querySelector('#zavz-cpfrom-dest');
    const execPreviewEl = root.querySelector('#zavz-prev-exec');
    const cpPreviewEl = root.querySelector('#zavz-prev-cp');
    const cpFromPreviewEl = root.querySelector('#zavz-prev-cp-from');
    const permPathInput = root.querySelector('#zavz-perm-path');
    const permChownPreviewEl = root.querySelector('#zavz-prev-perm-chown');
    const permChmodPreviewEl = root.querySelector('#zavz-prev-perm-chmod');

    const formatDockerExec = (id) => `docker exec -u 0 -it ${(id || '').trim() || '<ID>'} /bin/bash`;
    const formatDockerCpTo = (srcRaw, destRaw, containerId, allowPlaceholder = false) => {
      const id = (containerId || '').trim() || (allowPlaceholder ? '<ID>' : '');
      const srcProvided = (srcRaw || '').trim();
      const destProvided = (destRaw || '').trim();
      const src = srcProvided
        ? (srcProvided.startsWith('/root/lucas/') || srcProvided.startsWith('/') ? srcProvided : `/root/lucas/${srcProvided}`)
        : (allowPlaceholder ? '/root/lucas/<arquivo>' : '');
      const destPath = destProvided
        ? (destProvided.startsWith('/') ? destProvided : `/${destProvided}`)
        : (allowPlaceholder ? '<destino>' : '');
      return `docker cp ${src} ${id}:${destPath}`;
    };
    const formatDockerCpFrom = (containerId, srcRaw, destRaw, allowPlaceholder = false) => {
      const id = (containerId || '').trim() || (allowPlaceholder ? '<ID>' : '');
      const srcProvided = (srcRaw || '').trim();
      const destProvided = (destRaw || '').trim();
      const normalizedSrc = srcProvided
        ? (srcProvided.includes(':') ? srcProvided : `${id}:${srcProvided.startsWith('/') ? srcProvided : `/${srcProvided}`}`)
        : (allowPlaceholder ? `${id}:<origem>` : '');
      const destPath = destProvided
        ? (destProvided.startsWith('/') ? destProvided : `/${destProvided}`)
        : (allowPlaceholder ? '<destino local>' : '');
      return `docker cp ${normalizedSrc} ${destPath}`;
    };
    const formatChown = (path, allowPlaceholder = false) => `chown www-data:www-data ${(path || '').trim() || (allowPlaceholder ? '<pasta ou arquivo>' : '')} -R`;
    const formatChmod = (path, allowPlaceholder = false) => `chmod 777 ${(path || '').trim() || (allowPlaceholder ? '<pasta ou arquivo>' : '')} -R`;

    function updateCommandPreviews() {
      if (execPreviewEl) execPreviewEl.textContent = formatDockerExec(containerIdInput?.value);
      if (cpPreviewEl) cpPreviewEl.textContent = formatDockerCpTo(cpSrcInput?.value, cpDestInput?.value, cpContainerIdInput?.value || containerIdInput?.value, true);
      if (cpFromPreviewEl) cpFromPreviewEl.textContent = formatDockerCpFrom(
        cpFromContainerIdInput?.value || cpContainerIdInput?.value || containerIdInput?.value,
        cpFromSrcInput?.value,
        cpFromDestInput?.value,
        true
      );
      if (permChownPreviewEl) permChownPreviewEl.textContent = formatChown(permPathInput?.value, true);
      if (permChmodPreviewEl) permChmodPreviewEl.textContent = formatChmod(permPathInput?.value, true);
    }

    containerIdInput?.addEventListener('input', () => {
      if (cpContainerIdInput && !cpContainerIdInput.value) cpContainerIdInput.value = containerIdInput.value;
      if (cpFromContainerIdInput && !cpFromContainerIdInput.value) cpFromContainerIdInput.value = containerIdInput.value;
      updateCommandPreviews();
    });

    cpFromContainerIdInput?.addEventListener('input', () => {
      if (containerIdInput && !containerIdInput.value) containerIdInput.value = cpFromContainerIdInput.value;
      if (cpContainerIdInput && !cpContainerIdInput.value) cpContainerIdInput.value = cpFromContainerIdInput.value;
      updateCommandPreviews();
    });

    [cpSrcInput, cpDestInput, cpContainerIdInput, cpFromSrcInput, cpFromDestInput, permPathInput].forEach((el) => {
      el?.addEventListener('input', updateCommandPreviews);
    });

    function copyCommand(text, label = 'Copiado!') {
      if (!text) return;
      navigator.clipboard?.writeText(text).catch(() => {});
      showAttemptBadge(label);
      setTimeout(hideAttemptBadge, 1400);
      addLog('CMD', label, text);
    }

    // Clear cache click
    root.querySelector('#zavz-clear-cache').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearSiteData();
    });

    root.querySelector('#zavz-cmd-docker-ps').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      copyCommand(EASY_CMDS.dockerPs, 'docker ps copiado');
    });

    root.querySelector('#zavz-cmd-docker-exec').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const containerId = (containerIdInput?.value || '').trim();
      if (!containerId) {
        showAttemptBadge('Informe o container ID');
        setTimeout(hideAttemptBadge, 1600);
        return;
      }
      const cmd = formatDockerExec(containerId);
      copyCommand(cmd, 'docker exec copiado');
      updateCommandPreviews();
    });

    root.querySelector('#zavz-cmd-docker-cp').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const srcRaw = (cpSrcInput?.value || '').trim();
      const destRaw = (cpDestInput?.value || '').trim();
      const containerId = (cpContainerIdInput?.value || containerIdInput?.value || '').trim();
      if (!srcRaw || !destRaw || !containerId) {
        showAttemptBadge('Preencha origem, destino e ID');
        setTimeout(hideAttemptBadge, 1600);
        return;
      }
      const cmd = formatDockerCpTo(srcRaw, destRaw, containerId);
      copyCommand(cmd, 'docker cp copiado');
      updateCommandPreviews();
    });

    root.querySelector('#zavz-cmd-docker-cp-from').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const srcRaw = (cpFromSrcInput?.value || '').trim();
      const destRaw = (cpFromDestInput?.value || '').trim();
      const containerId = (cpFromContainerIdInput?.value || cpContainerIdInput?.value || containerIdInput?.value || '').trim();
      const hasInlineId = srcRaw.includes(':');
      if ((!containerId && !hasInlineId) || !srcRaw || !destRaw) {
        showAttemptBadge('Informe ID, origem e destino');
        setTimeout(hideAttemptBadge, 1600);
        return;
      }
      const cmd = formatDockerCpFrom(containerId || '', srcRaw, destRaw);
      copyCommand(cmd, 'docker cp \u2190 copiado');
      updateCommandPreviews();
    });

    root.querySelector('#zavz-cmd-date').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      copyCommand(EASY_CMDS.date, 'date copiado');
    });
    root.querySelector('#zavz-cmd-tzdata').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      copyCommand(EASY_CMDS.tzdata, 'tzdata copiado');
    });
    root.querySelector('#zavz-cmd-pm2').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      copyCommand(EASY_CMDS.pm2, 'pm2 copiado');
    });

    root.querySelector('#zavz-cmd-mongo-restart').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      copyCommand(EASY_CMDS.mongoRestart, 'restart mongod copiado');
    });
    root.querySelector('#zavz-cmd-mongo-start').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      copyCommand(EASY_CMDS.mongoStart, 'start mongod copiado');
    });
    root.querySelector('#zavz-cmd-mongo-status').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      copyCommand(EASY_CMDS.mongoStatus, 'status mongod copiado');
    });

    root.querySelector('#zavz-cmd-nginx-tail').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      copyCommand(EASY_CMDS.nginxTail, 'tail nginx copiado');
    });

    root.querySelector('#zavz-cmd-nginx-restart').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      copyCommand(EASY_CMDS.nginxRestart, 'restart nginx copiado');
    });

    root.querySelector('#zavz-cmd-chown-www').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const alvo = (permPathInput?.value || '').trim();
      if (!alvo) {
        showAttemptBadge('Informe o caminho');
        setTimeout(hideAttemptBadge, 1600);
        return;
      }
      const cmd = formatChown(alvo);
      copyCommand(cmd, 'chown copiado');
      updateCommandPreviews();
    });

    root.querySelector('#zavz-cmd-chmod-777').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const alvo = (permPathInput?.value || '').trim();
      if (!alvo) {
        showAttemptBadge('Informe o caminho');
        setTimeout(hideAttemptBadge, 1600);
        return;
      }
      const cmd = formatChmod(alvo);
      copyCommand(cmd, 'chmod copiado');
      updateCommandPreviews();
    });

    // Omni Domain UI hook
    const omniUI = {
      input: root.querySelector('#zavz-omni-input'),
      status: root.querySelector('#zavz-omni-status'),
      lastIP: null,
      lastDomain: settings.omniDomainLast || null
    };
    if (settings.omniDomainLast) omniUI.input.value = settings.omniDomainLast;

    const pabxUI = {
      input: root.querySelector('#zavz-pabx-input'),
      status: root.querySelector('#zavz-pabx-status'),
      lastIP: null,
      lastDomain: settings.pabxDomainLast || null
    };
    if (settings.pabxDomainLast) pabxUI.input.value = settings.pabxDomainLast;

    const certOmniUI = {
      status: root.querySelector('#zavz-cert-omni-status')
    };
    const certPabxUI = {
      status: root.querySelector('#zavz-cert-pabx-status')
    };
    setDomainStatus(certOmniUI, CERT_STATUS_OMNI_DEFAULT);
    setDomainStatus(certPabxUI, CERT_STATUS_PABX_DEFAULT);

    logViewerEl = root.querySelector('#zavz-log-viewer');
    renderLogs();
    renderRecentActions();
    renderStatusHistory();
    updateCommandPreviews();

    const waStatusEl = root.querySelector('#zavz-wa-status');
    const waCommitEl = root.querySelector('#zavz-wa-commit');
    const waCheckBtn = root.querySelector('#zavz-wa-check');
    const waNightlyBtn = root.querySelector('#zavz-wa-nightly');
    const waOpenBtn = root.querySelector('#zavz-wa-open');
    const waDocsBtn = root.querySelector('#zavz-wa-docs');

    const statusGithubBtn = root.querySelector('#zavz-status-github');
    const statusGithubOpen = root.querySelector('#zavz-status-github-open');
    const statusGithubText = root.querySelector('#zavz-status-github-text');
    const statusGupshupBtn = root.querySelector('#zavz-status-gupshup');
    const statusGupshupOpen = root.querySelector('#zavz-status-gupshup-open');
    const statusGupshupText = root.querySelector('#zavz-status-gupshup-text');
    const statusWhatsappBtn = root.querySelector('#zavz-status-whatsapp');
    const statusWhatsappOpen = root.querySelector('#zavz-status-whatsapp-open');
    const statusWhatsappText = root.querySelector('#zavz-status-whatsapp-text');
    const statusClaudeBtn = root.querySelector('#zavz-status-claude');
    const statusClaudeOpen = root.querySelector('#zavz-status-claude-open');
    const statusClaudeText = root.querySelector('#zavz-status-claude-text');
    const statusOpenAIBtn = root.querySelector('#zavz-status-openai');
    const statusOpenAIOpen = root.querySelector('#zavz-status-openai-open');
    const statusOpenAIText = root.querySelector('#zavz-status-openai-text');
    const statusGeminiBtn = root.querySelector('#zavz-status-gemini');
    const statusGeminiOpen = root.querySelector('#zavz-status-gemini-open');
    const statusGeminiText = root.querySelector('#zavz-status-gemini-text');
    const statusTwitterBtn = root.querySelector('#zavz-status-twitter');
    const statusTwitterOpen = root.querySelector('#zavz-status-twitter-open');
    const statusTwitterText = root.querySelector('#zavz-status-twitter-text');

    const fdpStatusEl = root.querySelector('#zavz-fdp-status');
    const fdpCommitEl = root.querySelector('#zavz-fdp-commit');
    const fdpReleaseBtn = root.querySelector('#zavz-fdp-release');
    const fdpCommitBtn = root.querySelector('#zavz-fdp-commit');
    const fdpOpenBtn = root.querySelector('#zavz-fdp-open');
    const fdpSiteBtn = root.querySelector('#zavz-fdp-site');

    async function handleWhatsappVersionCheck() {
      if (!waStatusEl) return;
      waStatusEl.textContent = 'Buscando última release...';
      waStatusEl.style.color = 'var(--muted)';
      try {
        const rel = await fetchLatestGithubRelease('pedroslopez/whatsapp-web.js');
        const dateText = rel.date ? new Date(rel.date).toLocaleDateString('pt-BR') : 'data desconhecida';
        waStatusEl.textContent = `\u00daltima vers\u00e3o: ${rel.tag} (${dateText})`;
        waStatusEl.style.color = '#7CFF9B';
        addLog('INFO', 'whatsapp-web.js', `${rel.tag} em ${dateText}`);
      } catch (err) {
        waStatusEl.textContent = `Falha ao buscar: ${err?.message || err}`;
        waStatusEl.style.color = '#ff8a8a';
        addLog('ERROR', 'whatsapp-web.js', err?.message || String(err));
      }
    }

    async function handleWhatsappCommitCheck() {
      if (!waCommitEl) return;
      waCommitEl.textContent = 'Buscando commit mais recente...';
      try {
        const commit = await fetchLatestGithubCommit('pedroslopez/whatsapp-web.js');
        const dateText = commit.date ? new Date(commit.date).toLocaleString('pt-BR') : 'data desconhecida';
        waCommitEl.textContent = `Nightly: ${commit.shortSha} (${dateText}) \u2014 ${commit.message.split('\n')[0] || ''}`;
        addLog('INFO', 'whatsapp-web.js commit', `${commit.shortSha} @ ${dateText}`);
      } catch (err) {
        waCommitEl.textContent = `Falha ao buscar commit: ${err?.message || err}`;
        addLog('ERROR', 'whatsapp-web.js commit', err?.message || String(err));
      }
    }

    async function handleFdpRelease() {
      if (!fdpStatusEl) return;
      fdpStatusEl.textContent = 'Buscando última release...';
      try {
        const rel = await fetchLatestGithubRelease('SkidderMC/FDPClient');
        const dateText = rel.date ? new Date(rel.date).toLocaleDateString('pt-BR') : 'data desconhecida';
        fdpStatusEl.textContent = `\u00daltima vers\u00e3o: ${rel.tag} (${dateText})`;
        addLog('INFO', 'FDPClient release', `${rel.tag} em ${dateText}`);
      } catch (err) {
        fdpStatusEl.textContent = `Falha ao buscar: ${err?.message || err}`;
        addLog('ERROR', 'FDPClient release', err?.message || String(err));
      }
    }

    async function handleFdpCommit() {
      if (!fdpCommitEl) return;
      fdpCommitEl.textContent = 'Buscando commit mais recente...';
      try {
        const commit = await fetchLatestGithubCommit('SkidderMC/FDPClient');
        const dateText = commit.date ? new Date(commit.date).toLocaleString('pt-BR') : 'data desconhecida';
        fdpCommitEl.textContent = `Nightly: ${commit.shortSha} (${dateText}) \u2014 ${commit.message.split('\n')[0] || ''}`;
        addLog('INFO', 'FDPClient commit', `${commit.shortSha} @ ${dateText}`);
      } catch (err) {
        fdpCommitEl.textContent = `Falha ao buscar commit: ${err?.message || err}`;
        addLog('ERROR', 'FDPClient commit', err?.message || String(err));
      }
    }

    waCheckBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleWhatsappVersionCheck();
    });

    waNightlyBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleWhatsappCommitCheck();
    });

    waOpenBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open('https://github.com/pedroslopez/whatsapp-web.js', '_blank', 'noopener,noreferrer');
    });

    waDocsBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open('https://docs.wwebjs.dev/', '_blank', 'noopener,noreferrer');
    });

    statusGithubBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      checkStatusApi('GitHub', ['https://www.githubstatus.com/api/v2/status.json', 'https://www.githubstatus.com/api/v2/summary.json'], statusGithubText);
    });

    statusGithubOpen?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open('https://www.githubstatus.com/', '_blank', 'noopener,noreferrer');
    });

    statusGupshupBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      checkStatusApi('Gupshup', ['https://status.gupshup.io/api/v2/status.json', 'https://status.gupshup.io/api/v2/summary.json'], statusGupshupText);
    });

    statusGupshupOpen?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open('https://status.gupshup.io/', '_blank', 'noopener,noreferrer');
    });

    statusWhatsappBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      checkStatusApi('WhatsApp', ['https://status.whatsapp.com/api/v2/status.json', 'https://status.whatsapp.com/api/v2/summary.json'], statusWhatsappText);
    });

    statusWhatsappOpen?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open('https://status.whatsapp.com/', '_blank', 'noopener,noreferrer');
    });

    statusClaudeBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      checkStatusApi('Claude', 'https://status.anthropic.com/api/v2/status.json', statusClaudeText);
    });

    statusClaudeOpen?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open('https://status.anthropic.com/', '_blank', 'noopener,noreferrer');
    });

    statusOpenAIBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      checkStatusApi('OpenAI', 'https://status.openai.com/api/v2/status.json', statusOpenAIText);
    });

    statusOpenAIOpen?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open('https://status.openai.com/', '_blank', 'noopener,noreferrer');
    });

    statusGeminiBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      checkStatusApi('Gemini', ['https://status.cloud.google.com/summary.json', 'https://status.cloud.google.com/incidents.json'], statusGeminiText);
    });

    statusGeminiOpen?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open('https://status.cloud.google.com/', '_blank', 'noopener,noreferrer');
    });

    statusTwitterBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      checkStatusApi('Twitter', 'https://status.twitterstat.us/api/v2/status.json', statusTwitterText);
    });

    statusTwitterOpen?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open('https://status.twitterstat.us/', '_blank', 'noopener,noreferrer');
    });

    fdpReleaseBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleFdpRelease();
    });

    fdpCommitBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleFdpCommit();
    });

    fdpOpenBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open('https://github.com/SkidderMC/FDPClient', '_blank', 'noopener,noreferrer');
    });

    fdpSiteBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open('https://fdpinfo.github.io/', '_blank', 'noopener,noreferrer');
    });

    const currentHostDomain = () => cleanDomain(location.hostname || location.host || location.origin || '');

    root.querySelector('#zavz-cert-omni').addEventListener('click', async (e) => {
      e.preventDefault(); e.stopPropagation();
      const alvo = omniUI.input.value || settings.omniDomainLast || location.hostname;
      await validateCert(alvo, certOmniUI, 'omniDomainLast');
    });

    root.querySelector('#zavz-cert-pabx').addEventListener('click', async (e) => {
      e.preventDefault(); e.stopPropagation();
      const alvo = pabxUI.input.value || pabxUI.lastDomain || currentHostDomain();
      await validateCert(alvo, certPabxUI, 'pabxDomainLast');
    });

    root.querySelector('#zavz-omni-detect').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      detectarOmniDomain(omniUI);
    });

    root.querySelector('#zavz-omni-ping').addEventListener('click', async (e) => {
      e.preventDefault(); e.stopPropagation();
      const alvo = omniUI.input.value || settings.omniDomainLast || location.hostname;
      await pingDomain(alvo, omniUI, 'IP de', 'omniDomainLast');
    });

    root.querySelector('#zavz-omni-test').addEventListener('click', async (e) => {
      e.preventDefault(); e.stopPropagation();
      const alvo = omniUI.input.value || settings.omniDomainLast || location.hostname;
      await testConnection(alvo, omniUI);
    });

    root.querySelector('#zavz-omni-copy').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const v = (omniUI.input.value || '').trim();
      if (!v) {
        setDomainStatus(omniUI, 'Nada para copiar.', '#ff8a8a');
        return;
      }
      omniUI.lastDomain = v;
      navigator.clipboard?.writeText(v).catch(()=>{});
      setDomainStatus(omniUI, 'Copiado \u2713', '#7CFF9B');
      setTimeout(() => setDomainStatus(omniUI, OMNI_STATUS_DEFAULT), 1200);
    });

    root.querySelector('#zavz-omni-copy-ip').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const ip = omniUI.lastIP;
      if (!ip) {
        setDomainStatus(omniUI, 'Pingue primeiro para copiar o IP.', '#ff8a8a');
        return;
      }
      navigator.clipboard?.writeText(ip).catch(()=>{});
      setDomainStatus(omniUI, 'IP copiado \u2713', '#7CFF9B');
      setTimeout(() => setDomainStatus(omniUI, OMNI_STATUS_DEFAULT), 1200);
    });

    // PABX Domain UI hook
    root.querySelector('#zavz-pabx-get').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const host = currentHostDomain();
      pabxUI.input.value = host;
      pabxUI.lastDomain = host;
      pabxUI.lastIP = null;
      settings.pabxDomainLast = host;
      salvarSettings();
      setDomainStatus(pabxUI, `Domínio atual: ${host}`, '#7CFF9B');
    });

    root.querySelector('#zavz-pabx-ping').addEventListener('click', async (e) => {
      e.preventDefault(); e.stopPropagation();
      const alvo = pabxUI.input.value || pabxUI.lastDomain || currentHostDomain();
      await pingDomain(alvo, pabxUI, 'IP do PABX', 'pabxDomainLast');
    });

    root.querySelector('#zavz-pabx-test').addEventListener('click', async (e) => {
      e.preventDefault(); e.stopPropagation();
      const alvo = pabxUI.input.value || pabxUI.lastDomain || currentHostDomain();
      await testConnection(alvo, pabxUI);
    });

    root.querySelector('#zavz-pabx-copy').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const v = cleanDomain(pabxUI.input.value || pabxUI.lastDomain || '');
      if (!v) {
        setDomainStatus(pabxUI, 'Nada para copiar.', '#ff8a8a');
        return;
      }
      pabxUI.lastDomain = v;
      navigator.clipboard?.writeText(v).catch(()=>{});
      setDomainStatus(pabxUI, 'Copiado \u2713', '#7CFF9B');
      setTimeout(() => setDomainStatus(pabxUI, PABX_STATUS_DEFAULT), 1200);
    });

    root.querySelector('#zavz-pabx-copy-ip').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const ip = pabxUI.lastIP;
      if (!ip) {
        setDomainStatus(pabxUI, 'Pingue primeiro para copiar o IP.', '#ff8a8a');
        return;
      }
      navigator.clipboard?.writeText(ip).catch(()=>{});
      setDomainStatus(pabxUI, 'IP copiado \u2713', '#7CFF9B');
      setTimeout(() => setDomainStatus(pabxUI, PABX_STATUS_DEFAULT), 1200);
    });

    root.querySelector('#zavz-log-clear').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      siteLogs.length = 0;
      renderLogs();
    });

    root.querySelector('#zavz-log-refresh').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      renderLogs();
    });

    const navItems = [...root.querySelectorAll('.zavz-nav-item')];
    const panels   = [...root.querySelectorAll('.panel')];

    function setActivePanel(id){
      activePanelId = id;
      Object.values(requestGuards).forEach((guard) => { guard.canceled = true; });
      navItems.forEach(x => x.classList.toggle('active', x.dataset.panel === id));
      panels.forEach(p => p.classList.toggle('active', p.dataset.panelId === id));
      applySearch();
    }
    navItems.forEach(item => item.addEventListener('click', () => setActivePanel(item.dataset.panel)));

    const slider = root.querySelector('.zavz-slider');
    const pill   = slider.parentElement.querySelector('.zavz-pill');

    function paintSlider(el){
      if (!el) return;
      const min = Number(el.min || 0);
      const max = Number(el.max || 100);
      const val = Number(el.value || 0);
      const denom = (max - min) || 1;
      const pct = clampNumber(((val - min) / denom) * 100, 0, 100);
      const pctText = `${pct.toFixed(2)}%`;

      // Use layered backgrounds so Accent FX can affect sliders too (fade/rainbow/two).
      el.style.backgroundImage = `var(--accent-grad), linear-gradient(var(--off), var(--off))`;
      el.style.backgroundSize = `${pctText} 100%, 100% 100%`;
      el.style.backgroundPosition = 'left, left';
      el.style.backgroundRepeat = 'no-repeat';
    }
    function updateSlider(){
      pill.textContent = `${slider.value} ms`;
      paintSlider(slider);
    }
    slider.addEventListener('input', () => {
      updateSlider();
      settings.delay = Number(slider.value);
      salvarSettings();
      updateUIStatus();
    });

    const searchInput = root.querySelector('.zavz-search');
    function getActivePanel(){
      return panels.find(p => p.dataset.panelId === activePanelId);
    }
    function applySearch() {
      const panel = getActivePanel();
      if (!panel) return;
      const q = (searchInput.value || '').trim().toLowerCase();
      const rows = [...panel.querySelectorAll('.setting-row')];
      const emptyLine = panel.querySelector('[data-empty]');
      if (!rows.length){
        if (emptyLine) emptyLine.style.display = 'none';
        return;
      }
      let visible = 0;
      rows.forEach(r => {
        const label = (r.getAttribute('data-label') || '').toLowerCase();
        const text  = (r.querySelector('.zavz-label')?.textContent || '').toLowerCase();
        const match = !q || label.includes(q) || text.includes(q);
        r.style.display = match ? 'flex' : 'none';
        if (match) visible++;
      });
      if (emptyLine) emptyLine.style.display = visible ? 'none' : 'block';
    }
    searchInput.addEventListener('input', applySearch);

    const swEnabled = root.querySelector('.setting-row[data-label="enabled"] input[type="checkbox"]');
    const swGoto    = root.querySelector('.setting-row[data-label="goto"] input[type="checkbox"]');
    const swEra     = root.querySelector('.setting-row[data-label="era"] input[type="checkbox"]');
    const swFibertel = root.querySelector('.setting-row[data-label="fibertel"] input[type="checkbox"]');
    const swBrtrix = root.querySelector('.setting-row[data-label="brtrix"] input[type="checkbox"]');
    const swAutoDetect = root.querySelector('#zavz-auto-detect');
    const swAutoDetectAnyDomain = root.querySelector('#zavz-auto-detect-any-domain');
    const swSmartAttempts = root.querySelector('#zavz-smart-attempts');
    const swPerformance = root.querySelector('#zavz-performance-mode');
    const swHideFab = root.querySelector('.setting-row[data-label="hideicon"] input[type="checkbox"]');
    const swAllowAll = root.querySelector('#zavz-allow-all-domains');
    const swShowPass = root.querySelector('#zavz-show-pass-hover');
    const uiScaleSlider = root.querySelector('#zavz-ui-scale');
    const uiScalePill = root.querySelector('#zavz-ui-scale-pill');
    const uiScaleAutoInput = root.querySelector('#zavz-ui-scale-auto');
    const themeModeSelect = root.querySelector('#zavz-theme-mode');
    const themeModeButtons = [...root.querySelectorAll('.zavz-theme-mode[data-theme-mode]')];
    const themeHueInput = root.querySelector('#zavz-theme-hue');
    const themeHexInput = root.querySelector('#zavz-theme-hex');
    const themeColorInput = root.querySelector('#zavz-theme-color');
    const themeHex2Input = root.querySelector('#zavz-theme-hex-2');
    const themeColor2Input = root.querySelector('#zavz-theme-color-2');
    const themeCustomBtn = root.querySelector('#zavz-theme-custom');
    const themeGlowInput = root.querySelector('#zavz-theme-glow');
    const themeApplyBtn = root.querySelector('#zavz-theme-apply');
    const themeResetBtn = root.querySelector('#zavz-theme-reset');
    const themeLabEl = root.querySelector('#zavz-theme-lab');
    const themePreviewEl = root.querySelector('#zavz-theme-preview');
    const themePreviewBtn = root.querySelector('#zavz-theme-preview-btn');
    const themePresetButtons = [...root.querySelectorAll('.zavz-theme-preset[data-theme-preset]')];
    const themeFxButtons = [...root.querySelectorAll('.zavz-theme-fx[data-accent-style]')];
    const themeSwatchAddBtn = root.querySelector('#zavz-theme-swatch-add');
    const themeSwatchesEl = root.querySelector('#zavz-theme-swatches');

    const profileNameInput = root.querySelector('#zavz-profile-name');
    const profileModeSelect = root.querySelector('#zavz-profile-mode');
    const profileDomainsInput = root.querySelector('#zavz-profile-domains');
    const profileSaveBtn = root.querySelector('#zavz-profile-save');
    const profileApplyBtn = root.querySelector('#zavz-profile-apply');
    const profileDeleteBtn = root.querySelector('#zavz-profile-delete');
    const profileStatusEl = root.querySelector('#zavz-profile-status');
    const profileListEl = root.querySelector('#zavz-profile-list');

    const favDomainInput = root.querySelector('#zavz-fav-domain');
    const favAddBtn = root.querySelector('#zavz-fav-add');
    const favListEl = root.querySelector('#zavz-fav-list');

    const configTextarea = root.querySelector('#zavz-config-json');
    const configExportBtn = root.querySelector('#zavz-config-export');
    const configImportBtn = root.querySelector('#zavz-config-import');
    const configStatusEl = root.querySelector('#zavz-config-status');

    const shortcutToggleInput = root.querySelector('#zavz-shortcut-toggle');
    const shortcutEraInput = root.querySelector('#zavz-shortcut-era');
    const shortcutGotoInput = root.querySelector('#zavz-shortcut-goto');
    const shortcutFibertelInput = root.querySelector('#zavz-shortcut-fibertel');
    const shortcutBrtrixInput = root.querySelector('#zavz-shortcut-brtrix');
    const shortcutSaveBtn = root.querySelector('#zavz-shortcut-save');

    window.__zavz_ref = { swEnabled, swEra, swGoto, swFibertel, swBrtrix };

    swEnabled.checked = !!settings.enabled;
    swGoto.checked    = !!settings.goto;
    swEra.checked     = !!settings.era;
    swFibertel.checked     = !!settings.fibertel;
    swBrtrix.checked     = !!settings.brtrix;
    if (swAutoDetect) swAutoDetect.checked = !!settings.autoDetectMode;
    if (swAutoDetectAnyDomain) swAutoDetectAnyDomain.checked = !!settings.autoDetectAnyDomain;
    if (swSmartAttempts) swSmartAttempts.checked = !!settings.smartAttempts;
    if (swPerformance) swPerformance.checked = !!settings.performanceMode;
    swHideFab.checked = !!settings.hideFab;
    if (swAllowAll) swAllowAll.checked = !!settings.allowAllDomains;
    if (swShowPass) swShowPass.checked = !!settings.showPasswordHover;
    if (uiScaleSlider) uiScaleSlider.value = String(Math.round(settings.uiScale * 100));
    if (uiScaleAutoInput) uiScaleAutoInput.checked = !!settings.uiScaleAuto;

    if (shortcutToggleInput) shortcutToggleInput.value = settings.shortcuts?.toggleUI || '';
    if (shortcutEraInput) shortcutEraInput.value = settings.shortcuts?.quickEra || '';
    if (shortcutGotoInput) shortcutGotoInput.value = settings.shortcuts?.quickGoto || '';
    if (shortcutFibertelInput) shortcutFibertelInput.value = settings.shortcuts?.quickFibertel || '';
    if (shortcutBrtrixInput) shortcutBrtrixInput.value = settings.shortcuts?.quickBrtrix || '';

    slider.value = String(settings.delay ?? 180);
    updateSlider();

    function getWindowBaseSize(viewWidth, viewHeight) {
      const vw = Math.max(1, Number(viewWidth) || 1);
      const vh = Math.max(1, Number(viewHeight) || 1);
      if (vw <= 700) {
        return { w: vw * 0.96, h: vh * 0.96 };
      }
      if (vw <= 1080) {
        return {
          w: Math.min(990, vw * 0.96),
          h: Math.min(920, vh * 0.95)
        };
      }
      return {
        w: Math.min(1240, vw * 0.95),
        h: Math.min(790, vh * 0.94)
      };
    }

    function computeUiScale() {
      const desired = normalizeUiScale(settings.uiScale);
      if (!settings.uiScaleAuto) return desired;

      const margin = 24;
      const base = getWindowBaseSize(window.innerWidth, window.innerHeight);
      const fit = Math.min(
        (window.innerWidth - margin * 2) / base.w,
        (window.innerHeight - margin * 2) / base.h,
        1
      );
      return clampNumber(Math.min(desired, fit), UI_SCALE_MIN, UI_SCALE_MAX);
    }

    function applyUiScale() {
      const scale = computeUiScale();
      root.style.setProperty('--ui-scale', String(scale));
      const pctText = `${Math.round(scale * 100)}%`;
      if (uiScalePill) {
        if (uiScalePill instanceof HTMLInputElement) uiScalePill.value = pctText;
        else uiScalePill.textContent = pctText;
      }
      if (uiScaleSlider) paintSlider(uiScaleSlider);

      if (windowEl?.classList.contains('positioned')) {
        const rect = windowEl.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        const x = clampNumber(rect.left, 8, Math.max(8, maxX - 8));
        const y = clampNumber(rect.top, 8, Math.max(8, maxY - 8));
        windowEl.style.left = `${x}px`;
        windowEl.style.top = `${y}px`;
      }
    }

    let themeDraft = normalizeThemeSettings(settings.theme);

    function renderThemeControls(themeState) {
      if (themeModeSelect) themeModeSelect.value = themeState.mode;
      themeModeButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.themeMode === themeState.mode);
      });
      if (themeHueInput) themeHueInput.value = String(themeState.customHue);
      if (themeHexInput) themeHexInput.value = themeState.customHex;
      if (themeColorInput) themeColorInput.value = String(themeState.customHex || '').toLowerCase();
      if (themeHex2Input) themeHex2Input.value = themeState.customHex2;
      if (themeColor2Input) themeColor2Input.value = String(themeState.customHex2 || '').toLowerCase();
      if (themeGlowInput) themeGlowInput.checked = !!themeState.glow;
      if (themeCustomBtn) themeCustomBtn.classList.toggle('active', !!themeState.useCustom);
      themePresetButtons.forEach((btn) => {
        btn.classList.toggle('active', !themeState.useCustom && btn.dataset.themePreset === themeState.preset);
      });
      themeFxButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.accentStyle === themeState.accentStyle);
      });
      if (themeSwatchesEl) {
        const colors = Array.isArray(themeState.savedColors) ? themeState.savedColors : [];
        setHTML(themeSwatchesEl, colors.map((color) => `
          <button type="button" class="zavz-theme-swatch" data-swatch="${escapeHtml(color)}" style="--swatch:${escapeHtml(color)};" aria-label="${escapeHtml(color)}"></button>
        `).join(''));
      }
    }

    function applyTheme(themeState) {
      const normalized = normalizeThemeSettings(themeState);
      const palette = createThemePalette(normalized);
      const vars = {
        '--bg': palette.bg,
        '--bg-2': palette.bg2,
        '--bg-3': palette.bg3,
        '--bg-4': palette.bg4,
        '--line': palette.line,
        '--line-2': palette.line2,
        '--text': palette.text,
        '--muted': palette.muted,
        '--accent': palette.accent,
        '--accent-2': palette.accent2,
        '--accent-a08': palette.accentA08,
        '--accent-a12': palette.accentA12,
        '--accent-a18': palette.accentA18,
        '--accent-a24': palette.accentA24,
        '--accent-a35': palette.accentA35,
        '--accent-a55': palette.accentA55,
        '--accent-a75': palette.accentA75,
        '--accent2-a18': palette.accent2A18,
        '--accent2-a24': palette.accent2A24,
        '--overlay-glow-1': palette.overlayGlow1,
        '--overlay-glow-2': palette.overlayGlow2,
        '--off': palette.off
      };
      Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
      root.setAttribute('data-accent-style', normalized.accentStyle);

      if (fab) {
        fab.style.boxShadow = palette.glowShadow;
        fab.style.removeProperty('animation');
        fab.style.removeProperty('background-size');

        if (normalized.accentStyle === 'rainbow') {
          fab.style.background = 'linear-gradient(90deg,#ff004d,#ff7a00,#ffe600,#2dff74,#00c2ff,#7a5cff,#ff00f7,#ff004d)';
          fab.style.backgroundSize = '400% 400%';
          fab.style.animation = 'zavzRainbowShift 7.5s linear infinite';
        } else if (normalized.accentStyle === 'fade') {
          fab.style.background = `linear-gradient(90deg,${palette.accent} 0%,${palette.accent2} 50%,${palette.accent} 100%)`;
          fab.style.backgroundSize = '200% 200%';
          fab.style.animation = 'zavzAccentShift 3.6s ease-in-out infinite';
        } else if (normalized.accentStyle === 'two') {
          fab.style.background = `linear-gradient(140deg,${palette.fabStart} 0%,${palette.accent} 48%,${palette.accent2} 100%)`;
        } else {
          fab.style.background = `linear-gradient(140deg,${palette.fabStart} 0%,${palette.fabMid} 48%,${palette.fabEnd} 100%)`;
        }
      }

      if (themeLabEl) {
        themeLabEl.style.setProperty('--theme-preview-accent', palette.accent);
        themeLabEl.style.setProperty('--theme-preview-accent-2', palette.accent2);
        themeLabEl.style.setProperty('--theme-preview-shadow', normalized.glow ? palette.glowShadow : 'none');
        themeLabEl.classList.toggle('no-glow', !normalized.glow);
      }

      if (themePreviewEl) {
        themePreviewEl.style.borderColor = rgbaFromHex(palette.accent, 0.34);
      }
      if (themePreviewBtn) {
        themePreviewBtn.style.boxShadow = normalized.glow ? palette.glowShadow : 'none';
      }
    }

    function setThemeDraft(nextTheme) {
      themeDraft = normalizeThemeSettings(nextTheme);
      renderThemeControls(themeDraft);
      applyTheme(themeDraft);
    }

    setThemeDraft(themeDraft);
    applyUiScale();

    function refreshSettingsUI() {
      swEnabled.checked = !!settings.enabled;
      swGoto.checked = !!settings.goto;
      swEra.checked = !!settings.era;
      swFibertel.checked = !!settings.fibertel;
      swBrtrix.checked = !!settings.brtrix;
      if (swAutoDetect) swAutoDetect.checked = !!settings.autoDetectMode;
      if (swAutoDetectAnyDomain) swAutoDetectAnyDomain.checked = !!settings.autoDetectAnyDomain;
      if (swSmartAttempts) swSmartAttempts.checked = !!settings.smartAttempts;
      if (swPerformance) swPerformance.checked = !!settings.performanceMode;
      swHideFab.checked = !!settings.hideFab;
      if (swAllowAll) swAllowAll.checked = !!settings.allowAllDomains;
      if (swShowPass) swShowPass.checked = !!settings.showPasswordHover;
      if (uiScaleSlider) uiScaleSlider.value = String(Math.round(settings.uiScale * 100));
      if (uiScaleAutoInput) uiScaleAutoInput.checked = !!settings.uiScaleAuto;
      slider.value = String(settings.delay ?? 180);
      updateSlider();
      if (shortcutToggleInput) shortcutToggleInput.value = settings.shortcuts?.toggleUI || '';
      if (shortcutEraInput) shortcutEraInput.value = settings.shortcuts?.quickEra || '';
      if (shortcutGotoInput) shortcutGotoInput.value = settings.shortcuts?.quickGoto || '';
      if (shortcutFibertelInput) shortcutFibertelInput.value = settings.shortcuts?.quickFibertel || '';
      if (shortcutBrtrixInput) shortcutBrtrixInput.value = settings.shortcuts?.quickBrtrix || '';
      setThemeDraft(settings.theme);
      applyUiScale();
    }

    function syncSettings(){
      settings.enabled = swEnabled.checked;
      settings.goto    = swGoto.checked;
      settings.era     = swEra.checked;
      settings.fibertel     = swFibertel.checked;
      settings.brtrix = swBrtrix.checked;
      settings.autoDetectMode = swAutoDetect?.checked ?? settings.autoDetectMode;
      settings.autoDetectAnyDomain = swAutoDetectAnyDomain?.checked ?? settings.autoDetectAnyDomain;
      settings.smartAttempts = swSmartAttempts?.checked ?? settings.smartAttempts;
      settings.performanceMode = swPerformance?.checked ?? settings.performanceMode;
      settings.delay   = Number(slider.value);
      settings.hideFab = swHideFab.checked;
      settings.allowAllDomains = swAllowAll?.checked ?? settings.allowAllDomains;
      settings.showPasswordHover = swShowPass?.checked ?? settings.showPasswordHover;
      salvarSettings();
    }

    function applyFabVisibility(){
      fab.style.display = settings.hideFab ? 'none' : 'grid';
    }

    function renderFavoriteDomains() {
      if (!favListEl) return;
      const domains = Array.isArray(settings.favoriteDomains) ? settings.favoriteDomains : [];
      if (!domains.length) {
        setHTML(favListEl, '<div class="zavz-empty">Nenhum domínio favorito.</div>');
        return;
      }
      setHTML(favListEl, domains.map((domain) => `
        <div class="zavz-log-entry" data-domain="${escapeHtml(domain)}">
          <div class="zavz-log-head">
            <span class="zavz-log-pill info">DOMÍNIO</span>
            <span class="zavz-log-time">${escapeHtml(domain)}</span>
          </div>
          <div class="zavz-mini-actions" style="margin-top:6px;">
            <button class="zavz-btn zavz-btn-danger" data-action="remove">REMOVER</button>
          </div>
        </div>
      `).join(''));
    }

    function renderProfileStatus() {
      const domainKey = getCurrentDomainKey();
      const domainProfile = findProfileForDomain(domainKey);
      const active = getActiveProfile();
      if (profileStatusEl) {
        const parts = [];
        if (domainProfile) parts.push(`Domínio: ${domainProfile.name} (${domainProfile.mode.toUpperCase()})`);
        if (active && (!domainProfile || active.id !== domainProfile.id)) {
          parts.push(`Ativo: ${active.name} (${active.mode.toUpperCase()})`);
        }
        profileStatusEl.textContent = parts.length ? parts.join(' · ') : 'Nenhum perfil selecionado.';
      }
    }

    function renderProfileList() {
      if (!profileListEl) return;
      const list = Array.isArray(settings.profiles) ? settings.profiles : [];
      if (!list.length) {
        setHTML(profileListEl, '<div class="zavz-empty">Nenhum perfil salvo.</div>');
        return;
      }

      const domainKey = getCurrentDomainKey();
      const domainProfile = findProfileForDomain(domainKey);
      const active = getActiveProfile();

      setHTML(profileListEl, list.map((profile) => {
        const isDomain = domainProfile?.id && domainProfile.id === profile.id;
        const isActive = active?.id && active.id === profile.id;
        const classes = [
          'zavz-profile-chip',
          isDomain ? 'domain' : '',
          isActive ? 'active' : ''
        ].filter(Boolean).join(' ');
        const mode = String(profile.mode || '').toUpperCase();
        return `
          <button type="button" class="${classes}" data-profile-id="${escapeHtml(profile.id)}" title="${escapeHtml(mode)}">
            <span class="title">${escapeHtml(profile.name || 'Profile')}</span>
            <span class="meta">${escapeHtml(mode)}</span>
          </button>
        `;
      }).join(''));
    }

    function selectMode(mode) {
      swAutoDetect && (swAutoDetect.checked = false);
      swEra.checked = mode === 'era';
      swGoto.checked = mode === 'goto';
      swFibertel.checked = mode === 'fibertel';
      swBrtrix.checked = mode === 'brtrix';
      syncSettings();
      parar(true);
      if (deveMostrarBotoes()) iniciar(mode);
      updateUIStatus();
    }

    function disableAutoDetectIfNeeded() {
      if (swAutoDetect?.checked) {
        swAutoDetect.checked = false;
        syncSettings();
      }
    }

    function commitThemeSettings() {
      settings.theme = normalizeThemeSettings(themeDraft);
      salvarSettings();
      setThemeDraft(settings.theme);
      showAttemptBadge('Tema aplicado \u2713');
      setTimeout(hideAttemptBadge, 1200);
    }

    function resetThemeDraft() {
      setThemeDraft(settings.theme);
    }

    function commitUiScalePill() {
      if (!(uiScalePill instanceof HTMLInputElement)) return;
      const raw = String(uiScalePill.value || '').trim().replace(',', '.');
      const match = raw.match(/-?\d+(\.\d+)?/);
      if (!match) {
        applyUiScale();
        return;
      }
      const num = Number(match[0]);
      if (!Number.isFinite(num)) {
        applyUiScale();
        return;
      }

      const scale = normalizeUiScale(num <= 1.2 ? num : num / 100);
      settings.uiScale = scale;
      salvarSettings();
      if (uiScaleSlider) uiScaleSlider.value = String(Math.round(scale * 100));
      applyUiScale();
    }

    if (uiScalePill instanceof HTMLInputElement) {
      uiScalePill.addEventListener('focus', () => uiScalePill.select());
      uiScalePill.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        commitUiScalePill();
        uiScalePill.blur();
      });
      uiScalePill.addEventListener('blur', () => commitUiScalePill());
    }

    uiScaleSlider?.addEventListener('input', () => {
      settings.uiScale = normalizeUiScale(Number(uiScaleSlider.value) / 100);
      salvarSettings();
      applyUiScale();
    });

    uiScaleAutoInput?.addEventListener('change', () => {
      settings.uiScaleAuto = !!uiScaleAutoInput.checked;
      salvarSettings();
      applyUiScale();
    });

    window.addEventListener('resize', () => {
      applyUiScale();
      applyFabPosition();
    });

    themeModeSelect?.addEventListener('change', () => {
      setThemeDraft({ ...themeDraft, mode: themeModeSelect.value });
    });

    themeModeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.themeMode || themeDraft.mode;
        setThemeDraft({ ...themeDraft, mode });
      });
    });

    themePresetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.themePreset || themeDraft.preset;
        setThemeDraft({ ...themeDraft, preset, useCustom: false });
      });
    });

    themeFxButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const accentStyle = btn.dataset.accentStyle || 'solid';
        setThemeDraft({ ...themeDraft, accentStyle });
      });
    });

    themeHueInput?.addEventListener('input', () => {
      const hue = clampNumber(Number(themeHueInput.value || themeDraft.customHue), 0, 360);
      setThemeDraft({
        ...themeDraft,
        customHue: hue,
        customHex: hslToHex(hue, 100, 50),
        useCustom: true
      });
    });

    themeHexInput?.addEventListener('input', () => {
      const raw = String(themeHexInput.value || '').trim();
      if (!/^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(raw)) return;
      const nextHex = normalizeHexColor(raw, themeDraft.customHex);
      setThemeDraft({
        ...themeDraft,
        customHex: nextHex,
        customHue: hexToHue(nextHex, themeDraft.customHue),
        useCustom: true
      });
    });

    themeHexInput?.addEventListener('blur', () => {
      const nextHex = normalizeHexColor(themeHexInput.value, themeDraft.customHex);
      setThemeDraft({
        ...themeDraft,
        customHex: nextHex,
        customHue: hexToHue(nextHex, themeDraft.customHue),
        useCustom: true
      });
    });

    themeColorInput?.addEventListener('input', () => {
      const nextHex = normalizeHexColor(themeColorInput.value, themeDraft.customHex);
      setThemeDraft({
        ...themeDraft,
        customHex: nextHex,
        customHue: hexToHue(nextHex, themeDraft.customHue),
        useCustom: true
      });
    });

    themeHex2Input?.addEventListener('input', () => {
      const raw = String(themeHex2Input.value || '').trim();
      if (!/^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(raw)) return;
      setThemeDraft({ ...themeDraft, customHex2: normalizeHexColor(raw, themeDraft.customHex2) });
    });

    themeHex2Input?.addEventListener('blur', () => {
      setThemeDraft({ ...themeDraft, customHex2: normalizeHexColor(themeHex2Input.value, themeDraft.customHex2) });
    });

    themeColor2Input?.addEventListener('input', () => {
      setThemeDraft({ ...themeDraft, customHex2: normalizeHexColor(themeColor2Input.value, themeDraft.customHex2) });
    });

    themeCustomBtn?.addEventListener('click', () => {
      const nextHex = normalizeHexColor(themeHexInput?.value, themeDraft.customHex);
      setThemeDraft({
        ...themeDraft,
        customHex: nextHex,
        customHue: hexToHue(nextHex, themeDraft.customHue),
        useCustom: true
      });
    });

    themeSwatchAddBtn?.addEventListener('click', () => {
      const accent = themeDraft.useCustom
        ? themeDraft.customHex
        : (THEME_PRESETS[themeDraft.preset] || themeDraft.customHex);
      setThemeDraft({
        ...themeDraft,
        savedColors: [accent, ...(themeDraft.savedColors || [])]
      });
    });

    themeSwatchesEl?.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const swatchBtn = target.closest('[data-swatch]');
      const swatch = swatchBtn?.getAttribute('data-swatch');
      if (!swatch) return;

      if (e.shiftKey && (themeDraft.accentStyle === 'two' || themeDraft.accentStyle === 'fade')) {
        setThemeDraft({
          ...themeDraft,
          customHex2: normalizeHexColor(swatch, themeDraft.customHex2)
        });
        return;
      }

      const nextHex = normalizeHexColor(swatch, themeDraft.customHex);
      setThemeDraft({
        ...themeDraft,
        customHex: nextHex,
        customHue: hexToHue(nextHex, themeDraft.customHue),
        useCustom: true
      });
    });

    themeSwatchesEl?.addEventListener('contextmenu', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const swatchBtn = target.closest('[data-swatch]');
      const swatch = swatchBtn?.getAttribute('data-swatch');
      if (!swatch) return;
      e.preventDefault();
      const norm = normalizeHexColor(swatch, '');
      if (!norm) return;
      setThemeDraft({
        ...themeDraft,
        savedColors: (themeDraft.savedColors || []).filter((c) => c !== norm)
      });
    });

    themeGlowInput?.addEventListener('change', () => {
      setThemeDraft({ ...themeDraft, glow: !!themeGlowInput.checked });
    });

    themeApplyBtn?.addEventListener('click', () => {
      commitThemeSettings();
    });

    themeResetBtn?.addEventListener('click', () => {
      resetThemeDraft();
      showAttemptBadge('Tema restaurado');
      setTimeout(hideAttemptBadge, 1000);
    });

    swHideFab.addEventListener('change', () => {
      syncSettings();
      applyFabVisibility();
    });
    applyFabVisibility();
    renderFavoriteDomains();
    renderProfileStatus();
    renderProfileList();

    if (settings.showPasswordHover) enableShowPasswordHover();
    swShowPass?.addEventListener('change', () => {
      syncSettings();
      if (swShowPass.checked) enableShowPasswordHover();
      else disableShowPasswordHover();
    });

    swAllowAll?.addEventListener('change', syncSettings);

    swAutoDetect?.addEventListener('change', () => {
      syncSettings();
      if (swAutoDetect.checked) {
        swEra.checked = false;
        swGoto.checked = false;
        swFibertel.checked = false;
        swBrtrix.checked = false;
        syncSettings();
        parar(true);
        if (settings.enabled && deveMostrarBotoes()) iniciarAutoDetect();
      }
      updateUIStatus();
    });

    swAutoDetectAnyDomain?.addEventListener('change', () => {
      syncSettings();
      if (settings.enabled && settings.autoDetectMode) {
        parar(true);
        if (deveMostrarBotoes()) iniciarAutoDetect();
      }
      updateUIStatus();
    });

    swSmartAttempts?.addEventListener('change', syncSettings);

    swPerformance?.addEventListener('change', () => {
      syncSettings();
      if (settings.performanceMode) {
        invalidateLoginCache();
      }
    });

    favAddBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const domain = normalizeDomain(favDomainInput?.value || '');
      if (!domain) return;
      settings.favoriteDomains = Array.from(new Set([...(settings.favoriteDomains || []), domain]));
      salvarSettings();
      favDomainInput.value = '';
      renderFavoriteDomains();
    });

    favListEl?.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.action === 'remove') {
        const entry = target.closest('[data-domain]');
        const domain = entry?.getAttribute('data-domain');
        if (!domain) return;
        settings.favoriteDomains = (settings.favoriteDomains || []).filter((d) => d !== domain);
        salvarSettings();
        renderFavoriteDomains();
      }
    });

    profileListEl?.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const chip = target.closest('[data-profile-id]');
      const id = chip?.getAttribute('data-profile-id');
      if (!id) return;
      const profile = (settings.profiles || []).find((p) => p.id === id);
      if (!profile) return;

      if (profileNameInput) profileNameInput.value = profile.name || '';
      if (profileModeSelect) profileModeSelect.value = profile.mode || 'era';
      if (profileDomainsInput) profileDomainsInput.value = Array.isArray(profile.domains) ? profile.domains.join('\n') : '';
      applyProfile(profile);
      renderProfileList();
      renderProfileStatus();
    });

    profileSaveBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const profile = upsertProfile({
        name: profileNameInput?.value || '',
        mode: profileModeSelect?.value || 'era',
        domains: normalizeDomainList(profileDomainsInput?.value || '')
      });
      if (profileStatusEl) profileStatusEl.textContent = profile ? `Perfil salvo: ${profile.name}` : 'Nome inválido.';
      renderProfileList();
      renderProfileStatus();
    });

    profileApplyBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const name = (profileNameInput?.value || '').trim().toLowerCase();
      const profile = (settings.profiles || []).find((p) => p.name?.toLowerCase() === name) || getActiveProfile();
      if (!profile) {
        if (profileStatusEl) profileStatusEl.textContent = 'Perfil não encontrado.';
        return;
      }
      applyProfile(profile);
      renderProfileList();
      renderProfileStatus();
    });

    profileDeleteBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      removeProfile(profileNameInput?.value || '');
      renderProfileList();
      renderProfileStatus();
    });

    configExportBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const payload = getExportPayload();
      const json = JSON.stringify(payload, null, 2);
      if (configTextarea) configTextarea.value = json;
      navigator.clipboard?.writeText(json).then(() => {
        if (configStatusEl) configStatusEl.textContent = 'Exportado e copiado para a área de transferência.';
      }).catch(() => {
        if (configStatusEl) configStatusEl.textContent = 'Exportado no campo de texto.';
      });
    });

    configImportBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const raw = configTextarea?.value || '';
      try {
        const payload = JSON.parse(raw);
        if (!applyImportPayload(payload)) throw new Error('Payload inválido.');
        if (configStatusEl) configStatusEl.textContent = 'Importado com sucesso.';
        refreshSettingsUI();
        applyFabVisibility();
        renderFavoriteDomains();
        renderProfileStatus();
        renderProfileList();
      } catch (err) {
        if (configStatusEl) configStatusEl.textContent = `Falha ao importar: ${err?.message || err}`;
      }
    });

    shortcutSaveBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      settings.shortcuts = {
        toggleUI: shortcutToggleInput?.value || settings.shortcuts?.toggleUI,
        quickEra: shortcutEraInput?.value || settings.shortcuts?.quickEra,
        quickGoto: shortcutGotoInput?.value || settings.shortcuts?.quickGoto,
        quickFibertel: shortcutFibertelInput?.value || settings.shortcuts?.quickFibertel,
        quickBrtrix: shortcutBrtrixInput?.value || settings.shortcuts?.quickBrtrix
      };
      salvarSettings();
    });

    swEnabled.addEventListener('change', () => {
      syncSettings();

      if (!settings.enabled) {
        parar(true);
        updateUIStatus('DESATIVADO');
        return;
      }

      if (deveMostrarBotoes()) {
          if (settings.autoDetectMode) iniciarAutoDetect();
          else if (settings.era) iniciar('era');
          else if (settings.goto) iniciar('goto');
          else if (settings.fibertel) iniciar('fibertel');
          else if (settings.brtrix) iniciar('brtrix');
      }
        updateUIStatus();
    });

      swEra.addEventListener('change', () => {
          disableAutoDetectIfNeeded();
          syncSettings();

          if (!settings.enabled) {
              if (state.modo === 'era') parar(true);
              updateUIStatus();
              return;
          }

          if (swEra.checked) {
              swGoto.checked = false;
              swFibertel.checked = false;

              parar(true);

              settings.era = true;
              settings.goto = false;
              settings.fibertel = false;

              syncSettings();
              if (deveMostrarBotoes()) iniciar('era');
          } else {
              if (state.modo === 'era') parar(true);
              settings.era = false;
              syncSettings();
          }

          updateUIStatus();
      });

      swGoto.addEventListener('change', () => {
          disableAutoDetectIfNeeded();
          syncSettings();

          if (!settings.enabled) {
              if (state.modo === 'goto') parar(true);
              updateUIStatus();
              return;
          }

          if (swGoto.checked) {
              swEra.checked = false;
              swFibertel.checked = false;

              parar(true);

              settings.goto = true;
              settings.era = false;
              settings.fibertel = false;

              syncSettings();
              if (deveMostrarBotoes()) iniciar('goto');
          } else {
              if (state.modo === 'goto') parar(true);
              settings.goto = false;
              syncSettings();
          }

          updateUIStatus();
      });

      swFibertel.addEventListener('change', () => {
          disableAutoDetectIfNeeded();
          syncSettings();

          if (!settings.enabled) {
              if (state.modo === 'fibertel') parar(true);
              updateUIStatus();
              return;
          }

          if (swFibertel.checked) {
              swEra.checked = false;
              swGoto.checked = false;

              parar(true);

              settings.fibertel = true;
              settings.era = false;
              settings.goto = false;

              syncSettings();
              if (deveMostrarBotoes()) iniciar('fibertel');
          } else {
              if (state.modo === 'fibertel') parar(true);
              settings.fibertel = false;
              syncSettings();
          }

          updateUIStatus();
      });

      swBrtrix.addEventListener('change', () => {
          disableAutoDetectIfNeeded();
          syncSettings();

          if (!settings.enabled) {
              if (state.modo === 'brtrix') parar(true);
              updateUIStatus();
              return;
          }

          if (swBrtrix.checked) {
              swEra.checked = false;
              swGoto.checked = false;
              swFibertel.checked = false;

              parar(true);

              settings.brtrix = true;
              settings.era = false;
              settings.goto = false;
              settings.fibertel = false;

              syncSettings();
              if (deveMostrarBotoes()) iniciar('brtrix');
          } else {
              if (state.modo === 'brtrix') parar(true);
              settings.brtrix = false;
              syncSettings();
          }

          updateUIStatus();
      });

      updateUIStatus();
      applySearch();

      if (settings.enabled && !state.ativo && deveMostrarBotoes()) {
          if (settings.autoDetectMode) iniciarAutoDetect();
          else if (settings.era) iniciar('era');
          else if (settings.goto) iniciar('goto');
          else if (settings.fibertel) iniciar('fibertel');
          else if (settings.brtrix) iniciar('brtrix');
      }
  });

})();
