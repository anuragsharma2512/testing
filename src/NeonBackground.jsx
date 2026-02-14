"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function NeonBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030014, 0.02);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );

    camera.position.set(0, 2.2, 6);

    // Lights
    const hemi = new THREE.HemisphereLight(0x202038, 0x001020, 0.6);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.5);
    dir.position.set(5, 10, 5);
    scene.add(dir);

    // Particles
    const particleCount = 1400;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const pMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.04,
      transparent: true,
      opacity: 0.9
    });

    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const neonLight = new THREE.PointLight(0xff00ff, 1.8, 40);
    neonLight.position.set(0, 4, 6);
    scene.add(neonLight);

    // Mouse camera movement
    let mouseTarget = { x: 0, y: 2.1 };

    window.addEventListener("mousemove", (e) => {
      mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 1.2;
      mouseTarget.y =
        (0.5 - e.clientY / window.innerHeight) * 0.8 + 1.8;
    });

    // Animation
    let animationId;

    function animate() {
      animationId = requestAnimationFrame(animate);

      const posArr = pGeo.attributes.position.array;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3 + 2;
        posArr[idx] +=
          0.0006 * (1 + Math.sin(performance.now() * 0.0001 + i));

        if (posArr[idx] > 40) posArr[idx] = -40;
      }

      pGeo.attributes.position.needsUpdate = true;

      camera.position.x +=
        (mouseTarget.x - camera.position.x) * 0.03;

      camera.position.y +=
        (mouseTarget.y - camera.position.y) * 0.03;

      camera.lookAt(0, 1.4, 0);

      renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);

      camera.aspect =
        window.innerWidth / window.innerHeight;

      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    // CLEANUP (VERY IMPORTANT)
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      pGeo.dispose();
      pMat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        display: "block"
      }}
    />
  );
}
