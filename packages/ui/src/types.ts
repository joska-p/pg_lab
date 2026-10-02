import type { StyleXStyles } from '@stylexjs/stylex';

// Ce qu'un consommateur peut ajuster via `style` : placement et dimensions,
// pas l'apparence de la surface (couleur, bordure, ombre, rayon...).
export type LayoutStyle = StyleXStyles<{
    margin?: string | number | null;
    marginBlock?: string | number | null;
    marginInline?: string | number | null;
    marginTop?: string | number | null;
    marginBottom?: string | number | null;
    marginLeft?: string | number | null;
    marginRight?: string | number | null;
    width?: string | number | null;
    minWidth?: string | number | null;
    maxWidth?: string | number | null;
    height?: string | number | null;
    minHeight?: string | number | null;
    maxHeight?: string | number | null;
    flex?: string | number | null;
    flexGrow?: string | number | null;
    flexShrink?: string | number | null;
    alignSelf?: string | null;
    justifySelf?: string | null;
    gridColumn?: string | number | null;
    gridRow?: string | number | null;
}>;
