type NodeId = string;

class Node {
    public readonly id: NodeId;

    constructor(id: NodeId) {
        this.id = id;
    }
}

class Edge {
    /**
     * `null` tant que le solveur n'a pas tourné.
     *
     * Un courant nul est un résultat physiquement valide. Il ne faut donc pas utiliser `0` pour
     * représenter "pas encore calculé".
     */
    public current: number | null = null;
    public voltage: number | null = null;

    public readonly id: string;
    public readonly highVoltageNode: Node;
    public readonly lowVoltageNode: Node;
    public readonly resistance: number;

    constructor(id: string, highVoltageNode: Node, lowVoltageNode: Node, resistance = 1) {
        this.id = id;
        this.highVoltageNode = highVoltageNode;
        this.lowVoltageNode = lowVoltageNode;
        this.resistance = resistance;
    }

    hasBeenSolved(): boolean {
        return this.current !== null;
    }
}

class Graph {
    private readonly nodesById = new Map<NodeId, Node>();
    private readonly edgesById = new Map<string, Edge>();

    public readonly sourceNode: Node;
    public readonly sinkNode: Node;

    constructor(sourceNode: Node, sinkNode: Node) {
        this.sourceNode = sourceNode;
        this.sinkNode = sinkNode;

        this.addNode(sourceNode);
        this.addNode(sinkNode);
    }

    addNode(node: Node): void {
        this.nodesById.set(node.id, node);
    }

    addEdge(edge: Edge): void {
        this.edgesById.set(edge.id, edge);
    }

    getAllNodes(): Node[] {
        return [...this.nodesById.values()];
    }

    getAllEdges(): Edge[] {
        return [...this.edgesById.values()];
    }

    isFullySolved(): boolean {
        return this.getAllEdges().every((edge) => edge.hasBeenSolved());
    }
}

export { Node, Edge, Graph };
export type { NodeId };
