// [HUKUM 4] Idempotent Wrapper: Mencegah error redeclare saat disuntik berulang kali
if (!window.__floworkSeoCheckerInjected) {
    window.__floworkSeoCheckerInjected = true;

    // State status tool yang sedang aktif
    let statusHighlight = {
        meta: false,
        images: false,
        headings: false,
        links: false,
        social: false,
        keywords: false,
        speed: false,
        schema: false,
        article: false
    };
    let classPrefix = 'sc__39Oges344SCYkYf_';

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            switch (request.type) {
                case 'syncStatuses':
                    sendResponse({ 'status': statusHighlight });
                    break;
                case 'setStatus':
                    let processStatuses = async () => {
                        let extractedData = null;

                        for (const status of request.status) {
                            let oldStatus = statusHighlight[status.type];
                            statusHighlight[status.type] = status.value;

                            if (oldStatus === status.value) {
                                continue;
                            }

                            if (!oldStatus && status.value) {
                                // Eksekusi UI + Ambil Datanya
                                extractedData = await onOpen(status.type);
                            } else {
                                await onClose(status.type);
                                extractedData = null;
                            }
                        }
                        // Kirim data hasil scraping kembali ke app.js di Flowork
                        sendResponse({status: statusHighlight, data: extractedData});
                    };

                    processStatuses();
                    break;
            }
            return true; // Wajib return true untuk async response di MV3
        }
    );

    async function onOpen(type) {
        let scanResult = {};

        switch (type) {
            case 'meta':
                let title = document.querySelector('title')?.innerText || '';
                let desc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
                let canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
                let robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') || '';

                let textContentMeta = document.body.innerText.replace(/\s+/g, ' ').trim();
                let wordCount = textContentMeta === '' ? 0 : textContentMeta.split(' ').length;

                scanResult = { title, desc, canonical, robots, wordCount };
                break;

            case 'images':
                let images = document.querySelectorAll("img");

                let missingAltCount = 0;
                let missingAltSrc = [];
                let allImagesSrc = [];

                for (let i = 0; i < images.length; i++) {
                    // Ambil URL Asli (Support Lazy Loading)
                    let rawSrc = images[i].currentSrc || images[i].src || images[i].getAttribute('data-src');

                    // Kumpulkan bukti maksimal 60 gambar biar memori nggak jebol
                    if (rawSrc && allImagesSrc.length < 60) {
                        allImagesSrc.push(rawSrc);
                    }

                    let altText = images[i].getAttribute('alt');
                    if (altText === null || altText.trim() === '') {
                        missingAltCount++;
                        if (missingAltSrc.length < 10 && rawSrc) {
                            missingAltSrc.push(rawSrc);
                        }
                    }
                }

                scanResult = {
                    total: images.length,
                    missingAlt: missingAltCount,
                    missingAltSrc: missingAltSrc,
                    allImages: allImagesSrc
                };

                // Asynchronous eksekusi MB/KB biar nggak ngeblokir/ngehang UI
                addImageSize(images).catch(e => console.warn("Image size fetch delayed", e));
                break;

            case 'links':
                let links = document.querySelectorAll("a");
                let dofollow = 0, nofollow = 0, internal = 0, external = 0;
                let currentHost = window.location.hostname;
                let externalLinks = [];

                for (let i = 0; i < links.length; i++) {
                    let link = links[i];

                    try {
                        if (link.href) {
                            let urlObj = new URL(link.href);
                            if (urlObj.hostname === currentHost || urlObj.hostname === '') {
                                internal++;
                            } else {
                                external++;
                                if (externalLinks.length < 5 && !link.href.startsWith('javascript')) {
                                    externalLinks.push(link.href);
                                }
                            }
                        }
                    } catch(e) {
                        internal++;
                    }

                    let test = document.createElement('test');
                    let element = document.createElement('sitechecker_element');

                    element.appendChild(test);
                    link.classList.add(classPrefix + 'add_class', classPrefix + 'links');

                    let isNoFollow = link.rel === 'nofollow';

                    if (isNoFollow) {
                        nofollow++;
                        element.classList.add(classPrefix + "_links" + (isNoFollow ? '_nf' : ''), classPrefix + '_ligth', classPrefix + 'links');
                        link.insertBefore(element, link.firstChild);
                    } else {
                        dofollow++;
                    }
                }

                // [KODE BARU] Asynchronous Broken Link Checker (Mengecek di background)
                let deadLinks = [];
                const checkDeadLinks = async () => {
                    let toCheck = externalLinks.slice(0, 5); // Batasi 5 biar ga kena blokir server
                    for(let url of toCheck) {
                        try {
                            await fetch(url, {method: 'HEAD', mode: 'no-cors'});
                        } catch(e) {
                            deadLinks.push(url);
                        }
                    }
                };
                checkDeadLinks(); // Biarkan jalan asinkronus tanpa nunggu

                scanResult = {
                    total: links.length, dofollow: dofollow, nofollow: nofollow,
                    internal: internal, external: external, externalLinks: externalLinks, deadLinks: deadLinks
                };
                break;

            case 'headings':
                let h1s = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
                let hCounts = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
                let h1Texts = [];
                let h2Texts = [];

                // [KODE BARU] Variabel untuk Deteksi Heading Jump
                let jumpWarnings = [];
                let previousLevel = 0;

                for (let i = 0; i < h1s.length; i++) {
                    let h1 = h1s[i];
                    let tag = h1.tagName.toLowerCase();

                    // [KODE BARU] Logika Heading Jump
                    let currentLevel = parseInt(h1.tagName.replace('H', ''));
                    if (previousLevel !== 0 && (currentLevel - previousLevel > 1)) {
                        jumpWarnings.push(`Terjadi lompatan dari H${previousLevel} langsung ke H${currentLevel}`);
                    }
                    previousLevel = currentLevel;

                    if (hCounts[tag] !== undefined) hCounts[tag]++;

                    if (tag === 'h1') {
                        let txt = h1.innerText.trim().replace(/\s+/g, ' ');
                        if (txt) h1Texts.push(txt);
                    }
                    if (tag === 'h2' && h2Texts.length < 5) {
                        let txt = h1.innerText.trim().replace(/\s+/g, ' ');
                        if (txt.length > 50) txt = txt.substring(0, 50) + '...';
                        if (txt) h2Texts.push(txt);
                    }

                    let test = document.createElement('test');
                    let hElement = document.createElement('sitechecker_element');

                    hElement.appendChild(test);
                    h1.classList.add(classPrefix + 'add_class', classPrefix + 'headings');
                    hElement.classList.add(classPrefix + "_ligth", classPrefix + 'headings');

                    h1.insertBefore(hElement, h1.firstChild);
                }
                // [KODE BARU] Memasukkan array jumpWarnings ke payload
                scanResult = { total: h1s.length, details: hCounts, h1Texts: h1Texts, h2Texts: h2Texts, jumpWarnings: [...new Set(jumpWarnings)] };
                break;

            case 'social':
                let ogTitle = document.querySelector('meta[property="og:title"]')?.content || '';
                let ogDesc = document.querySelector('meta[property="og:description"]')?.content || '';
                let ogImage = document.querySelector('meta[property="og:image"]')?.content || '';
                let twitterCard = document.querySelector('meta[name="twitter:card"]')?.content || '';
                scanResult = { ogTitle, ogDesc, ogImage, twitterCard };
                break;

            case 'keywords':
                let text = document.body.innerText.toLowerCase();
                let stopwords = ['dan','atau','di','ke','dari','yang','ini','itu','untuk','dengan','is','the','and','to','of','a','in','that','for','on','it','with','as'];
                let wordsArr = text.split(/[^a-z0-9_]/).filter(w => w.length > 3 && !stopwords.includes(w));
                let wordCounts = {};
                wordsArr.forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1; });

                // [KODE BARU] Kalkulasi Reading Time & Keyword Density
                let readingTimeMin = Math.ceil(wordsArr.length / 200); // Rata-rata 200 kata/menit

                let sortedWords = Object.keys(wordCounts).map(w => ({
                    word: w,
                    count: wordCounts[w],
                    density: ((wordCounts[w] / wordsArr.length) * 100).toFixed(2) + '%' // [KODE BARU] Persentase kepenuhan
                })).sort((a,b) => b.count - a.count).slice(0, 15);

                scanResult = { totalWords: wordsArr.length, uniqueWords: Object.keys(wordCounts).length, topWords: sortedWords, readingTime: readingTimeMin };
                break;

            case 'speed':
                let perf = window.performance;
                let timing = perf.timing;
                let loadTime = timing.loadEventEnd - timing.navigationStart;
                if (loadTime <= 0) loadTime = 0;

                // [KODE BARU] Penarikan Data Modern Core Web Vitals (FCP)
                let fcpVal = 0;
                try {
                    let paints = performance.getEntriesByType('paint');
                    let fcpEntry = paints.find(p => p.name === 'first-contentful-paint');
                    if(fcpEntry) fcpVal = fcpEntry.startTime;
                } catch(e) {}

                scanResult = {
                    loadTime: loadTime,
                    dns: timing.domainLookupEnd - timing.domainLookupStart,
                    tcp: timing.connectEnd - timing.connectStart,
                    ttfb: timing.responseStart - timing.navigationStart,
                    dom: timing.domComplete - timing.domLoading,
                    fcp: fcpVal // [KODE BARU] Ngirim metrik FCP
                };
                break;

            case 'schema':
                let schemas = [];
                document.querySelectorAll('script[type="application/ld+json"]').forEach(el => {
                    try {
                        let json = JSON.parse(el.innerText);
                        if (json['@type']) schemas.push(json['@type']);
                        else if (json['@graph']) { json['@graph'].forEach(g => { if(g['@type']) schemas.push(g['@type']); }) }
                    } catch(e) {}
                });
                let isHttps = window.location.protocol === 'https:';
                let hasFavicon = !!document.querySelector('link[rel*="icon"]');
                let hasIframes = document.querySelectorAll('iframe').length > 0;
                let hasMetaRefresh = !!document.querySelector('meta[http-equiv="refresh"]');
                scanResult = { schemas: [...new Set(schemas)], isHttps, hasFavicon, hasIframes, hasMetaRefresh };
                break;

            case 'article':
                let articleTag = document.querySelector('article');
                let mainTag = document.querySelector('main');
                let resultText = '';
                if (articleTag) {
                    resultText = articleTag.innerText;
                } else if (mainTag) {
                    resultText = mainTag.innerText;
                } else {
                    let paragraphs = document.querySelectorAll('p');
                    let pTexts = [];
                    paragraphs.forEach(p => { if(p.innerText.length > 50) pTexts.push(p.innerText); });
                    resultText = pTexts.join('\n\n');
                }
                scanResult = { textLength: resultText.length, articleText: resultText };
                break;
        }
        return scanResult;
    }

    async function onClose(type) {
        // Fitur yang tidak memanipulasi DOM HTML (hanya baca data) tidak perlu dibersihkan
        if (['meta', 'social', 'keywords', 'speed', 'schema', 'article'].includes(type)) return;

        switch (type) {
            case 'images':
                let imageWrapList = document.querySelectorAll("." + classPrefix + '_img_wrap');
                for (let z = 0; z < imageWrapList.length; z++) {
                    let imageWrap = imageWrapList[z];
                    let parent = imageWrap.parentNode;
                    let img = Array.from(imageWrap.children);

                    for (let k = img.length - 1; k >= 0; k--) {
                        parent.insertBefore(img[k], imageWrap);
                    }
                    imageWrap.remove();
                }
                break;
            case 'links':
                let lHighLightElements = document.querySelectorAll("." + classPrefix + "_ligth." + classPrefix + 'links');
                for (let i = 0; i < lHighLightElements.length; i++) {
                    let el = lHighLightElements[i];
                    el.remove();
                }

                let lWraps = document.querySelectorAll("." + classPrefix + 'add_class.' + classPrefix + 'links');
                for (let y = 0; y < lWraps.length; y++) {
                    let wEl = lWraps[y];
                    wEl.classList.remove(classPrefix + 'add_class', classPrefix + 'links');
                }
                break;
            case 'headings':
                let highLightElements = document.querySelectorAll("." + classPrefix + "_ligth." + classPrefix + 'headings');
                for (let i = 0; i < highLightElements.length; i++) {
                    let el = highLightElements[i];
                    el.remove();
                }

                let wraps = document.querySelectorAll("." + classPrefix + 'add_class.' + classPrefix + 'headings');
                for (let y = 0; y < wraps.length; y++) {
                    let wEl = wraps[y];
                    wEl.classList.remove(classPrefix + 'add_class', classPrefix + 'headings');
                }
                break;
        }
    }

    async function addImageSize(images) {
        let promises = [];
        for (let i = 0; i < images.length; i++) {
            let img = images[i];
            if (img.src && isValidUrl(img.src)) {
                try {
                    const imageSize = await getImageSize(img);
                    promises.push(imageSize);
                    await delay(4);
                } catch (e) {}
            }
        }
        return promises;
    }

    async function getImageSize(img) {
        let src = img.src;
        if (img.parentNode.tagName === 'PICTURE') {
            try { src = getCurrentImageUrl(img.parentNode); } catch (e) {}
        }
        let response = await fetch(src, {method: 'HEAD'});
        let contentLength = response.headers.get('content-length');

        if (!contentLength) {
            response = await fetch(src);
            contentLength = response.headers.get('content-length');
            if (!contentLength) {
                const blob = await response.blob();
                contentLength = blob.size;
            }
        }

        const sizeKB = Math.round(contentLength ? parseInt(contentLength) / 1024 : 0);

        if (sizeKB) {
            const imgWrapper = document.createElement('sitechecker_img_element');
            imgWrapper.classList.add(classPrefix + '_img_wrap');
            imgWrapper.dataset.size = sizeKB + ' kb';

            if (img.parentNode.tagName === 'PICTURE') {
                img.parentNode.parentNode.insertBefore(imgWrapper, img.parentNode);
                imgWrapper.appendChild(img.parentNode);
            } else {
                img.parentNode.insertBefore(imgWrapper, img);
                imgWrapper.appendChild(img);
            }
        }
        return sizeKB;
    }

    async function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getCurrentImageUrl(picture) {
        const sources = Array.from(picture.querySelectorAll('source'));
        for (const source of sources) {
            const media = source.media;
            if ((!media || window.matchMedia(media).matches) && isValidUrl(source.srcset)) {
                return source.srcset;
            }
        }
        const img = picture.querySelector('img');
        return img ? img.src : '';
    }

    function isValidUrl(url) {
        try {
            if (url && url.startsWith('//')) url = new URL(window.location.protocol + url,).toString();
            if (url && url.startsWith('/')) url = new URL(url, window.location.origin).toString();
        } catch (e) {}
        return !!/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(url);
    }
}