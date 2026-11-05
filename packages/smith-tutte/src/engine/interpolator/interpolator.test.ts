import { describe, expect, it } from 'vite-plus/test';

import type { Netlist } from '../core/netlist';
import { parseNetlist } from '../core/netlist';
import { computeGeometry } from '../geometry/geometryEngine';
import { solveKirchhoffCircuit } from '../solver/KirchhoffSolver';
import {
    easeInOutQuad,
    easeInQuad,
    easeOutQuad,
    interpolateGeometry,
    lerp,
    linearEase,
} from './interpolator';

/** Résout le netlist puis calcule sa géométrie. */
function solvedGeometry(netlist: Netlist, totalCurrent: number) {
    const graph = parseNetlist(netlist);
    solveKirchhoffCircuit(graph, totalCurrent);
    return computeGeometry(graph);
}

function nodeOf(result: ReturnType<typeof interpolateGeometry>, nodeId: string) {
    const placement = result.nodes.get(nodeId);
    if (placement === undefined) {
        throw new Error(`Aucun placement interpolé pour le nœud "${nodeId}".`);
    }
    return placement;
}

function edgeOf(result: ReturnType<typeof interpolateGeometry>, edgeId: string) {
    const placement = result.edges.get(edgeId);
    if (placement === undefined) {
        throw new Error(`Aucun placement interpolé pour l'arête "${edgeId}".`);
    }
    return placement;
}

/* ------------------------------------------------------------------ */
/*  lerp                                                              */
/* ------------------------------------------------------------------ */

describe('lerp', () => {
    it('retourne `a` à la progression 0 et `b` à la progression 1', () => {
        expect(lerp(0, 10, 0)).toBe(0);
        expect(lerp(0, 10, 1)).toBe(10);
        expect(lerp(4, 8, 0)).toBe(4);
        expect(lerp(4, 8, 1)).toBe(8);
    });

    it('retourne la valeur intermédiaire à la progression 0.5', () => {
        expect(lerp(0, 10, 0.5)).toBe(5);
        expect(lerp(4, 8, 0.5)).toBe(6);
        expect(lerp(-4, 4, 0.5)).toBe(0);
    });

    it('accepte toute progression (extrapolation possible)', () => {
        expect(lerp(0, 10, 0.25)).toBe(2.5);
        expect(lerp(0, 10, 2)).toBe(20);
    });
});

/* ------------------------------------------------------------------ */
/*  Easing                                                            */
/* ------------------------------------------------------------------ */

describe('easing', () => {
    it("linearEase est l'identité", () => {
        expect(linearEase(0)).toBe(0);
        expect(linearEase(0.5)).toBe(0.5);
        expect(linearEase(1)).toBe(1);
    });

    it('easeInQuad accélère en début de progression', () => {
        expect(easeInQuad(0)).toBe(0);
        expect(easeInQuad(0.5)).toBe(0.25);
        expect(easeInQuad(1)).toBe(1);
    });

    it('easeOutQuad décélère en fin de progression', () => {
        expect(easeOutQuad(0)).toBe(0);
        expect(easeOutQuad(0.5)).toBe(0.75);
        expect(easeOutQuad(1)).toBe(1);
    });

    it('easeInOutQuad accélère puis décélère', () => {
        expect(easeInOutQuad(0)).toBe(0);
        expect(easeInOutQuad(0.5)).toBe(0.5);
        expect(easeInOutQuad(1)).toBe(1);
        expect(easeInOutQuad(0.25)).toBeCloseTo(0.125);
        expect(easeInOutQuad(0.75)).toBeCloseTo(0.875);
    });
});

/* ------------------------------------------------------------------ */
/*  Trois cas de T01 : arête simple, série, parallèle                 */
/* ------------------------------------------------------------------ */

describe('interpolateGeometry — cas de T01', () => {
    it('interpole une arête simple entre deux courants (positions et tailles)', () => {
        // R = 1 Ω. I = 4 A → V = 4 V, taille 4.  I = 8 A → V = 8 V, taille 8.
        const netlist: Netlist = {
            sourceId: 'n1',
            sinkId: 'n2',
            nodes: [{ id: 'n1' }, { id: 'n2' }],
            edges: [{ id: 'e1', from: 'n1', to: 'n2', resistance: 1 }],
        };

        const from = solvedGeometry(netlist, 4);
        const to = solvedGeometry(netlist, 8);

        // Progression 0 : état de départ inchangé (dérivé du solveur, jamais en dur).
        const start = interpolateGeometry(from, to, 0);
        expect(nodeOf(start, 'n2')).toMatchObject({ x: 0, y: 0 });
        expect(nodeOf(start, 'n1')).toMatchObject({ x: 4, y: 4 });
        expect(edgeOf(start, 'e1').size).toBeCloseTo(4);

        // Progression 1 : état d'arrivée.
        const end = interpolateGeometry(from, to, 1);
        expect(nodeOf(end, 'n2')).toMatchObject({ x: 0, y: 0 });
        expect(nodeOf(end, 'n1')).toMatchObject({ x: 8, y: 8 });
        expect(edgeOf(end, 'e1').size).toBeCloseTo(8);

        // Progression 0.5 : milieu linéaire des potentiels et des tailles.
        const middle = interpolateGeometry(from, to, 0.5);
        expect(nodeOf(middle, 'n1')).toMatchObject({ x: 6, y: 6 });
        expect(nodeOf(middle, 'n2')).toMatchObject({ x: 0, y: 0 });
        expect(edgeOf(middle, 'e1').size).toBeCloseTo(6);
        // L'écart entre les extrémités suit l'interpolation de la tension.
        expect(Math.abs(nodeOf(middle, 'n1').x - nodeOf(middle, 'n2').x)).toBeCloseTo(6);
    });

    it('interpole deux arêtes en série entre deux courants', () => {
        // R1 = 2 Ω, R2 = 4 Ω. I = 3 A → n3 = 0, n2 = 12, n1 = 18 V ; tailles 3, 3.
        //                         I = 6 A → n3 = 0, n2 = 24, n1 = 36 V ; tailles 6, 6.
        const netlist: Netlist = {
            sourceId: 'n1',
            sinkId: 'n3',
            nodes: [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }],
            edges: [
                { id: 'e1', from: 'n1', to: 'n2', resistance: 2 },
                { id: 'e2', from: 'n2', to: 'n3', resistance: 4 },
            ],
        };

        const from = solvedGeometry(netlist, 3);
        const to = solvedGeometry(netlist, 6);

        const middle = interpolateGeometry(from, to, 0.5);

        expect(nodeOf(middle, 'n3')).toMatchObject({ x: 0, y: 0 });
        expect(nodeOf(middle, 'n2')).toMatchObject({ x: 18, y: 18 });
        expect(nodeOf(middle, 'n1')).toMatchObject({ x: 27, y: 27 });

        // Tailles : (3 + 6) / 2 = 4.5 pour chaque arête.
        expect(edgeOf(middle, 'e1').size).toBeCloseTo(4.5);
        expect(edgeOf(middle, 'e2').size).toBeCloseTo(4.5);

        // Les écarts de position entre extrémités égalent les tensions interpolées.
        expect(Math.abs(nodeOf(middle, 'n1').x - nodeOf(middle, 'n2').x)).toBeCloseTo(9); // (6 + 12) / 2
        expect(Math.abs(nodeOf(middle, 'n2').x - nodeOf(middle, 'n3').x)).toBeCloseTo(18); // (12 + 24) / 2
    });

    it('interpole deux arêtes en parallèle entre deux courants', () => {
        // R1 = 1 Ω, R2 = 2 Ω. I = 6 A  → V = 4 V ; n1 = 4, n2 = 0 ; e1 = 4 A (taille 4), e2 = 2 A (taille 2).
        //                               I = 12 A → V = 8 V ; n1 = 8, n2 = 0 ; e1 = 8 A, e2 = 4 A.
        const netlist: Netlist = {
            sourceId: 'n1',
            sinkId: 'n2',
            nodes: [{ id: 'n1' }, { id: 'n2' }],
            edges: [
                { id: 'e1', from: 'n1', to: 'n2', resistance: 1 },
                { id: 'e2', from: 'n1', to: 'n2', resistance: 2 },
            ],
        };

        const from = solvedGeometry(netlist, 6);
        const to = solvedGeometry(netlist, 12);

        const middle = interpolateGeometry(from, to, 0.5);

        expect(nodeOf(middle, 'n2')).toMatchObject({ x: 0, y: 0 });
        expect(nodeOf(middle, 'n1')).toMatchObject({ x: 6, y: 6 });

        // Courants interpolés : e1 : (4 + 8) / 2 = 6 ; e2 : (2 + 4) / 2 = 3.
        expect(edgeOf(middle, 'e1').size).toBeCloseTo(6);
        expect(edgeOf(middle, 'e2').size).toBeCloseTo(3);
        expect(edgeOf(middle, 'e1').size + edgeOf(middle, 'e2').size).toBeCloseTo(9);
    });
});

/* ------------------------------------------------------------------ */
/*  Easing appliqué à l'interpolation                                 */
/* ------------------------------------------------------------------ */

describe('interpolateGeometry avec easing', () => {
    const netlist: Netlist = {
        sourceId: 'n1',
        sinkId: 'n2',
        nodes: [{ id: 'n1' }, { id: 'n2' }],
        edges: [{ id: 'e1', from: 'n1', to: 'n2', resistance: 1 }],
    };

    const from = solvedGeometry(netlist, 4); // n1 à 4 V
    const to = solvedGeometry(netlist, 8); // n1 à 8 V

    it("applique l'easing fourni à la progression", () => {
        // easeInQuad(0.5) = 0.25 → x = 4 + (8 - 4) * 0.25 = 5.
        const eased = interpolateGeometry(from, to, 0.5, easeInQuad);
        expect(nodeOf(eased, 'n1').x).toBeCloseTo(5);

        // easeOutQuad(0.5) = 0.75 → x = 4 + (8 - 4) * 0.75 = 7.
        const decelerated = interpolateGeometry(from, to, 0.5, easeOutQuad);
        expect(nodeOf(decelerated, 'n1').x).toBeCloseTo(7);
    });

    it('utilise linearEase par défaut sans easing fourni', () => {
        const byDefault = interpolateGeometry(from, to, 0.5);
        const linear = interpolateGeometry(from, to, 0.5, linearEase);
        expect(nodeOf(byDefault, 'n1').x).toBe(nodeOf(linear, 'n1').x);
    });
});

/* ------------------------------------------------------------------ */
/*  Garanties d'intégrité                                             */
/* ------------------------------------------------------------------ */

describe("intégrité de l'interpolation", () => {
    const simple: Netlist = {
        sourceId: 'n1',
        sinkId: 'n2',
        nodes: [{ id: 'n1' }, { id: 'n2' }],
        edges: [{ id: 'e1', from: 'n1', to: 'n2', resistance: 1 }],
    };
    const series: Netlist = {
        sourceId: 'n1',
        sinkId: 'n3',
        nodes: [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }],
        edges: [
            { id: 'e1', from: 'n1', to: 'n2', resistance: 2 },
            { id: 'e2', from: 'n2', to: 'n3', resistance: 4 },
        ],
    };

    it('conserve les identités des nœuds et arêtes interpolés', () => {
        const from = solvedGeometry(simple, 4);
        const to = solvedGeometry(simple, 8);
        const result = interpolateGeometry(from, to, 0.5);

        expect([...result.nodes.keys()]).toEqual(['n1', 'n2']);
        expect([...result.edges.keys()]).toEqual(['e1']);
        for (const placement of result.nodes.values()) {
            expect(placement.nodeId).toBeTruthy();
            expect(Number.isFinite(placement.x)).toBe(true);
            expect(Number.isFinite(placement.y)).toBe(true);
        }
        for (const placement of result.edges.values()) {
            expect(placement.edgeId).toBeTruthy();
            expect(Number.isFinite(placement.size)).toBe(true);
        }
    });

    it('rejette deux états aux ensembles de nœuds différents', () => {
        const from = solvedGeometry(simple, 4);
        const to = solvedGeometry(series, 3);

        expect(() => interpolateGeometry(from, to, 0.5)).toThrow(/mêmes nœuds/);
    });

    it("rejette deux états aux ensembles d'arêtes différents", () => {
        const from = solvedGeometry(simple, 4);
        const other: Netlist = {
            sourceId: 'n1',
            sinkId: 'n2',
            nodes: [{ id: 'n1' }, { id: 'n2' }],
            edges: [
                { id: 'e1', from: 'n1', to: 'n2', resistance: 1 },
                { id: 'e2', from: 'n1', to: 'n2', resistance: 2 },
            ],
        };
        const to = solvedGeometry(other, 6);

        expect(() => interpolateGeometry(from, to, 0.5)).toThrow(/mêmes arêtes/);
    });

    it('rejette une progression non finie', () => {
        const from = solvedGeometry(simple, 4);
        const to = solvedGeometry(simple, 8);

        expect(() => interpolateGeometry(from, to, NaN)).toThrow(/nombre fini/);
        expect(() => interpolateGeometry(from, to, Infinity)).toThrow(/nombre fini/);
    });
});
