// ==UserScript==
// @name        ShellSniffer
// @namespace   https://github.com/technoz3n/ShellSniffer
// @version     2.1.0
// @description sniffs game globals and audits missing skins
// @author      technoz3n (techy)
// @match       *://*.shellshock.io/*
// @match       *://*.algebra.best/*
// @match       *://*.biologyclass.club/*
// @match       *://*.geometry.monster/*
// @run-at      document-start
// @grant       unsafeWindow
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(function () {
    const __DEBUG__ = true;
    const clientKeysURL = `https://raw.githubusercontent.com/StateFarmNetwork/client-keys/refs/heads/main/statefarm_`;
    let H_Keys = {};

    const log = function(...args) { if (__DEBUG__) console.log("[ShellSniffer] ", ...args); };

    String.prototype.originalReplaceAll = String.prototype.replaceAll;

    const fetchTextContent = function (url) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send();
        return xhr.status === 200 ? xhr.responseText : null;
    };

    let _apc = HTMLElement.prototype.appendChild;
    HTMLElement.prototype.appendChild = function(node) {
        if (node.tagName === 'SCRIPT' && node.innerHTML && node.innerHTML.startsWith('(()=>{')) {
            node.innerHTML = processGameScript(node.innerHTML);
        }
        return _apc.call(this, node);
    };

    function processGameScript(js) {
        let onlineClientKeys = fetchTextContent(clientKeysURL + "latest.json?v=" + Date.now());
        if (onlineClientKeys) {
            try {
                let clientKeys = JSON.parse(onlineClientKeys);
                H_Keys = clientKeys.vars;
            } catch (e) {
                }
        }

        let catalogMatch = js.match(/([a-zA-Z$_]+)\.catalog/);
        if (catalogMatch) {
            let globalVar = catalogMatch[1];
            js = js.originalReplaceAll(`${globalVar}.catalog`, `(window.gameGlobal=${globalVar}, ${globalVar}).catalog`);
            log(`Global object trapped via '${globalVar}'`);
        }

        return js;
    }

    unsafeWindow.getItemID = function(query) {
        const global = unsafeWindow.gameGlobal;
        if (!global || !global.catalog) return "error: catalog not found yet, open shop/inventory first";
        const allItems = Object.values(global.catalog).filter(val => Array.isArray(val)).flat();
        const searchTerm = query.toLowerCase();

        const matches = allItems.filter(i => {
            if (!i) return false;
            return (i.name && i.name.toLowerCase().includes(searchTerm)) ||
                   (i.tag && i.tag.toLowerCase().includes(searchTerm)) ||
                   (i.category_name && i.category_name.toLowerCase().includes(searchTerm));
        });

        return matches.length > 0 ? matches.map(i => ({
            name: i.name,
            id: i.id,
            category: i.category_name,
            price: i.price
        })) : "no matches found";
    };

    unsafeWindow.auditCategory = function(categoryName) {
        const global = unsafeWindow.gameGlobal;
        if (!global || !global.catalog || !global.playerAccount || !global.playerAccount.inventory) {
            console.warn("ShellSniffer: gameGlobal data not fully loaded yet! Open inventory first.");
            return;
        }

        const ownedIds = global.playerAccount.inventory.map(item => item.id);
        const allItems = Object.values(global.catalog).filter(val => Array.isArray(val)).flat();

        const missing = allItems.filter(item => {
            if (!item) return false;
            const matchesCat = item.category_name && item.category_name.toLowerCase() === categoryName.toLowerCase();
            const notOwned = !ownedIds.includes(item.id);
            const isObtainable = item.price !== 2147483647;

            return matchesCat && notOwned && isObtainable;
        });

        console.log(`[ShellSniffer]: Missing non-premium items for: ${categoryName.toUpperCase()}`);
        console.table(missing.map(i => ({
            ID: i.id,
            Name: i.name,
            Price: i.price,
            Category: i.category_name
        })));

        return missing;
    };
})();
