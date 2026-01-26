(() => {
  // src/index.js
  window.zp = {};
  zp.preprocessors = [];
  zp.originals = /* @__PURE__ */ new Map();
  zp.pre = (selector, callback, outer = false, onWindowLoad = true) => {
    zp.preprocessors.push([selector, callback, outer, onWindowLoad]);
  };
  zp.runPreprocessor = (selector, callback, outer) => {
    document.querySelectorAll(selector).forEach((element) => {
      if (!zp.originals.has(element)) {
        zp.originals.set(element, outer ? element.outerHTML : element.innerHTML);
      }
      const original = zp.originals.get(element);
      if (original) {
        if (outer) {
          element.outerHTML = original;
        } else {
          element.innerHTML = original;
        }
      }
    });
    document.querySelectorAll(selector).forEach((element) => {
      const processed = callback({
        text: element.textContent.trim(),
        lines: element.textContent.trim().split("\n"),
        html: element.innerHTML,
        outer: element.outerHTML,
        element
      });
      var html = "";
      if (Array.isArray(processed)) {
        html += processed.join("");
      } else {
        html += processed;
      }
      if (outer) {
        element.outerHTML = html;
      } else {
        element.innerHTML = html;
      }
    });
  };
  zp.runPreprocessors = (windowLoad = false) => {
    zp.preprocessors.forEach((preprocessor) => {
      if (!preprocessor[3] && windowLoad) return;
      zp.runPreprocessor(...preprocessor);
    });
  };
  window.addEventListener("load", () => {
    zp.runPreprocessors(true);
  });
})();
