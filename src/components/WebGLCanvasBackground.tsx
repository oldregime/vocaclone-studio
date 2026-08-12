import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface WebGLCanvasBackgroundProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  audioLevel?: number;
}

export const WebGLCanvasBackground: React.FC<WebGLCanvasBackgroundProps> = ({
  isListening = false,
  isSpeaking = false,
  audioLevel = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Cloud (Ambient Energy Spectrum)
    const particleCount = 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color('#06b6d4');
    const indigoColor = new THREE.Color('#818cf8');
    const purpleColor = new THREE.Color('#c084fc');

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

      const mixedColor = i % 3 === 0 ? cyanColor : i % 3 === 1 ? indigoColor : purpleColor;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // 3D Kinetic Voice Orb Core
    const orbGeometry = new THREE.IcosahedronGeometry(1.4, 30);
    const orbMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });

    const voiceOrb = new THREE.Mesh(orbGeometry, orbMaterial);
    scene.add(voiceOrb);

    // Outer Gyroscope Ring
    const gyroGeometry = new THREE.TorusGeometry(2.1, 0.02, 16, 100);
    const gyroMaterial = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const gyroRing = new THREE.Mesh(gyroGeometry, gyroMaterial);
    scene.add(gyroRing);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Ambient rotations
      particles.rotation.y = elapsedTime * 0.04;
      particles.rotation.x = elapsedTime * 0.02;

      gyroRing.rotation.x = elapsedTime * 0.15;
      gyroRing.rotation.y = elapsedTime * 0.2;

      // Voice Orb Reactivity Logic
      if (isListening || isSpeaking) {
        const pulse = Math.sin(elapsedTime * 8) * 0.15 + (audioLevel / 255) * 0.4;
        voiceOrb.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
        voiceOrb.rotation.y = elapsedTime * 0.8;
        orbMaterial.opacity = 0.6;
        orbMaterial.color.setHex(isListening ? 0x06b6d4 : 0xc084fc);
      } else {
        voiceOrb.scale.set(1, 1, 1);
        voiceOrb.rotation.y = elapsedTime * 0.1;
        orbMaterial.opacity = 0.25;
        orbMaterial.color.setHex(0x818cf8);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      particleMaterial.dispose();
      orbGeometry.dispose();
      orbMaterial.dispose();
      gyroGeometry.dispose();
      gyroMaterial.dispose();
      renderer.dispose();
    };
  }, [isListening, isSpeaking, audioLevel]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-70"
    />
  );
};
