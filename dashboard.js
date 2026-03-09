//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : teetah2402/fbe/FBE-d6903ee1cad72b5686744b0f584f87bbdbf03816/dashboard.js
//#######################################################################

// =========================================================
// [KODE BARU] DEV MODE SWITCHER
// Ubah ke "true" untuk Localhost, "false" untuk Production (Cloudflare)
// =========================================================
const IS_DEV_MODE = true;
const BASE_URL = IS_DEV_MODE ? "http://localhost:5173" : "https://floworkos.com";

// =========================================================
// Kamus (Dictionary) Ekstensi Zero Hardcode
// =========================================================
const hubDictionary = {
    id: {
        navLib: "Pustaka", navCat: "Kategori", navSys: "Sistem",
        navAll: "📦 Semua Aplikasi", navActive: "🌟 Modul Aktif",
        navSeo: "🔎 SEO & Audit", navDev: "💻 Developer Tools", navUtils: "🛠️ Utilitas", navSocial: "💬 Sosial & Media",
        navAbout: "ℹ️ Tentang Kami",
        btnThemeDark: "🌙 Mode Gelap", btnThemeLight: "☀️ Mode Terang",
        btnLang: "🇮🇩 Bahasa: ID", search: "Cari aplikasi...",
        btnClearCache: "🗑️ Bersihkan Cache",
        btnAutoBootOn: "🚀 Auto-Boot: NYALA",
        btnAutoBootOff: "🚀 Auto-Boot: MATI",
        aboutTitle: "🚀 Jembatan Flowork OS",
        aboutManifesto: "Mengenal Flowork: Website Kompleks dengan Privasi Tingkat Tinggi",
        aboutP1: "Flowork adalah sebuah platform digital mutakhir dan website yang sangat kompleks, dirancang khusus untuk memenuhi kebutuhan produktivitas para kreator, developer, dan profesional di era modern. Dalam ekosistem digital yang semakin rentan terhadap pencurian data dan pelanggaran privasi, Flowork hadir sebagai oase yang mengutamakan keamanan dan kerahasiaan penggunanya di atas segalanya. Kami memastikan bahwa setiap baris kode dan dokumen Anda tetap menjadi milik Anda sepenuhnya, tanpa campur tangan algoritma pelacakan.",
        aboutP2: "Salah satu keunggulan utama yang menjadikan Flowork berbeda adalah kemampuan pengguna untuk menggunakan engine mereka sendiri. Dengan fitur custom engine ini, pengguna diberi kebebasan absolut untuk menghubungkan server lokal atau cloud pribadi mereka ke dalam antarmuka Flowork. Ini memberikan jaminan ekstra bahwa pemrosesan data sensitif dilakukan di dalam lingkungan komputasi yang mereka kendalikan sendiri 100 persen.",
        aboutP3: "Untuk merealisasikan koneksi yang aman, kami memanfaatkan teknologi koneksi canggih menggunakan token tunnel. Token tunnel ini bertindak sebagai jembatan kriptografi yang kuat dan dinamis, menciptakan jalur komunikasi terenkripsi yang mencegah serangan man-in-the-middle dan sniffing data. Setiap paket data dienkripsi dengan standar industri tertinggi, memastikan zero-latency tanpa mengorbankan keamanan sistem.",
        aboutP4: "Flowork tidak hanya dapat diakses melalui browser desktop konvensional, tetapi juga sepenuhnya mendukung akses menggunakan APK. Sinkronisasi real-time antara versi desktop dan versi APK berjalan dengan sangat mulus berkat arsitektur cloud-native. Anda dapat melanjutkan proyek desain yang kompleks melalui smartphone Anda saat sedang dalam perjalanan dengan tingkat privasi yang sama ketatnya.",
        aboutP5: "Kehadiran mode terang (Light Mode) dan mode gelap (Hacker Mode) di Flowork dirancang untuk kenyamanan ergonomis jangka panjang. Kombinasi antara privasi maksimal, dukungan custom engine, token tunnel yang aman, serta aksesibilitas silang platform, mengukuhkan posisi Flowork sebagai website kompleks masa depan yang tak tertandingi di kelasnya.",
        footerRight: "© 2026 Flowork Neural Division. Hak Cipta Dilindungi.",
        btnLaunch: "🚀 Launch", btnLicense: "⚙️ Lisensi",
        updateTitle: "Pembaruan Wajib",
        updateMsg1: "Versi Ekstensi Flowork OS Bridge Anda sudah usang. Mohon diperbarui untuk melanjutkan.",
        btnUpdate: "UNDUH PEMBARUAN",
        btnSettings: "⚙️ Seting",
        settingsTitle: "Seting Fake Name",
        settingsDesc: "Masukkan daftar Gmail Anda (satu per baris) untuk fitur otomatis Gmail Dot Trick."
    },
    en: {
        navLib: "Library", navCat: "Categories", navSys: "System",
        navAll: "📦 All Applications", navActive: "🌟 Active Modules",
        navSeo: "🔎 SEO & Audit", navDev: "💻 Developer Tools", navUtils: "🛠️ Utilities", navSocial: "💬 Social & Media",
        navAbout: "ℹ️ About Us",
        btnThemeDark: "🌙 Dark Mode", btnThemeLight: "☀️ Light Mode",
        btnLang: "🇺🇸 Language: EN", search: "Search apps...",
        btnClearCache: "🗑️ Clear Cache",
        btnAutoBootOn: "🚀 Auto-Boot: ON",
        btnAutoBootOff: "🚀 Auto-Boot: OFF",
        aboutTitle: "🚀 Flowork OS Bridge",
        aboutManifesto: "Discover Flowork: A Complex Website with Uncompromised Privacy",
        aboutP1: "Flowork is a cutting-edge digital platform and an inherently complex website specifically engineered to meet the robust productivity demands of modern creators and developers. In a digital ecosystem vulnerable to data breaches, Flowork emerges as a secure sanctuary that places user privacy above all else. We ensure every line of code and document remains exclusively yours, completely insulated from third-party tracking.",
        aboutP2: "One of the paramount features that distinguishes Flowork is the unprecedented ability for users to leverage their own custom computing engines. Users are granted the absolute freedom to bridge their local servers or private cloud instances directly into the Flowork interface. This guarantees that the processing of highly sensitive data occurs entirely within a computing environment over which they maintain 100 percent sovereign control.",
        aboutP3: "To securely facilitate this direct connection, we utilize advanced connection methodologies powered by tunnel tokens. These act as a dynamic cryptographic bridge, establishing a heavily encrypted communication pathway to thwart man-in-the-middle attacks and packet sniffing. Every packet is encrypted, miraculously maintaining ultra-low zero-latency performance without sacrificing data security.",
        aboutP4: "Flowork fully supports comprehensive mobile accessibility via our dedicated APK. Real-time, bidirectional synchronization between the desktop environment and the APK version operates flawlessly, driven by robust cloud-native architecture. You can effortlessly continue your complex project via your smartphone while commuting, benefiting from the exact same stringent security measures.",
        aboutP5: "The meticulously crafted implementation of Light Mode and Hacker Mode is designed for prolonged ergonomic comfort. The powerful amalgamation of uncompromising privacy, custom engine support, secure tunnel tokens, and unparalleled cross-platform accessibility firmly establishes Flowork as the undisputed future of complex digital workspaces.",
        footerRight: "© 2026 Flowork Neural Division. All Rights Reserved.",
        btnLaunch: "🚀 Launch", btnLicense: "⚙️ License",
        updateTitle: "Update Required",
        updateMsg1: "Your Flowork OS Bridge Extension version is outdated. Please update to continue.",
        btnUpdate: "DOWNLOAD UPDATE",
        btnSettings: "⚙️ Settings",
        settingsTitle: "Fake Name Settings",
        settingsDesc: "Enter your Gmail list (one per line) for the automatic Gmail Dot Trick feature."
    }
};

let currentLang = 'en';
let currentTheme = 'dark';
let autoBootDashboard = true;
let appsRegistry = [];
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;
let currentSettingsAppId = '';

function isVersionLower(installedVer, requiredVer) {
    if (!installedVer || !requiredVer) return false;
    const p1 = installedVer.split('.').map(Number);
    const p2 = requiredVer.split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const n1 = p1[i] || 0;
        const n2 = p2[i] || 0;
        if (n1 < n2) return true;
        if (n1 > n2) return false;
    }
    return false;
}

function checkExtensionUpdate(registryMeta) {
    if (registryMeta && registryMeta.extension_ver) {
        const requiredVer = registryMeta.extension_ver;
        const installedVer = chrome.runtime.getManifest().version;

        if (isVersionLower(installedVer, requiredVer)) {
            document.getElementById('current-ext-ver').innerText = installedVer;
            document.getElementById('required-ext-ver').innerText = requiredVer;
            document.getElementById('update-modal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
}

function applyLocalization() {
    const t = hubDictionary[currentLang];
    if(!t) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(t[key]) el.innerHTML = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if(t[key]) el.placeholder = t[key];
    });

    const btnTheme = document.getElementById('btn-theme');
    if (btnTheme) {
        btnTheme.innerHTML = currentTheme === 'light' ? t.btnThemeDark : t.btnThemeLight;
    }

    const btnAutoBoot = document.getElementById('btn-autoboot');
    if (btnAutoBoot) {
        btnAutoBoot.innerHTML = autoBootDashboard ? t.btnAutoBootOn : t.btnAutoBootOff;
    }
}

function applyThemeSystem() {
    const t = hubDictionary[currentLang];
    const btnTheme = document.getElementById('btn-theme');
    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if(btnTheme && t) btnTheme.innerHTML = t.btnThemeDark;
    } else {
        document.documentElement.removeAttribute('data-theme');
        if(btnTheme && t) btnTheme.innerHTML = t.btnThemeLight;
    }
}

async function initRegistry() {
    return new Promise((resolve) => {
        if (window.chrome && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['flowork_registry_cache', 'flowork_registry_version', 'flowork_registry_timestamp'], async (result) => {
                let cachedData = result.flowork_registry_cache;
                let cachedVersion = result.flowork_registry_version;
                let cachedTimestamp = result.flowork_registry_timestamp || 0;

                // Jika di mode DEV, abaikan cache biar data selalu fresh
                let isExpired = IS_DEV_MODE || (Date.now() - cachedTimestamp) > CACHE_DURATION_MS;

                if (cachedData && !isExpired) {
                    checkExtensionUpdate(cachedData.meta);
                    parseRegistryData(cachedData);
                    resolve();
                    fetchAndCheckUpdate(cachedVersion, false, false);
                } else {
                    await fetchAndCheckUpdate(null, true, true);
                    resolve();
                }
            });
        } else {
            fetchAndCheckUpdate(null, true, true).then(resolve);
        }
    });
}

async function fetchAndCheckUpdate(currentVersion, isInitial, forceUpdate = false) {
    try {
        // [KODE LAMA TIDAK TERPAKAI] const response = await fetch('https://floworkos.com/store/registry.json');
        // [KODE BARU] Fetch menggunakan BASE_URL (Localhost / Production)
        const response = await fetch(`${BASE_URL}/store/registry.json?t=${Date.now()}`);
        const data = await response.json();

        if (data && data.meta && (data.meta.version !== currentVersion || forceUpdate || IS_DEV_MODE)) {
            checkExtensionUpdate(data.meta);

            if (window.chrome && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({
                    'flowork_registry_cache': data,
                    'flowork_registry_version': data.meta.version,
                    'flowork_registry_timestamp': Date.now()
                });
            }

            parseRegistryData(data);

            if (!isInitial) {
                loadStateFromStorage();
            }
        }
    } catch (error) {
        console.error('Gagal mengambil registry.json:', error);
    }
}

function parseRegistryData(data) {
    appsRegistry = [];
    if (data && data.apps) {
        data.apps.forEach(app => {
            if (app.desktop === 'yes') {
                appsRegistry.push({
                    id: app.id,
                    name: app.name,
                    desc: app.description,
                    // [KODE LAMA TIDAK TERPAKAI] icon: `<img src="https://floworkos.com${app.icon}" ...>`
                    // [KODE BARU] Render Icon path sesuai environment
                    icon: `<img src="${BASE_URL}${app.icon}" style="width:100%; height:100%; border-radius:12px; object-fit: cover;" alt="${app.name}">`,
                    category: app.category || 'utils',
                    active: app.buton === 'enable',
                    isExtensi: app.ext === 'yes',
                    tier: app.tier ? app.tier.toLowerCase().trim() : 'free'
                });
            }
        });
    }
}

const grid = document.getElementById('app-grid');
const searchInput = document.getElementById('search-input');
const counter = document.getElementById('active-counter');
let currentFilter = 'all';

function renderDynamicCategories() {
    const catContainer = document.getElementById('dynamic-categories');
    if (!catContainer) return;
    catContainer.innerHTML = '';

    const uniqueCats = [...new Set(appsRegistry.map(a => a.category))];

    const categoryMap = {
        seo: { icon: '🔎', label: 'SEO & Audit', idLang: 'navSeo' },
        dev: { icon: '💻', label: 'Developer Tools', idLang: 'navDev' },
        utils: { icon: '🛠️', label: 'Utilities', idLang: 'navUtils' },
        social: { icon: '💬', label: 'Social & Media', idLang: 'navSocial' },
        utility: { icon: '🛠️', label: 'Utility', idLang: '' },
        security: { icon: '🛡️', label: 'Security', idLang: '' },
        marketing: { icon: '📈', label: 'Marketing', idLang: '' },
        design: { icon: '🎨', label: 'Design', idLang: '' },
        productivity: { icon: '⚡', label: 'Productivity', idLang: '' },
        developer: { icon: '💻', label: 'Developer', idLang: '' }
    };

    uniqueCats.forEach(cat => {
        const info = categoryMap[cat] || { icon: '📁', label: cat.toUpperCase(), idLang: '' };
        const div = document.createElement('div');
        div.className = 'nav-item';
        div.setAttribute('data-category', cat);
        div.innerHTML = `<span ${info.idLang ? `data-i18n="${info.idLang}"` : ''}>${info.icon} ${info.label}</span>`;

        div.addEventListener('click', function(e) {
            filterCategory(cat, this);
        });

        catContainer.appendChild(div);
    });

    applyLocalization();
}

async function loadStateFromStorage() {
    renderDynamicCategories();

    if (window.chrome && chrome.storage && chrome.storage.local) {
        const appKeys = appsRegistry.map(app => `flowork_app_state_${app.id}`);
        const allKeys = [...appKeys, 'flowork_lang', 'flowork_os_theme', 'flowork_autoboot_dashboard'];

        chrome.storage.local.get(allKeys, (result) => {
            if (result['flowork_lang']) currentLang = result['flowork_lang'];
            if (result['flowork_os_theme']) currentTheme = result['flowork_os_theme'];

            if (result['flowork_autoboot_dashboard'] !== undefined) {
                autoBootDashboard = result['flowork_autoboot_dashboard'];
            }

            applyThemeSystem();
            applyLocalization();

            appsRegistry.forEach(app => {
                const storedState = result[`flowork_app_state_${app.id}`];
                if (storedState !== undefined) {
                    app.active = storedState;
                }
            });
            renderApps();
        });
    } else {
        renderApps();
    }
}

function renderApps(searchTerm = '') {
    grid.innerHTML = '';
    let activeCount = 0;
    const t = hubDictionary[currentLang] || hubDictionary['en'];

    const filteredApps = appsRegistry.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              app.desc.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesCategory = true;
        if (currentFilter === 'active') matchesCategory = app.active;
        else if (currentFilter !== 'all') matchesCategory = app.category === currentFilter;

        if (app.active) activeCount++;
        return matchesSearch && matchesCategory;
    });

    filteredApps.sort((a, b) => {
        return (a.isExtensi === b.isExtensi) ? 0 : a.isExtensi ? -1 : 1;
    });

    filteredApps.forEach(app => {
        const card = document.createElement('div');
        card.className = `app-card ${app.isExtensi ? 'highlight-native' : 'dimmed-app'}`;

        let urlSlug = app.id.replace(/_/g, '-');

        // [KODE LAMA TIDAK TERPAKAI] let targetUrl = `https://floworkos.com/flow/${urlSlug}#openapp`;
        // [KODE BARU] Target peluncuran aplikasi dinamis
        let targetUrl = `${BASE_URL}/flow/${urlSlug}#openapp`;

        const licenseBtnHtml = app.tier !== 'free' ? `<button class="btn-settings btn-open-license" data-appname="${app.name}" title="App Info">${t.btnLicense}</button>` : '';
        const settingsBtnHtml = app.id === 'fake-name-generator' ? `<button class="btn-settings btn-open-settings" data-appid="${app.id}" title="App Settings">${t.btnSettings}</button>` : '';

        const actionHtml = `
            <div style="display: flex; gap: 8px;">
                ${settingsBtnHtml}
                ${licenseBtnHtml}
                <a href="${targetUrl}" target="_blank" class="btn-launch" title="Open Workspace">${t.btnLaunch}</a>
            </div>
        `;

        const badgeHtml = app.isExtensi ? `<span style="font-size: 9px; background: rgba(61, 220, 132, 0.2); color: var(--brand-green); padding: 2px 6px; border-radius: 4px; vertical-align: middle; margin-left: 6px; font-weight: 800; letter-spacing: 0.5px;">NATIVE</span>` : '';

        card.innerHTML = `
            <div class="card-header">
                <div class="app-icon">${app.icon}</div>
                <label class="toggle-switch">
                    <input type="checkbox" class="app-toggle" data-id="${app.id}" id="toggle-${app.id}" ${app.active ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
            <div>
                <div class="app-title">${app.name}${badgeHtml}</div>
                <div class="app-desc">${app.desc}</div>
            </div>
            <div class="card-footer">
                <span class="category-tag">${app.category}</span>
                ${actionHtml}
            </div>
        `;
        grid.appendChild(card);
    });

    counter.innerText = `${activeCount} / ${appsRegistry.length} Apps Active`;
}

function toggleApp(id, isChecked) {
    const app = appsRegistry.find(a => a.id === id);
    if(app) {
        app.active = isChecked;

        if (window.chrome && chrome.storage && chrome.storage.local) {
            let saveData = {};
            saveData[`flowork_app_state_${id}`] = isChecked;
            chrome.storage.local.set(saveData);
        }

        if (isChecked && window.chrome && chrome.tabs) {
            let urlSlug = id.replace(/_/g, '-');
            // [KODE LAMA TIDAK TERPAKAI] let targetUrl = `https://floworkos.com/flow/${urlSlug}#openapp`;
            let targetUrl = `${BASE_URL}/flow/${urlSlug}#openapp`; // KODE BARU
            chrome.tabs.create({ url: targetUrl });
        }

        if (currentFilter === 'active') {
            renderApps(searchInput.value);
        } else {
            let activeCount = appsRegistry.filter(a => a.active).length;
            counter.innerText = `${activeCount} / ${appsRegistry.length} Apps Active`;
        }
    }
}

function filterCategory(cat, targetElement) {
    currentFilter = cat;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if(targetElement) targetElement.classList.add('active');

    const gridEl = document.getElementById('app-grid');
    const topbarEl = document.getElementById('topbar-search');
    const aboutEl = document.getElementById('about-section');

    if (cat === 'about') {
        if (gridEl) gridEl.style.display = 'none';
        if (topbarEl) topbarEl.style.display = 'none';
        if (aboutEl) aboutEl.style.display = 'block';
    } else {
        if (gridEl) gridEl.style.display = 'grid';
        if (topbarEl) topbarEl.style.display = 'flex';
        if (aboutEl) aboutEl.style.display = 'none';
        renderApps(searchInput.value);
    }
}

// =========================================================
// EVENT LISTENERS
// =========================================================

document.addEventListener('DOMContentLoaded', async () => {

    await initRegistry();
    loadStateFromStorage();

    if (searchInput) {
        searchInput.addEventListener('input', (e) => renderApps(e.target.value));
    }

    document.querySelectorAll('.nav-item[data-category="all"], .nav-item[data-category="active"], .nav-item[data-category="about"]').forEach(item => {
        item.addEventListener('click', function(e) {
            filterCategory(this.getAttribute('data-category'), this);
        });
    });

    const btnLang = document.getElementById('btn-lang');
    if (btnLang) {
        btnLang.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'id' : 'en';
            if (window.chrome && chrome.storage) {
                chrome.storage.local.set({ 'flowork_lang': currentLang });
            }
            applyLocalization();
            renderApps(searchInput.value);
        });
    }

    const btnTheme = document.getElementById('btn-theme');
    if (btnTheme) {
        btnTheme.addEventListener('click', () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            if (window.chrome && chrome.storage) {
                chrome.storage.local.set({ 'flowork_os_theme': currentTheme });
            }
            applyThemeSystem();
        });
    }

    const btnAutoBoot = document.getElementById('btn-autoboot');
    if (btnAutoBoot) {
        btnAutoBoot.addEventListener('click', () => {
            autoBootDashboard = !autoBootDashboard;

            if (window.chrome && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ 'flowork_autoboot_dashboard': autoBootDashboard });
            }

            const t = hubDictionary[currentLang];
            btnAutoBoot.innerHTML = autoBootDashboard ? t.btnAutoBootOn : t.btnAutoBootOff;
        });
    }

    const btnClearCache = document.getElementById('btn-clear-cache');
    if (btnClearCache) {
        btnClearCache.addEventListener('click', () => {
            if (window.chrome && chrome.storage && chrome.storage.local) {
                chrome.storage.local.remove([
                    'flowork_registry_cache',
                    'flowork_registry_version',
                    'flowork_registry_timestamp'
                ], () => {
                    alert(currentLang === 'id' ? "Cache sistem berhasil dibersihkan! Memuat ulang data..." : "System cache cleared successfully! Reloading data...");
                    location.reload();
                });
            }
        });
    }

    const btnCloseLicense = document.getElementById('btn-close-license-modal');
    if (btnCloseLicense) {
        btnCloseLicense.addEventListener('click', () => {
            document.getElementById('license-modal').style.display = 'none';
        });
    }

    const btnCloseSettings = document.getElementById('btn-close-settings-modal');
    if (btnCloseSettings) {
        btnCloseSettings.addEventListener('click', () => {
            document.getElementById('settings-modal').style.display = 'none';
        });
    }

    const btnSaveSettings = document.getElementById('btn-save-settings');
    if (btnSaveSettings) {
        btnSaveSettings.addEventListener('click', () => {
            if (currentSettingsAppId === 'fake-name-generator') {
                const emails = document.getElementById('settings-textarea').value;
                if (window.chrome && chrome.storage && chrome.storage.local) {
                    chrome.storage.local.set({ 'flowork_fake_name_emails': emails }, () => {
                        alert(currentLang === 'id' ? "Seting berhasil disimpan!" : "Settings saved successfully!");
                        document.getElementById('settings-modal').style.display = 'none';
                    });
                }
            }
        });
    }
});

document.addEventListener('click', function(e) {
    const licenseBtn = e.target.closest('.btn-open-license');
    if (licenseBtn) {
        const appName = licenseBtn.getAttribute('data-appname');
        document.getElementById('modal-app-name').innerText = appName;
        document.getElementById('license-modal').style.display = 'flex';
    }

    const settingsBtn = e.target.closest('.btn-open-settings');
    if (settingsBtn) {
        currentSettingsAppId = settingsBtn.getAttribute('data-appid');
        const t = hubDictionary[currentLang] || hubDictionary['en'];

        if (currentSettingsAppId === 'fake-name-generator') {
            document.getElementById('modal-settings-title').innerText = t.settingsTitle;
            if (window.chrome && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['flowork_fake_name_emails'], function(res) {
                    document.getElementById('settings-textarea').value = res.flowork_fake_name_emails || '';
                });
            }
        }
        document.getElementById('settings-modal').style.display = 'flex';
    }
});

document.addEventListener('change', function(e) {
    if (e.target && e.target.classList.contains('app-toggle')) {
        const appId = e.target.getAttribute('data-id');
        const isChecked = e.target.checked;
        toggleApp(appId, isChecked);
    }
});