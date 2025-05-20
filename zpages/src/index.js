z.headerHeight = 0
z.footerHeight = 0

zp.pre("pages", ({element}) => {
    element.style += "; --footer-height: $(footerHeight)px; --header-height: $(headerHeight)px;";
    return element.outerHTML
}, true)

zp.pre("h1, h2, h3, h4, h5, h6", ({element}) => {
    element.id = Math.random().toString(16).slice(2, 16)
    return element.outerHTML
}, true)

zp.pre("contents", ({element}) => {
    var html = `<div class="contents">`
    const headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    for (const header of headers) {
        const level = parseInt(header.localName.replace("h", ""))
        // TODO: Use Zealtime
        html += `<a href="#${header.id}" class="level-${level} header"><span class="header-title">${header.textContent}</span><div class="separator"></div><span class="page-index">${getPageIndex(getPageFromElement(header))}</span></a>`
    }
    return html + "</div>"
}, true)

function getPageFromElement(element) {
    return element.closest("page")
}

function getPageIndex(page) {
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

window.addEventListener("load", () => {
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
    
    const pages = document.querySelectorAll("page")
    pages.forEach((page, index) => {
        page.setAttribute("zpage-index", index)

        if (!page.hasAttribute("no-header")) {
            z.createIn("header", page, {
                "page": index + 1,
                "pageTotal": pages.length
            })
        }
        
        if (!page.hasAttribute("no-footer")) {
            z.createIn("footer", page, {
                "page": index + 1,
                "pageTotal": pages.length
            })
        }

        const isOverflowing = page.scrollHeight > page.clientHeight || page.scrollWidth > page.clientWidth;
        console.log(page, isOverflowing)
        if (isOverflowing) {
            page.classList.add("z-overflowing");
        }
    })
})

window.addEventListener("resize", (event) => {
    setHeaderFooterHeight()
})