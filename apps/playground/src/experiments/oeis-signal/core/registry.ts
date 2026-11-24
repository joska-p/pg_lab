import { naturalsModule } from '../modules/naturals';
import type { Module } from './types';

const modules = { naturals: naturalsModule } satisfies Record<string, Module>;

export type ModuleId = keyof typeof modules;

export function getModule(id: ModuleId): Module {
    return modules[id];
}

export function getAllModules(): readonly Module[] {
    return Object.values(modules);
}
