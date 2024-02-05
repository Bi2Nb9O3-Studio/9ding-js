import * as THREE from "/js/lib/three.module.js";
import { GLTFLoader } from "/js/lib/GLTFLoader.js";
import { PointerLockControls } from "/js/lib/PointerLockControls.js";
import * as CANTOL from "/js/canvasControl.js";
import * as LOGGER from "/js/logging.js";
//Public Variables

// Create a scene
let cpt = new CANTOL.CanvasPainter(1, 20, "/static/img/1/info.json");
const scene = new THREE.Scene();
document.getElementById("loggingta").value = "";

// Create a camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.001,
    10000
);
camera.position.set(3, 2, -0.5);

// Create a renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("maincav"),
});

// Define the boundaries of the space
const spaceBoundaries = {
    minX: 0.35,
    maxX: 16.25,
    minZ: -6.63,
    maxZ: -0.5,
};

//Public Functions ==========================

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


function initializeJoystick(controls) {
    var joystick = document.getElementById('joystick');
    var stick = document.getElementById('stick');
    var originX = joystick.offsetLeft + joystick.offsetWidth / 2;
    var originY = joystick.offsetTop + joystick.offsetHeight / 2;
    var isDragging = false;

    joystick.addEventListener('mousedown', startDrag);
    joystick.addEventListener('touchstart', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);

    function startDrag(event) {
      event.preventDefault();
      isDragging = true;
    }

    function drag(event) {
      if (!isDragging) return;

      var touch = event.type === 'touchmove' ? event.touches[0] : event;
      var x = touch.clientX - originX;
      var y = touch.clientY - originY;
      var distance = Math.sqrt(x * x + y * y);
      var maxDistance = joystick.offsetWidth / 2;

      if (distance > maxDistance) {
        var angle = Math.atan2(y, x);
        x = Math.cos(angle) * maxDistance;
        y = Math.sin(angle) * maxDistance;
      }
      x -= stick.offsetWidth / 2;
      y -= stick.offsetHeight / 2;

      stick.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      controls.moveForward(0.001*(-y));
      controls.moveRight(0.0005*x)
      checkBoundaries()
    }

    function stopDrag(event) {
      if (!isDragging) return;

      stick.style.transform = 'translate(-50%, -50%)';
      isDragging = false;
    }
  }

//Mobile device detection
function isMobileUserAgent() {
    const mobileKeywords = [
        "mobile",
        "android",
        "iphone",
        "ipad",
        "windows phone",
    ];
    const userAgent = navigator.userAgent.toLowerCase();

    for (const keyword of mobileKeywords) {
        if (userAgent.includes(keyword)) {
            return true;
        }
    }

    return false;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

//Utilities
// Function to show camera information
function showCameraInfo() {
    const position = camera.position;
    const rotation = camera.rotation;
    LOGGER.flog(
        "USER",
        `Camera Position: x: ${position.x.toFixed(2)}, y: ${position.y.toFixed(
            2
        )}, z: ${position.z.toFixed(2)}`
    );
    LOGGER.flog(
        "USER",
        `Camera Rotation: x: ${rotation.x.toFixed(2)}, y: ${rotation.y.toFixed(
            2
        )}, z: ${rotation.z.toFixed(2)}`
    );
}

// Function to check if the camera is within the boundaries
function checkBoundaries() {
    // return;
    const position = camera.position;
    if (
        position.x < spaceBoundaries.minX ||
        position.x > spaceBoundaries.maxX ||
        position.z < spaceBoundaries.minZ ||
        position.z > spaceBoundaries.maxZ
    ) {
        // Move the camera back to within the boundaries
        const newX = Math.max(
            spaceBoundaries.minX,
            Math.min(spaceBoundaries.maxX, position.x)
        );
        const newZ = Math.max(
            spaceBoundaries.minZ,
            Math.min(spaceBoundaries.maxZ, position.z)
        );
        camera.position.set(newX, position.y, newZ);
    }
}

function getObjectInsight() {
    const cameraPosition = camera.position;
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    let raycaster = new THREE.Raycaster();
    raycaster.set(cameraPosition, cameraDirection);
    const intersects = raycaster.intersectObjects(scene.children);
    return intersects;
}

window.addEventListener("resize", () => {
    // 重置渲染器宽高比
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 重置相机宽高比
    camera.aspect = window.innerWidth / window.innerHeight;
    // 更新相机投影矩阵
    camera.updateProjectionMatrix();
});

export function onloading(CONFIG) {
    let isMobile = false;
    if (window.innerWidth / window.innerWidth < 1 || isMobileUserAgent()) {
        isMobile = true;
    }

    if (isMobile) {
        document.getElementById("joystick").style.display = "block";
    }
    var controls;
    if (CONFIG.isLoad3DScene) {
        //3D Model Load and display

        renderer.setSize(window.innerWidth, window.innerHeight);

        // Load the GLTF model
        var isFinishModel = 0;
        const loader = new GLTFLoader();
        loader.load(
            "./static/model/model.glb",
            function (gltf) {
                scene.add(gltf.scene);
                LOGGER.flog("Three.js", "Done Fetching model file.");
                document.getElementById("modelloadingtext").innerText = "100%";
                document
                    .getElementById("modelloading")
                    .style.setProperty("--progress", "100%");
                isFinishModel = 1;
                document.getElementById("loadingInfo").innerText =
                    "模型加载完成";
            },
            function (xhr) {
                // 控制台查看加载进度xhr
                // 通过加载进度xhr可以控制前端进度条进度
                const percent = xhr.loaded / xhr.total;
                document.getElementById("modelloadingtext").innerText =
                    (percent * 100).toFixed(4) + "%";
                document
                    .getElementById("modelloading")
                    .style.setProperty(
                        "--progress",
                        (percent * 100).toFixed(4) + "%"
                    );
            },
            function (error) {
                console.error(error);
            }
        );
        //Controls for different Device
        // PC
        // Create controls
        controls = new PointerLockControls(camera, document.body);
        scene.add(controls.getObject());

        // Enable pointer lock
        document.addEventListener("click", function () {
            if (isMobile) return;
            controls.lock();
        });

        // Add event listeners for mouse movement
        document.addEventListener("mousemove", function (event) {
            if (controls.isLocked) {
                const movementX =
                    event.movementX ||
                    event.mozMovementX ||
                    event.webkitMovementX ||
                    0;
                checkBoundaries();
            }
        });

        var keypressed = { KeyW: 0, KeyS: 0, KeyA: 0, KeyD: 0 };

        document.addEventListener("keydown", function (event) {
            if (event.code == "KeyL" || event.code == "KeyJ") {
                switch (event.code) {
                    case "KeyL":
                        showCameraInfo();
                        break;
                    case "KeyJ":
                        console.log(getObjectInsight());
                        break;
                }
            } else if (
                event.code == "KeyW" ||
                event.code == "KeyS" ||
                event.code == "KeyA" ||
                event.code == "KeyD"
            ) {
                keypressed[event.code] = 1;
            }
        });

        document.addEventListener("keyup", (event) => {
            if (
                event.code == "KeyW" ||
                event.code == "KeyS" ||
                event.code == "KeyA" ||
                event.code == "KeyD"
            ) {
                keypressed[event.code] = 0;
            }
        });

        var motionCheck = setInterval(() => {
            if (keypressed.KeyW) {
                controls.moveForward(CONFIG.moveDis);
                checkBoundaries();
            }
            if (keypressed.KeyA) {
                controls.moveRight(-CONFIG.moveDis);
                checkBoundaries();
            }
            if (keypressed.KeyS) {
                controls.moveForward(-CONFIG.moveDis);
                checkBoundaries();
            }
            if (keypressed.KeyD) {
                controls.moveRight(CONFIG.moveDis);
                checkBoundaries();
            }
        }, 10);
        // Add event listeners for keyboard controls
        const moveForward = () => {
            controls.moveForward(1);
            checkBoundaries();
        };

        const moveBackward = () => {
            controls.moveForward(-1);
            checkBoundaries();
        };
        
        //TODO

        //3D Scene Setting
        // Create ambient light
        const ambientLight = new THREE.AmbientLight(0xaaaaaa);
        scene.add(ambientLight);

        // Create directional light
        const directionalLight = new THREE.DirectionalLight(0xffeedd);
        directionalLight.position.set(0, 0, 1);
        scene.add(directionalLight);
        animate(renderer, scene, camera);
    }
    //Canvas
    cpt.loadInfo();
    var loopLoadingScan = setInterval(() => {
        if (
            cpt.isLoadingFinish &&
            (isFinishModel || !CONFIG.isLoad3DScene) &&
            !CONFIG.isStopAtLoadingPage
        ) {
            //Slider
            var lastTouchPosition = { x: 0, y: 0 };
            var rendererElement = renderer.domElement;
            rendererElement.addEventListener(
                "touchstart",
                function (event) {
                    // 获取触摸点的位置
                    var touch = event.touches[0];
                    lastTouchPosition.x = touch.clientX;
                    lastTouchPosition.y = touch.clientY;
                },
                false
            );

            // 监听触摸移动事件
            rendererElement.addEventListener(
                "touchmove",
                function (event) {
                    // 获取触摸点的位置
                    var touch = event.touches[0];

                    // 计算触摸移动的偏移量
                    var deltaX = touch.clientX - lastTouchPosition.x;

                    // 根据偏移量更新摄像机的旋转
                    camera.rotation.y += deltaX * 0.005; // 调整旋转速度

                    // 更新上一次触摸事件的位置
                    lastTouchPosition.x = touch.clientX;
                    lastTouchPosition.y = touch.clientY;
                },
                false
            );
            initializeJoystick(controls);
            $("#loading").fadeOut();
            clearInterval(loopLoadingScan);
            cpt.canvasInitPaint(CONFIG.screens, scene);
            setInterval(() => {
                cpt.canvasRender();
            }, CONFIG.canvasMSPF);
            setInterval(() => {
                cpt.canvasUpdate();
            }, CONFIG.canvasUpdateDelay);
        }
    }, 100);
}
