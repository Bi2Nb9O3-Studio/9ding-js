import * as LOGGER from "/js/logging.js";
import * as THREE from "/js/lib/three.module.js";

export class CanvasPainter {
    constructor(start, stop, infoURL, cavObjArray) {
        this.start = start;
        this.stop = stop;
        //processing vaules
        this.loadingcnt = 0;
        this.isLoadingFinish = 0;
        this.images = [];
        this.infoURL = infoURL;
        this.cavobj = cavObjArray;
        this.isInited = 0;
        this.imgInfo;
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
                that.imgInfo=jsonData
                document.getElementById("loadingInfo").innerText =
                    "图片信息加载完成";
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
    canvasInitPaint(cavObjArray, scene) {
        //preProcess
        let that = this;
        if (cavObjArray != undefined) {
            this.cavobj = cavObjArray;
        }

        //=======================================
        var cnt = 0;
        that.cavobj.forEach((ele) => {
            var canvassz = ele[0];
            var canvas=document.createElement("canvas")
            canvas.width=canvassz[0]
            canvas.height=canvassz[1]
            var objpos = ele[1];
            var context = canvas.getContext("2d");
            context.fillStyle = "#c7e8ff";
            context.fillRect(0, 0, canvassz[0], canvassz[1]);
            var image = that.images[cnt];
            context.drawImage(
                image,
                (canvas.width -
                    parseInt(
                        (
                            (canvas.height - 80) *
                            (image.width / image.height)
                        ).toFixed(0)
                    )) /
                    2,
                0,
                (canvas.height - 80) * (image.width / image.height),
                canvas.height - 80
            );
            var texture = new THREE.CanvasTexture(canvas);
            var material = new THREE.MeshBasicMaterial({
                map: texture,
                name: "cav"+(cnt+1),
            });
            var obj = new THREE.Mesh(
                new THREE.PlaneGeometry(canvas.width/1000, canvas.height/1000),
                material
            );
            obj.position.set(objpos[0], objpos[1], objpos[2]);
            obj.name = "screen"+(cnt+1);
            obj.rotation.y = 1.570796;
            scene.add(obj);
            obj.material.needsUpdate = true;
            console.log(obj);
            cnt++;
        });
        that.isInited = 1;
    }
    canvasRender() {
        let that = this;
        if (!this.isInited) {
            return;
        }
        that.cavobj.forEach((ele) => {
            if (ele[1].material) {
                ele[1].material.map.needsUpdate = true;
            }
            // console.log(ele[1].material.map);
        });
    }
}
