'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const Gem = ({ isExploding }: { isExploding: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (meshRef.current && !isExploding) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.z += 0.005;
    }
    if (particlesRef.current && isExploding) {
      particlesRef.current.rotation.y += 0.05;
      particlesRef.current.rotation.x += 0.05;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<positions.length; i+=3) {
        positions[i] *= 1.05;
        positions[i+1] *= 1.05;
        positions[i+2] *= 1.05;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Generate random explosion particles
  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);
  for(let i=0; i<particleCount*3; i++) {
    positions[i] = (Math.random() - 0.5) * 3;
  }

  if (isExploding) {
    return (
       <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              {...({
                attach: "attributes-position",
                count: particleCount,
                array: positions,
                itemSize: 3,
              } as any)}
            />
          </bufferGeometry>
          <pointsMaterial size={0.05} color="#fbbf24" transparent opacity={0.8} />
       </points>
    );
  }

  return (
    <Float speed={4} rotationIntensity={2} floatIntensity={2}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1.5, 0]} />
        <MeshDistortMaterial
          color="#fbbf24"
          speed={3}
          distort={0.4}
          radius={1}
          metalness={1}
          roughness={0.1}
          emissive="#fbbf24"
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
};

export const FloatingGem = ({ isExploding = false }: { isExploding?: boolean }) => {
  return (
    <div className="w-full h-[400px] cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#fbbf24" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#7c3aed" />
        
        <Gem isExploding={isExploding} />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};
