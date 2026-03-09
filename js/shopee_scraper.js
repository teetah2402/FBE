//#######################################################################
// File NAME : js/shopee_scraper.js (DI DALAM EKSTENSI CHROME)
// CORE LOGIC : Shopee V20 (The Ultimate God Mode - Brutal Extraction)
// TARGET     : Ekstrak Logistics, Promo, Attributes, Wholesale & Review Images
//#######################################################################

(async () => {
    try {
        const url = window.location.href;
        const idMatch = url.match(/-i\.(\d+)\.(\d+)/) || url.match(/product\/(\d+)\/(\d+)/);

        if (!idMatch) {
            return { error: "Target Locked Failed: Pastikan Anda berada di halaman detail produk Shopee." };
        }

        const shopId = idMatch[1];
        const itemId = idMatch[2];

        // INFO: Struktur Payload Diperluas dengan 5 Intel Baru
        let payload = {
            meta: { shopId, itemId, productUrl: url.split('?')[0] },
            basicIntel: { title: document.title, brand: "No Brand", historicalSold: 0, monthlySold: 0, likedCount: 0, commentCount: 0, creationDate: "Tidak Terlacak", images: [], productAgeDays: 0, velocityPerDay: 0 },
            revenueIntel: { estGrossRevenue: 0, priceRange: "0" },
            priceIntel: { originalPriceMin: 0, originalPriceMax: 0, discountRate: "0%", isManipulated: false },
            seoIntel: { breadcrumbs: [], metaDesc: "", hiddenCategories: [] },
            logisticsIntel: { location: "Unknown", isFreeShipping: false, couriers: [] }, // NEW: Logistics & Geo-Intel
            promoIntel: { isFlashSale: false, flashSalePrice: 0, hasAddOnDeal: false, availableVouchers: [] }, // NEW: Promo & Flash Sale
            deepAttributes: [], // NEW: Detail Spesifikasi (Deep Attributes)
            inventoryXRay: { totalRealStock: 0, models: [], hasWholesale: false, wholesaleTiers: [], isPreOrder: false, daysToShip: 0 }, // ENHANCED: B2B Wholesale aktif
            shopIntel: { shopName: "Unknown Shop", followerCount: 0, responseRate: "N/A", preparationTime: "Estimasi 1-2 Hari", isPreferredPlus: false, isPenalty: false, profilePic: "" },
            liveStreamIntel: { isBeingLiveStreamed: false, activeSessions: [] },
            advancedRating: { totalVotes: 0, star1: 0, star2: 0, star3: 0, star4: 0, star5: 0, toxicityRate: "0%" },
            reviewIntel: { videos: [], images: [] }, // ENHANCED: Review Image Radar
            errorLog: []
        };

        // =========================================================
        // LAYER 1: DEEP MEMORY STATE MINER (V20 ENGINE)
        // =========================================================

        let mainData = { pdpBff: null, shopDetailed: null };
        try {
            function searchObjSafe(obj, targetKey, depth = 0, visited = new Set()) {
                if (depth > 12 || !obj || typeof obj !== 'object' || visited.has(obj)) return null;
                visited.add(obj);
                if (targetKey in obj && obj[targetKey] !== null) return obj[targetKey];
                for (let k in obj) {
                    try {
                        let res = searchObjSafe(obj[k], targetKey, depth + 1, visited);
                        if (res) return res;
                    } catch(e){}
                }
                return null;
            }

            const forbiddenKeys = ['document', 'window', 'top', 'parent', 'frames', 'self', 'chrome', 'console', 'localStorage', 'sessionStorage', 'location', 'history', 'navigator', 'customElements'];
            const safeKeys = Object.keys(window).filter(k => !forbiddenKeys.includes(k));

            if (window.__PRELOADED_STATE__) {
                 mainData.pdpBff = searchObjSafe(window.__PRELOADED_STATE__, 'PDP_BFF_DATA') || searchObjSafe(window.__PRELOADED_STATE__, 'item');
                 mainData.shopDetailed = searchObjSafe(window.__PRELOADED_STATE__, 'shop_detailed') || searchObjSafe(window.__PRELOADED_STATE__, 'shopInfo') || searchObjSafe(window.__PRELOADED_STATE__, 'shop_info');
            }

            if (!mainData.pdpBff) {
                for (let key of safeKeys) {
                    try {
                        let val = window[key];
                        if (val && typeof val === 'object') {
                            let str = "";
                            try { str = JSON.stringify(val); } catch(e) {}
                            if (str.includes('PDP_BFF_DATA') || str.includes('shop_detailed') || str.includes('shop_info')) {
                                if (!mainData.pdpBff) mainData.pdpBff = searchObjSafe(val, 'PDP_BFF_DATA');
                                if (!mainData.shopDetailed) mainData.shopDetailed = searchObjSafe(val, 'shop_detailed') || searchObjSafe(val, 'shopInfo') || searchObjSafe(val, 'shop_info');
                            }
                        }
                    } catch(e) {}
                }
            }
        } catch(e) {}

        let rawMinPrice = 0;
        let rawMaxPrice = 0;

        // PROSES INJEKSI DATA AKURAT DARI MEMORI SHOPEE
        if (mainData.pdpBff) {
            let itemData = null;
            if (mainData.pdpBff.cachedMap && mainData.pdpBff.cachedMap[`${shopId}/${itemId}`]) {
                itemData = mainData.pdpBff.cachedMap[`${shopId}/${itemId}`].item || mainData.pdpBff.cachedMap[`${shopId}/${itemId}`];
            } else if (mainData.pdpBff.item) {
                itemData = mainData.pdpBff.item;
            } else {
                itemData = mainData.pdpBff;
            }

            if (itemData) {
                payload.basicIntel.title = itemData.title || payload.basicIntel.title;
                payload.basicIntel.brand = itemData.brand || "No Brand";
                payload.basicIntel.historicalSold = itemData.historical_sold || itemData.sold || 0;
                payload.basicIntel.monthlySold = itemData.sold || 0;
                payload.basicIntel.likedCount = itemData.liked_count || 0;
                payload.basicIntel.commentCount = itemData.cmt_count || 0;

                if (itemData.shop_name && payload.shopIntel.shopName === "Unknown Shop") payload.shopIntel.shopName = itemData.shop_name;
                if (itemData.shop_info && itemData.shop_info.name && payload.shopIntel.shopName === "Unknown Shop") payload.shopIntel.shopName = itemData.shop_info.name;
                if (itemData.shop_detailed && itemData.shop_detailed.name && payload.shopIntel.shopName === "Unknown Shop") payload.shopIntel.shopName = itemData.shop_detailed.name;

                if (itemData.ctime) {
                    let timestamp = itemData.ctime * 1000;
                    payload.basicIntel.creationDate = new Date(timestamp).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
                    payload.basicIntel.productAgeDays = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
                }

                if (itemData.price_min) rawMinPrice = itemData.price_min / 100000;
                if (itemData.price_max) rawMaxPrice = itemData.price_max / 100000;
                if (itemData.price_min_before_discount) payload.priceIntel.originalPriceMin = itemData.price_min_before_discount / 100000;
                if (itemData.price_max_before_discount) payload.priceIntel.originalPriceMax = itemData.price_max_before_discount / 100000;

                payload.inventoryXRay.totalRealStock = itemData.stock || 0;
                payload.inventoryXRay.isPreOrder = itemData.is_pre_order || false;
                payload.inventoryXRay.daysToShip = itemData.estimated_days || 0;

                // === INJEKSI NEW: 1. LOGISTICS & GEO-INTEL ===
                payload.logisticsIntel.location = itemData.shop_location || "Unknown";
                payload.logisticsIntel.isFreeShipping = itemData.show_free_shipping || (itemData.shipping_icon_type === 1) || false;

                // === INJEKSI NEW: 2. PROMO & FLASH SALE ===
                if (itemData.flash_sale) {
                    payload.promoIntel.isFlashSale = true;
                    payload.promoIntel.flashSalePrice = itemData.flash_sale.price ? (itemData.flash_sale.price / 100000) : rawMinPrice;
                }
                if (itemData.add_on_deal_info) {
                    payload.promoIntel.hasAddOnDeal = true;
                }

                // === INJEKSI NEW: 3. DEEP ATTRIBUTES ===
                if (itemData.attributes && Array.isArray(itemData.attributes)) {
                    payload.deepAttributes = itemData.attributes.map(attr => ({
                        name: attr.name || "Unknown",
                        value: attr.value || "Unknown"
                    }));
                } else if (itemData.tier_variations && Array.isArray(itemData.tier_variations)) {
                     // Fallback kalau attribute di object berbeda
                     itemData.tier_variations.forEach(tv => {
                         payload.deepAttributes.push({ name: "Varian Tipe", value: tv.name });
                     });
                }

                // === INJEKSI NEW: 4. B2B WHOLESALE MAPPING ===
                if (itemData.wholesale_tier_list && Array.isArray(itemData.wholesale_tier_list) && itemData.wholesale_tier_list.length > 0) {
                    payload.inventoryXRay.hasWholesale = true;
                    payload.inventoryXRay.wholesaleTiers = itemData.wholesale_tier_list.map(tier => ({
                        minQty: tier.min_count,
                        maxQty: tier.max_count || "Up",
                        price: tier.price / 100000
                    }));
                }

                if (itemData.models && Array.isArray(itemData.models)) {
                    payload.inventoryXRay.models = itemData.models.map(m => {
                        let normal = typeof m.normal_stock === 'number' ? m.normal_stock : (m.stock || 0);
                        let allocated = typeof m.allocated_stock === 'number' ? m.allocated_stock : null;
                        return {
                            name: m.name || "Varian",
                            realStock: m.stock || 0,
                            promoStock: allocated !== null ? allocated : "Uncapped",
                            price: m.price ? (m.price / 100000) : 0,
                            isGimmick: (normal > 0 && allocated !== null && allocated < normal)
                        };
                    });
                }

                if (itemData.categories && Array.isArray(itemData.categories)) {
                    payload.seoIntel.hiddenCategories = itemData.categories.map(c => c.display_name).filter(Boolean);
                }

                if (itemData.item_rating && itemData.item_rating.rating_count) {
                    let rc = itemData.item_rating.rating_count;
                    payload.advancedRating.totalVotes = itemData.item_rating.total_rating_count || rc[0] || 0;
                    payload.advancedRating.star1 = rc[1] || 0;
                    payload.advancedRating.star2 = rc[2] || 0;
                    payload.advancedRating.star3 = rc[3] || 0;
                    payload.advancedRating.star4 = rc[4] || 0;
                    payload.advancedRating.star5 = rc[5] || 0;
                }
            }
        }

        if (mainData.shopDetailed) {
            let shop = mainData.shopDetailed;
            payload.shopIntel.shopName = shop.name || payload.shopIntel.shopName;
            payload.shopIntel.followerCount = shop.follower_count || 0;
            payload.shopIntel.responseRate = shop.response_rate ? `${shop.response_rate}%` : "N/A";
            payload.shopIntel.preparationTime = shop.preparation_time ? `Estimasi ${shop.preparation_time} Hari` : payload.shopIntel.preparationTime;
            payload.shopIntel.isPreferredPlus = shop.is_preferred_plus_seller || false;
            payload.shopIntel.isPenalty = shop.is_penalty || false;
            if (shop.account && shop.account.portrait) {
                payload.shopIntel.profilePic = `https://down-id.img.susercontent.com/file/${shop.account.portrait}`;
            }
        }

        // =========================================================
        // LAYER 2: ULTIMATE INLINE SCRIPT EXTRACTOR & LIVE SNIPER
        // =========================================================
        let scripts = document.querySelectorAll('script');
        let liveSessionData = null;

        for (let script of scripts) {
            let text = script.textContent || "";

            if (text.includes('"session_id"') && (text.includes('"nickname"') || text.includes('"username"'))) {
                try {
                    let liveMatch = text.match(/\{[^{]*"session_id"\s*:\s*\d+[^}]*(?:"nickname"|"username")\s*:\s*"[^"]+"[^}]*\}/i);
                    if (liveMatch) liveSessionData = JSON.parse(liveMatch[0]);
                } catch(e) {}
            }

            if (payload.shopIntel.shopName === "Unknown Shop" || payload.shopIntel.shopName === "") {
                let shopMatch = text.match(/(?:\\*"shop_name\\*"|"shop_name"|shop_name)\s*[:=]\s*["']([^"'\\]+)["']/i);
                if (shopMatch && shopMatch[1].trim() !== "") {
                    payload.shopIntel.shopName = shopMatch[1];
                } else {
                    let shopDetailMatch = text.match(/(?:\\*"shop_detailed\\*"|"shop_detailed")\s*:\s*\{[^}]*(?:\\*"name\\*"|"name")\s*:\s*["']([^"'\\]+)["']/i);
                    if (shopDetailMatch && shopDetailMatch[1].trim() !== "") {
                        payload.shopIntel.shopName = shopDetailMatch[1];
                    }
                }
            }

            if (text.length > 500 && (text.includes(itemId) || text.includes('historical_sold'))) {
                if (payload.basicIntel.historicalSold === 0) {
                    let hsMatch = text.match(/(?:\\*"historical_sold\\*"|"historical_sold"|historical_sold)\s*[:=]\s*(\d+)/i);
                    if (hsMatch) payload.basicIntel.historicalSold = Math.max(payload.basicIntel.historicalSold, parseInt(hsMatch[1]));

                    let soldMatch = text.match(/(?:\\*"sold\\*"|"sold"|sold)\s*[:=]\s*(\d+)/i);
                    if (soldMatch) payload.basicIntel.historicalSold = Math.max(payload.basicIntel.historicalSold, parseInt(soldMatch[1]));
                }

                if (payload.basicIntel.likedCount === 0) {
                    let lkMatch = text.match(/(?:\\*"liked_count\\*"|"liked_count"|liked_count)\s*[:=]\s*(\d+)/i);
                    if (lkMatch) payload.basicIntel.likedCount = parseInt(lkMatch[1]);
                }

                if (payload.basicIntel.commentCount === 0) {
                    let cmtMatch = text.match(/(?:\\*"cmt_count\\*"|"cmt_count"|cmt_count)\s*[:=]\s*(\d+)/i);
                    if (cmtMatch) payload.basicIntel.commentCount = parseInt(cmtMatch[1]);
                }

                if (rawMinPrice === 0) {
                    let pMinMatch = text.match(/(?:\\*"price_min\\*"|"price_min"|price_min)\s*[:=]\s*(\d+)/i);
                    if (pMinMatch) {
                        rawMinPrice = parseInt(pMinMatch[1]) / 100000;
                        rawMaxPrice = rawMinPrice;
                    }
                }

                // INFO: Fallback Wholesale Regex
                if (!payload.inventoryXRay.hasWholesale) {
                    if (text.includes('wholesale_tier_list')) {
                        payload.inventoryXRay.hasWholesale = true;
                    }
                }

                // INFO: Fallback Logistics Location Regex
                if (payload.logisticsIntel.location === "Unknown") {
                    let locMatch = text.match(/(?:\\*"shop_location\\*"|"shop_location"|shop_location)\s*[:=]\s*["']([^"'\\]+)["']/i);
                    if (locMatch) payload.logisticsIntel.location = locMatch[1];
                }
            }
        }

        if (!liveSessionData && mainData.pdpBff && mainData.pdpBff.item && mainData.pdpBff.item.live_info) {
            liveSessionData = mainData.pdpBff.item.live_info;
        }

        // =========================================================
        // LAYER 3: AGGRESSIVE VISUAL DOM MINING (Membaca Teks UI)
        // =========================================================
        const html = document.documentElement.innerHTML;
        const bodyText = document.body.innerText || document.body.textContent;

        if (payload.basicIntel.historicalSold === 0) {
            let allTextElements = document.querySelectorAll('div, span');
            for(let el of allTextElements) {
                let text = (el.innerText || "").trim();
                if (text.length > 0 && text.length < 35) {
                    let matchRegex = text.match(/([0-9]+(?:[.,][0-9]+)?)\s*(RB|JT|K|M|ribu|juta)?\s*\+?\s*(?:Terjual|Sold|Penilaian)/i);
                    if (matchRegex) {
                        let numStr = matchRegex[1].replace(/,/g, '.');
                        let num = parseFloat(numStr);
                        let multiplier = (matchRegex[2] || "").toUpperCase();
                        if (multiplier === 'RB' || multiplier === 'K' || multiplier === 'RIBU') num *= 1000;
                        if (multiplier === 'JT' || multiplier === 'M' || multiplier === 'JUTA') num *= 1000000;
                        payload.basicIntel.historicalSold = Math.max(payload.basicIntel.historicalSold, Math.floor(num));
                    }
                }
            }
        }

        if (payload.shopIntel.shopName === "Unknown Shop" || payload.shopIntel.shopName === "") {
            try {
                let viewShopBtns = Array.from(document.querySelectorAll('a, button, div')).filter(el => {
                    let txt = (el.innerText || "").toLowerCase();
                    return txt === 'kunjungi toko' || txt === 'view shop' || txt.includes('kunjungi toko');
                });

                if (viewShopBtns.length > 0) {
                    let btn = viewShopBtns[0];
                    let container = btn.closest('div.page-product__shop') || btn.parentElement.parentElement.parentElement;
                    if (container) {
                        let textEls = container.querySelectorAll('div, h3, span');
                        for (let el of textEls) {
                            let text = (el.innerText || "").trim();
                            if (text.length > 2 && text.length < 40 && el.children.length === 0 &&
                                !text.toLowerCase().includes('kunjungi') && !text.toLowerCase().includes('view') &&
                                !text.toLowerCase().includes('aktif') && !text.toLowerCase().includes('produk') &&
                                !text.toLowerCase().includes('penilaian') && !text.toLowerCase().includes('bergabung')) {
                                payload.shopIntel.shopName = text;
                                break;
                            }
                        }
                    }
                }
            } catch(e) {}
        }

        // =========================================================
        // LAYER 4: FALLBACK REGEX PROXIMITY
        // =========================================================
        if (payload.shopIntel.followerCount === 0) {
            let fMatch = html.match(/(?:\\*"follower_count\\*"|"follower_count"|follower_count)\s*[:=]\s*["']?(\d+)/i);
            if (fMatch) payload.shopIntel.followerCount = parseInt(fMatch[1]);
        }
        if (payload.shopIntel.responseRate === "N/A") {
            let rMatch = html.match(/(?:\\*"response_rate\\*"|"response_rate"|response_rate)\s*[:=]\s*["']?(\d+)/i);
            if (rMatch) payload.shopIntel.responseRate = `${rMatch[1]}%`;
        }
        if (payload.inventoryXRay.totalRealStock === 0) {
            let stockMatch = html.match(/(?:\\*"stock\\*"|"stock"|stock)\s*[:=]\s*["']?(\d+)/i);
            if (stockMatch) payload.inventoryXRay.totalRealStock = parseInt(stockMatch[1]);
        }
        if (payload.advancedRating.totalVotes === 0) {
            let rcMatch = html.match(/(?:\\*"rating_count\\*"|"rating_count"|rating_count)\s*[:=]\s*\[([\d,\s]+)\]/i);
            if (rcMatch) {
                const rc = rcMatch[1].split(',').map(Number);
                payload.advancedRating.totalVotes = rc[0] || 0;
                payload.advancedRating.star1 = rc[1] || 0;
                payload.advancedRating.star2 = rc[2] || 0;
                payload.advancedRating.star3 = rc[3] || 0;
                payload.advancedRating.star4 = rc[4] || 0;
                payload.advancedRating.star5 = rc[5] || 0;
            }
        }
        if (payload.shopIntel.shopName === "Unknown Shop" || payload.shopIntel.shopName === "") {
            let shopInfoMatch = html.match(/["']name["']\s*:\s*["']([^"'\\]+)["'][^}]*["']shopid["']\s*:\s*\d+/i);
            if (shopInfoMatch && shopInfoMatch[1].trim() !== "") {
                payload.shopIntel.shopName = shopInfoMatch[1];
            } else {
                let shopInfoMatch2 = html.match(/["']shopid["']\s*:\s*\d+,[^}]*["']name["']\s*:\s*["']([^"'\\]+)["']/i);
                if (shopInfoMatch2 && shopInfoMatch2[1].trim() !== "") {
                    payload.shopIntel.shopName = shopInfoMatch2[1];
                }
            }
        }

        // =========================================================
        // LAYER 5: LD+JSON (Untuk SEO, Brand, Base Price)
        // =========================================================
        const ldJsonScripts = document.querySelectorAll('script[type="application/ld+json"]');
        ldJsonScripts.forEach(script => {
            try {
                let data = JSON.parse(script.textContent || script.innerHTML);
                if (data['@type'] === 'Product') {
                    if (data.name && payload.basicIntel.title === document.title) payload.basicIntel.title = data.name;
                    if (data.brand && payload.basicIntel.brand === "No Brand") payload.basicIntel.brand = typeof data.brand === 'string' ? data.brand : data.brand.name || "No Brand";
                    if (data.image && payload.basicIntel.images.length === 0) payload.basicIntel.images = Array.isArray(data.image) ? data.image : [data.image];

                    if (data.offers) {
                        let minP = data.offers.lowPrice || data.offers.price;
                        let maxP = data.offers.highPrice || data.offers.price;
                        if (minP && rawMinPrice === 0) {
                            rawMinPrice = parseFloat(minP);
                            rawMaxPrice = parseFloat(maxP);
                        }
                    }
                } else if (data['@type'] === 'BreadcrumbList' && payload.seoIntel.breadcrumbs.length === 0) {
                    payload.seoIntel.breadcrumbs = data.itemListElement.map(el => el.item.name);
                }
            } catch(e) {}
        });

        // =========================================================
        // LAYER 6: MEDIA SCRAPER (Videos & REVIEW IMAGES)
        // =========================================================
        const videoMatches = html.match(/https:[^"'\\]*?\.mp4/g) || [];
        let escapedVids = html.match(/https:\\\/\\\/[^"'\\]*?\.mp4/g) || [];
        let allVids = [...videoMatches, ...escapedVids.map(v => v.replace(/\\\//g, '/'))];

        if (mainData.pdpBff && mainData.pdpBff.product_images && mainData.pdpBff.product_images.video) {
            let vidInfo = mainData.pdpBff.product_images.video;
            if (vidInfo.formats && vidInfo.formats.length > 0) {
                allVids.push(vidInfo.formats[0].url);
            } else if (vidInfo.default_format) {
                allVids.push(vidInfo.default_format.url);
            }
        }

        if (allVids.length > 0) {
            let uniqueVids = [...new Set(allVids)];
            uniqueVids.forEach((v, index) => {
                payload.reviewIntel.videos.push({
                    url: v,
                    author: `Ulasan Video ${index + 1}`,
                    cover: payload.basicIntel.images[0] || null
                });
            });
        }

        // === INJEKSI NEW: 5. REVIEW IMAGE RADAR (Scrape Real Picture) ===
        try {
            let reviewImages = [];
            // Mencari dari object memori ulasan
            let itemRatingState = searchObjSafe(window.__PRELOADED_STATE__, 'item_rating') || searchObjSafe(window.__PRELOADED_STATE__, 'ItemRatingBFF');
            if (itemRatingState && itemRatingState.ratings) {
                itemRatingState.ratings.forEach(rating => {
                    if (rating.images && Array.isArray(rating.images)) {
                        rating.images.forEach(img => {
                            reviewImages.push(`https://down-id.img.susercontent.com/file/${img}`);
                        });
                    }
                });
            }

            // Fallback DOM Mining ke div gambar ulasan
            if (reviewImages.length === 0) {
                let imgElements = document.querySelectorAll('.shopee-rating-media-list__image-wrapper img, .shopee-rating-media-list__image, .rating-media-list__image');
                imgElements.forEach(img => {
                    let bg = img.style.backgroundImage || "";
                    let srcMatch = bg.match(/url\("?(.*?)""?\)/) || img.src;
                    if (srcMatch && srcMatch[1]) {
                        reviewImages.push(srcMatch[1]);
                    } else if (typeof srcMatch === 'string' && srcMatch.startsWith('http')) {
                        reviewImages.push(srcMatch);
                    }
                });
            }

            // Fallback Regex kasar ke HTML
            if (reviewImages.length === 0) {
                 let imgMatch = html.match(/["']images["']\s*:\s*\[((?:["'][a-zA-Z0-9_]{20,}["']\s*,?\s*)+)\]/g);
                 if (imgMatch) {
                     imgMatch.forEach(block => {
                         let ids = block.match(/["']([a-zA-Z0-9_]{20,})["']/g);
                         if(ids) {
                             ids.forEach(id => {
                                 let cleanId = id.replace(/['"]/g, '');
                                 reviewImages.push(`https://down-id.img.susercontent.com/file/${cleanId}`);
                             });
                         }
                     });
                 }
            }

            // Ambil maksimal 10 gambar ulasan real picture terbaik
            let uniqueReviewImages = [...new Set(reviewImages)].filter(Boolean).slice(0, 10);
            payload.reviewIntel.images = uniqueReviewImages;
        } catch(e) {}


        // =========================================================
        // FINALISASI: KALKULASI OMZET, VELOCITY & SAFETY NET
        // =========================================================
        if (rawMinPrice === 0) {
            const visualPriceMatches = bodyText.match(/Rp\s*((?:\d{1,3}(?:\.\d{3})*)|(?:\d+))/);
            if (visualPriceMatches) {
                rawMinPrice = parseFloat(visualPriceMatches[1].replace(/\./g, ''));
                rawMaxPrice = rawMinPrice;
            }
        }

        if (rawMinPrice > 0) {
            payload.revenueIntel.priceRange = rawMinPrice === rawMaxPrice ? rawMinPrice.toString() : `${rawMinPrice} - ${rawMaxPrice}`;
        }

        if (payload.basicIntel.historicalSold > 0 && rawMinPrice > 0) {
            payload.revenueIntel.estGrossRevenue = payload.basicIntel.historicalSold * rawMinPrice;
        }

        if (payload.basicIntel.productAgeDays > 0) {
             payload.basicIntel.velocityPerDay = Math.floor(payload.basicIntel.historicalSold / payload.basicIntel.productAgeDays);
        } else if (payload.basicIntel.historicalSold > 0) {
             payload.basicIntel.velocityPerDay = Math.floor(payload.basicIntel.historicalSold / 30);
        }

        if (payload.priceIntel.originalPriceMin > 0 && rawMinPrice > 0) {
             if (payload.priceIntel.originalPriceMin > rawMinPrice) {
                 payload.priceIntel.isManipulated = true;
                 let diff = payload.priceIntel.originalPriceMin - rawMinPrice;
                 payload.priceIntel.discountRate = Math.floor((diff / payload.priceIntel.originalPriceMin) * 100) + "%";
             } else {
                 payload.priceIntel.originalPriceMin = rawMinPrice;
             }
        } else {
             payload.priceIntel.originalPriceMin = rawMinPrice;
        }

        if (payload.seoIntel.hiddenCategories.length === 0 && payload.seoIntel.breadcrumbs.length > 0) {
             payload.seoIntel.hiddenCategories = payload.seoIntel.breadcrumbs;
        }

        if (payload.inventoryXRay.models.length === 0 && payload.inventoryXRay.totalRealStock > 0) {
             payload.inventoryXRay.models.push({
                 name: "Produk Utama",
                 realStock: payload.inventoryXRay.totalRealStock,
                 promoStock: "Unknown",
                 price: rawMinPrice || 0,
                 isGimmick: false
             });
        } else if (payload.inventoryXRay.models.length === 0 && rawMinPrice > 0) {
             payload.inventoryXRay.models.push({
                 name: "Produk Utama",
                 realStock: 0,
                 promoStock: "Unknown",
                 price: rawMinPrice,
                 isGimmick: false
             });
        }

        if (payload.advancedRating.totalVotes > 0) {
            const badVotes = payload.advancedRating.star1 + payload.advancedRating.star2;
            payload.advancedRating.toxicityRate = ((badVotes / payload.advancedRating.totalVotes) * 100).toFixed(2) + "%";
        }

        // =========================================================
        // LAYER 7: PENGGABUNGAN DATA LIVE STREAM FINAL
        // =========================================================
        const hasLiveElement = document.querySelector('.live-badge, [class*="live"], #shopee-live-player, iframe[src*="live"]') !== null;
        const isLiveMemoryTrue = html.includes('"is_live_streaming":true') || html.includes('Shopee Live') || (mainData.pdpBff && mainData.pdpBff.is_live_streaming);

        if (liveSessionData || hasLiveElement || isLiveMemoryTrue) {
            let finalHostName = payload.shopIntel.shopName;
            if (liveSessionData) {
                finalHostName = liveSessionData.nickname || liveSessionData.username || liveSessionData.host_name || finalHostName;
            }

            let finalCoverUrl = payload.shopIntel.profilePic;
            if (liveSessionData) {
                let rawCover = liveSessionData.avatar || liveSessionData.cover || liveSessionData.portrait;
                if (rawCover) {
                    finalCoverUrl = rawCover.startsWith('http') ? rawCover : `https://down-id.img.susercontent.com/file/${rawCover}`;
                }
            }

            let finalViewers = "Hidden";
            if (liveSessionData) {
                finalViewers = liveSessionData.view_count || liveSessionData.watch_count || "Hidden";
                if (finalViewers !== "Hidden") finalViewers = `${finalViewers} Penonton`;
            }

            let finalSessionId = liveSessionData ? (liveSessionData.session_id || "ACTIVE_DOM_RADAR") : "ACTIVE_DOM_RADAR";

            payload.liveStreamIntel.isBeingLiveStreamed = true;
            payload.liveStreamIntel.activeSessions.push({
                hostName: finalHostName,
                viewers: finalViewers,
                sessionId: finalSessionId,
                coverUrl: finalCoverUrl
            });
        }

        return payload;

    } catch (e) {
        return { error: `V20 God Mode Failed: ${e.message}` };
    }
})();