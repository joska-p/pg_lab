import { ControlSection } from '@repo/ui/components/ControlSection';
import { Slider } from '@repo/ui/components/Slider';
import { Text } from '@repo/ui/components/Text';

import { computeMaxIterations } from '../../core/iterationPolicy';
import { setParam, useParams, type FractalParams, type ParamKey } from './store';

interface ParamSlider {
    label: string;
    key: ParamKey;
    min: number;
    max: number;
    step?: number;
}

const ITERATION_SLIDERS: ParamSlider[] = [
    { label: 'Baseline', key: 'iterationBase', min: 20, max: 200, step: 5 },
    { label: 'Iterations / octave', key: 'iterationScale', min: 5, max: 80, step: 1 },
    { label: 'Iteration cap (perf)', key: 'iterationCap', min: 200, max: 3000, step: 50 },
];

const LIGHTING_SLIDERS: ParamSlider[] = [
    { label: 'Pixel epsilon', key: 'pixelEps', min: 0.0005, max: 0.1, step: 0.0005 },
    { label: 'Interior scale', key: 'interiorScale', min: 2.0, max: 25.0, step: 0.5 },
    { label: 'Sun angle', key: 'sunAngle', min: 0, max: 6.283, step: 0.01 },
    { label: 'Bump height', key: 'bumpHeight', min: 1.0, max: 50.0, step: 0.5 },
    { label: 'Ambient light', key: 'ambientLight', min: 0.0, max: 0.8, step: 0.01 },
];

const COLOR_SLIDERS: ParamSlider[] = [
    { label: 'Hue shift', key: 'hueShift', min: 0, max: 6.283, step: 0.01 },
    { label: 'Hue frequency', key: 'hueFrequency', min: 0.01, max: 0.5, step: 0.001 },
    { label: 'Chroma scale', key: 'chromaScale', min: 0.0, max: 0.25, step: 0.005 },
];

interface ParamSliderListProps {
    params: FractalParams;
    sliders: ParamSlider[];
}

function ParamSliderList({ params, sliders }: ParamSliderListProps) {
    return (
        <>
            {sliders.map(({ label, key, min, max, step }) => (
                <Slider
                    key={key}
                    label={label}
                    min={min}
                    max={max}
                    step={step}
                    value={params[key]}
                    onValueChange={(value) => setParam(key, value)}
                />
            ))}
        </>
    );
}

function PerturbationControls() {
    const params = useParams();

    const iterationsHint = [1, 1e3, 1e6]
        .map((z) =>
            computeMaxIterations(
                z,
                params.iterationBase,
                params.iterationScale,
                params.iterationCap,
            ),
        )
        .join(' / ');

    return (
        <>
            <ControlSection title="Iterations">
                <ParamSliderList params={params} sliders={ITERATION_SLIDERS} />
                <Text variant="muted">iterations @ 1 / 1e3 / 1e6 · {iterationsHint}</Text>
            </ControlSection>

            <ControlSection title="Lighting">
                <ParamSliderList params={params} sliders={LIGHTING_SLIDERS} />
            </ControlSection>

            <ControlSection title="Color">
                <ParamSliderList params={params} sliders={COLOR_SLIDERS} />
            </ControlSection>
        </>
    );
}

export { PerturbationControls };
