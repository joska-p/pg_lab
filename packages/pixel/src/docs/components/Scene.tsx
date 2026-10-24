import { useEffect } from 'react';

import { loadDemoImage } from '../imageLoader';
import {
    useActiveEndPointId,
    useSourceData,
    setSourceData,
    setParamValues,
    useParamValues,
} from '../stores/appStore';
import { EndpointView } from './views/EndpointView';

const CANVAS_SIZE = 200;

function Scene() {
    const activeEndpointId = useActiveEndPointId();
    const sourceData = useSourceData();
    const paramValues = useParamValues();

    useEffect(() => {
        let cancelled = false;

        void loadDemoImage(CANVAS_SIZE).then((image) => {
            if (!cancelled && image) {
                setSourceData(image);
            }
        });

        return () => {
            cancelled = true;
        };
    }, []);

    function handleParamChange(id: string, key: string, value: number) {
        setParamValues({ [`${id}:${key}`]: value });
    }

    return (
        <EndpointView
            activeEndpoint={activeEndpointId}
            sourceData={sourceData}
            paramValues={paramValues}
            onParamChange={handleParamChange}
        />
    );
}

export { Scene };
