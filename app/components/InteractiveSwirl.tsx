"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

THREE.Cache.enabled = false;

export default function InteractiveSwirl({ imageSrc }: { imageSrc: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const uniforms = {
      uTexture: { value: null as THREE.Texture | null },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0 },
      uStrength: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(container.clientWidth, container.clientHeight),
      },
      uImageAspect: { value: 1 },
    };

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(imageSrc, (loadedTexture) => {
      const imgAspect =
        loadedTexture.image.width / loadedTexture.image.height;
      uniforms.uImageAspect.value = imgAspect;
    });
    texture.minFilter = THREE.LinearFilter;
    uniforms.uTexture.value = texture;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform vec2 uMouse;
        uniform float uTime;
        uniform float uStrength;
        uniform vec2 uResolution;
        uniform float uImageAspect;
        varying vec2 vUv;

        vec2 coverUv(vec2 uv, float imageAspect, float screenAspect) {
          vec2 ratio = vec2(
            min(screenAspect / imageAspect, 1.0),
            min(imageAspect / screenAspect, 1.0)
          );
          return vec2(
            (uv.x - 0.5) * ratio.x + 0.5,
            (uv.y - 0.5) * ratio.y + 0.5
          );
        }

        void main() {
          float screenAspect = uResolution.x / uResolution.y;
          vec2 uv = coverUv(vUv, uImageAspect, screenAspect);

          // fade ambient motion toward the edges so borders stay stable
          vec2 centered = vUv - 0.5;
          float edgeFalloff = 1.0 - smoothstep(0.35, 0.5, length(centered));

          float ambientX = sin(vUv.y * 8.0 + uTime * 0.8) * 0.01 * edgeFalloff;
          float ambientY = cos(vUv.x * 8.0 + uTime * 0.6) * 0.01 * edgeFalloff;
          uv += vec2(ambientX, ambientY);

          vec2 toMouse = uv - uMouse;
          float dist = length(toMouse);

          float falloff = smoothstep(0.2, 0.0, dist);
          float wave = sin(dist * 40.0 - uTime * 4.0) * 0.03;

          vec2 distortedUv = uv + normalize(toMouse) * wave * falloff * uStrength;

          gl_FragColor = texture2D(uTexture, distortedUv);
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let targetStrength = 0;

    function handleMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      uniforms.uMouse.value.set(x, y);
      targetStrength = 1;
    }

    function handleMouseLeave() {
      targetStrength = 0;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const clock = new THREE.Clock();

    function animate() {
      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uStrength.value +=
        (targetStrength - uniforms.uStrength.value) * 0.05;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    function handleResize() {
      if (!container) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      uniforms.uResolution.value.set(
        container.clientWidth,
        container.clientHeight
      );
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      texture.dispose();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [imageSrc]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}