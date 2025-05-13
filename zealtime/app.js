z.myName = "Zealtime"
z.i = 0
z.statusColor = "red"
z.statusText = "Offline"
z.counting = 0

function textChanged() {
    // console.log(document.querySelector("input").value)
    z.myName = document.querySelector("input").value;
}

// setInterval(() => {
//     z.i++
// }, 1000)

function addMessage() {
    z.i++
    z.create("message", {
        username: `Zealtime #${z.i}`,
        content: "Hello, world!"
    })
}

function deleteMessage(zid) {
    z.delete(zid)
}

function editMessage(zid, content) {
    z[zid].content = content
}

function addSmiley(zid) {
    z.create(`smiley-${zid}`)
}

z.connect("ws://127.0.0.1:8765")