(() => {
  // src/index.js
  z.headerHeight = 0;
  z.footerHeight = 0;
  zp.pre("pages", ({ element }) => {
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
    const responsiveVars = {};
    for (const styleSheet of document.styleSheets) {
      try {
        for (const rule of styleSheet.cssRules) {
          const vars = [...rule.cssText.matchAll(/var\(--z-([^)]+)\)/g)];
          vars.forEach(([_, key]) => {
            if (responsiveVars[key]) return;
            responsiveVars[key] = pxToResponsive(parseInt(key));
          });
        }
      } catch (e) {
      }
    }
    const style = document.createElement("style");
    let formatedVars = Object.entries(responsiveVars).map(([key, value]) => `--z-${key}:${value};`).join("");
    style.innerHTML = `:root { ${formatedVars} }`;
    document.head.appendChild(style);
    setHeaderFooterHeight();
    const pages = document.querySelectorAll("page");
    pages.forEach((page, index) => {
      z.createIn("footer", page, {
        "page": index + 1,
        "pageTotal": pages.length
      });
      z.createIn("header", page, {
        "page": index + 1,
        "pageTotal": pages.length
      });
      const isOverflowing = page.scrollHeight > page.clientHeight || page.scrollWidth > page.clientWidth;
      console.log(page, isOverflowing);
      if (isOverflowing) {
        page.classList.add("z-overflowing");
      }
    });
  });
  window.addEventListener("resize", (event) => {
    setHeaderFooterHeight();
  });
})();
