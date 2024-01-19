import * as BANNER from "/js/prelogo.js"
import * as LOGGER from "/js/logging.js"
export var config = 1;
export function apply(){
    if (config.isDefaultOpenConsole == 1) {
        document.getElementById("logging").style.display = "";
    }
}
export function loadConfig() {
    LOGGER.flog("CONFIG","Active loading config.")
    // 第一步: 创建xhr对象
    let xhr = new XMLHttpRequest();
    // 第二步: 调用open函数 指定请求方式 与URL地址
    xhr.open("GET", "/config.json", true);
    xhr.setRequestHeader('If-Modified-Since', '0');
    // 第三步: 调用send函数 发起ajax请求
    xhr.send();
    // 第四步: 监听onreadystatechange事件
    xhr.onreadystatechange = function () {
        // 监听xhr对象的请求状态 与服务器的响应状态
        if (this.readyState == 4 && this.status == 200) {
            // 如果响应就绪的话,就创建表格(拿到了服务器响应回来的数据xhr.responseText)
            LOGGER.flog("CONFIG","Loading Finish")
            config = JSON.parse(this.response);
            //Apply configuration

            BANNER.show(config);
        }
    };
}
