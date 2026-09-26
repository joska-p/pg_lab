import { staticClasses } from '../../surfaces';
import type { ColorNames, Elevation, SurfaceTint } from '../../surfaces';

import styles from './Card.module.css';

interface CardProps extends Omit<React.ComponentProps<'div'>, 'style'> {
    elevation?: Elevation;
    color?: ColorNames;
    tint?: SurfaceTint;
    children?: React.ReactNode;
}

export function Card({
    elevation = 'flat',
    color = 'neutral',
    tint = 'accented',
    className,
    children,
    ...props
}: CardProps) {
    return (
        <div
            {...props}
            className={[styles.base, ...staticClasses({ color, elevation, tint }), className]
                .filter(Boolean)
                .join(' ')}
        >
            {children}
        </div>
    );
}
