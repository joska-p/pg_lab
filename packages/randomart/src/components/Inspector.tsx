import { Button } from '@repo/ui/components/Button';
import { ControlField } from '@repo/ui/components/ControlField';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import type { CSSProperties } from 'react';

import {
    depth,
    formatAddress,
    formatFormula,
    formatNodeLabel,
    getNode,
    nodeCount,
    nodeKey,
} from '../core/expression/index.ts';
import type { Address, Channel, Expression, Node } from '../core/expression/index.ts';
import { RandomArtCanvas } from '../renderer';
import {
    compileNodePreview,
    selectNode,
    useCompiledShader,
    useExpression,
    useSelected,
} from '../stores/appStore';

const CHANNELS: readonly Channel[] = ['r', 'g', 'b'];
const PREVIEW_SIZE = 160;

const monoStyle: CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: '0.75rem',
};

function rowStyle(selected: boolean): CSSProperties {
    return {
        ...monoStyle,
        display: 'inline-block',
        padding: '2px 6px',
        border: 'none',
        borderRadius: 4,
        color: 'inherit',
        textAlign: 'left',
        cursor: 'pointer',
        background: selected ? 'color-mix(in oklab, currentColor 20%, transparent)' : 'transparent',
        fontWeight: selected ? 700 : 400,
    };
}

function resolveNode(expression: Expression, selected: Address | null): Node | null {
    if (selected === null) {
        return null;
    }

    try {
        return getNode(expression, selected);
    } catch {
        return null;
    }
}

interface TreeNodeProps {
    node: Node;
    address: Address;
    selectedKey: string | null;
    onSelect: (address: Address) => void;
}

function TreeNode({ node, address, selectedKey, onSelect }: TreeNodeProps) {
    const isSelected = formatAddress(address) === selectedKey;
    const row = (
        <button
            type="button"
            aria-pressed={isSelected}
            style={rowStyle(isSelected)}
            onClick={() => {
                onSelect(address);
            }}
        >
            {formatNodeLabel(node)}
        </button>
    );

    if (node.inputs.length === 0) {
        return <div style={{ paddingLeft: '1rem' }}>{row}</div>;
    }

    return (
        <details open={address.path.length < 2}>
            <summary style={{ cursor: 'pointer' }}>{row}</summary>
            <div style={{ paddingLeft: '0.75rem' }}>
                {node.inputs.map((child, index) => (
                    <TreeNode
                        key={index}
                        node={child}
                        address={{ channel: address.channel, path: [...address.path, index] }}
                        selectedKey={selectedKey}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </details>
    );
}

export function Inspector() {
    const expression = useExpression();
    const compiled = useCompiledShader();
    const selected = useSelected();
    const selectedNode = resolveNode(expression, selected);
    const selectedKey = selected === null ? null : formatAddress(selected);
    const preview = selectedNode === null ? null : compileNodePreview(selectedNode);

    const { stats } = compiled;

    return (
        <ControlSection title="inspector">
            <Stack gap="3">
                <ControlField label="Compiler">
                    <Text variant="muted">
                        {stats.nodes} nodes → {stats.vertices} vertices • {stats.variables}{' '}
                        variables • {stats.contexts} contexts • {stats.sourceLength} chars
                    </Text>
                </ControlField>

                {CHANNELS.map((channel) => (
                    <ControlField key={channel} label={`Channel ${channel}`}>
                        <TreeNode
                            // New expression → fresh tree (resets which branches are open).
                            key={nodeKey(expression[channel])}
                            node={expression[channel]}
                            address={{ channel, path: [] }}
                            selectedKey={selectedKey}
                            onSelect={selectNode}
                        />
                    </ControlField>
                ))}

                <ControlField label="Selection">
                    {selected !== null && selectedNode !== null && preview !== null ? (
                        <Stack gap="2">
                            <Text variant="muted">
                                {formatAddress(selected)} • depth {depth(selectedNode)} •{' '}
                                {nodeCount(selectedNode)} nodes
                            </Text>
                            <div
                                style={{
                                    ...monoStyle,
                                    maxHeight: '8rem',
                                    overflow: 'auto',
                                    overflowWrap: 'anywhere',
                                }}
                            >
                                {formatFormula(selectedNode)}
                            </div>
                            <div style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}>
                                <RandomArtCanvas
                                    fragmentShader={preview.source}
                                    animated={preview.animated}
                                />
                            </div>
                            <Text variant="muted">
                                Preview: this subtree compiled alone, in the root coordinates (the
                                deformation of its ancestors is ignored), on its own clock at phase
                                0.
                            </Text>
                            <Button
                                onClick={() => {
                                    selectNode(null);
                                }}
                            >
                                Clear selection
                            </Button>
                        </Stack>
                    ) : (
                        <Text variant="muted">Click a node in a tree to inspect it.</Text>
                    )}
                </ControlField>
            </Stack>
        </ControlSection>
    );
}
