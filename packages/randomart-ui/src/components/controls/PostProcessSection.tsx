import { ControlSection } from '@repo/ui/components/ControlSection';
import { Toggle } from '@repo/ui/components/Toggle';

import { POST_PROCESS_EFFECTS } from '../../postProcessing/effects';
import { setEffectActive, useActiveEffects } from '../../stores/postProcessingStore';

/** Post-processing effects toggles (e.g. film grain). */
export function PostProcessSection() {
    const activeEffects = useActiveEffects();

    return (
        <ControlSection title="post-processing">
            {POST_PROCESS_EFFECTS.map((effect) => (
                <Toggle
                    key={effect.id}
                    label={effect.label}
                    checked={activeEffects[effect.id] ?? false}
                    onCheckedChange={(checked) => {
                        setEffectActive(effect.id, checked);
                    }}
                />
            ))}
        </ControlSection>
    );
}
