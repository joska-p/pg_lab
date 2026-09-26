import { useId, useState } from 'react';

import { Button } from './Button';

import styles from './ExperimentShell.module.css';

interface ExperimentShellProps extends Omit<React.ComponentProps<'div'>, 'style'> {
    children: React.ReactNode;
    panel?: React.ReactNode;
    panelPlacement?: 'docked' | 'floating';
}

export function ExperimentShell({
    children,
    panel,
    panelPlacement = 'docked',
    className,
    ...props
}: ExperimentShellProps) {
    const panelId = useId();
    const [panelVisible, setPanelVisible] = useState(true);

    const isFloating = panelPlacement === 'floating';

    return (
        <div
            {...props}
            className={[
                styles.base,
                'elevation-raised',
                'border-subtle',
                'rounded',
                'accented-neutral',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <div className={styles.stageSlot}>{children}</div>

            {panel && (
                <>
                    <div
                        id={panelId}
                        className={[
                            styles.panel,
                            'elevation-raised',
                            'border-subtle',
                            'rounded',
                            'accented-neutral',
                            isFloating && styles.panelFloating,
                            !panelVisible && styles.hidden,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {panel}
                    </div>

                    <div
                        className={[
                            styles.toggle,
                            isFloating && panelVisible && styles.toggleClearOfFloatingPanel,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        <Button
                            aria-expanded={panelVisible}
                            aria-controls={panelId}
                            onClick={() => setPanelVisible((visible) => !visible)}
                        >
                            {panelVisible ? 'hide panel' : 'show panel'}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
