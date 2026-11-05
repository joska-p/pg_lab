import type { GeometryResult } from '../geometry/geometryEngine';

/* ------------------------------------------------------------------ */
/*  Interpolateur — piloté par la progression de la `Clock` de glaze  */
/*                                                                    */
/*  À un instant donné (progression 0 → 1), calcule les positions et   */
/*  tailles intermédiaires entre deux états géométriques.             */
/*                                                                    */
/*  Il ne connaît rien au graphe électrique : il manipule des nombres */
/*  purs. Il ne lit pas la `Clock` directement : la progression lui   */
/*  est fournie en paramètre par l'appelant (renderer, T05).          */
/* ------------------------------------------------------------------ */

export interface InterpolatedNodePlacement {
    readonly nodeId: string;
    readonly x: number;
    readonly y: number;
}

export interface InterpolatedEdgePlacement {
    readonly edgeId: string;
    readonly size: number;
}

export interface InterpolatedGeometry {
    readonly nodes: ReadonlyMap<string, InterpolatedNodePlacement>;
    readonly edges: ReadonlyMap<string, InterpolatedEdgePlacement>;
}

/** Fonction d'easing : transforme une progression brute en progression appliquée. */
export type Easing = (progress: number) => number;

/** Linéaire : pas d'easing. Valeur par défaut de l'interpolateur. */
export const linearEase: Easing = (t) => t;

/** Accélération quadratique. */
export const easeInQuad: Easing = (t) => t * t;

/** Décélération quadratique. */
export const easeOutQuad: Easing = (t) => 1 - (1 - t) * (1 - t);

/** Accélération puis décélération quadratiques. */
export const easeInOutQuad: Easing = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * Interpole linéairement entre `a` et `b` selon la progression `t`.
 *
 * `t = 0` → `a`, `t = 1` → `b`.
 */
export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

/**
 * Calcule l'état géométrique intermédiaire entre `from` et `to` à la progression donnée.
 *
 * Les deux états doivent porter exactement les mêmes nœuds et arêtes (mêmes ids) : l'interpolateur
 * ne crée ni ne supprime d'éléments, il déplace et redimensionne ceux qui existent. Toutes les
 * valeurs sont des interpolations pures de nombres : rien n'est codé en dur.
 *
 * @throws Si les ensembles d'ids de nœuds ou d'arêtes diffèrent entre `from` et `to`.
 * @throws Si `progress` n'est pas un nombre fini.
 */
export function interpolateGeometry(
    from: GeometryResult,
    to: GeometryResult,
    progress: number,
    ease: Easing = linearEase,
): InterpolatedGeometry {
    if (!Number.isFinite(progress)) {
        throw new Error(
            `Interpolateur: la progression doit être un nombre fini (reçu "${progress}").`,
        );
    }

    const fromNodeIds = new Set(from.nodes.keys());
    const toNodeIds = new Set(to.nodes.keys());
    if (fromNodeIds.size !== toNodeIds.size || [...fromNodeIds].some((id) => !toNodeIds.has(id))) {
        throw new Error(
            'Interpolateur: les deux états géométriques doivent contenir les mêmes nœuds (mêmes ids).',
        );
    }

    const fromEdgeIds = new Set(from.edges.keys());
    const toEdgeIds = new Set(to.edges.keys());
    if (fromEdgeIds.size !== toEdgeIds.size || [...fromEdgeIds].some((id) => !toEdgeIds.has(id))) {
        throw new Error(
            'Interpolateur: les deux états géométriques doivent contenir les mêmes arêtes (mêmes ids).',
        );
    }

    const t = ease(progress);

    const nodes = new Map<string, InterpolatedNodePlacement>();
    for (const [nodeId, fromPlacement] of from.nodes) {
        const toPlacement = to.nodes.get(nodeId)!;
        nodes.set(nodeId, {
            nodeId,
            x: lerp(fromPlacement.x, toPlacement.x, t),
            y: lerp(fromPlacement.y, toPlacement.y, t),
        });
    }

    const edges = new Map<string, InterpolatedEdgePlacement>();
    for (const [edgeId, fromPlacement] of from.edges) {
        const toPlacement = to.edges.get(edgeId)!;
        edges.set(edgeId, {
            edgeId,
            size: lerp(fromPlacement.size, toPlacement.size, t),
        });
    }

    return { nodes, edges };
}
