import { GRAIN_FRAGMENT_SHADER } from './grain';

export interface PostProcessEffect {
    readonly id: string;
    readonly label: string;
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
] as const satisfies readonly PostProcessEffect[];

export type PostProcessEffectDefinition = (typeof POST_PROCESS_EFFECTS)[number];
export type PostProcessEffectId = PostProcessEffectDefinition['id'];

export const postProcessEffectsById = new Map<string, PostProcessEffectDefinition>(
    POST_PROCESS_EFFECTS.map((effect) => [effect.id, effect]),
);
