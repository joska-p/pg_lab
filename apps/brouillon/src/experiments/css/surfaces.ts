import './tokens.css';
import './surfaces.css';

export type ColorNames =
    | 'neutral'
    | 'aurora'
    | 'solder'
    | 'purple'
    | 'amber'
    | 'error'
    | 'aqua'
    | 'orange';

export type SurfaceTint = 'tinted' | 'accented';
export type Elevation = 'sunken' | 'flat' | 'raised';

export function staticClasses({
    color = 'neutral',
    tint = 'accented',
    elevation = 'flat',
}: {
    color?: ColorNames;
    tint?: SurfaceTint;
    elevation?: Elevation;
}): string[] {
    return [
        tint === 'tinted' ? `tinted-${color}` : `accented-${color}`,
        ...(tint === 'tinted' ? ['bg-solid'] : []),
        'border-subtle',
        'rounded',
        `elevation-${elevation}`,
    ];
}

export function dynamicClasses({ disabled = false }: { disabled?: boolean }): string[] {
    return [
        ...(!disabled ? ['pressable', 'hoverable'] : []),
        'focusable',
        ...(disabled ? ['is-disabled'] : []),
    ];
}
