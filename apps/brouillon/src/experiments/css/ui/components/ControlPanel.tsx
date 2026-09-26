import styles from './ControlPanel.module.css';

interface ControlPanelProps extends Omit<React.ComponentProps<'aside'>, 'style'> {
    title?: string;
    label?: string;
    children?: React.ReactNode;
}

export function ControlPanel({ title, label, children, className, ...props }: ControlPanelProps) {
    return (
        <aside
            {...props}
            aria-label={label ?? title ?? 'control panel'}
            className={[styles.base, className].filter(Boolean).join(' ')}
        >
            {title ? <h2 className="heading-2">{title}</h2> : null}
            {children}
        </aside>
    );
}
