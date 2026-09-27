import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useId, useState } from 'react';

import { layout, radius, space } from '../const.stylex';
import { interactionStyles } from '../interactions.stylex';
import { surface, surfaceStyles } from '../surface.stylex';
import type { Background, Elevation } from '../surface.stylex';
import { colors, tintVars } from '../tint.stylex';
import type { ColorNames } from '../tint.stylex';
import { fieldText } from '../typography.stylex';

const styles = stylex.create({
    row: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: space['3'],
    },
    box: {
        position: 'relative',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: layout.checkboxSize,
        height: layout.checkboxSize,
        borderRadius: radius.sm,
        backgroundColor: surface.background,
        color: surface.foreground,
        [tintVars.background]: surface.background,
    },
    check: {
        width: layout.checkboxMarkSize,
        height: layout.checkboxMarkSize,
    },
    hit: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: layout.controlTouchTarget,
        height: layout.controlTouchTarget,
    },
});

// Coche coloree quand la case est cochee sans fond teinte (variante
// "accented") : le fond reste neutre, c'est la marque qui porte la couleur.
// Statique et enumere comme tintBackground/tintBorder/tintShadow.
const checkedMark = stylex.create({
    neutral: { color: colors.neutral },
    aurora: { color: colors.aurora },
    solder: { color: colors.solder },
    purple: { color: colors.purple },
    amber: { color: colors.amber },
    error: { color: colors.error },
    aqua: { color: colors.aqua },
    orange: { color: colors.orange },
});

interface CheckboxProps extends Omit<React.ComponentProps<'button'>, 'style'> {
    label?: string;
    color?: ColorNames;
    tintBackground?: boolean;
    tintBorder?: boolean;
    tintShadow?: boolean;
    bg?: Background;
    elevation?: Elevation;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    style?: StyleXStyles;
}

export function Checkbox({
    label,
    color = 'neutral',
    tintBackground = true,
    tintBorder = true,
    tintShadow = true,
    bg = 'solid',
    elevation = 'flat',
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled = false,
    id: idProp,
    style,
    onClick,
    ...props
}: CheckboxProps) {
    const id = useId();
    const controlId = idProp ?? id;
    const [internal, setInternal] = useState(defaultChecked);
    const isControlled = checked !== undefined;
    const isOn = isControlled ? checked : internal;

    const compoundButtonStyle = stylex.props(
        styles.box,
        surfaceStyles({
            color,
            background: isOn && tintBackground,
            border: tintBorder,
            shadow: tintShadow,
            bg,
            elevation,
        }),
        isOn && !tintBackground ? checkedMark[color] : null,
        interactionStyles({ disabled }),
        style,
    );

    function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
        onClick?.(event);
        if (event.defaultPrevented || disabled) {
            return;
        }
        const next = !isOn;
        if (!isControlled) {
            setInternal(next);
        }
        onCheckedChange?.(next);
    }

    return (
        <div {...stylex.props(styles.row)}>
            {label ? (
                <label htmlFor={controlId} {...stylex.props(fieldText.label)}>
                    {label}
                </label>
            ) : null}

            <button
                {...props}
                id={controlId}
                type="button"
                role="checkbox"
                aria-checked={isOn}
                onClick={handleClick}
                disabled={disabled}
                {...compoundButtonStyle}
            >
                <span aria-hidden {...stylex.props(styles.hit)} />
                {isOn ? (
                    <svg viewBox="0 0 12 12" aria-hidden {...stylex.props(styles.check)}>
                        <path
                            d="M2 6.4 4.8 9 10 3.2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                ) : null}
            </button>
        </div>
    );
}
