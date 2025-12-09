'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, PerspectiveCamera, Sphere, Cone, Preload } from '@react-three/drei';
import React, { useRef } from 'react';
import * as THREE from 'three';

function FloatingMarker({ position, color, delay = 0, scale = 1 }: { position: [number, number, number], color: string, delay?: number, scale?: number }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            // Gentle rotation
            groupRef.current.rotation.y += 0.005;
            // Slight Bobbing independent of Float for more organic feel
            groupRef.current.position.y += Math.sin(state.clock.elapsedTime + delay) * 0.002;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1} floatingRange={[-0.5, 0.5]}>
            <group ref={groupRef} position={position} scale={scale}>
                {/* Pin Head */}
                <Sphere args={[0.6, 32, 32]} position={[0, 0.8, 0]}>
                    <meshStandardMaterial
                        color={color}
                        roughness={0.2}
                        metalness={0.5}
                        emissive={color}
                        emissiveIntensity={0.2}
                    />
                </Sphere>
                {/* Pin Body */}
                <Cone args={[0.25, 1, 32]} position={[0, 0.1, 0]} rotation={[Math.PI, 0, 0]}>
                    <meshStandardMaterial
                        color={color}
                        roughness={0.2}
                        metalness={0.5}
                        emissive={color}
                        emissiveIntensity={0.2}
                    />
                </Cone>
            </group>
        </Float>
    );
}

// Wrapped in React.memo to prevent re-renders on parent state changes
const Scene3D = React.memo(function Scene3D() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <Canvas
                key="scene3d-canvas"
                gl={{
                    alpha: true,
                    antialias: true,
                    // Use default power preference for better stability on varied hardware
                    powerPreference: "default",
                    // Allow context creation even if performance is lower (software renderer fallback if needed)
                    failIfMajorPerformanceCaveat: false
                }}
                onCreated={({ gl }) => {
                    const handleContextLost = (event: Event) => {
                        event.preventDefault();
                        console.warn('WebGL Context Lost - Attempting to restore');
                    };
                    const handleContextRestored = () => {
                        console.log('WebGL Context Restored');
                        // Force a redraw or state update if needed, but R3F usually handles this.
                    };

                    gl.domElement.addEventListener('webglcontextlost', handleContextLost, false);
                    gl.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);
                }}
                dpr={[1, 1]}
                camera={{ position: [0, 0, 25], fov: 50 }}
            >
                <PerspectiveCamera makeDefault position={[0, 0, 25]} fov={50} near={0.1} far={100} />
                <Environment preset="city" />
                <ambientLight intensity={0.7} />
                <pointLight position={[20, 20, 20]} intensity={1.5} />
                <pointLight position={[-20, -20, -10]} intensity={1} color="#F97316" />

                <React.Suspense fallback={null}>
                    {/* Abstract Map Markers distributed widely across the ENTIRE background - "Larger Box" */}

                    {/* Top/Left Quadrant - Far */}
                    <FloatingMarker position={[-20, 12, -15]} color="#F97316" delay={0} scale={1.8} />
                    <FloatingMarker position={[-28, 5, -25]} color="#FB923C" delay={1} scale={1.2} />

                    {/* Bottom/Left Quadrant - Close & Far */}
                    <FloatingMarker position={[-15, -10, -5]} color="#FDBA74" delay={2} scale={1.0} />
                    <FloatingMarker position={[-25, -18, -20]} color="#EA580C" delay={2.5} scale={1.5} />

                    {/* Top/Right Quadrant - Far */}
                    <FloatingMarker position={[18, 14, -10]} color="#EA580C" delay={3} scale={1.6} />
                    <FloatingMarker position={[26, 2, -18]} color="#F97316" delay={4} scale={1.3} />

                    {/* Bottom/Right Quadrant - Close */}
                    <FloatingMarker position={[12, -12, -8]} color="#FED7AA" delay={5} scale={1.1} />
                    <FloatingMarker position={[22, -20, -12]} color="#FB923C" delay={6} scale={1.4} />

                    {/* Center/Distant - Filling gaps */}
                    <FloatingMarker position={[0, 16, -25]} color="#FB923C" delay={7} scale={1.5} />
                    <FloatingMarker position={[0, -18, -30]} color="#EA580C" delay={7.5} scale={2.0} />
                    <FloatingMarker position={[-8, 0, -15]} color="#FED7AA" delay={1.5} scale={0.8} />
                    <FloatingMarker position={[8, -5, -20]} color="#F97316" delay={4.5} scale={0.9} />

                    {/* Removed Preload all to prevent resource spike causing Context Loss */}
                </React.Suspense>
            </Canvas>
        </div>
    );
});

export default Scene3D;
