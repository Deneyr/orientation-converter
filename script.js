import * as THREE
    from 'https://esm.sh/three@0.160.0';

import { OrbitControls }
    from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls';

// ─────────────────────────────────────────
// SCENE SETUP
// ─────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);

// ─────────────────────────────────────────
// CAMERA  —  Z-up convention (aerospace frame)
// ─────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(
    45,
    viewer.clientWidth / viewer.clientHeight,
    0.1,
    1000
);

camera.position.set(6, -6, 6);
camera.up.set(0, 0, 1);

// ─────────────────────────────────────────
// RENDERER
// ─────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(viewer.clientWidth, viewer.clientHeight);
viewer.appendChild(renderer.domElement);

// ─────────────────────────────────────────
// ORBIT CONTROLS  —  damped mouse interaction
// ─────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);
controls.update();

// ─────────────────────────────────────────
// WORLD AXES  —  arrows + sprite labels (X/Y/Z)
// ─────────────────────────────────────────
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
// ─────────────────────────────────────────
// HELPERS  —  shorthand DOM getters/setters
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
// AIRCRAFT MESH
// ─────────────────────────────────────────

function createAircraftMesh() {
    const geometry = new THREE.BufferGeometry();

    // Body frame convention:
    //   +X = forward (nose)
    //   +Y = right wing
    //   +Z = up

    const vertices = new Float32Array([

        // ── FUSELAGE ──────────────────────────────────────

        // nose tip
        1.60, 0.00, 0.00,   // 0

        // rounded forward section
        1.35, 0.16, 0.00,   // 1
        1.35, 0.00, 0.16,   // 2
        1.35, -0.16, 0.00,   // 3
        1.35, 0.00, -0.12,   // 4

        // cockpit / forward cabin
        0.90, 0.24, 0.00,   // 5
        0.90, 0.00, 0.24,   // 6
        0.90, -0.24, 0.00,   // 7
        0.90, 0.00, -0.18,   // 8

        // mid fuselage (widest section)
        0.10, 0.30, 0.00,   // 9
        0.10, 0.00, 0.30,   // 10
        0.10, -0.30, 0.00,   // 11
        0.10, 0.00, -0.22,   // 12

        // aft cabin
        -0.70, 0.26, 0.00,   // 13
        -0.70, 0.00, 0.24,   // 14
        -0.70, -0.26, 0.00,   // 15
        -0.70, 0.00, -0.18,   // 16

        // tail taper start
        -1.25, 0.16, 0.00,   // 17
        -1.25, 0.00, 0.14,   // 18
        -1.25, -0.16, 0.00,   // 19
        -1.25, 0.00, -0.10,   // 20

        // tail tip
        -1.55, 0.00, 0.00,   // 21


        // ── RIGHT WING ────────────────────────────────────

        0.35, 0.24, -0.02,   // 22 root avant
        -0.40, 0.24, -0.02,   // 23 root arrière

        -0.10, 1.55, -0.04,   // 24 tip avant
        -0.65, 1.45, -0.04,   // 25 tip arrière

        0.60, 0.24, -0.02,   // 26 raccord fuselage


        // ── LEFT WING ─────────────────────────────────────

        0.35, -0.24, -0.02,   // 27
        -0.40, -0.24, -0.02,   // 28

        -0.10, -1.55, -0.04,   // 29
        -0.65, -1.45, -0.04,   // 30

        0.60, -0.24, -0.02,   // 31


        // ── VERTICAL STABILIZER (fin) ─────────────────────

        -1.05, 0, 0.08,   // 36
        -1.35, 0, 0.08,   // 37

        -1.30, 0, 0.38,   // 38
        -1.45, 0, 0.32,   // 39


        // ── RIGHT HORIZONTAL STABILIZER ───────────────────

        -1.05, 0.08, 0.03,   // 36
        -1.35, 0.08, 0.03,   // 37

        -1.30, 0.58, 0.03,   // 38
        -1.45, 0.52, 0.03,   // 39


        // ── LEFT HORIZONTAL STABILIZER ────────────────────

        -1.05, -0.08, 0.03,   // 40
        -1.35, -0.08, 0.03,   // 41

        -1.30, -0.58, 0.03,   // 42
        -1.45, -0.52, 0.03,   // 43


        // ── RIGHT WINGLET ──────────────────────────────────

        -0.10, 1.55, -0.04,   // 44
        -0.65, 1.45, -0.04,   // 45

        -0.18, 1.62, 0.08,   // 46
        -0.60, 1.52, 0.06,   // 47


        // ── LEFT WINGLET ───────────────────────────────────

        -0.10, -1.55, -0.04,   // 48
        -0.65, -1.45, -0.04,   // 49

        -0.18, -1.62, 0.08,   // 50
        -0.60, -1.52, 0.06,   // 51

    ]);


    // ── FACE INDICES (triangles) ──────────────────────

    const indices = [

        // fuselage — top surface
        0, 2, 1, 0, 3, 2,

        1, 2, 6, 1, 6, 5,
        2, 3, 7, 2, 7, 6,

        5, 6, 10, 5, 10, 9,
        6, 7, 11, 6, 11, 10,

        9, 10, 14, 9, 14, 13,
        10, 11, 15, 10, 15, 14,

        13, 14, 18, 13, 18, 17,
        14, 15, 19, 14, 19, 18,

        17, 18, 21,
        18, 19, 21,

        // fuselage — bottom surface
        0, 1, 4,
        0, 4, 3,

        1, 5, 8,
        1, 8, 4,

        3, 4, 8,
        3, 8, 7,

        5, 9, 12,
        5, 12, 8,

        7, 8, 12,
        7, 12, 11,

        9, 13, 16,
        9, 16, 12,

        11, 12, 16,
        11, 16, 15,

        13, 17, 20,
        13, 20, 16,

        15, 16, 20,
        15, 20, 19,

        17, 21, 20,
        19, 20, 21,

        // right wing
        26, 22, 24,
        22, 23, 24,
        23, 25, 24,

        // left wing
        27, 31, 29,
        28, 27, 29,
        28, 29, 30,

        // vertical stabilizer (fin)
        33, 35, 34,
        32, 34, 33,

        // right horizontal stabilizer
        36, 37, 38,
        37, 39, 38,

        // left horizontal stabilizer
        40, 42, 41,
        41, 42, 43,

        // right winglet
        44, 46, 45,
        45, 46, 47,

        // left winglet
        48, 49, 50,
        49, 51, 50,
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

// ─────────────────────────────────────────
// ROTATION VISUALIZATION
// Euler arcs drawn in the intrinsic (body) frame,
// one colored arc per rotation axis in application order.
// ─────────────────────────────────────────

const rotationVizGroup = new THREE.Group();
scene.add(rotationVizGroup);

function createRotationArc(axis, angle, radius, color) {

    const segments = 64;
    const points = [];

    for (let i = 0; i <= segments; i++) {

        const t = angle * (i / segments);

        let p;

        // Arc built in the XY plane, then rotated to face the correct axis
        p = new THREE.Vector3(
            radius * Math.cos(t),
            radius * Math.sin(t),
            0
        );

        points.push(p);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
        color,
        linewidth: 3
    });

    const line = new THREE.Line(geometry, material);

    // Rotate the arc plane to align with the rotation axis
    if (axis === 'X') {
        line.rotation.y = Math.PI / 2;
    }
    else if (axis === 'Y') {
        line.rotation.x = Math.PI / 2;
    }

    return line;
}

function createArcGeometry(radius, angle, segments = 64) {

    const points = [];

    for (let i = 0; i <= segments; i++) {

        const t = angle * (i / segments);

        points.push(
            new THREE.Vector3(
                radius * Math.cos(t),
                radius * Math.sin(t),
                0
            )
        );
    }

    return new THREE.BufferGeometry().setFromPoints(points);
}

function updateRotationVisualization(euler) {

    rotationVizGroup.clear();

    const order = euler.order;

    const angles = {
        X: euler.x,
        Y: euler.y,
        Z: euler.z
    };

    const axisVectors = {
        X: new THREE.Vector3(1, 0, 0),
        Y: new THREE.Vector3(0, 1, 0),
        Z: new THREE.Vector3(0, 0, 1)
    };

    const colors = {
        X: 0xff4444,
        Y: 0x44ff44,
        Z: 0x4488ff
    };

    // Tracks the cumulative rotation applied so far,
    // so each subsequent arc is drawn in the correct rotated frame.

    let cumulativeQuat = new THREE.Quaternion();

    // Initial reference direction for the first arc,
    // chosen as the last axis in the order (outermost rotation).

    let currentDirection =
        axisVectors[order[2]]
            .clone()
            .normalize();

    const radius = 1;

    for (let i = 0; i < order.length; i++) {

        const axisName = order[i];
        const angle = angles[axisName];

        // Intrinsic axis: rotate the world axis by the cumulative quaternion
        // so each arc follows the body frame, not the world frame.

        const axis =
            axisVectors[axisName]
                .clone()
                .applyQuaternion(cumulativeQuat)
                .normalize();

        // Compute an in-plane reference vector perpendicular to the rotation axis,
        // used as the starting direction for arc sampling.

        let u = currentDirection.clone();

        // For the last arc, use the direction from the previous rotation step
        // to keep the arc visually connected.
        if (i === order.length - 1) {

            u =
                axisVectors[order[i - 1]]
                    .clone()
                    .applyQuaternion(cumulativeQuat);
        }

        u.normalize();

        const v =
            new THREE.Vector3()
                .crossVectors(axis, u)
                .normalize();

        // Arc parameters: last arc is inset and offset along the reference direction
        // to visually separate it from the second arc.

        let offset = new THREE.Vector3();
        let realRadius = radius;

        if (i === order.length - 1) {

            offset =
                currentDirection
                    .clone()
                    .setLength(radius);

            realRadius = radius * 0.75;
        }

        // Sample arc points in the plane spanned by (u, v),
        // centered at offset from the world origin.

        const points = [];

        const segments = 64;

        for (let s = 0; s <= segments; s++) {

            const t = angle * (s / segments);

            const p =
                u.clone()
                    .multiplyScalar(Math.cos(t) * realRadius)
                    .add(
                        v.clone()
                            .multiplyScalar(Math.sin(t) * realRadius)
                    )
                    .add(offset);

            points.push(p);
        }

        // Build and add the arc line to the scene.

        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints(points);

        const material =
            new THREE.LineBasicMaterial({
                color: colors[axisName]
            });

        const arc =
            new THREE.Line(geometry, material);

        rotationVizGroup.add(arc);

        // Start tick — small cross mark at the arc origin

        const startPoint = points[0];

        const startDir =
            startPoint.clone()
                .sub(offset)
                .normalize();

        // Slight offset along the axis to avoid z-fighting
        // when the first arc overlaps with the world axis line.

        let tickOffset = new THREE.Vector3();

        if (i === 0) {

            tickOffset =
                axis.clone()
                    .multiplyScalar(0.00015);
        }

        const startTickPoints = [

            startPoint.clone()
                .add(tickOffset)
                .add(
                    startDir.clone()
                        .multiplyScalar(-0.08)
                ),

            startPoint.clone()
                .add(tickOffset)
                .add(
                    startDir.clone()
                        .multiplyScalar(0.08)
                )
        ];

        const startTickGeometry =
            new THREE.BufferGeometry()
                .setFromPoints(startTickPoints);

        const startTick =
            new THREE.Line(
                startTickGeometry,
                new THREE.LineBasicMaterial({
                    color: colors[axisName]
                })
            );

        rotationVizGroup.add(startTick);

        // End arrow — tangent direction at the tip of the arc

        const endPoint = points[points.length - 1];

        // tangente dans le sens du mouvement
        const tangent =
            v.clone()
                .multiplyScalar(Math.cos(angle))
                .sub(
                    u.clone()
                        .multiplyScalar(Math.sin(angle))
                )
                .normalize();

        // Arrow head size is signed so the chevron points
        // in the correct direction for both positive and negative angles.

        let arrowLength = 0.16 * Math.sign(angle);
        let arrowWidth = 0.05 * Math.sign(angle);

        const arrowHead1 =
            endPoint.clone()
                .add(
                    tangent.clone()
                        .multiplyScalar(-arrowLength)
                )
                .add(
                    axis.clone()
                        .multiplyScalar(arrowWidth)
                );

        const arrowHead2 =
            endPoint.clone()
                .add(
                    tangent.clone()
                        .multiplyScalar(-arrowLength)
                )
                .add(
                    axis.clone()
                        .multiplyScalar(-arrowWidth)
                );

        const arrowGeometry1 =
            new THREE.BufferGeometry()
                .setFromPoints([
                    endPoint,
                    arrowHead1
                ]);

        const arrowGeometry2 =
            new THREE.BufferGeometry()
                .setFromPoints([
                    endPoint,
                    arrowHead2
                ]);

        const arrow1 =
            new THREE.Line(
                arrowGeometry1,
                new THREE.LineBasicMaterial({
                    color: colors[axisName]
                })
            );

        const arrow2 =
            new THREE.Line(
                arrowGeometry2,
                new THREE.LineBasicMaterial({
                    color: colors[axisName]
                })
            );

        rotationVizGroup.add(arrow1);
        rotationVizGroup.add(arrow2);

        // Rotate the reference direction by this step's angle,
        // ready for the next arc in the sequence.

        currentDirection =
            u.clone()
                .applyAxisAngle(axis, angle);

        // Accumulate the rotation quaternion (pre-multiply = intrinsic order).

        const q = new THREE.Quaternion();

        q.setFromAxisAngle(axis, angle);

        cumulativeQuat.premultiply(q);
    }
}

// ─────────────────────────────────────────
// UI — input type switching & order hint
// ─────────────────────────────────────────

const inputType = document.getElementById("inputType");
const orderSelect = document.getElementById("order");
const orderHint = document.getElementById("orderHint");

function updateOrderHint() {

    const order = orderSelect.value;

    orderHint.textContent =
        `Intrinsic order (${order[0].toLowerCase()} ${order[1].toLowerCase()}' ${order[2].toLowerCase()}'')`;

    // sync order tags displayed in output panel

}

function refreshUI() {
    const v = inputType.value;
    document.getElementById("eulerInputFields").style.display = v === "euler" ? "block" : "none";
    document.getElementById("quatInputFields").style.display = v === "quaternion" ? "block" : "none";
    document.getElementById("aaInputFields").style.display = v === "axisangle" ? "block" : "none";
    document.getElementById("matInputFields").style.display = v === "matrix" ? "block" : "none";
}

inputType.addEventListener("change", refreshUI);
orderSelect.addEventListener("change", () => { updateOrderHint(); convert(); });

refreshUI();
updateOrderHint();

// ─────────────────────────────────────────
// OUTPUT — Euler display (recomputed from cached quaternion)
// Recalculates Euler angles in the selected output order
// without re-running the full conversion pipeline.
// ─────────────────────────────────────────

function updateEulerOutput(euler) {
    if (!euler) return;
    const outOrder = document.getElementById("outOrder").value;
    // Re-derive euler in the requested output order from the cached quaternion
    const e = _lastQuat
        ? new THREE.Euler().setFromQuaternion(_lastQuat, outOrder)
        : new THREE.Euler(euler.x, euler.y, euler.z, outOrder);
    const unit = document.querySelector('input[name="outAngleUnit"]:checked').value;
    const isDeg = unit === "deg";
    const fx = isDeg ? e.x * 180 / Math.PI : e.x;
    const fy = isDeg ? e.y * 180 / Math.PI : e.y;
    const fz = isDeg ? e.z * 180 / Math.PI : e.z;
    const dec = isDeg ? 4 : 6;
    document.getElementById("outEulerX").value = fx.toFixed(dec);
    document.getElementById("outEulerY").value = fy.toFixed(dec);
    document.getElementById("outEulerZ").value = fz.toFixed(dec);
}

let _lastEuler = null;
let _lastQuat = null;

function updateAxisAngleOutput() {
    if (!_lastQuat) return;
    const q = _lastQuat;
    // clamp w to [-1,1] to avoid NaN in acos
    const w = Math.max(-1, Math.min(1, q.w));
    const angle = 2 * Math.acos(w);
    const s = Math.sqrt(1 - w * w);
    let ax, ay, az;
    if (s < 0.0001) {
        // angle near 0 or 2π — axis is arbitrary
        ax = 1; ay = 0; az = 0;
    } else {
        ax = q.x / s;
        ay = q.y / s;
        az = q.z / s;
    }
    const unit = document.querySelector('input[name="outAngleUnitAA"]:checked').value;
    const theta = unit === "deg" ? angle * 180 / Math.PI : angle;
    const dec = unit === "deg" ? 4 : 6;
    document.getElementById("outAx").value = ax.toFixed(6);
    document.getElementById("outAy").value = ay.toFixed(6);
    document.getElementById("outAz").value = az.toFixed(6);
    document.getElementById("outAngle").value = theta.toFixed(dec);
}

// ─────────────────────────────────────────
// CONVERT — main entry point
// Reads the active input type, builds a quaternion,
// then populates all output representations.
// ─────────────────────────────────────────

function convert() {

    let quaternion;
    let euler;

    if (inputType.value === "euler") {

        const ex = parseFloat(document.getElementById("ex").value);
        const ey = parseFloat(document.getElementById("ey").value);
        const ez = parseFloat(document.getElementById("ez").value);
        const unit = document.querySelector('input[name="angleUnit"]:checked').value;
        const factor = unit === "deg" ? Math.PI / 180 : 1;

        euler = new THREE.Euler(ex * factor, ey * factor, ez * factor, orderSelect.value);
        quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(euler);
    }

    else if (inputType.value === "quaternion") {

        quaternion = new THREE.Quaternion(
            parseFloat(document.getElementById("qx").value),
            parseFloat(document.getElementById("qy").value),
            parseFloat(document.getElementById("qz").value),
            parseFloat(document.getElementById("qw").value)
        ).normalize();
        euler = new THREE.Euler();
        euler.setFromQuaternion(quaternion, orderSelect.value);
    }

    else if (inputType.value === "axisangle") {

        let ax = parseFloat(document.getElementById("inAx").value) || 0;
        let ay = parseFloat(document.getElementById("inAy").value) || 0;
        let az = parseFloat(document.getElementById("inAz").value) || 0;
        let theta = parseFloat(document.getElementById("inAngle").value) || 0;
        const unitAA = document.querySelector('input[name="inAngleUnitAA"]:checked').value;
        if (unitAA === "deg") theta = theta * Math.PI / 180;

        // normalize axis
        const len = Math.sqrt(ax * ax + ay * ay + az * az);
        if (len > 0.0001) { ax /= len; ay /= len; az /= len; }
        else { ax = 1; ay = 0; az = 0; }

        const axis = new THREE.Vector3(ax, ay, az);
        quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(axis, theta);
        euler = new THREE.Euler();
        euler.setFromQuaternion(quaternion, orderSelect.value);
    }

    else { // matrix

        const m4 = new THREE.Matrix4();
        // setFromMatrix expects column-major flat array (THREE.js convention)
        // user inputs row-major visually → [m00,m01,m02, m10,m11,m12, m20,m21,m22]
        const r = (id) => parseFloat(document.getElementById(id).value) || 0;
        m4.set(
            r("im00"), r("im01"), r("im02"), 0,
            r("im10"), r("im11"), r("im12"), 0,
            r("im20"), r("im21"), r("im22"), 0,
            0, 0, 0, 1
        );
        quaternion = new THREE.Quaternion();
        quaternion.setFromRotationMatrix(m4);
        quaternion.normalize();
        euler = new THREE.Euler();
        euler.setFromQuaternion(quaternion, orderSelect.value);
    }

    plane.quaternion.copy(quaternion);

    _lastEuler = euler;
    _lastQuat = quaternion.clone();

    // Visualize using the OUTPUT euler order so arcs match what's displayed
    const outOrder = document.getElementById("outOrder").value;
    const eulerForViz = new THREE.Euler().setFromQuaternion(quaternion, outOrder);
    updateRotationVisualization(eulerForViz);

    // ── Quaternion output ─────────────────────────────
    document.getElementById("outQx").value = quaternion.x.toFixed(6);
    document.getElementById("outQy").value = quaternion.y.toFixed(6);
    document.getElementById("outQz").value = quaternion.z.toFixed(6);
    document.getElementById("outQw").value = quaternion.w.toFixed(6);

    // ── Euler output (order + unit driven by output panel) ─
    updateEulerOutput(euler);

    // ── Axis-Angle output ─────────────────────────────
    updateAxisAngleOutput();

    // ── Rotation matrix  (column-major → row-major display) ─
    const m = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
    const e = m.elements; // column-major in THREE.js
    document.getElementById("m00").value = e[0].toFixed(4);
    document.getElementById("m01").value = e[4].toFixed(4);
    document.getElementById("m02").value = e[8].toFixed(4);
    document.getElementById("m10").value = e[1].toFixed(4);
    document.getElementById("m11").value = e[5].toFixed(4);
    document.getElementById("m12").value = e[9].toFixed(4);
    document.getElementById("m20").value = e[2].toFixed(4);
    document.getElementById("m21").value = e[6].toFixed(4);
    document.getElementById("m22").value = e[10].toFixed(4);
}

document
    .getElementById("convertBtn")
    .addEventListener("click", convert);

document.querySelectorAll('input[name="outAngleUnit"]').forEach(r => {
    r.addEventListener("change", () => updateEulerOutput(_lastEuler));
});

document.getElementById("outOrder").addEventListener("change", () => {
    updateEulerOutput(_lastEuler);
    if (_lastQuat) {
        const outOrder = document.getElementById("outOrder").value;
        const eulerForViz = new THREE.Euler().setFromQuaternion(_lastQuat, outOrder);
        updateRotationVisualization(eulerForViz);
    }
});

document.querySelectorAll('input[name="outAngleUnitAA"]').forEach(r => {
    r.addEventListener("change", () => updateAxisAngleOutput());
});

document
    .getElementById("monForm")
    .addEventListener("submit", function (e) {
        e.preventDefault(); // empêche le refresh
        convert();
    });

// ─────────────────────────────────────────
// RESPONSIVE RESIZE  —  keep viewer filling its container
// ─────────────────────────────────────────

window.addEventListener("resize", () => {

    camera.aspect =
        viewer.clientWidth / viewer.clientHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        viewer.clientWidth,
        viewer.clientHeight
    );
});

// ─────────────────────────────────────────
// RENDER LOOP
// ─────────────────────────────────────────
function animate() {

    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
}

animate();

convert();