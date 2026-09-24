import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FLAVORS } from './data.js';
import { openPanel } from './panel.js';

/* -------------------------------------------------------------------------
   CRUSH hero — a dark, spotlit, infinite carousel of the 5 real cans.
   Drag left/right (or use the arrows / progress bar) to glide between
   flavors — it loops forever, there's no first/last dead end. Click the
   centered, in-focus can to open its detail panel.
------------------------------------------------------------------------- */

const N = FLAVORS.length;
const canvas = document.getElementById('heroCanvas');
const heroSection = document.getElementById('hero');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
// Looking down at a real angle (instead of nearly straight-on) so the
// puddle under each can reads as an ellipse instead of a foreshortened
// sliver, and so the can bases don't catch edge-on specular streaks.
const LOOK_AT = new THREE.Vector3(0, -1.30, 0);
camera.position.set(0, 1.55, 11.8);
camera.lookAt(LOOK_AT);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.6;

const key = new THREE.SpotLight(0xffffff, 230, 34, Math.PI/6, 0.85, 1.1);
key.position.set(0, 5.5, 4);
key.target.position.copy(LOOK_AT);
scene.add(key, key.target);

const rim = new THREE.DirectionalLight(0x9fb8ff, 0.9);
rim.position.set(-5, 2, -4);
scene.add(rim);

const fillLight = new THREE.AmbientLight(0x404050, 0.35);
scene.add(fillLight);

/* ---------------- No helper plane / no puddle geometry ----------------
   The Blender Plane is removed after load and we intentionally add NO flat
   mesh underneath the cans. This guarantees there is nothing that can rotate
   with the carousel and appear as a white/grey wedge sticking out.
------------------------------------------------------------------------- */

/* ---------------- Condensation ON the can ----------------
   The exported Blender Plane is only a 4-vertex sheet, so it cannot itself
   become hundreds of rounded droplets. We use that Plane as the SOURCE water
   object/material, remove the sheet, and replace it with instanced 3D beads.

   IMPORTANT: the cans in these GLBs are rotated inside a node named "can".
   Droplets are parented to that same node, in the can's LOCAL coordinates.
   This makes every bead hug the aluminium and rotate/tilt exactly with it.
------------------------------------------------------------------------- */
const DROPLET_COUNT = 520;
const dropletGeometry = new THREE.SphereGeometry(1, 12, 10);

function makeDropletMaterial(sourceWaterMaterial){
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.045,
    transmission: 0.12,
    thickness: 0.035,
    ior: 1.333,
    transparent: true,
    opacity: 0.94,
    depthWrite: false,
    envMapIntensity: 3.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.015
  });

  // If Blender's Plane carried a water normal/roughness map, reuse it on the
  // droplets. We do NOT reuse the plane geometry itself.
  if (sourceWaterMaterial) {
    if (sourceWaterMaterial.normalMap) mat.normalMap = sourceWaterMaterial.normalMap;
    if (sourceWaterMaterial.roughnessMap) mat.roughnessMap = sourceWaterMaterial.roughnessMap;
    if (sourceWaterMaterial.envMapIntensity !== undefined) {
      mat.envMapIntensity = Math.max(2.5, sourceWaterMaterial.envMapIntensity || 0);
    }
  }
  return mat;
}

function seededRandom(seed){
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function addCondensationToCan(canNode, sourceWaterMaterial, seed){
  // Geometry in your exported can files is approximately radius 1, with the
  // body running from y=-1.96 to y=0.96 in the LOCAL space of the "can" node.
  // Calculate it from the child mesh geometry so this stays correct if you
  // update the GLB later.
  const localBox = new THREE.Box3();
  let hasGeometry = false;

  canNode.updateMatrixWorld(true);
  canNode.traverse(o => {
    if (!o.isMesh || !o.geometry || o.name === 'Plane') return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    if (!o.geometry.boundingBox) return;

    // Meshes currently have identity local transforms under the "can" node,
    // but applying matrix keeps this safe if that changes later.
    const b = o.geometry.boundingBox.clone();
    if (o !== canNode) b.applyMatrix4(o.matrix);
    localBox.union(b);
    hasGeometry = true;
  });

  if (!hasGeometry) return null;

  const size = new THREE.Vector3();
  localBox.getSize(size);
  const center = new THREE.Vector3();
  localBox.getCenter(center);

  // The can is circular in X/Z. Slightly outside the metal surface prevents
  // z-fighting while still reading as physically attached water.
  const radiusX = size.x * 0.503;
  const radiusZ = size.z * 0.503;
  const minY = localBox.min.y + size.y * 0.055;
  const maxY = localBox.max.y - size.y * 0.06;
  const rand = seededRandom(seed);

  const droplets = new THREE.InstancedMesh(
    dropletGeometry,
    makeDropletMaterial(sourceWaterMaterial),
    DROPLET_COUNT
  );
  droplets.name = 'Condensation_ON_Can';
  droplets.frustumCulled = false;
  droplets.renderOrder = 4;

  const dummy = new THREE.Object3D();
  for (let n = 0; n < DROPLET_COUNT; n++) {
    const theta = rand() * Math.PI * 2;

    // Slightly denser in the lower/middle body, like a cold can coming out of
    // a fridge, but still covers the whole label.
    const lowerBias = rand() < 0.66;
    const yT = lowerBias ? Math.pow(rand(), 0.78) : rand();
    const y = THREE.MathUtils.lerp(minY, maxY, yT);

    const nx = Math.sin(theta);
    const nz = Math.cos(theta);
    const x = center.x + nx * radiusX;
    const z = center.z + nz * radiusZ;

    // Lots of pinhead beads + occasional fat beads + a few vertical runs.
    const r = rand();
    const streak = r > 0.965;
    const big = !streak && r > 0.84;
    const base = streak ? THREE.MathUtils.lerp(0.020, 0.031, rand())
      : big ? THREE.MathUtils.lerp(0.018, 0.034, rand())
      : THREE.MathUtils.lerp(0.0065, 0.018, rand());

    // Sphere is flattened INTO the can along its radial normal so it looks
    // like a bead stuck to metal rather than a floating bubble.
    dummy.position.set(x, y, z);
    dummy.rotation.set(0, theta, (rand() - 0.5) * 0.18);
    dummy.scale.set(
      base * THREE.MathUtils.lerp(0.80, 1.15, rand()),
      base * (streak ? THREE.MathUtils.lerp(2.3, 4.5, rand()) : THREE.MathUtils.lerp(0.85, 1.35, rand())),
      base * THREE.MathUtils.lerp(0.35, 0.52, rand())
    );
    dummy.updateMatrix();
    droplets.setMatrixAt(n, dummy.matrix);
  }

  droplets.instanceMatrix.needsUpdate = true;
  canNode.add(droplets);
  return droplets;
}

/* ---------------- Load cans ---------------- */
const loader = new GLTFLoader();
const TARGET_HEIGHT = 3.15;
const SLOT_SPACING = 2.85;
const BASE_Y = -1.75;
const cans = []; // { flavor, index, group, mats }
let loadedCount = 0;
const loadFill = document.getElementById('loadFill');
const loadText = document.getElementById('loadText');
const loadingEl = document.getElementById('loading');

const loadPromises = FLAVORS.map((flavor, i) => new Promise((resolve) => {
  loader.load(`${flavor.file}?v=crush-plane-free-20260820`, (gltf) => {
    const root = gltf.scene;

    // HARD SAFETY FALLBACK: the GLBs in this build already have the Blender Plane
    // removed from their scene roots. This traversal still strips any plane/helper
    // mesh if a future model accidentally reintroduces one.
    // It must never be rendered. We grab its `water` material first, then remove
    // the plane from the GLB scene completely so there is no sheet/card jutting
    // out of the can. The visible result is only the 3D droplets created below.
    const helperPlanes = [];
    let sourceWaterMaterial = null;
    root.traverse(o => {
      if (!o.isMesh) return;

      const materialName = Array.isArray(o.material)
        ? o.material.map(m => m?.name || '').join(' ')
        : (o.material?.name || '');
      const exactCondensationPlane = /(^|\b)plane(\b|$)/i.test(o.name || '') || /water/i.test(materialName);

      const b = new THREE.Box3().setFromObject(o);
      const sz = new THREE.Vector3(); b.getSize(sz);
      const flatHelper = sz.y < 0.025 && Math.max(sz.x, sz.z) > 0.35;

      if (exactCondensationPlane || /puddle|floor/i.test(o.name || '') || flatHelper) {
        helperPlanes.push(o);

        // Keep ONLY the material/maps as the water source. Never keep/render
        // the plane geometry itself.
        if (!sourceWaterMaterial && o.material) {
          sourceWaterMaterial = Array.isArray(o.material) ? o.material[0] : o.material;
        }
      }
    });

    // Remove every helper/water plane from the loaded GLB completely.
    // We remove the object from its parent (not merely hide it) so it cannot
    // ever reappear because of animation, transparency, render order, or a
    // later material update.
    [...new Set(helperPlanes)].forEach(o => {
      if (o.parent) o.parent.remove(o);
    });

    // Extra hard-stop for the exact Blender node used in these files.
    // All five supplied GLBs contain a root-level node named `Plane`.
    const exportedPlane = root.getObjectByName('Plane');
    if (exportedPlane?.parent) exportedPlane.parent.remove(exportedPlane);

    // Normalize only the actual can geometry, then center it and put the base at y=0.
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3(); box.getSize(size);
    const scale = TARGET_HEIGHT / (size.y || 1);
    root.scale.setScalar(scale);

    const box2 = new THREE.Box3().setFromObject(root);
    const center2 = new THREE.Vector3(); box2.getCenter(center2);
    root.position.x -= center2.x;
    root.position.z -= center2.z;
    root.position.y -= box2.min.y;

    const mats = [];
    root.traverse(o => {
      if (!o.isMesh) return;
      o.castShadow = false; o.receiveShadow = false;
      if (o.material) {
        o.material.envMapIntensity = 1.15;
        // Floor the roughness a touch — very low roughness + a tight spot
        // light was producing hard, faceted specular glints on the can's
        // low-poly base/rim instead of a smooth metal reflection.
        if (o.material.roughness !== undefined) {
          o.material.roughness = Math.max(o.material.roughness, 0.32);
        }
        mats.push(o.material);
      }
    });

    const group = new THREE.Group();
    group.add(root);

    // Replace the Blender Plane with actual 3D droplets ON the can itself.
    // The GLBs have a parent object called "can" carrying the can's tilt;
    // parenting droplets there is what makes them stay glued to the surface.
    const canNode = root.getObjectByName('can') || root;
    const droplets = addCondensationToCan(canNode, sourceWaterMaterial, 7300 + i * 977);

    // Deliberately no CircleGeometry/contact plane here. The previous contact
    // glow was parented to the rotating can group, which is what produced the
    // triangular sheet visible in the browser screenshot.

    group.position.set((i - 2) * SLOT_SPACING, BASE_Y, 0);
    scene.add(group);

    cans.push({ flavor, index: i, group, mats, droplets });

    loadedCount++;
    const pct = Math.round((loadedCount / N) * 100);
    loadFill.style.width = pct + '%';
    loadText.textContent = loadedCount < N ? `LOADING CANS… ${pct}%` : 'READY';
    resolve();
  }, undefined, (err) => {
    console.error('Failed to load', flavor.file, err);
    loadedCount++;
    resolve();
  });
}));

Promise.all(loadPromises).then(() => {
  cans.sort((a,b) => a.index - b.index);
  setTimeout(() => loadingEl.classList.add('hide'), 250);
});

/* ---------------- Carousel state (infinite — activeIndex is unbounded) ---------------- */
let activeIndex = 2;
const clock = new THREE.Clock();

const puckName = document.getElementById('puckName');
const puckSub = document.getElementById('puckSub');
const progressDot = document.getElementById('progressDot');
const progressBar = document.getElementById('progressBar');

function mod(n, m){ return ((n % m) + m) % m; }
function realIndex(i){ return mod(Math.round(i), N); }
function currentFlavor(){ return FLAVORS[realIndex(activeIndex)]; }

// Shortest signed distance from `can` to `active` around the N-item loop,
// so the carousel always spins the short way and never dead-ends.
function wrappedOffset(canIndex, active){
  let raw = canIndex - active;
  raw = mod(raw + N/2, N) - N/2;
  return raw;
}

function updateUI(){
  const f = currentFlavor();
  puckName.textContent = f.title;
  puckSub.textContent = f.sub;
  const pct = (realIndex(activeIndex) / (N - 1)) * 100;
  progressDot.style.left = pct + '%';
  document.documentElement.style.setProperty('--accent', f.accent);
  document.documentElement.style.setProperty('--accent2', f.accent2);
}

let manualSpinY = 0; // extra Y rotation the visitor has spun the active can to

function goTo(index){
  activeIndex = Math.round(index); // unbounded — the ring wraps, so it can grow forever
  manualSpinY = 0; // face the new active can forward again
  updateUI();
}

document.getElementById('prevArrow').addEventListener('click', () => goTo(activeIndex - 1));
document.getElementById('nextArrow').addEventListener('click', () => goTo(activeIndex + 1));
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
  if (e.key === 'ArrowRight') goTo(activeIndex + 1);
});
progressBar.addEventListener('click', (e) => {
  const rect = progressBar.getBoundingClientRect();
  const t = (e.clientX - rect.left) / rect.width;
  goTo(Math.round(t * (N - 1)));
});

/* ---------------- Drag / click on the canvas ----------------
   Grabbing the centered can spins it in place (a real "pick it up and
   turn it" interaction). Grabbing empty space, or a side can, pages the
   carousel instead. */
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let pointerDown = false;
let dragStartX = 0;
let dragStartOffset = 0;
let dragMoved = false;
let liveOffset = 0; // smooth offset used every frame while paging

let spinMode = false;
let spinCan = null;
let spinStartRotY = 0;

function setNdc(e){
  const rect = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function canAt(e){
  setNdc(e);
  raycaster.setFromCamera(ndc, camera);
  const groups = cans.map(c => c.group);
  const hit = raycaster.intersectObjects(groups, true);
  if (!hit.length) return null;
  let obj = hit[0].object;
  while (obj.parent && !cans.find(c => c.group === obj)) obj = obj.parent;
  return cans.find(c => c.group === obj) || null;
}

canvas.addEventListener('pointerdown', (e) => {
  pointerDown = true;
  dragMoved = false;
  dragStartX = e.clientX;

  const hitCan = canAt(e);
  if (hitCan && realIndex(activeIndex) === hitCan.index) {
    spinMode = true;
    spinCan = hitCan;
    spinStartRotY = manualSpinY;
  } else {
    spinMode = false;
    spinCan = null;
    dragStartOffset = liveOffset;
  }
  canvas.classList.add('dragging');
  canvas.setPointerCapture(e.pointerId);
});

window.addEventListener('pointermove', (e) => {
  if (!pointerDown) return;
  const dx = e.clientX - dragStartX;
  if (Math.abs(dx) > 4) dragMoved = true;
  const rect = canvas.getBoundingClientRect();

  if (spinMode) {
    manualSpinY = spinStartRotY + (dx / rect.width) * 6.5; // radians per full-width drag
  } else {
    liveOffset = dragStartOffset - (dx / rect.width) * 4.2; // drag sensitivity
  }
});

window.addEventListener('pointerup', (e) => {
  if (!pointerDown) return;
  pointerDown = false;
  canvas.classList.remove('dragging');

  if (spinMode) {
    if (!dragMoved) openPanel(spinCan.flavor); // a tap, not a spin — open detail
    spinMode = false;
    spinCan = null;
    return;
  }

  if (dragMoved) {
    goTo(activeIndex + Math.round(liveOffset));
    liveOffset = 0;
  } else {
    const can = canAt(e);
    if (can) {
      if (realIndex(activeIndex) === can.index) {
        openPanel(can.flavor);
      } else {
        // step toward it the short way around the ring
        goTo(activeIndex + wrappedOffset(can.index, activeIndex));
      }
    }
  }
});

/* ---------------- Animate ---------------- */
function applyCanTransform(can, offsetFromActive){
  const r = offsetFromActive;
  const abs = Math.abs(r);
  const isActive = abs < 0.001;
  const targetX = r * SLOT_SPACING;
  const targetY = BASE_Y - 0.07 * abs * abs;
  const targetZ = -abs * 0.85;
  const targetRotY = -r * 0.42 + (isActive ? manualSpinY : 0);
  const targetRotZ = -r * 0.10;
  const targetScale = Math.max(1 - 0.16 * abs, 0.42);

  can.group.position.x = THREE.MathUtils.lerp(can.group.position.x, targetX, 0.14);
  can.group.position.y = THREE.MathUtils.lerp(can.group.position.y, targetY, 0.14);
  can.group.position.z = THREE.MathUtils.lerp(can.group.position.z, targetZ, 0.14);
  // While actively spinning it, follow the pointer 1:1 instead of easing,
  // so the can doesn't feel laggy under the hand.
  const rotLerp = (isActive && spinMode) ? 1 : 0.14;
  can.group.rotation.y = THREE.MathUtils.lerp(can.group.rotation.y, targetRotY, rotLerp);
  can.group.rotation.z = THREE.MathUtils.lerp(can.group.rotation.z, targetRotZ, 0.14);
  const s = THREE.MathUtils.lerp(can.group.scale.x, targetScale, 0.14);
  can.group.scale.setScalar(s);
  can.group.visible = abs < N / 2; // hide the far side of the ring instead of overlapping through the middle

  const dim = Math.max(1 - abs * 0.32, 0.42);
  can.mats.forEach(m => {
    if (!m.color) return;
    m.color.setScalar(THREE.MathUtils.lerp(m.color.r, dim, 0.14));
    if (m.transparent !== true && abs > 0.4) { m.transparent = true; }
    if (m.opacity !== undefined) m.opacity = THREE.MathUtils.lerp(m.opacity ?? 1, Math.max(1 - abs*0.18, 0.55), 0.14);
  });

  if (can.droplets?.material) {
    const targetOpacity = isActive ? 0.92 : Math.max(0.52, 0.82 - abs * 0.10);
    can.droplets.material.opacity = THREE.MathUtils.lerp(can.droplets.material.opacity, targetOpacity, 0.14);
  }
}

function animate(){
  requestAnimationFrame(animate);
  clock.getDelta();

  const smooth = pointerDown ? liveOffset : 0;
  const active = activeIndex + smooth;
  cans.forEach(can => {
    applyCanTransform(can, wrappedOffset(can.index, active));
  });

  renderer.render(scene, camera);
}
animate();
updateUI();

/* ---------------- Resize ---------------- */
function onResize(){
  const w = heroSection.clientWidth, h = heroSection.clientHeight;
  camera.aspect = w / h;
  const narrow = w < 720;
  camera.fov = narrow ? 36 : 30;
  camera.position.z = narrow ? 15.8 : 12.8;
  camera.lookAt(LOOK_AT);
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);
onResize();
