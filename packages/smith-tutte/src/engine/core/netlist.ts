import { Edge, Graph, Node } from './Graph';
import type { NodeId } from './Graph';

/* ------------------------------------------------------------------ */
/*  Contrat central — Netlist JSON                                    */
/*                                                                    */
/*  C'est l'unique source de vérité du projet. Tout le reste          */
/*  (solveur, moteur géométrique, renderers) en dérive.               */
/* ------------------------------------------------------------------ */

export type EdgeId = string;

/** Un nœud du graphe électrique. Identifié par son id. */
export interface NetlistNode {
    id: NodeId;
}

/**
 * Une arête (résistance) entre deux nœuds.
 *
 * `from` est le nœud à potentiel plus élevé (côté source), `to` est le nœud à potentiel plus bas
 * (côté puits).
 *
 * `resistance` est optionnelle : lorsqu'elle est absente, elle vaut 1 Ω.
 */
export interface NetlistEdge {
    id: EdgeId;
    from: NodeId;
    to: NodeId;
    resistance?: number;
}

/**
 * Sérialisation complète d'un réseau électrique planaire.
 *
 * - `sourceId` / `sinkId` désignent les bornes nécessaires à Kirchhoff.
 * - `nodes` énumère tous les nœuds (y compris source et puits).
 * - `edges` énumère toutes les branches (dipôles de résistance).
 */
export interface Netlist {
    sourceId: NodeId;
    sinkId: NodeId;
    nodes: NetlistNode[];
    edges: NetlistEdge[];
}

/**
 * Construit un `Graph` (instanciation des classes du domaine) à partir d'un netlist validé.
 *
 * Les nœuds source et puits sont construits en premier, puis les autres nœuds sont ajoutés. Chaque
 * arête référence les instances de `Node` correspondantes.
 */
export function buildGraphFromNetlist(netlist: Netlist): Graph {
    const source = new Node(netlist.sourceId);
    const sink = new Node(netlist.sinkId);
    const graph = new Graph(source, sink);

    const nodesById = new Map<NodeId, Node>([
        [netlist.sourceId, source],
        [netlist.sinkId, sink],
    ]);

    for (const node of netlist.nodes) {
        if (nodesById.has(node.id)) {
            continue; // source et puits déjà créés
        }
        const instance = new Node(node.id);
        nodesById.set(node.id, instance);
        graph.addNode(instance);
    }

    for (const edge of netlist.edges) {
        const fromNode = nodesById.get(edge.from);
        const toNode = nodesById.get(edge.to);

        if (fromNode === undefined) {
            throw new Error(
                `Netlist: arête "${edge.id}" référence un nœud "from" inconnu "${edge.from}".`,
            );
        }
        if (toNode === undefined) {
            throw new Error(
                `Netlist: arête "${edge.id}" référence un nœud "to" inconnu "${edge.to}".`,
            );
        }

        const resistance = edge.resistance ?? 1;
        graph.addEdge(new Edge(edge.id, fromNode, toNode, resistance));
    }

    return graph;
}

/**
 * Valide la cohérence structurelle d'un netlist avant construction.
 *
 * Lève une `Error` descriptive si le contrat n'est pas respecté.
 */
export function validateNetlist(netlist: Netlist): void {
    const nodeIds = new Set(netlist.nodes.map((n) => n.id));

    if (!nodeIds.has(netlist.sourceId)) {
        throw new Error(
            `Netlist: sourceId "${netlist.sourceId}" n'est pas déclaré dans les nodes.`,
        );
    }
    if (!nodeIds.has(netlist.sinkId)) {
        throw new Error(`Netlist: sinkId "${netlist.sinkId}" n'est pas déclaré dans les nodes.`);
    }
    if (netlist.sourceId === netlist.sinkId) {
        throw new Error('Netlist: sourceId et sinkId doivent être différents.');
    }

    const edgeIds = new Set<string>();
    for (const edge of netlist.edges) {
        if (!nodeIds.has(edge.from)) {
            throw new Error(
                `Netlist: arête "${edge.id}" référence un nœud "from" inconnu "${edge.from}".`,
            );
        }
        if (!nodeIds.has(edge.to)) {
            throw new Error(
                `Netlist: arête "${edge.id}" référence un nœud "to" inconnu "${edge.to}".`,
            );
        }
        if (edge.from === edge.to) {
            throw new Error(
                `Netlist: arête "${edge.id}" est une boucle (from === to =="${edge.from}").`,
            );
        }
        if (edgeIds.has(edge.id)) {
            throw new Error(`Netlist: id d'arête dupliqué "${edge.id}".`);
        }
        edgeIds.add(edge.id);

        if (edge.resistance !== undefined && edge.resistance <= 0) {
            throw new Error(
                `Netlist: résistance de l'arête "${edge.id}" doit être strictement positive (${edge.resistance}).`,
            );
        }
    }
}

/** Parse + valide + build en une étape. */
export function parseNetlist(netlist: Netlist): Graph {
    validateNetlist(netlist);
    return buildGraphFromNetlist(netlist);
}
