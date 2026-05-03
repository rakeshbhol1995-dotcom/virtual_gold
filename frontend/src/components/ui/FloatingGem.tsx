'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const GoldCoin = ({ isExploding }: { isExploding: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current && !isExploding) {
      meshRef.current.rotation.y = time * 0.8;
      meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
      meshRef.current.position.y = Math.sin(time) * 0.1;
    }
    if (particlesRef.current && isExploding) {
      particlesRef.current.rotation.y += 0.05;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<positions.length; i+=3) {
        positions[i] *= 1.05;
        positions[i+1] *= 1.05;
        positions[i+2] *= 1.05;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const particleCount = 500;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount*3; i++) {
        pos[i] = (Math.random() - 0.5) * 2;
    }
    return pos;
  }, []);

  if (isExploding) {
    return (
       <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.05} color="#FFD700" transparent opacity={0.8} />
       </points>
    );
  }

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group>
        <mesh ref={meshRef}>
            <cylinderGeometry args={[1.6, 1.6, 0.25, 48]} />
            <meshStandardMaterial
                color="#FFD700"
                metalness={0.9}
                roughness={0.1}
            />
            {/* Inner Design G */}
            <mesh position={[0, 0, 0.13]}>
                <octahedronGeometry args={[0.7, 0]} />
                <meshStandardMaterial color="#FFFFFF" metalness={1} roughness={0} emissive="#FFFFFF" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, 0, -0.13]}>
                <octahedronGeometry args={[0.7, 0]} />
                <meshStandardMaterial color="#FFFFFF" metalness={1} roughness={0} emissive="#FFFFFF" emissiveIntensity={0.3} />
            </mesh>
        </mesh>
      </group>
    </Float>
  );
};

export const FloatingGem = ({ isExploding = false }: { isExploding?: boolean }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return <div className="w-full h-[400px] bg-gold/5 animate-pulse rounded-[3rem]" />;

  return (
    <div className="w-full h-[400px] cursor-grab active:cursor-grabbing relative">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFD700" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#B8860B" />
        <spotLight position={[0, 5, 5]} angle={0.3} penumbra={1} intensity={2} castShadow />
        
        <GoldCoin isExploding={isExploding} />
      </Canvas>
    </div>
  );
};
