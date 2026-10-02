import * as stylex from '@stylexjs/stylex';
import { useId } from 'react';

import { interactionStyles } from '../recipes/interactions';
import { surfaceStyles } from '../recipes/surface';
import type { SurfaceProps } from '../recipes/surface';
import { fieldText } from '../recipes/typography';
import { interaction, layout, space } from '../tokens/const.stylex';
import type { LayoutStyle } from '../types';

// Masque alpha pur : le SVG est entièrement blanc opaque (fill seul, pas de stroke coloré),
// donc le masque découpe la forme et laisse backgroundColor — c'est-à-dire `currentColor`
// du contexte de surface — fournir la teinte. Pas de couleur hardcodée dans l'URL.
const CHECK_MASK =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2 6.4 4.8 9 10 3.2' fill='none' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";

const styles = stylex.create({
    row: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: space['3'],
    },
    input: {
        appearance: 'none',
        position: 'relative',
        flexShrink: 0,
        margin: 0,
        padding: 0,
        width: layout.checkboxSize,
        height: layout.checkboxSize,

        // Zone de clic élargie (le pseudo-élément fait partie de l'input, donc cliquable).
        '::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: layout.controlTouchTarget,
            height: layout.controlTouchTarget,
        },

        // Coche : toujours présente, mais colorée seulement quand :checked.
        '::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: layout.checkboxMarkSize,
            height: layout.checkboxMarkSize,
            pointerEvents: 'none',
            backgroundColor: {
                default: 'transparent',
                ':checked': 'currentColor',
            },
            maskImage: CHECK_MASK,
            WebkitMaskImage: CHECK_MASK,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
        },
    },
    labelDisabled: {
        opacity: interaction.disabledOpacity,
    },
});

interface CheckboxProps
    extends
        Omit<React.ComponentProps<'input'>, 'style' | 'className' | 'color' | 'type' | 'onChange'>,
        SurfaceProps {
    label?: string;
    onCheckedChange?: (checked: boolean) => void;
    style?: LayoutStyle;
}

export function Checkbox({
    label,
    color = 'neutral',
    background = 'solid',
    border = 'strong',
    radius = 'sm',
    elevation = 'flat',
    checked,
    defaultChecked,
    onCheckedChange,
    disabled = false,
    id: idProp,
    style,
    ...props
}: CheckboxProps) {
    const id = useId();
    const controlId = idProp ?? id;

    return (
        <div {...stylex.props(styles.row)}>
            {label && (
                <label
                    htmlFor={controlId}
                    {...stylex.props(fieldText.label, disabled && styles.labelDisabled)}
                >
                    {label}
                </label>
            )}

            <input
                {...props}
                id={controlId}
                type="checkbox"
                checked={checked}
                defaultChecked={defaultChecked}
                disabled={disabled}
                onChange={(event) => onCheckedChange?.(event.target.checked)}
                {...stylex.props(
                    styles.input,
                    surfaceStyles({ color, background, border, radius, elevation }),
                    interactionStyles({ disabled }),
                    style,
                )}
            />
        </div>
    );
}
