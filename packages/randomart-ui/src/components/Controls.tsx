import { Stack } from '@repo/ui/components/Stack';

import { AppErrorBoundary } from './AppErrorBoundary';
import { ColorSection } from './controls/ColorSection';
import { GrammarSelect } from './controls/GrammarSelect';
import { Inspector } from './controls/Inspector';
import { OperatorWeights } from './controls/OperatorWeights';
import { PlaybackSection } from './controls/PlaybackSection';
import { PostProcessSection } from './controls/PostProcessSection';
import { PrimaryActions } from './controls/PrimaryActions';
import { SeedSection } from './controls/SeedSection';
import { ShaderSource } from './controls/ShaderSource';
import { StructureSection } from './controls/StructureSection';
import { ErrorReadout } from './ErrorReadout';

/**
 * Single control panel, ordered from the coarse, everyday actions down to the fine controls. Each
 * element lives in its own component so the layout can be rearranged by moving lines here.
 */
export function Controls() {
    return (
        <AppErrorBoundary>
            <Stack gap="6">
                {/* Toy-level: the actions and presets a visitor reaches for first. */}
                <PrimaryActions />
                <GrammarSelect />
                <ColorSection />

                {/* Fine controls: everything needed to hand-tune the artwork. */}
                <SeedSection />
                <OperatorWeights />
                <StructureSection />
                <PostProcessSection />
                <PlaybackSection />
                <Inspector />
                <ShaderSource />

                <ErrorReadout />
            </Stack>
        </AppErrorBoundary>
    );
}
