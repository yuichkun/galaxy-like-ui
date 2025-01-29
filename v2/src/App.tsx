import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import "./App.css";
import { OrbitControls, RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import { Mesh, TextureLoader, DoubleSide } from "three";
import { faker } from "@faker-js/faker";

type Props = {
  position: [number, number, number];
  avatarUrl: string;
};
const Card = ({ position, avatarUrl }: Props) => {
  const texture = useLoader(TextureLoader, avatarUrl);
  const meshRef = useRef<Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      // meshRef.current.rotation.x += 0.006;
      // meshRef.current.rotation.y += 0.011;
    }
  });
  return (
    <mesh ref={meshRef} position={position}>
      <RoundedBox args={[1, 1, 0.02]} radius={0.05} smoothness={4}>
        <meshPhysicalMaterial
          map={texture}
          opacity={0.7}
          roughness={0.9}
          metalness={0.5}
          side={DoubleSide}
          transmission={0.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </RoundedBox>
    </mesh>
  );
};

function App() {
  // Generate URLs once at parent level
  const avatarUrls = [
    faker.image.avatarGitHub(),
    faker.image.avatarGitHub(),
    faker.image.avatarGitHub(),
  ];

  return (
    <div id="canvas-container">
      <Canvas orthographic camera={{ zoom: 200, position: [0, 0, 100] }}>
        <ambientLight intensity={Math.PI * 2} />
        <Card key={0} position={[0, 0, 0]} avatarUrl={avatarUrls[0]} />
        <Card key={1} position={[-4, 0, 0]} avatarUrl={avatarUrls[1]} />
        <Card key={2} position={[4, 0, 0]} avatarUrl={avatarUrls[2]} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

export default App;
