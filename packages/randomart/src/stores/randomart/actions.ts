import { getRule } from '../../core';
import type { BehaviorId, Channel, ColorSpaceId, OperatorId, RuleId } from '../../core';
import { randomartStore } from './store';
import type { Mode, RandomartRecipe } from './store';

// Every action below is a plain synchronous write of owned values. None of
// them touch derived data: channel trees re-derive automatically from the
// config via trees.ts, so no action can leave stale trees behind.
export function setMode(mode: Mode): void {
    randomartStore.setState({ mode });
}

export function setSeedText(seedText: string): void {
    randomartStore.setState({ seedText });
}

export function setMaxDepth(maxDepth: number): void {
    randomartStore.setState({ maxDepth });
}

export function setMinDepth(minDepth: number): void {
    randomartStore.setState({ minDepth });
}

export function setAnimationSpeed(speed: number): void {
    randomartStore.setState({ animationSpeed: speed });
}

export function setColorSpace(colorSpace: ColorSpaceId): void {
    randomartStore.setState({ colorSpace });
}

export function setCorrelatedRGB(correlatedRGB: boolean): void {
    randomartStore.setState({ correlatedRGB });
}

export function selectRule(ruleId: RuleId): void {
    const rule = getRule(ruleId);

    randomartStore.setState({
        selectedRuleId: ruleId,
        customOperatorIds: null,
        minDepth: rule.minDepth,
        maxDepth: rule.maxDepth,
    });
}

export function toggleOperator(operatorId: OperatorId): void {
    const { selectedRuleId, customOperatorIds } = randomartStore.getState();
    const rule = getRule(selectedRuleId);
    const base = customOperatorIds ?? rule.operatorIds;
    const isCurrentlyEnabled = base.includes(operatorId);

    const nextOperatorIds = isCurrentlyEnabled
        ? base.filter((id) => id !== operatorId)
        : [...base, operatorId];

    randomartStore.setState({ customOperatorIds: nextOperatorIds });
}

export function setActiveChannel(channel: Channel): void {
    randomartStore.setState({ activeChannel: channel });
}

export function toggleRunning(): void {
    const { running } = randomartStore.getState();

    randomartStore.setState({ running: !running });
}

export function toggleBehavior(id: BehaviorId): void {
    const { activeBehaviorIds } = randomartStore.getState();
    const isActive = activeBehaviorIds.includes(id);

    const nextBehaviors = isActive
        ? activeBehaviorIds.filter((bId) => bId !== id)
        : [...activeBehaviorIds, id];

    randomartStore.setState({ activeBehaviorIds: nextBehaviors });
}

// Applies a validated recipe (S4 import). Single setState: the trees follow
// from the config on their own. Components must call this — never reach into
// the store module for orchestration.
export function importRecipe(recipe: RandomartRecipe): void {
    randomartStore.setState({ ...recipe });
}
