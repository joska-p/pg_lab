import { Button } from '@repo/ui/components/Button';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Toggle } from '@repo/ui/components/Toggle';

import type { VisualLayer } from '../../core/types';
import { LayerOptionSection } from './LayerOptionSection';

interface LayerRowSectionProps {
    meta: VisualLayer;
    enabled: boolean;
    params: Record<string, unknown>;
    isExpanded: boolean;
    onToggle: () => void;
    onToggleExpand: () => void;
    onParamChange: (key: string, value: unknown) => void;
    onRemove: () => void;
}

export function LayerRowSection({
    meta,
    enabled,
    params,
    isExpanded,
    onToggle,
    onToggleExpand,
    onParamChange,
    onRemove,
}: LayerRowSectionProps) {
    return (
        <ControlSection title={meta.name}>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                    alignItems: 'center',
                }}
            >
                <Toggle
                    checked={enabled}
                    onCheckedChange={() => {
                        onToggle();
                    }}
                    aria-label={`Toggle ${meta.name}`}
                />

                <Button onClick={onToggleExpand} title="Options">
                    …
                </Button>

                <Button onClick={onRemove} title="Remove layer">
                    ×
                </Button>
            </div>

            {isExpanded && (
                <LayerOptionSection params={meta.params} values={params} onChange={onParamChange} />
            )}
        </ControlSection>
    );
}
