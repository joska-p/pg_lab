import { Badge } from '@repo/ui-next/components/Badge';
import { Button } from '@repo/ui-next/components/Button';
import { Card } from '@repo/ui-next/components/Card';
import { Checkbox } from '@repo/ui-next/components/Checkbox';
import { ColorField } from '@repo/ui-next/components/ColorField';
import { Stack } from '@repo/ui-next/components/Stack';
import { useEffect, useState } from 'react';

import { useComponentName } from '../../../stores/appStore';
import { useCardFilter, useComponentFilter } from './variantFilter.store';
import { buildSurfaceVariants } from './variants';

const CARDS_PER_PAGE = 12;

export function DemoCanvas() {
    const registryKey = useComponentName();
    const cardFilter = useCardFilter();
    const componentFilter = useComponentFilter();

    const cardVariants = buildSurfaceVariants(cardFilter);
    const componentVariants = buildSurfaceVariants(componentFilter);

    const [page, setPage] = useState(0);
    useEffect(() => {
        setPage(0);
    }, [registryKey, cardFilter, componentFilter]);

    if (cardVariants.length === 0) {
        return <p>No card variants selected — adjust the Card filter.</p>;
    }

    const totalNodes = cardVariants.length * componentVariants.length;
    const totalPages = Math.max(1, Math.ceil(cardVariants.length / CARDS_PER_PAGE));
    const safePage = Math.min(page, totalPages - 1);
    const pageStart = safePage * CARDS_PER_PAGE;
    const pagedCards = cardVariants.slice(pageStart, pageStart + CARDS_PER_PAGE);
    const renderedNodes = pagedCards.length * componentVariants.length;

    return (
        <Stack direction="vertical" gap="8">
            <p>
                {cardVariants.length} card variants × {componentVariants.length} component variants
                = {totalNodes} nodes
                {totalPages > 1
                    ? ` · showing cards ${pageStart + 1}–${pageStart + pagedCards.length}, ${renderedNodes} nodes rendered`
                    : null}
            </p>
            {totalPages > 1 ? (
                <nav aria-label="Card pages">
                    <Button
                        type="button"
                        background="soft"
                        color="neutral"
                        aria-label="Show previous cards"
                        disabled={safePage === 0}
                        onClick={() => setPage(safePage - 1)}
                    >
                        Previous
                    </Button>
                    <span aria-live="polite">
                        Page {safePage + 1} of {totalPages}
                    </span>
                    <Button
                        type="button"
                        background="soft"
                        color="neutral"
                        aria-label="Show next cards"
                        disabled={safePage >= totalPages - 1}
                        onClick={() => setPage(safePage + 1)}
                    >
                        Next
                    </Button>
                </nav>
            ) : null}
            {componentVariants.length === 0 ? (
                <p>No component variants selected — adjust the Component filter.</p>
            ) : (
                pagedCards.map((card) => (
                    <div key={card.label}>
                        <Card
                            color={card.color}
                            background={card.background}
                            border={card.border}
                            elevation={card.elevation}
                        >
                            <h2>{card.label}</h2>
                            <Stack direction="horizontal" gap="12">
                                {componentVariants.map((variant) => {
                                    switch (registryKey) {
                                        case 'checkbox': {
                                            return (
                                                <Checkbox
                                                    key={variant.label}
                                                    label={variant.label}
                                                    color={variant.color}
                                                    background={variant.background}
                                                    border={variant.border}
                                                    elevation={variant.elevation}
                                                    defaultChecked
                                                />
                                            );
                                        }
                                        case 'button': {
                                            return (
                                                <Button
                                                    key={variant.label}
                                                    color={variant.color}
                                                    background={variant.background}
                                                    border={variant.border}
                                                    elevation={variant.elevation}
                                                >
                                                    {variant.label}
                                                </Button>
                                            );
                                        }
                                        case 'badge': {
                                            return (
                                                <Badge
                                                    key={variant.label}
                                                    color={variant.color}
                                                    background={variant.background}
                                                    border={variant.border}
                                                    elevation={variant.elevation}
                                                >
                                                    {variant.label}
                                                </Badge>
                                            );
                                        }
                                        case 'colorField': {
                                            return (
                                                <ColorField
                                                    key={variant.label}
                                                    label={variant.label}
                                                    live={true}
                                                    color={variant.color}
                                                />
                                            );
                                        }
                                        default: {
                                            return null;
                                        }
                                    }
                                })}
                            </Stack>
                        </Card>
                    </div>
                ))
            )}
        </Stack>
    );
}
