import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Mesh, MeshBasicMaterial } from "three";
import * as dat from "dat.gui";

export default function MorphingElement() {
  const {
    scene: {
      children: [element],
    },
  } = useGLTF("morphing.glb");

  const { scene } = useThree();
  const meshRef = useRef<Mesh | null>(null);
  const guiRef = useRef<dat.GUI | null>(null);
  const [runAnimation, setRunAnimation] = useState(false);

  useEffect(() => {
    if (!element) return;

    meshRef.current = element as Mesh;
    meshRef.current.material = new MeshBasicMaterial({
      color: "#fff",
    });

    scene.add(meshRef.current);
  }, [scene, element]);

  useEffect(() => {
    if (!meshRef.current?.morphTargetInfluences) return;

    if (guiRef.current) guiRef.current.destroy();

    guiRef.current = new dat.GUI();
    for (let i = 0; i < meshRef.current.morphTargetInfluences.length; i++)
      guiRef.current.add(meshRef.current.morphTargetInfluences, i, 0, 1, 0.01);

    guiRef.current.add(
      {
        ToggleAnimation: () => void setRunAnimation(!runAnimation),
      },
      "ToggleAnimation"
    );
  }, [meshRef.current, runAnimation]);

  useFrame(({ clock: { elapsedTime: time } }) => {
    if (!meshRef.current?.morphTargetInfluences || !runAnimation) return;

    meshRef.current.morphTargetInfluences[0] = Math.sin(time * 2) * 0.5 + 0.5;
    meshRef.current.morphTargetInfluences[1] =
      1 - (Math.sin(time * 2) * 0.5 + 0.5);
  });

  return <></>;
}
