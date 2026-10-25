import { ShaderMaterial } from 'three';

import fragmentShaders from './fragment.frag?raw';
import vertexShaders from './vertex.vert?raw';

export const leafMaterial = new ShaderMaterial({
    vertexShader: vertexShaders,
    fragmentShader: fragmentShaders,
    uniforms: {
        uTime: { value: 0 },
    },
});
