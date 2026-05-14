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

interface ModelProps {
  modelPath: string;
  autoPlay?: boolean;
}

function Model({ modelPath, autoPlay = true }: ModelProps) {
  // Load the GLB file from Cloudinary URL or local path
  const { scene, animations } = useGLTF(modelPath);
  const { actions, names } = useAnimations(animations, scene);

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

export function Design3DViewer({ modelUrl }: { modelUrl: string }) {
  if (!modelUrl) return null;

  return (
    <div className="w-full h-full bg-zinc-950/20 overflow-hidden relative group">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 45 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5} contactShadow={true} shadowBias={-0.001} adjustCamera={true}>
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
      
      <div className="absolute top-2.5 right-2.5 bg-sky-500/30 backdrop-blur-md border border-sky-500/40 text-sky-100 text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-widest pointer-events-none transition-all duration-300 group-hover:bg-sky-500/50 group-hover:shadow-[0_0_15px_rgba(14,165,233,0.4)] group-hover:border-sky-400/50 group-hover:scale-105 z-20">
        Interactive 3D
      </div>
    </div>
  );
}
