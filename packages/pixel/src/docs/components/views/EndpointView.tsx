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
            <div className="text-muted-foreground py-12 text-center text-sm">
                Endpoint not found
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
