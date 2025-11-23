window.zp = {}
zp.preprocessors = []
zp.originals = new Map()

zp.pre = (selector, callback, outer=false) => {
    zp.preprocessors.push([selector, callback, outer])
}

zp.runPreprocessor = (selector, callback, outer) => {
    document.querySelectorAll(selector).forEach(element => {
        if (!zp.originals.has(element)) {
            zp.originals.set(element, outer ? element.outerHTML : element.innerHTML)
        }

        const original = zp.originals.get(element)
        if (original) {
            if (outer) {
                element.outerHTML = original
            } else {
                element.innerHTML = original
            }
        }
    })

    // Refetch elements, needed if outerHTML was changed
    document.querySelectorAll(selector).forEach(element => {
        const processed = callback({
            text: element.textContent.trim(),
            lines: element.textContent.trim().split("\n"),
            html: element.innerHTML,
            outer: element.outerHTML,
            element: element
        })
        var html = ""

        if (Array.isArray(processed)) {
            html += processed.join("")
        } else {
            html += processed
        }

        if (outer) {
            element.outerHTML = html
        } else {
            element.innerHTML = html
        }
    })
}

zp.runPreprocessors = () => {
    zp.preprocessors.forEach(preprocessor => {
        zp.runPreprocessor(...preprocessor)
    })
}

window.addEventListener("load", () => {
    zp.runPreprocessors()
})