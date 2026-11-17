import type { ReferenceOrbit } from './referenceOrbit';

export interface OrbitTextures {
    readonly tex1: WebGLTexture;
    readonly tex2: WebGLTexture;
    upload(primary: ReferenceOrbit, secondary: ReferenceOrbit): void;
    dispose(): void;
}

// Textures are recreated lazily when the orbit length changes; uploading an
// unchanged orbit just re-fills the buffer.
export function createOrbitTextures(gl: WebGL2RenderingContext): OrbitTextures {
    let texture1: WebGLTexture | null = null;
    let texture2: WebGLTexture | null = null;
    let texture1Width = 0;
    let texture2Width = 0;

    const deleteTex = (t: WebGLTexture | null) => {
        if (t) {
            gl.deleteTexture(t);
        }
    };

    const upload = (
        orbit: ReferenceOrbit,
        existing: WebGLTexture | null,
        existingWidth: number,
    ): { tex: WebGLTexture; width: number } => {
        if (!existing || orbit.orbitLength !== existingWidth) {
            deleteTex(existing);
            const tex = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RG32F,
                orbit.orbitLength,
                1,
                0,
                gl.RG,
                gl.FLOAT,
                orbit.data,
            );

            return { tex, width: orbit.orbitLength };
        }

        gl.bindTexture(gl.TEXTURE_2D, existing);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, orbit.orbitLength, 1, gl.RG, gl.FLOAT, orbit.data);

        return { tex: existing, width: existingWidth };
    };

    return {
        get tex1(): WebGLTexture {
            if (!texture1) {
                throw new Error('primary orbit texture not ready');
            }

            return texture1;
        },
        get tex2(): WebGLTexture {
            if (!texture2) {
                throw new Error('secondary orbit texture not ready');
            }

            return texture2;
        },

        upload(primary, secondary): void {
            const r1 = upload(primary, texture1, texture1Width);

            texture1 = r1.tex;
            texture1Width = r1.width;

            const r2 = upload(secondary, texture2, texture2Width);

            texture2 = r2.tex;
            texture2Width = r2.width;
        },

        dispose(): void {
            deleteTex(texture1);
            deleteTex(texture2);
            texture1 = texture2 = null;
            texture1Width = texture2Width = 0;
        },
    };
}
