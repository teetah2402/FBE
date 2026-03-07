//#######################################################################
// FILE: content_injector.js (Jalan di dalam Ekstensi Chrome)
// FUNGSI: Mengirim ID Ekstensi secara OTOMATIS ke Website Flowork
//#######################################################################

// KODE LAMA DIBEKUKAN KARENA DIBLOKIR CSP (Inline Script)
// const script = document.createElement('script');
// script.textContent = `
//     window.__FLOWORK_EXT_ID__ = "${chrome.runtime.id}";
//     console.log("💉 [Flowork Auto-Discovery] Ekstensi merespon dengan ID: ${chrome.runtime.id}");
// `;
// (document.head || document.documentElement).appendChild(script);
// script.remove();

// KODE BARU: Menggunakan <meta> tag DOM Element agar lolos CSP 100%
const metaTag = document.createElement('meta');
metaTag.name = "flowork-ext-id";
metaTag.content = chrome.runtime.id;
(document.head || document.documentElement).appendChild(metaTag);

console.log("💉 [Flowork Auto-Discovery] Ekstensi berhasil menanamkan ID via Meta Tag: " + chrome.runtime.id);