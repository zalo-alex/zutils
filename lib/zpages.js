(() => {
  // src/index.js
  window.zpages = {
    maxRecursivePageBreaks: 20
  };
  z.headerHeight = 0;
  z.footerHeight = 0;
  var indexes = [0];
  zp.pre("h1, h2, h3, h4, h5, h6", ({ element }) => {
    if (!isInPage(element)) return element.outerHTML;
    element.id = Math.random().toString(16).slice(2, 16);
    if (!element.hasAttribute("no-index")) {
      const level = parseInt(element.tagName.replace("H", ""));
      if (indexes.length <= level) {
        indexes.push(...Array(level - indexes.length).fill(0));
      }
      indexes = indexes.slice(0, level);
      indexes[level - 1]++;
      element.innerText = `${indexes[level - 1]}. ${element.innerText}`;
    }
    return element.outerHTML;
  }, true, false);
  zp.pre("contents", ({ element }) => {
    var html = `<div class="contents">`;
    const headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    for (const header of headers) {
      if (!isInPage(header) || header.getAttribute("no-index") != null) continue;
      const level = parseInt(header.localName.replace("h", ""));
      html += `<a href="#${header.id}" class="level-${level} header"><span class="header-title">${header.textContent}</span><div class="separator"></div><span class="page-index">${getPageIndex(getPageFromElement(header))}</span></a>`;
    }
    return html + "</div>";
  }, true, false);
  function isFrozen() {
    return !!window.zpagesFreeze;
  }
  function isInPage(element) {
    return getPageFromElement(element) != null;
  }
  function getPageFromElement(element) {
    return element.closest("page");
  }
  function getPageIndex(page) {
    if (!page) return -1;
    return page.getAttribute("zpage-index") ? parseInt(page.getAttribute("zpage-index")) : Array.from(document.querySelectorAll("page")).indexOf(page);
  }
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
    const pagesEl = document.querySelector("pages");
    if (pagesEl) {
      pagesEl.style.setProperty("--header-height", `${z.headerHeight}px`);
      pagesEl.style.setProperty("--footer-height", `${z.footerHeight}px`);
    }
  }
  function pxToResponsive(px) {
    return `min(calc(${px / 800}*100vw),${px}px)`;
  }
  function isPageOverflowing(page) {
    return page.scrollHeight > page.clientHeight || page.scrollWidth > page.clientWidth;
  }
  function isPageOverflowingY(page) {
    return page.scrollHeight > page.clientHeight;
  }
  function createNewPage(sourcePage) {
    const newPage = document.createElement("page");
    for (const attr of sourcePage.attributes) {
      if (attr.name !== "no-page-break" && attr.name !== "zpage-index") {
        newPage.setAttribute(attr.name, attr.value);
      }
    }
    sourcePage.parentNode.insertBefore(newPage, sourcePage.nextSibling);
    return newPage;
  }
  var HEADER_FOOTER_SELECTOR = '[z="header"], [z="footer"], [zid][z-template="header"], [zid][z-template="footer"]';
  function moveContentToNewPage(sourcePage, targetPage) {
    const children = Array.from(sourcePage.children);
    let moved = 0;
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child.matches(HEADER_FOOTER_SELECTOR)) {
        continue;
      }
      targetPage.insertBefore(child, targetPage.firstChild);
      moved++;
      if (!isPageOverflowing(sourcePage)) {
        break;
      }
    }
    return moved;
  }
  function hasLooseText(el) {
    return Array.from(el.childNodes).some(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0
    );
  }
  function isUnsplittableLayout(el) {
    const display = getComputedStyle(el).display;
    return display.includes("grid") || display.includes("flex");
  }
  function isAtomic(el) {
    return el.children.length === 0 || hasLooseText(el) || isUnsplittableLayout(el);
  }
  function trySplitContainer(sourcePage, targetPage) {
    const contentElements = Array.from(targetPage.children).filter(
      (c) => !c.matches(HEADER_FOOTER_SELECTOR)
    );
    if (contentElements.length === 0) return;
    const container = contentElements[0];
    if (isAtomic(container)) return;
    const clone = container.cloneNode(false);
    sourcePage.appendChild(clone);
    splitContainerAcrossPages(container, clone, sourcePage);
    if (clone.children.length === 0) clone.remove();
    if (container.children.length === 0) container.remove();
  }
  function splitContainerAcrossPages(sourceContainer, targetContainer, page) {
    while (sourceContainer.children.length > 0) {
      const child = sourceContainer.firstElementChild;
      targetContainer.appendChild(child);
      if (isPageOverflowing(page)) {
        sourceContainer.insertBefore(child, sourceContainer.firstChild);
        if (!isAtomic(child)) {
          const childClone = child.cloneNode(false);
          targetContainer.appendChild(childClone);
          splitContainerAcrossPages(child, childClone, page);
          if (childClone.children.length === 0) childClone.remove();
          if (child.children.length === 0) child.remove();
        }
        break;
      }
    }
  }
  function updatePageNumbers() {
    const pages = document.querySelectorAll("page");
    z.pageTotal = pages.length;
    pages.forEach((page, index) => {
      page.setAttribute("zpage-index", index);
      const headers = page.querySelectorAll('[zid][z-template="header"]');
      const footers = page.querySelectorAll('[zid][z-template="footer"]');
      headers.forEach((header) => {
        const zid = header.getAttribute("zid");
        if (z[zid]) {
          z[zid].page = index + 1;
        }
      });
      footers.forEach((footer) => {
        const zid = footer.getAttribute("zid");
        if (z[zid]) {
          z[zid].page = index + 1;
        }
      });
    });
  }
  function addHeaderFooter(page, pageIndex, totalPages) {
    if (!page.hasAttribute("no-header")) {
      z.createIn("header", page, {
        page: pageIndex + 1
      });
    }
    if (!page.hasAttribute("no-footer")) {
      z.createIn("footer", page, {
        page: pageIndex + 1
      });
    }
  }
  function pageBreak(page, i = 0) {
    const newPage = createNewPage(page);
    const movedItems = moveContentToNewPage(page, newPage);
    if (movedItems === 0) {
      newPage.remove();
      return;
    }
    if (movedItems === 1 || isPageOverflowing(newPage)) {
      trySplitContainer(page, newPage);
    }
    const pages = document.querySelectorAll("page");
    const newPageIndex = Array.from(pages).indexOf(newPage);
    addHeaderFooter(newPage, newPageIndex, pages.length);
    updatePageNumbers();
    if (isPageOverflowingY(newPage) && i < zpages.maxRecursivePageBreaks) {
      pageBreak(newPage, i + 1);
    }
  }
  zpages.updatePages = () => {
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
    if (isFrozen()) return;
    let pages = document.querySelectorAll("page");
    z.pageTotal = pages.length;
    pages.forEach((page, index) => {
      page.setAttribute("zpage-index", index);
    });
    indexes = [0];
    zp.runPreprocessors();
    pages = document.querySelectorAll("page");
    pages.forEach((page, index) => {
      addHeaderFooter(page, index, pages.length);
    });
    z.internals.render();
    pages = document.querySelectorAll("page");
    pages.forEach((page) => {
      const isOverflowing = isPageOverflowing(page);
      if (isOverflowing && !page.hasAttribute("no-overflow-indicator") && page.hasAttribute("no-page-break")) {
        page.classList.add("z-overflowing");
      } else if (isOverflowing && !page.hasAttribute("no-overflow-indicator") && isPageOverflowingY(page)) {
        pageBreak(page);
      }
    });
  };
  window.addEventListener("load", () => {
    zpages.updatePages();
  });
  window.addEventListener("resize", (event) => {
    setHeaderFooterHeight();
  });
})();
