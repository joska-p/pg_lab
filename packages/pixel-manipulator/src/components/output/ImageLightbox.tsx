import { palette, space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { useEscapeKey } from '../../hooks/useEscapeKey';
import { Output } from './Output';

const overlayBg = `light-dark(${palette.light0Hard}, ${palette.dark0})`;

const styles = stylex.create({
    backdrop: {
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `color-mix(in srgb, ${overlayBg} 80%, transparent)`,
    },
    content: {
        position: 'relative',
        maxWidth: '90vw',
        maxHeight: '90vh',
    },
    closeButton: {
        position: 'absolute',
        top: '-12px',
        right: '-12px',
        width: space['8'],
        height: space['8'],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '9999px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
});

interface ImageLightboxProps {
    imageData: ImageData;
    onClose: () => void;
}

function ImageLightbox({ imageData, onClose }: ImageLightboxProps) {
    useEscapeKey(onClose);

    return (
        <div {...stylex.props(styles.backdrop)} onClick={onClose} role="dialog" aria-modal="true">
            <div
                {...stylex.props(styles.content)}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <button {...stylex.props(styles.closeButton)} onClick={onClose} aria-label="Close">
                    ✕
                </button>
                <Output imageData={imageData} />
            </div>
        </div>
    );
}

export { ImageLightbox };
export type { ImageLightboxProps };
