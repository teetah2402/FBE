//#######################################################################
// File NAME : js/wa_scraper.js
// CORE LOGIC : V2 DOM Scraper dengan Auto-Scroll Virtual DOM
//#######################################################################

(async () => {
    return new Promise(async (resolve) => {
        try {
            let foundNumbers = new Set();
            let unchangedScrolls = 0;
            let previousCount = 0;
            const MAX_UNCHANGED_SCROLLS = 3;

            // Fungsi Ekstraksi Presisi (Hanya ekstrak yang lagi tayang di DOM)
            const extractVisible = () => {
                const elements = document.querySelectorAll('span[title], span[dir="auto"], div[role="listitem"] span');
                elements.forEach(el => {
                    let text = el.getAttribute('title') || el.innerText || '';

                    // Validasi ketat: Hanya boleh +, angka, spasi, dan strip (Mencegah false positive)
                    if (/^\+?[\d\s\-\(\)]{10,25}$/.test(text.trim())) {
                        let cleanNum = text.replace(/[^\d+]/g, '');
                        // Filter panjang nomor HP (Minimal 10, Maksimal 16 digit)
                        if (cleanNum.length >= 10 && cleanNum.length <= 16) {
                            foundNumbers.add(cleanNum);
                        }
                    }
                });
            };

            // Radar pendeteksi Scrollable Container (Mencari panel Group Info)
            const getScrollContainer = () => {
                // Trik 1: Cari parent dari elemen nomor HP yang bisa di-scroll
                const spans = Array.from(document.querySelectorAll('span')).filter(el => /^\+?[\d\s\-\(\)]{10,25}$/.test(el.innerText || ''));
                if (spans.length > 0) {
                    let parent = spans[0].parentElement;
                    while (parent && parent !== document.body) {
                        const style = window.getComputedStyle(parent);
                        if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflowY === 'overlay') {
                            return parent;
                        }
                        parent = parent.parentElement;
                    }
                }

                // Trik 2: Fallback brutal nyari panel paling kanan yang bisa di-scroll
                const panes = Array.from(document.querySelectorAll('div')).filter(el =>
                    el.scrollHeight > el.clientHeight &&
                    (window.getComputedStyle(el).overflowY === 'auto' || window.getComputedStyle(el).overflowY === 'scroll')
                );
                return panes.length > 0 ? panes[panes.length - 1] : null;
            };

            const container = getScrollContainer();

            if (!container) {
                // Kalau anehnya nggak nemu panel, hajar statis aja sekali
                extractVisible();
                resolve({ success: true, totalFound: foundNumbers.size, data: Array.from(foundNumbers) });
                return;
            }

            // Posisikan scroll ke paling atas dulu biar nggak ada yang kelewat
            container.scrollTop = 0;
            await new Promise(r => setTimeout(r, 600));

            // =========================================================
            // AUTO-SCROLL ENGINE
            // Menggulung layar, menunggu React merender, lalu sedot.
            // =========================================================
            while (unchangedScrolls < MAX_UNCHANGED_SCROLLS) {
                extractVisible();

                if (foundNumbers.size === previousCount) {
                    unchangedScrolls++;
                } else {
                    unchangedScrolls = 0;
                    previousCount = foundNumbers.size;
                }

                const currentScroll = container.scrollTop;
                // Scroll turun sejauh 500px (aman untuk loading Virtual DOM)
                container.scrollTop += 500;

                // Tunggu 800ms agar DOM WhatsApp selesai me-render data baru
                await new Promise(r => setTimeout(r, 800));

                // Deteksi mentok bawah (End of List)
                if (container.scrollTop === currentScroll) {
                    extractVisible(); // Sapu bersih tarikan terakhir
                    break;
                }
            }

            const finalData = Array.from(foundNumbers);
            resolve({ success: true, totalFound: finalData.length, data: finalData });

        } catch (e) {
            resolve({ error: "Gagal menembus DOM: " + e.message });
        }
    });
})();