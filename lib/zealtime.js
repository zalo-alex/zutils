(() => {
  // src/deepProxy.js
  function DeepProxy(target, userHandler = {}, cache = /* @__PURE__ */ new WeakMap()) {
    if (target === null || typeof target !== "object") return target;
    if (cache.has(target)) return cache.get(target);
    const proxy = new Proxy(target, {
      get(t, prop, receiver) {
        if (typeof userHandler.get === "function") {
          return userHandler.get(
            t,
            prop,
            receiver,
            () => DeepProxy(Reflect.get(t, prop, receiver), userHandler, cache)
          );
        }
        return DeepProxy(Reflect.get(t, prop, receiver), userHandler, cache);
      },
      set(t, prop, value, receiver) {
        const done = typeof userHandler.set === "function" ? userHandler.set(t, prop, value, receiver) : Reflect.set(t, prop, value, receiver);
        return done;
      },
      deleteProperty: forward("deleteProperty"),
      has: forward("has"),
      ownKeys: forward("ownKeys"),
      defineProperty: forward("defineProperty"),
      getOwnPropertyDescriptor: forward("getOwnPropertyDescriptor"),
      getPrototypeOf: forward("getPrototypeOf"),
      setPrototypeOf: forward("setPrototypeOf"),
      isExtensible: forward("isExtensible"),
      preventExtensions: forward("preventExtensions")
    });
    cache.set(target, proxy);
    return proxy;
    function forward(trap) {
      return (...args) => typeof userHandler[trap] === "function" ? userHandler[trap](...args) : Reflect[trap](...args);
    }
  }

  // src/zocket.js
  var Zocket = class {
    constructor(url) {
      this.url = url;
      this.connect();
    }
    connect() {
      this.socket = new WebSocket(this.url);
      this.socket.onmessage = this.onmessage.bind(this);
      this.socket.onerror = this.tryReconnect.bind(this);
      this.socket.onclose = this.tryReconnect.bind(this);
    }
    tryReconnect() {
      if (this.socket.readyState !== WebSocket.CLOSED) {
        return;
      }
      setTimeout(this.connect.bind(this), 1e3);
    }
    onmessage(message) {
      const data = JSON.parse(message.data);
      if (data.z) {
        if (data.z === "set") {
          Object.entries(data.variables).forEach(([key, value]) => {
            z[key] = value;
          });
        }
      }
    }
  };

  // src/index.js
  var states = {};
  var handler = {
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
  var stateListeners = /* @__PURE__ */ new Set();
  var modifications = /* @__PURE__ */ new Map();
  var attrModifications = /* @__PURE__ */ new Map();
  function renderElement(element, data) {
    element.childNodes.forEach((node) => {
      if (node.nodeName === "#text" && /\$\(([^)]+)\)/.test(node.nodeValue)) {
        modifications.set(node, node.nodeValue);
        node.nodeValue = node.nodeValue.replace(/\$\(([^)]+)\)/g, (_, key) => {
          stateListeners.add(key);
          return key in data ? data[key] : `$(${key})`;
        });
      }
    });
    Object.values(element.attributes).forEach((attr) => {
      if (/\$\(([^)]+)\)/.test(attr.value)) {
        const attrMod = attrModifications.get(element) || {};
        attrMod[attr.name] = attr.value;
        attrModifications.set(element, attrMod);
        attr.value = attr.value.replace(/\$\(([^)]+)\)/g, (_, key) => {
          stateListeners.add(key);
          return key in data ? data[key] : `$(${key})`;
        });
      }
    });
  }
  function render() {
    modifications.forEach((value, node) => {
      node.nodeValue = value;
    });
    attrModifications.forEach((mods, node) => {
      Object.entries(mods).forEach(([key, value]) => {
        node.setAttribute(key, value);
      });
    });
    document.querySelectorAll("*").forEach((el) => {
      if (el.closest("[zid]") !== null) return;
      renderElement(el, z);
    });
    document.querySelectorAll("[zid]").forEach((el) => {
      const zid = el.getAttribute("zid");
      const data = z[zid];
      el.querySelectorAll("*").forEach((el2) => {
        if (el2.closest("[zid]").getAttribute("zid") != zid && el2.getAttribute("zid") != zid) return;
        renderElement(el2, { ...z, ...data, zid });
      });
    });
  }
  function addStyles() {
    const style = document.createElement("style");
    style.innerHTML = `
        [z]:not([z-display]) {
            display: none;
        }
    `;
    document.head.appendChild(style);
  }
  function randomId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  z.getTemplate = (template) => {
    return document.querySelector(`[z="${template}"]`);
  };
  z.createTemplate = (template, data = {}) => {
    const templateElement = z.getTemplate(template);
    const clone = templateElement.cloneNode(true);
    const zid = randomId();
    clone.removeAttribute("z");
    clone.setAttribute("zid", zid);
    z[zid] = data;
    return { clone, zid, templateElement };
  };
  z.create = (template, data = {}) => {
    const { clone, templateElement } = z.createTemplate(template, data);
    templateElement.parentNode.appendChild(clone);
    render();
  };
  z.createAfter = (template, after, data = {}) => {
    if (typeof after === "string") {
      after = document.querySelector(after);
    }
    const { clone } = z.createTemplate(template, data);
    after.after(clone);
    render();
  };
  z.createIn = (template, parent, data = {}) => {
    if (typeof parent === "string") {
      parent = document.querySelector(parent);
    }
    const { clone } = z.createTemplate(template, data);
    parent.appendChild(clone);
    render();
  };
  z.delete = (zid) => {
    document.querySelector(`[zid="${zid}"]`).remove();
    delete z[zid];
  };
  z.connect = (url) => {
    return new Zocket(url);
  };
  addStyles();
  window.addEventListener("load", () => {
    render();
  });
})();
