// MASTER J.A.R.V.I.S. AI 8.0 – All-in-One Version für Cloudflare Worker (Backend + Frontend)
const VERSION = "8.0.0";
const MAX_BODY_BYTES = 200_000;
const MAX_MESSAGES = 60;
const MAX_CONTENT = 8000;
const MAX_MEMORY_ITEMS = 50;
const MAX_MEMORY_LEN = 500;
const UPSTREAM_TIMEOUT_MS = 45_000;
const PROVIDERS = ["gemini", "openai"];
const DEFAULT_MODELS = { gemini: "gemini-flash-latest", openai: "gpt-4o-mini" };
const ADDRESS = { MASTER: "Master", CEVIK: "Cevik" };
const MODEL_RE = /^[A-Za-z0-9._:\-]{1,64}$/;

const HTML_UI = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#02050d">
<meta name="color-scheme" content="dark">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="JARVIS 8.0">
<title>MASTER J.A.R.V.I.S. AI 8.0</title>
<style>
:root {
  --bg: #02050d; --bg2: #060d1c; --panel: rgba(12, 24, 48, 0.72);
  --line: rgba(80, 170, 255, 0.22); --text: #dff1ff; --muted: #8fa9c4;
  --blue: #3cb4ff; --blue-2: #1a7bff; --red: #ff3d5a; --green: #36e2a0;
  --amber: #ffc24a; --radius: 16px; --tab-h: 64px;
  --safe-t: env(safe-area-inset-top, 0px); --safe-b: env(safe-area-inset-bottom, 0px);
  --safe-l: env(safe-area-inset-left, 0px); --safe-r: env(safe-area-inset-right, 0px);
}
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body { height: 100%; margin: 0; background: var(--bg); color: var(--text); overscroll-behavior: none; }
body {
  font-family: ui-rounded, "SF Pro Rounded", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  font-size: 16px; line-height: 1.45; -webkit-font-smoothing: antialiased;
  background: radial-gradient(120% 60% at 50% 0%, rgba(26, 90, 200, 0.28), transparent 60%),
              radial-gradient(80% 50% at 100% 100%, rgba(255, 61, 90, 0.10), transparent 60%), var(--bg);
}
[hidden] { display: none !important; }
button { font: inherit; color: inherit; cursor: pointer; border: 0; background: none; touch-action: manipulation; }
input, textarea, select { font: inherit; font-size: 16px; color: var(--text); touch-action: manipulation; }
h1 { font-size: 22px; margin: 4px 0 14px; letter-spacing: 0.02em; }
h2 { font-size: 15px; margin: 0 0 10px; color: var(--blue); letter-spacing: 0.03em; }
code { background: rgba(60, 180, 255, 0.12); padding: 1px 5px; border-radius: 5px; font-size: 0.9em; }
#app { height: 100dvh; display: flex; flex-direction: column; padding-left: var(--safe-l); padding-right: var(--safe-r); }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: calc(var(--safe-t) + 10px) 16px 8px; flex: none; }
.brand { display: flex; align-items: baseline; gap: 8px; }
.brand-main { font-weight: 700; font-size: 18px; letter-spacing: 0.14em; color: var(--text); text-shadow: 0 0 14px rgba(60, 180, 255, 0.6); }
.brand-ver { font-size: 12px; color: var(--red); letter-spacing: 0.1em; font-weight: 600; }
.badge { display: flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 14px; border: 1px solid var(--line); border-radius: 999px; background: var(--panel); font-size: 14px; }
.dot { width: 9px; height: 9px; border-radius: 50%; background: var(--muted); box-shadow: 0 0 8px currentColor; }
.dot-ok { background: var(--green); color: var(--green); }
.dot-warn { background: var(--amber); color: var(--amber); }
.dot-bad { background: var(--red); color: var(--red); }
.dot-unknown { background: var(--muted); color: var(--muted); }
.toast { position: fixed; left: 50%; transform: translateX(-50%); top: calc(var(--safe-t) + 58px); z-index: 50; max-width: min(92vw, 440px); padding: 12px 16px; border-radius: 14px; background: rgba(10, 20, 40, 0.96); border: 1px solid var(--line); box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5); font-size: 14px; }
.toast.error { border-color: rgba(255, 61, 90, 0.6); }
.views { flex: 1; min-height: 0; position: relative; }
.view { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 0 16px; min-height: 0; }
.view.scroll { overflow-y: auto; -webkit-overflow-scrolling: touch; padding-bottom: 24px; }
.panel { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 14px; margin-bottom: 14px; backdrop-filter: blur(10px); }
.hint { color: var(--muted); font-size: 13px; margin: 8px 0; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 44px; }
.switch-row input { width: 52px; height: 30px; accent-color: var(--blue); }
.field { display: flex; flex-direction: column; gap: 6px; margin: 10px 0; font-size: 14px; color: var(--muted); }
.field input[type="text"], .field select, .inline-form input, .panel select { min-height: 46px; padding: 0 12px; border-radius: 12px; border: 1px solid var(--line); background: rgba(3, 8, 20, 0.85); width: 100%; }
.inline-form { display: flex; gap: 8px; }
.inline-form input { flex: 1; min-width: 0; }
.btn-row { display: flex; gap: 10px; margin: 10px 0; }
.btn-row > * { flex: 1; }
.primary-btn { width: 100%; min-height: 48px; border-radius: 14px; font-weight: 600; margin-top: 8px; background: linear-gradient(135deg, var(--blue-2), var(--blue)); color: #031024; box-shadow: 0 0 18px rgba(60, 180, 255, 0.35); }
.primary-btn.compact { width: auto; padding: 0 16px; margin-top: 0; }
.ghost-btn { min-height: 44px; padding: 0 14px; border-radius: 12px; border: 1px solid var(--line); background: rgba(60, 180, 255, 0.07); }
.ghost-btn.small { min-height: 38px; padding: 0 12px; font-size: 14px; }
.danger-btn { width: 100%; min-height: 46px; border-radius: 12px; border: 1px solid rgba(255, 61, 90, 0.5); color: #ff8ea0; background: rgba(255, 61, 90, 0.08); margin-top: 8px; }
.icon-btn, .send-btn { width: 48px; height: 48px; border-radius: 50%; flex: none; display: grid; place-items: center; border: 1px solid var(--line); background: var(--panel); }
.send-btn { background: linear-gradient(135deg, var(--blue-2), var(--blue)); color: #031024; border: 0; }
.icon-btn svg, .send-btn svg { width: 22px; height: 22px; fill: currentColor; }
.result-line { margin-top: 8px; font-size: 14px; min-height: 20px; }
.result-line.ok { color: var(--green); }
.result-line.bad { color: #ff8ea0; }
.segmented { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 6px; padding: 4px; border-radius: 14px; background: rgba(3, 8, 20, 0.85); border: 1px solid var(--line); }
.segmented button { min-height: 44px; border-radius: 10px; font-weight: 600; color: var(--muted); }
.segmented button[aria-pressed="true"] { background: linear-gradient(135deg, rgba(26, 123, 255, 0.85), rgba(60, 180, 255, 0.85)); color: #031024; }
.brain-wrap { flex: 1; min-height: 0; position: relative; }
#brainCanvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.central-info { flex: none; text-align: center; padding: 4px 0 6px; min-height: 108px; }
.state-label { font-size: 13px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--blue); }
.greeting { font-size: 20px; font-weight: 600; margin-top: 2px; text-shadow: 0 0 16px rgba(60, 180, 255, 0.5); }
.transcript-line { min-height: 22px; color: var(--muted); font-size: 14px; margin-top: 4px; padding: 0 8px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.error-banner { margin: 6px auto 0; max-width: 420px; padding: 10px 14px; border-radius: 12px; font-size: 14px; border: 1px solid rgba(255, 61, 90, 0.6); background: rgba(255, 61, 90, 0.12); color: #ffb3bf; }
.central-controls { flex: none; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 4px 0 14px; }
.mic-btn { width: 84px; height: 84px; border-radius: 50%; display: grid; place-items: center; background: radial-gradient(circle at 35% 30%, rgba(90, 200, 255, 0.45), rgba(10, 40, 100, 0.9)); border: 1.5px solid rgba(90, 200, 255, 0.7); box-shadow: 0 0 26px rgba(60, 180, 255, 0.5); }
.mic-btn svg { width: 36px; height: 36px; fill: var(--text); }
.mic-btn.listening { border-color: var(--red); box-shadow: 0 0 34px rgba(255, 61, 90, 0.7); }
.mic-status { font-size: 13px; color: var(--muted); }
.chat-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 2px 0 8px; flex: none; }
.chat-title { font-weight: 600; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.chat-actions { display: flex; gap: 8px; flex: none; }
.chat-list { flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; display: flex; flex-direction: column; gap: 10px; padding: 4px 0 10px; }
.chat-empty { margin: auto; text-align: center; color: var(--muted); padding: 24px; white-space: pre-line; }
.msg { max-width: 88%; padding: 10px 14px; border-radius: 16px; border: 1px solid var(--line); word-wrap: break-word; overflow-wrap: anywhere; white-space: pre-wrap; }
.msg.user { align-self: flex-end; background: rgba(26, 123, 255, 0.28); border-color: rgba(60, 180, 255, 0.5); border-bottom-right-radius: 5px; }
.msg.assistant { align-self: flex-start; background: var(--panel); border-bottom-left-radius: 5px; }
.msg.error { align-self: center; max-width: 94%; font-size: 14px; color: #ffb3bf; background: rgba(255, 61, 90, 0.1); border-color: rgba(255, 61, 90, 0.5); }
.msg-meta { display: flex; align-items: center; gap: 10px; margin-top: 6px; font-size: 12px; color: var(--muted); }
.msg-meta button { color: var(--blue); min-height: 28px; padding: 0 4px; }
.chat-form { flex: none; display: flex; align-items: flex-end; gap: 8px; padding: 8px 0 10px; }
.chat-form textarea { flex: 1; min-width: 0; resize: none; max-height: 120px; min-height: 48px; padding: 12px 14px; line-height: 1.3; border-radius: 24px; border: 1px solid var(--line); background: rgba(3, 8, 20, 0.85); }
.memory-list, .history-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
.mem-item, .hist-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 12px; background: var(--panel); }
.mem-item .txt, .hist-item .txt { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.mini-btn { min-height: 40px; min-width: 44px; padding: 0 10px; border-radius: 10px; border: 1px solid var(--line); font-size: 14px; }
.mini-btn.del { color: #ff8ea0; border-color: rgba(255, 61, 90, 0.4); }
.empty-note { color: var(--muted); text-align: center; padding: 16px; font-size: 14px; }
.transcript-box { margin-top: 10px; min-height: 56px; padding: 10px 12px; border-radius: 12px; background: rgba(3, 8, 20, 0.85); border: 1px solid var(--line); color: var(--muted); }
.status-rows { display: flex; flex-direction: column; }
.status-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(80, 170, 255, 0.12); font-size: 14px; }
.status-row .val { display: flex; align-items: center; gap: 8px; text-align: right; }
.error-log { font-size: 13px; color: var(--muted); max-height: 220px; overflow-y: auto; margin-bottom: 8px; }
.sheet { position: fixed; inset: 0; z-index: 40; background: rgba(0, 4, 12, 0.7); display: flex; align-items: flex-end; backdrop-filter: blur(4px); }
.sheet-card { width: 100%; max-height: 82dvh; overflow-y: auto; padding: 16px 16px calc(var(--safe-b) + 16px); border-radius: 22px 22px 0 0; background: #07122a; border: 1px solid var(--line); }
.sheet-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.menu-grid button { min-height: 52px; border-radius: 14px; border: 1px solid var(--line); background: rgba(60, 180, 255, 0.07); font-weight: 600; }
.tabbar { flex: none; display: grid; grid-template-columns: repeat(5, 1fr); height: calc(var(--tab-h) + var(--safe-b)); padding-bottom: var(--safe-b); background: rgba(4, 10, 24, 0.92); border-top: 1px solid var(--line); backdrop-filter: blur(14px); }
.tab { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; color: var(--muted); font-size: 11px; min-width: 0; }
.tab svg { width: 24px; height: 24px; fill: currentColor; }
.tab span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tab.active { color: var(--blue); text-shadow: 0 0 10px rgba(60, 180, 255, 0.7); }
</style>
</head>
<body>
<div id="app">
  <header class="topbar">
    <div class="brand"><span class="brand-main">J.A.R.V.I.S.</span><span class="brand-ver">AI 8.0</span></div>
    <button id="providerBadge" class="badge" type="button"><span id="backendDot" class="dot dot-unknown"></span><span id="providerBadgeText">Gemini</span></button>
  </header>
  <div id="toast" class="toast" hidden></div>
  <main class="views">
    <section id="view-central" class="view" data-title="Zentrale">
      <div class="brain-wrap"><canvas id="brainCanvas"></canvas></div>
      <div class="central-info">
        <div id="stateLabel" class="state-label">Standby</div>
        <div id="greeting" class="greeting">Zu Diensten, Master.</div>
        <div id="transcriptLine" class="transcript-line"></div>
        <div id="errorBanner" class="error-banner" hidden></div>
      </div>
      <div class="central-controls">
        <button id="micBtnCentral" class="mic-btn" type="button"><svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg></button>
        <button id="stopSpeakCentral" class="ghost-btn" type="button" hidden>Sprechen stoppen</button>
        <div id="micStatusCentral" class="mic-status">Mikrofon aus</div>
      </div>
    </section>
    <section id="view-chat" class="view" data-title="Chat" hidden>
      <div class="chat-head">
        <div id="chatTitle" class="chat-title">Neue Unterhaltung</div>
        <div class="chat-actions">
          <button id="chatHistoryBtn" class="ghost-btn small" type="button">Verlauf</button>
          <button id="chatNewBtn" class="ghost-btn small" type="button">Neu</button>
        </div>
      </div>
      <div id="chatList" class="chat-list"></div>
      <form id="chatForm" class="chat-form" autocomplete="off">
        <button id="chatMicBtn" class="icon-btn" type="button"><svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg></button>
        <textarea id="chatInput" rows="1" placeholder="Nachricht an J.A.R.V.I.S." maxlength="8000"></textarea>
        <button id="chatSendBtn" class="send-btn" type="submit"><svg viewBox="0 0 24 24"><path d="M3 20.5v-6.9L14 12 3 10.4V3.5L22 12z"/></svg></button>
      </form>
      <div id="historyPanel" class="sheet" hidden>
        <div class="sheet-card">
          <div class="sheet-head"><h2>Verlauf</h2><button id="historyClose" class="ghost-btn small" type="button">Schließen</button></div>
          <div id="historyList" class="history-list"></div>
          <button id="historyClearAll" class="danger-btn" type="button">Gesamten Verlauf löschen</button>
        </div>
      </div>
    </section>
    <section id="view-voice" class="view scroll" data-title="Sprache" hidden>
      <h1>Sprache</h1>
      <div class="panel">
        <div class="row"><span>Mikrofon</span><span id="micStatusVoice" class="mic-status inline">Mikrofon aus</span></div>
        <button id="micBtnVoice" class="primary-btn" type="button">Zuhören starten</button>
        <div id="transcriptVoice" class="transcript-box">Hier erscheint, was erkannt wird.</div>
      </div>
      <div class="panel">
        <h2>Sprachausgabe</h2>
        <label class="row switch-row"><span>Antworten vorlesen</span><input id="ttsOn" type="checkbox" role="switch" checked></label>
        <label class="field"><span>Stimme</span><select id="voiceSelect"></select></label>
        <label class="field"><span>Tempo <output id="rateOut">1.0</output></span><input id="rateRange" type="range" min="0.6" max="1.6" step="0.05" value="1"></label>
        <div class="btn-row"><button id="ttsTest" class="ghost-btn" type="button">Stimme testen</button><button id="ttsStop" class="ghost-btn" type="button">Sprechen stoppen</button></div>
      </div>
    </section>
    <section id="view-memory" class="view scroll" data-title="Gedächtnis" hidden>
      <h1>Gedächtnis</h1>
      <div class="panel">
        <label class="row switch-row"><span>Im Gespräch verwenden</span><input id="useMemory" type="checkbox" role="switch" checked></label>
        <p class="hint">Gespeicherte Einträge werden bei jeder Anfrage mitgesendet.</p>
        <form id="memoryForm" class="inline-form" autocomplete="off">
          <input id="memoryInput" type="text" placeholder="Neue Information speichern" maxlength="500">
          <button class="primary-btn compact" type="submit">Speichern</button>
        </form>
      </div>
      <div id="memoryList" class="memory-list"></div>
      <button id="memoryClearAll" class="danger-btn" type="button">Alle Einträge löschen</button>
    </section>
    <section id="view-settings" class="view scroll" data-title="Einstellungen" hidden>
      <h1>Einstellungen</h1>
      <div class="panel">
        <h2>Anrede</h2>
        <div class="segmented" id="addressSeg"><button type="button" data-value="MASTER" aria-pressed="true">MASTER</button><button type="button" data-value="CEVIK">CEVIK</button></div>
      </div>
      <div class="panel">
        <h2>Zugangscode</h2>
        <form id="tokenForm" class="inline-form" autocomplete="off">
          <input id="tokenInput" type="password" placeholder="Zugangscode">
          <button class="primary-btn compact" type="submit">Prüfen</button>
        </form>
        <div id="tokenResult" class="result-line"></div>
      </div>
    </section>
    <section id="view-ai" class="view scroll" data-title="KI-System" hidden>
      <h1>KI-System</h1>
      <div class="panel">
        <h2>Modell</h2>
        <label class="field"><span>Modell</span><input id="modelInput" type="text" value="gemini-flash-latest"></label>
        <button id="aiTestBtn" class="primary-btn" type="button">Verbindung testen</button>
        <div id="aiTestResult" class="result-line"></div>
      </div>
    </section>
    <section id="view-status" class="view scroll" data-title="Systemstatus" hidden>
      <h1>Systemstatus</h1>
      <div class="panel"><div id="statusRows" class="status-rows"></div><button id="statusRefresh" class="primary-btn" type="button">Neu prüfen</button></div>
    </section>
  </main>
  <div id="menuSheet" class="sheet" hidden>
    <div class="sheet-card">
      <div class="sheet-head"><h2>Menü</h2><button id="menuClose" class="ghost-btn small" type="button">Schließen</button></div>
      <div class="menu-grid">
        <button type="button" data-go="central">Zentrale</button>
        <button type="button" data-go="chat">Chat</button>
        <button type="button" data-go="voice">Sprache</button>
        <button type="button" data-go="memory">Gedächtnis</button>
        <button type="button" data-go="settings">Einstellungen</button>
        <button type="button" data-go="ai">KI-System</button>
        <button type="button" data-go="status">Systemstatus</button>
      </div>
    </div>
  </div>
  <nav class="tabbar">
    <button type="button" data-go="central" class="tab active"><svg viewBox="0 0 24 24"><path d="M12 3a7 7 0 0 0-7 7c0 2.1.9 3.7 2 4.9V18a2 2 0 0 0 2 2h1v1h4v-1h1a2 2 0 0 0 2-2v-3.1c1.1-1.2 2-2.8 2-4.9a7 7 0 0 0-7-7zm0 2a5 5 0 0 1 5 5c0 1.6-.8 2.8-1.8 3.9l-.2.3V18h-6v-3.8l-.2-.3C7.8 12.8 7 11.6 7 10a5 5 0 0 1 5-5z"/></svg><span>Zentrale</span></button>
    <button type="button" data-go="chat" class="tab"><svg viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg><span>Chat</span></button>
    <button type="button" data-go="voice" class="tab"><svg viewBox="0 0 24 24"><path d="M5 10v4h2v-4H5zm4-4v12h2V6H9zm4 3v6h2V9h-2zm4-2v10h2V7h-2z"/></svg><span>Sprache</span></button>
    <button type="button" data-go="memory" class="tab"><svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg><span>Gedächtnis</span></button>
    <button type="button" id="menuBtn" class="tab"><svg viewBox="0 0 24 24"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/></svg><span>Menü</span></button>
  </nav>
</div>
<script>
(function() {
  // Gehirn-Animation
  const canvas = document.getElementById("brainCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let t = 0;
    function resize() {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * window.devicePixelRatio;
      canvas.height = r.height * window.devicePixelRatio;
    }
    window.addEventListener("resize", resize);
    resize();
    function draw() {
      t += 0.03;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / (2 * window.devicePixelRatio), cy = canvas.height / (2 * window.devicePixelRatio);
      ctx.fillStyle = "rgba(60, 180, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(cx, cy, 60 + 10 * Math.sin(t), 0, Math.PI * 2);
      ctx.fill();
      requestAnimationFrame(draw);
    }
    draw();
  }

  // App-Logik
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const LS = "mjai8.";
  let settings = JSON.parse(localStorage.getItem(LS + "settings") || '{"token":"","address":"MASTER"}');
  let memory = JSON.parse(localStorage.getItem(LS + "memory") || '[]');
  let convs = JSON.parse(localStorage.getItem(LS + "convs") || '[]');
  let activeId = null;

  function go(id) {
    $$(".view").forEach(v => v.hidden = v.id !== "view-" + id);
    $$(".tabbar .tab").forEach(t => t.classList.toggle("active", t.dataset.go === id));
    $("#menuSheet").hidden = true;
    if (id === "chat") renderChat();
    if (id === "status") refreshStatus();
  }
  $$("[data-go]").forEach(b => b.addEventListener("click", () => go(b.dataset.go)));
  $("#menuBtn").addEventListener("click", () => $("#menuSheet").hidden = false);
  $("#menuClose").addEventListener("click", () => $("#menuSheet").hidden = true);

  // Token speichern
  $("#tokenInput").value = settings.token || "";
  $("#tokenForm").addEventListener("submit", (e) => {
    e.preventDefault();
    settings.token = $("#tokenInput").value.trim();
    localStorage.setItem(LS + "settings", JSON.stringify(settings));
    $("#tokenResult").textContent = "Gespeichert!";
    $("#tokenResult").className = "result-line ok";
  });

  // Chat Senden
  async function sendMsg(text) {
    if (!text.trim()) return;
    let conv = convs.find(c => c.id === activeId);
    if (!conv) { conv = { id: Date.now().toString(), title: text.slice(0, 30), messages: [] }; convs.unshift(conv); activeId = conv.id; }
    conv.messages.push({ role: "user", content: text });
    renderChat();
    $("#chatInput").value = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + settings.token },
        body: JSON.stringify({ provider: "gemini", model: "gemini-flash-latest", address: settings.address, messages: conv.messages, memory: memory.map(m => m.text) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Fehler");
      conv.messages.push({ role: "assistant", content: data.reply });
    } catch (err) {
      conv.messages.push({ role: "error", content: err.message });
    }
    localStorage.setItem(LS + "convs", JSON.stringify(convs));
    renderChat();
  }

  $("#chatForm").addEventListener("submit", (e) => {
    e.preventDefault();
    sendMsg($("#chatInput").value);
  });

  function renderChat() {
    const list = $("#chatList");
    list.innerHTML = "";
    const conv = convs.find(c => c.id === activeId);
    if (!conv || !conv.messages.length) {
      list.innerHTML = '<div class="chat-empty">Schreibe oder sprich mit J.A.R.V.I.S.</div>';
      return;
    }
    conv.messages.forEach(m => {
      const d = document.createElement("div");
      d.className = "msg " + m.role;
      d.textContent = m.content;
      list.appendChild(d);
    });
    list.scrollTop = list.scrollHeight;
  }

  $("#chatNewBtn").addEventListener("click", () => { activeId = null; renderChat(); });

  async function refreshStatus() {
    const box = $("#statusRows");
    box.innerHTML = '<div class="status-row"><span>Backend</span><span class="val"><span class="dot dot-ok"></span>Erreichbar</span></div>';
  }
  $("#statusRefresh").addEventListener("click", refreshStatus);
})();
</script>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) {
      return new Response(HTML_UI, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    if (url.pathname === "/api/status") {
      const token = (request.headers.get("Authorization") || "").replace("Bearer ", "");
      const ok = token && env.APP_TOKEN && token === env.APP_TOKEN;
      return new Response(JSON.stringify({ ok: true, version: VERSION, auth: { state: ok ? "ok" : "invalid" }, providers: { gemini: !!env.GEMINI_API_KEY } }), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/api/chat") {
      const token = (request.headers.get("Authorization") || "").replace("Bearer ", "");
      if (!env.APP_TOKEN || token !== env.APP_TOKEN) return new Response(JSON.stringify({ error: { message: "Ungültiger Zugangscode." } }), { status: 401, headers: { "Content-Type": "application/json" } });
      if (!env.GEMINI_API_KEY) return new Response(JSON.stringify({ error: { message: "GEMINI_API_KEY fehlt." } }), { status: 503, headers: { "Content-Type": "application/json" } });
      
      try {
        const body = await request.json();
        const lastMsg = body.messages[body.messages.length - 1].content;
        const geminiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
          body: JSON.stringify({ contents: [{ parts: [{ text: lastMsg }] }] })
        });
        const data = await geminiRes.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Keine Antwort erhalten.";
        return new Response(JSON.stringify({ reply, provider: "gemini", model: "gemini-flash-latest" }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: { message: err.message } }), { status: 502, headers: { "Content-Type": "application/json" } });
      }
    }
    return new Response("Not found", { status: 404 });
  }
};
