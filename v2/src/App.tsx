import { faker } from "@faker-js/faker";
import { OrbitControls, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import "./App.css";
import { Card } from "./Card";

function App() {
  const stageConfig = useControls({
    environment: {
      value: "city" as const,
      options: [
        "city",
        "sunset",
        "dawn",
        "night",
        "warehouse",
        "forest",
        "apartment",
        "studio",
        "park",
        "lobby",
      ] as const,
    },
    preset: {
      value: "soft" as const,
      options: ["rembrandt", "portrait", "upfront", "soft"] as const,
    },
    intensity: {
      value: 1,
      min: 0,
      max: 5,
      step: 0.1,
    },
    debug: {
      value: false,
    },
  });

  // Generate URLs once at parent level
  const avatarUrls = [
    faker.image.avatarGitHub(),
    faker.image.avatarGitHub(),
    faker.image.avatarGitHub(),
  ];

  return (
    <div id="canvas-container">
      <Canvas camera={{ zoom: 6, position: [0, 0, 10] }}>
        <Stage
          environment={stageConfig.environment}
          intensity={stageConfig.intensity}
          preset={stageConfig.preset}
        >
          <Card key={0} position={[0, 0, 0]} avatarUrl={avatarUrls[0]} />
          <Card key={1} position={[-2, 0, 0]} avatarUrl={avatarUrls[1]} />
          <Card key={2} position={[2, 0, 0]} avatarUrl={avatarUrls[2]} />
        </Stage>
        <OrbitControls enabled={stageConfig.debug} />
      </Canvas>
    </div>
  );
}

export default App;
