import { Text } from '@repo/ui/components/Text';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';

import { findManipById } from '../data/pipeline-docs-data';
import type { EndpointId } from '../data/pipeline-docs-data';
import { InternalsView } from './InternalsView';
import { ManipView } from './ManipView';
import { OverviewView } from './OverviewView';
import { PipelineView } from './PipelineView';

interface EndpointViewProps {
    activeEndpoint: EndpointId;
    sourceData: ImageData | null;
    paramValues: Record<string, number>;
    onParamChange: (id: string, key: string, value: number) => void;
}

const styles = stylex.create({
    notFound: {
        paddingBlock: space['6'],
        textAlign: 'center',
        fontSize: typography.fontSizeSm,
        color: `color-mix(in oklab, ${surface.foreground} 50%, transparent)`,
    },
});

function EndpointView({
    activeEndpoint,
    sourceData,
    paramValues,
    onParamChange,
}: EndpointViewProps) {
    if (activeEndpoint.kind === 'overview') {
        return <OverviewView sourceData={sourceData} />;
    }

    if (activeEndpoint.kind === 'pipeline') {
        return <PipelineView id={activeEndpoint.id} sourceData={sourceData} />;
    }

    if (activeEndpoint.kind === 'internals') {
        return <InternalsView id={activeEndpoint.id} />;
    }

    const manip = findManipById(activeEndpoint.id);

    if (!manip) {
        return (
            <div {...stylex.props(styles.notFound)}>
                <Text variant="muted">Endpoint not found</Text>
            </div>
        );
    }

    return (
        <ManipView
            manip={manip}
            sourceData={sourceData}
            paramValues={paramValues}
            onParamChange={onParamChange}
        />
    );
}

export { EndpointView };
