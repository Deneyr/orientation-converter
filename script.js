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

  // vertices (X = latéral, Y = vertical dans ton plan, Z = profondeur)
  const vertices = new Float32Array([
    // =================
    // NEZ (avant)
    // =================
     0.00,  1.90, 0,   // 0 pointe nez
    -0.20,  1.70, 0,   // 1
     0.20,  1.70, 0,   // 2

    // =================
    // FUSELAGE AVANT
    // =================
    -0.25,  1.40, 0,   // 3
     0.25,  1.40, 0,   // 4
    -0.30,  1.10, 0,   // 5
     0.30,  1.10, 0,   // 6

    // =================
    // CENTRE + AILES
    // =================
    -0.35,  0.80, 0,   // 7
     0.35,  0.80, 0,   // 8

    -0.60,  0.40, 0,   // 9  aile gauche intérieure
     0.60,  0.40, 0,   // 10 aile droite intérieure

    -1.40,  0.10, 0,   // 11 bout aile gauche
     1.40,  0.10, 0,   // 12 bout aile droite

    // =================
    // ARRIÈRE FUSELAGE
    // =================
    -0.40, -0.30, 0,   // 13
     0.40, -0.30, 0,   // 14

    -0.25, -0.80, 0,   // 15
     0.25, -0.80, 0,   // 16

    // =================
    // EMPENNAGE (QUEUE)
    // =================
    -0.10, -1.40, 0,   // 17
     0.10, -1.40, 0,   // 18

     0.00, -1.80, 0    // 19 pointe arrière
  ]);

  // =================
  // TRIANGLES
  // =================
  const indices = [

    // NEZ
    0, 1, 2,

    // FUSELAGE AVANT
    1, 3, 2,
    2, 3, 4,
    3, 5, 4,
    4, 5, 6,

    // CENTRE
    5, 7, 6,
    6, 7, 8,

    // AILES
    7, 9, 8,
    8, 9, 10,
    9, 11, 10,
    10, 11, 12,

    // TRANSITION ARRIÈRE
    7, 13, 9,
    8, 10, 14,
    9, 13, 11,
    10, 12, 14,

    // CORPS ARRIÈRE
    13, 15, 14,
    14, 15, 16,

    // EMPENNAGE
    15, 17, 16,
    16, 17, 18,
    17, 18, 19
  ];

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(vertices, 3)
  );

  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return new THREE.Mesh(
    geometry,
    new THREE.MeshNormalMaterial({
      flatShading: true
    })
  );
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