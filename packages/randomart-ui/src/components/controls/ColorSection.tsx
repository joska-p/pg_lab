import type { ColorSpaceId } from '@repo/randomart-core/colors';
import { COLOR_SPACES } from '@repo/randomart-core/colors';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Segmented } from '@repo/ui/components/Segmented';

import { setSpace, useSpace } from '../../stores/artworkStore';

const SPACE_OPTIONS = COLOR_SPACES.map(({ id, label }) => ({
    value: id,
    label,
}));

export function ColorSection() {
    const space = useSpace();

    return (
        <ControlSection title="color">
            <Segmented<ColorSpaceId>
                color="orange"
                value={space}
                options={SPACE_OPTIONS}
                onValueChange={setSpace}
            />
        </ControlSection>
    );
}
