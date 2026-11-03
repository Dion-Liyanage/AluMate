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
const BAR_THICKNESS = 0.1;
const BAR_DEPTH = 0.06;

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
    scene.background = new THREE.Color("#f5f5f4");
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.set(0, 1.0, 2.8);
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
    const ambient = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xfffbeb, 1.15);
    directional.position.set(6, 10, 8);
    scene.add(directional);
    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.7);
    fillLight.position.set(-6, 6, 4);
    scene.add(fillLight);

    // Grid helper
    const grid = new THREE.GridHelper(10, 20, 0xcbd5e1, 0xe7e5e4);
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

    // Helper for recursive mesh and material disposal
    const disposeNode = (node: THREE.Object3D) => {
      if (node instanceof THREE.Mesh) {
        node.geometry?.dispose();
        if (node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach((mat) => mat.dispose());
          } else {
            node.material.dispose();
          }
        }
      }
      node.children.forEach(disposeNode);
    };

    // Clear previous meshes
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      disposeNode(child);
    }

    // Calculate bounding box of all objects to find the true center of the product structure
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    objects.forEach((obj) => {
      if (obj.x < minX) minX = obj.x;
      if (obj.x + obj.width > maxX) maxX = obj.x + obj.width;
      if (obj.y < minY) minY = obj.y;
      if (obj.y + obj.height > maxY) maxY = obj.y + obj.height;
    });

    const modelCenterX = objects.length > 0 ? (minX + maxX) / 2 : 500;
    const modelCenterY = objects.length > 0 ? (minY + maxY) / 2 : 400;

    objects.forEach((obj) => {
      const w = obj.width * SCALE;
      const h = obj.height * SCALE;

      // Position the 3D mesh center relative to the structure's overall center, sitting flush on the floor grid (y = 0)
      const x = (obj.x + obj.width / 2 - modelCenterX) * SCALE;
      const y = (maxY - (obj.y + obj.height / 2)) * SCALE;

      let mesh: THREE.Object3D;

      if (obj.componentId === "frame") {
        // Hollow frame: 4 bars
        const frameGroup = new THREE.Group();
        const frameColor = obj.fill === "transparent" ? "#a3a3a3" : obj.fill;
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(frameColor),
          metalness: 0.7,
          roughness: 0.2,
        });

        // Top bar
        const topGeom = new THREE.BoxGeometry(w, BAR_THICKNESS, BAR_DEPTH);
        const topBar = new THREE.Mesh(topGeom, material);
        topBar.position.set(0, h / 2 - BAR_THICKNESS / 2, 0);
        frameGroup.add(topBar);

        // Bottom bar
        const bottomGeom = new THREE.BoxGeometry(w, BAR_THICKNESS, BAR_DEPTH);
        const bottomBar = new THREE.Mesh(bottomGeom, material);
        bottomBar.position.set(0, -h / 2 + BAR_THICKNESS / 2, 0);
        frameGroup.add(bottomBar);

        // Left bar
        const sideH = h - 2 * BAR_THICKNESS;
        const leftGeom = new THREE.BoxGeometry(BAR_THICKNESS, sideH, BAR_DEPTH);
        const leftBar = new THREE.Mesh(leftGeom, material);
        leftBar.position.set(-w / 2 + BAR_THICKNESS / 2, 0, 0);
        frameGroup.add(leftBar);

        // Right bar
        const rightGeom = new THREE.BoxGeometry(BAR_THICKNESS, sideH, BAR_DEPTH);
        const rightBar = new THREE.Mesh(rightGeom, material);
        rightBar.position.set(w / 2 - BAR_THICKNESS / 2, 0, 0);
        frameGroup.add(rightBar);

        mesh = frameGroup;
      } else if (obj.componentId === "glass-panel") {
        const geometry = new THREE.BoxGeometry(w, h, 0.015);
        const material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color("#bfdbfe"),
          transparent: true,
          opacity: 0.4,
          roughness: 0.1,
          metalness: 0.1,
          transmission: 0.9,
          ior: 1.5,
        });
        mesh = new THREE.Mesh(geometry, material);
      } else if (obj.componentId === "board-panel") {
        const geometry = new THREE.BoxGeometry(w, h, 0.025);
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(obj.fill),
          roughness: 0.6,
          metalness: 0.1,
        });
        mesh = new THREE.Mesh(geometry, material);
      } else if (obj.componentId === "cube") {
        const size = Math.max(w, h);
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(obj.fill),
          roughness: 0.45,
          metalness: 0.15,
        });
        mesh = new THREE.Mesh(geometry, material);
      } else if (
        obj.componentId === "aluminium-bar" ||
        obj.componentId === "horizontal-bar" ||
        obj.componentId === "vertical-bar" ||
        obj.componentId === "bar"
      ) {
        const geometry = new THREE.BoxGeometry(w, BAR_THICKNESS, BAR_DEPTH);
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(obj.fill),
          metalness: 0.8,
          roughness: 0.2,
        });
        mesh = new THREE.Mesh(geometry, material);
      } else if (obj.componentId === "handle") {
        // U-shaped door handle
        const handleGroup = new THREE.Group();
        const metalMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#71717a"),
          metalness: 0.95,
          roughness: 0.1,
        });

        const postRadius = 0.008;
        const postLength = 0.04;
        const gripRadius = 0.01;

        // Top post
        const topPostGeom = new THREE.CylinderGeometry(postRadius, postRadius, postLength);
        topPostGeom.rotateX(Math.PI / 2); // align to Z
        const topPost = new THREE.Mesh(topPostGeom, metalMaterial);
        topPost.position.set(0, h / 2 - 0.05, postLength / 2);
        handleGroup.add(topPost);

        // Bottom post
        const bottomPostGeom = new THREE.CylinderGeometry(postRadius, postRadius, postLength);
        bottomPostGeom.rotateX(Math.PI / 2);
        const bottomPost = new THREE.Mesh(bottomPostGeom, metalMaterial);
        bottomPost.position.set(0, -h / 2 + 0.05, postLength / 2);
        handleGroup.add(bottomPost);

        // Grip bar
        const gripGeom = new THREE.CylinderGeometry(gripRadius, gripRadius, Math.max(0.01, h - 0.1));
        const grip = new THREE.Mesh(gripGeom, metalMaterial);
        grip.position.set(0, 0, postLength);
        handleGroup.add(grip);

        mesh = handleGroup;
      } else if (obj.componentId === "lock") {
        // Metal lock assembly
        const lockGroup = new THREE.Group();
        const bodyMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#27272a"),
          metalness: 0.8,
          roughness: 0.3,
        });
        const leverMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#d4d4d8"),
          metalness: 0.9,
          roughness: 0.1,
        });

        // Lock body box
        const bodyGeom = new THREE.BoxGeometry(0.04, 0.08, 0.02);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.set(0, 0, 0.01);
        lockGroup.add(body);

        // Lever handle
        const leverGeom = new THREE.CylinderGeometry(0.006, 0.006, 0.06);
        leverGeom.rotateZ(Math.PI / 2); // horizontal
        const lever = new THREE.Mesh(leverGeom, leverMat);
        lever.position.set(0.02, 0.01, 0.025);
        lockGroup.add(lever);

        mesh = lockGroup;
      } else if (obj.componentId === "hinge") {
        const hingeGroup = new THREE.Group();
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#71717a"),
          metalness: 0.85,
          roughness: 0.25,
        });
        const geom = new THREE.CylinderGeometry(0.01, 0.01, h);
        const barrel = new THREE.Mesh(geom, material);
        barrel.position.set(0, 0, 0);
        hingeGroup.add(barrel);
        mesh = hingeGroup;
      } else if (obj.componentId === "label-text") {
        return;
      } else {
        // Fallback standard box
        const depth = Math.max(w, h) * 0.1;
        const geometry = new THREE.BoxGeometry(w, h, depth);
        const color = new THREE.Color(obj.fill);
        const material = new THREE.MeshStandardMaterial({
          color,
          transparent: obj.opacity < 1,
          opacity: obj.opacity,
          metalness: 0.28,
          roughness: 0.38,
        });
        mesh = new THREE.Mesh(geometry, material);
      }

      mesh.position.x = x;
      mesh.position.y = y;

      if (obj.componentId !== "label-text") {
        if (obj.componentId === "handle" || obj.componentId === "lock") {
          mesh.position.z = 0.025; // Float in front of panels
        } else if (obj.componentId === "frame") {
          mesh.position.z = -0.01; // Slightly behind panels
        } else {
          mesh.position.z = 0;
        }
      }

      group.add(mesh);
    });

    // Dynamically update camera position and OrbitControls target to frame the model nicely
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (camera && controls) {
      const modelHeight = objects.length > 0 ? (maxY - minY) * SCALE : 0;
      const targetY = modelHeight / 2;
      const distance = Math.max(3.5, modelHeight * 1.8);

      camera.position.set(0, targetY + 0.1, distance);
      controls.target.set(0, targetY, 0);
      controls.update();
    }
  }, [objects]);

  return <div ref={mountRef} className="h-full min-h-[400px] w-full bg-stone-100" />;
}
