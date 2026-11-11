import { maxFeasibleMinDepth, minimumNodes } from '@repo/randomart-core/grammar';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Grid } from '@repo/ui/components/Grid';
import { Slider } from '@repo/ui/components/Slider';

import {
    withMaxDepth,
    withMaxNodes,
    withMinDepth,
    withShareDepth,
} from '../../artwork/grammarEdits';
import { editGrammar, useGrammar } from '../../stores/artworkStore';

/** Slider bounds: keep every slider inside the feasible region of its grammar. */
const MAX_MIN_DEPTH = 8;
const MAX_MAX_DEPTH = 10;
const MAX_NODES = 100;

/** Fine control: depth, node budget and sharing of the generated tree. */
export function StructureSection() {
    const grammar = useGrammar();

    return (
        <ControlSection title="structure">
            <Grid columns="1" gap="2">
                <Slider
                    color="orange"
                    label="min depth"
                    value={grammar.minDepth}
                    min={1}
                    max={maxFeasibleMinDepth(grammar, MAX_MIN_DEPTH)}
                    onValueChange={(value) => {
                        editGrammar((current) => withMinDepth(current, value));
                    }}
                />
                <Slider
                    color="orange"
                    label="max depth"
                    value={grammar.maxDepth}
                    min={1}
                    max={MAX_MAX_DEPTH}
                    onValueChange={(value) => {
                        editGrammar((current) => withMaxDepth(current, value));
                    }}
                />
                <Slider
                    color="orange"
                    label="max nodes"
                    value={grammar.maxNodes}
                    min={minimumNodes(grammar)}
                    max={MAX_NODES}
                    onValueChange={(value) => {
                        editGrammar((current) => withMaxNodes(current, value));
                    }}
                />
                <Slider
                    color="orange"
                    label="share"
                    value={grammar.shareDepth}
                    min={0}
                    max={grammar.maxDepth}
                    onValueChange={(value) => {
                        editGrammar((current) => withShareDepth(current, value));
                    }}
                />
            </Grid>
        </ControlSection>
    );
}
