import { Badge } from '@repo/ui-next/components/Badge';
import { Button } from '@repo/ui-next/components/Button';
import { Checkbox } from '@repo/ui-next/components/Checkbox';
import type { ComponentType } from 'react';

export const components = {
    button: Button,
    checkbox: Checkbox,
    badge: Badge,
} as const satisfies Record<string, ComponentType>;

export type ComponentName = keyof typeof components;
