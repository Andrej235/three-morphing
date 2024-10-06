import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Mesh, MeshBasicMaterial } from "three";
import * as dat from "dat.gui";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

export default function MorphingElement() {
  const {
    scene: {
      children: [element],
    },
  } = useGLTF("morphing.glb");

  const { scene } = useThree();
  const meshRef = useRef<Mesh | null>(null);
  const guiRef = useRef<dat.GUI | null>(null);
  const animateToIdx = useRef(-1);

  const { contextSafe } = useGSAP();

  const animateToState = contextSafe((to: number) => {
    if (!meshRef.current?.morphTargetInfluences) return;
    const toObject: {
      [key: number]: number;
    } = {};

    const morphTargetInfluences = meshRef.current.morphTargetInfluences;

    if (to === -1) {
      //Animate to default state, all morph targets to 0
      for (let i = 0; i < morphTargetInfluences.length; i++) toObject[i] = 0;
    } else {
      //Animate to target state, 'to' morph target to 1 others to 0
      if (to >= morphTargetInfluences.length) return; //Out of bounds

      for (let i = 0; i < morphTargetInfluences.length; i++)
        if (i !== to) toObject[i] = 0;
        else toObject[i] = 1;
    }

    gsap.to(meshRef.current.morphTargetInfluences, {
      ...toObject,
      onUpdate: rebuildGUI,
    });
  });

  useEffect(() => {
    if (!element) return;

    meshRef.current = element as Mesh;
    meshRef.current.material = new MeshBasicMaterial({
      color: "#fff",
    });

    scene.add(meshRef.current);
  }, [scene, element]);

  useEffect(rebuildGUI, [meshRef, animateToIdx]);

  function rebuildGUI() {
    if (!meshRef.current?.morphTargetInfluences) return;

    if (guiRef.current) guiRef.current.destroy();

    guiRef.current = new dat.GUI();
    for (let i = 0; i < meshRef.current.morphTargetInfluences.length; i++)
      guiRef.current.add(meshRef.current.morphTargetInfluences, i, 0, 1, 0.01);

    const dropdown = guiRef.current.add(animateToIdx, "current", [
      ...Array(meshRef.current.morphTargetInfluences.length + 1).keys(),
    ]);
    dropdown.setValue(dropdown.getValue() < 0 ? 0 : dropdown.getValue());

    guiRef.current.add(
      {
        "Start animation": () => void animateToState(animateToIdx.current - 1),
      },
      "Start animation"
    );
  }

  return <></>;
}
