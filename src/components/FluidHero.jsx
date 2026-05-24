import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// Transparent fluid-glass overlay — mouse-reactive animated color waves.
// The background image is handled by CSS in the parent; this layer sits on top.
const FluidHero = () => {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene    = new THREE.Scene();
    const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime:   { value: 0 },
        uMouse:  { value: new THREE.Vector2(0.5, 0.5) },
        uColor1: { value: new THREE.Color('#0b1730') },
        uColor2: { value: new THREE.Color('#5979bb') },
        uColor3: { value: new THREE.Color('#f37124') },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2  uMouse;
        uniform vec3  uColor1;
        uniform vec3  uColor2;
        uniform vec3  uColor3;
        varying vec2  vUv;

        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                              -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute(permute(i.y + vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m; m = m*m;
          vec3 xa = 2.0 * fract(p * C.www) - 1.0;
          vec3 h  = abs(xa) - 0.5;
          vec3 a0 = xa - floor(xa + 0.5);
          vec3 g  = a0 * vec3(x0.x,x12.x,x12.z) + h * vec3(x0.y,x12.y,x12.w);
          return 130.0 * dot(m, g);
        }

        void main() {
          vec2 uv   = vUv;
          float dist = distance(uv, uMouse);

          float n1 = snoise(uv * 2.0 + uTime * 0.12);
          float n2 = snoise(uv * 3.5 - uTime * 0.18 + vec2(5.1, 2.3));
          float n3 = snoise(uv * 5.8 + uTime * 0.09 + vec2(9.4, 7.8));
          float fluid = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
          fluid = fluid * 0.5 + 0.5;

          vec3 col = mix(uColor1, uColor2, smoothstep(0.32, 0.68, fluid));
          col = mix(col, uColor3, smoothstep(0.74, 0.94, fluid) * 0.30);

          float mouseGlow = smoothstep(0.40, 0.0, dist);
          col += uColor2 * mouseGlow * 0.18;

          float edgeFade  = smoothstep(0.75, 0.08, length(uv - 0.5));
          float fluidAlpha = smoothstep(0.28, 0.72, fluid) * 0.38 * edgeFade;
          fluidAlpha += mouseGlow * 0.10;

          gl_FragColor = vec4(col, clamp(fluidAlpha, 0.0, 0.55));
        }
      `,
    });

    scene.add(new THREE.Mesh(geometry, material));

    const onMouseMove = (e) => {
      material.uniforms.uMouse.value.set(
        e.clientX / window.innerWidth,
        1.0 - e.clientY / window.innerHeight
      );
    };
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize',    onResize);

    let frameId;
    const animate = () => {
      material.uniforms.uTime.value += 0.007;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize',    onResize);
      cancelAnimationFrame(frameId);
      const el = renderer.domElement;
      if (el.parentNode === container) container.removeChild(el);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default FluidHero;
