import * as LOGGER from "/js/logging.js";
import * as THREE from "/js/lib/three.module.js";

/**
 * @description 屏幕对象
 * @param {int} uuid - UUID
 * @param {THREE.Scene} scene - 父场景
 * @param {float} width - 屏幕宽度
 * @param {float} height - 屏幕高度
 * @param {float} scale - 缩放大小(px=>米)
 * @param {Array} pics - 图片数组
 * @param {Array} objInfo - 物体信息
 * @param {int} padding - 内边距
 * @param {JSON}
 */
class Screen {
    constructor(
        uuid,
        scene,
        width,
        height,
        scale = 0.001,
        pics,
        objInfo, //[[x,y,z],[rx,ry,rz]]
        padding,
        imgInfo
    ) {
        this.uuid = uuid | ("scr" + uuid);
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.pics = pics;
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.padding = padding;
        var context = canvas.getContext("2d");
        context.fillStyle = "#c7e8ff";
        context.fillRect(0, 0, canvassz[0], canvassz[1]);
    }
}

/**
 * @description 图像绘制类
 */
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

    /**
     * @description 加载信息
     */

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
                that.imgInfo = jsonData;
                document.getElementById("loadingInfo").innerText =
                    "图片信息加载完成";
                that.loadImg();
            })
            .catch(function (error) {
                // 当请求出错时的处理逻辑
                console.log(error);
            });
    }

    /**
     * @description 加载图片
     */
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

    /**
     * @description 初始化canvas画图
     * @param {Array} cavObjArray - 包含canvas对象和位置信息的数组
     * @param {THREE.Scene} scene - Three.js场景对象
     */
    canvasInitPaint(cavObjArray, scene) {
        //Custom Settings
        const picScale = 80;

        //preProcess
        let that = this;
        if (cavObjArray != undefined) {
            this.cavobj = cavObjArray;
        }

        //process
        that.cavobj.forEach((ele) => {
            var canvassz = ele[0];
            var objpos = ele[1];
            var image = that.images[cnt];
            var imageinfo = that.imgInfo[cnt];
            context.drawImage(
                image,
                (canvas.width -
                    parseInt(
                        (
                            (canvas.height - picScale) *
                            (image.width / image.height)
                        ).toFixed(0)
                    )) /
                    2,
                0,
                (canvas.height - picScale) * (image.width / image.height),
                canvas.height - picScale
            );
            context.fillStyle = "black";
            context.font = "60px sans-serif";
            console.log(context.font);
            context.fillText(imageinfo["学生姓名"], 50, canvas.height - 20);
            var texture = new THREE.CanvasTexture(canvas);
            var material = new THREE.MeshBasicMaterial({
                map: texture,
                name: "cav" + (cnt + 1),
            });
            var obj = new THREE.Mesh(
                new THREE.PlaneGeometry(
                    canvas.width / 1000,
                    canvas.height / 1000
                ),
                material
            );
            obj.position.set(objpos[0], objpos[1], objpos[2]);
            obj.name = "screen" + (cnt + 1);

            obj.rotation.x = ele[2][0] * (180 / Math.PI);
            obj.rotation.y = ele[2][1] * (180 / Math.PI);
            obj.rotation.z = ele[2][2] * (180 / Math.PI);

            scene.add(obj);
            console.log(canvas);
            obj.material.needsUpdate = true;
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
