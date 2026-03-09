//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : modules/fake_name.js
//#######################################################################

let customDotTrickEmails = [];

chrome.storage.local.get(['flowork_fake_name_emails'], (res) => {
    if (res.flowork_fake_name_emails) {
        customDotTrickEmails = res.flowork_fake_name_emails.split('\n').map(e => e.trim()).filter(e => e !== "");
    }
});

function syncFakeNameMenu(isActive) {
    if (isActive) {
        chrome.contextMenus.create({
            id: "flowork_autofill",
            title: "⚡ Isi Form (Flowork Randomizer)",
            contexts: ["editable"]
        }, () => { chrome.runtime.lastError; });
    } else {
        chrome.contextMenus.remove("flowork_autofill", () => { chrome.runtime.lastError; });
    }
}

chrome.storage.local.get(['flowork_app_state_fake-name-generator', 'flowork_registry_cache'], (result) => {
    let isActive = false;
    if (result['flowork_app_state_fake-name-generator'] !== undefined) {
        isActive = result['flowork_app_state_fake-name-generator'];
    } else if (result.flowork_registry_cache && result.flowork_registry_cache.apps) {
        const matchedApp = result.flowork_registry_cache.apps.find(a => a.id === 'fake-name-generator');
        if (matchedApp) isActive = matchedApp.ext === 'yes';
    }
    syncFakeNameMenu(isActive);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes['flowork_app_state_fake-name-generator']) {
        syncFakeNameMenu(changes['flowork_app_state_fake-name-generator'].newValue);
    }

    if (namespace === 'local' && changes['flowork_fake_name_emails']) {
        if (changes['flowork_fake_name_emails'].newValue) {
            customDotTrickEmails = changes['flowork_fake_name_emails'].newValue.split('\n').map(e => e.trim()).filter(e => e !== "");
        } else {
            customDotTrickEmails = [];
        }
    }
});

function generateRandomIdentity() {
    const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Alex", "Sam", "Taylor", "Jordan"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White"];
    const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "proton.me", "floworkos.com"];
    const cities = ["New York 10001", "Los Angeles 90001", "Chicago 60601", "Houston 77001", "Phoenix 85001", "Philadelphia 19019", "San Antonio 78201", "San Diego 92101", "Dallas 75201", "San Jose 95101", "Austin 73301", "Jakarta 10110", "Bandung 40111", "Surabaya 60111", "Bali 80361"];
    const streets = ["Main St", "Oak St", "Pine St", "Maple Ave", "Cedar Ln", "Elm St", "Washington St", "Lakeview Dr", "Sunset Blvd", "Broadway", "Sudirman"];

    const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const rn = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const fName = r(firstNames);
    const lName = r(lastNames);
    const username = `${fName.toLowerCase()}${lName.toLowerCase()}${rn(100, 9999)}`;

    let email = "";
    if (customDotTrickEmails.length > 0) {
        let chosenEmail = r(customDotTrickEmails);
        let parts = chosenEmail.split('@');

        if (parts.length === 2 && parts[1].toLowerCase() === 'gmail.com') {
            let unameClean = parts[0].replace(/\./g, '');
            let newUname = unameClean[0];

            for (let i = 1; i < unameClean.length; i++) {
                if (Math.random() > 0.5) newUname += '.';
                newUname += unameClean[i];
            }
            email = `${newUname}@gmail.com`;
        } else {
            email = chosenEmail;
        }
    } else {
        email = `${username}@${r(domains)}`;
    }

    const pass = `Flw@${rn(1000, 9999)}${fName.substring(0,2).toUpperCase()}!`;
    const phone = `+1${rn(200,999)}${rn(1000000,9999999)}`;
    const cityZip = r(cities);

    return {
        firstName: fName,
        middleName: "",
        lastName: lName,
        name: `${fName} ${lName}`,
        user: username,
        email: email,
        pass: pass,
        phone: phone,
        addr: `${rn(10, 9999)} ${r(streets)}`,
        city: cityZip
    };
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "flowork_autofill") {
        const randomData = generateRandomIdentity();
        chrome.storage.local.set({ flowork_latest_identity: randomData });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: injectFakeNameData,
            args: [randomData]
        });
    }
});

function injectFakeNameData(data) {
    console.log("💉 [Flowork Bridge] Memulai injeksi data (Modul Fake Name)...", data);

    const setNativeValue = (element, value) => {
        try {
            element.focus();

            const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
            const prototype = Object.getPrototypeOf(element);
            const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

            if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
                prototypeValueSetter.call(element, value);
            } else if (valueSetter) {
                valueSetter.call(element, value);
            } else {
                element.value = value;
            }

            element.dispatchEvent(new Event('keydown', { bubbles: true }));
            element.dispatchEvent(new Event('keypress', { bubbles: true }));
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('keyup', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));

            element.blur();

            element.style.border = "3px solid #3DDC84";
            element.style.backgroundColor = "rgba(61, 220, 132, 0.1)";
            element.style.boxShadow = "0 0 10px rgba(61, 220, 132, 0.8)";
            element.style.transition = "all 0.3s";

        } catch (e) {
            console.warn("Gagal set native value, fallback ke basic:", e);
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    const setVal = (selectors, value) => {
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (el && !el.disabled && el.type !== 'hidden') {
                    setNativeValue(el, value);
                }
            });
        });
    };

    const cityName = data.city.split(' ')[0];
    setVal([
        'input[name="firstname" i]', 'input[name="first_name" i]', 'input[name*="first" i]',
        'input[aria-label*="first" i]', 'input[placeholder*="first" i]'
    ], data.firstName);
    setVal([
        'input[name="middlename" i]', 'input[name="middle_name" i]', 'input[name*="middle" i]',
        'input[aria-label*="middle" i]', 'input[placeholder*="middle" i]'
    ], data.middleName);

    setVal([
        'input[name="lastname" i]', 'input[name="last_name" i]', 'input[name*="last" i]',
        'input[aria-label*="last" i]', 'input[placeholder*="last" i]'
    ], data.lastName);

    setVal([
        'input[name="name" i]', 'input[id="name" i]', 'input[name*="fullname" i]',
        'input[aria-label*="name" i]', 'input[placeholder*="name" i]'
    ], data.name);

    setVal([
        'input[name="reg_email__"]', 'input[type="email"]', 'input[name*="email" i]',
        'input[id*="email" i]', 'input[aria-label*="email" i]', 'input[placeholder*="email" i]'
    ], data.email);

    setVal([
        'input[name="reg_passwd__"]', 'input[type="password"]', 'input[name*="pass" i]',
        'input[id*="pass" i]', 'input[aria-label*="pass" i]', 'input[placeholder*="pass" i]'
    ], data.pass);

    setVal([
        'input[type="tel"]', 'input[name*="phone" i]', 'input[id*="phone" i]',
        'input[name*="mobile" i]', 'input[placeholder*="phone" i]'
    ], data.phone);

    setVal([
        'input[name*="address" i]', 'input[id*="address" i]', 'textarea[name*="address" i]',
        'input[placeholder*="address" i]'
    ], data.addr);

    setVal(['input[name*="city" i]', 'input[id*="city" i]', 'input[placeholder*="city" i]'], cityName);
    setVal(['input[name*="zip" i]', 'input[id*="zip" i]', 'input[name*="postal" i]'], data.city.split(' ')[1] || '10110');

    /* [KODE LAMA DIMATIKAN - Mencegah tabrakan dengan field email]
    setVal(['input[name*="user" i]', 'input[id*="user" i]', 'input[placeholder*="username" i]'], data.user);
    */

    // [KODE BARU] Selector yang lebih ketat, dijamin tidak menyentuh field email
    setVal([
        'input[name*="user" i]:not([type="email"]):not([name*="email" i]):not([id*="email" i])',
        'input[id*="user" i]:not([type="email"]):not([name*="email" i]):not([id*="email" i])',
        'input[placeholder*="username" i]:not([type="email"]):not([name*="email" i])'
    ], data.user);

    console.log("⚡ [Flowork Bridge] Data form berhasil disuntikkan oleh Modul Fake Name!");
}