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
      renderer.toneMappingExposure = 1.8;
      renderer.shadowMap.enabled = true;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
      camera.position.set(0, 0.5, 9);

      // ── RICH ENVIRONMENT MAP ─────────────────────────────────
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      const ec = document.createElement("canvas");
      ec.width = 2048; ec.height = 1024;
      const ectx = ec.getContext("2d")!;
      ectx.fillStyle = "#000"; ectx.fillRect(0, 0, 2048, 1024);
      const envSpots = [
        { x: 400,  y: 200, r: 380, c: "rgba(255,220,80,0.95)"   },
        { x: 1600, y: 200, r: 280, c: "rgba(255,255,200,0.9)"   },
        { x: 1000, y: 500, r: 600, c: "rgba(255,200,60,0.55)"   },
        { x: 150,  y: 750, r: 200, c: "rgba(255,140,0,0.7)"     },
        { x: 1900, y: 800, r: 160, c: "rgba(255,255,255,0.85)"  },
        { x: 1200, y: 100, r: 240, c: "rgba(255,200,80,0.65)"   },
        { x: 700,  y: 900, r: 300, c: "rgba(201,168,76,0.6)"    },
        { x: 1700, y: 600, r: 180, c: "rgba(255,180,60,0.55)"   },
      ];
      envSpots.forEach(({ x, y, r, c }) => {
        const g = ectx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, c); g.addColorStop(1, "rgba(0,0,0,0)");
        ectx.fillStyle = g; ectx.fillRect(0, 0, 2048, 1024);
      });
      const envTex = new THREE.CanvasTexture(ec);
      envTex.mapping = THREE.EquirectangularReflectionMapping;
      const envMap = pmrem.fromEquirectangular(envTex).texture;
      scene.environment = envMap;
      pmrem.dispose();

      // ── GOLD MATERIAL (shared) ───────────────────────────────
      const goldMat = new THREE.MeshPhysicalMaterial({
        color: 0xffd700,
        metalness: 0.96,
        roughness: 0.055,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        envMap,
        envMapIntensity: 4.0,
      });

      // ── DIAMOND MATERIAL ─────────────────────────────────────
      const gemMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.92,
        thickness: 1.2,
        ior: 2.42,
        envMap,
        envMapIntensity: 6.0,
        transparent: true,
        side: THREE.DoubleSide,
      });

      // ── RING GROUP ───────────────────────────────────────────
      const ringGroup = new THREE.Group();

      // Main ring band — smooth polished gold
      const bandGeo = new THREE.TorusGeometry(1.3, 0.125, 32, 160);
      const band = new THREE.Mesh(bandGeo, goldMat);
      ringGroup.add(band);

      // Outer glow ring (adds depth/bevel look)
      const outerRingGeo = new THREE.TorusGeometry(1.3, 0.155, 8, 160);
      const outerRingMat = new THREE.MeshPhysicalMaterial({
        color: 0xffa520,
        metalness: 0.9,
        roughness: 0.12,
        transparent: true,
        opacity: 0.35,
        envMap,
        envMapIntensity: 2.5,
        side: THREE.FrontSide,
      });
      ringGroup.add(new THREE.Mesh(outerRingGeo, outerRingMat));

      // ── STONE SETTING ────────────────────────────────────────
      const stoneY = 1.32;

      // Bezel base (octagonal cylinder)
      const settingGeo = new THREE.CylinderGeometry(0.40, 0.32, 0.28, 8, 1);
      const settingBase = new THREE.Mesh(settingGeo, goldMat);
      settingBase.position.set(0, stoneY, 0);
      ringGroup.add(settingBase);

      // Collar ring (thin torus at top of setting)
      const collarGeo = new THREE.TorusGeometry(0.38, 0.022, 8, 64);
      const collar = new THREE.Mesh(collarGeo, goldMat);
      collar.position.set(0, stoneY + 0.14, 0);
      collar.rotation.x = Math.PI / 2;
      ringGroup.add(collar);

      // 6 prongs holding the stone
      const prongGeo = new THREE.CylinderGeometry(0.020, 0.028, 0.45, 6, 1);
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const prong = new THREE.Mesh(prongGeo, goldMat);
        const pr = 0.34;
        prong.position.set(Math.cos(angle) * pr, stoneY + 0.18, Math.sin(angle) * pr);
        prong.rotation.z =  Math.cos(angle) * 0.20;
        prong.rotation.x = -Math.sin(angle) * 0.20;
        ringGroup.add(prong);
      }

      // ── DIAMOND CENTER STONE ─────────────────────────────────
      const gemPoints = [
        new THREE.Vector2(0.01,  0.62),
        new THREE.Vector2(0.24,  0.50),
        new THREE.Vector2(0.35,  0.28),
        new THREE.Vector2(0.37,  0.06),
        new THREE.Vector2(0.37, -0.02),
        new THREE.Vector2(0.25, -0.30),
        new THREE.Vector2(0.12, -0.52),
        new THREE.Vector2(0.01, -0.64),
      ];
      const gemGeo = new THREE.LatheGeometry(gemPoints, 8);
      gemGeo.computeVertexNormals();

      const gem = new THREE.Mesh(gemGeo, gemMat);
      gem.position.set(0, stoneY + 0.32, 0);
      ringGroup.add(gem);

      // Diamond wireframe overlay (shows facets, glowing gold)
      const gemWireMat = new THREE.MeshBasicMaterial({
        color: 0xffe880,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const gemWire = new THREE.Mesh(gemGeo, gemWireMat);
      gemWire.position.copy(gem.position);
      gemWire.scale.setScalar(1.008);
      ringGroup.add(gemWire);

      // ── CAUSTIC RAYS FROM GEM ────────────────────────────────
      // 10 thin planes radiating outward from gem — simulates light rays
      const caustics: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; baseOp: number }[] = [];
      const causticTex = (() => {
        const c = document.createElement("canvas"); c.width = 32; c.height = 256;
        const cx = c.getContext("2d")!;
        const g = cx.createLinearGradient(0, 0, 0, 256);
        g.addColorStop(0,    "rgba(255,215,0,0.0)");
        g.addColorStop(0.15, "rgba(255,215,0,0.9)");
        g.addColorStop(0.5,  "rgba(255,200,80,0.4)");
        g.addColorStop(1,    "rgba(255,180,50,0.0)");
        cx.fillStyle = g; cx.fillRect(0, 0, 32, 256);
        return new THREE.CanvasTexture(c);
      })();
      for (let i = 0; i < 10; i++) {
        const cGeo = new THREE.PlaneGeometry(0.04, 1.8);
        const baseOp = 0.06 + Math.random() * 0.08;
        const cMat = new THREE.MeshBasicMaterial({
          map: causticTex,
          transparent: true,
          opacity: baseOp,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const cMesh = new THREE.Mesh(cGeo, cMat);
        cMesh.position.copy(gem.position);
        cMesh.geometry.translate(0, 0.9, 0); // pivot from bottom (gem center)
        cMesh.rotation.z = (i / 10) * Math.PI * 2;
        cMesh.rotation.y = (i / 10) * Math.PI * 1.5;
        caustics.push({ mesh: cMesh, mat: cMat, baseOp });
        ringGroup.add(cMesh);
      }

      // Tilt & position the ring to show stone facing camera
      ringGroup.rotation.x = Math.PI / 6.5;  // ~27.7° tilt — stone faces viewer
      ringGroup.rotation.z = 0.08;
      ringGroup.position.y = -0.3;
      scene.add(ringGroup);

      // ── LIGHTS ───────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xfff8e0, 0.5));

      const key = new THREE.DirectionalLight(0xffffff, 4.5);
      key.position.set(4, 7, 8);
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xffe080, 2.0);
      fill.position.set(-5, -2, 4);
      scene.add(fill);

      const rim = new THREE.DirectionalLight(0xffffff, 2.5);
      rim.position.set(0, 2, -6);
      scene.add(rim);

      const gemSpot = new THREE.SpotLight(0xffffff, 60, 12, Math.PI / 6, 0.5);
      gemSpot.position.set(0, 8, 4);
      scene.add(gemSpot);
      scene.add(gemSpot.target);
      gemSpot.target.position.set(0, stoneY + 0.3, 0);

      const orbitLights = [
        { lt: new THREE.PointLight(0xffd700, 25, 10), r: 3.5, spd:  0.50, ph: 0,           yAmp: 1.8 },
        { lt: new THREE.PointLight(0xffffff, 18, 9),  r: 2.8, spd: -0.38, ph: Math.PI,     yAmp: 1.2 },
        { lt: new THREE.PointLight(0xff9900, 15, 8),  r: 3.2, spd:  0.62, ph: Math.PI/1.7, yAmp: 2.0 },
        { lt: new THREE.PointLight(0xffe080, 12, 7),  r: 2.5, spd: -0.45, ph: Math.PI/3,   yAmp: 1.4 },
      ];
      orbitLights.forEach(({ lt }) => scene.add(lt));

      // ── GEM GLOW (BLOOM SIMULATION) ──────────────────────────
      const makeGlowTex = (c0: string, c1: string, c2: string) => {
        const c = document.createElement("canvas"); c.width = c.height = 256;
        const cx = c.getContext("2d")!;
        const g = cx.createRadialGradient(128, 128, 0, 128, 128, 128);
        g.addColorStop(0,    c0);
        g.addColorStop(0.18, c1);
        g.addColorStop(0.55, c2);
        g.addColorStop(1,    "rgba(0,0,0,0)");
        cx.fillStyle = g; cx.fillRect(0, 0, 256, 256);
        return new THREE.CanvasTexture(c);
      };
      const glowDefs = [
        { sz: 0.55, op: 0.75, tex: makeGlowTex("rgba(255,255,255,0.95)", "rgba(255,230,100,0.6)", "rgba(255,200,50,0.2)") },
        { sz: 1.1,  op: 0.35, tex: makeGlowTex("rgba(255,225,80,0.85)",  "rgba(255,200,50,0.3)", "rgba(201,168,76,0.1)") },
        { sz: 2.4,  op: 0.18, tex: makeGlowTex("rgba(255,200,50,0.5)",   "rgba(180,140,30,0.15)","rgba(120,90,20,0.04)") },
        { sz: 4.5,  op: 0.08, tex: makeGlowTex("rgba(201,168,76,0.35)",  "rgba(150,110,20,0.08)","rgba(80,50,0,0.0)")    },
        { sz: 8.0,  op: 0.04, tex: makeGlowTex("rgba(180,130,20,0.2)",   "rgba(100,70,0,0.04)", "rgba(0,0,0,0)")        },
        { sz: 14.0, op: 0.02, tex: makeGlowTex("rgba(140,100,10,0.12)",  "rgba(60,40,0,0.02)",  "rgba(0,0,0,0)")        },
      ];
      const glows: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; baseOp: number }[] = [];
      glowDefs.forEach(({ sz, op, tex }) => {
        const g = new THREE.PlaneGeometry(sz, sz);
        const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: op,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(g, m);
        scene.add(mesh);
        glows.push({ mesh, mat: m, baseOp: op });
      });

      // ── SPARKLE RING (orbiting particles around the gem) ─────
      const SPARKLING = 80;
      const sparkleMeshes: THREE.Mesh[] = [];
      const sparkleData: { angle: number; speed: number; radius: number; yPhase: number }[] = [];
      const sparkleGeo = new THREE.SphereGeometry(0.025, 6, 6);
      const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9,
        blending: THREE.AdditiveBlending, depthWrite: false });
      for (let i = 0; i < SPARKLING; i++) {
        const m = new THREE.Mesh(sparkleGeo, sparkleMat.clone());
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.6 + Math.random() * 1.2;
        const speed = (Math.random() * 0.3 + 0.15) * (Math.random() > 0.5 ? 1 : -1);
        sparkleData.push({ angle, speed, radius, yPhase: Math.random() * Math.PI * 2 });
        scene.add(m);
        sparkleMeshes.push(m);
      }

      // ── BACKGROUND NEBULA ─────────────────────────────────────
      const makeNebulaTex = (c0: string, c1: string) => {
        const c = document.createElement("canvas"); c.width = c.height = 512;
        const cx = c.getContext("2d")!;
        cx.fillStyle = "rgba(0,0,0,0)"; cx.fillRect(0, 0, 512, 512);
        [[180, 180, 200, c0],[340, 340, 160, c1]].forEach(([x, y, r, color]) => {
          const g = cx.createRadialGradient(x as number, y as number, 0, x as number, y as number, r as number);
          g.addColorStop(0, color as string); g.addColorStop(1, "rgba(0,0,0,0)");
          cx.fillStyle = g; cx.fillRect(0, 0, 512, 512);
        });
        return new THREE.CanvasTexture(c);
      };
      [
        { x: -7, y: 3,  z: -20, w: 26, h: 18, c0: "rgba(201,168,76,0.13)", c1: "rgba(255,180,50,0.07)", rot: 0.3  },
        { x: 8,  y: -4, z: -22, w: 24, h: 16, c0: "rgba(255,140,0,0.08)",  c1: "rgba(201,168,76,0.05)", rot: -0.2 },
        { x: 0,  y: 7,  z: -25, w: 32, h: 22, c0: "rgba(180,120,20,0.06)", c1: "rgba(255,200,60,0.03)", rot: 0.6  },
      ].forEach(({ x, y, z, w, h, c0, c1, rot }) => {
        const g = new THREE.PlaneGeometry(w, h);
        const m = new THREE.MeshBasicMaterial({ map: makeNebulaTex(c0, c1), transparent: true, opacity: 1,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(g, m);
        mesh.position.set(x, y, z); mesh.rotation.z = rot;
        scene.add(mesh);
      });

      // ── STAR FIELD ────────────────────────────────────────────
      const STARS = 1400;
      const sPosArr = new Float32Array(STARS * 3);
      for (let i = 0; i < STARS; i++) {
        sPosArr[i*3]   = (Math.random()-0.5) * 46;
        sPosArr[i*3+1] = (Math.random()-0.5) * 36;
        sPosArr[i*3+2] = (Math.random()-0.5) * 14 - 5;
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.BufferAttribute(sPosArr, 3));
      const makeSpriteTex = (c0: string, c1: string) => {
        const c = document.createElement("canvas"); c.width = c.height = 64;
        const cx = c.getContext("2d")!;
        const g = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, c0); g.addColorStop(0.25, c1); g.addColorStop(1, "rgba(0,0,0,0)");
        cx.fillStyle = g; cx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
      };
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
        size: 0.065,
        map: makeSpriteTex("rgba(255,245,190,1)", "rgba(201,168,76,0.4)"),
        transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      })));

      // Bright accent stars
      const BRIGHT = 50;
      const bArr = new Float32Array(BRIGHT * 3);
      for (let i = 0; i < BRIGHT; i++) {
        bArr[i*3] = (Math.random()-0.5)*40; bArr[i*3+1] = (Math.random()-0.5)*30; bArr[i*3+2] = (Math.random()-0.5)*8-3;
      }
      const bGeo = new THREE.BufferGeometry();
      bGeo.setAttribute("position", new THREE.BufferAttribute(bArr, 3));
      scene.add(new THREE.Points(bGeo, new THREE.PointsMaterial({
        size: 0.20,
        map: makeSpriteTex("rgba(255,255,255,1)", "rgba(255,230,100,0.4)"),
        transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      })));

      // ── GOLD DUST PARTICLES ────────────────────────────────────
      const DUST = 1600;
      const dArr = new Float32Array(DUST * 3);
      const dSpd = new Float32Array(DUST);
      for (let i = 0; i < DUST; i++) {
        dArr[i*3] = (Math.random()-0.5)*38; dArr[i*3+1] = (Math.random()-0.5)*30; dArr[i*3+2] = (Math.random()-0.5)*8 - 2;
        dSpd[i] = Math.random() * 0.10 + 0.02;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dArr, 3));
      scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({
        size: 0.022,
        map: makeSpriteTex("rgba(255,210,60,1)", "rgba(201,168,76,0.4)"),
        transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      })));

      // ── SHOOTING STAR ─────────────────────────────────────────
      let sTimer = 0, sActive = false, sProgress = 0;
      const sOrig = new THREE.Vector3(), sDir = new THREE.Vector3();
      const sGeo = new THREE.BufferGeometry();
      sGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0,0,0,1,0,0]), 3));
      const sMat = new THREE.LineBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false });
      scene.add(new THREE.Line(sGeo, sMat));

      // ── RESIZE ────────────────────────────────────────────────
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

      // ── MOUSE ─────────────────────────────────────────────────
      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMouse = (e: MouseEvent) => {
        mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
        mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("mousemove", onMouse);

      // ── SCROLL ────────────────────────────────────────────────
      let scrollY = 0;
      const onScroll = () => { scrollY = window.scrollY; };
      window.addEventListener("scroll", onScroll, { passive: true });

      // ── CLOCK & ANIMATION ─────────────────────────────────────
      const clock = new THREE.Clock();
      const gemWorldPos = new THREE.Vector3();

      const tick = () => {
        animId = requestAnimationFrame(tick);
        const t = clock.getElapsedTime();

        // Smooth mouse
        mouse.x += (mouse.tx - mouse.x) * 0.045;
        mouse.y += (mouse.ty - mouse.y) * 0.045;

        // Camera parallax + scroll pull
        const scrollPct = Math.min(scrollY / 600, 1);
        camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.03;
        camera.position.y += (0.5 + mouse.y * 0.8 - camera.position.y) * 0.03;
        camera.position.z += (9.0 + scrollPct * 4.0 - camera.position.z) * 0.04;
        camera.lookAt(0, 0.2, 0);

        // Ring — slow graceful rotation + float
        ringGroup.rotation.y += 0.0055;
        ringGroup.position.y = Math.sin(t * 0.45) * 0.16 - 0.3;

        // Gem spin (counter to ring for visual richness)
        gem.rotation.y = -t * 0.25;
        gemWire.rotation.y = t * 0.18;

        // Caustic rays
        caustics.forEach(({ mesh, mat, baseOp }, i) => {
          mesh.rotation.z = (i / 10) * Math.PI * 2 + t * 0.28;
          mesh.rotation.y = (i / 10) * Math.PI * 1.5 + t * -0.15;
          mat.opacity = baseOp * (0.8 + Math.sin(t * 2.8 + i * 0.63) * 0.2);
        });

        // Glow tracks gem world position
        gem.getWorldPosition(gemWorldPos);
        glows.forEach(({ mesh, mat, baseOp }) => {
          mesh.position.copy(gemWorldPos);
          mesh.quaternion.copy(camera.quaternion);
          mat.opacity = baseOp * (0.9 + Math.sin(t * 0.9) * 0.1);
        });

        // Orbiting sparkles
        sparkleMeshes.forEach((m, i) => {
          const d = sparkleData[i];
          d.angle += d.speed * 0.016;
          const yOff = Math.sin(t * 0.6 + d.yPhase) * 0.3;
          const gx = gemWorldPos.x, gy = gemWorldPos.y, gz = gemWorldPos.z;
          m.position.set(
            gx + Math.cos(d.angle) * d.radius,
            gy + yOff,
            gz + Math.sin(d.angle) * d.radius
          );
          (m.material as THREE.MeshBasicMaterial).opacity =
            0.5 + Math.sin(t * 4 + i) * 0.5;
        });

        // Orbiting lights
        orbitLights.forEach(({ lt, r, spd, ph, yAmp }) => {
          const a = t * spd + ph;
          lt.position.set(Math.cos(a) * r, Math.sin(a * 0.6) * yAmp, Math.sin(a) * r);
        });
        orbitLights[0].lt.intensity = 22 + Math.sin(t * 1.1) * 6;
        orbitLights[1].lt.intensity = 16 + Math.cos(t * 0.8) * 4;
        orbitLights[2].lt.intensity = 13 + Math.sin(t * 1.5) * 3;
        orbitLights[3].lt.intensity = 10 + Math.cos(t * 1.0) * 2;

        // Dust drift
        const dp = dustGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < DUST; i++) {
          let y = dp.getY(i) + dSpd[i] * 0.003;
          let x = dp.getX(i) + dSpd[i] * 0.0005;
          if (y > 15) y = -15;
          if (x > 19) x = -19;
          dp.setY(i, y); dp.setX(i, x);
        }
        dp.needsUpdate = true;

        // Shooting star
        sTimer += 0.016;
        if (!sActive && sTimer > 6 + Math.random() * 10) {
          sActive = true; sProgress = 0; sTimer = 0;
          sOrig.set(-18 + Math.random() * 4, 9 + Math.random() * 4, -4);
          sDir.set(16 + Math.random() * 6, -10 - Math.random() * 4, 2).normalize();
          sMat.opacity = 0.9;
        }
        if (sActive) {
          sProgress += 0.03;
          const s = sOrig.clone().addScaledVector(sDir, sProgress * 22 - 6);
          const e = sOrig.clone().addScaledVector(sDir, sProgress * 22);
          const pa = sGeo.attributes.position as THREE.BufferAttribute;
          pa.setXYZ(0, s.x, s.y, s.z); pa.setXYZ(1, e.x, e.y, e.z);
          pa.needsUpdate = true;
          sMat.opacity = Math.max(0, 0.9 - sProgress * 1.1);
          if (sProgress >= 1) { sActive = false; sMat.opacity = 0; }
        }

        renderer?.render(scene, camera);
      };
      tick();

      cleanupFn = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("scroll", onScroll);
        renderer?.dispose();
      };
    };

    init();
    return () => { cleanupFn?.(); cancelAnimationFrame(animId); };
  }, []);

  if (!webglSupported) return <CSSFallback />;
  return <canvas ref={canvasRef} id="hero-canvas" />;
}

// ── CSS Fallback ──────────────────────────────────────────────
function CSSFallback() {
  return (
    <div id="hero-canvas" style={{
      position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
      background: [
        "radial-gradient(ellipse at 60% 45%, rgba(201,168,76,0.22) 0%, transparent 55%)",
        "radial-gradient(ellipse at 40% 55%, rgba(255,180,50,0.12) 0%, transparent 45%)",
        "#040200",
      ].join(", "),
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes ring-spin  { to { transform: rotateY(360deg) rotateX(25deg); } }
        @keyframes gem-pulse  { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
        @keyframes dust-rise  { 0%{transform:translateY(0);opacity:.5} 100%{transform:translateY(-90px);opacity:0} }
        @keyframes halo-pulse { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.4} 50%{transform:translate(-50%,-50%) scale(1.12);opacity:.6} }
      `}</style>

      {/* Ambient halo */}
      <div style={{
        position:"absolute", top:"48%", left:"50%", width:320, height:320, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(201,168,76,0.28) 0%, transparent 70%)",
        animation:"halo-pulse 3s ease-in-out infinite",
      }}/>

      {/* Ring silhouette */}
      <div style={{
        position:"absolute", top:"48%", left:"50%",
        width:180, height:180, borderRadius:"50%",
        border:"10px solid rgba(201,168,76,0.8)",
        boxShadow:"0 0 40px 12px rgba(201,168,76,0.4), inset 0 0 20px rgba(255,215,0,0.2)",
        animation:"ring-spin 14s linear infinite",
        transformOrigin:"50% 50%",
        transform:"translate(-50%,-50%) rotateX(25deg)",
      }}>
        {/* Stone on top */}
        <div style={{
          position:"absolute", top:-28, left:"50%", transform:"translateX(-50%)",
          width:40, height:44,
          background:"linear-gradient(160deg, #fff 0%, #ffd700 40%, #c9a84c 80%)",
          clipPath:"polygon(50% 0%, 85% 30%, 100% 60%, 85% 100%, 15% 100%, 0% 60%, 15% 30%)",
          boxShadow:"0 0 30px 10px rgba(255,215,0,0.6)",
          animation:"gem-pulse 2.4s ease-in-out infinite",
        }}/>
      </div>

      {/* Dust particles */}
      {Array.from({length:20}).map((_,i)=>(
        <div key={i} style={{
          position:"absolute",
          left:`${30+Math.random()*40}%`,
          top:`${40+Math.random()*40}%`,
          width: 2+Math.random()*3, height: 2+Math.random()*3,
          borderRadius:"50%", background:"#C9A84C", opacity: 0.6,
          animation:`dust-rise ${3+Math.random()*5}s ${Math.random()*4}s ease-out infinite`,
        }}/>
      ))}
    </div>
  );
}
