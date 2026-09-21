import { fx, glass } from '@repo/ui/recipes/effects.stylex';
import { focusRing } from '@repo/ui/recipes/interaction.stylex';
import { fieldText } from '@repo/ui/recipes/typography.stylex';
import { colors } from '@repo/ui/tokens/colors.stylex';
import { borderWidth, interaction, radius, space } from '@repo/ui/tokens/layout.stylex';
import { motion } from '@repo/ui/tokens/motion.stylex';
import { shadowColor, shadows } from '@repo/ui/tokens/shadows.stylex';
import { typography } from '@repo/ui/tokens/typography.stylex';
import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useId } from 'react';

import { FAMILIES, type LabFamilyName } from './families';

// Lab probe: a local, deliberately non-tokenized vocabulary for the
// experimental half of the laboratory. These helpers exist ONLY to test
// whether the concepts keep recurring (matte key + LED mark, well + contact
// ring, family chips, instrument rails, light field + glass). None of this
// is an API — it dies if the direction does.

const ledStyles = stylex.create({
    base: {
        flexShrink: 0,
        width: '7px',
        height: '7px',
        borderRadius: radius.full,
        backgroundColor: 'currentColor',
    },
    live: {
        filter: `drop-shadow(0 0 ${fx.glowSubtleBlur} currentColor)`,
    },
    off: {
        opacity: 0.45,
    },
    fill: (color: string) => ({ color }),
});

interface LedProps {
    color: string;
    live?: boolean;
    off?: boolean;
    style?: StyleXStyles;
}

export function Led({ color, live = false, off = false, style }: LedProps) {
    return (
        <span
            aria-hidden
            {...stylex.props(
                ledStyles.base,
                ledStyles.fill(color),
                live ? ledStyles.live : null,
                off ? ledStyles.off : null,
                style,
            )}
        />
    );
}

const keyStyles = stylex.create({
    base: {
        appearance: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: space['2'],
        paddingBlock: space['2'],
        paddingInline: space['3'],
        borderRadius: radius.sm,
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: colors.border,
        backgroundColor: colors.card,
        color: colors.foreground,
        [shadowColor.color]: colors.card,
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightMedium,
        lineHeight: typography.lineHeightTight,
        cursor: interaction.cursorPointer,
        transitionProperty: 'background-color, border-color, box-shadow, transform',
        transitionDuration: motion.durationFast,
        transitionTimingFunction: motion.easingOut,
        transform: {
            default: null,
            ':active': `scale(${interaction.pressScale})`,
        },
        ':hover': {
            boxShadow: shadows.hover,
        },
        ':active': {
            boxShadow: shadows.active,
        },
    },
    hover: (strong: string) => ({
        ':hover': {
            backgroundColor: `color-mix(in oklab, ${colors.card} 86%, ${strong})`,
            borderColor: `color-mix(in oklab, ${strong} 55%, ${colors.border})`,
        },
    }),
    live: (base: string) => ({
        backgroundColor: `color-mix(in oklab, ${base} 12%, ${colors.card})`,
        borderColor: `color-mix(in oklab, ${base} 50%, ${colors.border})`,
    }),
    lead: {
        paddingInline: space['4'],
        fontWeight: typography.fontWeightSemibold,
    },
});

interface KeyProps {
    label: string;
    family?: LabFamilyName;
    live?: boolean;
    lead?: boolean;
    style?: StyleXStyles;
}

// The matte key: a neutral face that carries no fill. Color lives on the LED
// (identity) and on the face only as a faint infusion while hovered or live
// (the family "light" tipping in, never a saturated blob).
export function Key({ label, family, live = false, lead = false, style }: KeyProps) {
    const fam = family ? FAMILIES[family] : null;

    return (
        <button
            type="button"
            {...stylex.props(
                keyStyles.base,
                fam ? keyStyles.hover(fam.strong) : null,
                fam && live ? keyStyles.live(fam.base) : null,
                lead ? keyStyles.lead : null,
                focusRing.base,
                style,
            )}
        >
            {fam ? <Led color={fam.base} live={live} /> : null}
            {label}
        </button>
    );
}

const chipStyles = stylex.create({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: space['1'],
        paddingBlock: '2px',
        paddingInline: space['2'],
        borderRadius: radius.full,
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
    },
    family: (strong: string) => ({
        color: strong,
        borderColor: `color-mix(in oklab, ${strong} 60%, transparent)`,
    }),
    neutral: {
        color: colors.mutedForeground,
        borderColor: colors.border,
    },
});

interface ChipProps {
    label: string;
    family?: LabFamilyName;
    live?: boolean;
    style?: StyleXStyles;
}

// The family chip: the Badge anatomy kept whole (outline pill, mono), but the
// variant is now a "hue = meaning" family carried by stroke + text, with an
// optional LED. This is the expressive parenthesis the rest of the system
// should follow.
export function Chip({ label, family, live = false, style }: ChipProps) {
    const fam = family ? FAMILIES[family] : null;

    return (
        <span
            {...stylex.props(
                chipStyles.base,
                fam ? chipStyles.family(fam.strong) : chipStyles.neutral,
                style,
            )}
        >
            {fam ? <Led color={fam.base} live={live} /> : null}
            {label}
        </span>
    );
}

const fieldStyles = stylex.create({
    col: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['1'],
        flex: 1,
        minWidth: 'fit-content',
    },
    labelRow: {
        display: 'flex',
        alignItems: 'center',
        gap: space['2'],
    },
    well: {
        width: '100%',
        minWidth: 0,
        margin: 0,
        paddingBlock: space['2'],
        paddingInline: space['3'],
        borderRadius: radius.sm,
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: colors.border,
        backgroundColor: colors.input,
        color: colors.foreground,
        [shadowColor.color]: colors.input,
        boxShadow: shadows.sunken,
        outline: 'none',
        ':focus': {
            borderColor: `color-mix(in oklab, ${colors.ring} 55%, ${colors.border})`,
            boxShadow: `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.ring}`,
        },
    },
});

interface LabFieldProps {
    label?: string;
    family?: LabFamilyName;
    live?: boolean;
    placeholder?: string;
    defaultValue?: string;
    style?: StyleXStyles;
}

// A field is a crevasse: one sunken well, one contact ring on focus, no
// family tint on the box. If a field reads a real parameter, its data
// identity sits OUTSIDE the well as a tag + LED — never on the border.
export function LabField({
    label,
    family,
    live = false,
    placeholder = '———',
    defaultValue,
    style,
}: LabFieldProps) {
    const id = useId();
    const fam = family ? FAMILIES[family] : null;

    return (
        <div {...stylex.props(fieldStyles.col, style)}>
            {label || family ? (
                <div {...stylex.props(fieldStyles.labelRow)}>
                    {fam ? <Led color={fam.base} live={live} /> : null}
                    {family ? <Chip label={family} family={family} /> : null}
                    {label ? (
                        <label htmlFor={id} {...stylex.props(fieldText.label)}>
                            {label}
                        </label>
                    ) : null}
                </div>
            ) : null}
            <input
                id={id}
                type="text"
                placeholder={placeholder}
                defaultValue={defaultValue}
                {...stylex.props(fieldStyles.well, fieldText.value)}
            />
        </div>
    );
}

const readoutRowStyles = stylex.create({
    row: {
        display: 'flex',
        alignItems: 'baseline',
        gap: space['2'],
    },
    label: {
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        letterSpacing: typography.letterSpacingWide,
        textTransform: typography.textCaseUppercase,
        color: colors.mutedForeground,
    },
    value: {
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeSm,
        color: colors.foreground,
    },
});

const sceneStyles = stylex.create({
    base: {
        position: 'relative',
        minHeight: '100%',
        borderRadius: radius.lg,
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: colors.border,
        overflow: 'hidden',
    },
    ground: {
        position: 'absolute',
        inset: 0,
        backgroundColor: colors.card,
    },
    bleed: {
        position: 'absolute',
        inset: '-32px',
    },
    ball: (color: string, left: string, top: string, size: string) => ({
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        borderRadius: radius.full,
        backgroundImage: `radial-gradient(circle at 50% 50%, ${color}, transparent 72%)`,
        filter: `blur(${fx.blurLg})`,
    }),
    wash: (color: string) => ({
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(145deg, color-mix(in oklab, ${color} 12%, transparent), transparent 58%)`,
    }),
    wellStrip: {
        position: 'absolute',
        top: space['3'],
        left: space['3'],
        display: 'flex',
        alignItems: 'center',
        gap: space['2'],
        paddingBlock: space['1'],
        paddingInline: space['3'],
        borderRadius: radius.sm,
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: colors.border,
        backgroundColor: colors.card,
        [shadowColor.color]: colors.card,
        boxShadow: shadows.raised,
    },
    glassPane: (color: string) => ({
        position: 'absolute',
        bottom: space['3'],
        right: space['3'],
        display: 'flex',
        alignItems: 'center',
        gap: space['2'],
        paddingBlock: space['3'],
        paddingInline: space['4'],
        borderRadius: radius.md,
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${color} 45%, transparent)`,
        [shadowColor.color]: color,
        backgroundColor: `color-mix(in oklab, ${color} 16%, ${colors.background} 40%)`,
    }),
});

// The under/over scene: a matte well ground, colored Gruvbox light fields
// bleeding beneath, an opaque control strip, and a glass pane floating above
// the light so the blur turns the light beneath into the material above.
export function MaterialScene() {
    const amber = FAMILIES.amber.base;
    const aqua = FAMILIES.aqua.base;
    const violet = FAMILIES.violet.base;

    return (
        <div {...stylex.props(sceneStyles.base)}>
            <div {...stylex.props(sceneStyles.ground)} />
            <div {...stylex.props(sceneStyles.bleed)}>
                <span {...stylex.props(sceneStyles.ball(amber, '6%', '10%', '72%'))} />
                <span {...stylex.props(sceneStyles.ball(aqua, '52%', '44%', '58%'))} />
                <span {...stylex.props(sceneStyles.ball(violet, '28%', '52%', '34%'))} />
            </div>
            <div {...stylex.props(sceneStyles.wash(amber))} />

            <div {...stylex.props(sceneStyles.wellStrip)}>
                <Led color={amber} live />
                <span {...stylex.props(readoutRowStyles.label)}>level</span>
                <span {...stylex.props(readoutRowStyles.value)}>+6.2 dB</span>
            </div>

            <div {...stylex.props(glass.glass, sceneStyles.glassPane(aqua))}>
                <Led color={aqua} live />
                <span {...stylex.props(readoutRowStyles.label)}>monitor</span>
                <span {...stylex.props(readoutRowStyles.value)}>0.620</span>
            </div>
        </div>
    );
}
