//Loading images

export class CanvasPainter {
    constructor(start, stop, infoURL) {
        this.start = start;
        this.stop = stop;
        //processing vaules
        this.loadingcnt = 0;
        this.isFinish = 0;
        this.images = [];
        this.infoURL = infoURL;
    }
    loadImg() {
        var imgTotalNum = stop;
        for (var i = start; i <= stop; i++) {
            let loadingfile = new Image();
            loadingfile.src = "/static/img/1/" + i + ".jpg";
            loadingfile.onload = function () {
                this.loadingcnt++; // 这里的 this 就是这个图片的内容
                processSync();
            };
            this.images = [...this.images, loadingfile];
        }
    }
    processSync() {
        document.getElementById("picloadingtext").innerText =
            (this.loadingcnt / this.stop).toFixed(4) * 100 + "%";
        document
            .getElementById("picloading")
            .style.setProperty(
                "--progress",
                (this.loadingcnt / this.stop).toFixed(4) * 100 + "%"
            );
        if (loadingcnt == imgTotalNum) {
            this.isFinish = 1;
        }
    }
    loadInfo() {
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
                console.log(jsonData);
            })
            .catch(function (error) {
                // 当请求出错时的处理逻辑
                console.log(error);
            });
    }
}
