export class Zocket {
    constructor(url) {
        this.url = url;
        this.connect()
    }

    connect() {
        this.socket = new WebSocket(this.url);

        this.socket.onmessage = this.onmessage.bind(this)
        this.socket.onerror = this.tryReconnect.bind(this)
        this.socket.onclose = this.tryReconnect.bind(this)
    }

    tryReconnect() {
        if (this.socket.readyState !== WebSocket.CLOSED) {
            return
        }

        setTimeout(this.connect.bind(this), 1000);
    }

    onmessage(message) {
        const data = JSON.parse(message.data)
        if (data.z) {
            if (data.z === "set") {
                Object.entries(data.variables).forEach(([key, value]) => {
                    z[key] = value
                })
            }
        }
    }
}