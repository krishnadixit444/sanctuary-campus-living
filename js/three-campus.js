/**
 * Sanctuary Living - 3D Campus Masterplan Scene
 * Built with Three.js r128
 */

class Campus3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.buildings = [];
    this.shuttles = [];
    this.particles = null;
    this.lights = {};
    this.time = 0;
    this.currentMode = 'night'; // default futuristic night glow
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.init();
  }

  init() {
    const width = this.container.clientWidth > 50 ? this.container.clientWidth : 800;
    const height = this.container.clientHeight > 50 ? this.container.clientHeight : 550;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913);
    this.scene.fog = new THREE.FogExp2(0x060913, 0.012);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    this.camera.position.set(48, 38, 55);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls
    if (window.THREE && window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2.1;
      this.controls.minDistance = 20;
      this.controls.maxDistance = 140;
      this.controls.target.set(0, 4, 0);
    }

    // Build the Campus Elements
    this.setupLighting();
    this.createGround();
    this.createRoadsAndPaths();
    this.createBuildings();
    this.createSolarArrays();
    this.createLandscaping();
    this.createNightShuttles();
    this.createAtmosphericParticles();

    // Event Listeners
    window.addEventListener('resize', () => this.onWindowResize());
    this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.container.addEventListener('click', (e) => this.onClick(e));

    // Animation Loop
    this.animate();
  }

  setupLighting() {
    // Ambient Light
    this.lights.ambient = new THREE.AmbientLight(0x1e293b, 1.2);
    this.scene.add(this.lights.ambient);

    // Main Sun / Moon Key Light
    this.lights.sun = new THREE.DirectionalLight(0x38bdf8, 1.8);
    this.lights.sun.position.set(40, 60, 30);
    this.lights.sun.castShadow = true;
    this.lights.sun.shadow.mapSize.width = 2048;
    this.lights.sun.shadow.mapSize.height = 2048;
    this.lights.sun.shadow.camera.near = 10;
    this.lights.sun.shadow.camera.far = 160;
    const d = 45;
    this.lights.sun.shadow.camera.left = -d;
    this.lights.sun.shadow.camera.right = d;
    this.lights.sun.shadow.camera.top = d;
    this.lights.sun.shadow.camera.bottom = -d;
    this.lights.sun.shadow.bias = -0.0005;
    this.scene.add(this.lights.sun);

    // Cyan & Amber Accent Glows
    this.lights.accentCyan = new THREE.PointLight(0x06b6d4, 3.5, 60);
    this.lights.accentCyan.position.set(-10, 15, 10);
    this.scene.add(this.lights.accentCyan);

    this.lights.accentEmerald = new THREE.PointLight(0x10b981, 2.5, 50);
    this.lights.accentEmerald.position.set(15, 12, -15);
    this.scene.add(this.lights.accentEmerald);

    this.lights.accentWarm = new THREE.PointLight(0xf59e0b, 2.0, 45);
    this.lights.accentWarm.position.set(0, 10, 0);
    this.scene.add(this.lights.accentWarm);
  }

  createGround() {
    // Main terrain platform
    const groundGeo = new THREE.CylinderGeometry(42, 44, 2, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x090e1a,
      roughness: 0.85,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Cyber grid ring
    const ringGeo = new THREE.RingGeometry(41.5, 43.5, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    this.scene.add(ring);

    // Outer boundary glow
    const outerRingGeo = new THREE.RingGeometry(43.8, 44.2, 64);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.06;
    this.scene.add(outerRing);
  }

  createRoadsAndPaths() {
    // Inner circular ring road
    const innerRoadGeo = new THREE.RingGeometry(24, 27, 48);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.9,
      side: THREE.DoubleSide
    });
    const innerRoad = new THREE.Mesh(innerRoadGeo, roadMat);
    innerRoad.rotation.x = -Math.PI / 2;
    innerRoad.position.y = 0.02;
    innerRoad.receiveShadow = true;
    this.scene.add(innerRoad);

    // Cross connecting walkways with glowing path strips
    const pathMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.5
    });

    const createPath = (x1, z1, x2, z2, width = 1.2) => {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dx, dz);

      const pathGeo = new THREE.PlaneGeometry(width, len);
      const pathMesh = new THREE.Mesh(pathGeo, pathMat);
      pathMesh.rotation.x = -Math.PI / 2;
      pathMesh.rotation.z = angle;
      pathMesh.position.set((x1 + x2) / 2, 0.04, (z1 + z2) / 2);
      this.scene.add(pathMesh);
    };

    createPath(0, -25, 0, 25, 1.6);
    createPath(-25, 0, 25, 0, 1.6);
    createPath(-18, -18, 18, 18, 1.0);
    createPath(-18, 18, 18, -18, 1.0);
  }

  createBuildings() {
    // Architectural specifications from project report
    const buildingSpecs = [
      {
        id: 'block-alpha',
        name: 'Block Alpha (Pilot Hostel)',
        type: 'residential',
        role: 'Single & Double Suites • 250 Beds • 48h SLA Station',
        x: -12, z: -10,
        width: 10, depth: 8, height: 22,
        color: 0x1e293b,
        glowColor: 0x38bdf8
      },
      {
        id: 'block-beta',
        name: 'Block Beta (Women\'s Wing)',
        type: 'residential',
        role: 'Biometric Access • 24/7 Female Guards • Dedicated SOS Hub',
        x: 12, z: -10,
        width: 10, depth: 8, height: 20,
        color: 0x1e293b,
        glowColor: 0x10b981
      },
      {
        id: 'block-gamma',
        name: 'Block Gamma (Community Pods)',
        type: 'residential',
        role: 'Triple Tier Budget • 15% Subsidized Fund Allocation',
        x: 14, z: 12,
        width: 9, depth: 7, height: 16,
        color: 0x1e293b,
        glowColor: 0xf59e0b
      },
      {
        id: 'mess-hub',
        name: 'Central Dining & Nutrition Commons',
        type: 'dining',
        role: 'FSSAI Certified • Student Mess Committee • Meal Rebate Kiosk',
        x: -12, z: 12,
        width: 12, depth: 10, height: 9,
        color: 0x1e293b,
        glowColor: 0x10b981
      },
      {
        id: 'security-center',
        name: 'Rapid Response Security HQ',
        type: 'security',
        role: 'CCTV Ops Hub • 10-Min Dispatch Command • Shuttle Terminal',
        x: 0, z: 0,
        width: 8, depth: 8, height: 12,
        color: 0x0f172a,
        glowColor: 0x06b6d4
      }
    ];

    buildingSpecs.forEach(spec => {
      const group = new THREE.Group();
      group.position.set(spec.x, 0, spec.z);
      group.userData = spec;

      // Main structural tower
      const towerGeo = new THREE.BoxGeometry(spec.width, spec.height, spec.depth);
      const towerMat = new THREE.MeshStandardMaterial({
        color: spec.color,
        roughness: 0.35,
        metalness: 0.7
      });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.y = spec.height / 2;
      tower.castShadow = true;
      tower.receiveShadow = true;
      group.add(tower);

      // Glass facade windows with interior glowing light bands
      const windowLevels = Math.floor(spec.height / 2.8);
      for (let lvl = 1; lvl < windowLevels; lvl++) {
        const yPos = lvl * 2.8;
        const windowGeo = new THREE.BoxGeometry(spec.width + 0.1, 0.9, spec.depth + 0.1);
        const windowMat = new THREE.MeshStandardMaterial({
          color: spec.glowColor,
          emissive: spec.glowColor,
          emissiveIntensity: 0.8,
          roughness: 0.1,
          metalness: 0.9,
          transparent: true,
          opacity: 0.85
        });
        const windowBand = new THREE.Mesh(windowGeo, windowMat);
        windowBand.position.y = yPos;
        group.add(windowBand);
      }

      // Rooftop terrace & architectural crown
      const roofCrownGeo = new THREE.BoxGeometry(spec.width * 0.8, 1.2, spec.depth * 0.8);
      const roofCrownMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.9,
        roughness: 0.2
      });
      const roofCrown = new THREE.Mesh(roofCrownGeo, roofCrownMat);
      roofCrown.position.y = spec.height + 0.6;
      roofCrown.castShadow = true;
      group.add(roofCrown);

      // Glowing beacon antenna
      const beaconGeo = new THREE.CylinderGeometry(0.15, 0.15, 3, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: spec.glowColor });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = spec.height + 2.5;
      group.add(beacon);

      const beaconLight = new THREE.PointLight(spec.glowColor, 1.2, 10);
      beaconLight.position.y = spec.height + 4;
      group.add(beaconLight);

      this.scene.add(group);
      this.buildings.push(group);
    });

    // Elevated Glass Skybridge connecting Block Alpha & Beta to Security HQ
    this.createSkybridge(-12, 12, -10, 0, 10, 0);
    this.createSkybridge(12, 12, -10, 0, 10, 0);
  }

  createSkybridge(x1, y1, z1, x2, y2, z2) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);

    const bridgeGeo = new THREE.BoxGeometry(1.6, 1.4, len);
    const bridgeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.8
    });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.set((x1 + x2) / 2, y1, (z1 + z2) / 2);
    bridge.rotation.y = angle;
    bridge.castShadow = true;
    this.scene.add(bridge);
  }

  createSolarArrays() {
    // Sustainable Solar Rooftop Panels (Highlighting PPM green utility offsetting)
    const solarPositions = [
      { x: -12, y: 22.8, z: -10 },
      { x: 12, y: 20.8, z: -10 },
      { x: -12, y: 9.8, z: 12 }
    ];

    solarPositions.forEach(pos => {
      const panelGroup = new THREE.Group();
      panelGroup.position.set(pos.x, pos.y, pos.z);

      const panelGeo = new THREE.PlaneGeometry(3.5, 2.5);
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x0369a1,
        metalness: 0.9,
        roughness: 0.15,
        side: THREE.DoubleSide
      });

      for (let i = -1; i <= 1; i++) {
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.rotation.x = -Math.PI / 3;
        panel.position.set(i * 2.2, 0.4, 0);
        panelGroup.add(panel);
      }
      this.scene.add(panelGroup);
    });
  }

  createLandscaping() {
    // Stylized low-poly trees and illuminated eco-parks
    const treePositions = [
      [-5, -18], [5, -18], [-18, -2], [18, -2],
      [-5, 22], [5, 22], [22, 6], [-22, 6],
      [0, -14], [0, 16], [-18, -18], [18, 18]
    ];

    treePositions.forEach(([x, z]) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 1.8, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.9;
      trunk.castShadow = true;
      tree.add(trunk);

      // Foliage (double conical stylized)
      const foliageGeo1 = new THREE.ConeGeometry(1.6, 2.6, 8);
      const foliageMat = new THREE.MeshStandardMaterial({
        color: 0x059669,
        roughness: 0.6,
        metalness: 0.1
      });
      const foliage1 = new THREE.Mesh(foliageGeo1, foliageMat);
      foliage1.position.y = 2.6;
      foliage1.castShadow = true;
      tree.add(foliage1);

      const foliageGeo2 = new THREE.ConeGeometry(1.2, 2.0, 8);
      const foliage2 = new THREE.Mesh(foliageGeo2, foliageMat);
      foliage2.position.y = 3.9;
      foliage2.castShadow = true;
      tree.add(foliage2);

      this.scene.add(tree);
    });
  }

  createNightShuttles() {
    // 24/7 Campus Safe Night Shuttle Pods traversing along the circular road
    for (let i = 0; i < 3; i++) {
      const shuttle = new THREE.Group();

      const bodyGeo = new THREE.BoxGeometry(1.6, 0.8, 2.8);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.8,
        roughness: 0.2
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.5;
      shuttle.add(body);

      // Headlight & taillight
      const headLightGeo = new THREE.SphereGeometry(0.18, 8, 8);
      const headLightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const hl1 = new THREE.Mesh(headLightGeo, headLightMat);
      hl1.position.set(-0.5, 0.4, 1.45);
      const hl2 = hl1.clone();
      hl2.position.set(0.5, 0.4, 1.45);
      shuttle.add(hl1);
      shuttle.add(hl2);

      const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
      const tl1 = new THREE.Mesh(headLightGeo, tailLightMat);
      tl1.position.set(-0.5, 0.4, -1.45);
      const tl2 = tl1.clone();
      tl2.position.set(0.5, 0.4, -1.45);
      shuttle.add(tl1);
      shuttle.add(tl2);

      shuttle.userData = {
        radius: 25.5,
        speed: 0.007 + i * 0.002,
        offset: (i * Math.PI * 2) / 3
      };

      this.shuttles.push(shuttle);
      this.scene.add(shuttle);
    }
  }

  createAtmosphericParticles() {
    const count = 350;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cyan = new THREE.Color(0x38bdf8);
    const emerald = new THREE.Color(0x10b981);

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * 80;
      positions[idx + 1] = Math.random() * 35 + 2;
      positions[idx + 2] = (Math.random() - 0.5) * 80;

      const c = Math.random() > 0.5 ? cyan : emerald;
      colors[idx] = c.r;
      colors[idx + 1] = c.g;
      colors[idx + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  setLightingMode(mode) {
    this.currentMode = mode;
    if (mode === 'day') {
      this.scene.background.set(0x0f172a);
      this.scene.fog.color.set(0x0f172a);
      this.lights.ambient.intensity = 2.2;
      this.lights.ambient.color.set(0xffffff);
      this.lights.sun.intensity = 2.4;
      this.lights.sun.color.set(0xfffbeb);
      this.renderer.toneMappingExposure = 1.4;
    } else if (mode === 'sunset') {
      this.scene.background.set(0x1c102a);
      this.scene.fog.color.set(0x1c102a);
      this.lights.ambient.intensity = 1.3;
      this.lights.ambient.color.set(0xfb923c);
      this.lights.sun.intensity = 2.0;
      this.lights.sun.color.set(0xf43f5e);
      this.renderer.toneMappingExposure = 1.25;
    } else {
      // Night Cyber
      this.scene.background.set(0x060913);
      this.scene.fog.color.set(0x060913);
      this.lights.ambient.intensity = 1.0;
      this.lights.ambient.color.set(0x1e293b);
      this.lights.sun.intensity = 1.6;
      this.lights.sun.color.set(0x38bdf8);
      this.renderer.toneMappingExposure = 1.2;
    }
  }

  onMouseMove(event) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;
  }

  onClick(event) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.buildings, true);

    if (intersects.length > 0) {
      let root = intersects[0].object;
      while (root.parent && !root.userData.id && root !== this.scene) {
        root = root.parent;
      }
      if (root && root.userData && root.userData.name) {
        this.highlightBuilding(root);
      }
    }
  }

  highlightBuilding(buildingGroup) {
    const data = buildingGroup.userData;
    const card = document.getElementById('campus-active-card');
    if (card) {
      card.innerHTML = `
        <div class="flex items-center gap-2 mb-1">
          <span class="w-2.5 h-2.5 rounded-full" style="background: #${data.glowColor.toString(16)}"></span>
          <span class="text-xs uppercase tracking-wider text-cyan-400 font-semibold">${data.type}</span>
        </div>
        <h4 class="text-white text-base font-bold">${data.name}</h4>
        <p class="text-xs text-slate-300 mt-1">${data.role}</p>
      `;
      card.classList.remove('opacity-0', 'translate-y-4');
      card.classList.add('opacity-100', 'translate-y-0');
    }

    // Camera micro-pan towards the building
    if (this.controls) {
      if (window.gsap) {
        gsap.to(this.controls.target, {
          x: buildingGroup.position.x,
          y: 4,
          z: buildingGroup.position.z,
          duration: 1.2,
          ease: 'power2.out'
        });
      }
    }
  }

  onWindowResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.time += 0.01;

    // Smoothly orbit camera slightly if idle
    if (this.controls) {
      this.controls.update();
    }

    // Move safe night shuttle vehicles around circular road
    this.shuttles.forEach(shuttle => {
      const angle = this.time * shuttle.userData.speed * 4 + shuttle.userData.offset;
      shuttle.position.x = Math.cos(angle) * shuttle.userData.radius;
      shuttle.position.z = Math.sin(angle) * shuttle.userData.radius;
      shuttle.rotation.y = -angle + Math.PI / 2;
    });

    // Particle subtle rotation
    if (this.particles) {
      this.particles.rotation.y = this.time * 0.03;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.Campus3D = Campus3D;
