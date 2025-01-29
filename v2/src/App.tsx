import { faker } from "@faker-js/faker";
import { OrbitControls, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import "./App.css";
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
        <Stage
          environment="city" // or "sunset", "dawn", "night", "warehouse", "forest", "apartment", "studio", "park", "lobby"
          intensity={1}
          preset="upfront" // or "portrait", "upfront", "soft"
        >
          <Card key={0} position={[0, 0, 0]} avatarUrl={avatarUrls[0]} />
          <Card key={1} position={[-2, 0, 0]} avatarUrl={avatarUrls[1]} />
          <Card key={2} position={[2, 0, 0]} avatarUrl={avatarUrls[2]} />
        </Stage>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
