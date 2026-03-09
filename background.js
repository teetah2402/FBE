//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : background.js
//#######################################################################

console.log("🟢 Flowork OS Bridge Active & Listening...");

const IS_DEV_MODE = true;
const BASE_URL = IS_DEV_MODE ? "http://localhost:5173" : "https://floworkos.com";

// =========================================================
// Sistem Split Background / Modular (SAFE LOAD ENGINE)
// =========================================================
const coreModules = [
    'modules/fake_name.js',
    'modules/seo_checker.js',
    'modules/content_forge.js',
    'modules/yt_deepscan.js',
    'modules/tt_deepscan.js',
    'modules/god_mode_scan.js',
    'modules/shopee_checker.js',
    'modules/tt_ad_background.js',
    'modules/web_auditor.js',
     'modules/wa_radar.js',
];

coreModules.forEach(mod => {
    try {
        importScripts(mod);
        console.log(`✅ [Module Loader] Modul aktif: ${mod}`);
    } catch (e) {
        console.error(`⚠️ [Module Loader] Gagal memuat: ${mod} (Abaikan jika file belum dibuat)`, e);
    }
});

if (typeof initTikTokRadar === 'function') {
    try { initTikTokRadar(); } catch(e){}
}

// =========================================================
// 1. SISTEM DETEKSI INSTALASI & UPDATE
// =========================================================
chrome.runtime.onInstalled.addListener((details) => {
    const syncRegistryCache = () => {
        fetch(`${BASE_URL}/store/registry.json?t=` + Date.now())
            .then(res => res.json())
            .then(data => {
                if (data && data.meta) {
                    chrome.storage.local.set({
                        'flowork_registry_cache': data,
                        'flowork_registry_version': data.meta.version,
                        'flowork_registry_timestamp': Date.now()
                    });
                    console.log(`✅ [Flowork Bridge] Database Registry disinkronisasi dari ${BASE_URL}`);
                }
            }).catch(e => console.error("❌ Gagal sync registry awal:", e));
    };

    if (details.reason === "install") {
        console.log("🚀 [Flowork System] Ekstensi Baru Diinstal!");
        syncRegistryCache();
        chrome.tabs.query({ url: ["*://*.floworkos.com/*", "*://localhost/*", "*://127.0.0.1/*"] }, (tabs) => {
            tabs.forEach(tab => chrome.tabs.reload(tab.id));
        });
        chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
    } else if (details.reason === "update") {
        console.log(`🚀 [Flowork System] Ekstensi Diupdate ke versi ${chrome.runtime.getManifest().version}`);
        syncRegistryCache();
        chrome.tabs.query({ url: ["*://*.floworkos.com/*", "*://localhost/*", "*://127.0.0.1/*"] }, (tabs) => {
            tabs.forEach(tab => chrome.tabs.reload(tab.id));
        });
    }
});

chrome.runtime.onUpdateAvailable.addListener((details) => {
    chrome.runtime.reload();
});

chrome.runtime.onStartup.addListener(() => {
    chrome.tabs.create({ url: `${BASE_URL}/store` });
    chrome.storage.local.get(['flowork_autoboot_dashboard'], (result) => {
        if (result.flowork_autoboot_dashboard !== false) {
            chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
        }
    });
});

// =========================================================
// Sistem Jembatan API Flowork OS (Core Execute)
// =========================================================
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    if (request.action === 'ping') {
        sendResponse({ status: "connected", version: chrome.runtime.getManifest().version });
        return true;
    }

    if (request.action === 'execute_api') {
        const { api, args } = request.payload;

        let appId = "unknown";
        try {
            const urlStr = sender.url || "";
            let appPathSegment = "";
            if (urlStr.includes('/flow/')) {
                appPathSegment = urlStr.split('/flow/')[1];
            } else if (urlStr.includes('/store/')) {
                appPathSegment = urlStr.split('/store/')[1];
            }

            if (appPathSegment) {
                const parts = appPathSegment.split('/');
                if (parts.length > 0 && parts[0] !== "") {
                    appId = parts[0];
                    appId = appId.split('?')[0].split('#')[0];
                }
            }
        } catch(e) {}

        chrome.storage.local.get([`flowork_app_state_${appId}`, 'flowork_registry_cache'], (result) => {

            const bypassedApps = ['content-forge', 'webshield-auditor', 'seo-checker', 'tt-deepscan', 'yt-deepscan'];
            let isAppActive = bypassedApps.includes(appId);

            if (!isAppActive) {
                if (result[`flowork_app_state_${appId}`] !== undefined) {
                    isAppActive = result[`flowork_app_state_${appId}`];
                }
                else if (result.flowork_registry_cache && result.flowork_registry_cache.apps) {
                    const matchedApp = result.flowork_registry_cache.apps.find(a => a.id === appId);
                    if (matchedApp) {
                        isAppActive = matchedApp.buton === 'enable';
                    }
                }
            }

            if (!isAppActive) {
                console.warn(`🛑 [Flowork Hub] Akses ditolak! App '${appId}' sedang dinonaktifkan.`);
                sendResponse({ success: false, error: "APP_DISABLED_BY_USER", data: null });
                return;
            }

            try {
                const apiPath = api.split('.');
                let parent, target;

                // [PERBAIKAN FATAL] SMART ROUTING ENGINE
                if (apiPath[0] in chrome) {
                    parent = chrome;
                    target = chrome;
                } else if (apiPath[0] in self) {
                    parent = self;
                    target = self;
                } else {
                    throw new Error(`Endpoint [${apiPath[0]}] tidak ditemukan di sistem OS.`);
                }

                for (let i = 0; i < apiPath.length; i++) {
                    if (target === undefined || target === null) {
                        throw new Error(`Jalur API terputus pada: ${apiPath.slice(0, i+1).join('.')}`);
                    }
                    parent = target;
                    target = target[apiPath[i]];
                }

                if (typeof target === 'function') {
                    const resultTarget = target.apply(parent, args || []);
                    if (resultTarget instanceof Promise) {
                        resultTarget
                            .then(data => sendResponse({ success: true, data }))
                            .catch(err => {
                                const errMsg = err ? (err.message || err.toString()) : "Unknown Promise Rejection";
                                console.error(`❌ [Module Error] ${api}:`, errMsg);
                                sendResponse({ success: false, error: errMsg });
                            });
                    } else {
                        sendResponse({ success: true, data: resultTarget });
                    }
                } else {
                    sendResponse({ success: true, data: target });
                }
            } catch (err) {
                const errMsg = err ? (err.message || err.toString()) : "Unknown Bridge Crash";
                console.error("❌ [Bridge Fatal Error]:", errMsg);
                sendResponse({ success: false, error: errMsg });
            }
        });

        return true;
    }
});

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
});