import { Badge } from '@repo/ui/components/Badge';
import { Stack } from '@repo/ui/components/Stack';
import { surfaceStyles } from '@repo/ui/recipes/surface';
import { heading } from '@repo/ui/recipes/typography';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import type { ColorNames } from '@repo/ui/tokens/tint.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { isActiveEndpoint, ENDPOINT_GROUPS } from '../data/pipeline-docs-data';
import type { EndpointId } from '../data/pipeline-docs-data';
import { useActiveEndPointId, setActiveEndPointId } from '../stores/appStore';

const TYPE_COLOR: Record<string, ColorNames> = {
    overview: 'aqua',
    pixel: 'purple',
    neighborhood: 'solder',
    global: 'aurora',
    pipeline: 'amber',
    internals: 'orange',
};

const TYPE_LABEL: Record<string, string> = {
    overview: 'OVERVIEW',
    pixel: 'PIXEL',
    neighborhood: 'NEIGHBOR',
    global: 'GLOBAL',
    pipeline: 'PIPELINE',
    internals: 'INTERNALS',
};

const styles = stylex.create({
    group: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: space['1'],
    },
    groupToggle: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: space['1'],
        paddingInline: space['2'],
        paddingBlock: space['1'],
        borderRadius: '0.375rem',
        cursor: 'pointer',
        appearance: 'none',
        backgroundColor: 'transparent',
        borderWidth: 0,
        color: 'inherit',
        opacity: 0.65,
        transition: 'opacity 120ms',
        ':hover': {
            opacity: 1,
        },
    },
    chevron: {
        fontSize: typography.fontSizeXs,
        transition: 'transform 120ms',
        flexShrink: 0,
    },

    item: {
        display: 'flex',
        alignItems: 'center',
        gap: space['2'],
        width: '100%',
        paddingInline: space['2'],
        paddingBlock: '0.4rem',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        appearance: 'none',
        backgroundColor: 'transparent',
        borderWidth: 0,
        color: 'inherit',
        textAlign: 'left',
        fontSize: typography.fontSizeXs,
        transition: 'background-color 120ms',
        ':hover': {
            backgroundColor: `color-mix(in oklab, ${surface.foreground} 6%, transparent)`,
        },
    },
    itemActive: {
        backgroundColor: `color-mix(in oklab, ${surface.foreground} 10%, transparent)`,
    },
    itemLabel: {
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
});

function Controls() {
    const activeEndpointId = useActiveEndPointId();
    const groups = ENDPOINT_GROUPS;
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(groups.map((group) => [group.label, true])),
    );

    function toggleGroup(label: string) {
        setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
    }

    function handleSelect(item: (typeof groups)[number]['items'][number]) {
        if (item.type === 'overview') {
            setActiveEndPointId({ kind: 'overview' });
        } else if (item.type === 'pipeline') {
            setActiveEndPointId({ kind: 'pipeline', id: item.id as 'resize' | 'chaining' });
        } else if (item.type === 'internals') {
            setActiveEndPointId({ kind: 'internals', id: item.id });
        } else {
            setActiveEndPointId({ kind: 'manip', id: item.id });
        }
    }

    function endpointForItem(item: (typeof groups)[number]['items'][number]): EndpointId {
        if (item.type === 'overview') {
            return { kind: 'overview' };
        }
        if (item.type === 'pipeline') {
            return { kind: 'pipeline', id: item.id as 'resize' | 'chaining' };
        }
        if (item.type === 'internals') {
            return { kind: 'internals', id: item.id };
        }
        return { kind: 'manip', id: item.id };
    }

    return (
        <Stack direction="vertical" gap="6">
            {groups.map((group) => {
                const isExpanded = expandedGroups[group.label] ?? true;

                return (
                    <Stack direction="vertical" gap="2">
                        <button
                            type="button"
                            onClick={() => {
                                toggleGroup(group.label);
                            }}
                            aria-expanded={isExpanded}
                            {...stylex.props(styles.groupToggle)}
                        >
                            <span
                                aria-hidden
                                {...stylex.props(styles.chevron)}
                                style={{
                                    transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                }}
                            >
                                ▼
                            </span>
                            <span {...stylex.props(heading.level3)}>{group.label}</span>
                        </button>

                        {isExpanded && (
                            <Stack direction="vertical" gap="2">
                                {group.items.map((item) => {
                                    const endpointId = endpointForItem(item);
                                    const isActive = isActiveEndpoint(activeEndpointId, endpointId);
                                    const color = TYPE_COLOR[item.type] ?? 'neutral';

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                handleSelect(item);
                                            }}
                                            {...stylex.props(
                                                styles.item,
                                                isActive && styles.itemActive,
                                                isActive &&
                                                    surfaceStyles({
                                                        color,
                                                        background: 'soft',
                                                        border: 'none',
                                                    }),
                                            )}
                                        >
                                            <Badge color={color} background="solid" radius="sm">
                                                {TYPE_LABEL[item.type] ?? item.type.toUpperCase()}
                                            </Badge>
                                            <span {...stylex.props(styles.itemLabel)}>
                                                {item.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </Stack>
                        )}
                    </Stack>
                );
            })}
        </Stack>
    );
}

export { Controls };
