import type { Edge, Graph, Node, NodeId } from '../core/Graph';

/**
 * Une seule arête entre la source et le puits : par la loi des nœuds, tout le courant injecté dans
 * le circuit doit nécessairement passer par cette unique arête, puisqu'il n'existe aucun autre
 * chemin possible.
 */
function solveSingleEdgeCircuit(edge: Edge, totalCurrent: number): void {
    edge.current = totalCurrent;
    edge.voltage = totalCurrent * edge.resistance; // loi d'Ohm : V = R × I
}

/**
 * Deux arêtes reliées en chaîne (source → nœud intermédiaire → puits), sans aucun autre chemin
 * possible entre elles.
 *
 * Loi des nœuds appliquée au nœud intermédiaire : tout courant qui y entre doit en ressortir,
 * puisqu'il n'a que ces deux arêtes pour connexions. Le même courant traverse donc les deux arêtes
 * — seule la tension à leurs bornes s'additionne.
 */
function solveEdgesInSeries(seriesEdges: Edge[], totalCurrent: number): void {
    for (const edge of seriesEdges) {
        edge.current = totalCurrent;
        edge.voltage = totalCurrent * edge.resistance; // loi d'Ohm : V = R × I
    }
}

function nodeSharedBetween(firstEdge: Edge, secondEdge: Edge): Node | null {
    const endpointsOfFirstEdge = [firstEdge.highVoltageNode, firstEdge.lowVoltageNode];
    const endpointsOfSecondEdge = [secondEdge.highVoltageNode, secondEdge.lowVoltageNode];

    return (
        endpointsOfFirstEdge.find((node) =>
            endpointsOfSecondEdge.some((other) => other.id === node.id),
        ) ?? null
    );
}

function otherEndpointOf(edge: Edge, excludedNode: Node): Node {
    return edge.highVoltageNode.id === excludedNode.id ? edge.lowVoltageNode : edge.highVoltageNode;
}

/**
 * Vérifie que les deux arêtes forment bien une chaîne source → intermédiaire → puits, plutôt que de
 * supposer que "deux arêtes" signifie forcément "série" — un câblage parallèle a aussi deux arêtes,
 * mais une topologie différente que ce cas ne sait pas encore résoudre (cf. ROADMAP.md, étape
 * suivante).
 */
function formsSeriesPath(graph: Graph, [firstEdge, secondEdge]: Edge[]): boolean {
    const intermediateNode = nodeSharedBetween(firstEdge, secondEdge);

    if (intermediateNode === null) {
        return false;
    }

    const isTrueIntermediateNode =
        intermediateNode.id !== graph.sourceNode.id && intermediateNode.id !== graph.sinkNode.id;

    if (!isTrueIntermediateNode) {
        return false; // les deux arêtes se rejoignent sur la source ou le puits : c'est du parallèle, pas de la série.
    }

    const remainingEndpoints = new Set([
        otherEndpointOf(firstEdge, intermediateNode).id,
        otherEndpointOf(secondEdge, intermediateNode).id,
    ]);

    return remainingEndpoints.has(graph.sourceNode.id) && remainingEndpoints.has(graph.sinkNode.id);
}

/**
 * Deux arêtes reliant directement les deux mêmes nœuds (source et puits), sans nœud intermédiaire.
 *
 * Loi des mailles : les deux arêtes relient exactement les deux mêmes points, donc elles ont
 * forcément la même tension à leurs bornes — sinon on aurait deux tensions différentes pour le même
 * couple de nœuds, ce qui n'a pas de sens physiquement. Cette tension commune se déduit de la
 * résistance équivalente du couple, puis chaque arête reçoit sa part de courant selon sa propre
 * résistance (loi d'Ohm).
 */
function solveEdgesInParallel(parallelEdges: Edge[], totalCurrent: number): void {
    const sumOfConductances = parallelEdges.reduce((sum, edge) => sum + 1 / edge.resistance, 0);
    const equivalentResistance = 1 / sumOfConductances;
    const sharedVoltage = totalCurrent * equivalentResistance;

    for (const edge of parallelEdges) {
        edge.voltage = sharedVoltage;
        edge.current = sharedVoltage / edge.resistance; // loi d'Ohm : I = V / R
    }
}

function connectsExactly(edge: Edge, expectedEndpointIds: Set<NodeId>): boolean {
    const actualEndpointIds = new Set([edge.highVoltageNode.id, edge.lowVoltageNode.id]);

    return (
        actualEndpointIds.size === expectedEndpointIds.size &&
        [...actualEndpointIds].every((id) => expectedEndpointIds.has(id))
    );
}

/**
 * Vérifie que les deux arêtes relient bien, chacune, exactement la source et le puits — et rien
 * d'autre — plutôt que de supposer que "pas de nœud intermédiaire" suffit à conclure au parallèle.
 */
function formsParallelPair(graph: Graph, [firstEdge, secondEdge]: Edge[]): boolean {
    const expectedEndpoints = new Set([graph.sourceNode.id, graph.sinkNode.id]);

    return (
        connectsExactly(firstEdge, expectedEndpoints) &&
        connectsExactly(secondEdge, expectedEndpoints)
    );
}

/**
 * Résout un graphe électrique : écrit `current` et `voltage` sur chaque arête.
 *
 * Implémentation volontairement incrémentale (cf. ROADMAP.md, Slice 1) : on ne code que les cas
 * déjà couverts par un test avec un résultat calculé à la main. Un graphe plus complexe qu'un cas
 * déjà validé doit échouer bruyamment plutôt que produire un résultat non vérifié.
 *
 * Étape actuelle : arête unique, deux arêtes en série, ou deux arêtes en parallèle.
 */
function solveKirchhoffCircuit(graph: Graph, totalCurrent: number): void {
    const edges = graph.getAllEdges();

    if (edges.length === 1) {
        solveSingleEdgeCircuit(edges[0], totalCurrent);

        return;
    }

    if (edges.length === 2 && formsSeriesPath(graph, edges)) {
        solveEdgesInSeries(edges, totalCurrent);

        return;
    }

    if (edges.length === 2 && formsParallelPair(graph, edges)) {
        solveEdgesInParallel(edges, totalCurrent);

        return;
    }

    throw new Error(
        `KirchhoffSolver ne sait résoudre que les cas "arête unique", "deux arêtes en ` +
            `série" et "deux arêtes en parallèle" pour l'instant (${String(edges.length)} arêtes ` +
            `fournies, topologie non reconnue). Voir ROADMAP.md, Slice 1, étape suivante.`,
    );
}

export { solveKirchhoffCircuit };
