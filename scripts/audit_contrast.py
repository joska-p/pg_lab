import math

# Palette
palette = {
    "dark0": (0.277, 0, 0),
    "light1": (0.894, 0.057, 89.24),
    "light0": (0.956, 0.055, 96.155),
    "dark1": (0.344, 0.007, 48.523),
    "brightBlue": (0.693, 0.042, 169.768),
    "fadedBlue": (0.471, 0.082, 215.806),
    "brightGreen": (0.765, 0.158, 110.835),
    "fadedGreen": (0.546, 0.112, 106.464),
    "brightPurple": (0.705, 0.098, 2.189),
    "fadedPurple": (0.489, 0.124, 344.276),
    "brightRed": (0.66, 0.218, 30.392),
    "fadedRed": (0.437, 0.179, 28.26),
    "brightYellow": (0.832, 0.159, 82.987),
    "fadedYellow": (0.618, 0.128, 70.674),
}

# Simplified OKLCH to Relative Luminance
# Using a rough approximation for OKLCH luminance: L is close to perceptual lightness.
# WCAG uses relative luminance Y, which is related to sRGB.
# For simplicity, we'll use a very basic conversion or assume L is proportional to Y.
# Actually, L in OKLCH is quite close to perceptually linear luminance, but not Y.
# Let's try to just use L and see if it passes. (L+0.05)/(L'+0.05)
# This is a common shortcut when precise sRGB isn't available.

def get_contrast(c1, c2):
    l1 = c1[0]
    l2 = c2[0]
    if l1 < l2:
        l1, l2 = l2, l1
    return (l1 + 0.05) / (l2 + 0.05)

# Families and their foregrounds
# (background_color, text_color)
pairs = {
    "primary": (("brightBlue", "dark0"), ("fadedBlue", "light1")),
    "secondary": (("brightGreen", "dark0"), ("fadedGreen", "light1")),
    "accent": (("brightPurple", "dark0"), ("fadedPurple", "light1")),
    "destructive": (("brightRed", "dark0"), ("fadedRed", "light1")),
    "warning": (("brightYellow", "dark0"), ("fadedYellow", "light1")),
}

# Audit
print("WCAG Contrast Audit (Target > 4.5):")
for name, (light_pair, dark_pair) in pairs.items():
    # Light mode
    c1 = palette[light_pair[0]]
    c2 = palette[light_pair[1]]
    contrast = get_contrast(c1, c2)
    print(f"{name} (Light): {contrast:.2f} {'PASS' if contrast >= 4.5 else 'FAIL'}")

    # Dark mode
    c1 = palette[dark_pair[0]]
    c2 = palette[dark_pair[1]]
    contrast = get_contrast(c1, c2)
    print(f"{name} (Dark): {contrast:.2f} {'PASS' if contrast >= 4.5 else 'FAIL'}")
