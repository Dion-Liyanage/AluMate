"use client";

import React, { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { 
  useGLTF, 
  useAnimations, 
  OrbitControls, 
  Stage,
  Center
} from "@react-three/drei";
import { Box, Loader2 } from "lucide-react";

interface ModelProps {
  modelPath: string;
  autoPlay?: boolean;
}

// This component uses useGLTF which is a Suspense-based hook.
// It will throw a Promise while loading (caught by <Suspense>),
// and throw an Error on failure (caught by <ModelErrorBoundary>).
// Do NOT wrap useGLTF in try/catch — that catches the Suspense Promise
// and breaks loading on first visit.
function Model({ modelPath, autoPlay = true }: ModelProps) {
  const gltf = useGLTF(modelPath);
  const { scene, animations } = gltf;
  const { actions, names } = useAnimations(animations || [], scene);

  useEffect(() => {
    if (autoPlay && names.length > 0) {
      // Play the first animation found in the Blender file
      const action = actions[names[0]];
      if (action) {
        action.reset().fadeIn(0.5).play();
      }
    }
  }, [actions, names, autoPlay]);

  return <primitive object={scene} castShadow receiveShadow />;
}

function ModelFallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 text-zinc-400">
      <Box className="w-10 h-10 mb-3 opacity-40" />
      <p className="text-xs font-medium opacity-60">3D preview unavailable</p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 text-zinc-400">
      <Loader2 className="w-8 h-8 mb-3 opacity-40 animate-spin" />
      <p className="text-xs font-medium opacity-60">Loading 3D model…</p>
    </div>
  );
}

// Error boundary catches real errors from useGLTF (e.g. 404, corrupt file).
// It does NOT catch the Suspense Promise throws — those are handled by <Suspense>.
class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function Design3DViewer({ modelUrl }: { modelUrl: string }) {
  // Basic URL validation before attempting to render the 3D canvas
  if (!modelUrl) {
    return <ModelFallback />;
  }

  return (
    <div className="w-full h-full bg-zinc-950/20 overflow-hidden relative group">
      <ModelErrorBoundary fallback={<ModelFallback />}>
        <Suspense fallback={<LoadingSpinner />}>
          <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 45 }}>
            <Suspense fallback={null}>
              <Stage environment="city" intensity={0.5} shadows={{ type: "contact", bias: -0.001 }} adjustCamera={true}>
                <Center>
                  <Model modelPath={modelUrl} />
                </Center>
              </Stage>
              <OrbitControls 
                enableZoom={false} 
                autoRotate 
                autoRotateSpeed={1.5} 
                makeDefault 
              />
            </Suspense>
          </Canvas>
        </Suspense>
      </ModelErrorBoundary>
      
      <div className="absolute top-2.5 right-2.5 bg-sky-500/30 backdrop-blur-md border border-sky-500/40 text-sky-100 text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-widest pointer-events-none transition-all duration-300 group-hover:bg-sky-500/50 group-hover:shadow-[0_0_15px_rgba(14,165,233,0.4)] group-hover:border-sky-400/50 group-hover:scale-105 z-20">
        Interactive 3D
      </div>
    </div>
  );
}
