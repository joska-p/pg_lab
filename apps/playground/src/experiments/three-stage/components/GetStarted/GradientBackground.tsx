import { useRef } from 'react';
import * as THREE from 'three';

// Procedural radial gradient shader (goodbye PNG!)
const RadialGradientShader = {
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec2 vUv;
    void main() {
      float dist = distance(vUv, vec2(0.5));
      float alpha = smoothstep(0.5, 0.0, dist);
      gl_FragColor = vec4(uColor, alpha * uOpacity);
    }
  `,
};

interface GetSpritesDataProps {
    numSprites?: number;
    radius?: number;
    z?: number;
    hue?: number;
    sat?: number;
    baseSize?: number;
}

function getSpritesData({
    numSprites = 8,
    radius = 12,
    z = -15.5,
    hue = 0.5,
    sat = 0.5,
    baseSize = 20,
}: GetSpritesDataProps) {
    return Array.from({ length: numSprites }).map((_, i) => {
        const angle = (i / numSprites) * Math.PI * 2;
        const distanceFactor = Math.random();

        const position = new THREE.Vector3(
            Math.cos(angle) * distanceFactor * radius,
            -Math.sin(angle) * distanceFactor * radius,
            z + Math.random(),
        );

        const sizeModifier = baseSize * (1 + (Math.random() - 0.5) * 0.1);
        const scale = new THREE.Vector3(sizeModifier, sizeModifier, 1);

        const color = new THREE.Color().setHSL(hue, 1, sat);

        color.offsetHSL(0, 0, Math.random() * 0.2 - 0.1);

        return { id: i, position, scale, color };
    });
}

interface GradientBackgroundProps {
    opacity?: number;
    numSprites?: number;
}

export function GradientBackground({ opacity = 0.2, numSprites = 12 }: GradientBackgroundProps) {
    const spritesData = getSpritesData({ numSprites });
    const groupRef = useRef<THREE.Group>(null);

    return (
        <group ref={groupRef}>
            {spritesData.map((sprite) => (
                <mesh key={sprite.id} position={sprite.position} scale={sprite.scale}>
                    <planeGeometry args={[1, 1]} />
                    <shaderMaterial
                        transparent
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        vertexShader={RadialGradientShader.vertexShader}
                        fragmentShader={RadialGradientShader.fragmentShader}
                        uniforms={{
                            uColor: { value: sprite.color },
                            uOpacity: { value: opacity },
                        }}
                    />
                </mesh>
            ))}
        </group>
    );
}
