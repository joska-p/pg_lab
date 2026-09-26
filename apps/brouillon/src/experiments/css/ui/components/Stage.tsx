import styles from './Stage.module.css';

interface StageProps extends Omit<React.ComponentProps<'section'>, 'style'> {
    children?: React.ReactNode;
}

export function Stage({ children, className, ...props }: StageProps) {
    return (
        <section
            {...props}
            className={[styles.base, 'elevation-raised', className].filter(Boolean).join(' ')}
        >
            {children}
        </section>
    );
}
