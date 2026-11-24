/**
 * Sanctuary Living - 3D Tactical Security & Rapid Response Hologram
 * Built with Three.js r128
 */

class SecurityTactical3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.cctvCones = [];
    this.sosBeacons = [];
    this.responsePerimeter = null;
    this.emergencyActive = false;
    this.time = 0;

    this.init();
  }

  init() {
    const width = this.container.clientWidth > 50 ? this.container.clientWidth : 650;
    const height = this.container.clientHeight > 50 ? this.container.clientHeight : 480;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(16, 20, 22);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);

    if (window.THREE && window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2.1;
      this.controls.target.set(0, 1.5, 0);
    }

    this.setupLighting();
    this.createFloorplate();
    this.createCCTVCoverage();
    this.createSOSBeacons();
    this.createTurnstiles();
    this.createResponseRadius();

    window.addEventListener('resize', () => this.onWindowResize());
    this.animate();
  }

  setupLighting() {
    const amb = new THREE.AmbientLight(0x0f172a, 1.2);
    this.scene.add(amb);

    const dir = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dir.position.set(15, 25, 10);
    this.scene.add(dir);

    this.alarmLight = new THREE.PointLight(0xf43f5e, 0, 30);
    this.alarmLight.position.set(0, 6, 0);
    this.scene.add(this.alarmLight);
  }

  createFloorplate() {
    // Holographic architectural grid floorplate
    const gridHelper = new THREE.GridHelper(26, 26, 0x0284c7, 0x1e293b);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // Translucent architectural walls
    const wallMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });

    const wallSolidMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.6,
      roughness: 0.3
    });

    // Outer boundary walls
    const boundaryGeo = new THREE.BoxGeometry(20, 2.5, 18);
    const boundaryWire = new THREE.Mesh(boundaryGeo, wallMat);
    boundaryWire.position.y = 1.25;
    this.scene.add(boundaryWire);

    // Corridor divisions
    const corridorGeo = new THREE.BoxGeometry(1.2, 2.0, 14);
    const corridor = new THREE.Mesh(corridorGeo, wallSolidMat);
    corridor.position.set(-3, 1.0, 0);
    this.scene.add(corridor);

    const corridor2 = new THREE.Mesh(corridorGeo, wallSolidMat);
    corridor2.position.set(3, 1.0, 0);
    this.scene.add(corridor2);

    // Base podium
    const baseGeo = new THREE.CylinderGeometry(15, 16, 0.5, 48);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x090e1a, metalness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.25;
    this.scene.add(base);
  }

  createCCTVCoverage() {
    // 360-degree Sweeping CCTV sensor cones
    const cctvPositions = [
      { x: -8, y: 3.5, z: -7, rotY: 0.7 },
      { x: 8, y: 3.5, z: -7, rotY: -0.7 },
      { x: -8, y: 3.5, z: 7, rotY: 2.3 },
      { x: 8, y: 3.5, z: 7, rotY: -2.3 },
      { x: 0, y: 3.8, z: 0, rotY: 0 }
    ];

    cctvPositions.forEach((pos, idx) => {
      const cctvGroup = new THREE.Group();
      cctvGroup.position.set(pos.x, pos.y, pos.z);

      // Camera body
      const camBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.22, 0.6, 12),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 })
      );
      camBody.rotation.x = Math.PI / 3;
      cctvGroup.add(camBody);

      // Sweeping visual detection cone
      const coneGeo = new THREE.ConeGeometry(3.2, 5.5, 24, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(0, -2.6, 1.8);
      cone.rotation.x = -Math.PI / 3;
      cctvGroup.add(cone);

      cctvGroup.rotation.y = pos.rotY;
      cctvGroup.userData = { initialRotY: pos.rotY, speed: 0.015 + idx * 0.005 };

      this.cctvCones.push(cctvGroup);
      this.scene.add(cctvGroup);
    });
  }

  createSOSBeacons() {
    // Physical SOS button nodes with pulsing radar rings
    const sosCoords = [
      { x: -6, z: -2, label: 'SOS-01 (Wing A Corridor)' },
      { x: 6, z: -2, label: 'SOS-02 (Wing B Corridor)' },
      { x: 0, z: 6, label: 'SOS-03 (Main Lobby Hub)' },
      { x: -5, z: 5, label: 'SOS-04 (Stairwell Exit 1)' }
    ];

    sosCoords.forEach(coord => {
      const group = new THREE.Group();
      group.position.set(coord.x, 0.8, coord.z);

      // Core Beacon sphere
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x10b981,
          emissiveIntensity: 0.8
        })
      );
      group.add(sphere);

      // Pulsing wave ring
      const ringGeo = new THREE.RingGeometry(0.35, 0.55, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      group.add(ring);

      group.userData = { sphere, ring, scaleVal: 1, baseColor: 0x10b981 };
      this.sosBeacons.push(group);
      this.scene.add(group);
    });
  }

  createTurnstiles() {
    // Biometric / Smart RFID Access Gates at Main Entrance
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, 8.5);

    const gatePostGeo = new THREE.BoxGeometry(0.3, 1.2, 1.4);
    const gateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });

    const post1 = new THREE.Mesh(gatePostGeo, gateMat);
    post1.position.set(-1.2, 0.6, 0);
    const post2 = new THREE.Mesh(gatePostGeo, gateMat);
    post2.position.set(0, 0.6, 0);
    const post3 = new THREE.Mesh(gatePostGeo, gateMat);
    post3.position.set(1.2, 0.6, 0);

    gateGroup.add(post1);
    gateGroup.add(post2);
    gateGroup.add(post3);

    // Glowing access flap
    const flapGeo = new THREE.PlaneGeometry(0.8, 0.6);
    const flapMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
    const flap1 = new THREE.Mesh(flapGeo, flapMat);
    flap1.position.set(-0.6, 0.7, 0);
    const flap2 = new THREE.Mesh(flapGeo, flapMat);
    flap2.position.set(0.6, 0.7, 0);

    gateGroup.add(flap1);
    gateGroup.add(flap2);

    this.scene.add(gateGroup);
  }

  createResponseRadius() {
    // 10-Minute Rapid Response Zone Holographic Sphere
    const sphereGeo = new THREE.SphereGeometry(12, 32, 24);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    this.responsePerimeter = new THREE.Mesh(sphereGeo, sphereMat);
    this.responsePerimeter.position.y = 2;
    this.scene.add(this.responsePerimeter);
  }

  triggerSOSSimulation() {
    this.emergencyActive = true;
    this.alarmLight.intensity = 3.5;

    // Turn all beacons to pulsating Red
    this.sosBeacons.forEach(b => {
      b.userData.sphere.material.color.set(0xf43f5e);
      b.userData.sphere.material.emissive.set(0xf43f5e);
      b.userData.ring.material.color.set(0xf43f5e);
    });

    if (this.responsePerimeter) {
      this.responsePerimeter.material.color.set(0xf43f5e);
      this.responsePerimeter.material.opacity = 0.25;
    }

    // Camera zooms dynamically
    if (this.camera && window.gsap) {
      gsap.to(this.camera.position, {
        x: 10, y: 12, z: 14,
        duration: 1.5,
        ease: 'power2.out'
      });
    }

    // Auto reset after 10s
    setTimeout(() => {
      this.resetSOS();
    }, 12000);
  }

  resetSOS() {
    this.emergencyActive = false;
    this.alarmLight.intensity = 0;

    this.sosBeacons.forEach(b => {
      b.userData.sphere.material.color.set(0x10b981);
      b.userData.sphere.material.emissive.set(0x10b981);
      b.userData.ring.material.color.set(0x10b981);
    });

    if (this.responsePerimeter) {
      this.responsePerimeter.material.color.set(0x0284c7);
      this.responsePerimeter.material.opacity = 0.12;
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
    this.time += 0.02;

    if (this.controls) {
      this.controls.update();
    }

    // CCTV Scanning oscillation
    this.cctvCones.forEach((cam, i) => {
      cam.rotation.y = cam.userData.initialRotY + Math.sin(this.time * cam.userData.speed * 2) * 0.45;
    });

    // SOS pulsing ring animation
    this.sosBeacons.forEach(beacon => {
      beacon.userData.scaleVal += 0.03;
      if (beacon.userData.scaleVal > 2.4) {
        beacon.userData.scaleVal = 1;
      }
      beacon.userData.ring.scale.set(beacon.userData.scaleVal, beacon.userData.scaleVal, 1);
      beacon.userData.ring.material.opacity = 1 - (beacon.userData.scaleVal - 1) / 1.4;
    });

    // Emergency strobe
    if (this.emergencyActive) {
      this.alarmLight.intensity = (Math.sin(this.time * 12) + 1) * 2.5;
    }

    // Perimeter slow rotation
    if (this.responsePerimeter) {
      this.responsePerimeter.rotation.y = this.time * 0.05;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.SecurityTactical3D = SecurityTactical3D;
