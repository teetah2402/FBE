//#######################################################################
// File NAME : js/tt_scraper.js (DI DALAM FOLDER EKSTENSI CHROME)
// CORE LOGIC : Ultimate Recursive DOM Scraper for TikTok (V6 Deep Web)
//#######################################################################

(async () => {
    try {
        let payload = {
            playCount: 0, diggCount: 0, commentCount: 0, shareCount: 0, collectCount: 0,
            description: "N/A", createTime: 0, publishTime: "Unknown",
            musicTitle: "Unknown", musicAuthor: "Unknown", isOriginalAudio: false,
            authorHandle: "Unknown", authorFollowers: 0, authorHearts: 0,
            videoDuration: 0, videoResolution: "Unknown", allowDownload: false,
            isAd: false, region: "Global", suggestedWords: [],

            aiClass: { labels: [], isAigc: false },
            commerce: { hasAnchor: false, anchorType: "None" },
            trust: { ageRestricted: false, audioMuteRisk: false, canDuet: true, canStitch: true },
            forensics: { bitrate: 0, originalVidId: "Unknown" },

            authorNickname: "Unknown",
            coverUrl: "",
            videoUrl: "",
            musicUrl: "",

            repostCount: 0,
            poi: { name: "None", address: "None", city: "None" },
            forensicsAdvanced: { ratio: "Unknown", vqScore: "Unknown", loudness: 0 },
            authorSecUid: "Unknown",
            authorCreateTime: "Unknown",

            market: { interests: [] },
            seoExtended: { shareTitle: "", shareDesc: "", abTest: "Unknown", isSeoFriendlyApi: false, isSearchEngineOptimized: false },
            creatorExtended: { signature: "None", verified: false },
            musicExtended: { isCommerce: false },
            developer: { csrfToken: "Unknown", odinId: "Unknown", encryptedWebid: "Unknown", apiDomains: {}, featureFlags: [] },

            audienceGeo: { city: "Unknown", region: "Unknown" },
            isTTSeller: false,
            primeTime: { day: "", time: "" },
            botStatus: { isGoogle: false, isBing: false, isBot: false },
            captionChunks: [],
            seoCanonical: "Unknown",
            pageId: "Unknown",
            audioPeak: 0,
            externalDsp: [],
            trustAdvanced: { canRepost: false, aiCommentEligible: false },
            videoOrderLogics: [],
            codecVariants: [],

            // ==========================================
            // [TAMBAHAN TAHAP 4: EXTREME DEEP DIVE]
            // ==========================================
            extremeDeepDive: {
                adNetworks: [],
                supportedLangs: 0,
                zoomCovers: [],
                warnInfo: [],
                takeDown: 0,
                vmafScores: "Unknown",
                isAdVirtual: false,
                onDeviceMl: [],
                upliftModels: [],
                exploreCategoriesV2: [],
                contentLang: "Unknown",
                translatable: false,
                poiSchema: { cityCode: "Unknown", countryCode: "Unknown", typeTiny: "Unknown" },
                aiCommentReason: "None",
                bitrateSelector: "Unknown",
                globalFeatureFlags: [],
                fileHash: "Unknown",
                structuredLocation: "Unknown",
                categoryType: "Unknown",
                seoAigcTdk: "Unknown",
                seoBotCost: "Unknown",
                seoAigcArticle: "Unknown",
                musicUnlimited: false,
                embedBanned: false,
                shadowModeration: { reviewing: false, privateItem: false, secret: false, commentStatus: 0 },
                hashedIp: "Unknown",
                hevcRobustness: "Unknown",
                cdnExpiration: "Unknown",
                cdnSignature: "Unknown"
            },

            error: null
        };

        let rawData = null;

        const scripts = document.querySelectorAll('script');
        for (let s of scripts) {
            const text = s.textContent || s.innerHTML || "";

            if (s.id === '__UNIVERSAL_DATA_FOR_REHYDRATION__' || text.includes('__UNIVERSAL_DATA_FOR_REHYDRATION__')) {
                try {
                    if (s.id === '__UNIVERSAL_DATA_FOR_REHYDRATION__') {
                        rawData = JSON.parse(text);
                    } else {
                        const parts = text.split('window.__UNIVERSAL_DATA_FOR_REHYDRATION__ = ');
                        if (parts.length > 1) {
                            let jsonStr = parts[1];
                            const lastBrace = Math.max(jsonStr.lastIndexOf('}'), jsonStr.lastIndexOf(']'));
                            if (lastBrace !== -1) {
                                jsonStr = jsonStr.substring(0, lastBrace + 1);
                                rawData = JSON.parse(jsonStr);
                            }
                        }
                    }
                    if (rawData) break;
                } catch(e) {}
            }

            if (s.id === 'SIGI_STATE' || text.includes('window.SIGI_STATE')) {
                try {
                    if (s.id === 'SIGI_STATE') {
                        rawData = JSON.parse(text);
                    } else {
                        const parts = text.split('window.SIGI_STATE = ');
                        if (parts.length > 1) {
                            let jsonStr = parts[1];
                            const lastBrace = Math.max(jsonStr.lastIndexOf('}'), jsonStr.lastIndexOf(']'));
                            if (lastBrace !== -1) {
                                jsonStr = jsonStr.substring(0, lastBrace + 1);
                                rawData = JSON.parse(jsonStr);
                            }
                        }
                    }
                    if (rawData) break;
                } catch(e) {}
            }
        }

        if (!rawData) {
            if (!window.location.href.includes('/video/')) return { error: "Anda tidak berada di halaman video. Klik salah satu video." };
            return { error: "Algoritma TikTok tersembunyi. Silakan REFRESH (F5) tab TikTok Anda." };
        }

        if (rawData["__DEFAULT_SCOPE__"]) {
            const defaultScope = rawData["__DEFAULT_SCOPE__"];
            const appContext = defaultScope["webapp.app-context"] || {};
            const bizContext = defaultScope["webapp.biz-context"] || {};
            const seoTest = defaultScope["seo.abtest"] || {};

            payload.developer.csrfToken = appContext.csrfToken || "Unknown";
            payload.developer.odinId = appContext.odinId || "Unknown";
            payload.developer.encryptedWebid = appContext.encryptedWebid || "Unknown";

            if (appContext.abTestVersion && appContext.abTestVersion.parameters) {
                const abParams = appContext.abTestVersion.parameters;
                if (abParams.live_webcodecs_player) payload.developer.featureFlags.push("WebCodecs Player: " + (abParams.live_webcodecs_player.vid || "Active"));
                if (abParams.webapp_auto_dark_mode) payload.developer.featureFlags.push("Auto Dark Mode: " + abParams.webapp_auto_dark_mode.value);
                if (abParams.tt_player_preload) payload.developer.featureFlags.push("Player Preload: " + abParams.tt_player_preload.value);
            }

            if (bizContext.domains) payload.developer.apiDomains = bizContext.domains;
            if (bizContext.interestList && bizContext.interestList.interest_list) payload.market.interests = bizContext.interestList.interest_list.map(i => i.id || i);

            if (seoTest.parameters) {
                const keys = Object.keys(seoTest.parameters);
                payload.seoExtended.abTest = keys.length > 0 ? keys.slice(0, 3).join(', ') + "..." : "Default";
                payload.seoExtended.isSeoFriendlyApi = seoTest.parameters.seoFriendlyApi?.keywordTags || false;
                payload.seoExtended.isSearchEngineOptimized = seoTest.parameters.general_search_engine_optimize?.value || false;

                // [TAMBAHAN TAHAP 4: SEO AIGC & BOT COST]
                if (seoTest.parameters.recommend_aigc_tdk) payload.extremeDeepDive.seoAigcTdk = JSON.stringify(seoTest.parameters.recommend_aigc_tdk);
                if (seoTest.parameters.bot_cost_optimize) payload.extremeDeepDive.seoBotCost = JSON.stringify(seoTest.parameters.bot_cost_optimize);
                if (seoTest.parameters.video_aigc_article) payload.extremeDeepDive.seoAigcArticle = JSON.stringify(seoTest.parameters.video_aigc_article);
            }

            if (bizContext.geoCity) {
                payload.audienceGeo.city = bizContext.geoCity.City || "Unknown";
                payload.audienceGeo.region = bizContext.geoCity.Subdivisions || "Unknown";
            }
            payload.botStatus.isGoogle = bizContext.isGoogleBot || false;
            payload.botStatus.isBing = bizContext.isBingBot || false;
            payload.botStatus.isBot = bizContext.isBot || bizContext.isSearchEngineBot || false;

            if (bizContext.videoOrder && bizContext.videoOrder.videoOrder) {
                payload.videoOrderLogics = bizContext.videoOrder.videoOrder;
            }
            payload.seoCanonical = seoTest.canonical || "Unknown";
            payload.pageId = seoTest.pageId || "Unknown";

            // [TAMBAHAN TAHAP 4: ROOT CONTEXT EXTRACTION]
            if (bizContext.cookieConsent) payload.extremeDeepDive.adNetworks = Object.keys(bizContext.cookieConsent).filter(k => bizContext.cookieConsent[k]);
            if (bizContext.claConfig && bizContext.claConfig.translationLanguageList) payload.extremeDeepDive.supportedLangs = bizContext.claConfig.translationLanguageList.length;
            if (bizContext.config && bizContext.config.onDeviceMLConfig) payload.extremeDeepDive.onDeviceMl = Object.keys(bizContext.config.onDeviceMLConfig);
            if (bizContext.upliftModelInfo) payload.extremeDeepDive.upliftModels = Object.keys(bizContext.upliftModelInfo);
            if (bizContext.config && bizContext.config.exploreCategoryList && bizContext.config.exploreCategoryList.v2) {
                payload.extremeDeepDive.exploreCategoriesV2 = bizContext.config.exploreCategoryList.v2.map(c => `${c.name} (T:${c.type})`);
            }
            if (bizContext.bitrateSelectorConfigs && bizContext.bitrateSelectorConfigs.configs) {
                payload.extremeDeepDive.bitrateSelector = `Upper: ${bizContext.bitrateSelectorConfigs.configs.bitrateUpper || 'N/A'}, Lower: ${bizContext.bitrateSelectorConfigs.configs.bitrateLower || 'N/A'}`;
            }
            if (bizContext.config && bizContext.config.featureFlags) {
                payload.extremeDeepDive.globalFeatureFlags = Object.keys(bizContext.config.featureFlags).filter(k => bizContext.config.featureFlags[k] === true).slice(0, 10);
            }
            payload.extremeDeepDive.hashedIp = bizContext.hashedIP || "Unknown";
            if (bizContext.hevcRobustness) payload.extremeDeepDive.hevcRobustness = `UseTest: ${bizContext.hevcRobustness.useHevcRobustTest}`;
        }

        function findVideoItem(obj) {
            if (!obj || typeof obj !== 'object') return null;
            if (obj.stats !== undefined && obj.stats.playCount !== undefined && obj.stats.diggCount !== undefined) return obj;
            for (let k in obj) {
                if (typeof obj[k] === 'object') {
                    let res = findVideoItem(obj[k]);
                    if (res) return res;
                }
            }
            return null;
        }

        function findUserStats(obj) {
            if (!obj || typeof obj !== 'object') return null;
            if (obj.followerCount !== undefined && obj.heartCount !== undefined) return obj;
            for (let k in obj) {
                if (typeof obj[k] === 'object') {
                    let res = findUserStats(obj[k]);
                    if (res) return res;
                }
            }
            return null;
        }

        const videoDetail = findVideoItem(rawData);
        const userDetail = findUserStats(rawData);

        if (videoDetail) {
            payload.description = videoDetail.desc || payload.description;

            if (videoDetail.stats) {
                payload.playCount = Number(videoDetail.stats.playCount) || 0;
                payload.diggCount = Number(videoDetail.stats.diggCount) || 0;
                payload.commentCount = Number(videoDetail.stats.commentCount) || 0;
                payload.shareCount = Number(videoDetail.stats.shareCount) || 0;
                payload.collectCount = Number(videoDetail.stats.collectCount) || 0;
            }

            if (videoDetail.statsV2) payload.repostCount = Number(videoDetail.statsV2.repostCount) || 0;

            if (videoDetail.music) {
                payload.musicTitle = videoDetail.music.title || payload.musicTitle;
                payload.musicAuthor = videoDetail.music.authorName || payload.musicAuthor;
                payload.isOriginalAudio = videoDetail.music.original || false;
                payload.trust.audioMuteRisk = videoDetail.music.muteShare || videoDetail.music.status === 2 || false;
                payload.musicUrl = videoDetail.music.playUrl || "";
                payload.musicExtended.isCommerce = videoDetail.music.is_commerce_music || false;

                if (videoDetail.music.tt2dsp && videoDetail.music.tt2dsp.tt_to_dsp_song_infos) {
                    payload.externalDsp = videoDetail.music.tt2dsp.tt_to_dsp_song_infos.map(d => ({ platform: d.Platform, songId: d.SongId }));
                }

                // [TAMBAHAN TAHAP 4: Music Limits]
                payload.extremeDeepDive.musicUnlimited = videoDetail.music.is_unlimited_music || false;
            }

            if (videoDetail.author) {
                payload.authorHandle = typeof videoDetail.author === 'string' ? videoDetail.author : (videoDetail.author.uniqueId || payload.authorHandle);
                payload.authorNickname = typeof videoDetail.author === 'object' ? (videoDetail.author.nickname || payload.authorNickname) : payload.authorNickname;

                if (typeof videoDetail.author === 'object') {
                    payload.authorSecUid = videoDetail.author.secUid || payload.authorSecUid;
                    if (videoDetail.author.createTime) {
                        const dc = new Date(Number(videoDetail.author.createTime) * 1000);
                        payload.authorCreateTime = dc.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' });
                    }
                    payload.creatorExtended.signature = videoDetail.author.signature || "Tidak ada bio";
                    payload.creatorExtended.verified = videoDetail.author.verified || false;
                    payload.isTTSeller = videoDetail.author.ttSeller || false;

                    // [TAMBAHAN TAHAP 4: Embed Banned]
                    payload.extremeDeepDive.embedBanned = videoDetail.author.isEmbedBanned || false;
                }
            }

            if (videoDetail.createTime) {
                payload.createTime = Number(videoDetail.createTime);
                const d = new Date(payload.createTime * 1000);
                payload.publishTime = d.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' });
                const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                payload.primeTime.day = days[d.getDay()];
                payload.primeTime.time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            }

            if (videoDetail.video) {
                payload.videoDuration = videoDetail.video.duration || 0;
                payload.allowDownload = videoDetail.video.downloadAddr ? true : false;
                if (videoDetail.video.width && videoDetail.video.height) payload.videoResolution = `${videoDetail.video.width} x ${videoDetail.video.height}`;

                payload.forensics.bitrate = videoDetail.video.bitrate || 0;
                payload.forensics.originalVidId = videoDetail.video.id || "N/A";
                payload.coverUrl = videoDetail.video.cover || videoDetail.video.originCover || "";
                payload.videoUrl = videoDetail.video.playAddr || videoDetail.video.downloadAddr || "";

                payload.forensicsAdvanced.ratio = videoDetail.video.ratio || payload.forensicsAdvanced.ratio;
                payload.forensicsAdvanced.vqScore = videoDetail.video.VQScore || payload.forensicsAdvanced.vqScore;

                if (videoDetail.video.volumeInfo) {
                    payload.forensicsAdvanced.loudness = videoDetail.video.volumeInfo.Loudness || 0;
                    payload.audioPeak = videoDetail.video.volumeInfo.Peak || 0;
                }

                if (videoDetail.video.bitrateInfo) {
                    payload.codecVariants = videoDetail.video.bitrateInfo.map(b => ({
                        gear: b.GearName, codec: b.CodecType, bitrate: b.Bitrate, size: b.DataSize
                    }));

                    // [TAMBAHAN TAHAP 4: FileHash & VMAF Score]
                    payload.extremeDeepDive.fileHash = videoDetail.video.bitrateInfo[0]?.PlayAddr?.FileHash || "Unknown";
                    if (videoDetail.video.bitrateInfo[0]?.MVMAF?.["v2.0"]?.srv1) {
                        const vmafObj = videoDetail.video.bitrateInfo[0].MVMAF["v2.0"].srv1;
                        payload.extremeDeepDive.vmafScores = Object.entries(vmafObj).map(([k,v]) => `${k}:${v}`).join(', ');
                    }
                }

                // [TAMBAHAN TAHAP 4: Zoom Covers & CDN Token]
                if (videoDetail.video.zoomCover) payload.extremeDeepDive.zoomCovers = Object.keys(videoDetail.video.zoomCover);

                try {
                    const vUrl = new URL(payload.videoUrl);
                    payload.extremeDeepDive.cdnExpiration = vUrl.searchParams.get('x-expires') || "None";
                    payload.extremeDeepDive.cdnSignature = vUrl.searchParams.get('x-signature') ? "Protected" : "None";
                } catch(e) {}
            }

            payload.isAd = videoDetail.isAd || videoDetail.isTop || videoDetail.isPromoted || false;
            // [TAMBAHAN TAHAP 4: Ad Virtual & Shadow Moderation]
            payload.extremeDeepDive.isAdVirtual = videoDetail.isADVirtual || false;
            payload.extremeDeepDive.warnInfo = videoDetail.warnInfo || [];
            payload.extremeDeepDive.takeDown = videoDetail.takeDown || 0;
            payload.extremeDeepDive.shadowModeration.reviewing = videoDetail.isReviewing || false;
            payload.extremeDeepDive.shadowModeration.privateItem = videoDetail.privateItem || false;
            payload.extremeDeepDive.shadowModeration.secret = videoDetail.secret || false;
            payload.extremeDeepDive.shadowModeration.commentStatus = videoDetail.itemCommentStatus || 0;

            payload.region = videoDetail.locationCreated || "Global";

            if (videoDetail.poi) {
                payload.poi.name = videoDetail.poi.name || "None";
                payload.poi.address = videoDetail.poi.address || "None";
                payload.poi.city = videoDetail.poi.city || "None";
                // [TAMBAHAN TAHAP 4: POI Schema]
                payload.extremeDeepDive.poiSchema.cityCode = videoDetail.poi.cityCode || "Unknown";
                payload.extremeDeepDive.poiSchema.countryCode = videoDetail.poi.countryCode || "Unknown";
                payload.extremeDeepDive.poiSchema.typeTiny = videoDetail.poi.ttTypeNameTiny || "Unknown";
            }

            // [TAMBAHAN TAHAP 4: Content Lang & Structured Loc]
            payload.extremeDeepDive.contentLang = videoDetail.textLanguage || "Unknown";
            payload.extremeDeepDive.translatable = videoDetail.textTranslatable || false;
            payload.extremeDeepDive.categoryType = videoDetail.CategoryType || "Unknown";
            if (videoDetail.contentLocation && videoDetail.contentLocation.address) {
                payload.extremeDeepDive.structuredLocation = videoDetail.contentLocation.address.addressLocality || "Unknown";
            }

            if (videoDetail.contents && Array.isArray(videoDetail.contents)) {
                payload.captionChunks = videoDetail.contents.map(c => c.desc);
            }

            if (videoDetail.suggestedWords) {
                if (Array.isArray(videoDetail.suggestedWords)) payload.suggestedWords = videoDetail.suggestedWords.map(w => typeof w === 'object' ? w.word : w);
            } else if (videoDetail.searchDesc) {
                payload.suggestedWords = [videoDetail.searchDesc];
            }

            if (videoDetail.shareMeta) {
                payload.seoExtended.shareTitle = videoDetail.shareMeta.title || "";
                payload.seoExtended.shareDesc = videoDetail.shareMeta.desc || "";
            }

            if (videoDetail.diversificationLabels) payload.aiClass.labels = videoDetail.diversificationLabels;
            if (videoDetail.aigcInfo && videoDetail.aigcInfo.aigcLabelType > 0) payload.aiClass.isAigc = true;

            if (videoDetail.anchors && videoDetail.anchors.length > 0) {
                payload.commerce.hasAnchor = true;
                payload.commerce.anchorType = videoDetail.anchors[0].description || videoDetail.anchors[0].keyword || "Custom Link";
            }

            payload.trust.ageRestricted = videoDetail.isSecret || videoDetail.isMinorProtection || false;
            payload.trust.canDuet = videoDetail.duetInfo ? videoDetail.duetInfo.canDuet : true;
            payload.trust.canStitch = videoDetail.stitchInfo ? videoDetail.stitchInfo.canStitch : true;

            if (videoDetail.item_control) payload.trustAdvanced.canRepost = videoDetail.item_control.can_repost || false;

            if (videoDetail.creatorAIComment) {
                payload.trustAdvanced.aiCommentEligible = videoDetail.creatorAIComment.eligibleVideo || false;
                // [TAMBAHAN TAHAP 4: AI Ineligible Reason]
                payload.extremeDeepDive.aiCommentReason = videoDetail.creatorAIComment.notEligibleReason || "None";
            }

        } else {
            return { error: "TikTok menyembunyikan struktur metrik. Refresh tab TikTok Anda." };
        }

        if (userDetail) {
            payload.authorFollowers = Number(userDetail.followerCount) || 0;
            payload.authorHearts = Number(userDetail.heartCount) || 0;
        }

        return payload;

    } catch (e) {
        return { error: "Crash Memori: " + e.message };
    }
})();