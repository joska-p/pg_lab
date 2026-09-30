import * as stylex from '@stylexjs/stylex';
import { useMemo } from 'react';

import { useComponentName } from '../../../stores/appStore';
import { Card } from '../ui/components/Card';
import { Stack } from '../ui/components/Stack';
import { fieldText } from '../ui/typography.stylex';
import { components } from './registry';
import { useCardFilter, useComponentFilter } from './variantFilter.store';
import { buildSurfaceVariants } from './variants';

export function DemoCanvas() {
    const registryKey = useComponentName();
    const cardFilter = useCardFilter();
    const componentFilter = useComponentFilter();
    const Sample = components[registryKey];

    const cardVariants = useMemo(() => buildSurfaceVariants(cardFilter), [cardFilter]);
    const componentVariants = useMemo(
        () => buildSurfaceVariants(componentFilter),
        [componentFilter],
    );

    if (cardVariants.length === 0) {
        return (
            <p {...stylex.props(fieldText.message)}>
                No card variants selected — adjust the Card filter.
            </p>
        );
    }

    return (
        <Stack direction="vertical" gap="8">
            <p {...stylex.props(fieldText.value)}>
                {cardVariants.length} cards × {componentVariants.length} components ={' '}
                {cardVariants.length * componentVariants.length} nodes
            </p>
            {componentVariants.length === 0 ? (
                <p {...stylex.props(fieldText.message)}>
                    No component variants selected — adjust the Component filter.
                </p>
            ) : (
                cardVariants.map((card) => (
                    <Card
                        key={card.label}
                        color={card.color}
                        bg={card.bg}
                        tintBackground={card.tintBackground}
                        tintBorder={card.tintBorder}
                        tintShadow={card.tintShadow}
                        elevation={card.elevation}
                    >
                        <h2>{card.label}</h2>
                        <Stack direction="horizontal" gap="12">
                            {componentVariants.map((variant) => (
                                <Sample
                                    key={variant.label}
                                    label={variant.label}
                                    color={variant.color}
                                    bg={variant.bg}
                                    tintBackground={variant.tintBackground}
                                    tintBorder={variant.tintBorder}
                                    tintShadow={variant.tintShadow}
                                    elevation={variant.elevation}
                                    defaultChecked
                                >
                                    {variant.label}
                                </Sample>
                            ))}
                        </Stack>
                    </Card>
                ))
            )}
        </Stack>
    );
}
