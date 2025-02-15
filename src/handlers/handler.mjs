import Utils from "../utils.mjs";
/** 处理器基类 */
export class Handler {
    /**
     * @constructor
     * @abstract
     */
    constructor() {
        if (new.target === Handler) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        this.counter = Utils.createCounter();
        this.counter_name = "handler";
    }
    /**
     * handler被触发时
     * @abstract
     * @returns {Promise}
     */
    init() {
        return new Promise((resolve, reject) => {});
    }
}
