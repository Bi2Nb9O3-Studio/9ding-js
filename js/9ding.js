import { $ } from "./jquery-3.5.1.min.js";

/**
 * 九鼎展厅
 * @name $Exhibition
 */

export class $Exhibition {
    /**
     *
     * @class
     * @param {string} configURL
     */
    constructor(configURL) {
        this.config = new _Config(configURL);
    }

    init() {
        this.$nsba();
        this.config.loadConfig().then((config) => {
            // todo
        }).catch((error) => {
            //todo
        });
    }

    /**
     * @name NSBA
     * @description 检查浏览器是否支持
     *
     * @param {string|null} alertHTML
     */
    $nsba(alertHTML = null) {
        if (alertHTML == null) {
            alertHTML = `<html><head><title>浏览器版本过低!</title><style>body{background-color:#87CEFA;font-family:Arial,sans-serif;margin:0;padding:0}.container{background-color:#fff;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.2);max-width:600px;margin:50px auto;padding:20px}h1{color:#333}p{color:#555}ul{list-style-type:none;padding:0}li{margin-bottom:10px}a{color:#007BFF;text-decoration:none}a:hover{text-decoration:underline}</style><meta charset="UTF-8"></head><body><div class="container"><h1>抱歉，您的浏览器版本过低！</h1><p>我们推荐您使用Firefox网络浏览器, 以获得更好的浏览体验和更高的安全性。</p><p>推荐使用以下浏览器：</p><ul><li>Google Chrome:<a href="https://www.google.cn/chrome/">下载链接</a></li><li>Firefox:<a href="https://www.mozilla.org/zh-CN/firefox">下载链接</a></li><!--在这里可以添加其他浏览器的下载链接--></ul></div></body></html>`;
        }

        const show = () => {
            document.getElementsByTagName("html")[0].innerHTML = alertHTML;
        };
        function checkBrowserVersion(
            userAgent,
            browserRegex,
            versionRegex,
            minimumVersion,
            message
        ) {
            const browserMatch = userAgent.match(browserRegex);
            if (browserMatch) {
                const versionMatch = userAgent.match(versionRegex);
                if (versionMatch && versionMatch[1]) {
                    const version = parseInt(versionMatch[1], 10);
                    console.log(message + " " + version);
                    if (isNaN(version) || version < minimumVersion) {
                        show();
                    }
                }
            }
        }

        const userAgent = navigator.userAgent;

        // IE 和其他不支持的浏览器
        if (/MSIE|Trident|Opera Mini/.test(userAgent)) {
            console.log("Is Opera Mini||IE. Skipped");
            // show() 或其他处理逻辑
        }

        // Chrome
        checkBrowserVersion(
            userAgent,
            /Chrom(e|ium)\/(\d+)/,
            /Chrom(e|ium)\/(\d+)/,
            51,
            "Is Chrome"
        );

        // Firefox
        checkBrowserVersion(
            userAgent,
            /Firefox\/(\d+)/,
            /Firefox\/(\d+)/,
            54,
            "Is Firefox"
        );

        // Safari
        checkBrowserVersion(
            userAgent,
            /Version\/(\d+(\.\d+)?).*Safari/,
            /Version\/(\d+(\.\d+)?).*Safari/,
            10,
            "Is Safari"
        ); // 注意：Safari的版本号可能包含在"Version/"中

        // Edge
        checkBrowserVersion(
            userAgent,
            /Edg\/(\d+)/,
            /Edg\/(\d+)/,
            79,
            "Is Edge"
        );

        // Opera
        checkBrowserVersion(
            userAgent,
            /OPR\/(\d+)/,
            /OPR\/(\d+)/,
            38,
            "Is Opera"
        );
    }
}

class _Config {
    /**
     *
     * @param {string} configURL 配置文件的URL
     * @param {Array|null} protectKeyList 被保护的键列表
     * @param {Array|null} readOnlyKeyList 只读的键列表
     */
    constructor(configURL, protectKeyList, readOnlyKeyList) {
        this.configURL = configURL;
        this.protectKeyList = protectKeyList | [];
        this.readOnlyKeyList = readOnlyKeyList | [];
        this.loaded = 0;
    }

    /**
     * @name loadConfig
     * @description 加载配置文件
     *
     * @returns {Promise}
     * @async
     */
    loadConfig() {
        let self = this;
        return Promise((resolve, reject) => {
            try {
                let xhr = new XMLHttpRequest();
                // 第二步: 调用open函数 指定请求方式 与URL地址
                xhr.open("GET", "/config.json", true);
                xhr.setRequestHeader("If-Modified-Since", "0");
                // 第三步: 调用send函数 发起ajax请求
                xhr.send();
                // 第四步: 监听onreadystatechange事件
                xhr.onreadystatechange = function () {
                    // 监听xhr对象的请求状态 与服务器的响应状态
                    if (this.readyState == 4 && this.status == 200) {
                        // 如果响应就绪的话,就创建表格(拿到了服务器响应回来的数据xhr.responseText)
                        config = JSON.parse(this.response);
                        self.loaded = 1;
                        resolve(config);
                    }
                };
            } catch (error) {
                reject(error);
            }

        })
    }

    /**
     * @name getValue
     *
     * @param {string} key
     * @static
     * @public
     */

    getValue(key) {
        if (
            this.protectKeyList.includes(key) ||
            this.readOnlyKeyList.includes(key)
        ) {
            return this.config[key];
        } else {
            console.warn(
                "An attempt to access a protected key " + key.toString() + "."
            );
            return null;
        }
    }

    /**
     * @name setValue
     *
     * @param {string} key
     * @param {string} value
     * @static
     * @public
     */
    setValue(key, value) {
        if (this.protectKeyList.includes(key)) {
            console.warn(
                "An attempt to modify a protected key " + key.toString() + "."
            );
            return null;
        }
        this.config[key] = value;
    }
}
