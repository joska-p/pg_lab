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

function isColorSpacesKey(value: unknown): value is ColorSpacesKey {
    return typeof value === 'string' && Object.hasOwn(colorSpaces, value);
}

function isRuleKey(value: unknown): value is RuleKey {
    return typeof value === 'string' && Object.hasOwn(rules, value);
}

function Controls() {
    const baseColor = usePaletteBaseColor();

    function handleGeneratePalette(color: typeof baseColor, ruleKey: RuleKey) {
        const palette = generatePalette(color, rules[ruleKey]);

        addPalette(palette);
    }

    return (
        <>
            {Object.keys(colorSpaces)
                .filter(isColorSpacesKey)
                .map((key) => (
                    <ControlSection key={key} title={colorSpaces[key].name}>
                        <ColorSpaceControls spaceId={key} size={200} />
                    </ControlSection>
                ))}

            <ControlSection title="Harmony rules">
                <Stack direction="vertical" gap="2">
                    {Object.keys(rules)
                        .filter(isRuleKey)
                        .map((key) => (
                            <Button
                                key={key}
                                title={rules[key].info.description}
                                onClick={() => {
                                    handleGeneratePalette(baseColor, key);
                                }}
                            >
                                Generate {rules[key].info.name}
                            </Button>
                        ))}
                </Stack>
            </ControlSection>
        </>
    );
}

export { Controls };
