"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ThreeObject {
  componentId: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
}

interface ThreePreviewProps {
  objects: ThreeObject[];
}

const SCALE = 0.01;

export default function ThreePreview({ objects }: ThreePreviewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const animIdRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a0a0b");
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(5, 10, 5);
    scene.add(directional);

    // Grid helper
    const grid = new THREE.GridHelper(10, 20, 0x27272a, 0x1c1c1e);
    scene.add(grid);

    // Group for design objects
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);
    meshGroupRef.current = meshGroup;

    // Animation loop
    const animate = () => {
      animIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync objects to 3D
  useEffect(() => {
    const group = meshGroupRef.current;
    if (!group) return;

    // Clear previous meshes
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) child.material.dispose();
      }
    }

    // Canvas center (approximate)
    const canvasCenterX = 500;
    const canvasCenterY = 400;

    objects.forEach((obj) => {
      const w = obj.width * SCALE;
      const h = obj.height * SCALE;
      const depth = Math.max(w, h) * 0.1;

      const geometry = new THREE.BoxGeometry(w, h, depth);
      const color = new THREE.Color(obj.fill);
      const material = new THREE.MeshStandardMaterial({
        color,
        transparent: obj.opacity < 1,
        opacity: obj.opacity,
        metalness: 0.4,
        roughness: 0.5,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = (obj.x - canvasCenterX) * SCALE;
      mesh.position.y = (canvasCenterY - obj.y) * SCALE;
      mesh.position.z = 0;

      group.add(mesh);
    });
  }, [objects]);

  return (
    <div ref={mountRef} className="w-full h-full min-h-[400px]" />
  );
}
