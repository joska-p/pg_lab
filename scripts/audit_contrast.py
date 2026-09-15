"""WCAG contrast audit for `@repo/ui` theme tokens.

Mirrors `packages/ui/src/tokens/colors.stylex.ts` (palette + derivations via
`color-mix(in oklab, ...)` and `light-dark(...)`). Palette values are the
canonical gruvbox oklch — never edit those here unless the palette changes.

Usage:
    uv run --no-project python scripts/audit_contrast.py

Tier targets:
    text 4.5:1 (WCAG 1.4.3 AA normal text) — body, labels, inputs, buttons
    UI 3.0:1  (WCAG 1.4.11 non-text)        — tracks/fills, marks

Reported shortfalls are deliberate and documented in component-authoring.md
§ Colors (dark elevated text ~4.1:1, colored button text, decorative
borders). The script only tells the truth — it does not fail the build.
"""

import math

# Canonical gruvbox palette (oklch L C h) — matches consts/gruvbox-palette.stylex.ts.
PALETTE = {
    "dark0Hard": (0.241, 0.005, 219.672),
    "dark0": (0.277, 0.0, 0.0),
    "dark0Soft": (0.311, 0.003, 48.619),
    "dark1": (0.344, 0.007, 48.523),
    "dark2": (0.411, 0.012, 51.866),
    "dark3": (0.482, 0.018, 61.042),
    "dark4": (0.55, 0.023, 62.567),
    "light0": (0.956, 0.055, 96.155),
    "light0Hard": (0.965, 0.039, 100.862),
    "light1": (0.894, 0.057, 89.24),
    "light2": (0.825, 0.051, 85.116),
    "light3": (0.756, 0.041, 82.284),
    "light4": (0.69, 0.035, 76.307),
    "brightRed": (0.66, 0.218, 30.392),
    "brightGreen": (0.765, 0.158, 110.835),
    "brightYellow": (0.832, 0.159, 82.987),
    "brightBlue": (0.693, 0.042, 169.768),
    "brightPurple": (0.705, 0.098, 2.189),
    "fadedRed": (0.437, 0.179, 28.26),
    "fadedGreen": (0.546, 0.112, 106.464),
    "fadedYellow": (0.618, 0.128, 70.674),
    "fadedBlue": (0.471, 0.082, 215.806),
    "fadedPurple": (0.489, 0.124, 344.276),
}

BLACK_OKLAB = (0.0, 0.0, 0.0)


def _oklch_to_oklab(L, C, h):
    h = math.radians(h)
    return (L, C * math.cos(h), C * math.sin(h))


def _oklab_to_linear_srgb(L, a, b):
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m = L - 0.1055613458 * a - 0.0638541728 * b
    s = L - 0.0894841775 * a - 1.2914855480 * b
    l_3, m_3, s_3 = l_**3, m**3, s**3
    return (
        4.0767416621 * l_3 - 3.3077115913 * m_3 + 0.2309699292 * s_3,
        -1.2684380046 * l_3 + 2.6097574011 * m_3 - 0.3413193965 * s_3,
        -0.0041960863 * l_3 - 0.7034186147 * m_3 + 1.7076147010 * s_3,
    )


def _rel_luminance(rgb):
    out = []
    for c in rgb:
        c = max(0.0, min(1.0, c))
        out.append(12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055)
    r, g, b = out
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def oc(name):
    """OKLab tuple for a palette name."""
    return _oklch_to_oklab(*PALETTE[name])


def _lum(x):
    return _rel_luminance(_oklab_to_linear_srgb(*x))


def mix(p, q, share):
    """color-mix(in oklab, p 1-share, q share) over two oklch palette names → OKLab."""
    lp, ap, bp = _oklch_to_oklab(*PALETTE[p])
    lq, aq, bq = _oklch_to_oklab(*PALETTE[q])
    return (
        lp * (1 - share) + lq * share,
        ap * (1 - share) + aq * share,
        bp * (1 - share) + bq * share,
    )


def mix_toward(p, target, share):
    """Derive `p` toward `target` (`black`, else a palette name) → OKLab."""
    lp, ap, bp = _oklch_to_oklab(*PALETTE[p])
    if target == "black":
        lq, aq, bq = BLACK_OKLAB
    else:
        lq, aq, bq = _oklch_to_oklab(*PALETTE[target])
    return (
        lp * (1 - share) + lq * share,
        ap * (1 - share) + aq * share,
        bp * (1 - share) + bq * share,
    )


def contrast(a, b):
    la, lb = _lum(a), _lum(b)
    hi, lo = (la, lb) if la > lb else (lb, la)
    return (hi + 0.05) / (lo + 0.05)


# --- Token derivations, mirrored from tokens.stylex.ts (light first, dark second).
# All values are OKLab tuples except palette passes; `oc()` keeps it readable.
T = {
    "background": (oc("light1"), oc("dark0")),
    "foreground": (mix_toward("dark0", "black", 0.20), oc("light0Hard")),
    "card": (oc("light0"), mix("dark1", "dark0", 0.45)),
    "cardForeground": (mix_toward("dark0", "black", 0.20), oc("light0Hard")),
    "popover": (oc("light0"), mix("dark1", "dark0", 0.45)),
    "popoverForeground": (mix_toward("dark0", "black", 0.20), oc("light0Hard")),
    "input": (oc("light2"), mix("dark2", "dark0", 0.65)),
    "muted": (oc("light3"), mix("dark2", "dark0", 0.40)),
    "mutedForeground": (mix("dark0Hard", "dark2", 0.15), oc("light3")),
    "primary": (oc("brightBlue"), oc("fadedBlue")),
    "secondary": (oc("brightGreen"), oc("fadedGreen")),
    "accent": (oc("brightPurple"), oc("fadedPurple")),
    "warning": (oc("brightYellow"), oc("fadedYellow")),
    "destructive": (oc("brightRed"), oc("fadedRed")),
}

FAM_FG = {
    "primary": (mix_toward("dark0", "black", 0.20), oc("light0Hard")),
    "secondary": (mix_toward("dark0", "black", 0.20), oc("light0Hard")),
    "accent": (mix_toward("dark0", "black", 0.20), oc("light0Hard")),
    "destructive": (mix_toward("dark0", "black", 0.20), oc("light0Hard")),
    "warning": (oc("dark0Hard"), oc("light1")),
}


def report():
    print(f"{'mode':<6} {'pair':<34} {'ratio':>6} target note")
    print("-" * 70)
    for mode in ("light", "dark"):
        i = 0 if mode == "light" else 1
        fg, bg, card, inp, muted, mf = (
            T["foreground"][i],
            T["background"][i],
            T["card"][i],
            T["input"][i],
            T["muted"][i],
            T["mutedForeground"][i],
        )
        checks = [
            ("body text on background", fg, bg, 4.5),
            ("body text on card", fg, card, 4.5),
            ("card text on card", T["cardForeground"][i], card, 4.5),
            ("labels (muted) on card", mf, card, 4.5),
            ("labels (muted) on bg", mf, bg, 4.5),
            ("input text on input", fg, inp, 4.5),
            ("chips text on muted", fg, muted, 4.5),
            ("track fill on track", mf, muted, 3.0),
        ]
        for name, a, b, target in checks:
            r = contrast(a, b)
            status = "OK " if r >= target else "LOW"
            print(f"{mode:<6} {name:<34} {r:>6.2f}  {target}    {status}")
        for fam in ("primary", "secondary", "accent", "warning", "destructive"):
            r = contrast(FAM_FG[fam][i], T[fam][i])
            status = "OK " if r >= 4.5 else "LOW"
            print(f"{mode:<6} {fam+'Foreground on '+fam:<34} {r:>6.2f}  {4.5}    {status}")
    print("-" * 70)
    print("LOW = below target. Deliberate & documented in component-authoring.md § Colors.")


if __name__ == "__main__":
    report()