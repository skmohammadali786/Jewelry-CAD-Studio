import { useEffect, useRef, useState } from "react";

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    // Test WebGL support first
    const testCanvas = document.createElement("canvas");
    const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
    if (!gl) {
      setWebglSupported(false);
      return;
    }

    // Lazy import Three.js only if WebGL is available
    let animId: number;
    let renderer: import("three").WebGLRenderer | null = null;

    const initThree = async () => {
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

      const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.z = 5;
      const scene = new THREE.Scene();

      const particleCount = 900;
      const positions = new Float32Array(particleCount * 3);
      const speeds = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        speeds[i] = Math.random() * 0.3 + 0.1;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const canvas2d = document.createElement("canvas");
      canvas2d.width = 32;
      canvas2d.height = 32;
      const ctx = canvas2d.getContext("2d")!;
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "rgba(201, 168, 76, 1)");
      gradient.addColorStop(0.4, "rgba(201, 168, 76, 0.7)");
      gradient.addColorStop(1, "rgba(201, 168, 76, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
      const sparkTex = new THREE.CanvasTexture(canvas2d);

      const mat = new THREE.PointsMaterial({
        color: 0xc9a84c,
        size: 0.08,
        map: sparkTex,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(geo, mat);
      scene.add(points);

      const diamondGeo = new THREE.OctahedronGeometry(0.4, 0);
      const diamonds: import("three").Mesh[] = [];
      for (let i = 0; i < 5; i++) {
        const dMat = new THREE.MeshBasicMaterial({ color: 0xc9a84c, wireframe: true, transparent: true, opacity: 0.1 });
        const d = new THREE.Mesh(diamondGeo, dMat);
        d.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 3 - 2);
        d.scale.setScalar(Math.random() * 0.8 + 0.4);
        scene.add(d);
        diamonds.push(d);
      }

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

      let mouse = { x: 0, y: 0 };
      const onMouseMove = (e: MouseEvent) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("mousemove", onMouseMove);

      const clock = new THREE.Clock();
      const animate = () => {
        animId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        const pos = geo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          const y = pos.getY(i);
          pos.setY(i, y + speeds[i] * 0.003 > 10 ? -10 : y + speeds[i] * 0.003);
          pos.setX(i, pos.getX(i) + Math.sin(t * speeds[i] * 0.3 + i) * 0.002);
        }
        pos.needsUpdate = true;

        diamonds.forEach((d, i) => {
          d.rotation.x = t * 0.15 * (i % 2 === 0 ? 1 : -1);
          d.rotation.y = t * 0.12 * (i % 3 === 0 ? 1 : -1);
        });

        camera.position.x += (mouse.x * 0.4 - camera.position.x) * 0.02;
        camera.position.y += (mouse.y * 0.2 - camera.position.y) * 0.02;

        renderer?.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMouseMove);
        renderer?.dispose();
        geo.dispose();
        mat.dispose();
      };
    };

    let cleanup: (() => void) | undefined;
    initThree().then((fn) => { cleanup = fn; });

    return () => {
      cancelAnimationFrame(animId);
      cleanup?.();
    };
  }, []);

  if (!webglSupported) {
    return <CSSParticlesFallback />;
  }

  return <canvas ref={canvasRef} id="hero-canvas" />;
}

function CSSParticlesFallback() {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 4,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.6 + 0.1,
  }));

  return (
    <div
      id="hero-canvas"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(201,168,76,0.05) 0%, transparent 50%), #0a0a0a",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes floatParticle {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: var(--op); }
          33% { transform: translateY(-30px) translateX(15px) scale(1.2); opacity: calc(var(--op) * 1.5); }
          66% { transform: translateY(-60px) translateX(-10px) scale(0.8); opacity: calc(var(--op) * 0.5); }
          100% { transform: translateY(-100px) translateX(5px) scale(1); opacity: 0; }
        }
        @keyframes heroGradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      {/* Gold gradient orbs */}
      <div style={{
        position: "absolute",
        top: "20%",
        left: "15%",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
        animation: "heroGradientShift 8s ease infinite",
        backgroundSize: "200% 200%",
      }} />
      <div style={{
        position: "absolute",
        bottom: "10%",
        right: "10%",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)",
      }} />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            background: "#C9A84C",
            boxShadow: `0 0 ${p.size * 3}px rgba(201,168,76,0.8)`,
            ["--op" as string]: p.opacity,
            opacity: p.opacity,
            animation: `floatParticle ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}
