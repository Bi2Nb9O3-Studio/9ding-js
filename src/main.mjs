import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import * as THREE from "three";
import Utils from "./utils.mjs";
import Stats from "three/addons/libs/stats.module.js";
import { _Config } from "./config.mjs";
import ImageHandler from "./handlers/image_handler.mjs";

/** Class represents a exhibition. */
class $Exhibition {
    /**
     *
     * 创建一个展馆实例
     * @param {string} configURL
     * @constructor
     */

    constructor(configURL) {
        this.config = new _Config(configURL);
        this.status = {
            model: 0,
            pics: 0
        };
        this.isMobile = false;
        this.$animate = () => {
            this.renderer.render(this.scene, this.camera);
            this.stats.update();
            requestAnimationFrame(this.$animate);
        };
        this.keypressed;
        this.handlers = [];
    }

    /**
     * 初始化
     */

    init() {
        this.$nsba();
        this.isMobile = this.$isMobileUserAgent() || window.innerWidth / window.innerWidth < 1;
        this.config
            .loadConfig()
            .then(config => {
                Utils.success("加载配置文件成功!");
                this.config.initConfig(config);
                this.loadScence()
                    .then(_ => {
                        this.$startAnimate();
                        this.$startMotionCheck();
                        this.config.getValue("handlers").forEach(element => {
                            switch (element.type) {
                                case "image":
                                    this.handlers.push(new ImageHandler(element.backendurl, this));
                                    break;

                                default:
                                    break;
                            }
                        });
                        this.handlers.forEach(element => {
                            element.init();
                        });
                        // console.log("加载场景成功!");
                    })
                    .catch(error => {
                        Utils.failed("加载场景失败! " + error);
                        // console.log(this.config.config);
                        throw error;
                    });
            })
            .catch(error => {
                Utils.failed("加载配置文件失败!");
            });
    }

    /**
     * 开始检测按键输入输出
     */
    $startMotionCheck() {
        this.keypressed = { KeyW: 0, KeyS: 0, KeyA: 0, KeyD: 0 };
        let that = this;
        document.addEventListener("keydown", function (event) {
            if (event.code == "KeyW" || event.code == "KeyS" || event.code == "KeyA" || event.code == "KeyD") {
                that.keypressed[event.code] = 1;
            }
        });

        document.addEventListener("keyup", event => {
            if (event.code == "KeyW" || event.code == "KeyS" || event.code == "KeyA" || event.code == "KeyD") {
                that.keypressed[event.code] = 0;
            }
        });

        this.movdis = this.config.getValue("moveDistance");

        this.motionCheck = setInterval(() => {
            if (this.keypressed.KeyW) {
                that.controls.moveForward(this.movdis);
                that.$checkBoundaries();
            }
            if (this.keypressed.KeyA) {
                that.controls.moveRight(-this.movdis);
                that.$checkBoundaries();
            }
            if (this.keypressed.KeyS) {
                that.controls.moveForward(-this.movdis);
                that.$checkBoundaries();
            }
            if (this.keypressed.KeyD) {
                that.controls.moveRight(this.movdis);
                that.$checkBoundaries();
            }
        }, 10);
    }

    /**
     * 检查是否是移动端用户代理
     * @returns {boolean}
     * @private
     */
    $isMobileUserAgent() {
        const mobileKeywords = ["mobile", "android", "iphone", "ipad", "windows phone"];
        const userAgent = navigator.userAgent.toLowerCase();

        for (const keyword of mobileKeywords) {
            if (userAgent.includes(keyword)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 检查浏览器是否支持
     *
     * @param {string|null} alertHTML - 警告HTML
     * @returns {void}
     */
    $nsba(alertHTML = null) {
        if (alertHTML == null) {
            alertHTML =
                '<html><head><title>浏览器版本过低!</title><style>body{background-color:#87CEFA;font-family:Arial,sans-serif;margin:0;padding:0}.container{background-color:#fff;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.2);max-width:600px;margin:50px auto;padding:20px}h1{color:#333}p{color:#555}ul{list-style-type:none;padding:0}li{margin-bottom:10px}a{color:#007BFF;text-decoration:none}a:hover{text-decoration:underline}</style><meta charset="UTF-8"></head><body><div class="container"><h1>抱歉，您的浏览器版本过低！</h1><p>我们推荐您使用Firefox网络浏览器, 以获得更好的浏览体验和更高的安全性。</p><p>推荐使用以下浏览器：</p><ul><li>Google Chrome:<a href="https://www.google.cn/chrome/">下载链接</a></li><li>Firefox:<a href="https://www.mozilla.org/zh-CN/firefox">下载链接</a></li><!--在这里可以添加其他浏览器的下载链接--></ul></div></body></html>';
        }

        const show = () => {
            document.getElementsByTagName("html")[0].innerHTML = alertHTML;
        };
        function checkBrowserVersion(userAgent, browserRegex, versionRegex, minimumVersion, message) {
            const browserMatch = userAgent.match(browserRegex);
            if (browserMatch) {
                const versionMatch = userAgent.match(versionRegex);
                if (versionMatch && versionMatch[1]) {
                    const version = parseInt(versionMatch[1], 10);
                    console.log(message + " " + version);
                    if (isNaN(version) || version < minimumVersion) {
                        show();
                    }
                }
            }
        }

        const userAgent = navigator.userAgent;

        // IE 和其他不支持的浏览器
        if (/MSIE|Trident|Opera Mini/.test(userAgent)) {
            console.log("Is Opera Mini||IE. Skipped");
            // show() 或其他处理逻辑
        }

        // Chrome
        checkBrowserVersion(userAgent, /Chrom(e|ium)\/(\d+)/, /Chrom(e|ium)\/(\d+)/, 51, "Is Chrome");

        // Firefox
        checkBrowserVersion(userAgent, /Firefox\/(\d+)/, /Firefox\/(\d+)/, 54, "Is Firefox");

        // Safari
        checkBrowserVersion(
            userAgent,
            /Version\/(\d+(\.\d+)?).*Safari/,
            /Version\/(\d+(\.\d+)?).*Safari/,
            10,
            "Is Safari"
        ); // 注意：Safari的版本号可能包含在"Version/"中

        // Edge
        checkBrowserVersion(userAgent, /Edg\/(\d+)/, /Edg\/(\d+)/, 79, "Is Edge");

        // Opera
        checkBrowserVersion(userAgent, /OPR\/(\d+)/, /OPR\/(\d+)/, 38, "Is Opera");
    }

    /**
     * 加载场景
     * @async
     * @returns Promise<error|null>
     */
    loadScence() {
        return new Promise((resolve, reject) => {
            try {
                this.scene = new THREE.Scene();
                this.divEle = document.getElementById(this.config.getValue("divElementID"));
                this.canvasElement = document.createElement("canvas");
                this.canvasElement.style.width = "100%";
                this.canvasElement.style.height = "100%";
                // this.canvasElement.style.margin = "0";
                this.divEle.appendChild(this.canvasElement);
                this.camera = new THREE.PerspectiveCamera(
                    this.config.getValue("camera")["FOV"],
                    this.canvasElement.clientWidth / this.canvasElement.clientHeight,
                    this.config.getValue("camera")["near"],
                    this.config.getValue("camera")["far"]
                );
                this.camera.position.set(
                    this.config.getValue("camera")["position"]["x"],
                    this.config.getValue("camera")["position"]["y"],
                    this.config.getValue("camera")["position"]["z"]
                );
                this.renderer = new THREE.WebGLRenderer({
                    canvas: this.canvasElement,
                    antialias: true
                });
                this.spaceBounares = {
                    minX: this.config.getValue("spaceBoundaries")["minX"],
                    maxX: this.config.getValue("spaceBoundaries")["maxX"],
                    minY: this.config.getValue("spaceBoundaries")["minY"],
                    maxY: this.config.getValue("spaceBoundaries")["maxY"]
                };
                this.renderer.setSize(this.canvasElement.clientWidth, this.canvasElement.clientHeight);

                this.$loadModelGLTF(this.config.getValue("modelURL"), _ => {
                    Utils.success("加载模型文件成功!");
                });

                this.controls = new PointerLockControls(this.camera, this.canvasElement);

                this.scene.add(this.controls.object);

                this.canvasElement.addEventListener("click", () => {
                    if (this.isMobile) return;
                    this.controls.lock();
                    //TODO api point
                });

                this.canvasElement.addEventListener("mousemove", event => {
                    if (this.controls.isLocked === false) return;
                    this.$checkBoundaries();
                });

                this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
                var directLigt = new THREE.DirectionalLight(0xffffff, 0.5);
                directLigt.position.set(0, 100, 0);
                this.scene.add(directLigt);
                this.stats = new Stats();
                this.divEle.appendChild(this.stats.domElement);
                resolve(null);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 加载GLTF模型
     * @param {string} modelURL
     * @param {function} finish
     * @param {function} progress
     * @param {function} error
     * @async
     * @private
     */
    $loadModelGLTF(modelURL, finish, progress, error) {
        const loader = new GLTFLoader();
        let self = this;
        finish = finish || function (_) {};
        progress = progress || function (_) {};
        error = error || function (_) {};
        loader.load(
            modelURL,
            gltf => {
                self.scene.add(gltf.scene);
                self.status["model"] = 1;
                finish(gltf);
            },
            xhr => {
                progress(xhr);
            },
            _error => {
                error(_error);
            }
        );
    }

    /**
     * 移动时边界检测
     * @private
     */
    $checkBoundaries() {
        const position = this.camera.position;
        if (
            position.x < this.config.getValue("spaceBoundaries").minX ||
            position.x > this.config.getValue("spaceBoundaries").maxX ||
            position.z < this.config.getValue("spaceBoundaries").minZ ||
            position.z > this.config.getValue("spaceBoundaries").maxZ
        ) {
            const newX = Math.max(
                this.config.getValue("spaceBoundaries").minX,
                Math.min(this.config.getValue("spaceBoundaries").maxX, position.x)
            );
            const newZ = Math.max(
                this.config.getValue("spaceBoundaries").minZ,
                Math.min(this.config.getValue("spaceBoundaries").maxZ, position.z)
            );
            this.camera.position.set(newX, position.y, newZ);
        }
    }

    $startAnimate() {
        this.$animate();
    }
}

export { $Exhibition };
