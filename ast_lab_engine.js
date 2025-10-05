import * as THREE from "three";

let scene, camera, renderer, controls;
let earth, asteroid, orbitLine;
let currentLesson = 0;
let asteroidSize = 50;
let asteroidSpeed = 0.5;
let asteroidDistance = 300;
let quizIndex = 0;
let score = 0;
let isOrbiting = false;
let orbitAngle = 0;
let deflectionVisuals = [];
let impactorShip = null;
let laserBeam = null;

const lessons = [
  {
    title: "What Are Asteroids?",
    content: `
      <div class="fact-box">
        <div class="fact-title">Did You Know?</div>
        <div class="fact-text">Asteroids are rocky objects left over from when our solar system formed 4.6 billion years ago! They're like the building blocks that didn't quite make it into planets.</div>
      </div>
      <div class="instruction-box">Rotate the view to see the asteroid from all angles</div>
      <button class="btn btn-secondary" onclick="location.reload()">Reset View</button>
    `
  },
  {
    title: "Size Comparison",
    content: `
      <div class="control-group">
        <div class="control-label">Choose Asteroid Size:</div>
        <div class="asteroid-selector">
          <div class="asteroid-btn" onclick="setAsteroidSize(20)">Small<br>20m</div>
          <div class="asteroid-btn" onclick="setAsteroidSize(50)">Medium<br>50m</div>
          <div class="asteroid-btn selected" onclick="setAsteroidSize(100)">Large<br>100m</div>
          <div class="asteroid-btn" onclick="setAsteroidSize(200)">Huge<br>200m</div>
        </div>
      </div>
      <div class="fact-box">
        <div class="fact-title">Size Reference</div>
        <div class="fact-text">A 50-meter asteroid is about the size of a football field! The one that killed the dinosaurs was about 10km wide.</div>
      </div>
    `
  },
  {
    title: "Deflection Predictor",
    content: `
      <div class="control-group">
        <div class="control-label">Asteroid Size:</div>
        <div class="slider-container">
          <input type="range" id="pred-size-slider" min="10" max="200" step="10" value="50" oninput="updatePrediction()">
          <span class="slider-value" id="pred-size-value">50 m</span>
        </div>
      </div>
      <div class="control-group">
        <div class="control-label">Warning Time:</div>
        <div class="slider-container">
          <input type="range" id="warning-slider" min="0.5" max="10" step="0.5" value="5" oninput="updatePrediction()">
          <span class="slider-value" id="warning-value">5 yrs</span>
        </div>
      </div>
      <div class="control-group">
        <div class="control-label">Choose Defense Method:</div>
        <div class="asteroid-selector" style="grid-template-columns: 1fr 1fr;">
          <div class="asteroid-btn" onclick="testSingleMethod('kinetic')">Kinetic</div>
          <div class="asteroid-btn" onclick="testSingleMethod('nuclear')">Nuclear</div>
          <div class="asteroid-btn" onclick="testSingleMethod('gravity')">Gravity</div>
          <div class="asteroid-btn" onclick="testSingleMethod('laser')">Laser</div>
        </div>
      </div>
      <div id="deflection-results"></div>
    `
  },
  {
    title: "Impact Energy",
    content: `
      <div class="instruction-box">Adjust size and speed to see impact calculations</div>
      <div class="control-group">
        <div class="control-label">Asteroid Diameter:</div>
        <div class="slider-container">
          <input type="range" id="size-slider" min="10" max="300" step="10" value="50" oninput="updateSize(this.value)">
          <span class="slider-value" id="size-value-2">50 m</span>
        </div>
      </div>
      <div class="control-group">
        <div class="control-label">Impact Speed:</div>
        <div class="slider-container">
          <input type="range" id="speed-slider-2" min="5" max="25" step="1" value="15" oninput="updateSpeedCalc(this.value)">
          <span class="slider-value" id="speed-value-2">15 km/s</span>
        </div>
      </div>
      <button class="btn" onclick="calculateImpact()">Calculate Impact</button>
    `
  },
  {
    title: "Defense Methods",
    content: `
      <div class="fact-box">
        <div class="fact-title">Protection Methods</div>
        <div class="fact-text">Scientists are working on ways to defend Earth!</div>
      </div>
      <div class="control-group">
        <div class="control-label">Select Method:</div>
        <div class="asteroid-selector" style="grid-template-columns: 1fr;">
          <div class="asteroid-btn" onclick="showDefenseInfo(0)">Kinetic Impactor</div>
          <div class="asteroid-btn" onclick="showDefenseInfo(1)">Nuclear Device</div>
          <div class="asteroid-btn" onclick="showDefenseInfo(2)">Gravity Tractor</div>
          <div class="asteroid-btn" onclick="showDefenseInfo(3)">Laser Ablation</div>
        </div>
      </div>
    `
  }
];

const defenseInfo = [
  { name: "Kinetic Impactor", desc: "Like NASA's DART mission! A spacecraft crashes into the asteroid at high speed to change its direction. It's like hitting a billiard ball." },
  { name: "Nuclear Device", desc: "A nuclear explosion near (not on!) the asteroid. The blast vaporizes surface material, creating thrust that pushes it off course." },
  { name: "Gravity Tractor", desc: "A spacecraft hovers near the asteroid for months or years. Its gravity slowly pulls the asteroid into a safer orbit." },
  { name: "Laser Ablation", desc: "Powerful lasers heat the asteroid's surface, causing material to vaporize. This creates a rocket-like thrust pushing it away." }
];

const quizQuestions = [
  {
    question: "What are asteroids made from?",
    options: ["Ice and gas", "Rocky material and metal", "Light and energy", "Dust only"],
    correct: 1
  },
  {
    question: "How old are asteroids?",
    options: ["1 million years", "4.6 billion years", "100 years", "1 trillion years"],
    correct: 1
  },
  {
    question: "Which asteroid defense method did NASA test with the DART mission?",
    options: ["Laser Ablation", "Nuclear Device", "Kinetic Impactor", "Gravity Tractor"],
    correct: 2
  },
  {
    question: "What happens when an asteroid enters Earth's atmosphere?",
    options: ["It bounces back to space", "It becomes a meteor", "It disappears", "It turns into a comet"],
    correct: 1
  },
  {
    question: "Why is early detection of asteroids important?",
    options: ["To take pictures", "More time to deflect them with less effort", "They look pretty", "To name them"],
    correct: 1
  }
];

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.set(0, 200, 400);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('canvas-container').appendChild(renderer.domElement);

  setupControls();
  createScene();
  
  setTimeout(() => {
    setLesson(0);
  }, 100);

  window.addEventListener('resize', onResize);
  animate();
}

async function setupControls() {
  try {
    const { OrbitControls } = await import(
      "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js"
    );
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
  } catch (e) {
    console.log("Controls not loaded");
  }
}

function createScene() {
  const starGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(2000 * 3);
  for (let i = 0; i < 2000; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 2 })));

 const earthGeo = new THREE.SphereGeometry(40, 128, 128);
  const textureLoader = new THREE.TextureLoader();
  const earthMat = new THREE.MeshPhongMaterial({
    map: textureLoader.load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"),
    specularMap: textureLoader.load("https://threejs.org/examples/textures/planets/earth_specular_2048.jpg"),
    bumpMap: textureLoader.load("https://threejs.org/examples/textures/planets/earth_bump_2048.jpg"),
    bumpScale: 0.1,
    side: THREE.FrontSide
  });
  earth = new THREE.Mesh(earthGeo, earthMat);
  earth.rotation.z = THREE.MathUtils.degToRad(23.5);
  scene.add(earth);

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

    const start = new THREE.Vector3(500, 80, 0);
    let end = new THREE.Vector3(150, 0, 0);
   const astGeo = new THREE.IcosahedronGeometry(10, 1);
  const astMat = new THREE.MeshPhongMaterial({ 
    color: 0x8b7355,
    flatShading: true,
    emissive: 0x332211
  });
  asteroid = new THREE.Mesh(astGeo, astMat);
  asteroid.position.set(300, 0, 0);
  scene.add(asteroid);


  createOrbitLine();

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const sun = new THREE.DirectionalLight(0xffffff, 0.8);
  sun.position.set(500, 200, 300);
  scene.add(sun);
}

function createOrbitLine() {
  if (orbitLine) scene.remove(orbitLine);
  
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(angle) * asteroidDistance,
      0,
      Math.sin(angle) * asteroidDistance
    ));
  }
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x4ecdc4, opacity: 0.3, transparent: true });
  orbitLine = new THREE.Line(geometry, material);
  scene.add(orbitLine);
}

window.setLesson = function(index) {
  currentLesson = index;
  document.querySelectorAll('.lesson-step').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });
  
  document.getElementById('lesson-content').innerHTML = lessons[index].content;
  
  clearDeflectionVisuals();
  
  if (index !== 2) {
    isOrbiting = false;
  }
  
  if (index === 3 || index === 4) {
    document.getElementById('info-display').style.display = 'block';
  } else {
    document.getElementById('info-display').style.display = 'none';
  }
  
  if (index === 3) {
    calculateImpact();
  }
}

window.setAsteroidSize = function(size) {
  asteroidSize = size;
  const scale = size / 50;
  asteroid.scale.set(scale, scale, scale);
  
  document.querySelectorAll('.asteroid-selector .asteroid-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  event.target.classList.add('selected');
}

window.updateSize = function(val) {
  document.getElementById('size-value-2').textContent = val + ' m';
  calculateImpact();
}

window.updateSpeedCalc = function(val) {
  document.getElementById('speed-value-2').textContent = val + ' km/s';
  calculateImpact();
}

window.calculateImpact = function() {
  const size = parseFloat(document.getElementById('size-slider')?.value || 50);
  const speed = parseFloat(document.getElementById('speed-slider-2')?.value || 15);
  
  const radius = size / 2;
  const volume = (4/3) * Math.PI * Math.pow(radius, 3);
  const density = 2500;
  const mass = volume * density;
  
  const speedMs = speed * 1000;
  const kineticEnergy = 0.5 * mass * speedMs * speedMs;
  const megatons = kineticEnergy / 4.184e15;
  
  const craterRadius = Math.pow(megatons, 0.25) * 100;
  
  document.getElementById('calculation-content').innerHTML = `
    <div class="info-card">
      <div class="info-title">Mass</div>
      <div class="info-value">${(mass/1000000).toFixed(1)}<span class="info-unit">million kg</span></div>
    </div>
    <div class="info-card">
      <div class="info-title">Impact Energy</div>
      <div class="info-value">${megatons.toFixed(2)}<span class="info-unit">Megatons TNT</span></div>
    </div>
    <div class="info-card">
      <div class="info-title">Crater Radius</div>
      <div class="info-value">${craterRadius.toFixed(0)}<span class="info-unit">meters</span></div>
    </div>
    <div class="fact-box">
      <div class="fact-title">Comparison</div>
      <div class="fact-text">
        ${megatons < 1 ? 'Small explosion - damages local area' : 
          megatons < 10 ? 'City-destroyer - like hundreds of atomic bombs' :
          megatons < 100 ? 'Regional disaster - destroys entire cities' :
          'Global catastrophe - could affect the whole planet!'}
      </div>
    </div>
  `;
}

window.showDefenseInfo = function(index) {
  const info = defenseInfo[index];
  document.getElementById('calculation-content').innerHTML = `
    <div class="info-card" style="padding: 20px;">
      <div class="info-title" style="font-size: 18px; margin-bottom: 15px;">${info.name}</div>
      <div style="font-size: 14px; line-height: 1.7; color: #fff;">${info.desc}</div>
    </div>
    <div class="fact-box">
      <div class="fact-title">Key Point</div>
      <div class="fact-text">The earlier we detect an asteroid, the easier it is to deflect! Even a tiny push years in advance can make it miss Earth completely.</div>
    </div>
  `;
  document.getElementById('info-display').style.display = 'block';
}

window.showQuiz = function() {
  quizIndex = 0;
  score = 0;
  document.getElementById('quiz-modal').style.display = 'flex';
  displayQuestion();
}

function displayQuestion() {
  const q = quizQuestions[quizIndex];
  document.getElementById('quiz-question').textContent = `Question ${quizIndex + 1}: ${q.question}`;
  
  const optionsHTML = q.options.map((opt, i) => 
    `<div class="quiz-option" onclick="checkAnswer(${i})">${opt}</div>`
  ).join('');
  
  document.getElementById('quiz-options').innerHTML = optionsHTML;
  document.getElementById('quiz-next').style.display = 'none';
  document.getElementById('quiz-close').style.display = 'none';
}

window.checkAnswer = function(selected) {
  const q = quizQuestions[quizIndex];
  const options = document.querySelectorAll('.quiz-option');
  
  options.forEach((opt, i) => {
    opt.style.pointerEvents = 'none';
    if (i === q.correct) {
      opt.classList.add('correct');
    } else if (i === selected && i !== q.correct) {
      opt.classList.add('wrong');
    }
  });
  
  if (selected === q.correct) {
    score++;
  }
  
  if (quizIndex < quizQuestions.length - 1) {
    document.getElementById('quiz-next').style.display = 'block';
  } else {
    showFinalScore();
  }
}

window.nextQuestion = function() {
  quizIndex++;
  displayQuestion();
}

function showFinalScore() {
  const percentage = (score / quizQuestions.length) * 100;
  
  document.getElementById('quiz-question').textContent = `Quiz Complete!`;
  document.getElementById('quiz-options').innerHTML = `
    <div class="info-card" style="padding: 25px; margin: 20px 0;">
      <div class="info-title" style="font-size: 18px;">Your Score</div>
      <div class="info-value" style="font-size: 48px; color: ${percentage >= 80 ? '#44ff88' : percentage >= 60 ? '#ffaa44' : '#ff6b6b'}">
        ${score} / ${quizQuestions.length}
      </div>
      <div style="margin-top: 15px; font-size: 16px;">
        ${percentage >= 80 ? 'Excellent! You really understand asteroids!' :
          percentage >= 60 ? 'Good job! Keep learning!' :
          'Keep studying - you can do better!'}
      </div>
    </div>
  `;
  
  document.getElementById('quiz-close').style.display = 'block';
}

window.closeQuiz = function() {
  document.getElementById('quiz-modal').style.display = 'none';
}

window.togglePanel = function(panelId) {
  const panel = document.getElementById(panelId);
  const btn = panel.querySelector('.minimize-btn');
  
  if (panel.classList.contains('minimized')) {
    panel.classList.remove('minimized');
    btn.textContent = '−';
    btn.title = 'Minimize';
  } else {
    panel.classList.add('minimized');
    btn.textContent = '+';
    btn.title = 'Expand';
  }
}

window.updatePrediction = function() {
  const size = parseFloat(document.getElementById('pred-size-slider')?.value || 50);
  const warning = parseFloat(document.getElementById('warning-slider')?.value || 5);
  
  document.getElementById('pred-size-value').textContent = size + ' m';
  document.getElementById('warning-value').textContent = warning + ' yrs';
}

window.testSingleMethod = function(methodType) {
  const size = parseFloat(document.getElementById('pred-size-slider')?.value || 50);
  const warning = parseFloat(document.getElementById('warning-slider')?.value || 5);
  
  const methodNames = {
    'kinetic': 'Kinetic Impactor',
    'nuclear': 'Nuclear Device',
    'gravity': 'Gravity Tractor',
    'laser': 'Laser Ablation'
  };
  
  const effectiveness = calculateEffectiveness(size, warning, methodType);
  const status = effectiveness >= 70 ? 'Highly Effective' : effectiveness >= 40 ? 'Moderately Effective' : 'Not Recommended';
  const barColor = effectiveness >= 70 ? '#44ff88' : effectiveness >= 40 ? '#ffaa44' : '#ff6b6b';
  
  const resultsHTML = `
    <div style="margin-top: 15px;">
      <div style="background: rgba(78, 205, 196, 0.15); border-radius: 10px; padding: 15px; border: 2px solid ${barColor};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 14px; font-weight: 600;">${methodNames[methodType]}</span>
          <span style="font-size: 18px; font-weight: 700; color: ${barColor};">${effectiveness}%</span>
        </div>
        <div style="background: rgba(78, 205, 196, 0.2); height: 12px; border-radius: 6px; overflow: hidden; margin-bottom: 8px;">
          <div style="background: ${barColor}; height: 100%; width: ${effectiveness}%; transition: width 0.5s;"></div>
        </div>
        <div style="font-size: 11px; color: ${barColor}; font-weight: 600; text-align: center;">${status}</div>
      </div>
    </div>
  `;
  
  document.getElementById('deflection-results').innerHTML = resultsHTML;
  showDeflectionVisual(methodType, methodNames[methodType]);
}

function calculateEffectiveness(size, warning, method) {
  let base = 0;
  
  switch(method) {
    case 'kinetic':
      base = 80;
      if (size > 100) base -= 20;
      if (warning < 2) base -= 30;
      break;
    case 'nuclear':
      base = 85;
      if (size > 150) base -= 15;
      if (warning < 1) base -= 25;
      break;
    case 'gravity':
      base = 70;
      if (size > 80) base -= 10;
      if (warning < 5) base -= 35;
      break;
    case 'laser':
      base = 65;
      if (size > 120) base -= 25;
      if (warning < 3) base -= 30;
      break;
  }
  
  base += Math.min(warning * 3, 15);
  
  return Math.max(0, Math.min(100, Math.round(base)));
}

function clearDeflectionVisuals() {
  deflectionVisuals.forEach(obj => {
    scene.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
  });
  deflectionVisuals = [];
  
  if (impactorShip) {
    scene.remove(impactorShip);
    impactorShip = null;
  }
  if (laserBeam) {
    scene.remove(laserBeam);
    laserBeam = null;
  }
}

function showDeflectionVisual(methodType, methodName) {
  clearDeflectionVisuals();
  
  document.getElementById('info-display').style.display = 'block';
  
  let description = '';
  const earthPos = earth.position.clone();
  
  if (methodType === 'kinetic') {
    description = 'A spacecraft launches from Earth and crashes into the asteroid at high speed, transferring momentum to change its trajectory.';
    
    const shipGeo = new THREE.ConeGeometry(4, 12, 4);
    const shipMat = new THREE.MeshPhongMaterial({ 
      color: 0x4ecdc4, 
      emissive: 0x4ecdc4,
      emissiveIntensity: 0.5
    });
    impactorShip = new THREE.Mesh(shipGeo, shipMat);
    impactorShip.position.copy(earthPos);
    impactorShip.position.x += 50;
    impactorShip.lookAt(asteroid.position);
    scene.add(impactorShip);
    deflectionVisuals.push(impactorShip);
    
    const trailGeo = new THREE.CylinderGeometry(1, 0.5, 8, 8);
    const trailMat = new THREE.MeshBasicMaterial({ 
      color: 0xff9f40, 
      transparent: true, 
      opacity: 0.6 
    });
    const trail = new THREE.Mesh(trailGeo, trailMat);
    trail.position.set(0, -8, 0);
    impactorShip.add(trail);
    
    animateImpactor();
  } else if (methodType === 'laser') {
    description = 'A laser platform launches from Earth and fires powerful lasers that vaporize the asteroid surface, creating thrust.';
    
    const sourceGeo = new THREE.BoxGeometry(6, 6, 6);
    const sourceMat = new THREE.MeshPhongMaterial({ 
      color: 0xff9f40,
      emissive: 0xff9f40,
      emissiveIntensity: 0.7
    });
    const source = new THREE.Mesh(sourceGeo, sourceMat);
    source.position.copy(earthPos);
    source.position.x += 50;
    scene.add(source);
    deflectionVisuals.push(source);
    
    animateLaserPlatform(source);
  } else if (methodType === 'nuclear') {
    description = 'A nuclear device launches from Earth and detonates near the asteroid, vaporizing one side to create thrust.';
    
    const bombGeo = new THREE.SphereGeometry(2, 16, 16);
    const bombMat = new THREE.MeshPhongMaterial({ 
      color: 0xff6b6b,
      emissive: 0xff0000,
      emissiveIntensity: 0.8
    });
    const bomb = new THREE.Mesh(bombGeo, bombMat);
    bomb.position.copy(earthPos);
    bomb.position.x += 50;
    scene.add(bomb);
    deflectionVisuals.push(bomb);
    
    animateNuclear(bomb);
  } else if (methodType === 'gravity') {
    description = 'A gravity tractor spacecraft launches from Earth and hovers near the asteroid, slowly tugging it with gravity.';
    
    const tractorGeo = new THREE.BoxGeometry(6, 3, 6);
    const tractorMat = new THREE.MeshPhongMaterial({ 
      color: 0x667eea,
      emissive: 0x667eea,
      emissiveIntensity: 0.5
    });
    const tractor = new THREE.Mesh(tractorGeo, tractorMat);
    tractor.position.copy(earthPos);
    tractor.position.x += 50;
    scene.add(tractor);
    deflectionVisuals.push(tractor);
    
    animateGravityTractor(tractor);
  }
  
  document.getElementById('calculation-content').innerHTML = `
    <div class="info-card" style="padding: 20px;">
      <div class="info-title" style="font-size: 16px; margin-bottom: 12px; color: #4ecdc4;">
        ${methodName}
      </div>
      <div style="font-size: 13px; line-height: 1.7; color: #fff; margin-bottom: 15px;">
        ${description}
      </div>
      <div style="background: rgba(78, 205, 196, 0.2); padding: 10px; border-radius: 8px; border-left: 3px solid #4ecdc4;">
        <div style="font-size: 11px; color: #4ecdc4; font-weight: 600; margin-bottom: 5px;">WATCH THE SIMULATION</div>
        <div style="font-size: 11px; color: #fff;">The projectile launches from Earth and travels to the asteroid!</div>
      </div>
    </div>
  `;
}

function animateImpactor() {
  if (!impactorShip || !scene.getObjectById(impactorShip.id)) return;
  
  const target = asteroid.position.clone();
  const direction = target.clone().sub(impactorShip.position).normalize();
  
  impactorShip.position.add(direction.multiplyScalar(2));
  impactorShip.lookAt(asteroid.position);
  
  const distance = impactorShip.position.distanceTo(asteroid.position);
  
  if (distance < 15) {
    createImpactEffect();
    scene.remove(impactorShip);
    impactorShip = null;
    
    const pushDir = direction.clone().multiplyScalar(5);
    asteroid.position.add(pushDir);
    
    return;
  }
  
  requestAnimationFrame(animateImpactor);
}

function animateLaserPlatform(platform) {
  if (!platform || !scene.getObjectById(platform.id)) return;
  
  const target = asteroid.position.clone();
  target.x -= 50;
  const direction = target.clone().sub(platform.position).normalize();
  
  platform.position.add(direction.multiplyScalar(1.5));
  
  const distance = platform.position.distanceTo(target);
  
  if (distance < 10) {
    const beamGeo = new THREE.CylinderGeometry(1, 1, 50, 16);
    const beamMat = new THREE.MeshBasicMaterial({ 
      color: 0xff9f40, 
      transparent: true, 
      opacity: 0.8,
      emissive: 0xff9f40,
      emissiveIntensity: 1
    });
    laserBeam = new THREE.Mesh(beamGeo, beamMat);
    laserBeam.position.copy(platform.position);
    laserBeam.lookAt(asteroid.position);
    laserBeam.rotateX(Math.PI / 2);
    scene.add(laserBeam);
    deflectionVisuals.push(laserBeam);
    
    animateLaser();
    return;
  }
  
  requestAnimationFrame(() => animateLaserPlatform(platform));
}

// CONTINUATION OF main.js - Add this after the previous code

function animateLaser() {
  if (!laserBeam || !scene.getObjectById(laserBeam.id)) return;
  
  laserBeam.material.opacity = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
  laserBeam.scale.x = laserBeam.scale.z = 1 + Math.sin(Date.now() * 0.01) * 0.2;
  
  if (Math.random() < 0.3) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(1),
      new THREE.MeshBasicMaterial({ 
        color: 0xff9f40, 
        transparent: true, 
        opacity: 0.8 
      })
    );
    particle.position.copy(asteroid.position);
    particle.position.x += (Math.random() - 0.5) * 10;
    particle.position.y += (Math.random() - 0.5) * 10;
    particle.position.z += (Math.random() - 0.5) * 10;
    scene.add(particle);
    deflectionVisuals.push(particle);
    
    setTimeout(() => {
      scene.remove(particle);
    }, 1000);
  }
  
  requestAnimationFrame(animateLaser);
}

function animateNuclear(bomb) {
  if (!bomb || !scene.getObjectById(bomb.id)) return;
  
  const target = asteroid.position.clone();
  target.x -= 30;
  const direction = target.clone().sub(bomb.position).normalize();
  
  bomb.position.add(direction.multiplyScalar(2));
  
  const distance = bomb.position.distanceTo(target);
  
  if (distance < 15) {
    createNuclearExplosion(bomb.position);
    scene.remove(bomb);
    
    const pushDir = new THREE.Vector3(1, 0, 0).multiplyScalar(8);
    asteroid.position.add(pushDir);
    
    return;
  }
  
  requestAnimationFrame(() => animateNuclear(bomb));
}

function animateGravityTractor(tractor) {
  if (!tractor || !scene.getObjectById(tractor.id)) return;
  
  const target = asteroid.position.clone();
  target.x -= 30;
  const direction = target.clone().sub(tractor.position).normalize();
  
  tractor.position.add(direction.multiplyScalar(1.5));
  
  const distance = tractor.position.distanceTo(target);
  
  if (distance < 10) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * 20, 0, Math.sin(angle) * 20)
      ]);
      const lineMat = new THREE.LineBasicMaterial({ 
        color: 0x667eea, 
        transparent: true, 
        opacity: 0.4 
      });
      const line = new THREE.Line(lineGeo, lineMat);
      tractor.add(line);
    }
    
    animateGravity(tractor);
    return;
  }
  
  requestAnimationFrame(() => animateGravityTractor(tractor));
}

function animateGravity(tractor) {
  if (!tractor || !scene.getObjectById(tractor.id)) return;
  
  tractor.rotation.y += 0.01;
  
  requestAnimationFrame(() => animateGravity(tractor));
}

function createImpactEffect() {
  const flash = new THREE.PointLight(0x4ecdc4, 5, 100);
  flash.position.copy(asteroid.position);
  scene.add(flash);
  
  for (let i = 0; i < 20; i++) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.5 + Math.random()),
      new THREE.MeshBasicMaterial({ 
        color: 0x4ecdc4,
        transparent: true,
        opacity: 1
      })
    );
    
    particle.position.copy(asteroid.position);
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2;
    
    particle.userData = {
      vx: Math.cos(angle) * speed,
      vy: (Math.random() - 0.5) * speed,
      vz: Math.sin(angle) * speed,
      life: 30
    };
    
    scene.add(particle);
    animateParticle(particle);
  }
  
  setTimeout(() => scene.remove(flash), 100);
}

function createNuclearExplosion(position) {
  const flash = new THREE.PointLight(0xff0000, 10, 200);
  flash.position.copy(position);
  scene.add(flash);
  
  for (let i = 0; i < 50; i++) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(1 + Math.random() * 2),
      new THREE.MeshBasicMaterial({ 
        color: new THREE.Color().setHSL(0.05 + Math.random() * 0.1, 1, 0.5),
        transparent: true,
        opacity: 1
      })
    );
    
    particle.position.copy(position);
    
    const angle = Math.random() * Math.PI * 2;
    const elevation = (Math.random() - 0.5) * Math.PI;
    const speed = 2 + Math.random() * 3;
    
    particle.userData = {
      vx: Math.cos(angle) * Math.cos(elevation) * speed,
      vy: Math.sin(elevation) * speed,
      vz: Math.sin(angle) * Math.cos(elevation) * speed,
      life: 60
    };
    
    scene.add(particle);
    animateExplosionParticle(particle);
  }
  
  setTimeout(() => scene.remove(flash), 100);
}

function animateParticle(p) {
  if (p.userData.life-- <= 0 || !scene.getObjectById(p.id)) {
    scene.remove(p);
    return;
  }
  
  p.position.x += p.userData.vx;
  p.position.y += p.userData.vy;
  p.position.z += p.userData.vz;
  p.material.opacity = p.userData.life / 30;
  p.scale.multiplyScalar(0.95);
  
  requestAnimationFrame(() => animateParticle(p));
}

function animateExplosionParticle(p) {
  if (p.userData.life-- <= 0 || !scene.getObjectById(p.id)) {
    scene.remove(p);
    if (p.geometry) p.geometry.dispose();
    if (p.material) p.material.dispose();
    return;
  }
  
  p.position.x += p.userData.vx;
  p.position.y += p.userData.vy;
  p.position.z += p.userData.vz;
  
  p.userData.vy -= 0.1;
  
  p.material.opacity = p.userData.life / 60;
  p.scale.multiplyScalar(0.98);
  
  requestAnimationFrame(() => animateExplosionParticle(p));
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  
  earth.rotation.y += 0.001;
  asteroid.rotation.x += 0.005;
  asteroid.rotation.y += 0.003;
  
  if (isOrbiting) {
    orbitAngle += asteroidSpeed * 0.01;
    
    const x = Math.cos(orbitAngle) * asteroidDistance;
    const z = Math.sin(orbitAngle) * asteroidDistance;
    
    asteroid.position.x = x;
    asteroid.position.z = z;
    
    const distToEarth = asteroid.position.distanceTo(earth.position);
    
    if (distToEarth < 45) {
      createNuclearExplosion(asteroid.position);
      orbitAngle += Math.PI;
    }
  }
  
  if (controls && controls.update) controls.update();
  renderer.render(scene, camera);
}

init();