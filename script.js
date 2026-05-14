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
    75,
    viewer.clientWidth / viewer.clientHeight,
    0.1,
    1000
  );

  camera.position.set(5, -5, 3);
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

  // vertices (X = latéral, Y = vertical, Z = profondeur / axe fuselage)
  const vertices = new Float32Array([
    // ── FUSELAGE ── (sections octogonales simplifiées : droite, haut, gauche, bas)
    // 0  – pointe du nez
    0, 0, -2.9,
    // 1-4 – section nez
    0.18, 0, -2.4,    0, 0.18, -2.4,    -0.18, 0, -2.4,   0, -0.12, -2.4,
    // 5-8 – avant cabine
    0.28, 0, -1.4,    0, 0.28, -1.4,    -0.28, 0, -1.4,   0, -0.18, -1.4,
    // 9-12 – milieu cabine
    0.30, 0, 0.2,     0, 0.30, 0.2,     -0.30, 0, 0.2,    0, -0.20, 0.2,
    // 13-16 – début queue
    0.22, 0, 1.8,     0, 0.22, 1.8,     -0.22, 0, 1.8,    0, -0.14, 1.8,
    // 17-20 – fin queue
    0.10, 0, 2.8,     0, 0.10, 2.8,     -0.10, 0, 2.8,    0, -0.06, 2.8,
    // 21 – pointe queue
    0, 0.0, 2.85,

    // ── AILE DROITE ──
    0.30, -0.06, -0.6,   // 22 racine avant
    0.30, -0.06,  0.6,   // 23 racine arrière
    2.2,  -0.10,  0.3,   // 24 saumon avant
    2.2,  -0.10,  0.9,   // 25 saumon arrière
    0.30, -0.06, -0.9,   // 26 fuselage bord attaque

    // ── AILE GAUCHE ──
    -0.30, -0.06, -0.6,  // 27
    -0.30, -0.06,  0.6,  // 28
    -2.2,  -0.10,  0.3,  // 29
    -2.2,  -0.10,  0.9,  // 30
    -0.30, -0.06, -0.9,  // 31

    // ── STABILISATEUR HORIZONTAL DROIT ──
    0.22, -0.03, 1.8,    // 36
    0.22, -0.03, 2.4,    // 37
    0.70, -0.05, 2.0,    // 38
    0.70, -0.05, 2.6,    // 39

    // ── STABILISATEUR HORIZONTAL GAUCHE ──
    -0.22, -0.03, 1.8,   // 40
    -0.22, -0.03, 2.4,   // 41
    -0.70, -0.05, 2.0,   // 42
    -0.70, -0.05, 2.6,   // 43

    // ── WINGLETS DROIT ──
    2.2,  -0.10, 0.3,    // 44
    2.2,  -0.10, 0.9,    // 45
    2.35,  0.18, 0.5,    // 46
    2.35,  0.18, 0.85,   // 47

    // ── WINGLETS GAUCHE ──
    -2.2,  -0.10, 0.3,   // 48
    -2.2,  -0.10, 0.9,   // 49
    -2.35,  0.18, 0.5,   // 50
    -2.35,  0.18, 0.85,  // 51
  ]);

  // =================
  // TRIANGLES
  // =================
  const indices = [
    // FUSELAGE DESSUS
    0,2,1,  0,3,2,
    1,2,6,  1,6,5,
    2,3,7,  2,7,6,
    5,6,10, 5,10,9,
    6,7,11, 6,11,10,
    9,10,14,9,14,13,
    10,11,15,10,15,14,
    13,14,18,13,18,17,
    14,15,19,14,19,18,
    17,18,21,18,19,21,

    // FUSELAGE DESSOUS
    0,1,4,  0,4,3,
    1,5,8,  1,8,4,
    3,4,8,  3,8,7,
    5,9,12, 5,12,8,
    7,8,12, 7,12,11,
    9,13,16,9,16,12,
    11,12,16,11,16,15,
    13,17,20,13,20,16,
    15,16,20,15,20,19,
    17,21,20,19,20,21,

    // AILE DROITE
    26,22,24,  22,23,24,  23,25,24,
    24,22,26,  24,23,22,  25,23,24,

    // AILE GAUCHE
    27,31,29,  28,27,29,  28,29,30,
    29,27,31,  29,28,27,  30,29,28,

    // DÉRIVE
    32,35,34,  32,34,33,
    33,34,35,  33,35,32,

    // STABILISATEUR DROIT
    36,37,38,  37,39,38,
    38,37,36,  38,39,37,

    // STABILISATEUR GAUCHE
    40,42,41,  41,42,43,
    41,40,42,  43,42,41,

    // WINGLETS DROIT
    44,46,45,  45,46,47,
    45,44,46,  47,46,45,

    // WINGLETS GAUCHE
    48,49,50,  49,51,50,
    50,49,48,  50,51,49,
  ];

  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshNormalMaterial({ flatShading: true, side: THREE.DoubleSide })
  );

  // 🔻 réduction d'échelle globale
  mesh.scale.set(0.5, 0.5, 0.5);

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