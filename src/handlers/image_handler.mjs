import * as THREE from "three";
import { Handler } from "./handler.mjs";
import Utils from "../utils.mjs";
// import * as EXT from "../main.mjs";
class Screen {
    constructor(scene, cavdata, objdata, scale = 0.001, picmeta, config, backendurl, padding = 80) {
        /**
         * @description 缩放大小(px=>米)
         * @private
         */
        this.scale = scale;
        /**
         * @description 父场景
         * @private
         */
        this.scene = scene;
        /**
         * @description 画布大小
         * @type {Object}
         * @property {number} width
         * @property {number} height
         * @private
         */
        this.cavdata = cavdata;
        /**
         * @description 物体数据
         * @private
         */
        this.objdata = objdata;
        /**
         * @description 图片元数据
         * @private
         * @type {Array}
         */
        this.picmeta = picmeta;
        this.uuid = Utils.getUuid();
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.cavdata[0];
        this.canvas.height = this.cavdata[1];
        this.loadedcnt = 0;
        this.pointer = 0;
        this.config = config;
        this.backendurl = backendurl;
        this.padding = padding;
    }

    /**
     * @description 加载图片
     * @private
     * @returns {Promise}
     */
    loadImg() {
        let that = this;
        var starttime = new Date().getTime();
        this.picmeta.forEach(element => {
            var file = new Image();
            file.src = new URL(element.url, this.backendurl.toString());
            file.onload = () => {
                that.loadedcnt++;
                //console.log("Loaded", that.loadedcnt, "/", that.picmeta.length);
            };
            element.file = file;
        });
        return new Promise((resolve, reject) => {
            //wait for each file loaded
            var interval = setInterval(() => {
                if (this.loadedcnt >= this.picmeta.length) {
                    clearInterval(interval);
                    resolve();
                }
                if (new Date().getTime() - starttime > this.config.timeout) {
                    clearInterval(interval);
                    reject();
                }
            }, 100);
        });
    }

    init() {
        this.loadImg()
            .then(() => {
                //console.log("Loaded", this.loadedcnt, "Images");
                //create texture
                this.texture = new THREE.CanvasTexture(this.canvas);
                //create material
                this.material = new THREE.MeshBasicMaterial({
                    map: this.texture,
                    name: "screenof" + this.uuid
                });
                //create object
                this.obj = new THREE.Mesh(
                    new THREE.PlaneGeometry(this.cavdata[0] * this.scale, this.cavdata[1] * this.scale),
                    this.material
                );
                this.obj.position.set(this.objdata[0][0], this.objdata[0][1], this.objdata[0][2]);
                this.obj.rotation.x = this.objdata[1][0] * (Math.PI / 180);
                this.obj.rotation.y = this.objdata[1][1] * (Math.PI / 180);
                this.obj.rotation.z = this.objdata[1][2] * (Math.PI / 180);
                this.scene.add(this.obj);
                this.obj.material.needsUpdate = true;
                this.paint();
                this.paint_interval = setInterval(() => {
                    this.paint();
                }, this.config.delay.change);
                // this.update_interval = setInterval(() => {}, this.config.delay.update);
                //console.log(this.canvas,this.paint_interval,this.update_interval);
            })
            .catch(() => {
                Utils.failed("加载图片失败!(Timeout)");
            });
    }

    paint() {
        // console.log(this.uuid,"Painting")
        var cnt = this.pointer;
        var context = this.canvas.getContext("2d");
        context.fillStyle = this.config.backgroundColor;
        // console.log(this.picmeta[cnt]);
        context.fillRect(0, 0, this.cavdata[0], this.cavdata[1]);
        context.drawImage(
            this.picmeta[cnt].file,
            (this.cavdata[0] -
                parseInt(
                    (this.cavdata[1] - this.padding) *
                        (this.picmeta[cnt].file.width / this.picmeta[cnt].file.height).toFixed(2)
                )) /
                2,
            0,
            (this.cavdata[1] - this.padding) * (this.picmeta[cnt].file.width / this.picmeta[cnt].file.height),
            this.cavdata[1] - this.padding
        );
        context.fillStyle = this.config.text.font.color;
        var display = "";
        this.config.info.forEach(element => {
            display +=
                unescape(element.display) +
                ":" +
                unescape(this.picmeta[cnt]["info"][element.key] || element.default) +
                " ";
        });
        context.font = this.config.text.font.size + " " + this.config.text.font.famliy;
        context.fillText(
            display,
            this.config.text.position.x,
            this.cavdata[1] - this.config.text.position.down - padding,
            this.cavdata[0]
        );
        this.pointer++;
        if (this.pointer >= this.picmeta.length) {
            this.pointer = 0;
        }
        this.update();
    }

    update() {
        // console.log(this.uuid,"Updating")
        this.obj.material.map.needsUpdate = true;
    }
}

export default class ImageHandler extends Handler {
    /**
     * @constructor
     * @override
     * @param {URL} backendurl 后端接口地址
     * @param {EXT.$Exhibition} exhibition 展览实例
     */
    constructor(backendurl, exhibition) {
        super();
        //console.log("Active Handler");
        /**
         * @description 后端接口地址
         * @type {URL}
         */
        this.backendurl = new URL(backendurl, window.location.protocol + "//" + window.location.host + "/");
        this.meta = [];
        this.exhibition = exhibition;
        this.screens = [];
    }

    /**
     * @description 初始化
     */
    init() {
        this.loadInfo()
            .then(data => {
                Utils.success("加载图像信息文件成功!");
                this.meta = data;
                this.loadConfig().then(config => {
                    Utils.success("加载图像配置文件成功!");
                    this.config = config;
                    var ppc = Math.floor(this.meta.length / this.config.screens.length);
                    var err = this.meta.lenght % this.config.screens.length;
                    var header = 0;
                    this.config.screens.forEach(element => {
                        this.screens.push(
                            new Screen(
                                this.exhibition.scene,
                                element[0],
                                [element[1], element[2]],
                                undefined,
                                this.meta.slice(header, header + ppc + (err > 0 ? 1 : 0)),
                                this.config,
                                this.backendurl,
                                undefined
                            )
                        );
                        //console.log(header, header + ppc + (err > 0 ? 1 : 0));
                        if (err > 0) {
                            err--;
                        }
                        header += ppc + (err > 0 ? 1 : 0);
                    });
                    this.screens.forEach(element => {
                        element.init();
                    });
                });
            })
            .catch(() => {
                Utils.failed("加载图像信息文件失败!");
            });
    }

    /**
     * @private
     * @returns {Promise}
     */
    loadInfo() {
        return new Promise((resolve, reject) => {
            debugger;
            fetch(new URL("./metadata.json", this.backendurl.toString()))
                .then(response => {
                    if (response.ok) {
                        resolve(response.json());
                    } else {
                        reject();
                    }
                })
                .catch(err => {
                    Utils.failed("加载图像信息文件失败!");
                });
        });
    }

    /**
     *
     * @returns {Promise}
     */
    loadConfig() {
        return new Promise((resolve, reject) => {
            fetch(new URL("./config.json", this.backendurl.toString()))
                .then(response => {
                    if (response.ok) {
                        resolve(response.json());
                    } else {
                        reject();
                    }
                })
                .catch(() => {
                    Utils.failed("加载图像配置文件失败!");
                });
        });
    }
}
