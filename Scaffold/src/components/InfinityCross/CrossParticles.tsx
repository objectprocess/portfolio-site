import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

// WIREFRAME OUTLINE (bloom handled by post-processing)
// Note: glow particle mesh + pulse animation were unreachable (glowMeshRef never
// attached). Removed dead allocations only; do not re-enable pulse without
// an explicit visual/feature approval — current scene is static wireframe.

const THICKNESS = 0.28;
const ARM_LENGTH = 2.6;
const DEPTH = 0.18;

const CrossParticles: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);

  // Wireframe outline geometry
  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];

    const hw = THICKNESS / 2;
    const hl = ARM_LENGTH / 2;
    const hd = DEPTH / 2;

    const addEdge = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
      points.push(new THREE.Vector3(x1, y1, z1));
      points.push(new THREE.Vector3(x2, y2, z2));
    };

    // HORIZONTAL ARM
    addEdge(-hl, -hw, hd, hl, -hw, hd);
    addEdge(-hl, hw, hd, hl, hw, hd);
    addEdge(-hl, -hw, hd, -hl, hw, hd);
    addEdge(hl, -hw, hd, hl, hw, hd);
    addEdge(-hl, -hw, -hd, hl, -hw, -hd);
    addEdge(-hl, hw, -hd, hl, hw, -hd);
    addEdge(-hl, -hw, -hd, -hl, hw, -hd);
    addEdge(hl, -hw, -hd, hl, hw, -hd);
    addEdge(-hl, -hw, hd, -hl, -hw, -hd);
    addEdge(-hl, hw, hd, -hl, hw, -hd);
    addEdge(hl, -hw, hd, hl, -hw, -hd);
    addEdge(hl, hw, hd, hl, hw, -hd);

    // VERTICAL ARM
    addEdge(-hw, -hl, hd, hw, -hl, hd);
    addEdge(-hw, hl, hd, hw, hl, hd);
    addEdge(-hw, -hl, hd, -hw, hl, hd);
    addEdge(hw, -hl, hd, hw, hl, hd);
    addEdge(-hw, -hl, -hd, hw, -hl, -hd);
    addEdge(-hw, hl, -hd, hw, hl, -hd);
    addEdge(-hw, -hl, -hd, -hw, hl, -hd);
    addEdge(hw, -hl, -hd, hw, hl, -hd);
    addEdge(-hw, -hl, hd, -hw, -hl, -hd);
    addEdge(-hw, hl, hd, -hw, hl, -hd);
    addEdge(hw, -hl, hd, hw, -hl, -hd);
    addEdge(hw, hl, hd, hw, hl, -hd);

    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <group ref={groupRef}>
      {/* Point lights to make cross glow - 100% more intense */}
      <pointLight position={[0, 0, 0]} color="#ffffff" intensity={5.0} distance={7} />
      <pointLight position={[0, ARM_LENGTH / 4, 0]} color="#ffffff" intensity={3.6} distance={6} />
      <pointLight position={[ARM_LENGTH / 4, 0, 0]} color="#ffffff" intensity={3.6} distance={6} />
      <pointLight position={[-ARM_LENGTH / 4, 0, 0]} color="#ffffff" intensity={3.6} distance={6} />

      {/* Sharp wireframe outline */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          ref={materialRef}
          color="#ffffff"
          linewidth={3}
          toneMapped={false}
          transparent
          opacity={1.0}
        />
      </lineSegments>
    </group>
  );
};

export default CrossParticles;
