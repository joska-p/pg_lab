import type { Netlist } from '../../engine/core/netlist';

export const twoParallelNetlist: Netlist = {
    sourceId: 'n1',
    sinkId: 'n2',
    nodes: [{ id: 'n1' }, { id: 'n2' }],
    edges: [
        { id: 'e1', from: 'n1', to: 'n2', resistance: 1 },
        { id: 'e2', from: 'n1', to: 'n2', resistance: 2 },
    ],
};
