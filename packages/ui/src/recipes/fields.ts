import * as stylex from '@stylexjs/stylex';

import { space } from '../tokens/const.stylex';
import { interactions } from './interactions';
import { surfaceStyles } from './surface';

// Mise en page commune aux champs de formulaire (label + contrôle + message).
export const field = stylex.create({
    col: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['1'],
        flex: 1,
        minWidth: 'fit-content',
    },
    labelRow: {
        display: 'flex',
        alignItems: 'center',
        gap: space['2'],
    },
    // Gabarit d'un puits de saisie (texte, nombre, select...) : dimensions et
    // padding seulement. Fond, bordure, rayon et ombre viennent de surfaceStyles.
    well: {
        width: '100%',
        minWidth: 0,
        margin: 0,
        paddingBlock: space['2'],
        paddingInline: space['3'],
    },
});

/**
 * Puits de saisie : surface enfoncée + gabarit + anneau de focus. `invalid` bascule la teinte en
 * `error` (rouge) au lieu d'un style séparé. Pas de pressable ni de voile au survol : ce n'est pas
 * un bouton.
 */
export function wellStyles({
    invalid = false,
    disabled = false,
}: { invalid?: boolean; disabled?: boolean } = {}) {
    return [
        surfaceStyles({
            color: invalid ? 'error' : 'neutral',
            background: 'soft',
            border: 'strong',
            radius: 'sm',
            elevation: 'sunken',
        }),
        field.well,
        interactions.focus,
        disabled && interactions.disabled,
    ];
}
