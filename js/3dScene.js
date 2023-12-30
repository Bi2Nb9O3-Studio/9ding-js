import * as THREE from "/js/three.module.js";
import { GLTFLoader } from "/js/GLTFLoader.js";
import { PointerLockControls } from "/js/PointerLockControls.js";
import * as CANTOL from "/js/canvasControl.js";
import * as LOGGER from "/js/logging.js";
//Public Variables

// Create a scene
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
    minX: 0.25,
    maxX: 16.25,
    minZ: -6.63,
    maxZ: -1.23,
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

function fadeOut(elemt, speed) {
    elemt.style.opacity = 1;
    var speed = speed || 16.6; //默认速度为16.6ms
    var num = 20; //累加器
    var timer = setInterval(function () {
        num--;
        elemt.style.opacity = num / 20;
        if (num <= 0) {
            clearInterval(timer);
            elemt.remove();
        }
    }, speed);
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

export function onloading(CONFIG) {
    let isMobile = false;
    if (window.innerWidth / window.innerWidth < 1 || isMobileUserAgent()) {
        isMobile = true;
    }

    if (!isMobile) {
        document.getElementById("left").style.display = "none";
        document.getElementById("right").style.display = "none";
        document.getElementById("forward").style.display = "none";
        document.getElementById("backward").style.display = "none";
    }

    //3D Model Load and display

    renderer.setSize(window.innerWidth, window.innerHeight);

    // Load the GLTF model
    var isFinishModel = 0;
    const loader = new GLTFLoader();
    loader.load(
        "./static/model/model.gltf",
        function (gltf) {
            scene.add(gltf.scene);
            LOGGER.flog("Three.js","Done Fetching model file.");
            document.getElementById("modelloadingtext").innerText = "100%";
            document
                .getElementById("modelloading")
                .style.setProperty("--progress", "100%");
            isFinishModel = 1;
        },
        function (xhr) {},
        function (error) {
            console.error(error);
        }
    );

    //Controls for different Device
    // PC
    // Create controls
    const controls = new PointerLockControls(camera, document.body);
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

    document.addEventListener("keydown", function (event) {
        switch (event.code) {
            case "KeyW":
                moveForward();
                break;
            case "KeyS":
                moveBackward();
                break;
            case "KeyA":
                moveLeft();
                break;
            case "KeyD":
                moveRight();
                break;
            case "KeyL":
                showCameraInfo();
                break;
            case "KeyJ":
                console.log(getObjectInsight());
        }
    });

    // Add event listeners for keyboard controls
    const moveForward = () => {
        controls.moveForward(1);
        checkBoundaries();
    };

    const moveBackward = () => {
        controls.moveForward(-1);
        checkBoundaries();
    };

    const moveLeft = () => {
        controls.moveRight(-1);
        checkBoundaries();
    };

    const moveRight = () => {
        controls.moveRight(1);
        checkBoundaries();
    };

    //Moblie

    document.getElementById("left").onclick = () => {
        camera.rotation.y += 0.35;
    };

    document.getElementById("right").onclick = () => {
        camera.rotation.y -= 0.35;
    };

    document.getElementById("forward").onclick = moveForward;
    document.getElementById("backward").onclick = moveBackward;

    //3D Scene Setting
    // Create ambient light
    const ambientLight = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambientLight);

    // Create directional light
    const directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);
    animate(renderer, scene, camera);
    //Canvas
    let cpt = new CANTOL.CanvasPainter(1, 20, "/static/img/1/info.json");
    cpt.loadImg();
    var loopLoadingScan = setInterval(() => {
        if (cpt.isLoadingFinish && isFinishModel&&!CONFIG.isStopAtLoadingPage) {
            sleep(500);
            fadeOut(document.getElementById("loading"), 16);
            clearInterval(loopLoadingScan);
        }
    }, 100);
}
