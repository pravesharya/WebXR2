import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { VRButton } from "VRButton";
import { BoxLineGeometry } from "BoxLineGeometry";

let width = window.innerWidth;
let height = window.innerHeight;

let renderer, scene, camera, lightA, lightD, controls;
const allShapes = new THREE.Group();
let XR, room;

let shapes = [
  new THREE.BoxGeometry(0.05, 0.05, 0.05),
  new THREE.SphereGeometry(0.05, 32, 32),
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
  lightD.position.set(15, 0, -5);
  camera.add(lightD);

  room = new THREE.LineSegments(
    new BoxLineGeometry(6, 6, 6, 3, 3, 3),
    new THREE.LineBasicMaterial({ color: 0x808080 })
  );
  scene.add(room);

  for (let i = 0; i < 75; i++) {
    let material = new THREE.MeshLambertMaterial({
      color: Math.random() * 0xffffff,
    });
    let shape = shapes[Math.floor(Math.random() * shapes.length)];
    let mesh = new THREE.Mesh(shape, material);

    mesh.position.set(
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5
    );
    mesh.rotation.set(
      Math.random() * 2 * Math.PI,
      Math.random() * 2 * Math.PI,
      Math.random() * 2 * Math.PI
    );

    allShapes.add(mesh);
  }

  scene.add(allShapes);
  // room.add(allShapes);

  setupControls();
  setupXR();
  animateScene();
}
setupScene();

function setupXR() {
  renderer.xr.enabled = true;
  document.body.appendChild(VRButton.createButton(renderer));
  XR = renderer.xr;

  XR.addEventListener("sessionstart", () => {
    controls.enabled = false; // Disable OrbitControls in VR
  });

  XR.addEventListener("sessionend", () => {
    controls.enabled = true; // Enable OrbitControls when exiting VR
  });
}

function setupControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2;
}

function animateScene() {
  renderer.setAnimationLoop(() => {
    allShapes.rotateY(-0.01);
    // room.rotateY(-0.01);
    renderer.render(scene, camera);
    controls.update();
  });
}

window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
