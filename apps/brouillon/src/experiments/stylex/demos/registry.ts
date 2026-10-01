import { Button } from '@repo/ui-next/components/Button';
import { Checkbox } from '@repo/ui-next/components/Checkbox';
import type { ComponentType } from 'react';

export const components = {
    button: Button,
    checkbox: Checkbox,
} as const satisfies Record<string, ComponentType>;

export type ComponentName = keyof typeof components;
