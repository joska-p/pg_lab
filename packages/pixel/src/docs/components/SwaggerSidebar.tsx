import { Badge } from '@repo/ui/components/Badge';
import { surfaceStyles } from '@repo/ui/recipes/surface';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { isActiveEndpoint } from './data/pipeline-docs-data';
import type { EndpointGroup, EndpointId } from './data/pipeline-docs-data';

interface SwaggerSidebarProps {
    groups: EndpointGroup[];
    activeEndpoint: EndpointId;
    onSelect: (id: EndpointId) => void;
}

// Chaque famille d'endpoints est associée à une teinte du système ui.
const ACCENT_BY_TYPE: Record<
    string,
    'neutral' | 'aurora' | 'solder' | 'purple' | 'amber' | 'aqua' | 'orange' | 'error'
> = {
    overview: 'neutral',
    pixel: 'amber',
    neighborhood: 'solder',
    global: 'aqua',
    pipeline: 'aurora',
    internals: 'purple',
};

const BADGE_LABELS: Record<string, string> = {
    overview: 'OVERVIEW',
    pixel: 'PIXEL',
    neighborhood: 'NEIGHBOR',
    global: 'GLOBAL',
    pipeline: 'PIPELINE',
    internals: 'INTERNALS',
};

const styles = stylex.create({
    nav: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        paddingBlock: space['3'],
        paddingInline: space['2'],
    },
    heading: {
        marginBottom: space['4'],
        paddingInline: space['2'],
        fontSize: typography.fontSizeXs,
        fontWeight: typography.fontWeightBold,
        letterSpacing: typography.letterSpacingWide,
        textTransform: 'uppercase',
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
    },
    group: {
        marginBottom: space['1'],
    },
    groupButton: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: space['2'],
        paddingBlock: space['2'],
        paddingInline: space['2'],
        borderRadius: '6px',
        textAlign: 'left',
        fontSize: typography.fontSizeXs,
        fontWeight: typography.fontWeightSemibold,
        letterSpacing: typography.letterSpacingWide,
        textTransform: 'uppercase',
        color: `color-mix(in oklab, ${surface.foreground} 70%, transparent)`,
        cursor: 'pointer',
    },
    groupButtonHover: {
        color: surface.foreground,
    },
    itemsList: {
        marginLeft: space['1'],
        display: 'flex',
        flexDirection: 'column',
        gap: space['1'],
    },
    item: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: space['2'],
        paddingBlock: space['2'],
        paddingInline: space['2'],
        borderRadius: '6px',
        textAlign: 'left',
        fontSize: typography.fontSizeSm,
        color: `color-mix(in oklab, ${surface.foreground} 70%, transparent)`,
        cursor: 'pointer',
    },
    itemActive: {
        backgroundColor: `color-mix(in oklab, ${surface.foreground} 12%, transparent)`,
        color: surface.foreground,
        fontWeight: typography.fontWeightMedium,
    },
    itemLabel: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    arrow: {
        flexShrink: 0,
        fontSize: typography.fontSizeXs,
    },
});

function SwaggerSidebar({ groups, activeEndpoint, onSelect }: SwaggerSidebarProps) {
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(groups.map((group) => [group.label, true])),
    );

    function toggleGroup(label: string) {
        setExpandedGroups((previousState) => ({
            ...previousState,
            [label]: !previousState[label],
        }));
    }

    function handleSelect(item: (typeof groups)[number]['items'][number]) {
        if (item.type === 'overview') {
            onSelect({ kind: 'overview' });
        } else if (item.type === 'pipeline') {
            onSelect({ kind: 'pipeline', id: item.id as 'resize' | 'chaining' });
        } else if (item.type === 'internals') {
            onSelect({ kind: 'internals', id: item.id });
        } else {
            onSelect({ kind: 'manip', id: item.id });
        }
    }

    return (
        <nav aria-label="API Endpoints" {...stylex.props(styles.nav)}>
            <div {...stylex.props(styles.heading)}>Endpoints</div>
            {groups.map((group) => {
                const isExpanded = expandedGroups[group.label] ?? true;

                return (
                    <div key={group.label} {...stylex.props(styles.group)}>
                        <button
                            type="button"
                            onClick={() => {
                                toggleGroup(group.label);
                            }}
                            aria-expanded={isExpanded}
                            {...stylex.props(
                                styles.groupButton,
                                isExpanded && styles.groupButtonHover,
                            )}
                        >
                            <span {...stylex.props(styles.arrow)}>{isExpanded ? '▼' : '▶'}</span>
                            {group.label}
                        </button>
                        {isExpanded && (
                            <ul {...stylex.props(styles.itemsList)}>
                                {group.items.map((item) => {
                                    const isActive = isActiveEndpoint(
                                        activeEndpoint,
                                        item.type === 'overview'
                                            ? {
                                                  kind: 'overview',
                                              }
                                            : item.type === 'pipeline'
                                              ? {
                                                    kind: 'pipeline',
                                                    id: item.id as 'resize' | 'chaining',
                                                }
                                              : item.type === 'internals'
                                                ? {
                                                      kind: 'internals',
                                                      id: item.id,
                                                  }
                                                : {
                                                      kind: 'manip',
                                                      id: item.id,
                                                  },
                                    );

                                    const itemColor = ACCENT_BY_TYPE[item.type] ?? 'neutral';

                                    return (
                                        <li key={item.id}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleSelect(item);
                                                }}
                                                aria-current={isActive ? 'page' : undefined}
                                                {...stylex.props(
                                                    styles.item,
                                                    isActive && styles.itemActive,
                                                    surfaceStyles({
                                                        color: itemColor,
                                                        background: isActive ? 'soft' : 'none',
                                                        border: 'strong',
                                                    }),
                                                )}
                                            >
                                                <Badge
                                                    color={itemColor}
                                                    background="solid"
                                                    radius="full"
                                                >
                                                    {BADGE_LABELS[item.type] ?? item.type}
                                                </Badge>
                                                <span {...stylex.props(styles.itemLabel)}>
                                                    {item.label}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}

export { SwaggerSidebar };
