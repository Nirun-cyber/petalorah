import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// 3D Image Plane rendering the photorealistic transparent cutout
interface RosePlaneProps {
  hovered: boolean;
  mouse: { x: number; y: number };
}

const RosePlane: React.FC<RosePlaneProps> = ({ hovered, mouse }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load the processed photorealistic cutout texture
  const texture = useTexture('/assets/rose_real.png');

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    // Base slow rotation oscillation (left and right sway instead of continuous 360 rotation to suit the card style)
    const baseRotationY = Math.sin(time * 0.4) * 0.25;

    // Mouse tilt parallax targets
    const targetYRotation = baseRotationY + mouse.x * 0.5;
    const targetXRotation = -mouse.y * 0.4;
    const targetZRotation = Math.sin(time * 0.8) * 0.06 + mouse.x * 0.15; // hanging sway

    // LERP rotations
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetYRotation,
      0.08
    );
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetXRotation,
      0.08
    );
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      targetZRotation,
      0.08
    );

    // Floating animation
    const floatOffset = Math.sin(time * 1.5) * 0.15;
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      floatOffset - 0.1,
      0.05
    );

    // Hover scale bounce
    const targetScale = hovered ? 1.15 : 1.0;
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1)
    );
  });

  return (
    <mesh ref={meshRef}>
      {/* 2D Plane representing the card cutout */}
      <planeGeometry args={[2.8, 2.8]} />
      {/* React to lighting while maintaining transparency */}
      <meshStandardMaterial
        map={texture}
        transparent={true}
        side={THREE.DoubleSide}
        roughness={0.8}
        metalness={0.2}
        alphaTest={0.02} // ensures correct transparency sorting
        depthWrite={true}
      />
    </mesh>
  );
};

// Canvas wrapper
export const ThreeFlower: React.FC = () => {
  const [hovered, setHovered] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse to range [-1, 1]
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Setup intersection observer to pause rendering when scrolled out of view
    let observer: IntersectionObserver;
    if (containerRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting);
        },
        { threshold: 0.05 }
      );
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Dynamic Red Glow Background behind Canvas */}
      <div
        className={`absolute inset-0 bg-red-500/5 rounded-full filter blur-[90px] transition-all duration-700 pointer-events-none ${
          hovered ? 'scale-125 opacity-100 bg-red-500/10' : 'scale-100 opacity-60'
        }`}
      />

      {isVisible && (
        <Canvas
          camera={{ position: [0, 0, 3.8], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent', pointerEvents: 'auto' }}
        >
          <ambientLight intensity={1.4} />
          <directionalLight position={[2, 3, 5]} intensity={1.8} castShadow />
          <directionalLight position={[-2, -1, -3]} intensity={0.5} />
          <pointLight position={[0, 0.4, 1.5]} intensity={1.0} color="#FFD1E6" />

          {/* Suspense handles the asynchronous texture loading */}
          <Suspense fallback={null}>
            <RosePlane hovered={hovered} mouse={mouse} />
          </Suspense>

          {/* Floating sparkles in 3D */}
          <Sparkles count={hovered ? 35 : 12} scale={3.5} size={hovered ? 2.5 : 1.2} speed={0.4} color="#FFD1E6" />

          {/* Orbit controls with disabled pan and zoom to keep page experience smooth */}
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={true} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 2.5} />
        </Canvas>
      )}
    </div>
  );
};
