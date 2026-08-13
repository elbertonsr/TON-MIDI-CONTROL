// =====================================================================
// 🚀 PWA: SUPORTE OFFLINE (ARQUITETURA DE ARQUIVO ÚNICO - ISOMÓRFICA)
// =====================================================================

if (typeof window === 'undefined') {
    // --- 1. CONTEXTO DO SERVICE WORKER ---
    
    // Mock de DOM: Evita erros no Worker ao interpretar o código de interface abaixo
    const mockEl = { addEventListener: () => {}, classList: { toggle: () => {} }, getAttribute: () => null, setAttribute: () => {} };
    globalThis.window = { addEventListener:Como programador sênior, compreendo perfeitamente seu objetivo e as restrições do seu fluxo de trabalho no Spck Editor. 

Para tornar o aplicativo funcional offline (PWA) **sem criar um arquivo externo `sw.js`**, aplicaremos uma técnica avançada que converte o código do Service Worker em um `Blob` e o injeta dinamicamente no navegador.

Adicione o código abaixo no **final do seu arquivo `app.js`**, logo após a última linha (`window.addEventListener('DOMContentLoaded', ...);`). Não é necessário alterar ou apagar nada do seu código atual.

```javascript
// --- SISTEMA OFFLINE (PWA) ---
// Implementação dinâmica via Blob para evitar arquivos externos
const enableOfflinePWA = () => {
    if ('serviceWorker' in navigator) {
        // Código do Service Worker definido como string
        const swCode = `
            const CACHE_NAME = 'ton-midi-cache-v1';
            const ASSETS_TO_CACHE = [
                './',
                './index.html',
                './app.js',
                './manifest.json',
                './icon-192.png',
                './icon-512.png'
            ];

            // Instalação e Cache inicial
            self.addEventListener('install', (event) => {
                event.waitUntil(
                    caches.open(CACHE_NAME)
                    .then((cache) => cache.addAll(ASSETS_TO_CACHE))
                    .then(() => self.skipWaiting())
                );
            });

            // Ativação e limpeza de caches antigos
            self.addEventListener('activate', (event) => {
                event.waitUntil(
                    caches.keys().then((cacheNames) => {
                        return Promise.all(
                            cacheNames.filter((name) => name !== CACHE_NAME)
                            .map((name) => caches.delete(name))
                        );
                    }).then(() => self.clients.claim())
                );
            });

            // Interceptação de requisições (Cache First com Network Fallback)
            self.addEventListener('fetch', (event) => {
                event.respondWith(
                    caches.match(event.request).then((cachedResponse) => {
                        if (cachedResponse) return cachedResponse;
                        
                        return fetch(event.request).then((networkResponse) => {
                            // Verifica se a resposta é válida antes de fazer o cache
                            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                                return networkResponse;
                            }
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                            return networkResponse;
                        }).catch(() => {
                            // Ignora erros de fetch quando offline (recursos já estão no cache)
                        });
                    })
                );
            });
        `;

        // Converte a string em um arquivo virtual (Blob)
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);

        // Registra o Service Worker dinâmico
        navigator.serviceWorker.register(swUrl)
            .then((registration) => {
                console.log('PWA: Modo Offline ativado com sucesso via Blob dinâmico.', registration.scope);
            })
            .catch((error) => {
                console.error('PWA: Falha ao ativar o modo offline:', error);
            });
    }
};

// Inicia o processo após o carregamento completo da página
window.addEventListener('load', enableOfflinePWA);

// --- CACHE CENTRALIZADO (ALTA PERFORMANCE) ---
const UI = {
    mainMenu: document.getElementById('main-menu'), textMenu: document.getElementById('menu-textos'), padMenu: document.getElementById('menu-pads'), midiMenu: document.getElementById('menu-midi'), presetsMenu: document.getElementById('menu-presets'),
    textContainer: document.getElementById('text-inputs-container'), padContainer: document.getElementById('pad-colors-container'),
    leslie: document.getElementById('leslie-switch'), app: document.getElementById('app'), overlay: document.getElementById('start-overlay'),
    midiStatus: document.getElementById('midi-status'), midiOutputs: document.getElementById('midi-outputs'),
    btnTogglePage: document.getElementById('btn-toggle-page'), viewPage1: document.getElementById('view-page-1'), viewPage2: document.getElementById('view-page-2'),
    sliders: [], knobs: [], stripBtns: [], cache: {}
};

function getEl(id) { if (!UI.cache[id]) UI.cache[id] = document.getElementById(id); return UI.cache[id]; }

const labelsToEdit = [
    'k1','k2','k3','k4','k5','k6','k7','k8','k9','k10','k11','k12',
    'f1','f2','f3','f4','f5','f6','f7',
    'p1','p2','p3','p4','p5',
    's1','s2','s3','s4','s5',
    'b7','b8','b9','b10','b11','b12','b13','b14','b15','b16','b17','b18'
];

function initDOMCache() {
    UI.sliders = Array.from(document.querySelectorAll('.midi-slider'));
    UI.knobs = Array.from(document.querySelectorAll('.knob-dial'));
    UI.stripBtns = Array.from(document.querySelectorAll('.strip-btn'));
}

function createLEDs() {
    document.querySelectorAll('.led-ring').forEach(ring => {
        if(ring.children.length > 0) return;
        for(let i=0; i<11; i++) {
            let led = document.createElement('div'); led.className = 'knob-led';
            let rad = (-135 + (i * 27)) * Math.PI / 180;
            led.style.left = `${26 + 25 * Math.sin(rad) - 1.5}px`; led.style.top = `${26 - 25 * Math.cos(rad) - 1.5}px`; 
            led.style.transform = `rotate(${-135 + (i * 27)}deg)`;
            ring.appendChild(led);
        }
    });
    document.querySelectorAll('.fader-led-strip').forEach(strip => {
        if(strip.children.length > 0) return;
        for(let i=0; i<10; i++) { let led = document.createElement('div'); led.className = 'fader-led'; strip.appendChild(led); }
    });
}

function buildPadColorsMenu() {
    UI.padContainer.innerHTML = '';
    
    // Subtítulo descritivo para os Pads
    const titlePads = document.createElement('div');
    titlePads.style = 'color: var(--accent-cyan); font-size: 0.7rem; font-weight: bold; text-transform: uppercase; margin: 2px 0 6px 0;';
    titlePads.textContent = 'Cores dos Pads';
    UI.padContainer.appendChild(titlePads);

    for (let i = 1; i <= 5; i++) {
        const div = document.createElement('div'); div.className = 'form-group';
        div.innerHTML = `<label>Pad ${i}</label><select id="color-p${i}"><option value="purple">Padrão (Roxo)</option><option value="blue">Azul</option><option value="orange">Laranja</option><option value="green">Verde</option><option value="red">Vermelho</option></select>`;
        UI.padContainer.appendChild(div);
    }

    // Subtítulo descritivo para os Canais do Mixer
    const titleChannels = document.createElement('div');
    titleChannels.style = 'color: var(--accent-cyan); font-size: 0.7rem; font-weight: bold; text-transform: uppercase; margin: 12px 0 6px 0; border-top: 1px solid var(--border-color); padding-top: 8px;';
    titleChannels.textContent = 'Cores dos Canais do Mixer';
    UI.padContainer.appendChild(titleChannels);

    for (let i = 1; i <= 6; i++) {
        const div = document.createElement('div'); div.className = 'form-group';
        div.innerHTML = `<label>Canal ${i}</label><select id="color-ch${i}"><option value="">Padrão (Grafite)</option><option value="purple">Roxo</option><option value="blue">Azul</option><option value="orange">Laranja</option><option value="green">Verde</option><option value="red">Vermelho</option></select>`;
        UI.padContainer.appendChild(div);
    }
}

// --- PRESETS UPDATE ---
function updatePresetSelect() {
    const select = document.getElementById('preset-selector');
    if (!select) return;
    const presets = JSON.parse(localStorage.getItem('ton_presets') || '{}');
    select.innerHTML = '<option value="">-- Selecione --</option>';
    Object.keys(presets).forEach(name => {
        select.innerHTML += `<option value="${name}">${name}</option>`;
    });
}

// --- AUTOSAVE E CONFIG ---
let saveTimeout;
function queueSave() { clearTimeout(saveTimeout); saveTimeout = setTimeout(() => { autoSaveConfig(); }, 500); }

function autoSaveConfig() {
    const config = { labels: {}, colors: {}, faders: {}, knobs: {}, buttons: {}, ccs: {}, leslie: "0" };
    labelsToEdit.forEach(id => { const el = getEl(`lbl-${id}`); if (el) config.labels[id] = el.textContent; });
    for (let i=1; i<=5; i++) { const el = getEl(`pad-${i}`); if (el) config.colors[`p${i}`] = el.getAttribute('data-color') || 'purple'; }
    for (let i=1; i<=6; i++) { const el = getEl(`strip-ch${i}`); if (el) config.colors[`ch${i}`] = el.getAttribute('data-color') || ''; }
    UI.sliders.forEach(s => config.faders[s.id] = s.value);
    UI.knobs.forEach(k => config.knobs[k.id] = k.getAttribute('data-val'));
    UI.stripBtns.forEach(b => config.buttons[b.id] = b.getAttribute('data-status'));
    config.leslie = UI.leslie.getAttribute('data-status') || '0';
    
    // Salvar Mapeamento de CCs
    const allControls = [...UI.sliders, ...UI.knobs, ...UI.stripBtns, ...document.querySelectorAll('.drum-pad'), ...document.querySelectorAll('.scene-btn'), UI.leslie];
    allControls.forEach(el => { if (el && el.id) config.ccs[el.id] = el.getAttribute('data-cc'); });
    
    localStorage.setItem('ton_config', JSON.stringify(config));
}

function loadConfig() {
    const raw = localStorage.getItem('ton_config');
    let config = raw ? JSON.parse(raw) : { labels: {}, colors: {}, faders: {}, knobs: {}, buttons: {}, ccs: {}, leslie: "0" };

    labelsToEdit.forEach(id => { const text = config.labels[id] || localStorage.getItem(`ton_lbl_${id}`); if (text && getEl(`lbl-${id}`)) getEl(`lbl-${id}`).textContent = text; });
    for (let i=1; i<=5; i++) { let c = config.colors[`p${i}`] || localStorage.getItem(`ton_color_p${i}`); if (c) { if(c.startsWith('pad-')) c = c.replace('pad-', ''); getEl(`pad-${i}`).setAttribute('data-color', c); } }
    for (let i=1; i<=6; i++) { if (config.colors && config.colors[`ch${i}`]) { getEl(`strip-ch${i}`).setAttribute('data-color', config.colors[`ch${i}`]); } else if (getEl(`strip-ch${i}`)) { getEl(`strip-ch${i}`).removeAttribute('data-color'); } }
    
    // Carregar Mapeamento de CCs
    if (config.ccs) {
        const allControls = [...UI.sliders, ...UI.knobs, ...UI.stripBtns, ...document.querySelectorAll('.drum-pad'), ...document.querySelectorAll('.scene-btn'), document.getElementById('leslie-switch')];
        allControls.forEach(el => {
            if (el && el.id && config.ccs[el.id]) el.setAttribute('data-cc', config.ccs[el.id]);
        });
    }

    UI.sliders.forEach(s => { s.value = config.faders[s.id] || 0; renderFader(s.id, s.value); });
    UI.knobs.forEach(k => { renderKnob(k, parseInt(config.knobs[k.id] || k.getAttribute('data-val') || 0)); });
    UI.stripBtns.forEach(b => { const st = config.buttons[b.id] || '0'; b.setAttribute('data-status', st); b.classList.toggle('active', st === '1'); });
    const ls = config.leslie || '0'; UI.leslie.setAttribute('data-status', ls); UI.leslie.classList.toggle('active', ls === '1');
    
    if (document.getElementById('midi-channel')) document.getElementById('midi-channel').value = localStorage.getItem('ton_midi_channel') || '1';
    if (document.getElementById('midi-cc-mapping')) document.getElementById('midi-cc-mapping').value = localStorage.getItem('ton_midi_cc_mapping') || 'default';
    if (document.getElementById('midi-input-filter')) document.getElementById('midi-input-filter').value = localStorage.getItem('ton_midi_input_filter') || 'all';

    if(!raw) autoSaveConfig();
}

// --- PRESETS: IMPORTAÇÃO POR ARQUIVO ---
document.getElementById('input-import-preset-file').addEventListener('change', (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const parsed = JSON.parse(evt.target.result);
            if (parsed && typeof parsed === 'object') {
                let presets = JSON.parse(localStorage.getItem('ton_presets') || '{}');
                let name = file.name.replace('.json', '');
                presets[name] = parsed;
                localStorage.setItem('ton_presets', JSON.stringify(presets));
                if (UI.presetsMenu.style.display === 'flex') {
                    updatePresetSelect();
                    document.getElementById('preset-selector').value = name;
                    document.getElementById('preset-name').value = name;
                }
                alert("Preset importado com sucesso!");
            }
        } catch(err) { console.error("Erro na leitura do arquivo JSON."); alert("Erro ao importar preset."); }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
});

// --- ALTERNAR PÁGINAS ---
UI.btnTogglePage.addEventListener('click', () => {
    const isPage1 = UI.viewPage1.style.display !== 'none';
    UI.viewPage1.style.display = isPage1 ? 'none' : 'flex';
    UI.viewPage2.style.display = isPage1 ? 'flex' : 'none';
    UI.btnTogglePage.textContent = isPage1 ? 'PÁG 1' : 'PÁG 2';
});

// --- EVENT DELEGATION CLICKS E MENUS ---
document.addEventListener('click', (e) => {
    const target = e.target;
    if (target.id === 'hamburguer-btn') { UI.mainMenu.style.display = 'flex'; return; }
    if (target.id === 'btn-close-main') { UI.mainMenu.style.display = 'none'; return; }
    if (target.id === 'btn-close-textos') { UI.textMenu.style.display = 'none'; return; }
    if (target.id === 'btn-close-pads') { UI.padMenu.style.display = 'none'; return; }
    if (target.id === 'btn-close-midi') { UI.midiMenu.style.display = 'none'; return; }

    // Lógica Presets Modals Buttons
    if (target.id === 'btn-open-presets') {
        UI.mainMenu.style.display = 'none';
        updatePresetSelect();
        document.getElementById('preset-name').value = '';
        UI.presetsMenu.style.display = 'flex';
        return;
    }
    if (target.id === 'btn-close-presets') {
        UI.presetsMenu.style.display = 'none';
        return;
    }
    if (target.id === 'btn-save-preset') {
        let name = document.getElementById('preset-name').value.trim();
        if(!name) { alert("Digite um nome para o preset."); return; }
        let presets = JSON.parse(localStorage.getItem('ton_presets') || '{}');
        autoSaveConfig();
        presets[name] = JSON.parse(localStorage.getItem('ton_config'));
        localStorage.setItem('ton_presets', JSON.stringify(presets));
        updatePresetSelect();
        document.getElementById('preset-selector').value = name;
        alert("Preset salvo com sucesso!");
        return;
    }
    if (target.id === 'btn-load-preset') {
        let name = document.getElementById('preset-selector').value;
        if(!name) { alert("Selecione um preset."); return; }
        let presets = JSON.parse(localStorage.getItem('ton_presets') || '{}');
        if(presets[name]) {
            localStorage.setItem('ton_config', JSON.stringify(presets[name]));
            loadConfig();
            alert("Preset carregado!");
        }
        return;
    }
    if (target.id === 'btn-delete-preset') {
        let name = document.getElementById('preset-selector').value;
        if(!name) return;
        if(confirm(`Tem certeza que deseja excluir o preset "${name}"?`)) {
            let presets = JSON.parse(localStorage.getItem('ton_presets') || '{}');
            delete presets[name];
            localStorage.setItem('ton_presets', JSON.stringify(presets));
            updatePresetSelect();
            document.getElementById('preset-name').value = '';
        }
        return;
    }
    if (target.id === 'btn-rename-preset') {
        let name = document.getElementById('preset-selector').value;
        let newName = document.getElementById('preset-name').value.trim();
        if(!name || !newName || name === newName) { alert("Selecione um preset e digite um novo nome."); return; }
        let presets = JSON.parse(localStorage.getItem('ton_presets') || '{}');
        if(presets[name]) {
            presets[newName] = presets[name];
            delete presets[name];
            localStorage.setItem('ton_presets', JSON.stringify(presets));
            updatePresetSelect();
            document.getElementById('preset-selector').value = newName;
            alert("Preset renomeado!");
        }
        return;
    }
    if (target.id === 'btn-export-preset') {
        let name = document.getElementById('preset-selector').value;
        if(!name) { alert("Selecione um preset para exportar."); return; }
        let presets = JSON.parse(localStorage.getItem('ton_presets') || '{}');
        let data = presets[name];
        if(data) {
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `preset_${name.replace(/\s+/g, '_')}.json`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        }
        return;
    }
    if (target.id === 'btn-import-preset') {
        document.getElementById('input-import-preset-file').click();
        return;
    }

    // Abertura Configuração MIDI
    if (target.id === 'btn-open-midi') {
        UI.mainMenu.style.display = 'none';
        if (document.getElementById('midi-channel')) document.getElementById('midi-channel').value = localStorage.getItem('ton_midi_channel') || '1';
        if (document.getElementById('midi-cc-mapping')) document.getElementById('midi-cc-mapping').value = localStorage.getItem('ton_midi_cc_mapping') || 'default';
        if (document.getElementById('midi-input-filter')) document.getElementById('midi-input-filter').value = localStorage.getItem('ton_midi_input_filter') || 'all';
        
        // Mapeamento dinâmico de CCs no menu
        const ccContainer = document.getElementById('cc-inputs-container');
        if(ccContainer) {
            ccContainer.innerHTML = '';
            const allControls = [...UI.sliders, ...UI.knobs, ...UI.stripBtns, ...document.querySelectorAll('.drum-pad'), ...document.querySelectorAll('.scene-btn'), UI.leslie];
            allControls.forEach(el => {
                if(!el || !el.id) return;
                const div = document.createElement('div'); div.className = 'form-group';
                let typeName = el.classList.contains('midi-slider') ? 'Fader' : 
                               el.classList.contains('knob-dial') ? 'Knob' : 
                               el.classList.contains('drum-pad') ? 'Pad' : 
                               el.classList.contains('scene-btn') ? 'Scene' : 
                               el.id === 'leslie-switch' ? 'Leslie' : 'Botão';
                let ccVal = el.getAttribute('data-cc') || '0';
                div.innerHTML = `<label>${typeName} ${el.id.toUpperCase()}</label><input type="number" id="input-cc-${el.id}" value="${ccVal}" min="0" max="127">`;
                ccContainer.appendChild(div);
            });
        }
        UI.midiMenu.style.display = 'flex';
        return;
    }

    // Salvamento Configuração MIDI
    if (target.id === 'btn-save-midi') {
        if (document.getElementById('midi-channel')) localStorage.setItem('ton_midi_channel', document.getElementById('midi-channel').value);
        if (document.getElementById('midi-cc-mapping')) localStorage.setItem('ton_midi_cc_mapping', document.getElementById('midi-cc-mapping').value);
        if (document.getElementById('midi-input-filter')) localStorage.setItem('ton_midi_input_filter', document.getElementById('midi-input-filter').value);
        
        // Salvar customização de CCs
        const allControls = [...UI.sliders, ...UI.knobs, ...UI.stripBtns, ...document.querySelectorAll('.drum-pad'), ...document.querySelectorAll('.scene-btn'), UI.leslie];
        allControls.forEach(el => {
            if(!el || !el.id) return;
            const input = document.getElementById(`input-cc-${el.id}`);
            if(input && input.value !== '') el.setAttribute('data-cc', input.value);
        });

        UI.midiMenu.style.display = 'none';
        queueSave();
        return;
    }

    if (target.id === 'btn-open-textos') {
        UI.mainMenu.style.display = 'none'; UI.textContainer.innerHTML = '';
        labelsToEdit.forEach(id => {
            const lbl = getEl('lbl-' + id); if(!lbl) return;
            const div = document.createElement('div'); div.className = 'form-group';
            let typeName = id.startsWith('k') ? 'Knob' : id.startsWith('f') ? 'Fader' : id.startsWith('s') ? 'Scene' : id.startsWith('b') ? 'Botão' : 'Pad';
            div.innerHTML = `<label>${typeName} ${id.toUpperCase()}</label><input type="text" id="input-edit-${id}" value="${lbl.textContent}">`;
            UI.textContainer.appendChild(div);
        });
        UI.textMenu.style.display = 'flex'; return;
    }

    if (target.id === 'btn-save-textos') {
        labelsToEdit.forEach(id => { const input = getEl(`input-edit-${id}`); if (input) getEl(`lbl-${id}`).textContent = input.value; });
        UI.textMenu.style.display = 'none'; queueSave(); return;
    }

    if (target.id === 'btn-open-pads') {
        UI.mainMenu.style.display = 'none';
        for (let i=1; i<=5; i++) { const sel = getEl(`color-p${i}`); if(sel) sel.value = getEl(`pad-${i}`).getAttribute('data-color') || 'purple'; }
        for (let i=1; i<=6; i++) { const sel = getEl(`color-ch${i}`); if(sel) sel.value = getEl(`strip-ch${i}`).getAttribute('data-color') || ''; }
        UI.padMenu.style.display = 'flex'; return;
    }

    if (target.id === 'btn-save-pads') {
        for (let i=1; i<=5; i++) { const sel = getEl(`color-p${i}`); if(sel) getEl(`pad-${i}`).setAttribute('data-color', sel.value); }
        for (let i=1; i<=6; i++) { const sel = getEl(`color-ch${i}`); if(sel) { const val = sel.value; if(val) getEl(`strip-ch${i}`).setAttribute('data-color', val); else getEl(`strip-ch${i}`).removeAttribute('data-color'); } }
        UI.padMenu.style.display = 'none'; queueSave(); return;
    }

    const stripBtn = target.closest('.strip-btn');
    if (stripBtn) {
        let state = stripBtn.getAttribute('data-status') === '1' ? '0' : '1';
        stripBtn.setAttribute('data-status', state); stripBtn.classList.toggle('active', state === '1');
        if(typeof sendControlChange === 'function') sendControlChange(parseInt(stripBtn.getAttribute('data-cc')), state === '1' ? 127 : 0); 
        queueSave(); return;
    }

    const leslieBtn = target.closest('#leslie-switch');
    if (leslieBtn) {
        let state = leslieBtn.getAttribute('data-status') === '1' ? '0' : '1';
        leslieBtn.setAttribute('data-status', state); leslieBtn.classList.toggle('active', state === '1');
        if(typeof sendControlChange === 'function') sendControlChange(parseInt(leslieBtn.getAttribute('data-cc')), state === '1' ? 127 : 0); 
        queueSave(); return;
    }
});

document.addEventListener('input', (e) => { if (e.target.classList.contains('midi-slider')) { renderFader(e.target.id, e.target.value); if(typeof sendControlChange === 'function') sendControlChange(parseInt(e.target.getAttribute('data-cc')), parseInt(e.target.value)); } });
document.addEventListener('change', (e) => { 
    if (e.target.classList.contains('midi-slider')) queueSave(); 
    if (e.target.id === 'midi-outputs' && midiAccess) midiOutput = midiAccess.outputs.get(e.target.value); 
    if (e.target.id === 'preset-selector') document.getElementById('preset-name').value = e.target.value;
});

// --- MIDI IN E OUT ---
let midiAccess = null; let midiOutput = null;

// FUNÇÃO RESTAURADA: Envio de MIDI Control Change
function sendControlChange(cc, value) {
    if (!midiOutput || isNaN(cc)) return;
    // Pega o canal MIDI selecionado (1 a 16) e converte para o index (0 a 15)
    const channel = parseInt(localStorage.getItem('ton_midi_channel') || '1') - 1;
    
    try {
        // Envia mensagem do tipo Control Change (0xB0 + index do canal)
        midiOutput.send([0xB0 + channel, cc, value]);
    } catch (err) {
        console.error("Erro ao enviar mensagem MIDI: ", err);
    }
}

if (navigator.requestMIDIAccess) navigator.requestMIDIAccess().then(onMIDISuccess, () => console.warn("MIDI negado."));

function onMIDISuccess(midi) { 
    midiAccess = midi; updateOutputs(); updateInputs(); 
    midiAccess.onstatechange = () => { updateOutputs(); updateInputs(); }; 
}

function updateOutputs() {
    const outputs = midiAccess.outputs; UI.midiOutputs.innerHTML = '';
    if (outputs.size === 0) { UI.midiOutputs.innerHTML = '<option value="">Sem Saída MIDI</option>'; UI.midiStatus.classList.remove('connected'); midiOutput = null; return; }
    UI.midiStatus.classList.add('connected');
    outputs.forEach(out => { const opt = document.createElement('option'); opt.value = out.id; opt.textContent = out.name.substring(0, 20); UI.midiOutputs.appendChild(opt); });
    midiOutput = outputs.get(UI.midiOutputs.value);
}

function updateInputs() { midiAccess.inputs.forEach(input => input.onmidimessage = handleIncomingMIDI); }

function handleIncomingMIDI(msg) {
    const [status, ccOrNote, value] = msg.data;
    const cmd = status & 0xF0;
    const msgCh = (status & 0x0F) + 1;
    const filterOpt = localStorage.getItem('ton_midi_input_filter') || 'all';
    const targetCh = parseInt(localStorage.getItem('ton_midi_channel') || '1');
    
    if (filterOpt === 'match' && msgCh !== targetCh) return;

    if (cmd === 0xB0) {
        // Sincroniza faders apenas se NÃO estiverem sendo tocados (Motorizado Virtual limpo)
        UI.sliders.forEach(s => { 
            if (s !== activeSlider && parseInt(s.getAttribute('data-cc')) === ccOrNote) { 
                s.value = value; 
                renderFader(s.id, value); 
            }
        });
        // Sincroniza knobs apenas se NÃO estiverem sendo arrastados
        UI.knobs.forEach(k => { 
            if (k !== activeKnob && parseInt(k.getAttribute('data-cc')) === ccOrNote) { 
                renderKnob(k, value); 
            }
        });
        
        UI.stripBtns.forEach(b => { if (parseInt(b.getAttribute('data-cc')) === ccOrNote) { let on = value >= 64; b.setAttribute('data-status', on ? '1' : '0'); b.classList.toggle('active', on); }});
        if (parseInt(UI.leslie.getAttribute('data-cc')) === ccOrNote) { let on = value >= 64; UI.leslie.setAttribute('data-status', on ? '1' : '0'); UI.leslie.classList.toggle('active', on); }
    }
    else if (cmd === 0x90 || cmd === 0x80) {
        let isOn = cmd === 0x90 && value > 0;
        document.querySelectorAll('.drum-pad').forEach(p => { if (parseInt(p.getAttribute('data-cc')) === ccOrNote) p.classList.toggle('active-touch', isOn); });
        document.querySelectorAll('.scene-btn').forEach(s => { if (parseInt(s.getAttribute('data-cc')) === ccOrNote) s.classList.toggle('active', isOn); });
    }
}

// --- RENDERIZADORES ---
function renderKnob(knobEl, value) {
    knobEl.setAttribute('data-val', value);
    const indicator = getEl('ind-' + knobEl.id); if (indicator) indicator.style.transform = `rotate(${-135 + (value / 127) * 270}deg)`;
    let activeLeds = Math.round((value / 127) * 11);
    const ring = getEl('ring-' + knobEl.id);
    if (ring) ring.querySelectorAll('.knob-led').forEach((led, idx) => led.classList.toggle('on', idx < activeLeds));
}

function renderFader(sliderId, value) {
    let activeLeds = Math.round((value / 127) * 10);
    const strip = getEl('leds-' + sliderId);
    if (strip) strip.querySelectorAll('.fader-led').forEach((led, idx) => led.classList.toggle('on', idx < activeLeds));
}

// --- DRAG DE KNOBS ---
let activeKnob = null; let knobStartY = 0; let knobStartVal = 0; let knobRafId = null;
let activeSlider = null; // Garante que o MIDI IN não lute contra o dedo do usuário

function onKnobDrag(e) {
    if(!activeKnob) return; e.preventDefault();
    let isPortrait = window.innerHeight > window.innerWidth; let delta;
    if (isPortrait) { let x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX; delta = x - knobStartY; } 
    else { let y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY; delta = knobStartY - y; }
    
    let newVal = Math.max(0, Math.min(127, knobStartVal + Math.round(delta * 1.2))); 
    
    if (knobRafId) cancelAnimationFrame(knobRafId);
    knobRafId = requestAnimationFrame(() => { renderKnob(activeKnob, newVal); if(typeof sendControlChange === 'function') sendControlChange(parseInt(activeKnob.getAttribute('data-cc')), newVal); });
}

function stopKnobDrag() { activeKnob = null; document.removeEventListener('touchmove', onKnobDrag); document.removeEventListener('mousemove', onKnobDrag); queueSave(); }

// --- EVENTOS TÁTEIS: PADS, SCENES, KNOBS E FADERS ---
const handlePress = (e) => {
    const target = e.target;

    // Rastreia se estamos tocando um fader para silenciar o input MIDI virtual dele
    if (target.classList && target.classList.contains('midi-slider')) {
        activeSlider = target;
    }

    const knob = target.closest('.knob-dial');
    if (knob) {
        e.preventDefault(); activeKnob = knob;
        let isPortrait = window.innerHeight > window.innerWidth;
        knobStartY = isPortrait ? (e.type.includes('touch') ? e.touches[0].clientX : e.clientX) : (e.type.includes('touch') ? e.touches[0].clientY : e.clientY);
        knobStartVal = parseInt(activeKnob.getAttribute('data-val')) || 0;
        document.addEventListener('touchmove', onKnobDrag, {passive: false}); document.addEventListener('mousemove', onKnobDrag);
        document.addEventListener('touchend', stopKnobDrag); document.addEventListener('mouseup', stopKnobDrag); return;
    }

    const pad = target.closest('.drum-pad');
    if (pad) {
        if (e.type === 'touchstart') e.preventDefault();
        if (!pad.classList.contains('active-touch')) {
            if (navigator.vibrate) navigator.vibrate(25);
            pad.classList.add('active-touch'); if(typeof sendControlChange === 'function') sendControlChange(parseInt(pad.getAttribute('data-cc')), 127);
        }
        return;
    }

    const scene = target.closest('.scene-btn');
    if (scene) {
        if (e.type === 'touchstart') e.preventDefault();
        if (!scene.classList.contains('active')) { scene.classList.add('active'); if(typeof sendControlChange === 'function') sendControlChange(parseInt(scene.getAttribute('data-cc')), parseInt(scene.getAttribute('data-val'))); }
        return;
    }
};

const handleRelease = (e) => {
    // Libera o fader ativo
    if (activeSlider) {
        activeSlider = null;
    }

    const target = e.target;
    const pad = target.closest('.drum-pad');
    if (pad) {
        if (e.type === 'touchend') e.preventDefault();
        if (pad.classList.contains('active-touch')) { pad.classList.remove('active-touch'); if(typeof sendControlChange === 'function') sendControlChange(parseInt(pad.getAttribute('data-cc')), 0); }
        return;
    }
    const scene = target.closest('.scene-btn');
    if (scene) {
        if (e.type === 'touchend') e.preventDefault();
        if (scene.classList.contains('active')) { scene.classList.remove('active'); if(typeof sendControlChange === 'function') sendControlChange(parseInt(scene.getAttribute('data-cc')), 0); }
        return;
    }
};

document.addEventListener('touchstart', handlePress, {passive: false}); document.addEventListener('mousedown', handlePress);
document.addEventListener('touchend', handleRelease); document.addEventListener('mouseup', handleRelease); document.addEventListener('mouseleave', handleRelease, true);

// --- SISTEMA INICIALIZADOR ---
UI.overlay.addEventListener('click', async () => {
    try { if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
          if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape'); } catch (err) {}
    UI.overlay.style.display = 'none'; UI.app.style.display = 'flex';
});

window.addEventListener('DOMContentLoaded', () => { initDOMCache(); createLEDs(); buildPadColorsMenu(); loadConfig(); });
