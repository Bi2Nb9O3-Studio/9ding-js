import * as Scene from "/js/3dScene.js";
import * as CONFIG from "/js/config.js";
import * as NSBA from "/js/nsba.js";
function sleep(n) {
    var start = new Date().getTime();
    //  console.log('休眠前:' + start);
    while (true) {
        if (new Date().getTime() - start > n) {
            break;
        }
    }
    // console.log('休眠后:' + new Date().getTime());
}

export function show(config) {
    NSBA.isSupported();
    document.getElementById("loading").style.display = "";
    Scene.onloading(config);
    CONFIG.apply();
}
