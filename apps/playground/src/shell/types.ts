import type { StageProps } from '@repo/ui/components/ExperimentShell';
import type { ColorNames } from '@repo/ui/tokens/tint.stylex';
import type { ComponentType } from 'react';

export interface ExperimentMetadata {
    readonly label: string;
    readonly summary: string;
    readonly tint: ColorNames;
    readonly mark: string;
    readonly stageLabel?: string;
    readonly panelTitle?: string;
    readonly isHome?: boolean;
    readonly stageProps?: StageProps;
}

export interface SceneModule {
    Scene: ComponentType;
}

export interface ControlsModule {
    Controls: ComponentType;
}
