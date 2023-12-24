//Loading images

export var loadingcnt = 0;
var imgTotalNum = 86;
function processSync() {
    document.getElementById("picloadingtext").innerText =
        (loadingcnt / imgTotalNum).toFixed(4) * 100 + "%";
    document
        .getElementById("picloading")
        .style.setProperty(
            "--progress",
            (loadingcnt / imgTotalNum).toFixed(4) * 100 + "%"
        );
}

function loadInfo() {
    fetch("/static/img/1/info.json")
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("请求失败");
            }
        })
        .then(function (jsonData) {
            // 当请求成功后的处理逻辑
            console.log(jsonData);
        })
        .catch(function (error) {
            // 当请求出错时的处理逻辑
            console.log(error);
        });
}

export function loadImg(start, stop) {
    imgTotalNum = stop;
    var images = [];
    for (var i = start; i <= stop; i++) {
        let loadingfile = new Image();
        loadingfile.src = "/static/img/1/" + i + ".jpg";
        loadingfile.onload = function () {
            loadingcnt++; // 这里的 this 就是这个图片的内容
            processSync();
        };
        images = [...images, loadingfile];
    }
    return images;
}
