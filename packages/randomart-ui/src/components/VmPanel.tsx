import { useVmStore } from '../stores/vmStore';

const OPS = ['x', 'y', 'const', 'add', 'sub', 'mul', 'sin', 'cos', 'neg', 'sqr'];

export function VmPanel() {
    const {
        seed,
        shareDepth,
        size,
        weights,
        setSeed,
        setShareDepth,
        setSize,
        setWeight,
        randomize,
    } = useVmStore();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '240px' }}>
            <div>
                <div style={{ marginBottom: '4px', opacity: 0.7 }}>Seed</div>
                <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(Number(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>
            <div>
                <div style={{ marginBottom: '4px', opacity: 0.7 }}>Size</div>
                <select
                    value={size}
                    onChange={(e) => setSize(e.target.value as any)}
                    style={{ width: '100%' }}
                >
                    <option value="tiny">tiny</option>
                    <option value="small">small</option>
                    <option value="medium">medium</option>
                    <option value="large">large</option>
                </select>
            </div>
            <div>
                <div style={{ marginBottom: '4px', opacity: 0.7 }}>Share Depth: {shareDepth}</div>
                <input
                    type="range"
                    min={0}
                    max={5}
                    value={shareDepth}
                    onChange={(e) => setShareDepth(Number(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>
            <div>
                <div style={{ marginBottom: '8px', opacity: 0.7 }}>Weights</div>
                {OPS.map((op) => (
                    <div
                        key={op}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px',
                        }}
                    >
                        <div
                            style={{ width: '40px', textTransform: 'uppercase', fontSize: '12px' }}
                        >
                            {op}
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={4}
                            step={1}
                            value={weights[op] ?? 0}
                            onChange={(e) => setWeight(op, Number(e.target.value))}
                            style={{ flex: 1 }}
                        />
                        <div style={{ width: '16px', textAlign: 'right', fontSize: '12px' }}>
                            {weights[op] ?? 0}
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={randomize}>Randomize</button>
        </div>
    );
}
