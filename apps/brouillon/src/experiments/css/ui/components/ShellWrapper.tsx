import styles from './ShellWrapper.module.css';

interface ShellWrapperProps extends Omit<React.ComponentProps<'div'>, 'style'> {
    children?: React.ReactNode;
}

export function ShellWrapper({ children, className, ...props }: ShellWrapperProps) {
    return (
        <div {...props} className={[styles.base, className].filter(Boolean).join(' ')}>
            {children}
        </div>
    );
}
