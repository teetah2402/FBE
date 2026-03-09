function syncSeoCheckerMenu(isActive) {
    if (isActive) {
        chrome.contextMenus.create({
            id: "flowork_seo_scan",
            title: "🔎 Analisa SEO Halaman Ini (Flowork)",
            contexts: ["page"]
        }, () => { chrome.runtime.lastError; }); // Callback kosong untuk mencegah error console jika menu sudah ada
    } else {
        chrome.contextMenus.remove("flowork_seo_scan", () => { chrome.runtime.lastError; });
    }
}

// [KODE BARU] Cek status terakhir saat modul Service Worker ini dihidupkan browser
chrome.storage.local.get(['flowork_app_state_seo-checker', 'flowork_registry_cache'], (result) => {
    let isActive = false;
    if (result['flowork_app_state_seo-checker'] !== undefined) {
        isActive = result['flowork_app_state_seo-checker'];
    } else if (result.flowork_registry_cache && result.flowork_registry_cache.apps) {
        const matchedApp = result.flowork_registry_cache.apps.find(a => a.id === 'seo-checker');
        if (matchedApp) isActive = matchedApp.ext === 'yes';
    }
    syncSeoCheckerMenu(isActive);
});

// [KODE BARU] Listener Real-Time: Langsung tambah/hapus menu begitu user klik Toggle di Dashboard
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes['flowork_app_state_seo-checker']) {
        syncSeoCheckerMenu(changes['flowork_app_state_seo-checker'].newValue);
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "flowork_seo_scan") {
        // Simpan ID Tab target secara presisi ke local storage sebelum pindah tab
        chrome.storage.local.set({ flowork_target_tab_id: tab.id }, () => {
            const targetUrl = "https://floworkos.com/flow/seo-checker#openapp";
            chrome.tabs.create({ url: targetUrl });
            console.log("🚀 [Flowork Bridge] Membuka SEO Checker untuk tab:", tab.url, "| Kunci ID:", tab.id);
        });
    }
});