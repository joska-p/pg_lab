import * as stylex from '@stylexjs/stylex';
import { useEffect, useMemo, useState } from 'react';

import { useComponentName } from '../../../stores/appStore';
import { Card } from '../ui/components/Card';
import { Stack } from '../ui/components/Stack';
import { space } from '../ui/const.stylex';
import { fieldText } from '../ui/typography.stylex';
import { components } from './registry';
import { useCardFilter, useComponentFilter } from './variantFilter.store';
import { buildSurfaceVariants } from './variants';

// Render budget: the matrix is card variants × component variants (up to 216 × 216 =
// 46 656 instances at full filter). All variants stay reachable through
// pages, and the honest total is always displayed — pagination bounds the
// synchronous React/DOM cost without hiding any variant.
const CARDS_PER_PAGE = 12;

const canvasStyles = stylex.create({
    cardItem: {
        contentVisibility: 'auto',
        containIntrinsicSize: 'auto 320px',
    },
    pager: {
        display: 'flex',
        alignItems: 'center',
        gap: space['2'],
    },
});

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

    const [page, setPage] = useState(0);
    useEffect(() => {
        setPage(0);
    }, [registryKey, cardFilter, componentFilter]);

    if (cardVariants.length === 0) {
        return (
            <p {...stylex.props(fieldText.message)}>
                No card variants selected — adjust the Card filter.
            </p>
        );
    }

    const totalNodes = cardVariants.length * componentVariants.length;
    const totalPages = Math.max(1, Math.ceil(cardVariants.length / CARDS_PER_PAGE));
    const safePage = Math.min(page, totalPages - 1);
    const pageStart = safePage * CARDS_PER_PAGE;
    const pagedCards = cardVariants.slice(pageStart, pageStart + CARDS_PER_PAGE);
    const renderedNodes = pagedCards.length * componentVariants.length;

    return (
        <Stack direction="vertical" gap="8">
            <p {...stylex.props(fieldText.value)}>
                {cardVariants.length} card variants × {componentVariants.length} component variants
                = {totalNodes} nodes
                {totalPages > 1
                    ? ` · showing cards ${pageStart + 1}–${pageStart + pagedCards.length}, ${renderedNodes} nodes rendered`
                    : null}
            </p>
            {totalPages > 1 ? (
                <nav aria-label="Card pages" {...stylex.props(canvasStyles.pager)}>
                    <button
                        type="button"
                        aria-label="Show previous cards"
                        disabled={safePage === 0}
                        onClick={() => setPage(safePage - 1)}
                    >
                        Previous
                    </button>
                    <span aria-live="polite" {...stylex.props(fieldText.label)}>
                        Page {safePage + 1} of {totalPages}
                    </span>
                    <button
                        type="button"
                        aria-label="Show next cards"
                        disabled={safePage >= totalPages - 1}
                        onClick={() => setPage(safePage + 1)}
                    >
                        Next
                    </button>
                </nav>
            ) : null}
            {componentVariants.length === 0 ? (
                <p {...stylex.props(fieldText.message)}>
                    No component variants selected — adjust the Component filter.
                </p>
            ) : (
                pagedCards.map((card) => (
                    <div key={card.label} {...stylex.props(canvasStyles.cardItem)}>
                        <Card
                            color={card.color}
                            background={card.background}
                            border={card.border}
                            elevation={card.elevation}
                        >
                            <h2>{card.label}</h2>
                            <Stack direction="horizontal" gap="12">
                                {componentVariants.map((variant) => (
                                    <Sample
                                        key={variant.label}
                                        label={variant.label}
                                        color={variant.color}
                                        background={variant.background}
                                        border={variant.border}
                                        elevation={variant.elevation}
                                        defaultChecked
                                    >
                                        {variant.label}
                                    </Sample>
                                ))}
                            </Stack>
                        </Card>
                    </div>
                ))
            )}
        </Stack>
    );
}
