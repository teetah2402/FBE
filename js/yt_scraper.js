//#######################################################################
// File NAME : js/yt_scraper.js (DI DALAM EKSTENSI CHROME)
// CORE LOGIC : DOM Scraper Injection for YouTube (V6 Ultimate Enterprise)
// MODIFIED : Penambahan 20+ Fitur Ekstraksi JSON (Heatmap, Geo, Codec, Lottie, dll)
//#######################################################################

(async () => {
    try {
        let payload = {
            title: document.title.replace(" - YouTube", ""),
            hiddenTags: "Tidak Ditemukan",
            isMonetized: false,
            descriptionEcom: false,
            sponsorshipWords: false,
            businessEmail: null,
            maxResThumbnail: null,
            chapters: [],
            clickbaitScore: 0,
            channelName: "Unknown",
            subscribers: "N/A",
            likes: "N/A",
            comments: "N/A",
            views: 0,
            publishDate: "Unknown",
            uploadTimeExact: "Unknown",
            dominantColors: [],
            channelId: "Unknown",
            channelHandle: "Unknown",
            avatarUrl: null,
            badges: [],
            hasMembership: false,
            category: "Unknown",
            durationSeconds: 0,
            videoFormat: "VOD (Video on Demand)",
            subtitles: [],
            externalLinks: [],
            techSpecs: { resolution: "Unknown", fps: 30 },
            adBreaksCount: 0,
            hasPinnedComment: false,
            hasCreatorHeart: false,
            hasRetentionHeatmap: false,
            isUnlisted: false,
            isFamilySafe: true,
            playabilityStatus: "OK",
            audioQuality: "Unknown",
            hasContentID: false,
            hasPaidPromo: false,
            isRemixable: false,
            hasEndScreen: false,
            hasLocalizedTitle: false,
            fullDescription: "Tidak ada deskripsi",
            error: null,

            // ==========================================
            // [METRIK LAMA] 4 PILAR ENTERPRISE TACTICS
            // ==========================================
            algoSynergy: { titleTagMatch: false, first2LinesOptimized: false, hashtagCount: 0, hashtagSpam: false },
            broadcastTech: { aspectRatio: "16:9", isHDR: false, is360VR: false, isSurroundSound: false },
            monetizationDeep: { adTypes: [], hasMerchShelf: false, hasSuperThanks: false },
            geoRestriction: { isRegionBlocked: false, hasMultiAudio: false, subtitleCount: 0 },

            // ==========================================
            // [METRIK BARU] 20+ EKSTRAKSI JSON ENTERPRISE
            // ==========================================
            secretKeywords: [], // 1. Keyword / Tags Rahasia
            availableCountries: [], // 2. Ketersediaan Negara
            exactViewCount: "0", // 3. Angka Metrik Presisi (Views)
            exactLikeCount: "0", // 3. Angka Metrik Presisi (Likes)
            audioCompression: { loudnessDb: null, perceptualLoudnessDb: null }, // 4. Analisa Kompresi Audio
            endscreenPromos: [], // 5. Strategi Endscreen & Retensi
            isEmbeddable: true, // 6. Izin Embed
            uploadDate: "Unknown", // 7. Strategi Jadwal (Upload vs Publish)
            relatedChips: [], // 7. Targeting Kata Kunci (Chips)
            rawCategory: "Unknown", // 8. Kategori Asli Video
            streamingData: { formats: [], adaptiveFormats: [] }, // 9. Streaming Data & Video Codec Asli
            has1080pPremium: false, // 10. Deteksi "1080p Premium" Paygated
            dislikeParams: null, // 11. Parameter "Dislike"
            adBadges: [], // 12. Identifikasi "Bersponsor"
            isOfflineDownloadable: true, // 13. Status Offline / Download Upsell
            exactSubscriberCount: "Unknown", // 14. Jumlah Subscriber Asli (Presisi)
            internalPromos: [], // 15. Promo / Notifikasi Tooltip
            geoTargeting: { countryCode: "Unknown", requestLanguage: "Unknown" }, // 16. Geo-Targeting Klien
            retentionHeatmap: [], // 17. Data Grafik Heatmap
            isShortsEligible: false, // 18. Status Kelayakan Video Shorts
            storyboardUrl: null, // 19. Ekstraksi Storyboard
            likeLottieAnimationUrl: null, // 20. Animasi Like Button (Lottie)
            telemetryUrls: { playback: null, delayplay: null, watchtime: null }, // 21. Algoritma Tracking Telemetri
            engagementPanels: [], // 22. Deteksi Engagement Panels
            externalChannelId: "Unknown", // 23. ID Channel Internal
            shortsShelf: [], // 24. Pemetaan Shorts Shelf
            telemetryActions: [], // 25. Telemetri Action Endpoint
            albumMetadata: null // 26. Detail Album (Content ID)
        };

        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords && metaKeywords.content) payload.hiddenTags = metaKeywords.content;

        let upperCaseWords = payload.title.match(/\b[A-Z]{3,}\b/g) || [];
        let powerWords = ["GILA", "RAHASIA", "TERBONGKAR", "HANCUR", "WAJIB", "VIRAL", "BOCOR", "WARNING", "MISTERI", "TRAGIS"];
        let clickbaitPoints = (upperCaseWords.length * 10);
        powerWords.forEach(pw => { if(payload.title.toUpperCase().includes(pw)) clickbaitPoints += 25; });
        payload.clickbaitScore = Math.min(clickbaitPoints, 100);

        let ytPlayerRes = null;
        let ytInitData = null;
        const allScripts = document.querySelectorAll('script');

        for (let s of allScripts) {
            if (s.innerHTML.includes('ytInitialPlayerResponse = ')) {
                try {
                    const rawJson = s.innerHTML.split('ytInitialPlayerResponse = ')[1].split('};')[0] + '}';
                    ytPlayerRes = JSON.parse(rawJson);
                } catch(e) {}
            }
            if (s.innerHTML.includes('var ytInitialData = ')) {
                try {
                    const rawJson = s.innerHTML.split('var ytInitialData = ')[1].split('};')[0] + '}';
                    ytInitData = JSON.parse(rawJson);
                } catch(e) {}
            }
        }

        if (ytPlayerRes) {
            const strPlayerRes = JSON.stringify(ytPlayerRes);

            if (strPlayerRes.includes("endscreenRenderer")) payload.hasEndScreen = true;
            if (strPlayerRes.includes("translationLanguages") || strPlayerRes.includes("translatedTitle")) payload.hasLocalizedTitle = true;

            if (strPlayerRes.includes('"regionRestriction"')) payload.geoRestriction.isRegionBlocked = true;

            // [NEW] 1. Secret Keywords
            if (ytPlayerRes.videoDetails?.keywords) payload.secretKeywords = ytPlayerRes.videoDetails.keywords;

            // [NEW] Microformat Data Extraction
            const micro = ytPlayerRes.microformat?.playerMicroformatRenderer;
            if (micro) {
                if (micro.availableCountries) payload.availableCountries = micro.availableCountries;
                if (micro.viewCount) payload.exactViewCount = micro.viewCount;
                if (micro.category) payload.rawCategory = micro.category;
                if (micro.isShortsEligible !== undefined) payload.isShortsEligible = micro.isShortsEligible;
                if (micro.externalChannelId) payload.externalChannelId = micro.externalChannelId;
                if (micro.uploadDate) payload.uploadDate = micro.uploadDate;
            }

            // [NEW] 4. Audio Compression
            const audioCfg = ytPlayerRes.playerConfig?.audioConfig;
            if (audioCfg) payload.audioCompression = { loudnessDb: audioCfg.loudnessDb, perceptualLoudnessDb: audioCfg.perceptualLoudnessDb };

            // [NEW] 5. Endscreen Strategy
            const endscreenElements = ytPlayerRes.endscreen?.endscreenRenderer?.elements;
            if (endscreenElements) {
                payload.endscreenPromos = endscreenElements.map(el => {
                    let title = el.endscreenElementRenderer?.title?.simpleText || "Unknown";
                    let url = el.endscreenElementRenderer?.endpoint?.urlEndpoint?.url || el.endscreenElementRenderer?.endpoint?.commandMetadata?.webCommandMetadata?.url || "Internal";
                    return { title, url };
                });
            }

            // [NEW] 15. Internal Tooltips / Promos
            if (ytPlayerRes.messages) {
                ytPlayerRes.messages.forEach(m => {
                    const promoId = m.tooltipRenderer?.promoConfig?.promoId;
                    if (promoId) payload.internalPromos.push(promoId);
                });
            }

            // [NEW] 19. Storyboard URL
            if (ytPlayerRes.storyboards?.playerStoryboardSpecRenderer?.spec) {
                payload.storyboardUrl = ytPlayerRes.storyboards.playerStoryboardSpecRenderer.spec;
            }

            // [NEW] 20. Telemetry / Playback Tracking
            if (ytPlayerRes.playbackTracking) {
                payload.telemetryUrls = {
                    playback: ytPlayerRes.playbackTracking.videostatsPlaybackUrl?.baseUrl,
                    delayplay: ytPlayerRes.playbackTracking.videostatsDelayplayUrl?.baseUrl,
                    watchtime: ytPlayerRes.playbackTracking.videostatsWatchtimeUrl?.baseUrl
                };
            }

            if (ytPlayerRes.adPlacements && ytPlayerRes.adPlacements.length > 0) {
                payload.isMonetized = true;
                payload.adBreaksCount = ytPlayerRes.adPlacements.length;

                ytPlayerRes.adPlacements.forEach(ad => {
                    const placement = ad.adPlacementRenderer;
                    if (placement) {
                        if (placement.config?.adPlacementConfig?.adTimeOffset) {
                            const offset = placement.config.adPlacementConfig.adTimeOffset.offsetStartMilliseconds;
                            if (offset === "0") {
                                if (!payload.monetizationDeep.adTypes.includes("Pre-roll")) payload.monetizationDeep.adTypes.push("Pre-roll");
                            } else {
                                if (!payload.monetizationDeep.adTypes.includes("Mid-roll")) payload.monetizationDeep.adTypes.push("Mid-roll");
                            }
                        } else {
                            if (!payload.monetizationDeep.adTypes.includes("Display/Overlay")) payload.monetizationDeep.adTypes.push("Display/Overlay");
                        }
                    }
                });
            }

            if (ytPlayerRes.playerConfig && ytPlayerRes.playerConfig.monetization) payload.isMonetized = true;

            if (ytPlayerRes.videoDetails) {
                if (ytPlayerRes.videoDetails.videoId) {
                    payload.maxResThumbnail = `https://i.ytimg.com/vi/${ytPlayerRes.videoDetails.videoId}/maxresdefault.jpg`;
                }
                if (ytPlayerRes.videoDetails.viewCount) {
                    payload.views = parseInt(ytPlayerRes.videoDetails.viewCount);
                }
                if (ytPlayerRes.videoDetails.lengthSeconds) {
                    payload.durationSeconds = parseInt(ytPlayerRes.videoDetails.lengthSeconds);
                }
                if (ytPlayerRes.videoDetails.isLiveContent) {
                    payload.videoFormat = "🔴 Live Stream / Replay";
                }
                if (ytPlayerRes.videoDetails.shortDescription) {
                    payload.fullDescription = ytPlayerRes.videoDetails.shortDescription;
                }
            }

            if (ytPlayerRes.microformat && ytPlayerRes.microformat.playerMicroformatRenderer) {
                const microData = ytPlayerRes.microformat.playerMicroformatRenderer;
                payload.publishDate = microData.publishDate || "Unknown";
                if (payload.publishDate !== "Unknown") {
                    try {
                        const dateObj = new Date(payload.publishDate);
                        const hrs = dateObj.getHours().toString().padStart(2, '0');
                        const mins = dateObj.getMinutes().toString().padStart(2, '0');
                        payload.uploadTimeExact = `${hrs}:${mins}`;
                    } catch(e) {}
                }
                payload.category = microData.category || "Unknown";
                if (microData.isUnlisted) payload.isUnlisted = true;
                if (microData.isFamilySafe === false) payload.isFamilySafe = false;
                if (microData.isUpcomingEvent) payload.videoFormat = "⏳ Premiere";
            }

            if (ytPlayerRes.playabilityStatus) {
                if (ytPlayerRes.playabilityStatus.status) {
                    payload.playabilityStatus = ytPlayerRes.playabilityStatus.status;
                }
                // [NEW] 6. Embeddable
                if (ytPlayerRes.playabilityStatus.playableInEmbed !== undefined) payload.isEmbeddable = ytPlayerRes.playabilityStatus.playableInEmbed;

                // [NEW] 9. 1080p Premium Deteksi
                const paygated = ytPlayerRes.playabilityStatus.paygatedQualitiesMetadata?.restrictedAdaptiveFormats;
                if (paygated && paygated.some(f => f.qualityLabel === "1080p Premium")) {
                    payload.has1080pPremium = true;
                }

                // [NEW] 12. Offline / Download Upsell
                const offlineEndpoint = ytPlayerRes.playabilityStatus.offlineability?.buttonRenderer?.serviceEndpoint;
                if (offlineEndpoint && JSON.stringify(offlineEndpoint).includes("ypcGetOfflineUpsellEndpoint")) {
                    payload.isOfflineDownloadable = false;
                }
            }

            if (ytPlayerRes.captions?.playerCaptionsTracklistRenderer?.captionTracks) {
                const tracks = ytPlayerRes.captions.playerCaptionsTracklistRenderer.captionTracks;
                tracks.forEach(t => {
                    const lang = t.name?.simpleText || t.languageCode;
                    if (!lang.toLowerCase().includes("auto-generated")) payload.subtitles.push(lang);
                });
                payload.geoRestriction.subtitleCount = payload.subtitles.length;
            }

            if (ytPlayerRes.captions?.playerCaptionsTracklistRenderer?.audioTracks) {
                if (ytPlayerRes.captions.playerCaptionsTracklistRenderer.audioTracks.length > 1) {
                    payload.geoRestriction.hasMultiAudio = true;
                }
            }

            if (ytPlayerRes.streamingData && ytPlayerRes.streamingData.adaptiveFormats) {
                let maxRes = 0; let maxFps = 30; let maxAudioBitrate = 0;
                let hasCinematicRatio = false;

                // [NEW] 8. Expose Streaming Formats untuk Developer
                payload.streamingData = ytPlayerRes.streamingData;

                ytPlayerRes.streamingData.adaptiveFormats.forEach(f => {
                    if (f.height && f.height > maxRes) maxRes = f.height;
                    if (f.fps && f.fps > maxFps) maxFps = f.fps;
                    if (f.mimeType && f.mimeType.includes('audio') && f.bitrate > maxAudioBitrate) {
                        maxAudioBitrate = f.bitrate;
                    }

                    if (f.projectionType === "SPHERICAL") payload.broadcastTech.is360VR = true;
                    if (f.colorInfo && f.colorInfo.primaries && f.colorInfo.primaries.includes("BT2020")) payload.broadcastTech.isHDR = true;
                    if (f.audioChannels && f.audioChannels > 2) payload.broadcastTech.isSurroundSound = true;
                    if (f.width && f.height) {
                        const ratio = f.width / f.height;
                        if (ratio > 2.0) hasCinematicRatio = true;
                    }
                });

                if (hasCinematicRatio) payload.broadcastTech.aspectRatio = "21:9 (Cinematic/Ultrawide)";
                if (maxRes > 0) payload.techSpecs = { resolution: `${maxRes}p`, fps: maxFps };
                if (maxAudioBitrate > 128000) payload.audioQuality = `High/Studio (${Math.round(maxAudioBitrate/1000)} kbps)`;
                else if (maxAudioBitrate > 0) payload.audioQuality = `Standard (${Math.round(maxAudioBitrate/1000)} kbps)`;
            }

            if (strPlayerRes.includes("heatbook") || strPlayerRes.includes("markerMap")) payload.hasRetentionHeatmap = true;
        }

        if (ytInitData) {
            const strInitData = JSON.stringify(ytInitData);

            if (strInitData.includes("Includes paid promotion") || strInitData.includes("paidPromoBadge") || strInitData.includes("paidPromotion")) payload.hasPaidPromo = true;
            if (strInitData.toLowerCase().includes("licensed to youtube by") || strInitData.toLowerCase().includes("music in this video")) payload.hasContentID = true;
            if (strInitData.includes("YOUTUBE_SHORTS_REMIX") || (strInitData.includes("buttonRenderer") && strInitData.includes("Remix"))) payload.isRemixable = true;

            if (strInitData.includes("merchandiseShelfRenderer") || strInitData.includes("shoppingPanelRenderer")) payload.monetizationDeep.hasMerchShelf = true;
            if (strInitData.includes('"iconType":"THANKS"') || strInitData.includes("superThanks")) payload.monetizationDeep.hasSuperThanks = true;

            // [NEW] 16. Geo-Targeting Klien Topbar
            const topbar = ytInitData.topbar?.desktopTopbarRenderer;
            if (topbar) {
                payload.geoTargeting = { countryCode: topbar.countryCode, requestLanguage: topbar.requestLanguage };
            }

            // [NEW] 7. Related Chips / Topik Tersembunyi
            const secondaryResults = ytInitData.contents?.twoColumnWatchNextResults?.secondaryResults?.secondaryResults?.results;
            if (secondaryResults && secondaryResults[0]?.relatedChipCloudRenderer?.content?.chipCloudRenderer?.chips) {
                payload.relatedChips = secondaryResults[0].relatedChipCloudRenderer.content.chipCloudRenderer.chips.map(c => c.chipCloudChipRenderer?.text?.simpleText).filter(Boolean);
            }

            // [NEW] Dislike Params & Exact Like Count
            const buttons = ytInitData.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[0]?.videoPrimaryInfoRenderer?.videoActions?.menuRenderer?.topLevelButtons;
            if (buttons) {
                buttons.forEach(btn => {
                    const vm = btn.segmentedLikeDislikeButtonViewModel?.likeButtonViewModel?.likeButtonViewModel;
                    if (vm?.likeCountText) payload.exactLikeCount = vm.likeCountText;

                    const dvm = btn.segmentedLikeDislikeButtonViewModel?.dislikeButtonViewModel?.dislikeButtonViewModel;
                    if (dvm?.innertubeCommand?.likeEndpoint?.dislikeParams) {
                        payload.dislikeParams = dvm.innertubeCommand.likeEndpoint.dislikeParams;
                    }
                });
            }

            // [NEW] 13. Exact Subscriber & Avatar
            try {
                const ownerInfo = ytInitData.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[1]?.videoSecondaryInfoRenderer?.owner?.videoOwnerRenderer;
                if (ownerInfo) {
                    payload.channelName = ownerInfo.title?.runs?.[0]?.text || "Unknown";
                    payload.subscribers = ownerInfo.subscriberCountText?.simpleText || "Disembunyikan";

                    // Ekstensi presisi tinggi
                    if (ownerInfo.subscriberCountText) {
                        payload.exactSubscriberCount = ownerInfo.subscriberCountText.accessibility?.accessibilityData?.label || ownerInfo.subscriberCountText.simpleText;
                    }

                    payload.channelId = ownerInfo.navigationEndpoint?.browseEndpoint?.browseId || ownerInfo.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || "Unknown";
                    payload.channelHandle = ownerInfo.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl || "Unknown";

                    const avatarRuns = ownerInfo.thumbnail?.thumbnails || [];
                    if (avatarRuns.length > 0) payload.avatarUrl = avatarRuns[avatarRuns.length - 1].url;

                    const badges = ownerInfo.ownerBadges || [];
                    badges.forEach(b => {
                        const badgeType = b.metadataBadgeRenderer?.tooltip;
                        if (badgeType) payload.badges.push(badgeType);
                    });
                }

                if (strInitData.includes("sponsorButtonRenderer")) payload.hasMembership = true;
                if (strInitData.includes("pinnedCommentBadge")) payload.hasPinnedComment = true;
                if (strInitData.includes("creatorHeart")) payload.hasCreatorHeart = true;

                const actionButtons = ytInitData.frameworkUpdates?.entityBatchUpdate?.mutations || [];
                for (let m of actionButtons) {
                    if (m.payload?.likeCountEntity?.likeCountIfLikedResult) {
                        payload.likes = m.payload.likeCountEntity.likeCountIfLikedResult.simpleText || "N/A";
                        break;
                    }
                }
            } catch(e) {}

            // [NEW] Framework Updates: 17. Heatmap & 20. Lottie Animations
            const mutations = ytInitData.frameworkUpdates?.entityBatchUpdate?.mutations;
            if (mutations) {
                mutations.forEach(m => {
                    if (m.payload?.macroMarkersListEntity?.markersList?.markers) {
                        m.payload.macroMarkersListEntity.markersList.markers.forEach(mk => {
                            if (mk.intensityScoreNormalized) {
                                payload.retentionHeatmap.push({
                                    startMillis: mk.startMillis,
                                    durationMillis: mk.durationMillis,
                                    intensity: mk.intensityScoreNormalized
                                });
                            }
                        });
                    }
                    if (m.payload?.likeButtonAnimationEntity?.animationLightUrl) {
                        payload.likeLottieAnimationUrl = m.payload.likeButtonAnimationEntity.animationLightUrl;
                    }
                });
            }

            // [NEW] 22. Engagement Panels, 24. Shorts Shelf, 26. Album Metadata
            if (ytInitData.engagementPanels) {
                ytInitData.engagementPanels.forEach(panel => {
                    const ep = panel.engagementPanelSectionListRenderer;
                    if (ep?.panelIdentifier) payload.engagementPanels.push(ep.panelIdentifier);

                    if (ep?.content?.reelShelfRenderer) {
                        ep.content.reelShelfRenderer.items.forEach(item => {
                            const title = item.reelItemRenderer?.headline?.simpleText;
                            if (title) payload.shortsShelf.push(title);
                        });
                    }

                    if (ep?.content?.horizontalCardListRenderer?.cards) {
                        const album = ep.content.horizontalCardListRenderer.cards[0]?.videoAttributeViewModel?.secondarySubtitle?.content;
                        if (album) payload.albumMetadata = album;
                    }
                });
            }

            // [NEW] 12. Ad Badges
            if (ytInitData.adSlots) {
                ytInitData.adSlots.forEach(slot => {
                    const badge = slot.adSlotRenderer?.fulfillmentContent?.fulfilledLayout?.aboveFeedAdLayoutRenderer?.renderingContent?.instreamVideoAdRenderer?.adBadge?.adBadgeViewModel?.label?.content;
                    if (badge) payload.adBadges.push(badge);
                });
            }
        }

        if (payload.likes === "N/A") {
            const likeBtn = document.querySelector('button[aria-label*="like this video"]');
            if (likeBtn) {
                const match = likeBtn.getAttribute('aria-label').match(/([\d,.]+)\s/);
                if (match) payload.likes = match[1];
            }
        }
        const commentCountEl = document.querySelector('h2#count yt-formatted-string');
        if (commentCountEl) payload.comments = commentCountEl.innerText;

        const descElement = document.querySelector('#description-inline-expander');
        if (descElement) {
            const descText = descElement.innerText.toLowerCase();
            if (descText.match(/shopee\.|tokopedia\.|amzn\.to|tiktok\.com|lazada\.|patreon\.com|t\.me|discord\.gg/)) payload.descriptionEcom = true;
            if (descText.match(/sponsored by|terima kasih|kode promo|diskon/)) payload.sponsorshipWords = true;

            const emailMatch = descElement.innerText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
            if (emailMatch) payload.businessEmail = emailMatch[0];

            const chapterMatches = descElement.innerText.match(/\b\d{1,2}:\d{2}\b.*?$/gm);
            if (chapterMatches) payload.chapters = chapterMatches.slice(0, 5);

            const urlMatches = descElement.innerText.match(/https?:\/\/[^\s"]+/g) || [];
            if (urlMatches.length > 0) {
                const socialPatterns = /instagram|tiktok|twitter|x\.com|t\.me|discord|patreon|facebook|linktr\.ee/i;
                payload.externalLinks = [...new Set(urlMatches.filter(u => socialPatterns.test(u)))];
            }
        }

        // =========================================================
        // Kalkulasi ALGORITHM SYNERGY (Dilakukan di akhir)
        // =========================================================
        if (payload.hiddenTags !== "Tidak Ditemukan" && payload.title) {
            const firstTag = payload.hiddenTags.split(',')[0].trim().toLowerCase();
            if (firstTag && payload.title.toLowerCase().includes(firstTag)) {
                payload.algoSynergy.titleTagMatch = true;
            }
        }

        const hashtags = payload.fullDescription.match(/#[^\s#]+/g) || [];
        payload.algoSynergy.hashtagCount = hashtags.length;
        if (hashtags.length > 15) payload.algoSynergy.hashtagSpam = true;

        const descLines = payload.fullDescription.split('\n').filter(line => line.trim().length > 0).slice(0, 2).join(' ').toLowerCase();
        const titleWords = payload.title.toLowerCase().split(' ').filter(w => w.length > 3);
        let matchCount = 0;
        titleWords.forEach(w => { if (descLines.includes(w)) matchCount++; });
        if (matchCount >= 2) payload.algoSynergy.first2LinesOptimized = true;

        if (payload.maxResThumbnail) {
            payload.dominantColors = await new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width; canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                    let colorCounts = {};

                    for (let i = 0; i < imageData.length; i += 4 * 20) {
                        const r = Math.round(imageData[i] / 15) * 15;
                        const g = Math.round(imageData[i+1] / 15) * 15;
                        const b = Math.round(imageData[i+2] / 15) * 15;
                        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();

                        if (r > 20 && g > 20 && b > 20 && r < 240 && g < 240 && b < 240) {
                            colorCounts[hex] = (colorCounts[hex] || 0) + 1;
                        }
                    }

                    const sortedColors = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]).slice(0, 20);
                    resolve(sortedColors);
                };
                img.onerror = () => resolve([]);
                img.src = payload.maxResThumbnail;
            });
        }

        return payload;
    } catch (e) {
        return { error: e.message };
    }
})();