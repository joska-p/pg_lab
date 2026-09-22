import { ControlSection } from '@repo/ui/components/ControlSection';
import { Select } from '@repo/ui/components/Select';

import { allCreatures } from '../../engine/creature/registry';
import { setPaletteBrush } from '../../stores/automa/actions';
import { usePaletteBrush } from '../../stores/automa/selectors';

export function CreatureSection() {
    const paletteBrush = usePaletteBrush();

    return (
        <ControlSection title="Creature">
            <Select
                label="Pattern"
                family="aqua"
                value={paletteBrush}
                onValueChange={setPaletteBrush}
                options={allCreatures.map((creature) => ({
                    label: creature.name,
                    value: creature.id,
                }))}
            />
        </ControlSection>
    );
}
