/** 处理器基类 */
export class Handler {
    /**
     * @constructor
     * @abstract
     */
    constructor() {}
    /**
     * handler被触发时
     * @abstract
     * @returns {Promise}
     */
    entry() {
        return new Promise();
    }
}
