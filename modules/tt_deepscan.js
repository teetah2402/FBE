//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : modules/tt_deepscan.js
// CORE LOGIC : Context Menu & Target Memory untuk TT DeepScan
//#######################################################################

// =========================================================
// [KODE DIKOMENTARI] Menghindari Crash Identifier 'has already been declared'
// Karena file ini di-import oleh background.js, variabel ini sudah ada di Global Scope.
// const IS_DEV_MODE = true;
// const BASE_URL = IS_DEV_MODE ? "http://localhost:5173" : "https://floworkos.com";
// =========================================================

const TT_DEEPSCAN_APP_ID = "tt-deepscan";
const TT_DEEPSCAN_MENU_ID = "flowork_menu_tt_deepscan";

// Fungsi dinamis untuk membuat atau menghapus Context Menu
function syncTtDeepscanMenu(isActive) {
    if (isActive) {
        chrome.contextMenus.create({
            id: TT_DEEPSCAN_MENU_ID,
            title: "🎯 Scan dengan TT DeepScan",
            contexts: ["page", "link", "video"],
            documentUrlPatterns: ["*://*.tiktok.com/*"] // Menu cuma muncul kalau lagi buka TikTok
        }, () => {
            // Abaikan error jika menu sudah ada
            if (chrome.runtime.lastError) {}
        });
    } else {
        chrome.contextMenus.remove(TT_DEEPSCAN_MENU_ID, () => {
            // Abaikan error jika menu memang tidak ada
            if (chrome.runtime.lastError) {}
        });
    }
}

// 1. Inisialisasi awal saat Chrome baru menyala / Ekstensi di-reload
chrome.storage.local.get([`flowork_app_state_${TT_DEEPSCAN_APP_ID}`, 'flowork_registry_cache'], (result) => {
    let isActive = false;

    // Cek state spesifik dari user dulu
    if (result[`flowork_app_state_${TT_DEEPSCAN_APP_ID}`] !== undefined) {
        isActive = result[`flowork_app_state_${TT_DEEPSCAN_APP_ID}`];
    }
    // Jika belum diset, baca dari default registry
    else if (result.flowork_registry_cache && result.flowork_registry_cache.apps) {
        const matchedApp = result.flowork_registry_cache.apps.find(a => a.id === TT_DEEPSCAN_APP_ID);
        if (matchedApp) {
            isActive = matchedApp.buton === 'enable';
        }
    }

    syncTtDeepscanMenu(isActive);
});

// 2. Listener Reaktif (Sinkronisasi Klik Kanan secara Real-Time dengan Hub Dashboard)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes[`flowork_app_state_${TT_DEEPSCAN_APP_ID}`]) {
        syncTtDeepscanMenu(changes[`flowork_app_state_${TT_DEEPSCAN_APP_ID}`].newValue);
    }
});

// 3. Eksekusi Klik Kanan (Anti-Halu & Deep Linking)
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === TT_DEEPSCAN_MENU_ID) {
        // Simpan ID Tab TikTok yang diklik ke memori lokal
        chrome.storage.local.set({ 'flowork_target_tab_id': tab.id }, () => {
            // Buka Workspace dan trigger hashtag #openapp agar langsung bypass Lander
            // Menggunakan BASE_URL dinamis dari background.js (Localhost / Production)
            chrome.tabs.create({ url: `${BASE_URL}/flow/tt-deepscan#openapp` });
        });
    }
});