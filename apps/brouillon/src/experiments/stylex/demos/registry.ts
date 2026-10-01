import { Badge } from '@repo/ui-next/components/Badge';
import { Button } from '@repo/ui-next/components/Button';
import { Checkbox } from '@repo/ui-next/components/Checkbox';
import { ColorField } from '@repo/ui-next/components/ColorField';
import type { ComponentType } from 'react';

export const components = {
    button: Button,
    checkbox: Checkbox,
    badge: Badge,
    colorField: ColorField,
} as const satisfies Record<string, ComponentType>;

export type ComponentName = keyof typeof components;
