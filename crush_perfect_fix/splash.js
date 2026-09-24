import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/*
  CRUSH water splash

  Uses the Sphere mesh from the user's Untitled.glb as the source geometry for
  all free droplets. The two Cube meshes are intentionally ignored.

  The puddle/splash is world-space: it never rotates with the cans.
*/

function makeWaterMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.035,
    transmission: 1.0,
    ior: 1.333,
    thickness: 0.08,
    transparent: false,
    opacity: 1,
    depthWrite: true,
    clearcoat: 1.0,
    clearcoatRoughness: 0.012,
    envMapIntensity: 1.8,
    specularIntensity: 1.0,
    specularColor: 0xffffff
  });
}

function seedRandom(seed = 123456) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function cloneBareGeometry(mesh) {
  const g = mesh.geometry.clone();
  g.computeBoundingBox();
  const box = g.boundingBox;
  const center = new THREE.Vector3();
  box.getCenter(center);
  g.translate(-center.x, -center.y, -center.z);

  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  g.scale(1 / maxDim, 1 / maxDim, 1 / maxDim);
  g.computeVertexNormals();
  return g;
}

function makeSoftPuddle(material) {
  // World-horizontal puddle. Because it is never parented to a can, it cannot
  // become the old jutting-out wedge.
  const puddle = new THREE.Mesh(
    new THREE.CircleGeometry(2.45, 128),
    material.clone()
  );

  puddle.name = 'World_Puddle';
  puddle.rotation.x = -Math.PI / 2;
  puddle.scale.set(1.65, 0.72, 1);
  puddle.position.y = 0.002;
  puddle.renderOrder = 1;

  // Very shallow water reads mainly through reflections.
  puddle.material.roughness = 0.075;
  puddle.material.thickness = 0.018;
  puddle.material.envMapIntensity = 1.4;

  return puddle;
}

function makeSplashLip(material) {
  const group = new THREE.Group();
  group.name = 'Splash_Crown';

  // Broken torus arcs make a splash crown without a solid "donut".
  const arcs = [
    { start: 0.08, len: 0.48, r: 0.78, tube: 0.028, y: 0.06, tilt: 0.18 },
    { start: 0.72, len: 0.32, r: 0.83, tube: 0.025, y: 0.05, tilt: -0.12 },
    { start: 1.15, len: 0.42, r: 0.76, tube: 0.030, y: 0.07, tilt: 0.10 },
    { start: 1.78, len: 0.28, r: 0.88, tube: 0.022, y: 0.045, tilt: -0.16 },
  ];

  for (const a of arcs) {
    const geo = new THREE.TorusGeometry(a.r, a.tube, 10, 48, a.len * Math.PI);
    const mesh = new THREE.Mesh(geo, material);
    mesh.rotation.x = Math.PI / 2 + a.tilt;
    mesh.rotation.z = a.start * Math.PI;
    mesh.position.y = a.y;
    mesh.scale.y = 0.92;
    group.add(mesh);
  }

  // Small upward "fingers" of water around the crown.
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + 0.22;
    const radius = 0.78 + (i % 3) * 0.05;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(angle) * radius, 0.03, Math.sin(angle) * radius),
      new THREE.Vector3(Math.cos(angle + 0.08) * (radius + 0.08), 0.16 + (i % 2) * 0.05, Math.sin(angle + 0.08) * (radius + 0.08)),
      new THREE.Vector3(Math.cos(angle + 0.13) * (radius + 0.12), 0.28 + (i % 3) * 0.045, Math.sin(angle + 0.13) * (radius + 0.12))
    ]);

    const geo = new THREE.TubeGeometry(curve, 14, 0.018 + (i % 2) * 0.004, 8, false);
    const finger = new THREE.Mesh(geo, material);
    group.add(finger);
  }

  return group;
}

function makeDroplets(sphereGeometry, material, rand) {
  const count = 46;
  const droplets = new THREE.InstancedMesh(sphereGeometry, material, count);
  droplets.name = 'Splash_Droplets';
  droplets.frustumCulled = false;
  droplets.renderOrder = 3;

  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = 0.62 + rand() * 0.75;
    const height = 0.08 + Math.pow(rand(), 1.6) * 0.64;

    dummy.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );

    const s = 0.025 + Math.pow(rand(), 1.7) * 0.055;
    dummy.scale.set(
      s * (0.75 + rand() * 0.55),
      s * (0.9 + rand() * 1.6),
      s * (0.75 + rand() * 0.55)
    );

    dummy.rotation.set(rand() * 0.5, rand() * Math.PI, rand() * 0.5);
    dummy.updateMatrix();
    droplets.setMatrixAt(i, dummy.matrix);
  }

  droplets.instanceMatrix.needsUpdate = true;
  return droplets;
}

export async function createWaterSplash({
  scene,
  glbUrl = './Untitled.glb',
  y = 0,
  scale = 1
}) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(glbUrl);

  // Use the actual Sphere mesh supplied in the user's GLB.
  const sphere = gltf.scene.getObjectByName('Sphere');

  if (!sphere?.isMesh || !sphere.geometry) {
    throw new Error('Untitled.glb does not contain the expected Sphere mesh.');
  }

  const sourceSphereGeometry = cloneBareGeometry(sphere);
  const waterMaterial = makeWaterMaterial();
  const rand = seedRandom(731942);

  const splash = new THREE.Group();
  splash.name = 'CRUSH_World_Water_Splash';
  splash.position.set(0, y, 0);
  splash.scale.setScalar(scale);

  splash.add(makeSoftPuddle(waterMaterial));
  splash.add(makeSplashLip(waterMaterial.clone()));
  splash.add(makeDroplets(sourceSphereGeometry, waterMaterial.clone(), rand));

  scene.add(splash);
  return splash;
}
