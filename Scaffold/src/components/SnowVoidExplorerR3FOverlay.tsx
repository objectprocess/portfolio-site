import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import CrossParticles from './InfinityCross/CrossParticles';
import SnowParticles from './InfinityCross/SnowParticles';

type Props = {
  open: boolean;
  onClose: () => void;
};

const SnowVoidExplorerR3FOverlay: React.FC<Props> = ({ open, onClose }) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown, { capture: true });
    queueMicrotask(() => overlayRef.current?.focus());
    return () => document.removeEventListener('keydown', onKeyDown, { capture: true } as any);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !controlsRef.current) return;
    const controls = controlsRef.current;
    const groundY = -0.35;
    
    const handleChange = () => {
      // Clamp target Y to not go below ground
      if (controls.target.y < groundY) {
        controls.target.y = groundY;
      }
    };
    
    controls.addEventListener('change', handleChange);
    return () => controls.removeEventListener('change', handleChange);
  }, [open]);

  if (!open) return null;

  const groundY = -0.35;
  const crossArm = 2.6; // keep in sync with InfinityCross/CrossParticles.tsx ARM_LENGTH
  const crossCenterY = groundY + crossArm / 2;

  // 2hollis - Flash; audio autoplays from hidden iframe when overlay opens
  const FLASH_EMBED = 'https://www.youtube.com/embed/CjnFzPhM72I?autoplay=1';
  const FLASH_LINK = 'https://www.youtube.com/watch?v=CjnFzPhM72I';

  return (
    <div ref={overlayRef} className="snow-void-overlay" tabIndex={-1} role="dialog" aria-modal="true">
      {/* Hidden iframe so audio autoplays without showing video */}
      <iframe
        className="snow-void-audio-iframe"
        src={FLASH_EMBED}
        title="2hollis – Flash"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      <a
        href={FLASH_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="snow-void-audio-icon"
        aria-label="2hollis – Flash (opens in new tab)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </a>
      <Canvas camera={{ position: [0, crossCenterY + 0.6, 4.2], fov: 92 }}>
        <color attach="background" args={['#0a0a0c']} />
        {/* White snowy fog to create infinite horizon */}
        <fog attach="fog" args={['#d0d0d0', 8, 50]} />
        
        {/* Ambient light so snow particles and ground are visible - pure white */}
        <ambientLight color="#ffffff" intensity={0.5} />

        {/* Infinite ground plane - subtly glowing white snow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, groundY, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial 
            color="#f0f0f0" 
            emissive="#ffffff"
            emissiveIntensity={0.15}
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>

        <SnowParticles />
        {/* Lift the cross so its bottom starts at the ground plane */}
        <group position={[0, crossCenterY, 0]}>
          <CrossParticles />
        </group>

        <OrbitControls
          ref={controlsRef}
          enableZoom={false}
          enablePan={true}
          enableRotate
          autoRotate
          autoRotateSpeed={2.5}
          // Polar angle limits: 0 = top view, π/2 = horizontal, π = bottom view
          // Allow from slightly above (0.1 rad) down to ~14° below horizontal
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2 + 0.245}
          rotateSpeed={0.45}
          panSpeed={0.5}
          dampingFactor={0.08}
          enableDamping
          target={[0, crossCenterY, 0]}
        />
        
        {/* Bloom post-processing - snowy white glow */}
        <EffectComposer>
          <Bloom 
            intensity={4.5}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.4}
            mipmapBlur
            blendFunction={BlendFunction.SCREEN}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default SnowVoidExplorerR3FOverlay;

