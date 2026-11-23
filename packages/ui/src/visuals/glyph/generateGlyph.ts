import { emptyGraphic, f } from '../core/geometry';
import { mulberry32, randInt, toSeed } from '../core/rng';
import type { CardGraphic, GraphicCircle, GraphicPath } from '../core/types';

/* ==========================================================================
 * Principe général
 * --------------------------------------------------------------------------
 * On dessine une grille de 4 x 4 cases. Dans chaque case (sauf quelques-unes
 * laissées vides au hasard), on superpose 3 à 6 "runes" (petits traits
 * simples) pour former un glyphe. Selon le hasard, on ajoute aussi :
 *   - une animation CSS sur le tracé,
 *   - un petit point qui scintille,
 *   - un cadre fin autour de la case.
 *
 * Le générateur aléatoire est "seedé" : même graine => même résultat.
 * ATTENTION : l'ordre des appels à rand() compte. Si on le change, les
 * glyphes obtenus pour une graine donnée changent aussi.
 * ========================================================================== */

/* ------------------------------ Constantes ------------------------------ */

const GRID_SIZE = 4; // 4 x 4 cases
const GRID_PADDING = 22; // marge autour de la grille
const CELL_SIZE = 64; // taille d'une case
const CELL_INSET = 8; // marge intérieure d'une case
const GLYPH_SIZE = CELL_SIZE - CELL_INSET * 2; // taille réelle du dessin (48)

const MIN_RUNES_PER_GLYPH = 3;
const EXTRA_RUNES_MAX = 3; // => entre 3 et 6 runes

// Probabilités (entre 0 et 1)
const CHANCE_EMPTY_CELL = 0.18;
const CHANCE_ANIMATED_PATH = 0.3; // rand() > 0.7
const CHANCE_TWINKLE_DOT = 0.28; // rand() > 0.72
const CHANCE_FRAME = 0.18; // rand() > 0.82

const FRAME_MARGIN = 3; // le cadre dépasse du glyphe de 3px

/* -------------------------------- Runes --------------------------------- */

/**
 * Convertit des coordonnées relatives (0 à 1, dans le carré du glyphe) en coordonnées réelles "x,y"
 * utilisables dans un attribut SVG `d`.
 */
type ToPoint = (x: number, y: number) => string;

/** Une rune = une fonction qui renvoie un morceau de tracé SVG. */
type Rune = (p: ToPoint) => string;

/**
 * Les 10 runes possibles. Les coordonnées vont de 0 (haut/gauche) à 1 (bas/droite) dans le carré du
 * glyphe.
 */

// Rune de repli (carré fermé), aussi utilisée comme dernière entrée de RUNES
const SQUARE_RUNE: Rune = (p) =>
    `M${p(0.28, 0.28)} L${p(0.72, 0.28)} L${p(0.72, 0.72)} L${p(0.28, 0.72)} Z`;

const RUNES: Rune[] = [
    // 0 : barre verticale gauche
    (p) => `M${p(0.22, 0.18)} L${p(0.22, 0.82)}`,
    // 1 : barre verticale droite
    (p) => `M${p(0.78, 0.18)} L${p(0.78, 0.82)}`,
    // 2 : barre horizontale au milieu
    (p) => `M${p(0.2, 0.5)} L${p(0.8, 0.5)}`,
    // 3 : diagonale haut-gauche -> bas-droite
    (p) => `M${p(0.22, 0.22)} L${p(0.78, 0.78)}`,
    // 4 : diagonale haut-droite -> bas-gauche
    (p) => `M${p(0.78, 0.22)} L${p(0.22, 0.78)}`,
    // 5 : barre verticale centrale
    (p) => `M${p(0.5, 0.16)} L${p(0.5, 0.84)}`,
    // 6 : coin (haut, puis descend à droite)
    (p) => `M${p(0.2, 0.22)} L${p(0.8, 0.22)} L${p(0.8, 0.52)}`,
    // 7 : arc (courbe de Bézier)
    (p) => `M${p(0.2, 0.72)} Q${p(0.5, 0.28)} ${p(0.8, 0.72)}`,
    // 8 : chevron / "A" sans barre
    (p) => `M${p(0.22, 0.78)} L${p(0.5, 0.2)} L${p(0.78, 0.78)}`,
    // 9 : carré fermé
    SQUARE_RUNE,
];

export const RUNE_COUNT = RUNES.length; // 10

/**
 * Renvoie le tracé SVG de la rune n° `idx`, placée avec son coin haut-gauche en (ox, oy) et dont le
 * côté mesure `u` pixels.
 */
export function runeStrokes(ox: number, oy: number, u: number, idx: number): string {
    const toPoint: ToPoint = (x, y) => `${f(ox + x * u)},${f(oy + y * u)}`;
    const rune = RUNES[idx] ?? SQUARE_RUNE;
    return rune(toPoint);
}

/* --------------------------- Construction d'une case --------------------- */

/**
 * Tire `count` index de runes au hasard en essayant d'éviter les doublons (au bout de 8 tentatives
 * ratées, on accepte un doublon).
 */
function pickRunes(rand: () => number, count: number): number[] {
    const picked: number[] = [];
    const used = new Set<number>();

    for (let i = 0; i < count; i++) {
        let idx = randInt(rand, 0, RUNE_COUNT - 1);
        let attempts = 0;

        while (used.has(idx) && attempts < 8) {
            idx = randInt(rand, 0, RUNE_COUNT - 1);
            attempts += 1;
        }

        used.add(idx);
        picked.push(idx);
    }

    return picked;
}

/** Tracé principal du glyphe : toutes les runes choisies mises bout à bout. */
function buildGlyphPath(rand: () => number, ox: number, oy: number): GraphicPath {
    const runeCount = MIN_RUNES_PER_GLYPH + randInt(rand, 0, EXTRA_RUNES_MAX);
    const d = pickRunes(rand, runeCount)
        .map((idx) => runeStrokes(ox, oy, GLYPH_SIZE, idx))
        .join('');

    return {
        d,
        strokeWidth: 1.1,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        // Parfois, on ajoute la classe CSS qui anime le tracé
        ...(rand() > 1 - CHANCE_ANIMATED_PATH ? { className: 'snake-path' } : {}),
    };
}

/** Petit point scintillant placé aléatoirement dans la zone centrale du glyphe. */
function buildTwinkleDot(rand: () => number, ox: number, oy: number): GraphicCircle {
    // Position entre 28 % et 72 % de la taille du glyphe
    const cx = ox + GLYPH_SIZE * (0.28 + rand() * 0.44);
    const cy = oy + GLYPH_SIZE * (0.28 + rand() * 0.44);
    const r = 1.4 + rand() * 1.2;

    return { cx, cy, r, className: 'twinkle' };
}

/** Cadre fin et semi-transparent autour du glyphe. */
function buildFrame(ox: number, oy: number): GraphicPath {
    const left = f(ox - FRAME_MARGIN);
    const top = f(oy - FRAME_MARGIN);
    const right = f(ox + GLYPH_SIZE + FRAME_MARGIN);
    const bottom = f(oy + GLYPH_SIZE + FRAME_MARGIN);

    return {
        d: `M${left},${top} L${right},${top} L${right},${bottom} L${left},${bottom} Z`,
        strokeWidth: 0.4,
        strokeOpacity: 0.45,
    };
}

/* ------------------------------ Fonctions publiques ---------------------- */

/** Construit le dessin complet (grille de glyphes) à partir d'un générateur aléatoire. */
export function buildGlyph(rand: () => number): CardGraphic {
    const paths: GraphicPath[] = [];
    const circles: GraphicCircle[] = [];

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            // Certaines cases restent vides
            if (rand() < CHANCE_EMPTY_CELL) {
                continue;
            }

            // Coin haut-gauche du glyphe dans cette case
            const ox = GRID_PADDING + col * CELL_SIZE + CELL_INSET;
            const oy = GRID_PADDING + row * CELL_SIZE + CELL_INSET;

            // L'ORDRE des appels ci-dessous doit rester celui-ci
            // pour que chaque graine produise toujours le même résultat.
            paths.push(buildGlyphPath(rand, ox, oy));

            if (rand() > 1 - CHANCE_TWINKLE_DOT) {
                circles.push(buildTwinkleDot(rand, ox, oy));
            }

            if (rand() > 1 - CHANCE_FRAME) {
                paths.push(buildFrame(ox, oy));
            }
        }
    }

    return { ...emptyGraphic(), paths, circles };
}

/** Point d'entrée : génère un glyphe reproductible à partir d'une graine (nombre ou texte). */
export function generateGlyph(seedInput: number | string = 42): CardGraphic {
    const rand = mulberry32(toSeed(seedInput));
    return buildGlyph(rand);
}
