import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useId, useState } from 'react';

import { glow } from '../recipes/effects.stylex';
import {
    active,
    disabled as disabledRecipe,
    interactive,
    pressable,
    touch,
} from '../recipes/interaction.stylex';
import { fieldText } from '../recipes/typography.stylex';
import { colors } from '../tokens/colors.stylex';
import { families, type FamilyName } from '../tokens/families.stylex';
import { borderWidth, layout, radius, space } from '../tokens/layout.stylex';
import { shadowColor } from '../tokens/shadows.stylex';

type CheckboxProps = {
    label?: string;
    family?: FamilyName;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    style?: StyleXStyles;
};

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
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: colors.border,
        backgroundColor: colors.muted,
    },

    check: {
        width: layout.checkboxMarkSize,
        height: layout.checkboxMarkSize,
    },

    tint: (color: string) => ({
        [shadowColor.color]: color,
    }),
});

export function Checkbox(props: CheckboxProps) {
    const {
        label,
        family,
        checked,
        defaultChecked = false,
        onCheckedChange,
        disabled,
        id: idProp,
        style,
    } = props;

    const id = useId();
    const controlId = idProp ?? id;
    const [internal, setInternal] = useState(defaultChecked);
    const isControlled = checked !== undefined;
    const isOn = isControlled ? checked : internal;
    const fam = family ? families[family] : null;
    const onFill = fam ? fam.base : colors.ring;

    function handleClick() {
        const next = !isOn;
        if (!isControlled) setInternal(next);
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
                id={controlId}
                type="button"
                role="checkbox"
                aria-checked={isOn}
                onClick={handleClick}
                disabled={disabled}
                {...stylex.props(
                    styles.box,
                    interactive.base,
                    isOn ? active.fill(onFill) : null,
                    isOn ? styles.tint(onFill) : null,
                    isOn ? glow.glowWithPress : pressable.base,
                    disabled ? disabledRecipe.base : null,
                    style,
                )}
            >
                <span aria-hidden {...stylex.props(touch.hit)} />
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
