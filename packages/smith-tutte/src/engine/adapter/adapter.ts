import type { Graph, NodeId } from '../core/Graph';
import { computeGeometry } from '../geometry/geometryEngine';

/* ------------------------------------------------------------------ */
/*  Adaptateur — "Qui devient qui ?"                                  */
/*                                                                    */
/*  Assigne une identité géométrique à chaque élément du graphe       */
/*  résolu : pour chaque arête, détermine quels carrés elle génère    */
/*  (1 arête → 2 carrés dans le découpage de Slice 1).                */
/*                                                                    */
/*  L'adaptateur ne calcule aucune géométrie : il n'invente ni        */
/*  coordonnée ni taille. Il lit le solveur (sens haut/bas potentiel, */
/*  résolution) et le moteur géométrique (placements des nœuds) pour  */
/*  établir l'identité des carrés. La mathématique ("où et de quelle  */
/*  taille") reste du ressort de l'interpolateur.                      */
/* ------------------------------------------------------------------ */

/** Extrémité d'une arête, définie par le sens haut-potentiel → bas-potentiel du solveur. */
export type EdgeExtremity = 'high' | 'low';

/**
 * Identité d'un carré généré par une arête.
 *
 * Aucun champ de géométrie (x, y, taille) : ceux-ci appartiennent à l'interpolateur ("où et de
 * quelle taille").
 */
export interface SquareIdentity {
    /** Identifiant stable, dérivé de l'arête d'origine (ex: "e1-c1"). */
    readonly squareId: string;
    /** Arête dont ce carré est issu. */
    readonly edgeId: string;
    /** Extrémité de l'arête à laquelle le carré est rattaché. */
    readonly extremity: EdgeExtremity;
    /** Nœud de cette extrémité. */
    readonly nodeId: NodeId;
    /** Potentiel du nœud, lu dans le moteur géométrique. */
    readonly potential: number;
}

export interface EdgeAdaptation {
    readonly edgeId: string;
    readonly squares: readonly SquareIdentity[];
}

export interface AdaptationResult {
    readonly byEdge: ReadonlyMap<string, EdgeAdaptation>;
    readonly squares: readonly SquareIdentity[];
}

/**
 * Découpe chaque arête résolue en carrés (1 arête → 2 carrés en Slice 1).
 *
 * Un carré est produit pour chaque extrémité de l'arête (haut potentiel, bas potentiel). Les
 * potentiels sont lus dans le résultat du moteur géométrique : l'adaptateur n'invente aucune
 * coordonnée ni taille.
 *
 * @throws Si le graphe n'a pas été entièrement résolu par le solveur.
 */
export function adapt(
    graph: Graph,
    geometry: ReturnType<typeof computeGeometry>,
): AdaptationResult {
    if (!graph.isFullySolved()) {
        throw new Error(
            "Adapter: le graphe doit être entièrement résolu par le solveur avant l'adaptation.",
        );
    }

    const byEdge = new Map<string, EdgeAdaptation>();
    const squares: SquareIdentity[] = [];

    for (const edge of graph.getAllEdges()) {
        const highPlacement = geometry.nodes.get(edge.highVoltageNode.id);
        const lowPlacement = geometry.nodes.get(edge.lowVoltageNode.id);

        if (highPlacement === undefined || lowPlacement === undefined) {
            throw new Error(
                `Adapter: placement géométrique manquant pour les extrémités de l'arête "${edge.id}".`,
            );
        }

        const edgeSquares: SquareIdentity[] = [
            {
                squareId: `${edge.id}-c1`,
                edgeId: edge.id,
                extremity: 'high',
                nodeId: edge.highVoltageNode.id,
                potential: highPlacement.potential,
            },
            {
                squareId: `${edge.id}-c2`,
                edgeId: edge.id,
                extremity: 'low',
                nodeId: edge.lowVoltageNode.id,
                potential: lowPlacement.potential,
            },
        ];

        byEdge.set(edge.id, { edgeId: edge.id, squares: edgeSquares });
        squares.push(...edgeSquares);
    }

    return { byEdge, squares };
}
