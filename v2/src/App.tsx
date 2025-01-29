import { Canvas } from "@react-three/fiber";
import "./App.css";
import { OrbitControls } from "@react-three/drei";
import { faker } from "@faker-js/faker";
import { Card } from "./Card";

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
        <OrbitControls enableZoom={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}

export default App;
