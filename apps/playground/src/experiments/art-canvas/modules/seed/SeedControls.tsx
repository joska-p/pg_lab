import { Select } from '@repo/ui/components/Select';
import { Slider } from '@repo/ui/components/Slider';
import { TextInput } from '@repo/ui/components/TextInput';

import type { MoodName } from '../../assembly/moods';
import type { PalettePresetName } from '../../palettes/registry';
import {
    setComplexity,
    setMood,
    setPalette,
    setSeed,
    useComplexity,
    useMood,
    usePalette,
    useSeed,
} from './store';

const MOOD_OPTIONS = [
    { label: 'Organic', value: 'organic' },
    { label: 'Geometric', value: 'geometric' },
    { label: 'Calm', value: 'calm' },
    { label: 'Energetic', value: 'energetic' },
] as const;

const PALETTE_OPTIONS = [
    { label: 'Iridescent Opal', value: 'iridescent_opal' },
    { label: 'Neon Cyber', value: 'neon_cyber' },
    { label: 'Biomorphic Flesh', value: 'biomorphic_flesh' },
    { label: 'Volcanic Magma', value: 'volcanic_magma' },
    { label: 'Deep Ocean', value: 'deep_ocean' },
] as const;

function SeedControls() {
    const seed = useSeed();
    const complexity = useComplexity();
    const mood = useMood();
    const palette = usePalette();

    return (
        <>
            <TextInput label="Seed" value={seed} onValueChange={setSeed} />
            <Slider
                label="Complexity"
                value={complexity}
                onValueChange={setComplexity}
                min={1}
                max={5}
            />
            <Select<MoodName>
                label="Mood"
                value={mood}
                onValueChange={setMood}
                options={MOOD_OPTIONS}
            />
            <Select<PalettePresetName>
                label="Palette"
                value={palette}
                onValueChange={setPalette}
                options={PALETTE_OPTIONS}
            />
        </>
    );
}

export { SeedControls };
