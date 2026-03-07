//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : modules/god_mode_scan.js
// CORE LOGIC : Universal JSON Dumper (God Mode V2 - Extreme Brute Force)
//#######################################################################

const GOD_MODE_MENU_ID = "flowork_menu_god_mode";

// 1. Buat Context Menu Khusus untuk SEMUA HALAMAN
chrome.contextMenus.create({
    id: GOD_MODE_MENU_ID,
    title: "🔥 [GOD MODE] Sedot Semua JSON Website",
    contexts: ["page", "all"],
    documentUrlPatterns: ["<all_urls>"] // Berlaku di seluruh website di dunia
}, () => {
    if (chrome.runtime.lastError) {} // Abaikan error jika menu sudah ada
});

// 2. Eksekusi Script Injeksi saat diklik
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === GOD_MODE_MENU_ID) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: universalJsonScraperV2
        });
    }
});

// 3. Fungsi God Mode V2 yang berjalan di Tab tujuan
function universalJsonScraperV2() {
    console.log("🔥 [Flowork God Mode V2] Memulai scanning tingkat dewa (Brute Force)...");

    let extractedData = {
        _meta: {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        },
        found_in_window: {},
        found_in_dom: []
    };

    // TAHAP 1: TANGKAP DARI WINDOW OBJECT MURNI (Framework Standar)
    const commonVars = [
        '__NEXT_DATA__', '__NUXT__', '__INITIAL_STATE__', 'window.__PRELOADED_STATE__',
        'APP_INITIAL_STATE', 'SIGI_STATE', '__UNIVERSAL_DATA_FOR_REHYDRATION__',
        'ytInitialData', 'ytInitialPlayerResponse', '_sharedData', 'valkyrie_state',
        '__APOLLO_STATE__', 'initialState', 'state'
    ];

    commonVars.forEach(v => {
        try {
            if (window[v]) {
                extractedData.found_in_window[v] = window[v];
                console.log(`✅ [God Mode] Harta karun ditemukan di variabel Window: ${v}`);
            }
        } catch (e) {}
    });

    // TAHAP 2: EXTREME DOM X-RAY (Brute-Force membedah semua tag script)
    const scripts = document.querySelectorAll('script');
    scripts.forEach((s, index) => {
        let content = s.textContent || s.innerHTML || "";
        content = content.trim();

        if (!content) return;

        // Teknik A: Ambil dari Script Tag tipe JSON murni (Next.js, Schema.org, dll)
        if (s.type && (s.type.includes('json') || s.type === 'application/ld+json' || s.type === 'application/json')) {
            try {
                let parsed = JSON.parse(content);
                extractedData.found_in_dom.push({
                    source: `Script_Type_${s.type}_ID_${s.id || index}`,
                    data: parsed
                });
                console.log(`✅ [God Mode] Data terstruktur ditemukan di Script type: ${s.type}`);
            } catch(e) {}
            return;
        }

        // Teknik B: Ambil dari Script tag yang memiliki ID mencurigakan
        if (s.id && (s.id.toUpperCase().includes('DATA') || s.id.toUpperCase().includes('STATE') || s.id.includes('__'))) {
            try {
                let parsed = JSON.parse(content);
                extractedData.found_in_dom.push({
                    source: `Script_ID_${s.id}`,
                    data: parsed
                });
                console.log(`✅ [God Mode] Data terstruktur ditemukan di Script ID: ${s.id}`);
                return;
            } catch(e) {}
        }

        // Teknik C: ABSOLUTE BRUTE FORCE (Sapu Bersih)
        // Jika script ini panjangnya lebih dari 500 karakter, kemungkinan besar ada data JSON yang disuntikkan (bukan sekadar fungsi kecil)
        if (content.length > 500) {
            try {
                // Cari posisi kurung kurawal pertama dan terakhir
                let firstBrace = content.indexOf('{');
                let lastBrace = content.lastIndexOf('}');

                // Cari posisi kurung siku pertama dan terakhir (untuk Array JSON)
                let firstBracket = content.indexOf('[');
                let lastBracket = content.lastIndexOf(']');

                // Coba Parse sebagai Objek {...}
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    let possibleJsonObject = content.substring(firstBrace, lastBrace + 1);
                    if (possibleJsonObject.length > 200) { // Pastikan isinya lumayan besar
                        try {
                            let parsedObj = JSON.parse(possibleJsonObject);
                            extractedData.found_in_dom.push({
                                source: `BruteForce_Object_Extraction_Script_${index}`,
                                data: parsedObj
                            });
                            console.log(`✅ [God Mode] Berhasil membongkar Object paksa di Script ke-${index}`);
                            return; // Lanjut ke script berikutnya jika sukses
                        } catch(err) {} // Gagal parse, abaikan
                    }
                }

                // Coba Parse sebagai Array [...]
                if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                    let possibleJsonArray = content.substring(firstBracket, lastBracket + 1);
                    if (possibleJsonArray.length > 200) {
                        try {
                            let parsedArr = JSON.parse(possibleJsonArray);
                            extractedData.found_in_dom.push({
                                source: `BruteForce_Array_Extraction_Script_${index}`,
                                data: parsedArr
                            });
                            console.log(`✅ [God Mode] Berhasil membongkar Array paksa di Script ke-${index}`);
                        } catch(err) {}
                    }
                }
            } catch(e) {}
        }
    });

    // Validasi apakah kita dapat data sama sekali
    let totalWindow = Object.keys(extractedData.found_in_window).length;
    let totalDom = extractedData.found_in_dom.length;

    if (totalWindow === 0 && totalDom === 0) {
        alert("❌ [Flowork God Mode V2] Gagal menembus proteksi! Web ini mungkin 100% Server-Side Rendered (PHP/HTML biasa) tanpa State JSON, atau memiliki proteksi Obfuscation (Pengacakan) tingkat tinggi.");
        return;
    }

    // TAHAP 3: AUTO-DOWNLOAD FILE JSON
    try {
        const blob = new Blob([JSON.stringify(extractedData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        const domain = window.location.hostname.replace('www.', '');
        a.download = `GodModeV2_${domain}_Dump.json`;

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 1500);

        alert(`✅ [Flowork God Mode V2] TEMBUS! Ditemukan ${totalWindow} root window & ${totalDom} root DOM dari ${domain}. File berhasil didownload!`);
    } catch (e) {
        alert("❌ [Flowork God Mode V2] Gagal menyusun file download: " + e.message);
    }
}