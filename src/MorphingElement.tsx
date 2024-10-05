import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Mesh, MeshBasicMaterial } from "three";

export default function MorphingElement() {
  const {
    scene: {
      children: [element],
    },
  } = useGLTF("morphing.glb");

  const { scene } = useThree();
  const meshRef = useRef<Mesh | null>(null);

  useEffect(() => {
    if (!element) return;

    meshRef.current = element as Mesh;
    meshRef.current.material = new MeshBasicMaterial({
      color: "#fff",
    });

    scene.add(meshRef.current);
  }, [scene, element]);

  useFrame(({ clock: { elapsedTime: time } }) => {
    if (!meshRef.current?.morphTargetInfluences) return;

    console.log(meshRef.current?.morphTargetInfluences);
    meshRef.current.morphTargetInfluences[0] = Math.sin(time * 2) * 0.5 + 0.5;
  });

  return <></>;
}
