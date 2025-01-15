import { Canvas } from "@react-three/fiber";
import "./App.css";
import { OrbitControls } from "@react-three/drei";

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
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
