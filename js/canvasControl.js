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
    canvasInitPaint(cavObjArray) {
        //preProcess
        let that = this;
        if (cavObjArray != undefined) {
            this.cavobj = cavObjArray;
        }

        //=======================================

        //! This just for test!
        that.cavobj.forEach((ele) => {
            var canvas = ele[0];
            if (canvas.tagName != "CANVAS") {
                throw new Error("Not a CANVAS Element(" + e + ")");
            }
            var obj = ele[1];
            //State 1 Canvas Painting
            var content = canvas.getContext("2d");
            content.drawImage(
                that.images[0],
                (canvas.width -
                    parseInt(
                        (
                            (canvas.height - 50) *
                            (that.images[0].width / that.images[0].height)
                        ).toFixed(0)
                    )) /
                    2,
                0,
                (canvas.height - 50) *
                    (that.images[0].width / that.images[0].height),
                canvas.height - 50
            );

            //State 2
            var texture = new THREE.Texture(canvas);
            texture.repeat.set(0.5, 0.5);
            texture.flipX = true;
            texture.flipY = true;
            const uv = new Float32Array([
                0,
                0,
                1,
                0,
                1,
                1,
                0,
                1, // 正面
            ]);
            // 创建uv属性
            // obj.geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
            var material = new THREE.MeshBasicMaterial({
                map: texture,
                name: "cav1",
            });
            obj.material = material;
            obj.material.needsUpdate = true;
            console.log(obj);
        });
        that.isInited = 1;
    }
    canvasRender() {
        let that = this;
        if (!this.isInited) {
            return;
        }
        that.cavobj.forEach((ele) => {
            ele[1].material.map.needsUpdate = true;
            // console.log(ele[1].material.map);
        });
    }
}
