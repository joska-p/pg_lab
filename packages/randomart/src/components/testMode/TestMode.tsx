import { Card } from '@repo/ui/components/Card';
import { fieldText, heading } from '@repo/ui/recipes/typography';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { getOperator, getOperatorKinds, OPERATORS } from '../../core';
import type { Node, OperatorId } from '../../core';
import { Canvas } from './Canvas';

const CARD_SIZE = 180;
const RESOLUTION = 96;

// Mock inputs fed into the argument slots of multi-arity combinators.
const MOCK_TERMINALS: Node[] = [
    { type: 'x', args: {} },
    { type: 'y', args: {} },
    { type: 'radial', args: {} },
    { type: 'sweep', args: {} },
];

function makeOperatorNode(id: OperatorId): Node {
    const operator = getOperator(id);
    const args: Record<string, Node | number> = {};

    for (let i = 0; i < operator.argNames.length; i++) {
        const argName = operator.argNames[i];

        if (!argName) {
            continue;
        }

        if (id === 'const' && argName === 'value') {
            args[argName] = 0.5;
        } else {
            args[argName] = MOCK_TERMINALS[i % MOCK_TERMINALS.length] ?? { type: 'x', args: {} };
        }
    }

    return { type: id, args };
}

// Deterministic and independent of state: build the gallery once.
const OPERATOR_NODES = new Map<OperatorId, Node>(
    (Object.keys(OPERATORS) as OperatorId[]).map((id) => [id, makeOperatorNode(id)]),
);

const styles = stylex.create({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['6'],
        width: '100%',
    },
    category: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
        gap: space['4'],
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: space['3'],
    },
    operatorLabel: {
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightSemibold,
    },
    muted: {
        opacity: 0.7,
    },
    centered: {
        display: 'flex',
        justifyContent: 'center',
    },
});

export function TestMode() {
    const categories = getOperatorKinds();

    return (
        <div {...stylex.props(styles.root)}>
            <h1 {...stylex.props(heading.level1)}>Operator CPU/GPU Compare</h1>

            {categories.map((category) => (
                <section key={category.label} {...stylex.props(styles.category)}>
                    <h2 {...stylex.props(heading.level2)}>{category.label}</h2>
                    <div {...stylex.props(styles.grid)}>
                        {category.operators.map((operator) => {
                            const node = OPERATOR_NODES.get(operator.id);

                            if (!node) {
                                return null;
                            }

                            return (
                                <Card key={operator.id}>
                                    <div {...stylex.props(styles.cardHeader)}>
                                        <span {...stylex.props(styles.operatorLabel)}>
                                            {operator.label}
                                        </span>
                                        <span {...stylex.props(fieldText.value, styles.muted)}>
                                            {operator.id}
                                        </span>
                                    </div>
                                    <div {...stylex.props(styles.centered)}>
                                        <Canvas
                                            node={node}
                                            resolution={RESOLUTION}
                                            sizePx={CARD_SIZE}
                                        />
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
}
