import { useFrame, useLoader } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import { Mesh, TextureLoader, DoubleSide, Clock } from "three";

type Props = {
  position: [number, number, number];
  avatarUrl: string;
};

export const Card = ({ position, avatarUrl }: Props) => {
  const texture = useLoader(TextureLoader, avatarUrl);
  const meshRef = useRef<Mesh>(null);
  const clock = new Clock();

  useFrame(() => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      const angle = Math.sin(time * 0.5) * Math.PI * 0.2;
      meshRef.current.rotation.y = angle;
    }
  });
  return (
    <mesh ref={meshRef} position={position}>
      <RoundedBox args={[1, 0.5625, 0.02]} radius={0.05} smoothness={4}>
        <meshPhysicalMaterial
          map={texture}
          transparent={true}
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
