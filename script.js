import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { VRButton } from "VRButton";

let width = window.innerWidth;
let height = window.innerHeight;

let renderer, scene, camera, lightA, lightD, controls;
const allShapes = new THREE.Group();
let XR;

let shapes = [
  new THREE.BoxGeometry(0.25, 0.25, 0.25),
  new THREE.SphereGeometry(0.25, 32, 32),
];

function setupScene() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  document.body.appendChild(renderer.domElement);
  renderer.setSize(width, height);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;
  scene.add(camera);

  lightA = new THREE.AmbientLight(0x404040, 25); // soft white light
  scene.add(lightA);

  lightD = new THREE.DirectionalLight(0xffffff, 10);
  // lightD.position.set(10, 1, 1).normalize();
  lightD.position.set(15, 0, -5);
  camera.add(lightD);
  // scene.add(lightD);
  // scene.add(new THREE.CameraHelper(lightD.shadow.camera));

  for (let i = 0; i < 75; i++) {
    let material = new THREE.MeshStandardMaterial({
      // let material = new THREE.MeshBasicMaterial({
      color: Math.random() * 0xffffff,
    });
    let shape = shapes[Math.floor(Math.random() * shapes.length)];
    let mesh = new THREE.Mesh(shape, material);

    mesh.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    );
    mesh.rotation.set(
      Math.random() * 2 * Math.PI,
      Math.random() * 2 * Math.PI,
      Math.random() * 2 * Math.PI
    );

    allShapes.add(mesh);
  }
  scene.add(allShapes);

  setupControls();
  setupSession();
  animateScene();
}
setupScene();

function setupSession(params) {
  renderer.xr.enabled = true;
  document.body.appendChild(VRButton.createButton(renderer));
  XR = renderer.xr;
}

function setupControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2;
}

function animateScene() {
  requestAnimationFrame(animateScene);
  // allShapes.rotateX(-0.01);
  allShapes.rotateY(-0.01);
  // allShapes.rotateZ(0.01);
  renderer.render(scene, camera);
  controls.update();
}

window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
