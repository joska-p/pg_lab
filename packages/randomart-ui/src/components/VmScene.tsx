import { vm } from '@repo/randomart-vm';
import { useMemo, useState } from 'react';

import { useVmStore } from '../stores/vmStore';
import { VmCanvas } from './VmCanvas';

export function VmScene() {
    const { seed, shareDepth, size, weights } = useVmStore();
    const [error, setError] = useState<string | null>(null);

    const compiled = useMemo(() => {
        try {
            setError(null);
            const g = vm.createGrammar({ weights, size, shareDepth });
            const res = vm.render(g, seed);
            return res.compiled;
        } catch (e: any) {
            setError(e?.message ?? String(e));
            return null;
        }
    }, [seed, shareDepth, size, weights]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {compiled ? <VmCanvas fragmentShader={compiled.source} /> : null}
            {error ? (
                <pre
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'rgba(0,0,0,0.7)',
                        color: '#f88',
                        padding: '8px',
                        margin: 0,
                        fontSize: '12px',
                        overflow: 'auto',
                    }}
                >
                    {error}
                </pre>
            ) : null}
        </div>
    );
}
