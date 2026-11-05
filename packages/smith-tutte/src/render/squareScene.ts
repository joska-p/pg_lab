import type { EdgeExtremity, SquareIdentity } from '../engine/adapter/adapter';
import { adapt } from '../engine/adapter/adapter';
import type { Netlist } from '../engine/core/netlist';
import { parseNetlist } from '../engine/core/netlist';
import type { GeometryResult } from '../engine/geometry/geometryEngine';
import { computeGeometry } from '../engine/geometry/geometryEngine';
import type { Easing, InterpolatedGeometry } from '../engine/interpolator/interpolator';
import { interpolateGeometry } from '../engine/interpolator/interpolator';
import { solveKirchhoffCircuit } from '../engine/solver/KirchhoffSolver';

/* ------------------------------------------------------------------ */
/*  Scène de rendu — du netlist aux carrés affichables                */
/* ------------------------------------------------------------------ */

/** Deux états géométriques à interpoler + l'identité des carrés qui en découlent. */
export interface SquareScene {
    readonly from: GeometryResult;
    readonly to: GeometryResult;
    readonly squares: readonly SquareIdentity[];
}

/**
 * Carré prêt à dessiner : position et taille interpolées, identité conservée.
 *
 * `x` / `y` désignent le coin supérieur gauche du carré. Slice 1 ancre le carré sur le nœud de son
 * extrémité ; le décalage éventuel centre-haut appartient à une tranche ultérieure.
 */
export interface SquarePlacement {
    readonly squareId: string;
    readonly extremity: EdgeExtremity;
    readonly x: number;
    readonly y: number;
    readonly size: number;
}

/**
 * Construit la scène de Slice 1 : résout le netlist à deux courants totaux différents, calcule les
 * deux états géométriques, puis demande à l'adaptateur quels carrés existent.
 *
 * Les deux états portent les mêmes ids (même netlist), ce qui autorise l'interpolation.
 */
export function createSquareScene(
    netlist: Netlist,
    fromTotalCurrent: number,
    toTotalCurrent: number,
): SquareScene {
    const fromGraph = parseNetlist(netlist);
    solveKirchhoffCircuit(fromGraph, fromTotalCurrent);
    const from = computeGeometry(fromGraph);

    const toGraph = parseNetlist(netlist);
    solveKirchhoffCircuit(toGraph, toTotalCurrent);
    const to = computeGeometry(toGraph);

    const { squares } = adapt(fromGraph, from);

    return { from, to, squares };
}

/**
 * Calcule les carrés à dessiner pour une progression donnée.
 *
 * La progression vient de la `Clock` de glaze (lue par l'appelant, jamais ici). Position et taille
 * restent dérivées des états géométriques du pipeline : aucun nombre de géométrie n'est codé en
 * dur.
 *
 * @throws Si l'interpolation perd un nœud ou une arête référencé par un carré.
 */
export function placeSquares(
    scene: SquareScene,
    progress: number,
    ease?: Easing,
): readonly SquarePlacement[] {
    const geometry: InterpolatedGeometry = interpolateGeometry(
        scene.from,
        scene.to,
        progress,
        ease,
    );

    return scene.squares.map((square) => {
        const node = geometry.nodes.get(square.nodeId);
        const edge = geometry.edges.get(square.edgeId);

        if (node === undefined || edge === undefined) {
            throw new Error(
                `Renderer: placement introuvable pour le carré "${square.squareId}" ` +
                    `(nœud "${square.nodeId}", arête "${square.edgeId}").`,
            );
        }

        return {
            squareId: square.squareId,
            extremity: square.extremity,
            x: node.x,
            y: node.y,
            size: edge.size,
        };
    });
}
