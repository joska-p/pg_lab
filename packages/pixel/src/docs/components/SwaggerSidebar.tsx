import { useState } from 'react';

import { cn } from '../../lib/cn';
import { isActiveEndpoint } from './data/pipeline-docs-data';
import type { EndpointGroup, EndpointId } from './data/pipeline-docs-data';

interface SwaggerSidebarProps {
    groups: EndpointGroup[];
    activeEndpoint: EndpointId;
    onSelect: (id: EndpointId) => void;
}

const BADGE_CLASSES: Record<string, string> = {
    overview: 'bg-utility-4 text-background',
    pixel: 'bg-utility-6 text-background',
    neighborhood: 'bg-utility-3 text-background',
    global: 'bg-utility-2 text-background',
    pipeline: 'bg-utility-1 text-background',
    internals: 'bg-utility-8 text-background',
};

const BADGE_LABELS: Record<string, string> = {
    overview: 'OVERVIEW',
    pixel: 'PIXEL',
    neighborhood: 'NEIGHBOR',
    global: 'GLOBAL',
    pipeline: 'PIPELINE',
    internals: 'INTERNALS',
};

const TYPE_VAR: Record<string, string> = {
    overview: 'var(--utility-4)',
    pixel: 'var(--utility-6)',
    neighborhood: 'var(--utility-3)',
    global: 'var(--utility-2)',
    pipeline: 'var(--utility-1)',
    internals: 'var(--utility-8)',
};

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
        <nav aria-label="API Endpoints" className="flex h-full flex-col overflow-y-auto p-3">
            <div className="text-foreground mb-4 px-2 text-xs font-bold uppercase opacity-60">
                Endpoints
            </div>
            {groups.map((group) => {
                const isExpanded = expandedGroups[group.label] ?? true;

                return (
                    <div key={group.label} className="mb-1">
                        <button
                            type="button"
                            onClick={() => {
                                toggleGroup(group.label);
                            }}
                            aria-expanded={isExpanded}
                            className="text-foreground/70 hover:text-foreground flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs font-semibold uppercase transition-colors"
                        >
                            <span className="shrink-0 text-xs transition-transform duration-150">
                                {isExpanded ? '▼' : '▶'}
                            </span>
                            {group.label}
                        </button>
                        {isExpanded && (
                            <ul className="ml-1 space-y-0.5">
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

                                    return (
                                        <li key={item.id}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleSelect(item);
                                                }}
                                                aria-current={isActive ? 'page' : undefined}
                                                style={
                                                    {
                                                        '--accent':
                                                            TYPE_VAR[item.type] ??
                                                            'var(--utility-4)',
                                                    } as React.CSSProperties
                                                }
                                                className={cn(
                                                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                                                    isActive
                                                        ? 'bg-accent/20 text-foreground border-l-accent border-l-2 pl-2 font-medium'
                                                        : 'text-foreground/70 hover:bg-muted/50 hover:text-foreground border-l-2 border-l-transparent pl-2',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-xs font-semibold uppercase',
                                                        BADGE_CLASSES[item.type] ??
                                                            'bg-muted text-muted-foreground',
                                                    )}
                                                >
                                                    {BADGE_LABELS[item.type] ?? item.type}
                                                </span>
                                                <span className="truncate">{item.label}</span>
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
