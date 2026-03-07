//#######################################################################
// File NAME : js/tt_ad_scraper.js (V2 - ULTIMATE GOD MODE)
// CORE LOGIC : TikTok Ad-Spy Radar - Deep JSON Extraction
// TARGET     : ads.tiktok.com & library.tiktok.com
//#######################################################################

(async () => {
    try {
        const url = window.location.href;

        // Validasi URL Target
        if (!url.includes('ads.tiktok.com/business/creativecenter') && !url.includes('library.tiktok.com')) {
            return { error: "Target Locked Failed: Pastikan Anda berada di halaman TikTok Ads Library atau Creative Center." };
        }

        // Struktur Payload V2 (Lebih Brutal)
        let payload = {
            meta: { url: url.split('?')[0], scrapeTime: new Date().toISOString() },
            adBasic: { adName: "Unknown Ad", brandName: "Unknown Brand", adCaption: "", landingPage: "N/A" },
            performance: { likes: 0, comments: 0, shares: 0, ctr: "N/A", costLevel: "N/A" },
            media: { videoUrlNoWatermark: "", coverImageUrl: "", duration: 0 },
            targeting: { objective: "Unknown", industry: "Unknown", keywords: [], targetedCountries: [] },
            errorLog: []
        };

        // =========================================================
        // LAYER 1: NEXT.JS DATA MINING (Membedah JSON Utama)
        // =========================================================
        let nextData = null;
        try {
            const nextScript = document.getElementById('__NEXT_DATA__');
            if (nextScript) {
                nextData = JSON.parse(nextScript.textContent || "{}");
            }
        } catch (e) {
            payload.errorLog.push("Failed to parse __NEXT_DATA__");
        }

        // Ekstraksi Khusus TikTok Creative Center (Top Ads)
        if (nextData && nextData.props && nextData.props.pageProps && nextData.props.pageProps.data) {
            const baseDetail = nextData.props.pageProps.data.baseDetail;

            if (baseDetail) {
                // 1. BASIC INTEL & LANDING PAGE
                payload.adBasic.adCaption = baseDetail.adTitle || "";
                payload.adBasic.brandName = baseDetail.brandName || "Unknown Brand";
                payload.adBasic.landingPage = baseDetail.landingPage || "N/A";

                // 2. SECRET PERFORMANCE METRICS
                payload.performance.likes = baseDetail.like || 0;
                payload.performance.comments = baseDetail.comment || 0;
                payload.performance.shares = baseDetail.share || 0;
                if (baseDetail.ctr) payload.performance.ctr = `${baseDetail.ctr}%`;
                if (baseDetail.cost) payload.performance.costLevel = `Index ${baseDetail.cost}`;

                // 3. TARGETING & HIDDEN KEYWORDS
                if (baseDetail.objectives && baseDetail.objectives.length > 0) {
                    payload.targeting.objective = baseDetail.objectives[0].label.replace('campaign_objective_', '').toUpperCase();
                } else if (baseDetail.objectiveKey) {
                    payload.targeting.objective = baseDetail.objectiveKey.replace('campaign_objective_', '').toUpperCase();
                }

                if (baseDetail.industryKey) payload.targeting.industry = baseDetail.industryKey.replace('label_', '');
                if (baseDetail.keywordList) payload.targeting.keywords = baseDetail.keywordList;
                if (baseDetail.countryCode) payload.targeting.targetedCountries = baseDetail.countryCode;

                // 4. MEDIA (RAW MP4 CDN)
                if (baseDetail.videoInfo) {
                    // Coba ambil 720P dulu, kalau gak ada fallback ke URL dasar
                    if (baseDetail.videoInfo.videoUrl && baseDetail.videoInfo.videoUrl["720P"]) {
                        payload.media.videoUrlNoWatermark = baseDetail.videoInfo.videoUrl["720P"];
                    } else if (baseDetail.videoInfo.videoUrl) {
                        payload.media.videoUrlNoWatermark = Object.values(baseDetail.videoInfo.videoUrl)[0];
                    }

                    payload.media.coverImageUrl = baseDetail.videoInfo.cover || "";
                    payload.media.duration = baseDetail.videoInfo.duration || 0;
                }
            }
        }

        // =========================================================
        // LAYER 2: FALLBACK DOM MINING (Jaring Pengaman)
        // =========================================================
        if (!payload.media.videoUrlNoWatermark) {
            const videoEls = document.querySelectorAll('video');
            for (let v of videoEls) {
                if (v.src && (v.src.includes('tiktokcdn') || v.src.includes('byte'))) {
                    payload.media.videoUrlNoWatermark = v.src;
                    break;
                }
            }
        }

        if (!payload.adBasic.adCaption) {
            const textEls = document.querySelectorAll('div[class*="title"], div[class*="caption"], span[class*="desc"]');
            for (let el of textEls) {
                const text = (el.innerText || "").trim();
                if (text.length > 20 && text.length < 500) {
                    payload.adBasic.adCaption = text;
                    break;
                }
            }
        }

        return payload;

    } catch (e) {
        return { error: `TikTok Ad Radar V2 Failed: ${e.message}` };
    }
})();