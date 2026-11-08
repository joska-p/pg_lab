import { Button } from '@repo/ui/components/Button';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Stack } from '@repo/ui/components/Stack';
import type Color from 'colorjs.io';

import { colorSpaceOptions } from '../core/colorSpaces';
import { generatePalette } from '../core/generatePalette';
import { getRule, RULES } from '../core/rules/registry';
import type { RulesId } from '../core/rules/registry';
import { addPalette, usePaletteBaseColor } from '../stores/paletteStore';
import { ColorSpaceControls } from './color-picker/ColorSpaceControls';

function Controls() {
    const baseColor = usePaletteBaseColor();

    function handleGeneratePalette(color: Color, ruleId: RulesId) {
        const palette = generatePalette(color, getRule(ruleId));

        addPalette(palette);
    }

    return (
        <>
            {colorSpaceOptions.map((option) => (
                <ControlSection key={option.label} title={option.label}>
                    <ColorSpaceControls spaceId={option.label} size={200} />
                </ControlSection>
            ))}

            <ControlSection title="Harmony rules">
                <Stack direction="vertical" gap="2">
                    {RULES.map((rule) => (
                        <Button
                            key={rule.id}
                            title={rule.label}
                            onClick={() => {
                                handleGeneratePalette(baseColor, rule.id);
                            }}
                        >
                            Generate {rule.label}
                        </Button>
                    ))}
                </Stack>
            </ControlSection>
        </>
    );
}

export { Controls };
