import "toastify-js/src/toastify.css";
import "toastify-js";

function getUuid() {
    if (typeof crypto === "object") {
        if (typeof crypto.randomUUID === "function") {
            return crypto.randomUUID();
        }
        if (typeof crypto.getRandomValues === "function" && typeof Uint8Array === "function") {
            const callback = c => {
                const num = Number(c);
                return (num ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (num / 4)))).toString(16);
            };
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, callback);
        }
    }
    let timestamp = new Date().getTime();
    let perforNow = (typeof performance !== "undefined" && performance.now && performance.now() * 1000) || 0;
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        let random = Math.random() * 16;
        if (timestamp > 0) {
            random = (timestamp + random) % 16 | 0;
            timestamp = Math.floor(timestamp / 16);
        } else {
            random = (perforNow + random) % 16 | 0;
            perforNow = Math.floor(perforNow / 16);
        }
        return (c === "x" ? random : (random & 0x3) | 0x8).toString(16);
    });
}

function failed(msg) {
    Toastify({
        className: "error",
        text: msg,
        duration: 3000,
        style: {
            background: "linear-gradient(to right, #FF416C, #FF4B2B)"
        },
        position: "center"
    }).showToast();
}

function success(msg) {
    Toastify({
        className: "info",
        text: msg,
        duration: 3000,
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)"
        },
        position: "center"
    }).showToast();
}

function createCounter() {
    return {
        total: 0,
        count: 0,
        onIncrease: function (count, total) {},
        onFinish: function (count, total) {},
        increase() {
            this.count++;
            if (this.isDone()) {
                this.onFinish(this.count, this.total);
                return;
            }
            this.onIncrease(this.count, this.total);
        },
        decrease() {
            this.count--;
        },
        reset() {
            this.count = 0;
        },
        isDone() {
            return this.count >= this.total;
        },
        setTotal(total) {
            this.total = total;
            return this.count;
        }
    };
}

export default { getUuid, failed, success, createCounter };
