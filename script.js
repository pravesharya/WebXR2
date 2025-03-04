import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { VRButton } from "VRButton";
import { BoxLineGeometry } from "BoxLineGeometry";
import { XRControllerModelFactory } from "XRControllerModelFactory";

console.log(XRControllerModelFactory);

let width = window.innerWidth;
let height = window.innerHeight;

let renderer, scene, camera, lightA, lightD, controls;
const allShapes = new THREE.Group();
let XR, room, C1, C2, controllers, raycaster, workingMatrix, workingVector;

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

  setupOrbitControls();
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

  raycaster = new THREE.Raycaster();
  workingMatrix = new THREE.Matrix4();
  workingVector = new THREE.Vector3();

  // controllers = controllerSetup_Default();
  controllers = controllerSetup_Custom();
  // controllerHandle();
}

function controllerSetup_Default() {
  const controllerModelFactory = new XRControllerModelFactory();
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1),
  ]);
  const line = new THREE.Line(geometry);
  line.name = "line";
  line.scale.z = 0;
  const controllers = [];
  for (let i = 0; i <= 1; i++) {
    const controller = XR.getController(i);
    controller.add(line.clone());
    controller.userData.selectPressed = false;
    scene.add(controller);
    controllers.push(controller);
    const grip = XR.getControllerGrip(i);
    grip.add(controllerModelFactory.createControllerModel(grip));
    scene.add(grip);
  }
  console.log("Controller Built");
  return controllers;
}

function controllerSetup_Custom() {
  C1 = XR.getController(0);
  C2 = XR.getController(1);

  C1.addEventListener('selectstart', controllerHandle);
  C1.addEventListener('selectend', controllerHandle);
  C2.addEventListener('selectstart', controllerHandle);
  C2.addEventListener('selectend', controllerHandle);

  scene.add(C1);
  scene.add(C2);
  console.log(C1);
  console.log(C2);

  const geometry = new THREE.ConeGeometry(0.05, 0.2, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const cone = new THREE.Mesh(geometry, material);
  cone.rotation.x = Math.PI / 2;
  C1.add(cone.clone());
  C2.add(cone.clone());

  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1)
  ]);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const line = new THREE.Line(lineGeometry, lineMaterial);
  line.name = "line";
  line.scale.z = 10; // Length of the line

  C1.add(line.clone());
  C2.add(line.clone());

  console.log("Controller Built");
  return controllers;
}

function controllerHandle() {
  console.log("Controller used");
  const intersected = raycaster.intersectObjects(allShapes.children);
  if (intersected.length > 0) {
    const controller = this;
    const line = controller.getObjectByName("line");
    if (line) {
      line.material.color.set(0x00ff00); // Change color to green on interaction
    }
  } else {
    const controller = this;
    const line = controller.getObjectByName("line");
    if (line) {
      line.material.color.set(0xffffff); // Reset color to white when not interacting
    }
  }
}
controllerHandle();

function setupOrbitControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2;
}

function animateScene() {
  renderer.setAnimationLoop(() => {
    allShapes.rotateY(-0.005);
    // room.rotateY(-0.01);
    // controllerHandle();
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
