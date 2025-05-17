zp.pre(".text", ({lines}) => lines.map(t => `<p>${t}</p>`))
zp.pre(".text.red", ({html}) => `<span style="color: red">${html}</span>`)
zp.pre(".text.blue", ({html}) => `<span style="color: blue">${html}</span>`)
zp.pre(".text", ({outer}) => `<div style="border: 1px solid black">${outer}</div>`, outer=true)

zp.pre(".list", ({lines}) => lines.map(t => `<li>${t}</li>`).join(""))
zp.pre(".list", ({html}) => `<ul>${html}</ul>`, outer=true)

zp.pre(".AhHh", ({text}) => text.split("").map((t, i) => i % 2 == 1 ? t : t.toUpperCase()).join(""))

zp.pre(".l33t", ({text}) => text.replace(/a/g, "4").replace(/e/g, "3"))

window.addEventListener("load", () => {
    z.myName = "Zealtime w/ ZProcess"

    setTimeout(() => {
        z.myName = "Success!"
    }, 1000)
})