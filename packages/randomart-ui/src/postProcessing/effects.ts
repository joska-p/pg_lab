import { GRAIN_FRAGMENT_SHADER } from './grain';
import { SMAX_FRAGMENT_SHADER, SMIN_FRAGMENT_SHADER } from './smooth';

export interface PostProcessEffect {
    readonly id: string;
    readonly label: string;
    /** Pass order: lower values run first. */
    readonly order: number;
    readonly fragmentShader: string;
    readonly defaultActive: boolean;
}

export const POST_PROCESS_EFFECTS = [
    {
        id: 'grain',
        label: 'grain',
        order: 10,
        fragmentShader: GRAIN_FRAGMENT_SHADER,
        defaultActive: false,
    },
    {
        id: 'smin',
        label: 'smooth min',
        order: 20,
        fragmentShader: SMIN_FRAGMENT_SHADER,
        defaultActive: false,
    },
    {
        id: 'smax',
        label: 'smooth max',
        order: 30,
        fragmentShader: SMAX_FRAGMENT_SHADER,
        defaultActive: false,
    },
] as const satisfies readonly PostProcessEffect[];

type PostProcessEffectDefinition = (typeof POST_PROCESS_EFFECTS)[number];
export type PostProcessEffectId = PostProcessEffectDefinition['id'];
