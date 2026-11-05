import { describe, expect, it } from 'vite-plus/test';

import type { Edge, Graph } from '../core/Graph';
import type { Netlist } from '../core/netlist';
import { parseNetlist } from '../core/netlist';
import { solveKirchhoffCircuit } from './KirchhoffSolver';

/** Exécute le solveur sur un netlist et retourne le graphe résolu. */
function solveCircuit(netlist: Netlist, totalCurrent: number): Graph {
    const graph = parseNetlist(netlist);
    solveKirchhoffCircuit(graph, totalCurrent);
    return graph;
}

function edgeCurrent(edge: Edge | undefined): number {
    if (edge === undefined) {
        throw new Error('Arête introuvable dans le graphe.');
    }
    if (edge.current === null) {
        throw new Error("L'arête n'a pas été résolue par le solveur.");
    }
    return edge.current;
}

function edgeVoltage(edge: Edge | undefined): number {
    if (edge === undefined) {
        throw new Error('Arête introuvable dans le graphe.');
    }
    if (edge.voltage === null) {
        throw new Error("L'arête n'a pas été résolue par le solveur.");
    }
    return edge.voltage;
}

describe('solveKirchhoffCircuit', () => {
    it('résout une arête simple (source → puits)', () => {
        // R = 1 Ω, I = 4 A → V = R × I = 4 V.
        const netlist: Netlist = {
            sourceId: 'n1',
            sinkId: 'n2',
            nodes: [{ id: 'n1' }, { id: 'n2' }],
            edges: [{ id: 'e1', from: 'n1', to: 'n2', resistance: 1 }],
        };
        const totalCurrent = 4;

        const graph = solveCircuit(netlist, totalCurrent);

        expect(graph.isFullySolved()).toBe(true);

        const e1 = graph.getEdge('e1');
        expect(edgeCurrent(e1)).toBeCloseTo(totalCurrent);
        expect(edgeVoltage(e1)).toBeCloseTo(totalCurrent * 1);
    });

    it('résout deux arêtes en série (source → intermédiaire → puits)', () => {
        // R1 = 2 Ω, R2 = 4 Ω, I = 3 A.
        // Même courant dans les deux arêtes ; tensions : 6 V et 12 V.
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

        const graph = solveCircuit(netlist, totalCurrent);

        expect(graph.isFullySolved()).toBe(true);

        const e1 = graph.getEdge('e1');
        const e2 = graph.getEdge('e2');
        expect(edgeCurrent(e1)).toBeCloseTo(totalCurrent);
        expect(edgeCurrent(e2)).toBeCloseTo(totalCurrent);
        expect(edgeVoltage(e1)).toBeCloseTo(totalCurrent * 2);
        expect(edgeVoltage(e2)).toBeCloseTo(totalCurrent * 4);
    });

    it('résout deux arêtes en parallèle (source → puits, deux branches)', () => {
        // R1 = 1 Ω, R2 = 2 Ω, I = 6 A.
        // G = 1 + 1/2 = 3/2 S → Req = 2/3 Ω → V = 6 × 2/3 = 4 V.
        // I1 = 4 / 1 = 4 A ; I2 = 4 / 2 = 2 A (somme = 6 A).
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

        const graph = solveCircuit(netlist, totalCurrent);

        expect(graph.isFullySolved()).toBe(true);

        const e1 = graph.getEdge('e1');
        const e2 = graph.getEdge('e2');
        expect(edgeVoltage(e1)).toBeCloseTo(4);
        expect(edgeVoltage(e2)).toBeCloseTo(4);
        expect(edgeCurrent(e1)).toBeCloseTo(4);
        expect(edgeCurrent(e2)).toBeCloseTo(2);
        expect(edgeCurrent(e1) + edgeCurrent(e2)).toBeCloseTo(totalCurrent);
    });

    it("lance une erreur sur une topologie non prise en charge plutôt qu'un résultat non vérifié", () => {
        // Trois arêtes : hors de portée de Slice 1 → doit échouer bruyamment.
        const netlist: Netlist = {
            sourceId: 'n1',
            sinkId: 'n3',
            nodes: [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }],
            edges: [
                { id: 'e1', from: 'n1', to: 'n2', resistance: 1 },
                { id: 'e2', from: 'n2', to: 'n3', resistance: 1 },
                { id: 'e3', from: 'n1', to: 'n3', resistance: 1 },
            ],
        };
        const graph = parseNetlist(netlist);

        expect(() => solveKirchhoffCircuit(graph, 1)).toThrow(/topologie non reconnue/);
        expect(graph.isFullySolved()).toBe(false);
    });
});
