import styles from './Stack.module.css';

type Gap = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16';
type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

interface StackProps extends Omit<React.ComponentProps<'div'>, 'style'> {
    direction?: 'vertical' | 'horizontal';
    gap?: Gap;
    justify?: Justify;
    children?: React.ReactNode;
}

const gapClass: Record<Gap, string> = {
    '0': styles['gap-0'],
    '1': styles['gap-1'],
    '2': styles['gap-2'],
    '3': styles['gap-3'],
    '4': styles['gap-4'],
    '5': styles['gap-5'],
    '6': styles['gap-6'],
    '8': styles['gap-8'],
    '10': styles['gap-10'],
    '12': styles['gap-12'],
    '16': styles['gap-16'],
};

const justifyClass: Record<Justify, string> = {
    start: styles['justify-start'],
    center: styles['justify-center'],
    end: styles['justify-end'],
    between: styles['justify-between'],
    around: styles['justify-around'],
    evenly: styles['justify-evenly'],
};

export function Stack({
    direction = 'vertical',
    gap = '3',
    justify = 'start',
    className,
    children,
    ...props
}: StackProps) {
    return (
        <div
            {...props}
            className={[
                styles.base,
                direction === 'vertical' ? styles.vertical : styles.horizontal,
                gapClass[gap],
                justifyClass[justify],
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {children}
        </div>
    );
}
