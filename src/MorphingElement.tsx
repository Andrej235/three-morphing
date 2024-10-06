import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Material, Mesh, MeshBasicMaterial } from "three";
import * as dat from "dat.gui";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

type MorphingElementProps = {
  elementPath: string;
  material?: Material;
};

export default function MorphingElement({
  elementPath,
  material,
}: MorphingElementProps) {
  //GLTF model
  const {
    scene: {
      children: [element], //Get the first element in the scene
    },
  } = useGLTF(elementPath);

  //Canvas' scene
  const { scene } = useThree();
  //Loaded GTLF model with a material
  const [meshRef, setMeshRef] = useState<Mesh | null>(null);

  //GSAP
  const { contextSafe } = useGSAP();
  //Current tween, used to ensure only one tween / animation is active at a time
  const currentTween = useRef<gsap.core.Tween | null>(null);

  //GUI ref
  const guiRef = useRef<dat.GUI | null>(null);
  //Animation state, used by a button in gui
  const animateToIdx = useRef(-1);

  const animateToState = contextSafe((to: number) => {
    if (!meshRef?.morphTargetInfluences) return;
    const toObject: {
      [key: number]: number;
    } = {};

    const morphTargetInfluences = meshRef.morphTargetInfluences;

    if (to === -1) {
      //Animate to default state, set all morph targets to 0
      for (let i = 0; i < morphTargetInfluences.length; i++) toObject[i] = 0;
    } else {
      //Animate to target state, set 'to' morph target to 1 others to 0
      if (to >= morphTargetInfluences.length) return; //Out of bounds

      for (let i = 0; i < morphTargetInfluences.length; i++)
        if (i !== to) toObject[i] = 0;
        else toObject[i] = 1;
    }

    if (currentTween.current) currentTween.current.kill();
    currentTween.current = gsap.to(meshRef.morphTargetInfluences, {
      ...toObject,
      duration: 0.7,
      onUpdate: () => void guiRef.current?.updateDisplay(),
      onComplete: () => void (currentTween.current = null),
    });
  });

  useEffect(() => {
    if (!element) return;

    setMeshRef(() => {
      const mesh = element as Mesh;
      mesh.material =
        material ??
        new MeshBasicMaterial({
          color: "#fff",
        });
      return mesh;
    });
  }, [scene, element]);

  useEffect(rebuildGUI, [meshRef, animateToIdx]);

  function rebuildGUI() {
    if (!meshRef?.morphTargetInfluences) return;

    if (guiRef.current) guiRef.current.destroy();

    guiRef.current = new dat.GUI();
    for (let i = 0; i < meshRef.morphTargetInfluences.length; i++)
      guiRef.current.add(meshRef.morphTargetInfluences, i, 0, 1, 0.01);

    const dropdown = guiRef.current.add(animateToIdx, "current", [
      ...Array(meshRef.morphTargetInfluences.length + 1).keys(),
    ]);
    dropdown.setValue(dropdown.getValue() < 0 ? 0 : dropdown.getValue());

    guiRef.current.add(
      {
        "Start animation": () => void animateToState(animateToIdx.current - 1),
      },
      "Start animation"
    );
  }

  return meshRef && <primitive object={meshRef} />;
}
