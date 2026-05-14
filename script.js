import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls';

window.addEventListener("DOMContentLoaded", () => {

  let angleMode = "deg";

  const viewer = document.getElementById("viewer");

  // =========================
  // SCENE
  // =========================
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x303030);

  // =========================
  // CAMERA (Z-UP)
  // =========================
  const camera = new THREE.PerspectiveCamera(
    45,
    viewer.clientWidth / viewer.clientHeight,
    0.1,
    1000
  );

  camera.position.set(6, -6, 6);
  camera.up.set(0, 0, 1);

  // =========================
  // RENDERER
  // =========================
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  viewer.appendChild(renderer.domElement);

  // =========================
  // CONTROLS
  // =========================
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0, 0);
  controls.update();

  // =========================
  // AXES (FLÈCHES + LABELS)
  // =========================
  function createAxisArrow(dir, color, label) {

    const arrow = new THREE.ArrowHelper(
      dir.clone().normalize(),
      new THREE.Vector3(0, 0, 0),
      3,
      color,
      0.4,
      0.25
    );

    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.font = "bold 90px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true })
    );

    sprite.scale.set(0.6, 0.6, 0.6);
    sprite.position.copy(dir.clone().normalize().multiplyScalar(3.3));

    const group = new THREE.Group();
    group.add(arrow);
    group.add(sprite);

    return group;
  }

  scene.add(createAxisArrow(new THREE.Vector3(1, 0, 0), 0xff0000, "X"));
  scene.add(createAxisArrow(new THREE.Vector3(0, 1, 0), 0x00ff00, "Y"));
  scene.add(createAxisArrow(new THREE.Vector3(0, 0, 1), 0x0000ff, "Z"));

// =========================
// ✈️ AIRCRAFT MESH (PROCÉDURAL)
// =========================
function createAircraftMesh() {
  const geometry = new THREE.BufferGeometry();

// =========================
// ✈️ AIRCRAFT MESH (AMÉLIORÉ)
// Repère :
// +X = forward
// +Y = droite
// +Z = haut
// =========================

const vertices = new Float32Array([

  // =====================================================
  // FUSELAGE
  // =====================================================

  // nez
   1.60,  0.00,  0.00,   // 0

  // section avant arrondie
   1.35,  0.16,  0.00,   // 1
   1.35,  0.00,  0.16,   // 2
   1.35, -0.16,  0.00,   // 3
   1.35,  0.00, -0.12,   // 4

  // cockpit / avant cabine
   0.90,  0.24,  0.00,   // 5
   0.90,  0.00,  0.24,   // 6
   0.90, -0.24,  0.00,   // 7
   0.90,  0.00, -0.18,   // 8

  // centre fuselage (plus large)
   0.10,  0.30,  0.00,   // 9
   0.10,  0.00,  0.30,   // 10
   0.10, -0.30,  0.00,   // 11
   0.10,  0.00, -0.22,   // 12

  // arrière cabine
  -0.70,  0.26,  0.00,   // 13
  -0.70,  0.00,  0.24,   // 14
  -0.70, -0.26,  0.00,   // 15
  -0.70,  0.00, -0.18,   // 16

  // début queue
  -1.25,  0.16,  0.00,   // 17
  -1.25,  0.00,  0.14,   // 18
  -1.25, -0.16,  0.00,   // 19
  -1.25,  0.00, -0.10,   // 20

  // pointe queue
  -1.55,  0.00,  0.00,   // 21


  // =====================================================
  // AILE DROITE
  // =====================================================

   0.35,  0.24, -0.02,   // 22 root avant
  -0.40,  0.24, -0.02,   // 23 root arrière

  -0.10,  1.55, -0.04,   // 24 tip avant
  -0.65,  1.45, -0.04,   // 25 tip arrière

   0.60,  0.24, -0.02,   // 26 raccord fuselage


  // =====================================================
  // AILE GAUCHE
  // =====================================================

   0.35, -0.24, -0.02,   // 27
  -0.40, -0.24, -0.02,   // 28

  -0.10, -1.55, -0.04,   // 29
  -0.65, -1.45, -0.04,   // 30

   0.60, -0.24, -0.02,   // 31


  // =====================================================
  // DÉRIVE VERTICALE
  // =====================================================

  -1.05,  0,  0.08,   // 36
  -1.35,  0,  0.08,   // 37

  -1.30,  0,  0.38,   // 38
  -1.45,  0,  0.32,   // 39


  // =====================================================
  // STABILISATEUR DROIT
  // =====================================================

  -1.05,  0.08,  0.03,   // 36
  -1.35,  0.08,  0.03,   // 37

  -1.30,  0.58,  0.03,   // 38
  -1.45,  0.52,  0.03,   // 39


  // =====================================================
  // STABILISATEUR GAUCHE
  // =====================================================

  -1.05, -0.08,  0.03,   // 40
  -1.35, -0.08,  0.03,   // 41

  -1.30, -0.58,  0.03,   // 42
  -1.45, -0.52,  0.03,   // 43


  // =====================================================
  // WINGLETS DROIT
  // =====================================================

  -0.10,  1.55, -0.04,   // 44
  -0.65,  1.45, -0.04,   // 45

  -0.18,  1.62,  0.08,   // 46
  -0.60,  1.52,  0.06,   // 47


  // =====================================================
  // WINGLETS GAUCHE
  // =====================================================

  -0.10, -1.55, -0.04,   // 48
  -0.65, -1.45, -0.04,   // 49

  -0.18, -1.62,  0.08,   // 50
  -0.60, -1.52,  0.06,   // 51

]);


// =========================
// TRIANGLES
// =========================

const indices = [

  // FUSELAGE DESSUS
  0,2,1,  0,3,2,

  1,2,6,  1,6,5,
  2,3,7,  2,7,6,

  5,6,10, 5,10,9,
  6,7,11, 6,11,10,

  9,10,14, 9,14,13,
  10,11,15, 10,15,14,

  13,14,18, 13,18,17,
  14,15,19, 14,19,18,

  17,18,21,
  18,19,21,

  // FUSELAGE DESSOUS
  0,1,4,
  0,4,3,

  1,5,8,
  1,8,4,

  3,4,8,
  3,8,7,

  5,9,12,
  5,12,8,

  7,8,12,
  7,12,11,

  9,13,16,
  9,16,12,

  11,12,16,
  11,16,15,

  13,17,20,
  13,20,16,

  15,16,20,
  15,20,19,

  17,21,20,
  19,20,21,

  // AILE DROITE
  26,22,24,
  22,23,24,
  23,25,24,

  // AILE GAUCHE
  27,31,29,
  28,27,29,
  28,29,30,

  // DÉRIVE
  33,35,34,
  32,34,33,

  // STAB DROIT
  36,37,38,
  37,39,38,

  // STAB GAUCHE
  40,42,41,
  41,42,43,

  // WINGLETS DROIT
  44,46,45,
  45,46,47,

  // WINGLETS GAUCHE
  48,49,50,
  49,51,50,
];

  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshNormalMaterial({ flatShading: true, side: THREE.DoubleSide })
  );

  return mesh;
}

  const plane = createAircraftMesh();
  scene.add(plane);
  plane.quaternion.identity();

  // =========================
  // UTILS
  // =========================
  const get = id =>
    parseFloat(document.getElementById(id).value || 0);

  const set = (id, v) =>
    document.getElementById(id).value = Number(v).toFixed(4);

  const order = () =>
    document.getElementById("rotationOrder").value;

  function toRad(v) {
    return angleMode === "deg" ? v * Math.PI / 180 : v;
  }

  function fromRad(v) {
    return angleMode === "deg" ? v * 180 / Math.PI : v;
  }

  // =========================
  // CONVERSION
  // =========================
  function fromEuler() {

    const e = new THREE.Euler(
      toRad(get("roll")),
      toRad(get("pitch")),
      toRad(get("yaw")),
      order()
    );

    const q = new THREE.Quaternion().setFromEuler(e);

    plane.quaternion.copy(q);

    set("qx", q.x);
    set("qy", q.y);
    set("qz", q.z);
    set("qw", q.w);
  }

  function fromQuat() {

    const q = new THREE.Quaternion(
      get("qx"),
      get("qy"),
      get("qz"),
      get("qw")
    ).normalize();

    const e = new THREE.Euler().setFromQuaternion(q, order());

    set("roll", fromRad(e.x));
    set("pitch", fromRad(e.y));
    set("yaw", fromRad(e.z));

    plane.quaternion.copy(q);
  }

  // =========================
  // LIVE UPDATE
  // =========================
  ["roll","pitch","yaw"].forEach(id =>
    document.getElementById(id).addEventListener("input", fromEuler)
  );

  ["qx","qy","qz","qw"].forEach(id =>
    document.getElementById(id).addEventListener("input", fromQuat)
  );

  document.getElementById("rotationOrder")
    .addEventListener("change", fromQuat);

  document.querySelectorAll('input[name="angleMode"]')
    .forEach(r =>
      r.addEventListener("change", (e) => {
        angleMode = e.target.value;
        fromQuat();
      })
    );

  // =========================
  // RESIZE
  // =========================
  window.addEventListener("resize", () => {

    camera.aspect =
      viewer.clientWidth / viewer.clientHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      viewer.clientWidth,
      viewer.clientHeight
    );
  });

  // =========================
  // LOOP
  // =========================
  function animate() {

    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
  }

  animate();

  // =========================
  // INIT
  // =========================
  fromEuler();

});