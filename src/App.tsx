import { Canvas } from "@react-three/fiber";
import MorphingElement from "./MorphingElement";
import { OrbitControls } from "@react-three/drei";

function App() {
  return (
    <Canvas>
      <MorphingElement elementPath="morphing.glb" />
      <OrbitControls />
    </Canvas>
  );
}

export default App;
