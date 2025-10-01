import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useState, useRef, useEffect } from 'react';
import { Mesh, Vector3, Quaternion, Euler } from 'three';

interface ThreeDDiceProps {
  diceType: string;
  isRolling: boolean;
  result: number | null;
  onRollComplete?: () => void;
}

function D20Dice({ isRolling, result }: { isRolling: boolean; result: number | null }) {
  const meshRef = useRef<Mesh>(null);
  const initialRotation = useRef([0.2, 0.2, 0]);
  const targetRotation = useRef(new Euler(0.2, 0.2, 0));
  const rotationVelocity = useRef(new Vector3(
    Math.random() * 0.2 - 0.1,
    Math.random() * 0.2 - 0.1, 
    Math.random() * 0.2 - 0.1
  ));

  // D20 face positions (20 faces of an icosahedron)
  const d20Faces = [
    { number: 1, position: [0, 0, 1.1], rotation: [0, 0, 0] },
    { number: 2, position: [0.85, 0.52, 0.52], rotation: [0.6, 0.8, 0] },
    { number: 3, position: [0.85, -0.52, 0.52], rotation: [-0.6, 0.8, 0] },
    { number: 4, position: [0, -1.05, 0.52], rotation: [-1.2, 0, 0] },
    { number: 5, position: [-0.85, -0.52, 0.52], rotation: [-0.6, -0.8, 0] },
    { number: 6, position: [-0.85, 0.52, 0.52], rotation: [0.6, -0.8, 0] },
    { number: 7, position: [0, 1.05, 0.52], rotation: [1.2, 0, 0] },
    { number: 8, position: [0.85, 0.52, -0.52], rotation: [2.5, 0.8, 0] },
    { number: 9, position: [0.85, -0.52, -0.52], rotation: [-2.5, 0.8, 0] },
    { number: 10, position: [0, -1.05, -0.52], rotation: [-1.9, 0, 0] },
    { number: 11, position: [-0.85, -0.52, -0.52], rotation: [-2.5, -0.8, 0] },
    { number: 12, position: [-0.85, 0.52, -0.52], rotation: [2.5, -0.8, 0] },
    { number: 13, position: [0, 1.05, -0.52], rotation: [1.9, 0, 0] },
    { number: 14, position: [0, 0, -1.1], rotation: [Math.PI, 0, 0] },
    { number: 15, position: [0.52, 0.85, 0], rotation: [0.8, 0.6, 0] },
    { number: 16, position: [-0.52, 0.85, 0], rotation: [0.8, -0.6, 0] },
    { number: 17, position: [-1.05, 0, 0], rotation: [0, -Math.PI/2, 0] },
    { number: 18, position: [-0.52, -0.85, 0], rotation: [-0.8, -0.6, 0] },
    { number: 19, position: [0.52, -0.85, 0], rotation: [-0.8, 0.6, 0] },
    { number: 20, position: [1.05, 0, 0], rotation: [0, Math.PI/2, 0] },
  ];

  // Function to find the face that should be on top based on the result
  const setFinalRotation = () => {
    if (result && meshRef.current) {
      const targetFace = d20Faces.find(face => face.number === result);
      if (targetFace) {
        // We want to rotate so the target face is on top
        targetRotation.current = new Euler(
          -targetFace.rotation[0],
          -targetFace.rotation[1],
          -targetFace.rotation[2]
        );
      }
    }
  };
  
  useEffect(() => {
    if (!isRolling && result) {
      setFinalRotation();
    } else if (isRolling) {
      rotationVelocity.current = new Vector3(
            Math.random() * 8 - 4,  
            Math.random() * 8 - 4,  
            Math.random() * 8 - 4   
      );
    }
  }, [isRolling, result]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    if (isRolling) {
      // Apply continuous rotation with physics-like motion
      meshRef.current.rotation.x += rotationVelocity.current.x * delta;
      meshRef.current.rotation.y += rotationVelocity.current.y * delta;
      meshRef.current.rotation.z += rotationVelocity.current.z * delta;
      
      rotationVelocity.current.x *= 0.992;  
      rotationVelocity.current.y *= 0.992;  
      rotationVelocity.current.z *= 0.992;
    } else if (result) {
      meshRef.current.rotation.x = meshRef.current.rotation.x * 0.95 + targetRotation.current.x * 0.05;
      meshRef.current.rotation.y = meshRef.current.rotation.y * 0.95 + targetRotation.current.y * 0.05;
      meshRef.current.rotation.z = meshRef.current.rotation.z * 0.95 + targetRotation.current.z * 0.05;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          metalness={0.1}
          roughness={0.2}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </group>
  );
}

function D6Dice({ isRolling, result }: { isRolling: boolean; result: number | null }) {
  const meshRef = useRef<Mesh>(null);
  const rotationVelocity = useRef(new Vector3(
    Math.random() * 0.2 - 0.1,
    Math.random() * 0.2 - 0.1, 
    Math.random() * 0.2 - 0.1
  ));
  const targetRotation = useRef(new Euler(0.2, 0.2, 0));
  
  // D6 face positions (6 faces of a cube)
  const d6Faces = [
    { number: 1, position: [0, 0, 0.51], rotation: [0, 0, 0] },      // front
    { number: 6, position: [0, 0, -0.51], rotation: [0, Math.PI, 0] }, // back
    { number: 3, position: [0.51, 0, 0], rotation: [0, Math.PI/2, 0] }, // right
    { number: 4, position: [-0.51, 0, 0], rotation: [0, -Math.PI/2, 0] }, // left
    { number: 2, position: [0, 0.51, 0], rotation: [-Math.PI/2, 0, 0] }, // top
    { number: 5, position: [0, -0.51, 0], rotation: [Math.PI/2, 0, 0] }, // bottom
  ];
  
  // Function to find the face that should be on top based on the result
  const setFinalRotation = () => {
    if (result && meshRef.current) {
      const targetFace = d6Faces.find(face => face.number === result);
      if (targetFace) {
        // We want to rotate so the target face is on top
        if (result === 1) targetRotation.current = new Euler(Math.PI/2, 0, 0);
        else if (result === 6) targetRotation.current = new Euler(-Math.PI/2, 0, 0);
        else if (result === 3) targetRotation.current = new Euler(0, 0, -Math.PI/2);
        else if (result === 4) targetRotation.current = new Euler(0, 0, Math.PI/2);
        else if (result === 2) targetRotation.current = new Euler(0, 0, 0);
        else if (result === 5) targetRotation.current = new Euler(Math.PI, 0, 0);
      }
    }
  };
  
  useEffect(() => {
  if (!isRolling && result) {
    setFinalRotation();
  } else if (isRolling) {
    rotationVelocity.current = new Vector3(
      Math.random() * 8 - 4,
      Math.random() * 8 - 4,
      Math.random() * 8 - 4
    );
  }
}, [isRolling, result]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    if (isRolling) {
      // Apply continuous rotation with physics-like motion
      meshRef.current.rotation.x += rotationVelocity.current.x * delta;
      meshRef.current.rotation.y += rotationVelocity.current.y * delta;
      meshRef.current.rotation.z += rotationVelocity.current.z * delta;
      
      rotationVelocity.current.x *= 0.992; 
      rotationVelocity.current.y *= 0.992;  
      rotationVelocity.current.z *= 0.992; 
    } else if (result) {
      meshRef.current.rotation.x = meshRef.current.rotation.x * 0.95 + targetRotation.current.x * 0.05;
      meshRef.current.rotation.y = meshRef.current.rotation.y * 0.95 + targetRotation.current.y * 0.05;
      meshRef.current.rotation.z = meshRef.current.rotation.z * 0.95 + targetRotation.current.z * 0.05;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          metalness={0.1}
          roughness={0.2}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </group>
  );
}

function GenericDice({ diceType, isRolling, result }: { diceType: string; isRolling: boolean; result: number | null }) {
  const meshRef = useRef<Mesh>(null);
  const rotationVelocity = useRef(new Vector3(
    Math.random() * 0.2 - 0.1,
    Math.random() * 0.2 - 0.1, 
    Math.random() * 0.2 - 0.1
  ));
  const targetRotation = useRef(new Euler(0.2, 0.2, 0));
  
  const getGeometry = () => {
    switch (diceType) {
      case 'd4':
        return <tetrahedronGeometry args={[1]} />;
      case 'd8':
        return <octahedronGeometry args={[1]} />;
      case 'd12':
        return <dodecahedronGeometry args={[1]} />;
      default:
        return <icosahedronGeometry args={[1]} />;
    }
  };

  // Get face positions based on dice type
  const getFacePositions = () => {
    switch (diceType) {
      case 'd4':
        return [
          { number: 1, position: [0, 0.6, 0.3], rotation: [0, 0, 0] },
          { number: 2, position: [0.5, -0.3, 0.3], rotation: [0, 2.1, 0] },
          { number: 3, position: [-0.5, -0.3, 0.3], rotation: [0, -2.1, 0] },
          { number: 4, position: [0, 0, -0.8], rotation: [Math.PI, 0, 0] },
        ];
      case 'd8':
        return Array.from({length: 8}, (_, i) => ({
          number: i + 1,
          position: [
            Math.cos(i * Math.PI / 4) * 0.8, 
            ((i % 2) * 2 - 1) * 0.5,
            Math.sin(i * Math.PI / 4) * 0.8
          ],
          rotation: [((i % 2) * 2 - 1) * Math.PI / 3, i * Math.PI / 4, 0]
        }));
      case 'd10':
      case 'd100':
        return Array.from({length: 10}, (_, i) => ({
          number: diceType === 'd100' ? i * 10 : i + 1,
          position: [
            Math.cos(i * Math.PI / 5) * 0.8,
            0.3 * ((i % 2) * 2 - 1),
            Math.sin(i * Math.PI / 5) * 0.8
          ],
          rotation: [((i % 2) * 2 - 1) * Math.PI / 6, i * Math.PI / 5, 0]
        }));
      case 'd12':
        return Array.from({length: 12}, (_, i) => ({
          number: i + 1,
          position: [
            Math.cos(i * Math.PI / 6) * ((i % 2) ? 0.9 : 0.7),
            ((i % 3) - 1) * 0.5,
            Math.sin(i * Math.PI / 6) * ((i % 2) ? 0.9 : 0.7)
          ],
          rotation: [((i % 3) - 1) * Math.PI / 4, i * Math.PI / 6, 0]
        }));
      default:
        return Array.from({length: Number(diceType.slice(1))}, (_, i) => ({
          number: i + 1,
          position: [
            Math.cos(i * 2 * Math.PI / Number(diceType.slice(1))) * 0.8,
            0,
            Math.sin(i * 2 * Math.PI / Number(diceType.slice(1))) * 0.8
          ],
          rotation: [0, i * 2 * Math.PI / Number(diceType.slice(1)), 0]
        }));
    }
  };
  
  const faces = getFacePositions();
  
  useEffect(() => {
  if (isRolling) {
    rotationVelocity.current = new Vector3(
      Math.random() * 8 - 4,
      Math.random() * 8 - 4,
      Math.random() * 8 - 4
    );
  }
}, [isRolling]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    if (isRolling) {
      // Apply continuous rotation with physics-like motion
      meshRef.current.rotation.x += rotationVelocity.current.x * delta;
      meshRef.current.rotation.y += rotationVelocity.current.y * delta;
      meshRef.current.rotation.z += rotationVelocity.current.z * delta;
      
      rotationVelocity.current.x *= 0.992; 
      rotationVelocity.current.y *= 0.992;  
      rotationVelocity.current.z *= 0.992; 
    }
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        {getGeometry()}
        <meshPhysicalMaterial 
          color="#ffffff"
          metalness={0.1}
          roughness={0.2}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </group>
  );
}

export default function ThreeDDice({ diceType, isRolling, result, onRollComplete }: ThreeDDiceProps) {
  const renderDice = () => {
    if (diceType === 'd20') {
      return <D20Dice isRolling={isRolling} result={result} />;
    } else if (diceType === 'd6') {
      return <D6Dice isRolling={isRolling} result={result} />;
    } else {
      return <GenericDice diceType={diceType} isRolling={isRolling} result={result} />;
    }
  };

  return (
    <div className="w-full h-64 rounded-lg bg-gradient-to-br from-dnd-dark to-dnd-wood border-2 border-dnd-gold">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }} shadows>
        {/* Lighting setup for realistic dice appearance */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8} 
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.4} color="#D4AF37" />
        
        {/* Ground plane for shadow */}
        <mesh receiveShadow position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#2C1810" transparent opacity={0.8} />
        </mesh>
        
        {renderDice()}
        
        {/* Allow user to rotate view */}
        <OrbitControls 
          enablePan={false} 
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}