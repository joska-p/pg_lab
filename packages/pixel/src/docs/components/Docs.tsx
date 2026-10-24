import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';
import { useEffect, useState } from 'react';

import { ENDPOINT_GROUPS } from './data/pipeline-docs-data';
import type { EndpointId } from './data/pipeline-docs-data';
import { loadDemoImage } from './helpers';
import { SwaggerSidebar } from './SwaggerSidebar';
import { EndpointView } from './views/EndpointView';

const CANVAS_SIZE = 200;

function Docs() {
    const [activeEndpoint, setActiveEndpoint] = useState<EndpointId>({
        kind: 'overview',
    });
    const [sourceData, setSourceData] = useState<ImageData | null>(null);
    const [paramValues, setParamValues] = useState<Record<string, number>>({});

    useEffect(() => {
        let cancelled = false;

        void loadDemoImage(CANVAS_SIZE).then((image) => {
            if (!cancelled) {
                setSourceData(image);
            }
        });

        return () => {
            cancelled = true;
        };
    }, []);

    function handleParamChange(id: string, key: string, value: number) {
        setParamValues((prev) => ({ ...prev, [`${id}:${key}`]: value }));
    }

    return (
        <ShellWrapper>
            <ExperimentShell
                panel={
                    <ControlPanel title="Pixel API">
                        <SwaggerSidebar
                            groups={ENDPOINT_GROUPS}
                            activeEndpoint={activeEndpoint}
                            onSelect={setActiveEndpoint}
                        />
                    </ControlPanel>
                }
            >
                <Stage label="Pixel">
                    <div style={{ padding: '1.5rem', overflowY: 'auto', height: '100%' }}>
                        <EndpointView
                            activeEndpoint={activeEndpoint}
                            sourceData={sourceData}
                            paramValues={paramValues}
                            onParamChange={handleParamChange}
                        />
                    </div>
                </Stage>
            </ExperimentShell>
        </ShellWrapper>
    );
}

export { Docs };
