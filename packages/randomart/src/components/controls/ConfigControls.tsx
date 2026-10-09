import { Button } from '@repo/ui/components/Button';
import { TextArea } from '@repo/ui/components/TextArea';
import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import type { ColorSpaceId } from '../../core';
import { setColorSpace, setSeedText } from '../../stores/randomart/actions';
import { useColorSpace, useSeedText } from '../../stores/randomart/selectors';
import { RuleControls } from './RuleControls';

const COLOR_SPACES: { id: ColorSpaceId; label: string }[] = [
    { id: 'srgb', label: 'sRGB' },
    { id: 'oklch', label: 'OKLCH' },
    { id: 'oklab', label: 'OKLab' },
    { id: 'hsl', label: 'HSL' },
];

const styles = stylex.create({
    colorSpaces: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: space['2'],
    },
});

function ConfigControls() {
    const seedText = useSeedText();
    const colorSpace = useColorSpace();

    return (
        <>
            <TextArea value={seedText} onValueChange={setSeedText} />

            <RuleControls />

            <div {...stylex.props(styles.colorSpaces)}>
                {COLOR_SPACES.map((entry) => {
                    const isActive = colorSpace === entry.id;

                    return (
                        <Button
                            key={entry.id}
                            color={isActive ? 'aurora' : 'neutral'}
                            onClick={() => {
                                setColorSpace(entry.id);
                            }}
                        >
                            {entry.label}
                        </Button>
                    );
                })}
            </div>
        </>
    );
}

export { ConfigControls };
