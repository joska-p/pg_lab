import { describe, expect, it } from 'vite-plus/test';

import type { Graph } from '../core/Graph';
import type { Netlist } from '../core/netlist';
import { parseNetlist } from '../core/netlist';
import { computeGeometry } from '../geometry/geometryEngine';
import { solveKirchhoffCircuit } from '../solver/KirchhoffSolver';
import { adapt } from './adapter';

function resolvedGraph(netlist: Netlist, totalCurrent: number): Graph {
    const graph = parseNetlist(netlist);
    solveKirchhoffCircuit(graph, totalCurrent);
    return graph;
}

/** Exécute le pipeline solveur → géométrie → adaptateur sur un netlist. */
function adapted(netlist: Netlist, totalCurrent: number) {
    const graph = resolvedGraph(netlist, totalCurrent);
    const geometry = computeGeometry(graph);
    return { graph, geometry, result: adapt(graph, geometry) };
}

function squareOf(result: ReturnType<typeof adapt>, squareId: string) {
    const square = result.squares.find((s) => s.squareId === squareId);
    if (square === undefined) {
        throw new Error(`Aucun carré "${squareId}".`);
    }
    return square;
}

describe('adapt', () => {
    it('découpe une arête simple en 2 carrés identifiés par leur extrémité', () => {
        // R = 1 Ω, I = 4 A → V = 4 V. Source n1 à 4 V, puits n2 à 0 V.
        const netlist: Netlist = {
            sourceId: 'n1',
            sinkId: 'n2',
            nodes: [{ id: 'n1' }, { id: 'n2' }],
            edges: [{ id: 'e1', from: 'n1', to: 'n2', resistance: 1 }],
        };
        const { result } = adapted(netlist, 4);

        expect(result.byEdge.size).toBe(1);
        expect(result.squares).toHaveLength(2);

        const high = squareOf(result, 'e1-c1');
        expect(high.edgeId).toBe('e1');
        expect(high.extremity).toBe('high');
        expect(high.nodeId).toBe('n1');
        expect(high.potential).toBeCloseTo(4);

        const low = squareOf(result, 'e1-c2');
        expect(low.edgeId).toBe('e1');
        expect(low.extremity).toBe('low');
        expect(low.nodeId).toBe('n2');
        expect(low.potential).toBeCloseTo(0);

        // L'identité de chaque carré est dérivée de son arête d'origine.
        expect([...result.byEdge.keys()]).toEqual(['e1']);
        expect(result.byEdge.get('e1')!.squares).toHaveLength(2);
    });

    it("découpe chaque arête d'une chaîne en série en 2 carrés aux potentiels des nœuds", () => {
        // R1 = 2 Ω, R2 = 4 Ω, I = 3 A → V1 = 6 V, V2 = 12 V.
        // n3 (puits) = 0 V, n2 = 12 V, n1 (source) = 18 V.
        const netlist: Netlist = {
            sourceId: 'n1',
            sinkId: 'n3',
            nodes: [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }],
            edges: [
                { id: 'e1', from: 'n1', to: 'n2', resistance: 2 },
                { id: 'e2', from: 'n2', to: 'n3', resistance: 4 },
            ],
        };
        const { result } = adapted(netlist, 3);

        expect(result.byEdge.size).toBe(2);
        expect(result.squares).toHaveLength(4);

        const e1high = squareOf(result, 'e1-c1');
        const e1low = squareOf(result, 'e1-c2');
        expect(e1high.potential).toBeCloseTo(18);
        expect(e1low.potential).toBeCloseTo(12);

        const e2high = squareOf(result, 'e2-c1');
        const e2low = squareOf(result, 'e2-c2');
        expect(e2high.potential).toBeCloseTo(12);
        expect(e2low.potential).toBeCloseTo(0);

        // Chaque carré reste accessible depuis l'adaptation de son arête d'origine.
        for (const square of result.squares) {
            expect(result.byEdge.get(square.edgeId)!.squares).toContain(square);
        }
    });

    it("découpe chaque arête d'un montage en parallèle en 2 carrés aux potentiels de bornes", () => {
        // R1 = 1 Ω, R2 = 2 Ω, I = 6 A → V = 4 V sur les deux branches.
        // n1 (source) = 4 V, n2 (puits) = 0 V.
        const netlist: Netlist = {
            sourceId: 'n1',
            sinkId: 'n2',
            nodes: [{ id: 'n1' }, { id: 'n2' }],
            edges: [
                { id: 'e1', from: 'n1', to: 'n2', resistance: 1 },
                { id: 'e2', from: 'n1', to: 'n2', resistance: 2 },
            ],
        };
        const { result } = adapted(netlist, 6);

        expect(result.byEdge.size).toBe(2);
        expect(result.squares).toHaveLength(4);

        for (const edgeId of ['e1', 'e2']) {
            const high = squareOf(result, `${edgeId}-c1`);
            const low = squareOf(result, `${edgeId}-c2`);
            expect(high.edgeId).toBe(edgeId);
            expect(low.edgeId).toBe(edgeId);
            expect(high.potential).toBeCloseTo(4);
            expect(low.potential).toBeCloseTo(0);
        }
    });

    it("garantit l'unicité des identités de carrés", () => {
        const netlist: Netlist = {
            sourceId: 'n1',
            sinkId: 'n3',
            nodes: [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }],
            edges: [
                { id: 'e1', from: 'n1', to: 'n2', resistance: 1 },
                { id: 'e2', from: 'n2', to: 'n3', resistance: 1 },
            ],
        };
        const { result } = adapted(netlist, 2);

        const ids = result.squares.map((s) => s.squareId);
        expect(ids).toEqual(['e1-c1', 'e1-c2', 'e2-c1', 'e2-c2']);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('refuse un graphe non résolu plutôt que de produire des identités non vérifiées', () => {
        const netlist: Netlist = {
            sourceId: 'n1',
            sinkId: 'n2',
            nodes: [{ id: 'n1' }, { id: 'n2' }],
            edges: [{ id: 'e1', from: 'n1', to: 'n2', resistance: 1 }],
        };
        const graph = resolvedGraph(netlist, 4);
        const geometry = computeGeometry(graph);
        const edge = graph.getEdge('e1');
        if (edge === undefined) {
            throw new Error('Arête e1 introuvable.');
        }
        edge.current = null; // invalide la résolution sans toucher au solveur

        expect(() => adapt(graph, geometry)).toThrow(/résolu/);
    });
});
