import type { ComponentType } from 'react';

import { Button } from '../ui/components/Button';
import { Checkbox } from '../ui/components/Checkbox';

export const components = {
    button: Button,
    checkbox: Checkbox,
} as const satisfies Record<string, ComponentType>;

export type ComponentName = keyof typeof components;
