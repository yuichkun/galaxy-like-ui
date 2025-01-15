import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import "./App.css";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import { Mesh, TextureLoader } from "three";
import { faker } from "@faker-js/faker";

const avatarUrl = faker.image.avatarGitHub();
const RotatingBox = () => {
  const texture = useLoader(TextureLoader, avatarUrl);
  const meshRef = useRef<Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.016;
    }
  });
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

function App() {
  return (
    <div id="canvas-container">
      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <RotatingBox />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
