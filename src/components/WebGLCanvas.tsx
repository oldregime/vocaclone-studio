import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface WebGLCanvasProps {
  mode: 'idle' | 'listening' | 'processing' | 'speaking';
}

export const WebGLCanvas: React.FC<WebGLCanvasProps> = ({ mode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create 3D Icosahedron Sphere for Voice Orb
    const geometry = new THREE.IcosahedronGeometry(1.8, 32);

    // Custom GLSL Shader Material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0.3 },
        uColorA: { value: new THREE.Color('#06b6d4') }, // Electric Cyan
        uColorB: { value: new THREE.Color('#818cf8') }, // Cyber Indigo
        uColorC: { value: new THREE.Color('#c084fc') }, // Neon Violet
        uMode: { value: 0 } // 0: idle, 1: listening, 2: processing, 3: speaking
      },
      vertexShader: `
        uniform float uTime;
        uniform float uIntensity;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying float vDisplacement;

        // Simplex 3D Noise generator function
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod(i, 289.0);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vUv = uv;
          vNormal = normal;
          float noise = snoise(position * 1.5 + vec3(uTime * 0.4));
          vDisplacement = noise * uIntensity;
          vec3 newPosition = position + normal * vDisplacement;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorC;
        varying vec3 vNormal;
        varying float vDisplacement;

        void main() {
          float mixVal = (vDisplacement + 0.3) * 1.5;
          vec3 color = mix(uColorA, uColorB, mixVal);
          color = mix(color, uColorC, sin(uTime * 0.5) * 0.5 + 0.5);
          float fresnel = pow(1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.5);
          gl_FragColor = vec4(color + vec3(fresnel * 0.4), 0.75 + fresnel * 0.25);
        }
      `,
      wireframe: true,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Particle Stars Field
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 400;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 18;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x818cf8,
      transparent: true,
      opacity: 0.6
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsedTime;

      // React to mode changes
      const currentMode = modeRef.current;
      if (currentMode === 'listening') {
        material.uniforms.uIntensity.value = THREE.MathUtils.lerp(material.uniforms.uIntensity.value, 0.65, 0.1);
        mesh.rotation.y = elapsedTime * 0.8;
      } else if (currentMode === 'speaking') {
        material.uniforms.uIntensity.value = THREE.MathUtils.lerp(material.uniforms.uIntensity.value, 0.45, 0.1);
        mesh.rotation.y = elapsedTime * 1.2;
      } else if (currentMode === 'processing') {
        material.uniforms.uIntensity.value = THREE.MathUtils.lerp(material.uniforms.uIntensity.value, 0.15, 0.1);
        mesh.rotation.y = elapsedTime * 2.0;
      } else {
        material.uniforms.uIntensity.value = THREE.MathUtils.lerp(material.uniforms.uIntensity.value, 0.25, 0.05);
        mesh.rotation.y = elapsedTime * 0.3;
      }

      particlesMesh.rotation.y = elapsedTime * 0.05;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80 transition-opacity duration-1000"
    />
  );
};
