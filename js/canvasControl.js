import * as LOGGER from "/js/logging.js";
import * as THREE from "/js/lib/three.module.js";

/**
 * @description 屏幕对象
 * @param {number} uuid - UUID
 * @param {THREE.Scene} scene - 父场景
 * @param {number} width - 屏幕宽度
 * @param {number} height - 屏幕高度
 * @param {number|undefined} scale - 缩放大小(px=>米)
 * @param {Array} pics - 图片数组
 * @param {Array} objInfo - 物体信息
 * @param {number} padding - 内边距
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
        this.uuid = ("scr" + uuid);
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.pics = pics;
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.padding = padding;
        this.imgInfo = imgInfo;
        this.point = 0;
        this.screenContent();
        var texture = new THREE.CanvasTexture(this.canvas);
        var material = new THREE.MeshBasicMaterial({
            map: texture,
            name: this.uuid
        });
        this.obj = new THREE.Mesh(
            new THREE.PlaneGeometry(
                this.width * this.scale,
                this.height * this.scale
            ),
            material
        );
        this.obj.position.set(objInfo[0][0], objInfo[0][1], objInfo[0][2]);
        this.obj.name = this.uuid;

        this.obj.rotation.x = objInfo[1][0] * (Math.PI/180);
        this.obj.rotation.y = objInfo[1][1] * (Math.PI/180);
        this.obj.rotation.z = objInfo[1][2] * (Math.PI/180);

        this.scene.add(this.obj);
        this.obj.material.needsUpdate = true;
    }

    render(){
        this.obj.material.map.needsUpdate = true;
    }

    screenContent(){
        var cnt=this.point;
        var context = this.canvas.getContext("2d");
        context.fillStyle = "#c7e8ff";
        context.fillRect(0, 0, this.width, this.height);
        context.drawImage(
            this.pics[cnt],
            (this.width -
                parseInt(
                    (
                        (this.height - this.padding) *
                        (this.pics[cnt].width / this.pics[cnt].height)
                    ).toFixed(0)
                )) /
                2,
            0,
            (this.height - this.padding) * (this.pics[cnt].width / this.pics[cnt].height),
            this.height - this.padding
        );

        context.fillStyle = "black";
        context.font = "60px sans-serif";
        context.fillText(this.imgInfo[cnt]["学生姓名"]+" "+this.imgInfo[cnt]['作品名称']+" 指导老师："+this.imgInfo[cnt]['作品指导教师'], 50, this.height - 20);
        this.point+=1;
        if(this.point==this.pics.length){
            this.point=0;
        }
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
        this.screens = [];
    }

    /**
     * @description 加载信息
     */
    

    loadInfo() {
        let self = this;
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
                self.imgInfo = jsonData;
                document.getElementById("loadingInfo").innerText =
                    "图片信息加载完成";
                self.loadImg();
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
            let self = this;
            loadingfile.onload = function () {
                self.loadingcnt++;
                document.getElementById("picloadingtext").innerText =
                    (self.loadingcnt / self.stop).toFixed(4) * 100 + "%";
                document
                    .getElementById("picloading")
                    .style.setProperty(
                        "--progress",
                        (self.loadingcnt / self.stop).toFixed(4) * 100 + "%"
                    );
                if (self.loadingcnt == self.stop) {
                    self.isLoadingFinish = 1;
                }
                LOGGER.flog(
                    "CTP",
                    "Image " +
                        "/static/img/1/" +
                        i +
                        ".jpg Done." +
                        "(" +
                        (self.loadingcnt / self.stop).toFixed(4) * 100 +
                        "%" +
                        ")"
                );
                document.getElementById("loadingInfo").innerText =
                    "图像" + self.loadingcnt + "加载完成";
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
        let self = this;
        if (cavObjArray != undefined) {
            this.cavobj = cavObjArray;
        }

        //process
        var cnt = 0;
        self.cavobj.forEach((ele) => {
            self.screens = [
                ...self.screens,
                new Screen(
                    cnt,
                    scene,
                    ele[0][0],
                    ele[0][1],
                    undefined,
                    self.images.slice(
                        cnt * (self.images.length / self.cavobj.length),
                        (cnt + 1) * (self.images.length / self.cavobj.length)
                    ),
                    [ele[1],ele[2]],
                    picScale,
                    self.imgInfo.slice(
                        cnt * (self.images.length / self.cavobj.length),
                        (cnt + 1) * (self.images.length / self.cavobj.length)
                    )
                ),
            ];

            cnt++;
        });
        self.isInited = 1;
    }
    canvasRender() {
        let self = this;
        if (!this.isInited) {
            return;
        }
        self.screens.forEach((e)=>{
            e.render();
        })
    }

    canvasUpdate(){
        // console.log(this)
        this.screens.forEach((ele)=>{
            ele.screenContent();
        })
    }
}
