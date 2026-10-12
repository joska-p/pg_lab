import { Button } from '@repo/ui/components/Button';
import { useRef } from 'react';

import { BEHAVIORS, hasRule, OPERATORS } from '../../core';
import type { RuleId } from '../../core';
import { importRecipe } from '../../stores/randomart/actions';
import {
    useActiveBehaviorIds,
    useCorrelatedRGB,
    useCustomOperators,
    useMaxDepth,
    useMinDepth,
    useSeedText,
    useSelectedRuleId,
} from '../../stores/randomart/selectors';
import type { RandomartRecipe } from '../../stores/randomart/store';

// Minimal runtime shape check — not a full schema validator, just enough to
// fail fast on an obviously wrong file rather than crash deep inside
// generateTrees.
function isRandomartRecipe(value: unknown): value is RandomartRecipe {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const v = value as Record<string, unknown>;
    const customOperatorIds = v.customOperatorIds;

    return (
        typeof v.seedText === 'string' &&
        typeof v.selectedRuleId === 'string' &&
        hasRule(v.selectedRuleId as RuleId) &&
        typeof v.minDepth === 'number' &&
        typeof v.maxDepth === 'number' &&
        typeof v.correlatedRGB === 'boolean' &&
        (customOperatorIds === null ||
            (Array.isArray(customOperatorIds) &&
                customOperatorIds.every((id) => typeof id === 'string' && id in OPERATORS))) &&
        Array.isArray(v.activeBehaviorIds) &&
        v.activeBehaviorIds.every((id) => typeof id === 'string' && id in BEHAVIORS)
    );
}

function StateIOButtons() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const seedText = useSeedText();
    const selectedRuleId = useSelectedRuleId();
    const customOperatorIds = useCustomOperators();
    const minDepth = useMinDepth();
    const maxDepth = useMaxDepth();
    const correlatedRGB = useCorrelatedRGB();
    const activeBehaviorIds = useActiveBehaviorIds();

    const recipe: RandomartRecipe = {
        seedText,
        selectedRuleId,
        customOperatorIds,
        minDepth,
        maxDepth,
        correlatedRGB,
        activeBehaviorIds,
    };

    function handleExport() {
        const json = JSON.stringify(recipe, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = url;
        link.download = 'randomart-recipe.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        event.target.value = ''; // allow re-selecting the same file later

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = (loadEvent) => {
            try {
                const text = loadEvent.target?.result;

                if (typeof text !== 'string') {
                    throw new Error('File could not be read as text');
                }

                const parsed: unknown = JSON.parse(text);

                if (!isRandomartRecipe(parsed)) {
                    throw new Error('File does not contain a valid randomart recipe');
                }

                importRecipe(parsed);
            } catch (error) {
                console.error('randomart: failed to import recipe:', error);
            }
        };

        reader.onerror = () => {
            console.error('randomart: failed to read file:', reader.error);
        };

        reader.readAsText(file);
    }

    return (
        <>
            <Button onClick={handleExport}>Export</Button>
            <Button
                onClick={() => {
                    fileInputRef.current?.click();
                }}
            >
                Import
            </Button>
            <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleFileChange}
                hidden
            />
        </>
    );
}

export { StateIOButtons };
