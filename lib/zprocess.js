(() => {
  // src/index.js
  window.zp = {};
  zp.preprocessors = [];
  zp.pre = (selector, callback, outer = false) => {
    zp.preprocessors.push([selector, callback, outer]);
  };
  zp.runPreprocessor = (selector, callback, outer) => {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
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
    }
  };
  zp.runPreprocessors = () => {
    zp.preprocessors.forEach((preprocessor) => {
      console.log(preprocessor);
      zp.runPreprocessor(...preprocessor);
    });
  };
  window.addEventListener("load", () => {
    zp.runPreprocessors();
  });
})();
