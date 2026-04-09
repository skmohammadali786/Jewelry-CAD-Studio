import { useEffect, useRef, useState } from "react";

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const test = document.createElement("canvas");
    const gl = test.getContext("webgl") || test.getContext("experimental-webgl");
    if (!gl) { setWebglSupported(false); return; }

    let animId: number;
    let renderer: import("three").WebGLRenderer | null = null;
    let cleanupFn: (() => void) | undefined;

    const init = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const THREE = await import("three");

      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch { setWebglSupported(false); return; }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.6;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 300);
      camera.position.set(0, 0, 7.5);

      // ── RICH ENVIRONMENT MAP ─────────────────────────────────────
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      const ec = document.createElement("canvas");
      ec.width = 2048; ec.height = 1024;
      const ectx = ec.getContext("2d")!;
      ectx.fillStyle = "#000"; ectx.fillRect(0, 0, 2048, 1024);
      const envSpots = [
        { x: 400,  y: 200, r: 320, c: "rgba(255,215,0,0.9)"   },
        { x: 1600, y: 300, r: 250, c: "rgba(201,168,76,0.8)"  },
        { x: 1000, y: 500, r: 500, c: "rgba(255,230,120,0.5)" },
        { x: 200,  y: 700, r: 180, c: "rgba(255,140,0,0.6)"   },
        { x: 1900, y: 800, r: 140, c: "rgba(255,255,255,0.7)" },
        { x: 1200, y: 100, r: 200, c: "rgba(255,200,80,0.6)"  },
      ];
      envSpots.forEach(({ x, y, r, c }) => {
        const g = ectx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, c);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ectx.fillStyle = g; ectx.fillRect(0, 0, 2048, 1024);
      });
      const envTex = new THREE.CanvasTexture(ec);
      envTex.mapping = THREE.EquirectangularReflectionMapping;
      const envMap = pmrem.fromEquirectangular(envTex).texture;
      scene.environment = envMap;
      pmrem.dispose();

      // ── LIGHTS ───────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xfff0d0, 0.6));
      const sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
      sunLight.position.set(5, 8, 6);
      scene.add(sunLight);
      const fillLight = new THREE.DirectionalLight(0xffd080, 1.5);
      fillLight.position.set(-5, -3, 3);
      scene.add(fillLight);
      const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
      rimLight.position.set(0, 0, -8);
      scene.add(rimLight);

      const orbitLights = [
        { lt: new THREE.PointLight(0xffd700, 20, 12), r: 3.2, spd:  0.5,  ph: 0,           tilt: 0.5  },
        { lt: new THREE.PointLight(0xff8800, 14, 10), r: 2.8, spd: -0.35, ph: Math.PI,      tilt: -0.6 },
        { lt: new THREE.PointLight(0xffffff, 10, 8),  r: 3.0, spd:  0.65, ph: Math.PI/1.5, tilt: 0.8  },
        { lt: new THREE.PointLight(0xffcc44, 8,  9),  r: 2.5, spd: -0.45, ph: Math.PI/3,   tilt: -0.3 },
      ];
      orbitLights.forEach(({ lt }) => scene.add(lt));

      // ── DIAMOND GEOMETRY ─────────────────────────────────────────
      // Brilliant-cut diamond profile (LatheGeometry rotated around Y axis)
      const diamondPoints = [
        new THREE.Vector2(0.01,  1.55),  // apex (tiny non-zero to avoid artifact)
        new THREE.Vector2(0.52,  1.20),  // upper crown
        new THREE.Vector2(0.82,  0.70),  // mid crown
        new THREE.Vector2(1.05,  0.15),  // upper girdle
        new THREE.Vector2(1.05, -0.10),  // lower girdle
        new THREE.Vector2(0.75, -0.55),  // upper pavilion
        new THREE.Vector2(0.45, -1.00),  // mid pavilion
        new THREE.Vector2(0.01, -1.60),  // culet (bottom tip)
      ];
      // 8 segments = octagonal facets = brilliant cut look
      const gemGeo = new THREE.LatheGeometry(diamondPoints, 8, 0, Math.PI * 2);
      gemGeo.computeVertexNormals();

      const gemMat = new THREE.MeshPhysicalMaterial({
        color: 0xffd700,
        metalness: 0.05,
        roughness: 0.0,
        transmission: 0.75,
        thickness: 3.0,
        ior: 2.42,
        envMap,
        envMapIntensity: 4.0,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const gem = new THREE.Mesh(gemGeo, gemMat);
      scene.add(gem);

      // Wireframe facet overlay — makes facets visible & glowing
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xffe880,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const wireGem = new THREE.Mesh(gemGeo, wireMat);
      wireGem.scale.setScalar(1.005);
      scene.add(wireGem);

      // ── BLOOM GLOW SIMULATION ─────────────────────────────────────
      // Multiple layered circular glow planes give fake HDR bloom
      const makeGlowTex = (inner: string, mid: string) => {
        const c = document.createElement("canvas"); c.width = c.height = 256;
        const cx = c.getContext("2d")!;
        const g = cx.createRadialGradient(128, 128, 0, 128, 128, 128);
        g.addColorStop(0,    inner);
        g.addColorStop(0.15, inner);
        g.addColorStop(0.4,  mid);
        g.addColorStop(0.75, "rgba(201,168,76,0.03)");
        g.addColorStop(1,    "rgba(0,0,0,0)");
        cx.fillStyle = g; cx.fillRect(0, 0, 256, 256);
        return new THREE.CanvasTexture(c);
      };
      const glowLayers = [
        { size: 0.7,  op: 0.65, tex: makeGlowTex("rgba(255,255,240,0.9)", "rgba(255,220,80,0.5)") },
        { size: 1.4,  op: 0.30, tex: makeGlowTex("rgba(255,220,80,0.7)",  "rgba(201,168,76,0.2)") },
        { size: 2.8,  op: 0.14, tex: makeGlowTex("rgba(255,200,50,0.4)",  "rgba(180,140,30,0.1)") },
        { size: 5.0,  op: 0.07, tex: makeGlowTex("rgba(201,168,76,0.3)",  "rgba(120,90,20,0.05)")  },
        { size: 9.0,  op: 0.03, tex: makeGlowTex("rgba(180,130,20,0.2)",  "rgba(80,50,0,0.0)")     },
        { size: 15.0, op: 0.015,tex: makeGlowTex("rgba(150,100,10,0.15)", "rgba(50,30,0,0.0)")     },
      ];
      const glowMeshes = glowLayers.map(({ size, op, tex }) => {
        const g = new THREE.PlaneGeometry(size, size);
        const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: op,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(g, m);
        mesh.position.z = 0.1;
        scene.add(mesh);
        return { mesh, mat: m };
      });

      // ── ORBITAL RINGS WITH ENERGY SPARKS ─────────────────────────
      type RingData = {
        ring: import("three").Mesh;
        sparks: import("three").Mesh[];
        sparkAngles: number[];
        pivotH: import("three").Object3D;
        pivotV: import("three").Object3D;
        speed: number;
        radius: number;
      };

      const ringDefs = [
        { r: 2.3,  tube: 0.015, seg: 160, rotX: Math.PI/3.5,  rotZ: 0.2,           spd:  0.32, col: 0xffd700, op: 0.65, sparks: 2 },
        { r: 3.0,  tube: 0.010, seg: 180, rotX: -Math.PI/4.2, rotZ: Math.PI/4.5,   spd: -0.22, col: 0xffe880, op: 0.45, sparks: 1 },
        { r: 1.8,  tube: 0.018, seg: 140, rotX: Math.PI/7,    rotZ: -Math.PI/6,    spd:  0.50, col: 0xffa500, op: 0.55, sparks: 3 },
        { r: 3.8,  tube: 0.007, seg: 200, rotX: Math.PI/2.1,  rotZ: Math.PI/3.5,   spd:  0.17, col: 0xffd700, op: 0.28, sparks: 1 },
        { r: 2.6,  tube: 0.012, seg: 170, rotX: -Math.PI/3.2, rotZ: -Math.PI/5.5,  spd: -0.38, col: 0xffcc44, op: 0.40, sparks: 2 },
      ];

      const rings: RingData[] = ringDefs.map(({ r, tube, seg, rotX, rotZ, spd, col, op, sparks: nSparks }) => {
        const pivotV = new THREE.Object3D();
        const pivotH = new THREE.Object3D();

        const rGeo = new THREE.TorusGeometry(r, tube, 10, seg);
        const rMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op,
          blending: THREE.AdditiveBlending, depthWrite: false });
        const ring = new THREE.Mesh(rGeo, rMat);
        ring.rotation.x = rotX; ring.rotation.z = rotZ;
        pivotH.add(ring);
        pivotV.add(pivotH);
        scene.add(pivotV);

        // Glow ring (slightly larger, more transparent)
        const glowRGeo = new THREE.TorusGeometry(r, tube * 4, 6, seg);
        const glowRMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op * 0.25,
          blending: THREE.AdditiveBlending, depthWrite: false });
        const glowRing = new THREE.Mesh(glowRGeo, glowRMat);
        glowRing.rotation.x = rotX; glowRing.rotation.z = rotZ;
        pivotH.add(glowRing);

        // Sparks travelling along the ring
        const sparkGeo = new THREE.SphereGeometry(0.06, 8, 8);
        const sparkMeshes: import("three").Mesh[] = [];
        const sparkAngles: number[] = [];
        for (let i = 0; i < nSparks; i++) {
          const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95,
            blending: THREE.AdditiveBlending, depthWrite: false });
          const spark = new THREE.Mesh(sparkGeo, sparkMat);
          sparkAngles.push((i / nSparks) * Math.PI * 2);
          // Wrap spark in a sub-object that applies ring's rotation
          const sparkPivot = new THREE.Object3D();
          sparkPivot.rotation.x = rotX; sparkPivot.rotation.z = rotZ;
          sparkPivot.add(spark);
          pivotH.add(sparkPivot);
          sparkMeshes.push(spark);

          // Glow around each spark
          const sGlowGeo = new THREE.SphereGeometry(0.22, 8, 8);
          const sGlowMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.4,
            blending: THREE.AdditiveBlending, depthWrite: false });
          sparkPivot.add(new THREE.Mesh(sGlowGeo, sGlowMat));
        }

        return { ring, sparks: sparkMeshes, sparkAngles, pivotH, pivotV, speed: spd, radius: r };
      });

      // ── BACKGROUND NEBULA PLANES ──────────────────────────────────
      const makeNebula = (w: number, h: number, color1: string, color2: string) => {
        const c = document.createElement("canvas"); c.width = 512; c.height = 512;
        const cx = c.getContext("2d")!;
        cx.fillStyle = "rgba(0,0,0,0)"; cx.fillRect(0, 0, 512, 512);
        const g1 = cx.createRadialGradient(200, 200, 0, 200, 200, 200);
        g1.addColorStop(0, color1); g1.addColorStop(1, "rgba(0,0,0,0)");
        cx.fillStyle = g1; cx.fillRect(0, 0, 512, 512);
        const g2 = cx.createRadialGradient(320, 320, 0, 320, 320, 160);
        g2.addColorStop(0, color2); g2.addColorStop(1, "rgba(0,0,0,0)");
        cx.fillStyle = g2; cx.fillRect(0, 0, 512, 512);
        return new THREE.CanvasTexture(c);
      };
      const nebulaConfigs = [
        { x: -6, y: 3,  z: -18, w: 24, h: 18, c1: "rgba(201,168,76,0.12)", c2: "rgba(255,180,50,0.06)", rot: 0.3  },
        { x: 8,  y: -4, z: -20, w: 22, h: 16, c1: "rgba(255,140,0,0.07)",  c2: "rgba(201,168,76,0.04)", rot: -0.2 },
        { x: 2,  y: 6,  z: -22, w: 30, h: 20, c1: "rgba(180,120,20,0.05)", c2: "rgba(255,200,60,0.03)", rot: 0.6  },
      ];
      nebulaConfigs.forEach(({ x, y, z, w, h, c1, c2, rot }) => {
        const g = new THREE.PlaneGeometry(w, h);
        const tex = makeNebula(w, h, c1, c2);
        const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 1,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(g, m);
        mesh.position.set(x, y, z); mesh.rotation.z = rot;
        scene.add(mesh);
      });

      // ── STAR FIELD ───────────────────────────────────────────────
      const STARS = 1200;
      const sPosArr = new Float32Array(STARS * 3);
      const sSpds   = new Float32Array(STARS);
      const sPhases = new Float32Array(STARS);
      for (let i = 0; i < STARS; i++) {
        sPosArr[i*3]   = (Math.random()-0.5) * 42;
        sPosArr[i*3+1] = (Math.random()-0.5) * 32;
        sPosArr[i*3+2] = (Math.random()-0.5) * 16 - 6;
        sSpds[i]  = Math.random() * 0.5 + 0.08;
        sPhases[i]= Math.random() * Math.PI * 2;
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.BufferAttribute(sPosArr, 3));
      const makeSprite = (c1: string, c2: string, c3: string) => {
        const c = document.createElement("canvas"); c.width = c.height = 128;
        const cx = c.getContext("2d")!;
        const g = cx.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, c1); g.addColorStop(0.2, c2);
        g.addColorStop(0.6, c3); g.addColorStop(1, "rgba(0,0,0,0)");
        cx.fillStyle = g; cx.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
      };
      const starMat = new THREE.PointsMaterial({
        size: 0.07,
        map: makeSprite("rgba(255,250,200,1)", "rgba(255,220,100,0.6)", "rgba(201,168,76,0)"),
        transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      });
      scene.add(new THREE.Points(starGeo, starMat));

      // Bright large stars scattered in background
      const BRIGHT = 40;
      const bPosArr = new Float32Array(BRIGHT * 3);
      for (let i = 0; i < BRIGHT; i++) {
        bPosArr[i*3]   = (Math.random()-0.5) * 36;
        bPosArr[i*3+1] = (Math.random()-0.5) * 28;
        bPosArr[i*3+2] = (Math.random()-0.5) * 10 - 4;
      }
      const bGeo = new THREE.BufferGeometry();
      bGeo.setAttribute("position", new THREE.BufferAttribute(bPosArr, 3));
      const bMat = new THREE.PointsMaterial({
        size: 0.18,
        map: makeSprite("rgba(255,255,255,1)", "rgba(255,220,120,0.5)", "rgba(201,168,76,0)"),
        transparent: true, opacity: 0.9,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      });
      scene.add(new THREE.Points(bGeo, bMat));

      // ── GOLD DUST ───────────────────────────────────────────────
      const DUST = 1800;
      const dPosArr = new Float32Array(DUST * 3);
      const dSpds   = new Float32Array(DUST);
      for (let i = 0; i < DUST; i++) {
        dPosArr[i*3]   = (Math.random()-0.5) * 36;
        dPosArr[i*3+1] = (Math.random()-0.5) * 32;
        dPosArr[i*3+2] = (Math.random()-0.5) * 8 - 2;
        dSpds[i] = Math.random() * 0.12 + 0.02;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dPosArr, 3));
      const dustMat = new THREE.PointsMaterial({
        size: 0.026,
        map: makeSprite("rgba(255,200,50,1)", "rgba(201,168,76,0.5)", "rgba(120,90,20,0)"),
        transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      });
      scene.add(new THREE.Points(dustGeo, dustMat));

      // ── SHOOTING STAR ────────────────────────────────────────────
      let shootTimer = 0, shootActive = false, shootProgress = 0;
      const shootDir = new THREE.Vector3();
      const shootOrig = new THREE.Vector3();
      const sLineGeo = new THREE.BufferGeometry();
      sLineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0,0,0,1,0,0]), 3));
      const sLineMat = new THREE.LineBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, linewidth: 2 });
      scene.add(new THREE.Line(sLineGeo, sLineMat));

      // ── RESIZE ──────────────────────────────────────────────────
      const resize = () => {
        if (!canvas.parentElement || !renderer) return;
        const w = canvas.parentElement.clientWidth;
        const h = canvas.parentElement.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener("resize", resize);

      // ── MOUSE ───────────────────────────────────────────────────
      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      window.addEventListener("mousemove", (e) => {
        mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
        mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
      });

      // ── SCROLL ──────────────────────────────────────────────────
      let scrollY = 0;
      window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

      // ── CLOCK & TICK ─────────────────────────────────────────────
      const clock = new THREE.Clock();

      const tick = () => {
        animId = requestAnimationFrame(tick);
        const t = clock.getElapsedTime();

        // Mouse smooth lerp
        mouse.x += (mouse.tx - mouse.x) * 0.04;
        mouse.y += (mouse.ty - mouse.y) * 0.04;

        // Camera parallax + scroll depth
        const scrollPct = Math.min(scrollY / 700, 1);
        camera.position.x += (mouse.x * 1.4 - camera.position.x) * 0.025;
        camera.position.y += (mouse.y * 0.9 - camera.position.y) * 0.025;
        camera.position.z += (7.5 + scrollPct * 3.5 - camera.position.z) * 0.035;
        camera.lookAt(0, 0, 0);

        // Gem rotation — multi-axis graceful spin
        gem.rotation.y = t * 0.18 + mouse.x * 0.15;
        gem.rotation.x = Math.sin(t * 0.14) * 0.12 + mouse.y * 0.08;
        gem.rotation.z = Math.cos(t * 0.11) * 0.06;
        wireGem.rotation.y = -t * 0.12 + mouse.x * 0.08;
        wireGem.rotation.x = gem.rotation.x;
        wireGem.rotation.z = -gem.rotation.z;

        // Gem scale pulse (subtle breathing)
        const pulse = 1 + Math.sin(t * 0.7) * 0.025;
        gem.scale.setScalar(pulse);
        wireGem.scale.setScalar(pulse * 1.005);

        // Bloom glow — pulse in sync with gem
        glowMeshes.forEach(({ mat }, i) => {
          const base = glowLayers[i].op;
          mat.opacity = base * (0.85 + Math.sin(t * 0.7 + i * 0.4) * 0.15);
        });
        // Glow layers face camera
        glowMeshes.forEach(({ mesh }) => {
          mesh.quaternion.copy(camera.quaternion);
        });

        // Orbiting lights
        orbitLights.forEach(({ lt, r, spd, ph, tilt }) => {
          const a = t * spd + ph;
          lt.position.set(Math.cos(a) * r, Math.sin(a * tilt) * 2, Math.sin(a) * r);
        });
        orbitLights[0].lt.intensity = 18 + Math.sin(t * 1.2) * 5;
        orbitLights[1].lt.intensity = 12 + Math.cos(t * 0.9) * 3;
        orbitLights[2].lt.intensity = 8  + Math.sin(t * 1.6) * 2;
        orbitLights[3].lt.intensity = 6  + Math.cos(t * 1.1) * 2;

        // Orbital rings — pivot rotates + spark travels
        rings.forEach(({ pivotV, sparkAngles, sparks, speed, radius }, ri) => {
          pivotV.rotation.y += speed * 0.008;
          // Update spark positions on ring
          sparkAngles.forEach((angle, si) => {
            sparkAngles[si] += speed * 0.025;
            const a = sparkAngles[si];
            sparks[si].position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
            // Fade in/out with a pulse
            (sparks[si].material as THREE.MeshBasicMaterial).opacity =
              0.7 + Math.sin(t * 3 + ri + si) * 0.3;
          });
        });

        // Stars drift
        const sp = starGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < STARS; i++) {
          let y = sp.getY(i) + sSpds[i] * 0.004;
          if (y > 16) y = -16;
          sp.setY(i, y);
          sp.setX(i, sp.getX(i) + Math.sin(t * sSpds[i] * 0.5 + sPhases[i]) * 0.001);
        }
        sp.needsUpdate = true;

        // Dust drifts diagonally
        const dp = dustGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < DUST; i++) {
          let y = dp.getY(i) + dSpds[i] * 0.003;
          let x = dp.getX(i) + dSpds[i] * 0.0007;
          if (y > 16) y = -16;
          if (x > 18) x = -18;
          dp.setY(i, y); dp.setX(i, x);
        }
        dp.needsUpdate = true;

        // Shooting star
        shootTimer += 0.016;
        if (!shootActive && shootTimer > 5 + Math.random() * 9) {
          shootActive = true; shootProgress = 0; shootTimer = 0;
          shootOrig.set(-16 + Math.random() * 4, 8 + Math.random() * 4, -4);
          shootDir.set(14 + Math.random() * 6, -8 - Math.random() * 6, 2).normalize();
          sLineMat.opacity = 0.95;
        }
        if (shootActive) {
          shootProgress += 0.035;
          const s = shootOrig.clone().addScaledVector(shootDir, shootProgress * 20 - 5);
          const e = shootOrig.clone().addScaledVector(shootDir, shootProgress * 20);
          const pa = sLineGeo.attributes.position as THREE.BufferAttribute;
          pa.setXYZ(0, s.x, s.y, s.z); pa.setXYZ(1, e.x, e.y, e.z);
          pa.needsUpdate = true;
          sLineMat.opacity = Math.max(0, 0.95 - shootProgress * 1.2);
          if (shootProgress >= 1) { shootActive = false; sLineMat.opacity = 0; }
        }

        renderer?.render(scene, camera);
      };
      tick();

      cleanupFn = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", resize);
        renderer?.dispose();
      };
    };

    init();
    return () => { cleanupFn?.(); cancelAnimationFrame(animId); };
  }, []);

  if (!webglSupported) return <CSSFallback />;
  return <canvas ref={canvasRef} id="hero-canvas" />;
}

// ── CSS Fallback (no WebGL) ───────────────────────────────────
function CSSFallback() {
  return (
    <div id="hero-canvas" style={{
      position:"absolute", top:0, left:0, width:"100%", height:"100%",
      background: [
        "radial-gradient(ellipse at 25% 35%, rgba(201,168,76,0.18) 0%, transparent 50%)",
        "radial-gradient(ellipse at 75% 65%, rgba(255,180,50,0.10) 0%, transparent 45%)",
        "radial-gradient(ellipse at 50% 20%, rgba(255,215,0,0.06) 0%, transparent 40%)",
        "#050300",
      ].join(", "),
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes gem-float { 0%,100%{transform:translateY(0) rotate(45deg)} 50%{transform:translateY(-24px) rotate(225deg)} }
        @keyframes gem-pulse { 0%,100%{opacity:.18;transform:scale(1) rotate(45deg)} 50%{opacity:.35;transform:scale(1.1) rotate(225deg)} }
        @keyframes ring-spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes particle-rise { 0%{transform:translateY(0);opacity:.6} 100%{transform:translateY(-80px);opacity:0} }
      `}</style>

      {/* Animated rings */}
      {[{s:180,op:.25,dur:12,d:0},{s:260,op:.18,dur:18,d:2},{s:340,op:.12,dur:24,d:5}].map((r,i)=>(
        <div key={i} style={{
          position:"absolute", top:"50%", left:"50%",
          width:r.s, height:r.s, borderRadius:"50%",
          border:`1px solid rgba(201,168,76,${r.op})`,
          transform:"translate(-50%,-50%)",
          animation:`ring-spin ${r.dur}s ${r.d}s linear infinite`,
        }}/>
      ))}

      {/* Central gem shape */}
      <div style={{
        position:"absolute", top:"50%", left:"50%",
        width:80, height:80,
        background:"linear-gradient(135deg, #ffd700, #c9a84c, #ff8c00)",
        clipPath:"polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
        transform:"translate(-50%,-50%)",
        boxShadow:"0 0 60px 20px rgba(201,168,76,0.4)",
        animation:"gem-pulse 4s ease-in-out infinite",
      }}/>

      {/* Floating particles */}
      {Array.from({length:30}).map((_,i)=>(
        <div key={i} style={{
          position:"absolute",
          left:`${Math.random()*100}%`,
          top:`${60+Math.random()*40}%`,
          width:Math.random()*4+1, height:Math.random()*4+1,
          borderRadius:"50%", background:"#C9A84C",
          opacity: Math.random()*0.6+0.2,
          animation:`particle-rise ${Math.random()*6+4}s ${Math.random()*4}s ease-out infinite`,
        }}/>
      ))}
    </div>
  );
}
