import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useState, useRef } from 'react';
import { Mesh } from 'three';

interface ThreeDDiceProps {
  diceType: string;
  isRolling: boolean;
  result: number | null;
  onRollComplete?: () => void;
}

function D20Dice({ isRolling, result }: { isRolling: boolean; result: number | null }) {
  const meshRef = useRef<Mesh>(null);
  
  // D20 face positions and rotations (20 triangular faces)
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

  return (
    <group rotation={isRolling ? [Math.PI * 4, Math.PI * 4, Math.PI * 2] : [0.2, 0.2, 0]}>
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
      
      {/* Numbers on each face */}
      {d20Faces.map((face) => (
        <Text
          key={face.number}
          position={face.position as [number, number, number]}
          rotation={face.rotation as [number, number, number]}
          fontSize={0.15}
          color="#2C1810"
          anchorX="center"
          anchorY="middle"
          font="/fonts/cinzel.woff"
        >
          {face.number}
        </Text>
      ))}
    </group>
  );
}

function D6Dice({ isRolling, result }: { isRolling: boolean; result: number | null }) {
  const meshRef = useRef<Mesh>(null);
  
  // D6 face positions (6 faces of a cube)
  const d6Faces = [
    { number: 1, position: [0, 0, 0.51], rotation: [0, 0, 0] },      // front
    { number: 6, position: [0, 0, -0.51], rotation: [0, Math.PI, 0] }, // back
    { number: 3, position: [0.51, 0, 0], rotation: [0, Math.PI/2, 0] }, // right
    { number: 4, position: [-0.51, 0, 0], rotation: [0, -Math.PI/2, 0] }, // left
    { number: 2, position: [0, 0.51, 0], rotation: [-Math.PI/2, 0, 0] }, // top
    { number: 5, position: [0, -0.51, 0], rotation: [Math.PI/2, 0, 0] }, // bottom
  ];
  
  const createDots = (number: number, faceIndex: number) => {
    const dots = [];
    const dotPositions: { [key: number]: number[][] } = {
      1: [[0, 0]],
      2: [[-0.2, 0.2], [0.2, -0.2]],
      3: [[-0.2, 0.2], [0, 0], [0.2, -0.2]],
      4: [[-0.2, 0.2], [0.2, 0.2], [-0.2, -0.2], [0.2, -0.2]],
      5: [[-0.2, 0.2], [0.2, 0.2], [0, 0], [-0.2, -0.2], [0.2, -0.2]],
      6: [[-0.2, 0.2], [0.2, 0.2], [-0.2, 0], [0.2, 0], [-0.2, -0.2], [0.2, -0.2]]
    };

    const positions = dotPositions[number] || [[0, 0]];
    const face = d6Faces[faceIndex];
    
    positions.forEach((pos, index) => {
      dots.push(
        <mesh 
          key={`${faceIndex}-${index}`} 
          position={[
            face.position[0] + (face.rotation[1] === 0 ? pos[0] * Math.cos(face.rotation[2]) : 0),
            face.position[1] + (face.rotation[0] === 0 ? pos[1] : pos[0] * Math.sin(face.rotation[0])),
            face.position[2] + (face.rotation[1] === Math.PI/2 ? pos[0] : 0)
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#2C1810" />
        </mesh>
      );
    });
    
    return dots;
  };

  return (
    <group rotation={isRolling ? [Math.PI * 4, Math.PI * 4, Math.PI * 2] : [0.2, 0.2, 0]}>
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
      
      {/* Dots on faces */}
      {d6Faces.map((face, index) => createDots(face.number, index))}
    </group>
  );
}

function GenericDice({ diceType, isRolling, result }: { diceType: string; isRolling: boolean; result: number | null }) {
  const meshRef = useRef<Mesh>(null);
  
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
            Math.sin(i * Math.PI / 4) * 0.8,
            i % 2 === 0 ? 0.6 : -0.6
          ],
          rotation: [0, i * Math.PI / 4, 0]
        }));
      case 'd12':
        return Array.from({length: 12}, (_, i) => {
          const angle = (i * 2 * Math.PI) / 12;
          return {
            number: i + 1,
            position: [
              Math.cos(angle) * 0.9,
              Math.sin(angle) * 0.9,
              i % 3 === 0 ? 0.5 : i % 3 === 1 ? 0 : -0.5
            ],
            rotation: [0, angle, 0]
          };
        });
      default:
        return [];
    }
  };

  const faces = getFacePositions();

  return (
    <group rotation={isRolling ? [Math.PI * 4, Math.PI * 4, Math.PI * 2] : [0.2, 0.2, 0]}>
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
      
      {/* Numbers on faces */}
      {faces.map((face) => (
        <Text
          key={face.number}
          position={face.position as [number, number, number]}
          rotation={face.rotation as [number, number, number]}
          fontSize={diceType === 'd4' ? 0.2 : 0.15}
          color="#2C1810"
          anchorX="center"
          anchorY="middle"
        >
          {face.number}
        </Text>
      ))}
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
        
        {/* Dice component */}
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