//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : modules/web_auditor.js
// CORE LOGIC : Context Menu, Target Memory & Domain Verification Engine
//#######################################################################

const WebAuditor = {
    async verifyDomain(domainRaw) {
        const domain = domainRaw.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const protocols = ['https://', 'http://'];
        let lastError = "Gagal menyambung ke server.";

        for (const protocol of protocols) {
            const url = `${protocol}${domain}/flowork-verify.html`;
            try {
                const response = await fetch(url, { method: 'GET', cache: 'no-cache' });
                if (response.ok) {
                    const text = await response.text();
                    if (text.includes("Flowork OS Verification")) {
                        return { success: true, domain: domain, protocol: protocol };
                    }
                }
                lastError = "File ditemukan di " + protocol + " tapi konten tidak valid.";
            } catch (error) {
                lastError = "Gagal menyambung ke " + protocol + " (SSL tidak valid atau server down).";
            }
        }
        return { success: false, error: lastError };
    }
};

// Expose ke global scope agar bisa dieksekusi oleh Smart Routing Engine
self.WebAuditor = WebAuditor;

// =========================================================
// CONTEXT MENU & DEEP LINKING LOGIC
// =========================================================
const WEBSHIELD_APP_ID = "webshield-auditor";
const WEBSHIELD_MENU_ID = "flowork_menu_webshield";

function syncWebshieldMenu(isActive) {
    if (isActive) {
        chrome.contextMenus.create({
            id: WEBSHIELD_MENU_ID,
            title: "🛡️ Audit Web Ini dengan WebShield",
            contexts: ["page", "link"]
        }, () => { if (chrome.runtime.lastError) {} });
    } else {
        chrome.contextMenus.remove(WEBSHIELD_MENU_ID, () => { if (chrome.runtime.lastError) {} });
    }
}

chrome.storage.local.get([`flowork_app_state_${WEBSHIELD_APP_ID}`, 'flowork_registry_cache'], (result) => {
    // [PERBAIKAN FATAL] Sinkronisasi daftar bypass Dev Mode agar menu tidak terhapus!
    const bypassedApps = ['content-forge', 'webshield-auditor', 'seo-checker', 'tt-deepscan', 'yt-deepscan'];
    let isActive = bypassedApps.includes(WEBSHIELD_APP_ID);

    if (!isActive) {
        if (result[`flowork_app_state_${WEBSHIELD_APP_ID}`] !== undefined) {
            isActive = result[`flowork_app_state_${WEBSHIELD_APP_ID}`];
        } else if (result.flowork_registry_cache && result.flowork_registry_cache.apps) {
            const matchedApp = result.flowork_registry_cache.apps.find(a => a.id === WEBSHIELD_APP_ID);
            if (matchedApp) isActive = matchedApp.buton === 'enable';
        }
    }

    syncWebshieldMenu(isActive);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes[`flowork_app_state_${WEBSHIELD_APP_ID}`]) {
        syncWebshieldMenu(changes[`flowork_app_state_${WEBSHIELD_APP_ID}`].newValue);
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === WEBSHIELD_MENU_ID) {
        const targetUrlStr = info.linkUrl || info.pageUrl;
        try {
            const targetUrlObj = new URL(targetUrlStr);
            chrome.storage.local.set({
                'flowork_target_tab_id': tab.id,
                'webshield_context_domain': targetUrlObj.hostname
            }, () => {
                const sysUrl = typeof BASE_URL !== 'undefined' ? BASE_URL : 'https://floworkos.com';
                chrome.tabs.create({ url: `${sysUrl}/flow/webshield-auditor#openapp` });
            });
        } catch(e) {}
    }
});