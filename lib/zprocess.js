(() => {
  // src/index.js
  window.zp = {};
  zp.preprocessors = [];
  zp.pre = (selector, callback, outer = false, force_reprocess = false) => {
    zp.preprocessors.push([selector, callback, outer, force_reprocess]);
  };
  zp.runPreprocessor = (selector, callback, outer, force_reprocess) => {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      if (element.getAttribute("zp-processed") === "true" && !force_reprocess) {
        continue;
      }
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
      element.setAttribute("zp-processed", "true");
    }
  };
  zp.runPreprocessors = () => {
    zp.preprocessors.forEach((preprocessor) => {
      zp.runPreprocessor(...preprocessor);
    });
  };
  window.addEventListener("load", () => {
    zp.runPreprocessors();
  });
})();
