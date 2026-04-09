import { useEffect, useRef, useState } from "react";

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const testCanvas = document.createElement("canvas");
    const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
    if (!gl) {
      setWebglSupported(false);
      return;
    }

    let animId: number;
    let renderer: import("three").WebGLRenderer | null = null;
    let cleanupFn: (() => void) | undefined;

    const init = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const THREE = await import("three");

      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        setWebglSupported(false);
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 200);
      camera.position.z = 6;

      // ── Ambient + point lights ──────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 0.3));
      const goldLight = new THREE.PointLight(0xc9a84c, 4, 20);
      goldLight.position.set(3, 3, 3);
      scene.add(goldLight);
      const goldLight2 = new THREE.PointLight(0xe8c96d, 2, 15);
      goldLight2.position.set(-4, -2, 2);
      scene.add(goldLight2);

      // ── Helper: sparkle canvas texture ─────────────────────────────
      const makeSparkTex = (innerColor: string, outerColor: string) => {
        const c = document.createElement("canvas");
        c.width = c.height = 64;
        const cx = c.getContext("2d")!;
        const g = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, innerColor);
        g.addColorStop(0.25, innerColor);
        g.addColorStop(0.6, outerColor);
        g.addColorStop(1, "rgba(0,0,0,0)");
        cx.fillStyle = g;
        cx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
      };

      // ── Layer 1: Large glowing gold orbs (background) ──────────────
      const ORB_COUNT = 18;
      const orbPositions = new Float32Array(ORB_COUNT * 3);
      for (let i = 0; i < ORB_COUNT; i++) {
        orbPositions[i * 3] = (Math.random() - 0.5) * 28;
        orbPositions[i * 3 + 1] = (Math.random() - 0.5) * 24;
        orbPositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 4;
      }
      const orbGeo = new THREE.BufferGeometry();
      orbGeo.setAttribute("position", new THREE.BufferAttribute(orbPositions, 3));
      const orbMat = new THREE.PointsMaterial({
        size: 0.9,
        map: makeSparkTex("rgba(232,201,109,0.9)", "rgba(201,168,76,0)"),
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });
      scene.add(new THREE.Points(orbGeo, orbMat));

      // ── Layer 2: Medium gold stars ──────────────────────────────────
      const STAR_COUNT = 700;
      const starPos = new Float32Array(STAR_COUNT * 3);
      const starSpeeds = new Float32Array(STAR_COUNT);
      const starPhases = new Float32Array(STAR_COUNT);
      for (let i = 0; i < STAR_COUNT; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 24;
        starPos[i * 3 + 1] = (Math.random() - 0.5) * 22;
        starPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
        starSpeeds[i] = Math.random() * 0.4 + 0.08;
        starPhases[i] = Math.random() * Math.PI * 2;
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({
        size: 0.055,
        map: makeSparkTex("rgba(255,240,180,1)", "rgba(201,168,76,0)"),
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });
      scene.add(new THREE.Points(starGeo, starMat));

      // ── Layer 3: Tiny dense sparkle dust ───────────────────────────
      const DUST_COUNT = 1200;
      const dustPos = new Float32Array(DUST_COUNT * 3);
      const dustSpeeds = new Float32Array(DUST_COUNT);
      for (let i = 0; i < DUST_COUNT; i++) {
        dustPos[i * 3] = (Math.random() - 0.5) * 30;
        dustPos[i * 3 + 1] = (Math.random() - 0.5) * 28;
        dustPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
        dustSpeeds[i] = Math.random() * 0.15 + 0.03;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
      const dustMat = new THREE.PointsMaterial({
        size: 0.022,
        map: makeSparkTex("rgba(201,168,76,1)", "rgba(154,122,48,0)"),
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });
      scene.add(new THREE.Points(dustGeo, dustMat));

      // ── Wireframe diamond octahedra (large, slow-rotating) ─────────
      const DIAMOND_COUNT = 8;
      const diamonds: { mesh: import("three").Mesh; rotSpeed: THREE.Vector3; floatPhase: number }[] = [];
      const dGeo = new THREE.OctahedronGeometry(1, 0);

      for (let i = 0; i < DIAMOND_COUNT; i++) {
        const scale = Math.random() * 0.55 + 0.2;
        const opacity = Math.random() * 0.14 + 0.04;
        const dMat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xc9a84c : 0xe8c96d,
          wireframe: true,
          transparent: true,
          opacity,
        });
        const mesh = new THREE.Mesh(dGeo, dMat);
        mesh.position.set(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 5 - 2
        );
        mesh.scale.setScalar(scale);
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        scene.add(mesh);
        diamonds.push({
          mesh,
          rotSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 0.006,
            (Math.random() - 0.5) * 0.008,
            (Math.random() - 0.5) * 0.004
          ),
          floatPhase: Math.random() * Math.PI * 2,
        });
      }

      // ── Ring torus (elegant rotating ring shape) ────────────────────
      const ringGeo = new THREE.TorusGeometry(2.0, 0.006, 8, 120);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.18 });
      const ring1 = new THREE.Mesh(ringGeo, ringMat);
      ring1.rotation.x = Math.PI / 3;
      ring1.position.set(0, 0, -1);
      scene.add(ring1);

      const ringGeo2 = new THREE.TorusGeometry(3.2, 0.004, 8, 120);
      const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xe8c96d, transparent: true, opacity: 0.09 });
      const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
      ring2.rotation.x = -Math.PI / 4;
      ring2.rotation.z = Math.PI / 6;
      ring2.position.set(0, 0, -2);
      scene.add(ring2);

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
        mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("mousemove", onMouse);

      // ── Animate ────────────────────────────────────────────────────
      const clock = new THREE.Clock();

      const tick = () => {
        animId = requestAnimationFrame(tick);
        const t = clock.getElapsedTime();

        // Smooth mouse lerp
        mouse.x += (mouse.tx - mouse.x) * 0.04;
        mouse.y += (mouse.ty - mouse.y) * 0.04;
        camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.025;
        camera.position.y += (mouse.y * 0.3 - camera.position.y) * 0.025;
        camera.lookAt(0, 0, 0);

        // Drift stars upward with sine wave
        const sp = starGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < STAR_COUNT; i++) {
          let y = sp.getY(i) + starSpeeds[i] * 0.004;
          if (y > 11) y = -11;
          sp.setY(i, y);
          sp.setX(i, sp.getX(i) + Math.sin(t * starSpeeds[i] * 0.5 + starPhases[i]) * 0.0015);
        }
        sp.needsUpdate = true;

        // Drift dust diagonally
        const dp = dustGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < DUST_COUNT; i++) {
          let y = dp.getY(i) + dustSpeeds[i] * 0.003;
          let x = dp.getX(i) + dustSpeeds[i] * 0.001;
          if (y > 14) y = -14;
          if (x > 15) x = -15;
          dp.setY(i, y);
          dp.setX(i, x);
        }
        dp.needsUpdate = true;

        // Pulse orbs opacity
        orbMat.opacity = 0.12 + Math.sin(t * 0.6) * 0.05;

        // Rotate & float diamonds
        diamonds.forEach(({ mesh, rotSpeed, floatPhase }) => {
          mesh.rotation.x += rotSpeed.x;
          mesh.rotation.y += rotSpeed.y;
          mesh.rotation.z += rotSpeed.z;
          mesh.position.y += Math.sin(t * 0.4 + floatPhase) * 0.002;
        });

        // Rotate rings
        ring1.rotation.z = t * 0.08;
        ring1.rotation.y = t * 0.04;
        ring2.rotation.z = -t * 0.05;
        ring2.rotation.x = -Math.PI / 4 + Math.sin(t * 0.3) * 0.1;

        // Pulsing gold light
        goldLight.intensity = 3.5 + Math.sin(t * 1.2) * 1.0;
        goldLight2.intensity = 1.8 + Math.cos(t * 0.8) * 0.6;

        renderer?.render(scene, camera);
      };

      tick();

      cleanupFn = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMouse);
        renderer?.dispose();
        [orbGeo, starGeo, dustGeo, dGeo, ringGeo, ringGeo2].forEach((g) => g.dispose());
        [orbMat, starMat, dustMat, ringMat, ringMat2].forEach((m) => m.dispose());
      };
    };

    init();

    return () => {
      cleanupFn?.();
      cancelAnimationFrame(animId);
    };
  }, []);

  if (!webglSupported) {
    return <CSSFallback />;
  }

  return <canvas ref={canvasRef} id="hero-canvas" />;
}

function CSSFallback() {
  const particles = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 6,
    opacity: Math.random() * 0.7 + 0.15,
  }));

  return (
    <div
      id="hero-canvas"
      style={{
        position: "absolute",
        top: 0, left: 0,
        width: "100%", height: "100%",
        background: "radial-gradient(ellipse at 25% 40%, rgba(201,168,76,0.1) 0%, transparent 55%), radial-gradient(ellipse at 75% 60%, rgba(201,168,76,0.06) 0%, transparent 50%), #0a0a0a",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes floatP {
          0% { transform: translateY(0) translateX(0); opacity: var(--op); }
          50% { transform: translateY(-50px) translateX(20px); opacity: calc(var(--op)*1.5); }
          100% { transform: translateY(-110px) translateX(-10px); opacity: 0; }
        }
        @keyframes orb1 { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(1.12); } }
        @keyframes orb2 { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(0.9); } }
      `}</style>
      <div style={{ position:"absolute", top:"35%", left:"25%", width:500, height:500, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%)",
        transform:"translate(-50%,-50%)", animation:"orb1 9s ease-in-out infinite" }} />
      <div style={{ position:"absolute", top:"65%", right:"20%", width:400, height:400, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(232,201,109,0.06) 0%, transparent 65%)",
        transform:"translate(50%,50%)", animation:"orb2 12s ease-in-out infinite" }} />
      {particles.map((p) => (
        <div key={p.id} style={{
          position:"absolute", left:`${p.left}%`, top:`${p.top}%`,
          width:p.size, height:p.size, borderRadius:"50%",
          background:"#C9A84C",
          boxShadow:`0 0 ${p.size*4}px rgba(201,168,76,0.9)`,
          ["--op" as string]: p.opacity,
          opacity: p.opacity,
          animation:`floatP ${p.duration}s ${p.delay}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}
