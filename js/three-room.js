/**
 * Sanctuary Living - Interactive 3D Room Configurator
 * Single, Double & Triple Occupancy Tiers with Interactive Hotspots & Ambiance
 */

class RoomConfigurator3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.roomGroup = new THREE.Group();
    this.furnitureGroup = new THREE.Group();
    this.hotspots = [];
    this.lights = {};
    this.currentTier = 'single';
    this.currentLighting = 'day';

    this.init();
  }

  init() {
    const width = this.container.clientWidth > 50 ? this.container.clientWidth : 700;
    const height = this.container.clientHeight > 50 ? this.container.clientHeight : 520;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);

    // Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(12, 10, 14);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // Controls
    if (window.THREE && window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2.05;
      this.controls.minDistance = 6;
      this.controls.maxDistance = 26;
      this.controls.target.set(0, 1.8, 0);
    }

    this.scene.add(this.roomGroup);
    this.scene.add(this.furnitureGroup);

    this.setupLighting();
    this.buildRoomShell();
    this.loadTierFurniture('single');
    this.setupHotspots();

    window.addEventListener('resize', () => this.onWindowResize());
    this.animate();
  }

  setupLighting() {
    this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(this.lights.ambient);

    // Window daylight simulation
    this.lights.window = new THREE.DirectionalLight(0xfff7ed, 1.8);
    this.lights.window.position.set(-8, 9, -5);
    this.lights.window.castShadow = true;
    this.lights.window.shadow.mapSize.width = 1024;
    this.lights.window.shadow.mapSize.height = 1024;
    this.lights.window.shadow.camera.near = 1;
    this.lights.window.shadow.camera.far = 30;
    this.lights.window.shadow.bias = -0.001;
    this.scene.add(this.lights.window);

    // Ceiling recessed spotlight
    this.lights.ceiling = new THREE.PointLight(0xffeedd, 1.5, 16);
    this.lights.ceiling.position.set(0, 4.2, 0);
    this.lights.ceiling.castShadow = true;
    this.scene.add(this.lights.ceiling);

    // Study desk lamp
    this.lights.deskLamp = new THREE.PointLight(0x38bdf8, 2.0, 7);
    this.lights.deskLamp.position.set(-2.5, 2.3, -2.5);
    this.scene.add(this.lights.deskLamp);

    // Accent LED light strip near baseboard
    this.lights.accentStrip = new THREE.PointLight(0x06b6d4, 1.2, 10);
    this.lights.accentStrip.position.set(3, 0.4, 2);
    this.scene.add(this.lights.accentStrip);
  }

  buildRoomShell() {
    // Floor
    const floorGeo = new THREE.BoxGeometry(9, 0.3, 8);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.25,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.15;
    floor.receiveShadow = true;
    this.roomGroup.add(floor);

    // Fine wood-look carpet area
    const rugGeo = new THREE.PlaneGeometry(5, 4.5);
    const rugMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.95
    });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0.5, 0.01, 0.5);
    rug.receiveShadow = true;
    this.roomGroup.add(rug);

    // Back Wall
    const backWallGeo = new THREE.BoxGeometry(9, 4.5, 0.3);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8
    });
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 2.25, -4.15);
    backWall.receiveShadow = true;
    this.roomGroup.add(backWall);

    // Left Wall with large acoustic/panoramic window
    const leftWallGeo = new THREE.BoxGeometry(0.3, 4.5, 8);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-4.65, 2.25, 0);
    leftWall.receiveShadow = true;
    this.roomGroup.add(leftWall);

    // Window frame on left wall
    const windowFrameGeo = new THREE.BoxGeometry(0.35, 3.0, 4.5);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });
    const windowFrame = new THREE.Mesh(windowFrameGeo, frameMat);
    windowFrame.position.set(-4.6, 2.4, -0.5);
    this.roomGroup.add(windowFrame);

    // Glass pane with outdoor daylight sky gradient
    const glassGeo = new THREE.PlaneGeometry(4.3, 2.8);
    const glassMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.rotation.y = Math.PI / 2;
    glass.position.set(-4.5, 2.4, -0.5);
    this.roomGroup.add(glass);

    // Baseboard trim
    const trimGeo = new THREE.BoxGeometry(9, 0.15, 0.05);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.3 });
    const trimBack = new THREE.Mesh(trimGeo, trimMat);
    trimBack.position.set(0, 0.08, -3.98);
    this.roomGroup.add(trimBack);
  }

  clearFurniture() {
    while (this.furnitureGroup.children.length > 0) {
      const obj = this.furnitureGroup.children[0];
      this.furnitureGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }
  }

  loadTierFurniture(tier) {
    this.currentTier = tier;
    this.clearFurniture();

    if (tier === 'single') {
      this.buildSingleSuite();
    } else if (tier === 'double') {
      this.buildDoubleStudio();
    } else if (tier === 'triple') {
      this.buildTriplePod();
    }

    this.updateHotspotPositions();
  }

  // --- SINGLE DELUXE SUITE ---
  buildSingleSuite() {
    // Queen Bed
    const bed = this.createBed(3.2, 0.7, 2.4, 0x1e3a8a, 0x0284c7);
    bed.position.set(2.4, 0, -2.6);
    this.furnitureGroup.add(bed);

    // Ergonomic Study Desk & Monitor
    const desk = this.createDesk();
    desk.position.set(-2.8, 0, -2.6);
    this.furnitureGroup.add(desk);

    // Ergonomic Mesh Task Chair
    const chair = this.createChair();
    chair.position.set(-2.8, 0, -1.3);
    chair.rotation.y = Math.PI;
    this.furnitureGroup.add(chair);

    // Smart Wardrobe with full-length mirror
    const wardrobe = this.createWardrobe(1.8, 3.6, 1.2);
    wardrobe.position.set(3.4, 0, 1.8);
    wardrobe.rotation.y = -Math.PI / 2;
    this.furnitureGroup.add(wardrobe);

    // Private En-suite partition door
    const door = this.createEnSuiteDoor();
    door.position.set(-4.4, 0, 2.5);
    this.furnitureGroup.add(door);

    // Wall Acoustic Paneling
    const acousticPanel = this.createAcousticPanels();
    acousticPanel.position.set(2.4, 2.2, -3.95);
    this.furnitureGroup.add(acousticPanel);
  }

  // --- DOUBLE SHARED STUDIO ---
  buildDoubleStudio() {
    // Bed 1 (Left side)
    const bed1 = this.createBed(2.6, 0.65, 1.6, 0x0f766e, 0x14b8a6);
    bed1.position.set(-2.6, 0, -2.8);
    this.furnitureGroup.add(bed1);

    // Bed 2 (Right side)
    const bed2 = this.createBed(2.6, 0.65, 1.6, 0x0f766e, 0x14b8a6);
    bed2.position.set(2.6, 0, -2.8);
    this.furnitureGroup.add(bed2);

    // Acoustic Privacy Partition Divider
    const partitionGeo = new THREE.BoxGeometry(0.1, 2.2, 3.2);
    const partitionMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const partition = new THREE.Mesh(partitionGeo, partitionMat);
    partition.position.set(0, 1.1, -2.4);
    partition.castShadow = true;
    this.furnitureGroup.add(partition);

    // Dual Study Desks
    const desk1 = this.createCompactDesk();
    desk1.position.set(-3.2, 0, 1.6);
    desk1.rotation.y = Math.PI / 2;
    this.furnitureGroup.add(desk1);

    const desk2 = this.createCompactDesk();
    desk2.position.set(3.2, 0, 1.6);
    desk2.rotation.y = -Math.PI / 2;
    this.furnitureGroup.add(desk2);

    // Dual Chairs
    const chair1 = this.createChair();
    chair1.position.set(-2.0, 0, 1.6);
    chair1.rotation.y = -Math.PI / 2;
    this.furnitureGroup.add(chair1);

    const chair2 = this.createChair();
    chair2.position.set(2.0, 0, 1.6);
    chair2.rotation.y = Math.PI / 2;
    this.furnitureGroup.add(chair2);

    // Twin Lockers / Wardrobes
    const wardrobe1 = this.createWardrobe(1.4, 3.4, 1.0);
    wardrobe1.position.set(-0.9, 0, 2.8);
    this.furnitureGroup.add(wardrobe1);

    const wardrobe2 = this.createWardrobe(1.4, 3.4, 1.0);
    wardrobe2.position.set(0.9, 0, 2.8);
    this.furnitureGroup.add(wardrobe2);
  }

  // --- TRIPLE COMMUNITY POD ---
  buildTriplePod() {
    // Bunk Bed Unit (Bed 1 & Bed 2)
    const bunk = this.createBunkBed();
    bunk.position.set(2.5, 0, -2.5);
    this.furnitureGroup.add(bunk);

    // Loft Bed Unit with Study Desk underneath (Bed 3)
    const loft = this.createLoftBedDesk();
    loft.position.set(-2.5, 0, -2.5);
    this.furnitureGroup.add(loft);

    // Community Study Table (seats 2)
    const sharedDesk = this.createDesk(3.0, 1.4);
    sharedDesk.position.set(0, 0, 1.5);
    this.furnitureGroup.add(sharedDesk);

    const chair1 = this.createChair();
    chair1.position.set(-0.8, 0, 0.7);
    chair1.rotation.y = 0;
    this.furnitureGroup.add(chair1);

    const chair2 = this.createChair();
    chair2.position.set(0.8, 0, 0.7);
    chair2.rotation.y = 0;
    this.furnitureGroup.add(chair2);

    // Triple Secured Storage Lockers
    const lockers = this.createTripleLockers();
    lockers.position.set(-3.6, 0, 1.5);
    lockers.rotation.y = Math.PI / 2;
    this.furnitureGroup.add(lockers);
  }

  // Helper Furniture Generators
  createBed(length, height, width, primaryColor = 0x1e3a8a, duvetColor = 0x0284c7) {
    const group = new THREE.Group();

    // Bed frame
    const frameGeo = new THREE.BoxGeometry(width + 0.1, height * 0.5, length + 0.1);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = height * 0.25;
    frame.castShadow = true;
    group.add(frame);

    // Mattress
    const mattressGeo = new THREE.BoxGeometry(width, height * 0.6, length);
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
    const mattress = new THREE.Mesh(mattressGeo, mattressMat);
    mattress.position.y = height * 0.55;
    mattress.castShadow = true;
    group.add(mattress);

    // Duvet / Bedspread
    const duvetGeo = new THREE.BoxGeometry(width + 0.05, height * 0.35, length * 0.7);
    const duvetMat = new THREE.MeshStandardMaterial({ color: duvetColor, roughness: 0.7 });
    const duvet = new THREE.Mesh(duvetGeo, duvetMat);
    duvet.position.set(0, height * 0.65, length * 0.15);
    duvet.castShadow = true;
    group.add(duvet);

    // Pillow
    const pillowGeo = new THREE.BoxGeometry(width * 0.7, 0.18, 0.5);
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const pillow = new THREE.Mesh(pillowGeo, pillowMat);
    pillow.position.set(0, height * 0.75, -length * 0.35);
    pillow.castShadow = true;
    group.add(pillow);

    // Headboard
    const headboardGeo = new THREE.BoxGeometry(width + 0.2, 1.4, 0.15);
    const headboardMat = new THREE.MeshStandardMaterial({ color: primaryColor, roughness: 0.5 });
    const headboard = new THREE.Mesh(headboardGeo, headboardMat);
    headboard.position.set(0, 0.9, -length * 0.52);
    headboard.castShadow = true;
    group.add(headboard);

    return group;
  }

  createDesk(w = 2.2, d = 1.1) {
    const group = new THREE.Group();

    // Tabletop
    const topGeo = new THREE.BoxGeometry(w, 0.08, d);
    const topMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.2, roughness: 0.3 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 1.4;
    top.castShadow = true;
    group.add(top);

    // Steel Legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 16);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const offsets = [
      [-w / 2 + 0.1, -d / 2 + 0.1],
      [w / 2 - 0.1, -d / 2 + 0.1],
      [-w / 2 + 0.1, d / 2 - 0.1],
      [w / 2 - 0.1, d / 2 - 0.1]
    ];
    offsets.forEach(([ox, oz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(ox, 0.7, oz);
      leg.castShadow = true;
      group.add(leg);
    });

    // Laptop & Monitor
    const monitorStand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.2), legMat);
    monitorStand.position.set(0, 1.6, -0.3);
    group.add(monitorStand);

    const screenGeo = new THREE.BoxGeometry(1.2, 0.7, 0.04);
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 2.0, -0.3);
    group.add(screen);

    // LED Desk Lamp
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 16), legMat);
    lampBase.position.set(-w / 2 + 0.3, 1.45, -0.3);
    group.add(lampBase);

    const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8), legMat);
    lampArm.position.set(-w / 2 + 0.3, 1.75, -0.3);
    lampArm.rotation.z = -0.3;
    group.add(lampArm);

    return group;
  }

  createCompactDesk() {
    return this.createDesk(1.6, 0.9);
  }

  createChair() {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.5 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });

    // Seat cushion
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.7), mat);
    seat.position.y = 0.85;
    seat.castShadow = true;
    group.add(seat);

    // Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.7, 0.08), mat);
    back.position.set(0, 1.25, -0.32);
    back.castShadow = true;
    group.add(back);

    // Center column & caster star
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75, 12), frameMat);
    col.position.y = 0.42;
    group.add(col);

    const star = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 5), frameMat);
    star.position.y = 0.08;
    group.add(star);

    return group;
  }

  createWardrobe(w = 1.6, h = 3.4, d = 1.1) {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.2 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
    body.position.y = h / 2;
    body.castShadow = true;
    group.add(body);

    // Door handles
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9 });
    const handle1 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.04), handleMat);
    handle1.position.set(-0.1, h / 2, d / 2 + 0.02);
    group.add(handle1);

    const handle2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.04), handleMat);
    handle2.position.set(0.1, h / 2, d / 2 + 0.02);
    group.add(handle2);

    return group;
  }

  createEnSuiteDoor() {
    const group = new THREE.Group();
    const doorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 3.6, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7 })
    );
    doorFrame.position.y = 1.8;
    group.add(doorFrame);

    // RFID Smart Reader pad
    const rfidPad = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.25, 0.15),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    rfidPad.position.set(0.1, 1.8, 0.6);
    group.add(rfidPad);

    return group;
  }

  createAcousticPanels() {
    const group = new THREE.Group();
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.95
    });

    for (let i = -1; i <= 1; i++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.6, 0.05), panelMat);
      panel.position.set(i * 1.1, 0, 0);
      group.add(panel);
    }
    return group;
  }

  createBunkBed() {
    const group = new THREE.Group();
    // Lower Bed
    const lowerBed = this.createBed(2.6, 0.6, 1.5, 0x1e3a8a, 0x0284c7);
    group.add(lowerBed);

    // Upper Bed
    const upperBed = this.createBed(2.6, 0.6, 1.5, 0x1e3a8a, 0x0284c7);
    upperBed.position.y = 2.0;
    group.add(upperBed);

    // Support pillars
    const postMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });
    const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 3.2, 12);
    const posts = [
      [-0.8, -1.3], [0.8, -1.3],
      [-0.8, 1.3], [0.8, 1.3]
    ];
    posts.forEach(([px, pz]) => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(px, 1.6, pz);
      group.add(post);
    });

    // Ladder
    const ladderStepGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
    for (let s = 1; s <= 4; s++) {
      const step = new THREE.Mesh(ladderStepGeo, postMat);
      step.rotation.z = Math.PI / 2;
      step.position.set(0.85, s * 0.5, 0.8);
      group.add(step);
    }

    return group;
  }

  createLoftBedDesk() {
    const group = new THREE.Group();
    // High bed
    const bed = this.createBed(2.6, 0.6, 1.5, 0x0f766e, 0x10b981);
    bed.position.y = 2.0;
    group.add(bed);

    // Posts
    const postMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });
    const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 3.2, 12);
    const posts = [
      [-0.8, -1.3], [0.8, -1.3],
      [-0.8, 1.3], [0.8, 1.3]
    ];
    posts.forEach(([px, pz]) => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(px, 1.6, pz);
      group.add(post);
    });

    // Integrated Desk below
    const desk = this.createDesk(1.8, 0.8);
    desk.position.set(0, 0, 0);
    group.add(desk);

    return group;
  }

  createTripleLockers() {
    const group = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const locker = this.createWardrobe(0.8, 3.0, 0.9);
      locker.position.set(i * 0.85 - 0.85, 0, 0);
      group.add(locker);
    }
    return group;
  }

  setupHotspots() {
    // Hotspot coordinates in 3D world space
    this.hotspotData = [
      {
        id: 'hs-rfid',
        title: 'Smart RFID Lock & Access Audit',
        desc: 'Encrypted keycard tap-in logs entry timestamps for safety & prevents unauthorized room access.',
        pos: new THREE.Vector3(-4.3, 1.8, 2.5)
      },
      {
        id: 'hs-qr',
        title: 'Digital QR Housekeeping SLA Station',
        desc: 'Scan to verify daily housekeeping sign-offs, bathroom sanitization, or log a 48h repair ticket.',
        pos: new THREE.Vector3(-3.8, 2.2, -3.9)
      },
      {
        id: 'hs-desk',
        title: 'Ergonomic Study Pod & Wi-Fi 6',
        desc: 'Dedicated high-speed fiber connection, USB-C 100W PD power ports, and task illumination.',
        pos: new THREE.Vector3(-2.8, 1.8, -2.5)
      },
      {
        id: 'hs-sos',
        title: 'Wall-Mounted SOS Emergency Panic Beacon',
        desc: 'Direct hardware panic trigger connected to on-site 24/7 guard desk (<10 min rapid response).',
        pos: new THREE.Vector3(3.8, 1.9, -3.9)
      }
    ];

    // Create DOM elements for hotspots
    this.hotspots = this.hotspotData.map(data => {
      const elem = document.createElement('div');
      elem.className = 'hotspot-tag';
      elem.innerHTML = `
        <div class="hotspot-dot"></div>
        <div class="hotspot-tooltip">
          <div class="font-bold text-white mb-0.5 text-xs">${data.title}</div>
          <div class="text-slate-300 text-[11px] leading-tight">${data.desc}</div>
        </div>
      `;
      this.container.appendChild(elem);

      elem.addEventListener('click', () => {
        elem.classList.toggle('active');
      });

      return { elem, pos: data.pos };
    });
  }

  updateHotspotPositions() {
    if (!this.camera || !this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.hotspots.forEach(item => {
      const screenPos = item.pos.clone().project(this.camera);
      const isBehind = screenPos.z > 1;

      if (isBehind) {
        item.elem.style.display = 'none';
      } else {
        item.elem.style.display = 'block';
        const x = (screenPos.x * 0.5 + 0.5) * width;
        const y = (-screenPos.y * 0.5 + 0.5) * height;
        item.elem.style.left = `${x}px`;
        item.elem.style.top = `${y}px`;
      }
    });
  }

  setLightingMode(mode) {
    this.currentLighting = mode;
    if (mode === 'day') {
      this.lights.ambient.intensity = 0.9;
      this.lights.ambient.color.set(0xffffff);
      this.lights.window.intensity = 1.8;
      this.lights.window.color.set(0xfff7ed);
      this.lights.deskLamp.intensity = 1.0;
      this.lights.ceiling.intensity = 1.5;
    } else if (mode === 'sunset') {
      this.lights.ambient.intensity = 0.6;
      this.lights.ambient.color.set(0xfb923c);
      this.lights.window.intensity = 2.2;
      this.lights.window.color.set(0xf97316);
      this.lights.deskLamp.intensity = 2.5;
      this.lights.ceiling.intensity = 1.0;
    } else {
      // Night Focus Study Lamp
      this.lights.ambient.intensity = 0.25;
      this.lights.ambient.color.set(0x0f172a);
      this.lights.window.intensity = 0.1;
      this.lights.window.color.set(0x0284c7);
      this.lights.deskLamp.intensity = 3.5;
      this.lights.deskLamp.color.set(0x38bdf8);
      this.lights.ceiling.intensity = 0.3;
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

    if (this.controls) {
      this.controls.update();
    }

    this.updateHotspotPositions();
    this.renderer.render(this.scene, this.camera);
  }
}

window.RoomConfigurator3D = RoomConfigurator3D;
