import * as LOGGER from "/js/logging.js";

export class CanvasPainter {
    constructor(start, stop, infoURL) {
        this.start = start;
        this.stop = stop;
        //processing vaules
        this.loadingcnt = 0;
        this.isLoadingFinish = 0;
        this.images = [];
        this.infoURL = infoURL;
    }

    loadInfo() {
        let that = this;
        document.getElementById("loadingInfo").innerText = "加载图像信息";
        fetch(this.infoURL)
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("请求失败");
                }
            })
            .then(function (jsonData) {
                // 当请求成功后的处理逻辑
                document.getElementById("loadingInfo").innerText =
                    "图片加载完成";
                that.loadImg();
            })
            .catch(function (error) {
                // 当请求出错时的处理逻辑
                console.log(error);
            });
    }
    loadImg() {
        for (var i = this.start; i <= this.stop; i++) {
            let loadingfile = new Image();
            loadingfile.src = "/static/img/1/" + i + ".jpg";
            let that = this;
            loadingfile.onload = function () {
                that.loadingcnt++;
                document.getElementById("picloadingtext").innerText =
                    (that.loadingcnt / that.stop).toFixed(4) * 100 + "%";
                document
                    .getElementById("picloading")
                    .style.setProperty(
                        "--progress",
                        (that.loadingcnt / that.stop).toFixed(4) * 100 + "%"
                    );
                if (that.loadingcnt == that.stop) {
                    that.isLoadingFinish = 1;
                }
                LOGGER.flog(
                    "CTP",
                    "Image " +
                        "/static/img/1/" +
                        i +
                        ".jpg Done." +
                        "(" +
                        (that.loadingcnt / that.stop).toFixed(4) * 100 +
                        "%" +
                        ")"
                );
                document.getElementById("loadingInfo").innerText =
                    "图像" + that.loadingcnt + "加载完成";
            };
            this.images = [...this.images, loadingfile];
        }
    }
    canvasPaint(canvas) {
        let that = this;
        canvas.forEach((e) => {
            if (e.tagName != "CANVAS") {
                throw new Error("Not a CANVAS Element(" + e + ")");
            }
        });
        //! This just for test!
        var content = canvas[0].getContext("2d");
        content.drawImage(
            that.images[0],
            0,
            0,
            canvas[0].innerHeight - 50,
            (canvas[0].innerHeight - 50) *
                (that.images[0].innerWidth / that.images[0].innerHeight)
        );
    }
}
