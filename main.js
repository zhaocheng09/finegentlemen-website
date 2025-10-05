
// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
// camera.position.set(0, 50, 150); // 靠近以便观察细节
// const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);
// const controls = new THREE.OrbitControls(camera, renderer.domElement);
// controls.enablePan = false;
// const earthRadius = 10;
// controls.minDistance = earthRadius * 1.1;
// controls.maxDistance = 400;

// const sunLight = new THREE.PointLight(0xffffff, 3, 0);
// sunLight.position.set(0, 0, 0);
// scene.add(sunLight);
// scene.add(new THREE.AmbientLight(0xffffff, 1.2));

// const earthOrbit = new THREE.Object3D();
// scene.add(earthOrbit);

// function createEarth() {
//     const earthGeometry = new THREE.SphereGeometry(earthRadius, 128, 128);
//     const earthMaterial = new THREE.MeshPhongMaterial({
//         map: new THREE.TextureLoader().load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"),
//         specularMap: new THREE.TextureLoader().load("https://threejs.org/examples/textures/planets/earth_specular_2048.jpg"),
//         bumpMap: new THREE.TextureLoader().load("https://threejs.org/examples/textures/planets/earth_bump_2048.jpg"),
//         bumpScale: 0.1,
//         side: THREE.FrontSide
//     });
//     const earth = new THREE.Mesh(earthGeometry, earthMaterial);
//     earth.position.set(150, 0, 0);
//     earth.rotation.z = THREE.MathUtils.degToRad(23.5);
//     earthOrbit.add(earth);
//     return earth;
// }

// function createMeteor() {
//     const geometry = new THREE.SphereGeometry(1.5, 32, 32);
//     geometry.computeVertexNormals();
//     const textureLoader = new THREE.TextureLoader();
//     const material = new THREE.MeshStandardMaterial({
//         map: textureLoader.load("rock.png", undefined, undefined, () => console.error("Failed to load rock.png")),
//         roughnessMap: textureLoader.load("rockroughness.png", undefined, undefined, () => console.error("Failed to load rockroughness.png")),
//         normalMap: textureLoader.load("rockrnormal.png", undefined, undefined, () => console.error("Failed to load rocknormal.png")),
//         bumpMap: textureLoader.load("rockbumpmap.png", undefined, undefined, () => console.error("Failed to load rockbumpmap.png")),
//         displacementMap: textureLoader.load("rockdisplacementmap.png", undefined, undefined, () => console.error("Failed to load rockdisplacementmap.png")),
//         displacementScale: 0.4,
//         aoMap: textureLoader.load("rockao.png", undefined, undefined, () => console.error("Failed to load rockao.png")),
//         side: THREE.FrontSide,
//         transparent: true,
//         opacity: 1
//     });
//     const meteor = new THREE.Mesh(geometry, material);
//     meteor.position.set(500, 80, 0);
//     scene.add(meteor);
//     return meteor;
// }

// const start = new THREE.Vector3(500, 80, 0);
// const end = new THREE.Vector3(150, 0, 0);
// const orbitGeo = new THREE.BufferGeometry().setFromPoints([start, end]);
// const orbitMat = new THREE.LineDashedMaterial({ dashSize: 4, gapSize: 3 });
// const orbit = new THREE.Line(orbitGeo, orbitMat);
// scene.add(orbit);
// orbit.computeLineDistances();

// let meteor = createMeteor();
// let earth = createEarth();

// // 爆炸效果
// function createExplosion(position) {
//     const explosionGroup = new THREE.Group();

//     const shockGeo = new THREE.SphereGeometry(2, 32, 32);
//     const shockMat = new THREE.MeshBasicMaterial({
//         color: 0xffdd88,
//         transparent: true,
//         opacity: 0.8
//     });
//     const shockwave = new THREE.Mesh(shockGeo, shockMat);
//     shockwave.position.copy(position);
//     explosionGroup.add(shockwave);

//     const particleCount = 40;
//     for (let i = 0; i < particleCount; i++) {
//         const geo = new THREE.SphereGeometry(0.4, 6, 6);
//         const mat = new THREE.MeshBasicMaterial({
//             color: 0xff6600,
//             transparent: true,
//             opacity: 1
//         });
//         const p = new THREE.Mesh(geo, mat);
//         p.position.copy(position);

//         const dir = new THREE.Vector3(
//             (Math.random() - 0.5) * 2,
//             (Math.random() - 0.5) * 2,
//             (Math.random() - 0.5) * 2
//         ).normalize().multiplyScalar(0.8 + Math.random() * 1.5);

//         p.userData.velocity = dir;
//         explosionGroup.add(p);
//     }

//     scene.add(explosionGroup);

//     let size = 2;
//     const explosionInterval = setInterval(() => {
//         size += 0.5;
//         shockwave.scale.set(size, size, size);
//         shockwave.material.opacity -= 0.05;

//         explosionGroup.children.forEach((p, index) => {
//             if (index === 0) return; 
//             p.position.add(p.userData.velocity);
//             p.material.opacity -= 0.03;
//         });

//         if (shockwave.material.opacity <= 0) {
//             clearInterval(explosionInterval);
//             scene.remove(explosionGroup);
//         }
//     }, 50);
// }

// // ----------------------
// // 添加的功能：Impact Success 面板 + Result 按钮
// // ----------------------
// function showResult(text) {
//     const oldPanel = document.getElementById('resultPanel');
//     if (oldPanel) document.body.removeChild(oldPanel);

//     let resultDiv = document.createElement('div');
//     resultDiv.id = 'resultPanel';
//     resultDiv.style.position = 'absolute';
//     resultDiv.style.top = '50%';
//     resultDiv.style.left = '50%';
//     resultDiv.style.transform = 'translate(-50%, -50%)';
//     resultDiv.style.padding = '30px 50px';
//     resultDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
//     resultDiv.style.color = '#fff';
//     resultDiv.style.fontSize = '24px';
//     resultDiv.style.fontWeight = 'bold';
//     resultDiv.style.borderRadius = '10px';
//     resultDiv.style.textAlign = 'center';
//     resultDiv.style.zIndex = '100';
//     resultDiv.style.opacity = '0';
//     resultDiv.style.transition = 'opacity 0.5s';

//     const textNode = document.createElement('div');
//     textNode.innerText = text;
//     resultDiv.appendChild(textNode);

//     const resultBtn = document.createElement('button');
//     resultBtn.innerText = 'Result';
//     resultBtn.style.marginTop = '20px';
//     resultBtn.style.padding = '10px 20px';
//     resultBtn.style.fontSize = '16px';
//     resultBtn.style.cursor = 'pointer';
//     resultBtn.style.border = 'none';
//     resultBtn.style.borderRadius = '5px';
//     resultBtn.style.backgroundColor = '#ff4500';
//     resultBtn.style.color = '#fff';
//     resultBtn.addEventListener('mouseenter', () => resultBtn.style.backgroundColor = '#ff6347');
//     resultBtn.addEventListener('mouseleave', () => resultBtn.style.backgroundColor = '#ff4500');
//     resultBtn.addEventListener('click', () => {
//         window.open('test6.html', '_blank'); // 新标签页打开
//     });
//     resultDiv.appendChild(resultBtn);


//     document.body.appendChild(resultDiv);

//     setTimeout(() => {
//         resultDiv.style.opacity = '1';
//     }, 50);
// }

// // ----------------------
// // 原本 Restart Meteor 按钮逻辑，只添加清除面板
// // ----------------------
// const button = document.createElement('button');
// button.innerText = 'Restart Meteor';
// button.style.position = 'absolute';
// button.style.top = '10px';
// button.style.left = '10px';
// button.style.padding = '10px';
// button.style.fontSize = '16px';
// document.body.appendChild(button);

// button.addEventListener('click', () => {
//     const panel = document.getElementById('resultPanel');
//     if (panel) document.body.removeChild(panel);

//     if (!meteor) {
//         meteor = createMeteor();
//         angle = 0;
//         console.log("Meteor restarted");
//     }
// });

// // ----------------------
// // 原动画逻辑保持不变
// // ----------------------
// const clock = new THREE.Clock();
// let angle = 0;

// function animate() {
//     requestAnimationFrame(animate);
//     const t = clock.getElapsedTime();
//     earth.rotation.y += 0.01;
//     controls.target.copy(earth.getWorldPosition(new THREE.Vector3()));
//     controls.update();
//     renderer.render(scene, camera);

//     if (meteor) {
//         meteor.rotation.x += 0.01;
//         meteor.rotation.y += 0.01;

//         angle += 0.01;

//         if (angle >= 1) {
//             const hitPos = end.clone();
//             const earthPos = earth.getWorldPosition(new THREE.Vector3());
//             const direction = hitPos.clone().sub(earthPos).normalize();
//             const impactPos = earthPos.clone().add(direction.multiplyScalar(earthRadius));
//             createExplosion(impactPos);
//             createExplosion(impactPos);
//             showResult("Impact Success!");

//             scene.remove(meteor);
//             meteor = null;

//             camera.lookAt(impactPos);
//             setTimeout(() => {
//                 camera.position.set(0, 50, 150);
//             }, 2000);
//         } else {
//             const pos = new THREE.Vector3().lerpVectors(start, end, angle);
//             meteor.position.copy(pos);
//         }
//     }
// }

// animate();

// window.addEventListener("resize", () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// });



// ----------------------
// 你的原本 main.js 内容全部保持不变
// ----------------------
// ----------------------
// 你的原本 main.js 内容全部保持不变
// ----------------------
let targetLat = parseFloat(sessionStorage.getItem('targetLat')) || 39.9;
let targetLng = parseFloat(sessionStorage.getItem('targetLng')) || 116.4;
let targetName = sessionStorage.getItem('targetName') || 'Beijing, China';

// 获取陨石参数 (Free Simulator)
let meteorSpeed = parseFloat(sessionStorage.getItem('meteorSpeed')) || 10; // km/s
let meteorMass = parseFloat(sessionStorage.getItem('meteorMass')) || 1000000; // kg
let meteorVolume = parseFloat(sessionStorage.getItem('meteorVolume')) || 100; // m³

// 获取预设陨石参数 (Preset Simulator)
let meteorName = sessionStorage.getItem('meteorName');
let meteorVelocity = parseFloat(sessionStorage.getItem('meteorVelocity'));
let meteorEnergy = parseFloat(sessionStorage.getItem('meteorEnergy'));
let meteorDiameter = parseFloat(sessionStorage.getItem('meteorDiameter'));

// 判断使用哪种模式
let usePresetMode = meteorName && !isNaN(meteorVelocity);

if (usePresetMode) {
  meteorSpeed = meteorVelocity;
  // 从能量反推质量: E = 0.5 * m * v^2
  let energyJoules = meteorEnergy * 4.184e15;
  meteorMass = (2 * energyJoules) / (meteorSpeed * 1000) ** 2;
  meteorVolume = (4/3) * Math.PI * Math.pow(meteorDiameter / 2, 3);
}

// 计算陨石直径 (假设密度约 3000 kg/m³)
const density = 3000;
let calculatedDiameter = Math.pow((6 * meteorMass) / (density * Math.PI), 1/3);

if (usePresetMode) {
  calculatedDiameter = meteorDiameter;
}

// ========== 物理计算函数 ==========
function calculateImpactPhysics() {
  const speedMs = meteorSpeed * 1000;
  
  // 1. 动能 (Joules)
  const kineticEnergy = 0.5 * meteorMass * speedMs * speedMs;
  
  // 2. TNT当量 (Megatons)
  const megatonsTNT = kineticEnergy / 4.184e15;
  
  // 3. 撞击坑直径 (km)
  const craterDiameter = 1.8 * Math.pow(kineticEnergy, 0.28) * Math.pow(calculatedDiameter, 0.11) / 1000;
  
  // 4. 破坏半径 (km)
  const severeRadius = 0.15 * Math.pow(megatonsTNT, 0.33);
  const moderateRadius = severeRadius * 2.5;
  
  return {
    kineticEnergy: kineticEnergy,
    megatonsTNT: megatonsTNT,
    craterDiameter: craterDiameter,
    damageRadius: moderateRadius
  };
}

const impactData = calculateImpactPhysics();

// ========== 更新UI显示 ==========
document.getElementById('target-name').textContent = targetName;
document.getElementById('target-coords').textContent = `${targetLat.toFixed(4)}°, ${targetLng.toFixed(4)}°`;
document.getElementById('meteor-speed').textContent = `${meteorSpeed.toFixed(2)} km/s`;
document.getElementById('meteor-mass').textContent = `${meteorMass.toLocaleString()} kg`;
document.getElementById('meteor-diameter').textContent = `${calculatedDiameter.toFixed(2)} m`;

// ========== Three.js 场景设置 ==========
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 50, 150);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
const earthRadius = 10;
controls.minDistance = earthRadius * 1.1;
controls.maxDistance = 400;

// 星空背景
const starsGeometry = new THREE.SphereGeometry(2000, 64, 64);
const starsMaterial = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load("https://threejs.org/examples/textures/planets/starfield.jpg"),
  side: THREE.BackSide
});
const stars = new THREE.Mesh(starsGeometry, starsMaterial);
scene.add(stars);

// 灯光
const sunLight = new THREE.PointLight(0xffffff, 3, 0);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);
scene.add(new THREE.AmbientLight(0xffffff, 1.2));

const earthOrbit = new THREE.Object3D();
scene.add(earthOrbit);

// 创建地球
function createEarth() {
  const earthGeometry = new THREE.SphereGeometry(earthRadius, 128, 128);
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"),
    specularMap: new THREE.TextureLoader().load("https://threejs.org/examples/textures/planets/earth_specular_2048.jpg"),
    bumpMap: new THREE.TextureLoader().load("https://threejs.org/examples/textures/planets/earth_bump_2048.jpg"),
    bumpScale: 0.1,
    side: THREE.FrontSide
  });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  earth.position.set(150, 0, 0);
  earth.rotation.z = THREE.MathUtils.degToRad(23.5);
  earthOrbit.add(earth);
  
  // 添加国家边界
  addCountryBorders(earth);
  
  return earth;
}

// 添加国家边界
function addCountryBorders(earth) {
  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(res => res.json())
    .then(worldData => {
      const countries = topojson.feature(worldData, worldData.objects.countries);
      const material = new THREE.LineBasicMaterial({ color: 0x00ff88, linewidth: 1 });

      countries.features.forEach(feature => {
        const coords = feature.geometry.coordinates;
        if (feature.geometry.type === "Polygon") {
          drawPolygon(coords, earth, material);
        } else if (feature.geometry.type === "MultiPolygon") {
          coords.forEach(polygon => drawPolygon(polygon, earth, material));
        }
      });
    })
    .catch(err => console.error('Failed to load borders:', err));
}

function drawPolygon(polygon, earth, material) {
  polygon.forEach(ring => {
    const points = [];
    ring.forEach(([lon, lat]) => {
      points.push(latLngToVector3(lat, lon, earthRadius + 0.05));
    });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    earth.add(line);
  });
}

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  return new THREE.Vector3(x, y, z);
}

// 计算目标位置
function getTargetPosition() {
  const earthPos = earth.getWorldPosition(new THREE.Vector3());
  const localTarget = latLngToVector3(targetLat, targetLng, earthRadius);
  return earthPos.clone().add(localTarget);
}

// 起始位置
const start = new THREE.Vector3(500, 80, 0);
let end = new THREE.Vector3(150, 0, 0);

// 轨道线
const orbitGeo = new THREE.BufferGeometry();
const orbitMat = new THREE.LineDashedMaterial({ 
  color: 0xff6347, 
  dashSize: 4, 
  gapSize: 3,
  linewidth: 2
});
const orbit = new THREE.Line(orbitGeo, orbitMat);
scene.add(orbit);

let meteor = null;
let earth = createEarth();

// 陨石速度映射
let animationSpeed = 0.005 + (meteorSpeed / 50) * 0.01;

// 陨石大小映射
let meteorSize = Math.max(1, Math.min(5, calculatedDiameter / 50));

let angle = 0;
let targetCalculated = false;

// 创建陨石
function createMeteor() {
     const geometry = new THREE.SphereGeometry(0.8, 32, 32);
     geometry.computeVertexNormals();
    const textureLoader = new THREE.TextureLoader();
    const material = new THREE.MeshStandardMaterial({
         map: textureLoader.load("rock.png", undefined, undefined, () => console.error("Failed to load rock.png")),
         roughnessMap: textureLoader.load("rockroughness.png", undefined, undefined, () => console.error("Failed to load rockroughness.png")),
         normalMap: textureLoader.load("rocknormal.png", undefined, undefined, () => console.error("Failed to load rocknormal.png")),
         bumpMap: textureLoader.load("rockbumpmap.png", undefined, undefined, () => console.error("Failed to load rockbumpmap.png")),
         displacementMap: textureLoader.load("rockdisplacementmap.png", undefined, undefined, () => console.error("Failed to load rockdisplacementmap.png")),
         displacementScale: 0.4,
         aoMap: textureLoader.load("rockao.png", undefined, undefined, () => console.error("Failed to load rockao.png")),
         side: THREE.DoubleSide,
         emissive: new THREE.Color(0xff3300),
         emissiveIntensity: 1.5
     });
     const meteor = new THREE.Mesh(geometry, material);
   scene.add(mesh);
 }

  
  // 尾焰效果
  const trailGeometry = new THREE.ConeGeometry(size * 0.8, size * 4, 8);
  const trailMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.6
  });
  const trail = new THREE.Mesh(trailGeometry, trailMaterial);
  trail.rotation.x = Math.PI / 2;
  trail.position.z = size * 2;
  mesh.add(trail);
  
  return mesh;


// 增强版爆炸效果
function createExplosion(position) {
  const explosionGroup = new THREE.Group();
  explosionGroup.position.copy(position);
  scene.add(explosionGroup);

  // 根据能量调整爆炸规模
  const explosionScale = Math.min(3, 1 + impactData.megatonsTNT / 100);

  // 多层冲击波
  for (let i = 0; i < 3; i++) {
    const shockGeo = new THREE.SphereGeometry((2 + i * 0.5) * explosionScale, 32, 32);
    const shockMat = new THREE.MeshBasicMaterial({
      color: i === 0 ? 0xffff00 : (i === 1 ? 0xffaa00 : 0xff6600),
      transparent: true,
      opacity: 0.9 - i * 0.2,
      side: THREE.DoubleSide
    });
    const shockwave = new THREE.Mesh(shockGeo, shockMat);
    explosionGroup.add(shockwave);
  }

  // 火球粒子
  const particleCount = Math.min(120, 60 + Math.floor(impactData.megatonsTNT * 2));
  for (let i = 0; i < particleCount; i++) {
    const size = 0.3 + Math.random() * 0.5;
    const geo = new THREE.SphereGeometry(size, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0xff4500 : 0xffa500,
      transparent: true,
      opacity: 1
    });
    const p = new THREE.Mesh(geo, mat);

    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ).normalize().multiplyScalar(1 + Math.random() * 2.5);

    p.userData.velocity = dir;
    p.userData.life = 1.0;
    explosionGroup.add(p);
  }

  // 碎片
  for (let i = 0; i < 40; i++) {
    const geo = new THREE.BoxGeometry(0.2, 0.2, 0.4);
    const mat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const debris = new THREE.Mesh(geo, mat);
    
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      Math.random(),
      (Math.random() - 0.5) * 2
    ).normalize().multiplyScalar(0.5 + Math.random() * 1.5);
    
    debris.userData.velocity = dir;
    debris.userData.rotationSpeed = new THREE.Vector3(
      Math.random() * 0.2,
      Math.random() * 0.2,
      Math.random() * 0.2
    );
    explosionGroup.add(debris);
  }

  // 爆炸动画
  let frame = 0;
  const maxFrames = 80;
  const explosionInterval = setInterval(() => {
    frame++;
    
    explosionGroup.children.forEach((child, index) => {
      if (index < 3) {
        // 冲击波
        const scale = 1 + frame * 0.8 * explosionScale;
        child.scale.set(scale, scale, scale);
        child.material.opacity = Math.max(0, 0.9 - frame * 0.015);
      } else {
        // 粒子和碎片
        if (child.userData.velocity) {
          child.position.add(child.userData.velocity);
          child.userData.velocity.multiplyScalar(0.97);
          
          if (child.userData.life !== undefined) {
            child.userData.life -= 0.02;
            child.material.opacity = Math.max(0, child.userData.life);
          }
          
          if (child.userData.rotationSpeed) {
            child.rotation.x += child.userData.rotationSpeed.x;
            child.rotation.y += child.userData.rotationSpeed.y;
            child.rotation.z += child.userData.rotationSpeed.z;
          }
        }
      }
    });

    if (frame >= maxFrames) {
      clearInterval(explosionInterval);
      scene.remove(explosionGroup);
      showChoiceModal();
    }
  }, 30);
}

// 显示选择对话框
function showChoiceModal() {
  const modal = document.getElementById('choiceModal');
  document.getElementById('modal-location').textContent = targetName;
  
  // 显示计算出的物理数据
  document.getElementById('impact-energy').textContent = 
    `${(impactData.kineticEnergy / 1e15).toFixed(2)} × 10¹⁵ Joules`;
  document.getElementById('impact-force').textContent = 
    `${impactData.megatonsTNT.toFixed(2)} Megatons`;
  document.getElementById('crater-diameter').textContent = 
    `${impactData.craterDiameter.toFixed(2)} km`;
  document.getElementById('damage-radius').textContent = 
    `${impactData.damageRadius.toFixed(2)} km`;
  
  modal.style.display = 'flex';
}

// 重新发射
window.launchAgain = function() {
  document.getElementById('choiceModal').style.display = 'none';
  restartMeteor();
};

// 查看坑洞
window.viewCrater = function() {
  // 保存撞击数据用于坑洞页面
  sessionStorage.setItem('impactEnergy', impactData.kineticEnergy);
  sessionStorage.setItem('impactMegatons', impactData.megatonsTNT);
  sessionStorage.setItem('craterDiameter', impactData.craterDiameter);
  sessionStorage.setItem('damageRadius', impactData.damageRadius);
  
  alert('Crater visualization page coming soon!\n\nImpact Data Saved:\n' +
        `Energy: ${impactData.megatonsTNT.toFixed(2)} Mt\n` +
        `Crater: ${impactData.craterDiameter.toFixed(2)} km\n` +
        `Damage: ${impactData.damageRadius.toFixed(2)} km`);
  
  document.getElementById('choiceModal').style.display = 'none';
  restartMeteor();
};

// 重启
window.restartMeteor = function() {
  if (meteor) {
    scene.remove(meteor);
  }
  angle = 0;
  targetCalculated = false;
  meteor = createMeteor(meteorSize);
  document.getElementById('status').textContent = 'Launching...';
};

// 初始化
meteor = createMeteor(meteorSize);

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  
  earth.rotation.y += 0.005;
  controls.target.copy(earth.getWorldPosition(new THREE.Vector3()));
  controls.update();
  
  if (meteor) {
    if (!targetCalculated) {
      end = getTargetPosition();
      orbitGeo.setFromPoints([start, end]);
      orbit.computeLineDistances();
      targetCalculated = true;
    }
    
    meteor.rotation.x += 0.02;
    meteor.rotation.y += 0.02;

    angle += animationSpeed;

    if (angle >= 1) {
      document.getElementById('status').textContent = '💥 IMPACT!';
      
      const impactPos = end.clone();
      createExplosion(impactPos);
      
      scene.remove(meteor);
      meteor = null;

      camera.lookAt(impactPos);
      setTimeout(() => {
        camera.position.set(0, 50, 150);
      }, 2000);
    } else {
      const pos = new THREE.Vector3().lerpVectors(start, end, angle);
      meteor.position.copy(pos);
      
      const progress = (angle * 100).toFixed(0);
      document.getElementById('status').textContent = `In Flight: ${progress}%`;
    }
  }
  
  renderer.render(scene, camera);
}

animate();

// 响应式
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});