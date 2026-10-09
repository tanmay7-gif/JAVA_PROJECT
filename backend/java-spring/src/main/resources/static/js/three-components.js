/**
 * FitPulse Client-Side Interactive Telemetry Engine
 * Standard naming: ActivityMetricsVisualizer, BodyModel, CategoryDistributionChart, PerformanceVolumeChart
 */

window.FitPulseVisuals = {
  // 1. ActivityMetricsVisualizer (Daily Pulse View)
  initActivityVisualizer: function (containerId, completionPercent) {
    const container = document.getElementById(containerId);
    if (!container || !window.THREE) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Physical Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(4, 5, 4);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x34D399, 1.0, 10);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // Organic Telemetry Orb
    const sphereGeo = new THREE.SphereGeometry(1.3, 64, 64);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0x10B981,
      emissive: 0x10B981,
      emissiveIntensity: 0.22,
      roughness: 0.18,
      metalness: 0.08,
      transmission: 0.88,
      ior: 1.35,
      transparent: true,
      opacity: 0.92,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // Internal Translucent Geometric Cage
    const cageGeo = new THREE.IcosahedronGeometry(1.02, 2);
    const cageMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    scene.add(cage);

    // Orbiting Satellite Beacon
    const satGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const satMat = new THREE.MeshStandardMaterial({ color: 0x34D399, emissive: 0x34D399, emissiveIntensity: 0.9 });
    const satellite = new THREE.Mesh(satGeo, satMat);
    scene.add(satellite);

    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      t += 0.02;

      sphere.rotation.y = t * 0.35;
      sphere.rotation.x = Math.sin(t * 0.25) * 0.12;
      const pulse = 1 + Math.sin(t * 2) * 0.035;
      sphere.scale.set(pulse, pulse, pulse);

      cage.rotation.y = -t * 0.25;
      cage.rotation.z = t * 0.15;

      satellite.position.x = Math.cos(t * 1.2) * 1.75;
      satellite.position.z = Math.sin(t * 1.2) * 1.75;
      satellite.position.y = Math.sin(t * 1.6) * 0.45;

      renderer.render(scene, camera);
    }
    animate();
  },

  // 2. BodyModel: Realistic Human Anatomy with Muscle Definition and Hotspots
  initBodyModel: function (containerId, tooltipId) {
    const container = document.getElementById(containerId);
    const tooltip = document.getElementById(tooltipId);
    if (!container || !window.THREE) return;

    const width = container.clientWidth || 440;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.35, 4.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Anatomical Physical Lighting (Key, Fill, and Mint Rim Lighting)
    scene.add(new THREE.AmbientLight(0xFFFFFF, 1.2));

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.4);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xF1F5F9, 0.8);
    fillLight.position.set(-4, 3, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x34D399, 0.65);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    const bodyGroup = new THREE.Group();
    scene.add(bodyGroup);

    // Realistic Anatomical Skin Shader (Subsurface porcelain skin feel)
    const anatomicalSkinMat = new THREE.MeshPhysicalMaterial({
      color: 0xFAF8F5,
      roughness: 0.28,
      metalness: 0.0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.2,
      reflectivity: 0.85,
    });

    const muscleHighlightMat = new THREE.MeshPhysicalMaterial({
      color: 0xF3F4F3,
      roughness: 0.24,
      metalness: 0.05,
      clearcoat: 0.45,
    });

    // Anatomically Sculpted Head & Cranium
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 36, 36), anatomicalSkinMat);
    head.position.set(0, 1.58, 0);
    head.scale.set(1.0, 1.15, 1.08);
    bodyGroup.add(head);

    // Athletic Cervical Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.22, 24), anatomicalSkinMat);
    neck.position.set(0, 1.32, 0);
    bodyGroup.add(neck);

    // Upper Torso / Pectoralis Major Plates (Clavicular & Sternal Heads)
    const upperTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 0.48, 32), anatomicalSkinMat);
    upperTorso.position.set(0, 1.0, 0);
    upperTorso.scale.set(1.15, 1.0, 0.72);
    bodyGroup.add(upperTorso);

    // Sculpted Left & Right Pectorals
    const leftPec = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), muscleHighlightMat);
    leftPec.position.set(-0.16, 1.02, 0.12);
    leftPec.scale.set(1.1, 0.75, 0.55);
    bodyGroup.add(leftPec);

    const rightPec = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), muscleHighlightMat);
    rightPec.position.set(0.16, 1.02, 0.12);
    rightPec.scale.set(1.1, 0.75, 0.55);
    bodyGroup.add(rightPec);

    // Latissimus Dorsi Back Contours
    const leftLat = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.45, 20), muscleHighlightMat);
    leftLat.position.set(-0.32, 0.95, -0.06);
    leftLat.rotation.z = -0.25;
    bodyGroup.add(leftLat);

    const rightLat = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.45, 20), muscleHighlightMat);
    rightLat.position.set(0.32, 0.95, -0.06);
    rightLat.rotation.z = 0.25;
    bodyGroup.add(rightLat);

    // Rectus Abdominis / Core (Segmented Natural Muscles)
    const midTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.28, 0.42, 28), anatomicalSkinMat);
    midTorso.position.set(0, 0.58, 0);
    midTorso.scale.set(1.05, 1.0, 0.72);
    bodyGroup.add(midTorso);

    // Natural Abdominal Muscle Definitions
    [
      { x: -0.08, y: 0.68 }, { x: 0.08, y: 0.68 },
      { x: -0.08, y: 0.54 }, { x: 0.08, y: 0.54 },
      { x: -0.07, y: 0.40 }, { x: 0.07, y: 0.40 }
    ].forEach((p) => {
      const abNode = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 18), muscleHighlightMat);
      abNode.position.set(p.x, p.y, 0.14);
      abNode.scale.set(1.1, 0.7, 0.35);
      bodyGroup.add(abNode);
    });

    // Deltoids & Shoulders
    const leftDeltoid = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), muscleHighlightMat);
    leftDeltoid.position.set(-0.46, 1.08, 0);
    leftDeltoid.scale.set(1.0, 1.15, 1.0);
    bodyGroup.add(leftDeltoid);

    const rightDeltoid = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), muscleHighlightMat);
    rightDeltoid.position.set(0.46, 1.08, 0);
    rightDeltoid.scale.set(1.0, 1.15, 1.0);
    bodyGroup.add(rightDeltoid);

    // Biceps & Arms
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.72, 20), anatomicalSkinMat);
    leftArm.position.set(-0.46, 0.62, 0);
    bodyGroup.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.72, 20), anatomicalSkinMat);
    rightArm.position.set(0.46, 0.62, 0);
    bodyGroup.add(rightArm);

    // Pelvic Girdle
    const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.26, 24), anatomicalSkinMat);
    pelvis.position.set(0, 0.26, 0);
    pelvis.scale.set(1.1, 1.0, 0.78);
    bodyGroup.add(pelvis);

    // Quadriceps Femoris & Legs (Anatomically Contoured)
    const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.11, 0.72, 24), anatomicalSkinMat);
    leftThigh.position.set(-0.19, -0.22, 0);
    bodyGroup.add(leftThigh);

    const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.11, 0.72, 24), anatomicalSkinMat);
    rightThigh.position.set(0.19, -0.22, 0);
    bodyGroup.add(rightThigh);

    // Vastus Medialis Teardrop Contours
    const leftVastus = new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 18), muscleHighlightMat);
    leftVastus.position.set(-0.14, -0.45, 0.08);
    leftVastus.scale.set(0.8, 1.2, 0.6);
    bodyGroup.add(leftVastus);

    const rightVastus = new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 18), muscleHighlightMat);
    rightVastus.position.set(0.14, -0.45, 0.08);
    rightVastus.scale.set(0.8, 1.2, 0.6);
    bodyGroup.add(rightVastus);

    // Calves (Gastrocnemius)
    const leftCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.62, 20), anatomicalSkinMat);
    leftCalf.position.set(-0.19, -0.86, 0);
    bodyGroup.add(leftCalf);

    const rightCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.62, 20), anatomicalSkinMat);
    rightCalf.position.set(0.19, -0.86, 0);
    bodyGroup.add(rightCalf);

    // Pedestal Base Plate
    const basePlate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.25, 0.06, 40),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.15, metalness: 0.05 })
    );
    basePlate.position.set(0, -1.22, 0);
    bodyGroup.add(basePlate);

    // Dynamic Hotspots for Muscle Telemetry
    const hotspots = [
      { name: 'Pectoralis Major', recovery: '94% Optimal', pr: 'Bench Press: 105 kg', sets: '12 sets', pos: [0, 1.05, 0.22] },
      { name: 'Rectus Abdominis', recovery: '88% Fresh', pr: 'Hanging Leg Raise: 20 reps', sets: '8 sets', pos: [0, 0.58, 0.19] },
      { name: 'Deltoid Complex', recovery: '62% Recovering', pr: 'Overhead Press: 65 kg', sets: '10 sets', pos: [0.46, 1.1, 0.08] },
      { name: 'Latissimus Dorsi', recovery: '78% Optimal', pr: 'Weighted Pull-Up: +24 kg', sets: '14 sets', pos: [0, 0.95, -0.22] },
      { name: 'Quadriceps Femoris', recovery: '55% Active Fatigue', pr: 'Back Squat: 140 kg', sets: '16 sets', pos: [0.2, -0.25, 0.16] }
    ];

    const hotspotMeshes = [];
    hotspots.forEach((h) => {
      const hGroup = new THREE.Group();
      hGroup.position.set(h.pos[0], h.pos[1], h.pos[2]);

      const hMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 18, 18),
        new THREE.MeshStandardMaterial({ color: 0x10B981, emissive: 0x34D399, emissiveIntensity: 1.1, roughness: 0.2 })
      );
      hMesh.userData = h;
      hGroup.add(hMesh);

      // Subtle Outer Pulsing Ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.08, 0.11, 24),
        new THREE.MeshBasicMaterial({ color: 0x34D399, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      );
      ring.rotation.x = Math.PI / 2;
      hGroup.add(ring);

      bodyGroup.add(hGroup);
      hotspotMeshes.push(hMesh);
    });

    // 360° Mouse-Drag Orbit with Dampened Spring Physics
    let isDragging = false;
    let prevMouseX = 0;
    let targetRotationY = 0;

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      prevMouseX = e.clientX;
      targetRotationY += deltaX * 0.007;
    });

    // Raycast Interaction on Hotspots
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    container.addEventListener('click', (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hotspotMeshes);

      if (intersects.length > 0 && tooltip) {
        const data = intersects[0].object.userData;
        tooltip.innerHTML = `
          <div style="font-weight:800; color:#111827; margin-bottom:2px; font-size:12px;">${data.name}</div>
          <div style="color:#059669; font-weight:700; font-size:11px;">Status: ${data.recovery}</div>
          <div style="color:#4B5563; font-size:11px; margin-top:2px;">Personal Record: ${data.pr}</div>
          <div style="color:#9CA3AF; font-size:10px; margin-top:2px;">${data.sets} recorded this cycle</div>
        `;
        tooltip.style.left = `${e.clientX - rect.left}px`;
        tooltip.style.top = `${e.clientY - rect.top}px`;
        tooltip.style.display = 'block';
      } else if (tooltip) {
        tooltip.style.display = 'none';
      }
    });

    function animate() {
      requestAnimationFrame(animate);
      bodyGroup.rotation.y += (targetRotationY - bodyGroup.rotation.y) * 0.08;
      renderer.render(scene, camera);
    }
    animate();
  },

  // 3. CategoryDistributionChart: Extruded Donut with Hover Elevation
  initCategoryDistributionChart: function (containerId, data) {
    const container = document.getElementById(containerId);
    if (!container || !window.THREE) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.7, 3.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dir = new THREE.DirectionalLight(0xffffff, 1.4);
    dir.position.set(3, 5, 3);
    scene.add(dir);

    const chartGroup = new THREE.Group();
    scene.add(chartGroup);

    const categories = data || [
      { name: 'Cardio', val: 35, color: 0x10B981 },
      { name: 'Strength', val: 40, color: 0x059669 },
      { name: 'Flexibility', val: 15, color: 0x14B8A6 },
      { name: 'HIIT', val: 10, color: 0x38BDF8 }
    ];

    let currentAngle = 0;
    const slices = [];

    categories.forEach((cat) => {
      const angle = (cat.val / 100) * Math.PI * 2;
      const geo = new THREE.CylinderGeometry(1.4, 1.42, 0.45, 36, 1, false, currentAngle, angle);
      const mat = new THREE.MeshPhysicalMaterial({
        color: cat.color,
        emissive: cat.color,
        emissiveIntensity: 0.15,
        roughness: 0.15,
        clearcoat: 0.85,
        reflectivity: 0.9,
      });
      const slice = new THREE.Mesh(geo, mat);
      slice.userData = { name: cat.name, val: cat.val };
      chartGroup.add(slice);
      slices.push(slice);
      currentAngle += angle;
    });

    // Central Porcelain Core (Donut Hole)
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.64, 0.64, 0.48, 36),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.1 })
    );
    chartGroup.add(core);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredSlice = null;

    container.addEventListener('mousemove', (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(slices);

      if (intersects.length > 0) {
        hoveredSlice = intersects[0].object;
        renderer.domElement.style.cursor = 'pointer';
      } else {
        hoveredSlice = null;
        renderer.domElement.style.cursor = 'auto';
      }
    });

    function animate() {
      requestAnimationFrame(animate);
      chartGroup.rotation.y += 0.004;

      slices.forEach((s) => {
        const isHovered = s === hoveredSlice;
        const targetY = isHovered ? 0.35 : 0;
        s.position.y += (targetY - s.position.y) * 0.15;
        s.material.emissiveIntensity = isHovered ? 0.85 : 0.15;
      });

      renderer.render(scene, camera);
    }
    animate();
  },

  // 4. PerformanceVolumeChart: Volumetric Columns with Raycasting
  initPerformanceVolumeChart: function (containerId, data) {
    const container = document.getElementById(containerId);
    if (!container || !window.THREE) return;

    const width = container.clientWidth || 560;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.3, 4.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dir = new THREE.DirectionalLight(0xffffff, 1.4);
    dir.position.set(4, 5, 4);
    scene.add(dir);

    const chartGroup = new THREE.Group();
    chartGroup.position.set(0, -0.65, 0);
    scene.add(chartGroup);

    // Ground Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 1.8),
      new THREE.MeshStandardMaterial({ color: 0xFAFCFA, roughness: 0.35 })
    );
    floor.rotation.x = -Math.PI / 2;
    chartGroup.add(floor);

    const points = data || [
      { day: 'Mon', val: 480 },
      { day: 'Tue', val: 620 },
      { day: 'Wed', val: 350 },
      { day: 'Thu', val: 750 },
      { day: 'Fri', val: 520 },
      { day: 'Sat', val: 840 },
      { day: 'Sun', val: 410 }
    ];

    const maxVal = Math.max(...points.map(p => p.val));
    const bars = [];
    const spacing = 0.62;
    const startX = -((points.length - 1) * spacing) / 2;

    points.forEach((p, idx) => {
      const height = (p.val / maxVal) * 1.9 + 0.15;
      const geo = new THREE.BoxGeometry(0.36, 1, 0.36);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x10B981,
        emissive: 0x059669,
        emissiveIntensity: 0.25,
        roughness: 0.14,
        clearcoat: 0.85,
      });
      const bar = new THREE.Mesh(geo, mat);
      bar.position.set(startX + idx * spacing, height / 2, 0);
      bar.scale.y = height;
      bar.userData = p;
      chartGroup.add(bar);
      bars.push(bar);
    });

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
  }
};
