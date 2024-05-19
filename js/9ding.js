/**
 * 九鼎展厅
 */

export class $Exhibition {
    /**
     *
     * @class
     * @param {string} configURL
     */
    constructor(configURL) {
        this.configURL = configURL;
        this.config = 0;
    }

    init() {
        this.$nsba();
        this.loadConfig();
    }

    /**
     * @name loadConfig
     * @description 加载配置文件
     *
     * @param {loadConfigCallback} callback
     */
    loadConfig(callback = null) {
        if (callback == null) {
            console.warn("Callback is null, this may cause some problems.");
            callback = (config, error) => {
                if (error != null) {
                    throw error;
                }
            };
        }
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
                    callback(config, null);
                }
            };
        } catch (error) {
            callback(null, error);
        }
    }
    /**
     * @callback loadConfigCallback
     * @param {Object|null} config
     * @param {Error|null} error
     */

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
