import type { ComponentType } from 'react';

import { Button } from '../ui/components/Button';
import { Checkbox } from '../ui/components/Checkbox';

export const registry = {
    button: Button,
    checkbox: Checkbox,
} as const satisfies Record<string, ComponentType>;

export type RegistryKey = keyof typeof registry;
export const registryOptions = Object.keys(registry) as RegistryKey[];
