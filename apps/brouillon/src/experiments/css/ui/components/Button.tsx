import { dynamicClasses, staticClasses } from '../../surfaces';
import type { ColorNames, Elevation, SurfaceTint } from '../../surfaces';

import styles from './Button.module.css';

interface ButtonProps extends Omit<React.ComponentProps<'button'>, 'style'> {
    color?: ColorNames;
    tint?: SurfaceTint;
    elevation?: Elevation;
    disabled?: boolean;
}

export function Button({
    color = 'neutral',
    tint = 'tinted',
    elevation = 'raised',
    disabled = false,
    type = 'button',
    className,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            type={type}
            disabled={disabled}
            className={[
                styles.base,
                ...staticClasses({ color, tint, elevation }),
                ...dynamicClasses({ disabled }),
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {children}
        </button>
    );
}
