import * as LOGGER from "/js/logging.js"
document.onreadystatechange = function() {
    if (document.readyState == "complete") {
        document.getElementById("domloadingtext").innerText="√";
        document.getElementById("domloadingtext").style.color="green";
        LOGGER.flog("DOM","Javascript loading done")
    } //当页面加载状态
}
