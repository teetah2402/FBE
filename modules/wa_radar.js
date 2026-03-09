//#######################################################################
// File NAME : modules/wa_radar.js
// CORE LOGIC : Context Menu & Target Memory untuk WA Lead Radar
//#######################################################################

const WA_RADAR_APP_ID = "wa-lead-radar";
const WA_RADAR_MENU_ID = "flowork_menu_wa_radar";

function syncWaRadarMenu(isActive) {
    if (isActive) {
        chrome.contextMenus.create({
            id: WA_RADAR_MENU_ID,
            title: "🎯 Ekstrak Grup via WA Radar",
            contexts: ["page", "selection"],
            documentUrlPatterns: ["*://web.whatsapp.com/*"]
        }, () => {
            if (chrome.runtime.lastError) {}
        });
    } else {
        chrome.contextMenus.remove(WA_RADAR_MENU_ID, () => {
            if (chrome.runtime.lastError) {}
        });
    }
}

chrome.storage.local.get([`flowork_app_state_${WA_RADAR_APP_ID}`, 'flowork_registry_cache'], (result) => {
    let isActive = false;

    if (result[`flowork_app_state_${WA_RADAR_APP_ID}`] !== undefined) {
        isActive = result[`flowork_app_state_${WA_RADAR_APP_ID}`];
    } else if (result.flowork_registry_cache && result.flowork_registry_cache.apps) {
        const matchedApp = result.flowork_registry_cache.apps.find(a => a.id === WA_RADAR_APP_ID);
        if (matchedApp) {
            isActive = matchedApp.buton === 'enable';
        }
    }

    syncWaRadarMenu(isActive);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes[`flowork_app_state_${WA_RADAR_APP_ID}`]) {
        syncWaRadarMenu(changes[`flowork_app_state_${WA_RADAR_APP_ID}`].newValue);
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === WA_RADAR_MENU_ID) {
        // Simpan ID Tab WA target agar skrip injeksi tidak salah sasaran
        chrome.storage.local.set({ 'flowork_target_tab_id': tab.id }, () => {
            // Gunakan BASE_URL dinamis yang sudah ada di background.js
            chrome.tabs.create({ url: `${BASE_URL}/flow/wa-lead-radar#openapp` });
        });
    }
});