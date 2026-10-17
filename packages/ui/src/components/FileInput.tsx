import * as stylex from '@stylexjs/stylex';
import { useId, useRef } from 'react';

import { interactionStyles } from '../recipes/interactions';
import { surfaceStyles } from '../recipes/surface';
import type { SurfaceProps } from '../recipes/surface';
import { fieldText } from '../recipes/typography';
import { interaction, layout, space, typography } from '../tokens/const.stylex';
import type { LayoutStyle } from '../types';

const styles = stylex.create({
    col: {
        display: 'inline-flex',
        flexDirection: 'column',
        gap: space['2'],
    },
    hiddenInput: {
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: 0,
    },
    button: {
        appearance: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space['2'],
        paddingBlock: space['2'],
        paddingInline: space['4'],
        minHeight: layout.controlTouchTarget,
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightMedium,
        lineHeight: typography.lineHeightTight,
        cursor: 'pointer',
    },
    labelDisabled: {
        opacity: interaction.disabledOpacity,
    },
});

export interface FileInputProps extends SurfaceProps {
    readonly label?: string;
    readonly accept?: string;
    readonly multiple?: boolean;
    readonly disabled?: boolean;
    readonly onFile?: (file: File) => void;
    readonly onFiles?: (files: FileList) => void;
    readonly children?: React.ReactNode;
    readonly style?: LayoutStyle;
    readonly id?: string;
}

export function FileInput({
    label,
    accept,
    multiple = false,
    disabled = false,
    onFile,
    onFiles,
    children = 'Import',
    color = 'neutral',
    background = 'solid',
    border = 'subtle',
    radius = 'md',
    elevation = 'raised',
    style,
    id: idProp,
}: FileInputProps) {
    const id = useId();
    const controlId = idProp ?? id;
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.currentTarget.files;
        if (!fileList || fileList.length === 0) {
            return;
        }

        onFiles?.(fileList);

        const firstFile = fileList[0];
        if (firstFile) {
            onFile?.(firstFile);
        }

        event.currentTarget.value = '';
    };

    return (
        <div {...stylex.props(styles.col, style)}>
            {label ? (
                <label
                    htmlFor={controlId}
                    {...stylex.props(fieldText.label, disabled && styles.labelDisabled)}
                >
                    {label}
                </label>
            ) : null}

            <input
                ref={inputRef}
                id={controlId}
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                onChange={handleChange}
                tabIndex={-1}
                aria-hidden="true"
                {...stylex.props(styles.hiddenInput)}
            />

            <button
                type="button"
                disabled={disabled}
                onClick={handleClick}
                {...stylex.props(
                    styles.button,
                    surfaceStyles({ color, background, border, radius, elevation }),
                    interactionStyles({ disabled }),
                )}
            >
                {children}
            </button>
        </div>
    );
}
