import { describe, expect, it } from 'vite-plus/test';

import type { Netlist } from '../core/netlist';
import { parseNetlist } from '../core/netlist';
import { solveKirchhoffCircuit } from '../solver/KirchhoffSolver';
import { computeGeometry } from './geometryEngine';

/** Résout le netlist puis calcule sa géométrie. */
function solvedGeometry(netlist: Netlist, totalCurrent: number) {
    const graph = parseNetlist(netlist);
    solveKirchhoffCircuit(graph, totalCurrent);
    return computeGeometry(graph);
}

function nodePlacement(result: ReturnType<typeof computeGeometry>, nodeId: string) {
    const placement = result.nodes.get(nodeId);
    if (placement === undefined) {
        throw new Error(`Aucun placement pour le nœud "${nodeId}".`);
    }
    return placement;
}

function edgePlacement(result: ReturnType<typeof computeGeometry>, edgeId: string) {
    const placement = result.edges.get(edgeId);
    if (placement === undefined) {
        throw new Error(`Aucun placement pour l'arête "${edgeId}".`);
    }
    return placement;
}

describe('computeGeometry', () => {
    it("dérive les coordonnées et la taille d'une arête simple de ses potentiels et courant", () => {
        // R = 1 Ω, I = 4 A → V = 4 V. Puits à 0, source à 4 V.
        const netlist: Netlist = {
            sourceId: 'n1',
            sinkId: 'n2',
            nodes: [{ id: 'n1' }, { id: 'n2' }],
            edges: [{ id: 'e1', from: 'n1', to: 'n2', resistance: 1 }],
        };
        const totalCurrent = 4;

        const result = solvedGeometry(netlist, totalCurrent);

        const source = nodePlacement(result, 'n1');
        const sink = nodePlacement(result, 'n2');
        expect(sink.x).toBe(0);
        expect(sink.y).toBe(0);
        expect(sink.potential).toBe(0);
        expect(source.x).toBeCloseTo(4);
        expect(source.y).toBeCloseTo(4);
        expect(source.potential).toBeCloseTo(4);

        const e1 = edgePlacement(result, 'e1');
        expect(e1.current).toBeCloseTo(totalCurrent);
        expect(e1.size).toBeCloseTo(totalCurrent); // côté du carré = courant (R = 1 Ω)
    });

    it('dérive les coordonnées de deux arêtes en série de leurs potentiels', () => {
        // R1 = 2 Ω, R2 = 4 Ω, I = 3 A → V1 = 6 V, V2 = 12 V, total 18 V.
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
        const totalCurrent = 3;

        const result = solvedGeometry(netlist, totalCurrent);

        expect(nodePlacement(result, 'n3')).toMatchObject({ x: 0, y: 0, potential: 0 });
        expect(nodePlacement(result, 'n2')).toMatchObject({ x: 12, y: 12, potential: 12 });
        expect(nodePlacement(result, 'n1')).toMatchObject({ x: 18, y: 18, potential: 18 });

        const e1 = edgePlacement(result, 'e1');
        const e2 = edgePlacement(result, 'e2');
        expect(e1.size).toBeCloseTo(3);
        expect(e2.size).toBeCloseTo(3);
        expect(e1.current).toBeCloseTo(totalCurrent);
        expect(e2.current).toBeCloseTo(totalCurrent);

        // L'écart de position entre les extrémités d'une arête égale sa tension.
        expect(Math.abs(nodePlacement(result, 'n1').x - nodePlacement(result, 'n2').x)).toBeCloseTo(
            6,
        );
        expect(Math.abs(nodePlacement(result, 'n2').x - nodePlacement(result, 'n3').x)).toBeCloseTo(
            12,
        );
    });

    it('dérive les coordonnées et tailles de deux arêtes en parallèle de leurs potentiels et courants', () => {
        // R1 = 1 Ω, R2 = 2 Ω, I = 6 A → V = 4 V sur les deux branches.
        // I1 = 4 A, I2 = 2 A.
        const netlist: Netlist = {
            sourceId: 'n1',
            sinkId: 'n2',
            nodes: [{ id: 'n1' }, { id: 'n2' }],
            edges: [
                { id: 'e1', from: 'n1', to: 'n2', resistance: 1 },
                { id: 'e2', from: 'n1', to: 'n2', resistance: 2 },
            ],
        };
        const totalCurrent = 6;

        const result = solvedGeometry(netlist, totalCurrent);

        expect(nodePlacement(result, 'n2')).toMatchObject({ x: 0, y: 0, potential: 0 });
        expect(nodePlacement(result, 'n1')).toMatchObject({ x: 4, y: 4, potential: 4 });

        const e1 = edgePlacement(result, 'e1');
        const e2 = edgePlacement(result, 'e2');
        expect(e1.size).toBeCloseTo(4);
        expect(e1.current).toBeCloseTo(4);
        expect(e2.size).toBeCloseTo(2);
        expect(e2.current).toBeCloseTo(2);
        expect(e1.size + e2.size).toBeCloseTo(totalCurrent);
    });

    it("lance une erreur si le graphe n'a pas été résolu par le solveur", () => {
        const netlist: Netlist = {
            sourceId: 'n1',
            sinkId: 'n2',
            nodes: [{ id: 'n1' }, { id: 'n2' }],
            edges: [{ id: 'e1', from: 'n1', to: 'n2', resistance: 1 }],
        };
        const graph = parseNetlist(netlist); // non résolu

        expect(() => computeGeometry(graph)).toThrow(/entièrement résolu/);
    });
});
