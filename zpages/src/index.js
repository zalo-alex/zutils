window.zpages = {}

z.headerHeight = 0
z.footerHeight = 0

zp.pre("pages", ({element}) => {
    element.style += "; --footer-height: $(footerHeight)px; --header-height: $(headerHeight)px;";
    return element.outerHTML
}, true)

let indexes = [0]
zp.pre("h1, h2, h3, h4, h5, h6", ({element}) => {
    if (!isInPage(element)) return element.outerHTML
    element.id = Math.random().toString(16).slice(2, 16)

    if (!element.hasAttribute("no-index")) {
        const level = parseInt(element.tagName.replace("H", ""))
        if (indexes.length <= level) {
            indexes.push(...Array(level - indexes.length).fill(0))
        }
        indexes = indexes.slice(0, level)
        indexes[level - 1]++
        element.innerText = `${indexes[level - 1]}. ${element.innerText}`
    }

    return element.outerHTML
}, true, false)

zp.pre("contents", ({element}) => {
    var html = `<div class="contents">`
    const headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    for (const header of headers) {
        if (!isInPage(header)) continue
        const level = parseInt(header.localName.replace("h", ""))
        // TODO: Use Zealtime
        html += `<a href="#${header.id}" class="level-${level} header"><span class="header-title">${header.textContent}</span><div class="separator"></div><span class="page-index">${getPageIndex(getPageFromElement(header))}</span></a>`
    }
    return html + "</div>"
}, true, false)

function isInPage(element) {
    return getPageFromElement(element) != null
}

function getPageFromElement(element) {
    return element.closest("page")
}

function getPageIndex(page) {
    if (!page) return -1
    return page.getAttribute("zpage-index") ? parseInt(page.getAttribute("zpage-index")) : Array.from(document.querySelectorAll("page")).indexOf(page)
}

function getTemplateRect(template) {
    const templateElement = z.getTemplate(template)
    templateElement.setAttribute("z-display", true)
    const rect = templateElement.getBoundingClientRect()
    templateElement.removeAttribute("z-display")
    return rect
}

function setHeaderFooterHeight() {
    z.headerHeight = getTemplateRect("header").height
    z.footerHeight = getTemplateRect("footer").height
}

function pxToResponsive(px) {
    return `min(calc(${px/800}*100vw),${px}px)`
}

function isPageOverflowing(page) {
    return page.scrollHeight > page.clientHeight || page.scrollWidth > page.clientWidth;
}

function createNewPage(sourcePage) {
    const newPage = document.createElement("page");

    // Copy attributes from source page (except no-page-break and zpage-index)
    for (const attr of sourcePage.attributes) {
        if (attr.name !== "no-page-break" && attr.name !== "zpage-index") {
            newPage.setAttribute(attr.name, attr.value);
        }
    }

    sourcePage.parentNode.insertBefore(newPage, sourcePage.nextSibling);
    return newPage;
}

function moveContentToNewPage(sourcePage, targetPage) {
    const children = Array.from(sourcePage.children);

    // Move children backwards until source page no longer overflows
    for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];

        // Skip header and footer elements
        if (child.matches('[z="header"], [z="footer"], [zid][z-template="header"], [zid][z-template="footer"]')) {
            continue;
        }

        targetPage.insertBefore(child, targetPage.firstChild);

        if (!isPageOverflowing(sourcePage)) {
            break;
        }
    }
}

function updatePageNumbers() {
    const pages = document.querySelectorAll("page");
    z.pageTotal = pages.length;

    pages.forEach((page, index) => {
        page.setAttribute("zpage-index", index);

        // Update page data in Zealtime state
        const headers = page.querySelectorAll('[zid][z-template="header"]');
        const footers = page.querySelectorAll('[zid][z-template="footer"]');

        headers.forEach(header => {
            const zid = header.getAttribute("zid");
            if (z[zid]) {
                z[zid].page = index + 1;
                z[zid].pageTotal = pages.length;
            }
        });

        footers.forEach(footer => {
            const zid = footer.getAttribute("zid");
            if (z[zid]) {
                z[zid].page = index + 1;
                z[zid].pageTotal = pages.length;
            }
        });
    });
}

function addHeaderFooter(page, pageIndex, totalPages) {
    if (!page.hasAttribute("no-header")) {
        z.createIn("header", page, {
            page: pageIndex + 1,
            pageTotal: totalPages
        });
    }

    if (!page.hasAttribute("no-footer")) {
        z.createIn("footer", page, {
            page: pageIndex + 1,
            pageTotal: totalPages
        });
    }
}

function pageBreak(page) {
    const newPage = createNewPage(page);
    moveContentToNewPage(page, newPage);

    // Add header and footer to new page
    const pages = document.querySelectorAll("page");
    const newPageIndex = Array.from(pages).indexOf(newPage);
    addHeaderFooter(newPage, newPageIndex, pages.length);

    // Update all page numbers
    updatePageNumbers();

    // Recursively handle overflow in the new page
    if (isPageOverflowing(newPage)) {
        pageBreak(newPage);
    }
}

zpages.updatePages = () => {
    const responsiveVars = {}

    for(const styleSheet of document.styleSheets) {
        try {
            for(const rule of styleSheet.cssRules) {
                const vars = [...rule.cssText.matchAll(/var\(--z-([^)]+)\)/g)];
                vars.forEach(([_, key]) => {
                    if (responsiveVars[key]) return
                    responsiveVars[key] = pxToResponsive(parseInt(key))
                })
            }
        } catch (e) { /* Probably cross-origin error */ }
    }

    const style = document.createElement("style");
    let formatedVars = Object.entries(responsiveVars).map(([key, value]) => `--z-${key}:${value};`).join("")
    style.innerHTML = `:root { ${formatedVars} }`;
    document.head.appendChild(style);

    setHeaderFooterHeight()
    
    let pages = document.querySelectorAll("page")
    z.pageTotal = pages.length;

    pages.forEach((page, index) => {
        page.setAttribute("zpage-index", index)
        addHeaderFooter(page, index, pages.length);
    })

    indexes = [0]
    zp.runPreprocessors()

    z.internals.render();

    // Query back the elements after preprocessors
    pages = document.querySelectorAll("page")
    pages.forEach((page) => {
        const isOverflowing = isPageOverflowing(page);

        if (isOverflowing && !page.hasAttribute("no-overflow-indicator") && page.hasAttribute("no-page-break")) {
            page.classList.add("z-overflowing");
        } else if (isOverflowing && !page.hasAttribute("no-overflow-indicator")) {
            pageBreak(page);
        }
    })
}

window.addEventListener("load", () => {
    zpages.updatePages()
})

window.addEventListener("resize", (event) => {
    setHeaderFooterHeight()
})