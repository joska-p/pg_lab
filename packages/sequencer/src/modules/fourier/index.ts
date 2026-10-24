import { registerRule } from '../../engine/rules/registry';
import { harmonicPathRule } from './harmonicPath';

export function register(): void {
    registerRule(harmonicPathRule);
}
