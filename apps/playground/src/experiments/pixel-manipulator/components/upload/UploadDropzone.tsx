import { palette, radius, space, typography } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { UploadIcon } from './UploadIcon';

interface UploadDropzoneProps {
    isDragging: boolean;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const border = `light-dark(${palette.light2}, ${palette.dark2})`;
const primary = `light-dark(${palette.brightBlue}, ${palette.fadedBlue})`;

const styles = stylex.create({
    label: {
        display: 'block',
        cursor: 'pointer',
        borderRadius: radius.lg,
        border: `2px dashed ${border}`,
        paddingBlock: space['6'],
        paddingInline: space['4'],
        textAlign: 'center',
        transitionProperty: 'border-color, background-color',
        transitionDuration: '200ms',
    },
    labelDragging: {
        borderColor: primary,
        backgroundColor: `color-mix(in srgb, ${primary} 10%, transparent)`,
    },
    text: {
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightMedium,
    },
    textDragging: {
        color: primary,
    },
    helper: {
        marginTop: space['1'],
        fontSize: typography.fontSizeXs,
        opacity: 0.6,
    },
});

function UploadDropzone({
    isDragging,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    inputRef,
    onFileChange,
}: UploadDropzoneProps) {
    return (
        <label
            {...stylex.props(styles.label, isDragging ? styles.labelDragging : null)}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange} hidden />
            <UploadIcon />
            <p {...stylex.props(styles.text, isDragging ? styles.textDragging : null)}>
                {isDragging ? 'Drop to upload' : 'Drop image here or click to browse'}
            </p>
            <p {...stylex.props(styles.helper)}>PNG, JPG, WebP — max 50MB</p>
        </label>
    );
}

export { UploadDropzone };
