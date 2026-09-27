import React from 'react';

import { ButtonMatrix } from './button.demo';

export const registry = {
    button: ButtonMatrix,
} as const satisfies Record<string, React.ComponentType>;

export type RegistryKey = keyof typeof registry;
export const registryOptions = Object.keys(registry) as RegistryKey[];
