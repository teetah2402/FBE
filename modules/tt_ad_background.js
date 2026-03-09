//#######################################################################
// File NAME : modules/tt_ad_background.js (REVISI: Tanpa Export + Fix Crash)
// CORE LOGIC : Background Bridge - TikTok Ad Radar
//#######################################################################

function initTikTokRadar() {
    // 1. Buat Context Menu Khusus TikTok Ads
    chrome.contextMenus.create({
        id: "flowork-tt-radar",
        title: "🔥 DeepScan: TikTok Ad Radar",
        contexts: ["page", "video", "image"],
        documentUrlPatterns: [
            "*://ads.tiktok.com/business/creativecenter/*",
            "*://library.tiktok.com/*"
        ]
    }, () => {
        if (chrome.runtime.lastError) {
            // Abaikan error jika menu sudah pernah dibuat
        }
    });

    // 2. Listener saat menu diklik
    chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === "flowork-tt-radar") {
            executeTikTokScan(tab);
        }
    });
}

async function executeTikTokScan(tab) {
    try {
        // Notifikasi ke user bahwa scan sedang berjalan
        chrome.action.setBadgeText({ text: "SCAN", tabId: tab.id });
        chrome.action.setBadgeBackgroundColor({ color: "#10b981", tabId: tab.id });

        // 3. Suntikkan Scraper ke memori utama (MAIN World bypass CSP)
        const injectionResults = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['js/tt_ad_scraper.js'],
            world: 'MAIN'
        });

        // 4. Tangkap Payload dari Scraper
        if (injectionResults && injectionResults[0] && injectionResults[0].result) {
            const payload = injectionResults[0].result;

            if (payload.error) {
                console.error("TikTok Radar Scan Error:", payload.error);
                chrome.action.setBadgeText({ text: "ERR", tabId: tab.id });
                chrome.action.setBadgeBackgroundColor({ color: "#f43f5e", tabId: tab.id });
                return;
            }

            // 5. Simpan payload ke storage agar bisa dibaca oleh UI Dashboard
            await chrome.storage.local.set({ 'flowork_last_scan_tiktok-radar': payload });

            // Bersihkan badge
            chrome.action.setBadgeText({ text: "", tabId: tab.id });

            // 6. Buka Dashboard UI Flowork (Membaca BASE_URL dari background.js)
            // Menggunakan #openapp untuk bypass Lander sesuai Rule V6
            const systemBaseUrl = typeof BASE_URL !== 'undefined' ? BASE_URL : "https://floworkos.com";
            const dashboardUrl = `${systemBaseUrl}/flow/tiktok-radar#openapp`;

            // Cek apakah tab dashboard sudah terbuka di browser (TANPA PORT NUMBER)
            chrome.tabs.query({ url: ["*://*.floworkos.com/flow/tiktok-radar*", "*://localhost/flow/tiktok-radar*", "*://127.0.0.1/flow/tiktok-radar*"] }, (tabs) => {

                // [KODE BARU] Pertahanan Anti-Crash jika Chrome API Error
                if (chrome.runtime.lastError) {
                    console.warn("Tab Query Warning:", chrome.runtime.lastError.message);
                    chrome.tabs.create({ url: dashboardUrl });
                    return;
                }

                // [KODE BARU] Validasi Pastikan 'tabs' tidak undefined
                if (tabs && tabs.length > 0) {
                    // Kalau sudah ada, fokus ke tab itu dan reload agar memuat payload baru
                    chrome.tabs.update(tabs[0].id, { active: true });
                    chrome.tabs.reload(tabs[0].id);
                } else {
                    // Kalau belum ada, buka tab baru
                    chrome.tabs.create({ url: dashboardUrl });
                }
            });
        }
    } catch (err) {
        console.error("TikTok Radar Execution Failed:", err);
        chrome.action.setBadgeText({ text: "ERR", tabId: tab.id });
    }
}