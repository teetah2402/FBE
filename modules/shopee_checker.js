//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : modules/shopee_checker.js
// CORE LOGIC : Context Menu & Target Memory untuk Shopee DeepScan V6
//#######################################################################

// =========================================================
// Konstanta tidak perlu dideklarasikan ulang jika sudah ada di background.js
// karena file ini di-import menggunakan importScripts.
// BASE_URL sudah otomatis tersedia dari background.js
// =========================================================

const SHOPEE_DEEPSCAN_APP_ID = "shopee-deepscan";
const SHOPEE_DEEPSCAN_MENU_ID = "flowork_menu_shopee_deepscan";

// Fungsi dinamis untuk membuat atau menghapus Context Menu
function syncShopeeDeepscanMenu(isActive) {
    if (isActive) {
        chrome.contextMenus.create({
            id: SHOPEE_DEEPSCAN_MENU_ID,
            title: "🛍️ Scan dengan Shopee DeepScan",
            contexts: ["page", "link", "selection"],
            documentUrlPatterns: [
                "*://shopee.co.id/*",
                "*://*.shopee.co.id/*"
            ] // Menu muncul saat sedang membuka halaman web Shopee
        }, () => {
            // Abaikan error jika menu sudah ada
            if (chrome.runtime.lastError) {}
        });
    } else {
        chrome.contextMenus.remove(SHOPEE_DEEPSCAN_MENU_ID, () => {
            // Abaikan error jika menu memang tidak ada
            if (chrome.runtime.lastError) {}
        });
    }
}

// 1. Inisialisasi awal saat Chrome baru menyala / Ekstensi di-reload
chrome.storage.local.get([`flowork_app_state_${SHOPEE_DEEPSCAN_APP_ID}`, 'flowork_registry_cache'], (result) => {
    let isActive = false;

    // Cek state spesifik dari user dulu
    if (result[`flowork_app_state_${SHOPEE_DEEPSCAN_APP_ID}`] !== undefined) {
        isActive = result[`flowork_app_state_${SHOPEE_DEEPSCAN_APP_ID}`];
    }
    // Jika belum diset, baca dari default registry
    else if (result.flowork_registry_cache && result.flowork_registry_cache.apps) {
        const matchedApp = result.flowork_registry_cache.apps.find(a => a.id === SHOPEE_DEEPSCAN_APP_ID);
        if (matchedApp) {
            isActive = matchedApp.buton === 'enable';
        }
    }

    syncShopeeDeepscanMenu(isActive);
});

// 2. Listener Reaktif (Sinkronisasi Klik Kanan secara Real-Time dengan Hub Dashboard)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes[`flowork_app_state_${SHOPEE_DEEPSCAN_APP_ID}`]) {
        syncShopeeDeepscanMenu(changes[`flowork_app_state_${SHOPEE_DEEPSCAN_APP_ID}`].newValue);
    }
});

// 3. Eksekusi Klik Kanan (Anti-Halu & Deep Linking)
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === SHOPEE_DEEPSCAN_MENU_ID) {
        // Simpan ID Tab Shopee yang diklik ke memori lokal
        chrome.storage.local.set({ 'flowork_target_tab_id': tab.id }, () => {
            // Buka Workspace dan trigger hashtag #openapp agar langsung bypass Lander
            // Menggunakan BASE_URL dinamis dari background.js (Localhost / Production)
            chrome.tabs.create({ url: `${BASE_URL}/flow/shopee-deepscan#openapp` });
        });
    }
});