import type { Edge, Graph, NodeId } from '../core/Graph';

/* ------------------------------------------------------------------ */
/*  Moteur géométrique                                                */
/*                                                                    */
/*  Convertit les résultats du solveur Kirchhoff (courants et         */
/*  potentiels) en coordonnées et tailles. Toute la géométrie         */
/*  découle du calcul : aucune coordonnée ni taille n'est codée en    */
/*  dur.                                                              */
/*                                                                    */
/*  Convention (Slice 1) :                                            */
/*  - le potentiel du puits est la référence (0 V) ;                  */
/*  - la position d'un nœud (x, y) dérive directement de son          */
/*    potentiel ;                                                     */
/*  - la taille d'une arête dérive directement du courant qui la      */
/*    traverse (côté du carré associé, R = 1 Ω ⇒ côté = courant).     */
/*                                                                    */
/*  L'axe X sera affiné par le graphe dual dans une tranche          */
/*  ultérieure ; il dérive déjà du potentiel, jamais d'une constante. */
/* ------------------------------------------------------------------ */

export interface NodePlacement {
    readonly nodeId: NodeId;
    readonly x: number;
    readonly y: number;
    readonly potential: number;
}

export interface EdgePlacement {
    readonly edgeId: string;
    readonly size: number;
    readonly current: number;
}

export interface GeometryResult {
    readonly nodes: ReadonlyMap<NodeId, NodePlacement>;
    readonly edges: ReadonlyMap<string, EdgePlacement>;
}

/**
 * Calcule le placement de chaque nœud et la taille de chaque arête à partir des résultats du
 * solveur.
 *
 * Le graphe doit être entièrement résolu, sinon une erreur est levée : le moteur ne produit jamais
 * de géométrie non vérifiée.
 *
 * Les potentiels nodaux se propagent à partir du puits (0 V) en utilisant la chute de tension de
 * chaque arête : `edge.voltage = V(highVoltageNode) - V(lowVoltageNode)`.
 */
export function computeGeometry(graph: Graph): GeometryResult {
    if (!graph.isFullySolved()) {
        throw new Error(
            'GeometryEngine: le graphe doit être entièrement résolu par le solveur avant de calculer la géométrie.',
        );
    }

    const sinkId = graph.sinkNode.id;
    const potentials = new Map<NodeId, number>([[sinkId, 0]]);
    const resolved = new Set<NodeId>([sinkId]);
    const queue: NodeId[] = [sinkId];

    // Adjacence : arêtes incidentes à chaque nœud, avec l'extrémité voisine.
    const incident = new Map<NodeId, { edge: Edge; other: NodeId }[]>();
    for (const node of graph.getAllNodes()) {
        incident.set(node.id, []);
    }
    for (const edge of graph.getAllEdges()) {
        incident.get(edge.highVoltageNode.id)!.push({ edge, other: edge.lowVoltageNode.id });
        incident.get(edge.lowVoltageNode.id)!.push({ edge, other: edge.highVoltageNode.id });
    }

    // Propagation des potentiels à partir du puits (BFS).
    while (queue.length > 0) {
        const currentId = queue.shift()!;
        const currentPotential = potentials.get(currentId)!;

        for (const { edge, other } of incident.get(currentId)!) {
            if (resolved.has(other)) {
                continue;
            }

            const neighborPotential =
                currentId === edge.highVoltageNode.id
                    ? currentPotential - edge.voltage!
                    : currentPotential + edge.voltage!;

            potentials.set(other, neighborPotential);
            resolved.add(other);
            queue.push(other);
        }
    }

    // Chaque nœud du graphe doit avoir un potentiel (graphe connexe).
    const nodes = new Map<NodeId, NodePlacement>();
    for (const node of graph.getAllNodes()) {
        const potential = potentials.get(node.id);
        if (potential === undefined) {
            throw new Error(
                `GeometryEngine: le nœud "${node.id}" est déconnecté du puits, son potentiel est indéterminé.`,
            );
        }

        nodes.set(node.id, {
            nodeId: node.id,
            x: potential,
            y: potential,
            potential,
        });
    }

    // Vérifie que les potentiels propagés respectent chaque chute de tension résolue.
    for (const edge of graph.getAllEdges()) {
        const highPotential = potentials.get(edge.highVoltageNode.id)!;
        const lowPotential = potentials.get(edge.lowVoltageNode.id)!;
        const measuredVoltage = edge.voltage!;
        if (Math.abs(highPotential - lowPotential - measuredVoltage) > 1e-9) {
            throw new Error(
                `GeometryEngine: incohérence entre les potentiels nodaux et la tension de l'arête "${edge.id}".`,
            );
        }
    }

    const edges = new Map<string, EdgePlacement>();
    for (const edge of graph.getAllEdges()) {
        const current = edge.current!;
        edges.set(edge.id, {
            edgeId: edge.id,
            size: Math.abs(current),
            current,
        });
    }

    return { nodes, edges };
}
