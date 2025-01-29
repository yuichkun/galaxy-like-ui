import { useFrame, useLoader } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import { Mesh, TextureLoader, DoubleSide } from "three";

type Props = {
  position: [number, number, number];
  avatarUrl: string;
};

export const Card = ({ position, avatarUrl }: Props) => {
  const texture = useLoader(TextureLoader, avatarUrl);
  const meshRef = useRef<Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.006;
      meshRef.current.rotation.y += 0.011;
    }
  });
  return (
    <mesh ref={meshRef} position={position}>
      <RoundedBox args={[1, 1, 0.02]} radius={0.05} smoothness={4}>
        <meshPhysicalMaterial
          map={texture}
          opacity={0.7}
          roughness={0.9}
          metalness={0.5}
          side={DoubleSide}
          transmission={0.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </RoundedBox>
    </mesh>
  );
};
