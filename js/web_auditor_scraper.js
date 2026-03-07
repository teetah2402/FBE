//#######################################################################
// File NAME : js/web_auditor_scraper.js (DI DALAM EKSTENSI CHROME)
// CORE LOGIC : DOM Scraper & Advanced Vulnerability Fetcher (DEVSECOPS TIER)
//#######################################################################
(async () => {
    try {
        let results = [];
        const baseUrl = window.location.origin;

        const checkEndpoint = async (path, type, criticalLabel) => {
            const fullUrl = `${baseUrl}${path}`;
            try {
                const res = await fetch(fullUrl, { method: 'GET', headers: { 'Range': 'bytes=0-5000' } });

                if (res.status === 200 || res.status === 206) {
                    const text = await res.text();
                    const textLower = text.toLowerCase();

                    if (text.trim().length === 0) {
                        return { status: "SAFE", path: path, fullUrl: fullUrl, type: type };
                    }

                    const isHtmlPage = textLower.includes("<!doctype html") || textLower.includes("<html");
                    const isOpenDir = textLower.includes("index of /");

                    if (!isHtmlPage || isOpenDir) {
                        let previewStr = "";
                        const isBinary = path.match(/\.(zip|tar\.gz|sqlite|sqlite3|db)$/i);

                        if (isBinary) {
                            previewStr = "[FILE DATABASE/ARSIP BINER TERDETEKSI - SILAKAN KLIK UNDUH URL ASLI UNTUK MELAKUKAN EKSTRAKSI/DUMPING]";
                        } else {
                            previewStr = text.substring(0, 800);
                            if (text.length > 800) previewStr += "\n\n... [KONTEN TERLALU PANJANG - SILAKAN UNDUH BUKTI UNTUK MEMBACA FULL]";
                        }

                        return {
                            status: "CRITICAL", path: path, fullUrl: fullUrl, type: type,
                            label: criticalLabel, preview: previewStr,
                            proofData: isBinary ? null : text
                        };
                    }
                }
            } catch (e) {}
            return { status: "SAFE", path: path, fullUrl: fullUrl, type: type };
        };

        // 1. SCAN: DATABASE BACKUP
        const dbPaths = ['/backup.sql', '/db.sql', '/database.sql', '/dump.sql'];
        let dbLeaked = false;
        for (let path of dbPaths) {
            const check = await checkEndpoint(path, "db_leak", "DATABASE TERBUKA");
            if (check.status === "CRITICAL") { results.push(check); dbLeaked = true; break; }
        }
        if (!dbLeaked) results.push({ status: "SAFE", path: "*.sql", type: "db_leak" });

        // 2. SCAN: ENVIRONMENT & REPOSITORY
        results.push(await checkEndpoint('/.env', "env_leak", "CONFIG (.ENV) TEREKSPOS"));
        results.push(await checkEndpoint('/.git/config', "git_leak", "GIT REPOSITORY TEREKSPOS"));

        // 3. SCAN: SYSTEM LOGS
        const logPaths = ['/error_log', '/debug.log', '/storage/logs/laravel.log'];
        let logLeaked = false;
        for (let path of logPaths) {
            const checkLog = await checkEndpoint(path, "log_leak", "SYSTEM LOG TEREKSPOS");
            if (checkLog.status === "CRITICAL") { results.push(checkLog); logLeaked = true; break; }
        }
        if (!logLeaked) results.push({ status: "SAFE", path: "*.log", type: "log_leak" });

        // 4. SCAN: SENSITIVE FILES & PYTHON SCRIPTS
        const sensitivePaths = ['/phpinfo.php', '/wp-config.php.bak', '/backup.py', '/config.py'];
        let sensitiveLeaked = false;
        for (let path of sensitivePaths) {
            const checkSens = await checkEndpoint(path, "sensitive_leak", "SENSITIVE FILE TEREKSPOS");
            if (checkSens.status === "CRITICAL") { results.push(checkSens); sensitiveLeaked = true; break; }
        }
        if (!sensitiveLeaked) results.push({ status: "SAFE", path: "Sensitive Files", type: "sensitive_leak" });

        // 5. SCAN: SOURCE CODE ARCHIVES (.ZIP)
        const archivePaths = ['/backup.zip', '/site.zip', '/master.zip', '/public_html.zip'];
        let archiveLeaked = false;
        for (let path of archivePaths) {
            const checkArc = await checkEndpoint(path, "archive_leak", "ARCHIVE TEREKSPOS");
            if (checkArc.status === "CRITICAL") { results.push(checkArc); archiveLeaked = true; break; }
        }
        if (!archiveLeaked) results.push({ status: "SAFE", path: "*.zip", type: "archive_leak" });

        // 6. SCAN: DEPENDENCY BLUEPRINT (Composer/NPM)
        const depPaths = ['/composer.json', '/package.json'];
        let depLeaked = false;
        for (let path of depPaths) {
            const checkDep = await checkEndpoint(path, "dependency_leak", "DEPENDENCY TEREKSPOS");
            if (checkDep.status === "CRITICAL") { results.push(checkDep); depLeaked = true; break; }
        }
        if (!depLeaked) results.push({ status: "SAFE", path: "*.json", type: "dependency_leak" });

        // 7. SCAN: DEV PANELS & GATEWAYS
        const panelPaths = ['/phpmyadmin', '/swagger-ui.html', '/api/docs'];
        let panelLeaked = false;
        for (let path of panelPaths) {
            const checkPanel = await checkEndpoint(path, "panel_leak", "DEV PANEL TEREKSPOS");
            if (checkPanel.status === "CRITICAL") { results.push(checkPanel); panelLeaked = true; break; }
        }
        if (!panelLeaked) results.push({ status: "SAFE", path: "Dev/Admin Panels", type: "panel_leak" });

        // 8. SCAN: TARGETED OPEN DIRECTORY BRUTEFORCE
        const openDirs = ['/uploads/', '/backup/', '/assets/', '/storage/logs/'];
        let dirLeaked = false;
        for (let path of openDirs) {
            const checkDir = await checkEndpoint(path, "dir_listing", "OPEN DIRECTORY EXPOSED");
            if (checkDir.status === "CRITICAL") { results.push(checkDir); dirLeaked = true; break; }
        }
        if (!dirLeaked) results.push({ status: "SAFE", path: "Targeted Directories", type: "dir_listing" });

        // 9. SCAN: WORDPRESS USER ENUMERATION (JSON API)
        try {
            const wpUrl = baseUrl + '/wp-json/wp/v2/users';
            const wpRes = await fetch(wpUrl, { method: 'GET' });
            if (wpRes.ok) {
                const wpText = await wpRes.text();
                if (wpText.includes("slug") && wpText.includes("avatar_urls")) {
                    results.push({ status: "CRITICAL", path: "/wp-json/wp/v2/users", fullUrl: wpUrl, type: "wp_enum", label: "WP USER LEAK", preview: wpText.substring(0, 800), proofData: wpText });
                } else {
                    results.push({ status: "SAFE", path: "/wp-json/...", fullUrl: wpUrl, type: "wp_enum" });
                }
            } else { results.push({ status: "SAFE", path: "/wp-json/...", fullUrl: wpUrl, type: "wp_enum" }); }
        } catch(e) { results.push({ status: "SAFE", path: "/wp-json/...", type: "wp_enum" }); }

        // 10. SCAN: GRAPHQL INTROSPECTION VULNERABILITY
        try {
            const gqlUrl = baseUrl + '/graphql';
            const gqlRes = await fetch(gqlUrl, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: "{ __schema { types { name } } }" })
            });
            if (gqlRes.ok) {
                const gqlText = await gqlRes.text();
                if (gqlText.includes("__schema") && gqlText.includes("types")) {
                    results.push({ status: "CRITICAL", path: "/graphql", fullUrl: gqlUrl, type: "graphql_leak", label: "GRAPHQL SCHEMA EXPOSED", preview: gqlText.substring(0, 800), proofData: gqlText });
                } else {
                    results.push({ status: "SAFE", path: "/graphql", fullUrl: gqlUrl, type: "graphql_leak" });
                }
            } else { results.push({ status: "SAFE", path: "/graphql", fullUrl: gqlUrl, type: "graphql_leak" }); }
        } catch(e) { results.push({ status: "SAFE", path: "/graphql", type: "graphql_leak" }); }

        // 11. SCAN: DOM SECRET HUNTER (REGEX X-RAY)
        try {
            const domContent = document.documentElement.innerHTML;
            const keysFound = [];

            const awsMatch = domContent.match(/AKIA[0-9A-Z]{16}/g);
            if (awsMatch) keysFound.push(`[AWS Access Key] ${awsMatch[0]}`);

            const gmapsMatch = domContent.match(/AIza[0-9A-Za-z-_]{35}/g);
            if (gmapsMatch) keysFound.push(`[Google Maps API] ${gmapsMatch[0]}`);

            const stripeMatch = domContent.match(/pk_live_[0-9a-zA-Z]{24}/g);
            if (stripeMatch) keysFound.push(`[Stripe Live Key] ${stripeMatch[0]}`);

            if (keysFound.length > 0) {
                const leakData = keysFound.join('\n');
                results.push({ status: "CRITICAL", path: "DOM/Source Code", fullUrl: baseUrl, type: "api_key_leak", label: "API KEYS EXPOSED", preview: leakData, proofData: leakData });
            } else {
                results.push({ status: "SAFE", path: "DOM Source Code", fullUrl: baseUrl, type: "api_key_leak" });
            }
        } catch(e) {
            results.push({ status: "ERROR", type: "api_key_leak", path: "DOM Regex Scan" });
        }

        // 12. SCAN: AWS S3 / CLOUD BUCKET EXPOSURE
        try {
            const bucketRes = await fetch(baseUrl + '/', { method: 'GET' });
            if (bucketRes.ok) {
                const bucketText = await bucketRes.text();
                if (bucketText.includes("<?xml") && bucketText.includes("<ListBucketResult") && bucketText.includes("<Contents>")) {
                    results.push({ status: "CRITICAL", path: "Root Domain", fullUrl: baseUrl, type: "bucket_leak", label: "CLOUD BUCKET EXPOSED", preview: bucketText.substring(0, 800), proofData: bucketText });
                } else {
                    results.push({ status: "SAFE", path: "Cloud Bucket", fullUrl: baseUrl, type: "bucket_leak" });
                }
            } else { results.push({ status: "SAFE", path: "Cloud Bucket", type: "bucket_leak" }); }
        } catch(e) { results.push({ status: "SAFE", path: "Cloud Bucket", type: "bucket_leak" }); }

        // 13. SCAN: FIREBASE REALTIME DB HIJACKING
        try {
            const domContent = document.documentElement.innerHTML;
            const fbMatch = domContent.match(/authDomain['"]?\s*:\s*['"]([^'"]+)\.firebaseapp\.com/);
            if (fbMatch && fbMatch[1]) {
                const projectId = fbMatch[1];
                const fbUrl = `https://${projectId}.firebaseio.com/.json`;
                const fbRes = await fetch(fbUrl, { method: 'GET' });
                const fbText = await fbRes.text();
                if (fbRes.ok && !fbText.includes("Permission denied")) {
                    results.push({ status: "CRITICAL", path: `Firebase DB [${projectId}]`, fullUrl: fbUrl, type: "firebase_leak", label: "FIREBASE DB EXPOSED", preview: fbText.substring(0, 800), proofData: fbText });
                } else {
                    results.push({ status: "SAFE", path: "Firebase Config", fullUrl: fbUrl, type: "firebase_leak" });
                }
            } else {
                results.push({ status: "SAFE", path: "Firebase Config", type: "firebase_leak" });
            }
        } catch(e) { results.push({ status: "SAFE", path: "Firebase Config", type: "firebase_leak" }); }

        // 14. SCAN: WHOIS & DOMAIN INTELLIGENCE (RDAP OSINT)
        try {
            const hostname = window.location.hostname;
            const whoisApi = `https://networkcalc.com/api/dns/whois/${hostname}`;
            const whoisRes = await fetch(whoisApi, { method: 'GET' });

            if (whoisRes.ok) {
                const wData = await whoisRes.json();
                if (wData.status === "OK" && wData.whois) {
                    const registrar = wData.whois.registrar || "Tersembunyi";
                    const creation = wData.whois.creation_date || "Tidak Ditemukan";
                    const email = (wData.whois.contacts && wData.whois.contacts.registrant && wData.whois.contacts.registrant.email) ? wData.whois.contacts.registrant.email : "Dilindungi Privasi";
                    const reportWhois = `[OSINT WHOIS REPORT]\nDomain: ${hostname}\nRegistrar: ${registrar}\nDibuat: ${creation}\nEmail Registrant: ${email}`;
                    results.push({ status: "WARNING", path: "WHOIS OSINT Data", fullUrl: whoisApi, type: "osint_whois", label: "DOMAIN INFO", preview: reportWhois, proofData: JSON.stringify(wData.whois, null, 2) });
                } else { results.push({ status: "SAFE", path: "WHOIS OSINT", type: "osint_whois" }); }
            }
        } catch(e) { results.push({ status: "SAFE", path: "WHOIS OSINT", type: "osint_whois" }); }

        // 15. SCAN: EMAIL SPOOFING VULNERABILITY (DNS TXT SPF RECORD)
        try {
            const hostname = window.location.hostname;
            const dnsUrl = `https://dns.google/resolve?name=${hostname}&type=TXT`;
            const dnsRes = await fetch(dnsUrl, { method: 'GET' });
            if (dnsRes.ok) {
                const dnsData = await dnsRes.json();
                let hasSPF = false;
                let spfRecord = "";
                if (dnsData.Answer) {
                    dnsData.Answer.forEach(ans => {
                        if (ans.data.includes("v=spf1")) { hasSPF = true; spfRecord = ans.data; }
                    });
                }
                if (!hasSPF) {
                    results.push({ status: "CRITICAL", path: "DNS TXT Records", fullUrl: dnsUrl, type: "email_spoof", label: "EMAIL SPOOFING", preview: "FATAL: Tidak ditemukan data SPF (Sender Policy Framework) pada DNS.\n\nHacker dapat memalsukan (spoofing) nama domain Anda untuk mengirimkan email Phishing berkedok perusahaan Anda tanpa masuk folder Spam.", proofData: "Status: Vulnerable to Spoofing. Missing v=spf1." });
                } else {
                    results.push({ status: "SAFE", path: "DNS TXT Records", type: "email_spoof", error: `Aman. Ditemukan proteksi: ${spfRecord}` });
                }
            } else { results.push({ status: "SAFE", path: "DNS TXT Records", type: "email_spoof" }); }
        } catch(e) { results.push({ status: "SAFE", path: "DNS TXT Records", type: "email_spoof" }); }

        // 16. SCAN: HIDDEN ROBOTS.TXT LEAKAGE
        try {
            const robUrl = baseUrl + '/robots.txt';
            const robRes = await fetch(robUrl, { method: 'GET' });
            if (robRes.ok) {
                const robText = await robRes.text();
                if (robText.includes("Disallow:")) {
                    results.push({ status: "WARNING", path: "/robots.txt", fullUrl: robUrl, type: "robots_leak", label: "HIDDEN PATHS", preview: robText.substring(0, 800), proofData: robText });
                } else { results.push({ status: "SAFE", path: "/robots.txt", type: "robots_leak" }); }
            } else { results.push({ status: "SAFE", path: "/robots.txt", type: "robots_leak" }); }
        } catch(e) { results.push({ status: "SAFE", path: "/robots.txt", type: "robots_leak" }); }

        // 17. SCAN: TECH-STACK FINGERPRINTING
        try {
            const domContent = document.documentElement.innerHTML;
            let stack = [];
            const metaGen = document.querySelector('meta[name="generator"]');
            if(metaGen) stack.push(`[System Generator] ${metaGen.content}`);
            if(window.__REACT_DEVTOOLS_GLOBAL_HOOK__) stack.push("[Frontend] React.js Detected");
            if(window.__VUE__) stack.push("[Frontend] Vue.js Detected");
            if(domContent.includes('wp-content/themes') || domContent.includes('wp-includes')) stack.push("[CMS] WordPress Architecture Detected");
            if(domContent.includes('Laravel_session')) stack.push("[Backend] Laravel Framework Detected");

            if (stack.length > 0) {
                const stackData = stack.join('\n');
                results.push({ status: "WARNING", path: "Meta / Window Objects", fullUrl: baseUrl, type: "tech_stack", label: "TECH STACK REVEALED", preview: stackData, proofData: stackData });
            } else {
                results.push({ status: "SAFE", path: "Tech Stack Blueprint", type: "tech_stack" });
            }
        } catch(e) { results.push({ status: "SAFE", path: "Tech Stack Blueprint", type: "tech_stack" }); }

        // 18. SCAN: SOURCE MAP LEAKAGE (.js.map)
        try {
            const scripts = document.querySelectorAll('script[src]');
            let mapLeaked = false;
            for (let script of scripts) {
                const src = script.src;
                if (src.startsWith(baseUrl) && src.endsWith('.js')) {
                    const mapUrl = src + '.map';
                    const mapRes = await fetch(mapUrl, { method: 'HEAD' });
                    if (mapRes.ok) {
                        const verifyRes = await fetch(mapUrl, { method: 'GET', headers: { 'Range': 'bytes=0-1000' } });
                        const verifyText = await verifyRes.text();
                        if (verifyText.includes('"sources"') || verifyText.includes('"mappings"')) {
                            results.push({ status: "CRITICAL", path: mapUrl.replace(baseUrl, ''), fullUrl: mapUrl, type: "sourcemap_leak", label: "SOURCE CODE LEAK", preview: verifyText.substring(0, 800) + "\n\n... [FILE MAP DITEMUKAN - SOURCE CODE FRONTEND BISA DI-REVERSE ENGINEER]", proofData: verifyText });
                            mapLeaked = true; break;
                        }
                    }
                }
            }
            if (!mapLeaked) results.push({ status: "SAFE", path: "*.js.map", type: "sourcemap_leak" });
        } catch(e) { results.push({ status: "SAFE", path: "*.js.map", type: "sourcemap_leak" }); }

        // 19. SCAN: DEVOPS & CONTAINER BLUEPRINT
        const devopsPaths = ['/docker-compose.yml', '/Dockerfile', '/.gitlab-ci.yml', '/Jenkinsfile'];
        let devopsLeaked = false;
        for (let path of devopsPaths) {
            const checkDevops = await checkEndpoint(path, "devops_leak", "DEVOPS CONFIG EXPOSED");
            if (checkDevops.status === "CRITICAL") { results.push(checkDevops); devopsLeaked = true; break; }
        }
        if (!devopsLeaked) results.push({ status: "SAFE", path: "Docker/CI-CD Configs", type: "devops_leak" });

        // 20. SCAN: RAW OPENAPI / SWAGGER DEFINITION (JSON)
        const apiPaths = ['/swagger.json', '/openapi.json', '/api/v1/swagger.json', '/api-docs', '/v3/api-docs'];
        let apiLeaked = false;
        for (let path of apiPaths) {
            const checkApi = await checkEndpoint(path, "openapi_leak", "RAW API SCHEMA EXPOSED");
            if (checkApi.status === "CRITICAL" && checkApi.proofData && (checkApi.proofData.includes('"swagger"') || checkApi.proofData.includes('"openapi"'))) {
                results.push(checkApi); apiLeaked = true; break;
            }
        }
        if (!apiLeaked) results.push({ status: "SAFE", path: "Raw API Schemas", type: "openapi_leak" });

        // ==============================================================
        // [FITUR BARU] DEVSECOPS & ARCHITECTURE NIGHTMARE PACK
        // ==============================================================

        // 21. [BARU] SCAN: LARAVEL DEBUGGERS (Ignition & Telescope)
        const laravelPaths = ['/_ignition/health-check', '/telescope', '/horizon'];
        let laravelLeaked = false;
        for (let path of laravelPaths) {
            const checkLar = await checkEndpoint(path, "laravel_debug", "LARAVEL DEBUG EXPOSED");
            if (checkLar.status === "CRITICAL") { results.push(checkLar); laravelLeaked = true; break; }
        }
        if (!laravelLeaked) results.push({ status: "SAFE", path: "Laravel Horizon/Ignition", type: "laravel_debug" });

        // 22. [BARU] SCAN: SPRING BOOT ACTUATOR LEAK
        const springPaths = ['/actuator', '/actuator/env', '/actuator/health'];
        let springLeaked = false;
        for (let path of springPaths) {
            const checkSpring = await checkEndpoint(path, "spring_actuator", "SPRING ACTUATOR EXPOSED");
            if (checkSpring.status === "CRITICAL") { results.push(checkSpring); springLeaked = true; break; }
        }
        if (!springLeaked) results.push({ status: "SAFE", path: "Spring Boot Actuator", type: "spring_actuator" });

        // 23. [BARU] SCAN: PROMETHEUS METRICS EXPOSURE
        const promPaths = ['/metrics'];
        let promLeaked = false;
        for (let path of promPaths) {
            const checkProm = await checkEndpoint(path, "prometheus_metrics", "METRICS EXPOSED");
            if (checkProm.status === "CRITICAL") { results.push(checkProm); promLeaked = true; break; }
        }
        if (!promLeaked) results.push({ status: "SAFE", path: "/metrics", type: "prometheus_metrics" });

        // 24. [BARU] SCAN: SQLITE DATABASE DROP
        const sqlitePaths = ['/database.sqlite', '/db.sqlite3', '/database.db'];
        let sqliteLeaked = false;
        for (let path of sqlitePaths) {
            const checkSqlite = await checkEndpoint(path, "sqlite_leak", "SQLITE DB EXPOSED");
            if (checkSqlite.status === "CRITICAL") { results.push(checkSqlite); sqliteLeaked = true; break; }
        }
        if (!sqliteLeaked) results.push({ status: "SAFE", path: "*.sqlite / *.db", type: "sqlite_leak" });

        // 25. [BARU] SCAN: CORS MISCONFIGURATION SNIPER
        try {
            const corsRes = await fetch(baseUrl + '/', {
                method: 'GET',
                headers: { 'Origin': 'https://evil-hacker.com' } // Menyamar jadi web jahat
            });
            const acao = corsRes.headers.get('Access-Control-Allow-Origin');
            const acac = corsRes.headers.get('Access-Control-Allow-Credentials');

            if (acao === 'https://evil-hacker.com' || (acao === '*' && acac === 'true')) {
                const corsProof = `Access-Control-Allow-Origin: ${acao}\nAccess-Control-Allow-Credentials: ${acac}\n\nServer Anda menerima request dari domain acak. Data sensitif user bisa dicuri lewat Cross-Origin (CORS Bypass).`;
                results.push({ status: "CRITICAL", path: "CORS Header Policy", fullUrl: baseUrl, type: "cors_misconfig", label: "CORS MISCONFIG", preview: corsProof, proofData: corsProof });
            } else {
                results.push({ status: "SAFE", path: "CORS Policy Header", type: "cors_misconfig" });
            }
        } catch(e) {
            results.push({ status: "SAFE", path: "CORS Policy Header", type: "cors_misconfig" });
        }

        // 26. SCAN: WAF (WEB APPLICATION FIREWALL) PROFILING
        try {
            const wafUrl = baseUrl + '/?flowork_audit=%3Cscript%3Ealert(1)%3C%2Fscript%3E';
            const wafRes = await fetch(wafUrl, { method: 'GET' });
            const headers = wafRes.headers;

            let wafDetected = null;
            const serverHeader = (headers.get('server') || '').toLowerCase();

            if (serverHeader.includes('cloudflare')) wafDetected = 'Cloudflare';
            else if (serverHeader.includes('akamai')) wafDetected = 'Akamai';
            else if (headers.get('x-sucuri-id')) wafDetected = 'Sucuri WAF';
            else if (headers.get('x-amz-cf-id')) wafDetected = 'AWS CloudFront/WAF';
            else if (wafRes.status === 403 || wafRes.status === 406) wafDetected = 'Generic WAF / ModSecurity';

            if (wafDetected) {
                results.push({ status: "SAFE", path: "Firewall Profile", fullUrl: baseUrl, type: "waf_detected", error: `Terlindungi oleh: ${wafDetected}` });
            } else {
                results.push({ status: "WARNING", path: "Firewall Profile", fullUrl: baseUrl, type: "waf_detected", error: "Tidak ada WAF (Web Application Firewall) terdeteksi. Rentan terhadap serangan." });
            }
        } catch(e) {
            results.push({ status: "WARNING", path: "Firewall Profile", type: "waf_detected" });
        }

        // 27. SCAN: SECURITY HEADERS (Selalu di urutan terakhir)
        try {
            const headRes = await fetch(baseUrl, { method: 'HEAD' });
            const headers = headRes.headers;
            results.push({ status: headers.get('Strict-Transport-Security') ? "SAFE" : "WARNING", type: "header_hsts", path: "Strict-Transport-Security" });
            results.push({ status: headers.get('X-Frame-Options') ? "SAFE" : "WARNING", type: "header_xframe", path: "X-Frame-Options" });
            results.push({ status: headers.get('Content-Security-Policy') ? "SAFE" : "WARNING", type: "header_csp", path: "Content-Security-Policy" });
        } catch (e) {
            results.push({ status: "ERROR", type: "header_check", path: "Headers" });
        }

        return results;
    } catch (e) {
        return [{ status: "ERROR", type: "system_error", path: "Core Engine", error: e.message }];
    }
})();