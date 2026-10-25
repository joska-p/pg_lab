import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';
import { useEffect } from 'react';

import { raduImgUrlById } from '../assets/raduImgUrls';
import { labelToColorMap } from '../constants';
import { getDrawingLabels, getSamplesByStudents } from '../core/api';
import type { Drawing } from '../core/types';
import { setSelectedDrawingId, useScrollTargetId, useSelectedDrawingId } from '../stores/selection';

const styles = stylex.create({
    root: {
        height: '100%',
        minHeight: 0,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: space['4'],
    },
    row: {
        display: 'grid',
        alignItems: 'center',
        gap: space['2'],
    },
    studentName: {
        color: 'inherit',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        margin: 0,
    },
    card: {
        cursor: 'pointer',
        borderStyle: 'solid',
        borderRadius: '6px',
        borderWidth: '2px',
    },
    image: {
        width: '100%',
        aspectRatio: '1 / 1',
        objectFit: 'cover',
        display: 'block',
    },
});

const students = getSamplesByStudents();
const columnCount = getDrawingLabels().length + 1;

function StudentRow({ name, drawings }: { name: string; drawings: Drawing[] }) {
    const selectedDrawingId = useSelectedDrawingId();

    return (
        <div
            {...stylex.props(styles.row)}
            style={{ gridTemplateColumns: `repeat(${String(columnCount)}, minmax(0, 1fr))` }}
        >
            <h3 {...stylex.props(styles.studentName)}>{name}</h3>
            {drawings.map((drawing) => {
                const isSelected = selectedDrawingId === drawing.id;
                return (
                    <div
                        key={drawing.id}
                        data-drawing-id={String(drawing.id)}
                        data-label={drawing.label}
                        onClick={() => {
                            setSelectedDrawingId(drawing.id);
                        }}
                        {...stylex.props(styles.card)}
                        style={{
                            borderColor: isSelected
                                ? labelToColorMap[drawing.label]
                                : 'transparent',
                        }}
                    >
                        <img
                            loading="lazy"
                            alt={drawing.label}
                            src={raduImgUrlById[drawing.id]}
                            {...stylex.props(styles.image)}
                        />
                    </div>
                );
            })}
        </div>
    );
}

function Scene() {
    const scrollTargetId = useScrollTargetId();

    useEffect(() => {
        if (scrollTargetId === null) {
            return;
        }

        const drawingElement = document.querySelector(
            `[data-drawing-id="${String(scrollTargetId)}"]`,
        );

        if (drawingElement) {
            drawingElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
            });
        }
    }, [scrollTargetId]);

    return (
        <div {...stylex.props(styles.root)}>
            {Object.values(students).map((student) => (
                <StudentRow key={student.id} name={student.name} drawings={student.drawings} />
            ))}
        </div>
    );
}

export { Scene };
