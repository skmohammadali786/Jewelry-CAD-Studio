import { useEffect, useRef, useState } from "react";

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const testCanvas = document.createElement("canvas");
    const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
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
      renderer.toneMappingExposure = 1.4;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 300);
      camera.position.set(0, 0, 8);

      // ── Environment map for reflections ───────────────────────────
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      const envC = document.createElement("canvas");
      envC.width = 512; envC.height = 256;
      const ec = envC.getContext("2d")!;
      const eg = ec.createLinearGradient(0, 0, 512, 256);
      eg.addColorStop(0,   "#0a0500");
      eg.addColorStop(0.2, "#1a0800");
      eg.addColorStop(0.4, "#c9a84c");
      eg.addColorStop(0.55,"#ffe8a0");
      eg.addColorStop(0.7, "#1a0800");
      eg.addColorStop(1,   "#050200");
      ec.fillStyle = eg; ec.fillRect(0, 0, 512, 256);
      const envTex = new THREE.CanvasTexture(envC);
      envTex.mapping = THREE.EquirectangularReflectionMapping;
      const envMap = pmrem.fromEquirectangular(envTex).texture;
      scene.environment = envMap;
      pmrem.dispose();

      // ── Lights ─────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xfff0d0, 0.4));

      const keyLight = new THREE.DirectionalLight(0xffd080, 3.0);
      keyLight.position.set(4, 6, 4);
      keyLight.castShadow = true;
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xc9a84c, 1.5);
      fillLight.position.set(-4, -2, 2);
      scene.add(fillLight);

      // Orbiting point lights (3 colored lights that circle the gem)
      const orbitLights = [
        { light: new THREE.PointLight(0xffd700, 12, 14), radius: 3.5, speed: 0.42, phase: 0,             tilt: 0.6 },
        { light: new THREE.PointLight(0xff9000, 8,  12), radius: 3.0, speed: -0.31, phase: Math.PI * 0.7, tilt: -0.4 },
        { light: new THREE.PointLight(0xffffff, 6,  10), radius: 2.8, speed: 0.55, phase: Math.PI * 1.3, tilt: 1.0 },
      ];
      orbitLights.forEach(({ light }) => scene.add(light));

      // ── CENTRAL GEM — polished gold diamond ────────────────────────
      const gemGeo = new THREE.OctahedronGeometry(1.35, 2);
      // Squish it into a diamond tablet shape
      const posArr = gemGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < posArr.length; i += 3) {
        if (posArr[i + 1] > 0) posArr[i + 1] *= 0.75; // flatten top
        else posArr[i + 1] *= 1.1; // elongate bottom
      }
      gemGeo.attributes.position.needsUpdate = true;
      gemGeo.computeVertexNormals();

      const gemMat = new THREE.MeshStandardMaterial({
        color: 0xc9a84c,
        metalness: 0.92,
        roughness: 0.04,
        envMap,
        envMapIntensity: 3.5,
      });
      const gem = new THREE.Mesh(gemGeo, gemMat);
      gem.castShadow = true;
      scene.add(gem);

      // Inner glow core
      const coreGeo = new THREE.OctahedronGeometry(0.9, 1);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffe8a0,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      scene.add(new THREE.Mesh(coreGeo, coreMat));

      // Wireframe shell — counter-rotating
      const shellGeo = new THREE.OctahedronGeometry(1.45, 2);
      const shellMat = new THREE.MeshBasicMaterial({
        color: 0xe8c96d,
        wireframe: true,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const shell = new THREE.Mesh(shellGeo, shellMat);
      scene.add(shell);

      // Outer glow aura (large sphere, back-face, additive)
      const auraGeo = new THREE.SphereGeometry(3.0, 32, 32);
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0xc9a84c,
        transparent: true,
        opacity: 0.045,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      scene.add(new THREE.Mesh(auraGeo, auraMat));

      // Secondary pulsing glow
      const glow2Geo = new THREE.SphereGeometry(1.9, 16, 16);
      const glow2Mat = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.04,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glow2 = new THREE.Mesh(glow2Geo, glow2Mat);
      scene.add(glow2);

      // ── ORBITING RINGS ─────────────────────────────────────────────
      const ringConfigs = [
        { r: 2.5,  tube: 0.009, rotX: Math.PI/3.5,  rotZ: 0.1,           speed:  0.28, color: 0xc9a84c, op: 0.55 },
        { r: 3.4,  tube: 0.006, rotX: -Math.PI/4.5, rotZ: Math.PI/5,     speed: -0.19, color: 0xe8c96d, op: 0.35 },
        { r: 1.9,  tube: 0.011, rotX: Math.PI/6,    rotZ: -Math.PI/8,    speed:  0.47, color: 0xffd700, op: 0.45 },
        { r: 4.2,  tube: 0.004, rotX: Math.PI/2.2,  rotZ: Math.PI/3,     speed:  0.14, color: 0xc9a84c, op: 0.18 },
        { r: 2.1,  tube: 0.007, rotX: -Math.PI/3,   rotZ: -Math.PI/6,    speed: -0.35, color: 0xffe8a0, op: 0.30 },
      ];

      const rings: { mesh: import("three").Mesh; speed: number; pivot: import("three").Object3D }[] = [];
      ringConfigs.forEach(({ r, tube, rotX, rotZ, speed, color, op }) => {
        const geo = new THREE.TorusGeometry(r, tube, 8, 140);
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op,
          blending: THREE.AdditiveBlending, depthWrite: false });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = rotX;
        mesh.rotation.z = rotZ;
        const pivot = new THREE.Object3D();
        pivot.add(mesh);
        scene.add(pivot);
        rings.push({ mesh, speed, pivot });
      });

      // ── FLOATING MINI GEMS (Instanced) ─────────────────────────────
      const MINI_COUNT = 20;
      const miniGeo = new THREE.OctahedronGeometry(0.12, 0);
      const miniMat = new THREE.MeshStandardMaterial({
        color: 0xc9a84c, metalness: 0.95, roughness: 0.05, envMap, envMapIntensity: 2,
      });
      type MiniGem = {
        mesh: import("three").Mesh;
        rotSpeed: import("three").Vector3;
        floatPhase: number;
        floatSpeed: number;
        basePos: import("three").Vector3;
        orbitRadius: number;
        orbitSpeed: number;
        orbitPhase: number;
        orbitTilt: number;
      };
      const miniGems: MiniGem[] = [];
      for (let i = 0; i < MINI_COUNT; i++) {
        const scale = Math.random() * 0.9 + 0.4;
        const mat = miniMat.clone();
        mat.color.setHex(i % 3 === 0 ? 0xffd700 : i % 3 === 1 ? 0xc9a84c : 0xe8c96d);
        const m = new THREE.Mesh(miniGeo, mat);
        m.scale.setScalar(scale);
        const angle = (i / MINI_COUNT) * Math.PI * 2;
        const radius = 3.5 + Math.random() * 3.5;
        m.position.set(
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 7,
          Math.sin(angle) * radius * 0.6 - 2
        );
        scene.add(m);
        miniGems.push({
          mesh: m,
          rotSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 0.03,
            (Math.random() - 0.5) * 0.04,
            (Math.random() - 0.5) * 0.02,
          ),
          floatPhase: Math.random() * Math.PI * 2,
          floatSpeed: Math.random() * 0.3 + 0.2,
          basePos: m.position.clone(),
          orbitRadius: radius,
          orbitSpeed: (Math.random() - 0.5) * 0.08,
          orbitPhase: angle,
          orbitTilt: (Math.random() - 0.5) * 0.8,
        });
      }

      // ── STAR FIELD ─────────────────────────────────────────────────
      const STAR_COUNT = 900;
      const starPos = new Float32Array(STAR_COUNT * 3);
      const starSpeeds = new Float32Array(STAR_COUNT);
      const starPhases = new Float32Array(STAR_COUNT);
      for (let i = 0; i < STAR_COUNT; i++) {
        starPos[i*3]   = (Math.random() - 0.5) * 36;
        starPos[i*3+1] = (Math.random() - 0.5) * 30;
        starPos[i*3+2] = (Math.random() - 0.5) * 14 - 4;
        starSpeeds[i]  = Math.random() * 0.5 + 0.1;
        starPhases[i]  = Math.random() * Math.PI * 2;
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));

      const makeSprite = (col: string, glow: string) => {
        const c = document.createElement("canvas"); c.width = c.height = 64;
        const cx = c.getContext("2d")!;
        const g = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, col); g.addColorStop(0.3, col);
        g.addColorStop(0.6, glow); g.addColorStop(1, "rgba(0,0,0,0)");
        cx.fillStyle = g; cx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
      };

      const starMat = new THREE.PointsMaterial({
        size: 0.06, map: makeSprite("rgba(255,240,180,1)", "rgba(201,168,76,0)"),
        transparent: true, opacity: 0.8,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      });
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);

      // ── GOLD DUST ──────────────────────────────────────────────────
      const DUST_COUNT = 1500;
      const dustPos = new Float32Array(DUST_COUNT * 3);
      const dustSpeeds = new Float32Array(DUST_COUNT);
      for (let i = 0; i < DUST_COUNT; i++) {
        dustPos[i*3]   = (Math.random() - 0.5) * 32;
        dustPos[i*3+1] = (Math.random() - 0.5) * 28;
        dustPos[i*3+2] = (Math.random() - 0.5) * 6 - 2;
        dustSpeeds[i]  = Math.random() * 0.12 + 0.02;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
      const dustMat = new THREE.PointsMaterial({
        size: 0.024, map: makeSprite("rgba(201,168,76,1)", "rgba(154,122,48,0)"),
        transparent: true, opacity: 0.45,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      });
      scene.add(new THREE.Points(dustGeo, dustMat));

      // ── SHOOTING STAR SYSTEM ───────────────────────────────────────
      let shootTimer = 0;
      let shootActive = false;
      let shootProgress = 0;
      const shootLine = (() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0,0,0, 1,0,0]), 3));
        const m = new THREE.LineBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false });
        const l = new THREE.Line(g, m);
        scene.add(l);
        return { line: l, geo: g, mat: m };
      })();
      let shootDir = new THREE.Vector3();
      let shootOrigin = new THREE.Vector3();

      // ── Resize ─────────────────────────────────────────────────────
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

      // ── Mouse parallax ─────────────────────────────────────────────
      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMouse = (e: MouseEvent) => {
        mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
        mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("mousemove", onMouse);

      // ── Scroll reaction ─────────────────────────────────────────────
      let scrollY = 0;
      const onScroll = () => { scrollY = window.scrollY; };
      window.addEventListener("scroll", onScroll, { passive: true });

      // ── Animate ────────────────────────────────────────────────────
      const clock = new THREE.Clock();

      const tick = () => {
        animId = requestAnimationFrame(tick);
        const t = clock.getElapsedTime();
        const dt = clock.getDelta ? 0.016 : 0.016;

        // Mouse lerp
        mouse.x += (mouse.tx - mouse.x) * 0.035;
        mouse.y += (mouse.ty - mouse.y) * 0.035;

        // Camera position — parallax + scroll zoom
        const scrollFactor = Math.min(scrollY / 600, 1);
        const targetZ = 8 + scrollFactor * 2.5;
        camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.02;
        camera.position.y += (mouse.y * 0.7 - camera.position.y) * 0.02;
        camera.position.z += (targetZ - camera.position.z) * 0.04;
        camera.lookAt(0, 0, 0);

        // Central gem — slow Y spin + wobble
        gem.rotation.y = t * 0.22;
        gem.rotation.x = Math.sin(t * 0.18) * 0.15;
        gem.rotation.z = Math.cos(t * 0.13) * 0.08;

        // Shell counter-rotates
        shell.rotation.y = -t * 0.15;
        shell.rotation.x = Math.cos(t * 0.2) * 0.2;

        // Glow pulse
        glow2Mat.opacity = 0.03 + Math.sin(t * 0.9) * 0.02;
        auraMat.opacity  = 0.04 + Math.sin(t * 0.6) * 0.015;

        // Orbiting lights — circle the gem
        orbitLights.forEach(({ light, radius, speed, phase, tilt }) => {
          const a = t * speed + phase;
          light.position.set(
            Math.cos(a) * radius,
            Math.sin(a * tilt) * 1.5,
            Math.sin(a) * radius
          );
        });

        // Pulse light intensity
        orbitLights[0].light.intensity = 10 + Math.sin(t * 1.3) * 3;
        orbitLights[1].light.intensity = 6  + Math.cos(t * 0.9) * 2;
        orbitLights[2].light.intensity = 4  + Math.sin(t * 1.7) * 1.5;

        // Orbiting rings
        rings.forEach(({ mesh, speed, pivot }) => {
          pivot.rotation.y += speed * 0.01;
          mesh.rotation.z += speed * 0.005;
        });

        // Mini gems — orbit + float
        miniGems.forEach((mg) => {
          mg.orbitPhase += mg.orbitSpeed;
          const newX = Math.cos(mg.orbitPhase) * mg.orbitRadius;
          const newZ = Math.sin(mg.orbitPhase) * mg.orbitRadius * 0.6 - 2;
          const floatY = mg.basePos.y + Math.sin(t * mg.floatSpeed + mg.floatPhase) * 0.6;
          mg.mesh.position.set(newX, floatY, newZ);
          mg.mesh.rotation.x += mg.rotSpeed.x;
          mg.mesh.rotation.y += mg.rotSpeed.y;
          mg.mesh.rotation.z += mg.rotSpeed.z;
        });

        // Stars drift upward
        const sp = starGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < STAR_COUNT; i++) {
          let y = sp.getY(i) + starSpeeds[i] * 0.005;
          if (y > 15) y = -15;
          sp.setY(i, y);
          sp.setX(i, sp.getX(i) + Math.sin(t * starSpeeds[i] * 0.4 + starPhases[i]) * 0.0012);
        }
        sp.needsUpdate = true;

        // Dust drifts diagonally
        const dp = dustGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < DUST_COUNT; i++) {
          let y = dp.getY(i) + dustSpeeds[i] * 0.003;
          let x = dp.getX(i) + dustSpeeds[i] * 0.0008;
          if (y > 14) y = -14;
          if (x > 16) x = -16;
          dp.setY(i, y); dp.setX(i, x);
        }
        dp.needsUpdate = true;

        // Shooting star
        shootTimer += 0.016;
        if (!shootActive && shootTimer > 6 + Math.random() * 8) {
          shootActive = true; shootProgress = 0; shootTimer = 0;
          shootOrigin.set(-14 + Math.random() * 4, 6 + Math.random() * 4, -3);
          shootDir.set(12 + Math.random() * 6, -7 - Math.random() * 5, 1).normalize();
          shootLine.mat.opacity = 0.9;
        }
        if (shootActive) {
          shootProgress += 0.04;
          const start = shootOrigin.clone().addScaledVector(shootDir, shootProgress * 18 - 4);
          const end   = shootOrigin.clone().addScaledVector(shootDir, shootProgress * 18);
          const pa = shootLine.geo.attributes.position as THREE.BufferAttribute;
          pa.setXYZ(0, start.x, start.y, start.z);
          pa.setXYZ(1, end.x, end.y, end.z);
          pa.needsUpdate = true;
          shootLine.mat.opacity = Math.max(0, 0.9 - shootProgress * 1.1);
          if (shootProgress >= 1) { shootActive = false; shootLine.mat.opacity = 0; }
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

function CSSFallback() {
  return (
    <div id="hero-canvas" style={{
      position:"absolute", top:0, left:0, width:"100%", height:"100%",
      background:"radial-gradient(ellipse at 30% 40%, rgba(201,168,76,0.12) 0%, transparent 55%), radial-gradient(ellipse at 70% 60%, rgba(201,168,76,0.07) 0%, transparent 50%), #050300",
      overflow:"hidden",
    }}>
      <style>{`
        @keyframes fgem { 0%,100%{transform:translateY(0) rotate(0deg);opacity:.15} 50%{transform:translateY(-30px) rotate(180deg);opacity:.3} }
        @keyframes forb { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
      `}</style>
      {Array.from({length:6}).map((_,i)=>(
        <div key={i} style={{
          position:"absolute",
          left:`${15+i*14}%`, top:`${20+i*10}%`,
          width:12+i*4, height:12+i*4,
          background:"#C9A84C",
          clipPath:"polygon(50% 0%,100% 50%,50% 100%,0% 50%)",
          opacity:.12, animation:`fgem ${5+i*2}s ${i}s ease-in-out infinite`,
        }}/>
      ))}
    </div>
  );
}
