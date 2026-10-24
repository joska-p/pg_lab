import { Button } from '@repo/ui/components/Button';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Stack } from '@repo/ui/components/Stack';

import { colorSpaces } from '../core/colorSpaces';
import type { ColorSpacesKey } from '../core/colorSpaces';
import { generatePalette } from '../core/generatePalette';
import { analogous } from '../core/rules/analogous';
import { complementary } from '../core/rules/complementary';
import { monochromatic } from '../core/rules/monochromatic';
import { triadic } from '../core/rules/triadic';
import { addPalette, usePaletteBaseColor } from '../stores/paletteStore';
import { ColorSpaceControls } from './color-picker/ColorSpaceControls';

const rules = { analogous, complementary, monochromatic, triadic } as const;

type RuleKey = keyof typeof rules;

function Controls() {
    const baseColor = usePaletteBaseColor();

    function handleGeneratePalette(color: typeof baseColor, ruleKey: RuleKey) {
        const palette = generatePalette(color, rules[ruleKey]);

        addPalette(palette);
    }

    return (
        <>
            {Object.entries(colorSpaces).map(([key, space]) => (
                <ControlSection key={key} title={space.name}>
                    <ColorSpaceControls spaceId={key as ColorSpacesKey} size={200} />
                </ControlSection>
            ))}

            <ControlSection title="Harmony rules">
                <Stack direction="vertical" gap="2">
                    {Object.entries(rules).map(([key, rule]) => (
                        <Button
                            key={key}
                            title={rule.info.description}
                            onClick={() => {
                                handleGeneratePalette(baseColor, key as RuleKey);
                            }}
                        >
                            Generate {rule.info.name}
                        </Button>
                    ))}
                </Stack>
            </ControlSection>
        </>
    );
}

export { Controls };
