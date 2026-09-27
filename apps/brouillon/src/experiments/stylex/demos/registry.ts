import React from 'react';

import { ButtonMatrix } from './button.demo';
import { CheckboxMatrix } from './checkbox.demo';

export const registry = {
    button: ButtonMatrix,
    checkbox: CheckboxMatrix,
} as const satisfies Record<string, React.ComponentType>;

export type RegistryKey = keyof typeof registry;
export const registryOptions = Object.keys(registry) as RegistryKey[];
