// =========================================================
// FLOWORK OS - MODULE: CONTENT FORGE AI (AUTO PARAGRAPH)
// =========================================================
console.log("🟢 [Module] Content Forge AI: Auto Paragraph Loaded!");

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({ id: "cf_root", title: "🚀 Flowork: Content Forge", contexts: ["all"] });

    // Update URL Patterns untuk mencakup ChatGPT, DeepSeek, dan Qwen
    const aiDomains = [
        "*://gemini.google.com/*",
        "*://aistudio.google.com/*",
        "*://chatgpt.com/*",
        "*://chat.deepseek.com/*",
        "*://chat.qwen.ai/*"
    ];

    chrome.contextMenus.create({
        id: "cf_inject",
        parentId: "cf_root",
        title: "Inject Prompt ke AI",
        contexts: ["all"],
        documentUrlPatterns: aiDomains
    });

    chrome.contextMenus.create({
        id: "cf_copy",
        parentId: "cf_root",
        title: "Smart Copy (Format [TITLE])",
        contexts: ["selection"],
        documentUrlPatterns: aiDomains
    });

    chrome.contextMenus.create({ id: "cf_sep1", parentId: "cf_root", type: "separator" });

    // Recording Target
    chrome.contextMenus.create({ id: "cf_rec_title", parentId: "cf_root", title: "Record Target: TITLE", contexts: ["all"] });
    chrome.contextMenus.create({ id: "cf_rec_body", parentId: "cf_root", title: "Record Target: BODY", contexts: ["all"] });

    chrome.contextMenus.create({ id: "cf_sep2", parentId: "cf_root", type: "separator" });

    // PASTE MENU
    chrome.contextMenus.create({ id: "cf_paste_title", parentId: "cf_root", title: "Paste: TITLE Only", contexts: ["all"] });
    chrome.contextMenus.create({ id: "cf_paste_body", parentId: "cf_root", title: "Paste: ARTICLE Only", contexts: ["all"] });
    chrome.contextMenus.create({ id: "cf_paste_tags", parentId: "cf_root", title: "Paste: TAGS Only", contexts: ["all"] });
    chrome.contextMenus.create({ id: "cf_paste_all", parentId: "cf_root", title: "🔥 Paste ALL (Auto)", contexts: ["all"] });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    // ---------------------------------------------------------
    // RECORDING LOGIC
    // ---------------------------------------------------------
    if (info.menuItemId === "cf_rec_title" || info.menuItemId === "cf_rec_body") {
        const type = info.menuItemId === "cf_rec_title" ? "title_selector" : "body_selector";
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (fieldType) => {
                const findPath = (el) => {
                    let path = [];
                    while (el && el.nodeType === Node.ELEMENT_NODE) {
                        let sel = el.nodeName.toLowerCase();
                        if (el.id) { sel += '#' + el.id; path.unshift(sel); break; }
                        let sib = el, nth = 1;
                        while (sib = sib.previousElementSibling) { if (sib.nodeName.toLowerCase() == sel) nth++; }
                        if (nth != 1) sel += ":nth-of-type(" + nth + ")";
                        path.unshift(sel);
                        el = el.parentNode;
                    }
                    return path.join(" > ");
                };
                return { type: fieldType, selector: findPath(document.activeElement), url: window.location.hostname };
            },
            args: [type]
        }, (results) => {
            if (results?.[0]?.result) {
                const res = results[0].result;
                const key = `cf_map_${res.url}`;
                chrome.storage.local.get([key], (d) => {
                    let map = d[key] || {};
                    map[res.type] = res.selector;
                    chrome.storage.local.set({ [key]: map });
                });
            }
        });
    }

    // ---------------------------------------------------------
    // INJECT & COPY
    // ---------------------------------------------------------
    if (info.menuItemId === "cf_inject") {
        chrome.storage.local.get(['cf_prompt', 'cf_titles', 'cf_keywords', 'cf_tags', 'cf_burn_titles', 'cf_burn_keywords', 'cf_burn_tags'], (data) => {
            const pick = (list, burn) => {
                if(!list) return {i:"", nl:""};
                let lines = list.split('\n').filter(l => l.trim());
                if(lines.length === 0) return {i:"", nl:""};
                let idx = Math.floor(Math.random() * lines.length);
                let p = lines[idx];
                if(burn) lines.splice(idx, 1);
                return {i:p, nl:lines.join('\n')};
            };
            let tD = pick(data.cf_titles, data.cf_burn_titles);
            let kD = pick(data.cf_keywords, data.cf_burn_keywords);
            let gD = pick(data.cf_tags, data.cf_burn_tags);
            let final = (data.cf_prompt || "").replace(/\{\{TITLE\}\}/g, tD.i).replace(/\{\{KEYWORD\}\}/g, kD.i).replace(/\{\{TAG\}\}/g, gD.i);

            let updates = {};
            if(data.cf_burn_titles) updates.cf_titles = tD.nl;
            if(data.cf_burn_keywords) updates.cf_keywords = kD.nl;
            if(data.cf_burn_tags) updates.cf_tags = gD.nl;
            if(Object.keys(updates).length > 0) chrome.storage.local.set(updates);

            chrome.scripting.executeScript({ target: { tabId: tab.id }, func: (txt) => {
                // Multi-platform Selector: Gemini, ChatGPT, DeepSeek, Qwen
                let ed = document.querySelector('rich-textarea') ||
                         document.querySelector('#prompt-textarea') || // ChatGPT
                         document.querySelector('textarea[placeholder*="DeepSeek"]') || // DeepSeek
                         document.querySelector('textarea') || // Fallback Qwen/Others
                         document.querySelector('[contenteditable="true"]');

                if(ed) {
                    ed.focus();
                    // Gunakan execCommand untuk meniru ketikan user agar event listener di React/Vue AI terpancing
                    document.execCommand('insertText', false, txt);
                    // Trigger input event manual untuk memastikan button 'Send' aktif
                    ed.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }, args: [final] });
        });
    }

    if (info.menuItemId === "cf_copy") {
        let t = info.selectionText || "";
        let tM = t.match(/\[TITLE\]([\s\S]*?)\[\/TITLE\]/i);
        let bM = t.match(/\[BODY\]([\s\S]*?)\[\/BODY\]/i);
        let gM = t.match(/\[TAGS\]([\s\S]*?)\[\/TAGS\]/i);
        chrome.storage.local.set({ cf_clipboard: { title: tM?.[1]?.trim() || "", body: bM?.[1]?.trim() || t, tags: gM?.[1]?.trim() || "" } });
    }

    // ---------------------------------------------------------
    // PASTE LOGIC (AUTO DOUBLE NEWLINE AFTER DOT)
    // ---------------------------------------------------------
    if (["cf_paste_title", "cf_paste_body", "cf_paste_tags", "cf_paste_all"].includes(info.menuItemId)) {
        const domain = new URL(tab.url).hostname;
        chrome.storage.local.get(['cf_clipboard', `cf_map_${domain}`], (data) => {
            const clip = data.cf_clipboard;
            const map = data[`cf_map_${domain}`] || {};
            if (!clip) return;

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (c, m, mode) => {
                    const autoParagraph = (txt) => {
                        if (!txt) return "";
                        return txt.replace(/\.([ \t]+|$)/g, ".\n\n").replace(/\n\s*\n\s*\n/g, "\n\n");
                    };

                    const fill = (el, val, isBody = false) => {
                        if(!el) return;
                        el.focus();
                        const finalVal = isBody ? autoParagraph(val) : val;
                        document.execCommand('insertText', false, finalVal);
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                    };

                    const active = document.activeElement;

                    if (mode === "cf_paste_title") fill(active, c.title);
                    if (mode === "cf_paste_body") fill(active, c.body, true);
                    if (mode === "cf_paste_tags") fill(active, c.tags);

                    if (mode === "cf_paste_all") {
                        if (m.title_selector && c.title) {
                            fill(document.querySelector(m.title_selector), c.title);
                        }
                        if (m.body_selector && c.body) {
                            setTimeout(() => {
                                let bodyContent = c.body + (c.tags ? "\n\n" + c.tags : "");
                                fill(document.querySelector(m.body_selector), bodyContent, true);
                            }, 500);
                        } else {
                            fill(active, c.title + "\n\n" + autoParagraph(c.body) + "\n\n" + c.tags);
                        }
                    }
                },
                args: [clip, map, info.menuItemId]
            });
        });
    }
});