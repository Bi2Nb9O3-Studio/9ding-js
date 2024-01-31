import WebGL from "./lib/capabilitiesChecker.js";

function getBrowserVersion() {
    var userAgent = window.navigator.userAgent;
    if(!userAgent){
        return
    }
    // IE
    if (/MSIE|Trident/.test(userAgent)||userAgent.indexOf("Opera Mini")!=-1) {
        alert("Is Opera Mini||IE.Skipped")
        window.location.href = "error_browser.html"; //遇到IE 就放弃
    }

    // Chrome
    if (/Chrome\/(\d+)/.test(userAgent)) {
        var chromeVersion = parseInt(RegExp.$1);
        var minimumChromeVersion = 51; // 设置最低支持的版本

        if (chromeVersion < minimumChromeVersion) {
            alert("Is Chrome. "+chromeVersion)
            window.location.href = "error_browser.html";
        }
    }

    // Firefox
    if (/Firefox\/(\d+)/.test(userAgent)) {
        var firefoxVersion = parseInt(RegExp.$1);
        var minimumFirefoxVersion = 54; // 设置最低支持的版本

        if (firefoxVersion < minimumFirefoxVersion) {
            alert("Is Firefox. "+firefoxVersion)
            window.location.href = "error_browser.html";
        }
    }

    // Safari
    if (/Safari\/(\d+)/.test(userAgent)) {
        var safariVersion = parseInt(RegExp.$1);
        var minimumSafariVersion = 10; // 设置最低支持的版本
        if (safariVersion < minimumSafariVersion) {
            alert("Is Safari. "+safariVersion)
            window.location.href = "error_browser.html";
        }
    }

    // Edge
    if (/Edg\/(\d+)/.test(userAgent)) {
        var edgeVersion = parseInt(RegExp.$1);
        var minimumEdgeVersion = 79; // 设置最低支持的版本

        if (edgeVersion < minimumEdgeVersion) {
            alert("Is Edge. "+edgeVersion)
            window.location.href = "error_browser.html";
        }
    }

    // Opera
    if (/OPR\/(\d+)/.test(userAgent)) {
        var operaVersion = parseInt(RegExp.$1);
        var minimumOperaVersion = 38; // 设置最低支持的版本

        if (operaVersion < minimumOperaVersion) {
            alert("Is Opera. "+operaVersion)
            window.location.href = "error_browser.html";
        }
    }
}

export function isSupported() {
    getBrowserVersion();
}
