(() => {
  // src/index.js
  z.headerHeight = 0;
  z.footerHeight = 0;
  zp.pre("#pages", ({ element }) => {
    element.style += "; --footer-height: $(footerHeight)px; --header-height: $(headerHeight)px;";
    return element.outerHTML;
  }, true);
  function getTemplateRect(template) {
    const templateElement = z.getTemplate(template);
    templateElement.setAttribute("z-display", true);
    const rect = templateElement.getBoundingClientRect();
    templateElement.removeAttribute("z-display");
    return rect;
  }
  function setHeaderFooterHeight() {
    z.headerHeight = getTemplateRect("header").height;
    z.footerHeight = getTemplateRect("footer").height;
  }
  function pxToResponsive(px) {
    return `min(calc(${px / 800}*100vw),${px}px)`;
  }
  window.addEventListener("load", () => {
    const pages = document.querySelectorAll(".page");
    pages.forEach((page, index) => {
      const isOverflowing = page.scrollHeight > page.clientHeight || page.scrollWidth > page.clientWidth;
      z.createIn("footer", page, {
        "page": index + 1,
        "pageTotal": pages.length
      });
      z.createIn("header", page, {
        "page": index + 1,
        "pageTotal": pages.length
      });
      if (isOverflowing) {
        page.classList.add("overflowing");
      }
    });
    const responsiveVars = {};
    for (const styleSheet of document.styleSheets) {
      for (const rule of styleSheet.cssRules) {
        const vars = [...rule.cssText.matchAll(/var\(--z-([^)]+)\)/g)];
        vars.forEach(([_, key]) => {
          if (responsiveVars[key]) return;
          responsiveVars[key] = pxToResponsive(parseInt(key));
        });
      }
    }
    const style = document.createElement("style");
    let formatedVars = Object.entries(responsiveVars).map(([key, value]) => `--z-${key}:${value};`).join("");
    style.innerHTML = `:root { ${formatedVars} }`;
    document.head.appendChild(style);
    setHeaderFooterHeight();
  });
  window.addEventListener("resize", (event) => {
    setHeaderFooterHeight();
  });
})();
