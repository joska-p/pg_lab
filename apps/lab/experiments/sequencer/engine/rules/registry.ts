import { collatzRule } from './collatz';
import { fibonacciRule } from './fibonacci';
import { lookAndSayRule } from './lookAndSay';
import { padovanRule } from './padovan';
import { primesRule } from './primes';
import { recamanRule } from './recaman';
import { squareNumbersRule } from './squareNumbers';
import { sternDiatomicRule } from './sternDiatomic';
import { triangularRule } from './triangular';
import type { SequenceRule } from './types';

const initialRules = [
    recamanRule,
    fibonacciRule,
    primesRule,
    triangularRule,
    collatzRule,
    lookAndSayRule,
    padovanRule,
    squareNumbersRule,
    sternDiatomicRule,
] as const;

export type RuleId = (typeof initialRules)[number]['id'];

export type RuleName = (typeof initialRules)[number]['name'];

const allRules: SequenceRule[] = [...initialRules];

export function registerRule(rule: SequenceRule) {
    allRules.push(rule);
}

export { allRules };
