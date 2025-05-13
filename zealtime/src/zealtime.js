import { DeepProxy } from './deepProxy.js';
import { Zocket } from './zocket.js';

const states = {}
const handler = {
    set(target, key, value) {
        target[key] = value;
        if (stateListeners.has(key)) {
            render();
        }
        return Reflect.set(target, key, value);
    },
    get(target, key, receiver, next) {
        return next();
    }
};

window.z = new DeepProxy(states, handler);

const stateListeners = new Set()
const modifications = new Map()
const attrModifications = new Map()
const templateDatas = new Map()

function renderElement(element, data) {
    element.childNodes.forEach(node => {
        if (node.nodeName === "#text" && /\$\(([^)]+)\)/.test(node.nodeValue)) {

            modifications.set(node, node.nodeValue)

            node.nodeValue = node.nodeValue.replace(/\$\(([^)]+)\)/g, (_, key) => {
                stateListeners.add(key);
                return key in data ? data[key] : `$(${key})`;
            });
        }
    })

    Object.values(element.attributes).forEach(attr => {
        if (/\$\(([^)]+)\)/.test(attr.value)) {
            const attrMod = attrModifications.get(element) || {};
            attrMod[attr.name] = attr.value;
            attrModifications.set(element, attrMod);

            attr.value = attr.value.replace(/\$\(([^)]+)\)/g, (_, key) => {
                stateListeners.add(key);
                return key in data ? data[key] : `$(${key})`;
            });
        }
    })
}

function render() { // TODO: Don't be dumb, only re render changed elements
    modifications.forEach((value, node) => {
        node.nodeValue = value;
    })

    attrModifications.forEach((mods, node) => {
        Object.entries(mods).forEach(([key, value]) => {
            node.setAttribute(key, value);
        })
    })

    document.querySelectorAll('*').forEach(el => {
        if (el.closest('[zid]') !== null) return
        renderElement(el, z)
    })

    document.querySelectorAll('[zid]').forEach(el => {
        const zid = el.getAttribute("zid");
        const data = templateDatas.get(zid);

        el.querySelectorAll('*').forEach(el => {
            if (el.closest('[zid]').getAttribute("zid") != zid && el.getAttribute("zid") != zid) return
            renderElement(el, {...z, ...data, zid})
        })
    })
}

function addStyles() {
    const style = document.createElement("style");
    style.innerHTML = `
        [z] {
            display: none;
        }
    `;
    document.head.appendChild(style);
}

function randomId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

z.create = (template, data = {}) => {
    const templateElement = document.querySelector(`[z="${template}"]`);
    const clone = templateElement.cloneNode(true);
    const zid = randomId();
    clone.removeAttribute("z");
    clone.setAttribute("zid", zid);
    templateElement.parentNode.appendChild(clone);
    templateDatas.set(zid, data); // TODO: DATA SHOULD BE STORED IN z. AND REMOVE templateDatas FOREVER !
    z[zid] = data
    render();
}

z.delete = (zid) => { // TODO: Should delete inner templates
    document.querySelector(`[zid="${zid}"]`).remove();
    templateDatas.delete(zid);
}

z.connect = (url) => {
    return new Zocket(url)
}

addStyles()

window.addEventListener("load", () => {
    console.log("Hello Zealtime.")
    render()
})