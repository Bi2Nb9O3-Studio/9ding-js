class _Config {
    /**
     *
     * @param {string} configURL 配置文件的URL
     * @param {Array|null} protectKeyList 被保护的键列表
     * @param {Array|null} readOnlyKeyList 只读的键列表
     */
    constructor(configURL, protectKeyList, readOnlyKeyList) {
        this.configURL = configURL;
        this.protectKeyList = protectKeyList === undefined ? new Array() : protectKeyList;
        this.readOnlyKeyList = readOnlyKeyList === undefined ? new Array() : readOnlyKeyList;
        this.loaded = 0;
        this.config = {};
    }

    /**
     * 加载配置文件
     *
     * @returns {Promise<error|object>}
     * @async
     */
    loadConfig() {
        let self = this;
        return new Promise((resolve, reject) => {
            try {
                let xhr = new XMLHttpRequest();
                // 第二步: 调用open函数 指定请求方式 与URL地址
                xhr.open("GET", self.configURL, true);
                xhr.setRequestHeader("If-Modified-Since", "0");
                // 第三步: 调用send函数 发起ajax请求
                xhr.send();
                // 第四步: 监听onreadystatechange事件
                xhr.onreadystatechange = function () {
                    // 监听xhr对象的请求状态 与服务器的响应状态
                    if (this.readyState == 4 && this.status == 200) {
                        // 如果响应就绪的话,就创建表格(拿到了服务器响应回来的数据xhr.responseText)
                        var config = JSON.parse(this.response);
                        self.loaded = 1;
                        resolve(config);
                    }
                };
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }

    /**
     * 初始化配置
     * @param {object} config
     */
    initConfig(config) {
        this.config = config;
    }

    /**
     * 获取值
     *
     * @param {string} key
     * @static
     * @public
     */

    getValue(key) {
        if (!(this.protectKeyList.includes(key) || this.readOnlyKeyList.includes(key))) {
            return this.config[key];
        } else {
            console.warn("An attempt to access a protected key " + key.toString() + ".");
            return null;
        }
    }

    /**
     * 设定值(本地)
     *
     * @param {string} key
     * @param {string} value
     * @static
     * @public
     */
    setValue(key, value) {
        if (this.protectKeyList.includes(key)) {
            console.error("An attempt to modify a protected key " + key.toString() + ".");
            return null;
        }
        this.config[key] = value;
    }
    //test
}

export { _Config };
