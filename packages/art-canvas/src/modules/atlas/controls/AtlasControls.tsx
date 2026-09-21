import { Button } from '@repo/ui/components/Button';
import { Slider } from '@repo/ui/components/Slider';
import { TextArea } from '@repo/ui/components/TextArea';
import { startTransition } from 'react';

import { setComplexity, setModulo, setSeed } from '../store/actions';
import { useComplexity, useModulo, useSeed } from '../store/selectors';

const generateRandomSeed = () => {
    const randomPhrases = [
        'cree-geometry-pulse',
        'ojibwe-pisano-grid',
        'inuktitut-vowel-rot',
        'aboriginal-glyph-wave',
        'modulo-digital-artifact',
        'cosmic-mathematics-flow',
    ];
    const randomPhrase =
        randomPhrases[Math.floor(Math.random() * randomPhrases.length)] ?? 'ojibwe-pisano-grid';
    const newSeed = randomPhrase + '-' + String(Math.floor(Math.random() * 1000));

    setSeed(newSeed);
};

function AtlasControls() {
    const seed = useSeed();
    const modulo = useModulo();
    const complexity = useComplexity();

    const handleComplexityChange = (value: number) => {
        startTransition(() => {
            setComplexity(value);
        });
    };

    return (
        <>
            <TextArea label="Seed" value={seed} onValueChange={setSeed} />
            <Button onClick={generateRandomSeed}>Generate Random Seed</Button>
            <Slider
                label="Modulo"
                value={modulo}
                min={2}
                max={16}
                step={1}
                onValueChange={setModulo}
            />
            <Slider
                label="Complexity"
                value={complexity}
                min={5}
                max={45}
                step={1}
                onValueChange={handleComplexityChange}
            />
        </>
    );
}

export { AtlasControls };
