import { radius } from '@repo/ui/tokens/const.stylex';
import { tintVars } from '@repo/ui/tokens/tint.stylex';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
    container: {
        width: '100%',
        height: '96px',
        position: 'relative',
        overflow: 'hidden',
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        backgroundColor: `color-mix(in oklab, ${tintVars.color} 8%, transparent)`,
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: `color-mix(in oklab, ${tintVars.color} 18%, transparent)`,
    },
    svg: {
        width: '100%',
        height: '100%',
        display: 'block',
    },
});

export function ExperimentVisual({ mark }: { mark: string }) {
    return (
        <div {...stylex.props(styles.container)} aria-hidden="true">
            <svg
                viewBox="0 0 320 96"
                preserveAspectRatio="xMidYMid slice"
                {...stylex.props(styles.svg)}
            >
                <defs>
                    <linearGradient id={`grad-${mark}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop
                            offset="0%"
                            stopColor="var(--tint-color, currentColor)"
                            stopOpacity="0.45"
                        />
                        <stop
                            offset="100%"
                            stopColor="var(--tint-color, currentColor)"
                            stopOpacity="0.08"
                        />
                    </linearGradient>
                    <pattern id="dot-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.12" />
                    </pattern>
                </defs>

                <rect width="320" height="96" fill="url(#dot-grid)" />

                {mark === 'home' && (
                    <g stroke="currentColor" fill="none">
                        <circle
                            cx="160"
                            cy="48"
                            r="38"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                            opacity="0.25"
                        />
                        <circle cx="160" cy="48" r="24" strokeWidth="1.2" opacity="0.4" />
                        <circle cx="160" cy="48" r="8" fill="currentColor" opacity="0.6" />
                        <path d="M120 48h80M160 8v80" strokeWidth="1" opacity="0.2" />
                        <path
                            d="M135 23l50 50M185 23l-50 50"
                            strokeWidth="1"
                            strokeDasharray="2 4"
                            opacity="0.3"
                        />
                        <circle cx="135" cy="23" r="3" fill="currentColor" opacity="0.5" />
                        <circle cx="185" cy="73" r="3" fill="currentColor" opacity="0.5" />
                        <circle cx="185" cy="23" r="3" fill="currentColor" opacity="0.5" />
                        <circle cx="135" cy="73" r="3" fill="currentColor" opacity="0.5" />
                    </g>
                )}

                {mark === 'art-canvas' && (
                    <g stroke="currentColor" fill="none">
                        <path
                            d="M0 64 C 60 20, 100 80, 160 48 C 220 16, 260 76, 320 32"
                            strokeWidth="2"
                            opacity="0.8"
                        />
                        <path
                            d="M0 48 C 60 76, 120 16, 180 56 C 240 96, 280 40, 320 60"
                            strokeWidth="1.5"
                            strokeDasharray="4 2"
                            opacity="0.5"
                        />
                        <path
                            d="M0 72 C 80 40, 140 84, 200 36 C 260 -12, 290 60, 320 44"
                            strokeWidth="1"
                            opacity="0.3"
                        />
                        <polygon
                            points="160,20 190,75 130,75"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                            opacity="0.4"
                        />
                    </g>
                )}

                {mark === 'mosaic-maker' && (
                    <g stroke="currentColor" fill="none" opacity="0.6">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                            const x = 20 + i * 40;
                            return (
                                <g key={i}>
                                    <rect
                                        x={x - 14}
                                        y="34"
                                        width="28"
                                        height="28"
                                        strokeWidth="1"
                                    />
                                    <rect
                                        x={x - 14}
                                        y="34"
                                        width="28"
                                        height="28"
                                        transform={`rotate(45 ${x} 48)`}
                                        strokeWidth="1.2"
                                        opacity="0.5"
                                    />
                                    <circle
                                        cx={x}
                                        cy="48"
                                        r="3"
                                        fill="currentColor"
                                        opacity="0.4"
                                    />
                                </g>
                            );
                        })}
                    </g>
                )}

                {mark === 'mol-demo' && (
                    <g stroke="currentColor" fill="none">
                        <circle
                            cx="160"
                            cy="48"
                            r="42"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                            opacity="0.2"
                        />
                        <circle
                            cx="160"
                            cy="48"
                            r="28"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                            opacity="0.35"
                        />
                        <line x1="120" y1="36" x2="160" y2="48" strokeWidth="2" opacity="0.6" />
                        <line x1="160" y1="48" x2="200" y2="36" strokeWidth="2" opacity="0.6" />
                        <line x1="160" y1="48" x2="160" y2="76" strokeWidth="2" opacity="0.6" />
                        <circle cx="160" cy="48" r="7" fill="currentColor" opacity="0.9" />
                        <circle cx="120" cy="36" r="5" fill="currentColor" opacity="0.6" />
                        <circle cx="200" cy="36" r="5" fill="currentColor" opacity="0.6" />
                        <circle cx="160" cy="76" r="6" fill="currentColor" opacity="0.7" />
                        <line
                            x1="120"
                            y1="36"
                            x2="90"
                            y2="60"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                            opacity="0.4"
                        />
                        <circle cx="90" cy="60" r="4" fill="currentColor" opacity="0.35" />
                    </g>
                )}

                {mark === 'automa' && (
                    <g fill="currentColor">
                        {/* Glider */}
                        <g transform="translate(60, 24)">
                            <rect x="12" y="0" width="10" height="10" rx="1.5" opacity="0.75" />
                            <rect x="24" y="12" width="10" height="10" rx="1.5" opacity="0.75" />
                            <rect x="0" y="24" width="10" height="10" rx="1.5" opacity="0.75" />
                            <rect x="12" y="24" width="10" height="10" rx="1.5" opacity="0.75" />
                            <rect x="24" y="24" width="10" height="10" rx="1.5" opacity="0.75" />
                        </g>
                        {/* Blinker */}
                        <g transform="translate(150, 36)">
                            <rect x="0" y="0" width="10" height="10" rx="1.5" opacity="0.6" />
                            <rect x="12" y="0" width="10" height="10" rx="1.5" opacity="0.85" />
                            <rect x="24" y="0" width="10" height="10" rx="1.5" opacity="0.6" />
                        </g>
                        {/* Lightweight spaceship fragment */}
                        <g transform="translate(220, 20)">
                            <rect x="0" y="0" width="10" height="10" rx="1.5" opacity="0.5" />
                            <rect x="36" y="0" width="10" height="10" rx="1.5" opacity="0.5" />
                            <rect x="48" y="12" width="10" height="10" rx="1.5" opacity="0.75" />
                            <rect x="0" y="24" width="10" height="10" rx="1.5" opacity="0.75" />
                            <rect x="48" y="24" width="10" height="10" rx="1.5" opacity="0.75" />
                            <rect x="12" y="36" width="10" height="10" rx="1.5" opacity="0.75" />
                            <rect x="24" y="36" width="10" height="10" rx="1.5" opacity="0.75" />
                            <rect x="36" y="36" width="10" height="10" rx="1.5" opacity="0.75" />
                            <rect x="48" y="36" width="10" height="10" rx="1.5" opacity="0.75" />
                        </g>
                    </g>
                )}

                {mark === 'fracture' && (
                    <g stroke="currentColor" fill="none">
                        {/* Main cardioid */}
                        <path
                            d="M 175 48 C 175 28, 140 22, 130 48 C 140 74, 175 68, 175 48 Z"
                            strokeWidth="1.8"
                            opacity="0.8"
                        />
                        {/* Period-2 bulb */}
                        <circle cx="108" cy="48" r="14" strokeWidth="1.4" opacity="0.7" />
                        <circle cx="90" cy="48" r="4" strokeWidth="1" opacity="0.5" />
                        <line x1="86" y1="48" x2="65" y2="48" strokeWidth="1" opacity="0.4" />
                        {/* Satellite bulbs */}
                        <circle cx="140" cy="24" r="6" strokeWidth="1" opacity="0.6" />
                        <circle cx="140" cy="72" r="6" strokeWidth="1" opacity="0.6" />
                        <circle cx="125" cy="30" r="3.5" strokeWidth="1" opacity="0.5" />
                        <circle cx="125" cy="66" r="3.5" strokeWidth="1" opacity="0.5" />
                        {/* Equipotential contour shells */}
                        <path
                            d="M 215 48 C 215 10, 110 5, 80 48 C 110 91, 215 86, 215 48 Z"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                            opacity="0.3"
                        />
                    </g>
                )}

                {mark === 'radu-machine-learning' && (
                    <g stroke="currentColor">
                        {/* Layer connections */}
                        <g strokeWidth="1" opacity="0.35">
                            {[20, 48, 76].map((y1) =>
                                [16, 36, 56, 76].map((y2) => (
                                    <line key={`${y1}-${y2}`} x1="80" y1={y1} x2="160" y2={y2} />
                                )),
                            )}
                            {[16, 36, 56, 76].map((y1) =>
                                [32, 64].map((y2) => (
                                    <line key={`${y1}-${y2}`} x1="160" y1={y1} x2="240" y2={y2} />
                                )),
                            )}
                        </g>
                        {/* Input nodes */}
                        {[20, 48, 76].map((y, i) => (
                            <circle
                                key={i}
                                cx="80"
                                cy={y}
                                r="5"
                                fill="currentColor"
                                opacity="0.7"
                            />
                        ))}
                        {/* Hidden nodes */}
                        {[16, 36, 56, 76].map((y, i) => (
                            <circle
                                key={i}
                                cx="160"
                                cy={y}
                                r="6"
                                fill="currentColor"
                                opacity="0.85"
                            />
                        ))}
                        {/* Output nodes */}
                        {[32, 64].map((y, i) => (
                            <circle
                                key={i}
                                cx="240"
                                cy={y}
                                r="7"
                                fill="currentColor"
                                opacity="0.95"
                            />
                        ))}
                    </g>
                )}

                {mark === 'randomart' && (
                    <g stroke="currentColor" fill="none">
                        {/* AST Tree */}
                        <circle cx="160" cy="18" r="6" fill="currentColor" opacity="0.8" />
                        <line x1="160" y1="18" x2="110" y2="44" strokeWidth="1.5" opacity="0.5" />
                        <line x1="160" y1="18" x2="210" y2="44" strokeWidth="1.5" opacity="0.5" />
                        <circle cx="110" cy="44" r="5" fill="currentColor" opacity="0.7" />
                        <circle cx="210" cy="44" r="5" fill="currentColor" opacity="0.7" />
                        <line x1="110" y1="44" x2="80" y2="76" strokeWidth="1.2" opacity="0.4" />
                        <line x1="110" y1="44" x2="135" y2="76" strokeWidth="1.2" opacity="0.4" />
                        <line x1="210" y1="44" x2="185" y2="76" strokeWidth="1.2" opacity="0.4" />
                        <line x1="210" y1="44" x2="240" y2="76" strokeWidth="1.2" opacity="0.4" />
                        <circle cx="80" cy="76" r="4" fill="currentColor" opacity="0.5" />
                        <circle cx="135" cy="76" r="4" fill="currentColor" opacity="0.5" />
                        <circle cx="185" cy="76" r="4" fill="currentColor" opacity="0.5" />
                        <circle cx="240" cy="76" r="4" fill="currentColor" opacity="0.5" />
                    </g>
                )}

                {mark === 'oeis-signal' && (
                    <g stroke="currentColor">
                        {/* Impulse train */}
                        {[
                            [40, 28],
                            [60, 48],
                            [80, 20],
                            [100, 60],
                            [120, 32],
                            [140, 72],
                            [160, 16],
                            [180, 56],
                            [200, 24],
                            [220, 64],
                            [240, 36],
                            [260, 80],
                            [280, 44],
                        ].map(([x, h], i) => {
                            const height = h ?? 30;
                            return (
                                <line
                                    key={i}
                                    x1={x}
                                    y1="88"
                                    x2={x}
                                    y2={88 - height}
                                    strokeWidth="2.5"
                                    opacity="0.6"
                                />
                            );
                        })}
                        {/* Continuous overlay wave */}
                        <path
                            d="M 30 80 Q 70 20, 110 60 T 190 40 T 270 50 T 310 20"
                            fill="none"
                            strokeWidth="1.8"
                            opacity="0.85"
                        />
                    </g>
                )}

                {mark === 'palette' && (
                    <g stroke="currentColor" fill="none">
                        <circle
                            cx="160"
                            cy="80"
                            r="64"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                            opacity="0.25"
                        />
                        <circle cx="160" cy="80" r="46" strokeWidth="1.5" opacity="0.5" />
                        <circle cx="160" cy="80" r="28" strokeWidth="1.5" opacity="0.75" />
                        {/* Chroma gamut rays */}
                        {[0, 30, 60, 90, 120, 150, 180].map((deg) => {
                            const rad = (deg * Math.PI) / 180;
                            const x2 = 160 + Math.cos(rad) * 64;
                            const y2 = 80 - Math.sin(rad) * 64;
                            return (
                                <g key={deg}>
                                    <line
                                        x1="160"
                                        y1="80"
                                        x2={x2}
                                        y2={y2}
                                        strokeWidth="1"
                                        opacity="0.3"
                                    />
                                    <circle
                                        cx={160 + Math.cos(rad) * 46}
                                        cy={80 - Math.sin(rad) * 46}
                                        r="3.5"
                                        fill="currentColor"
                                        opacity="0.8"
                                    />
                                </g>
                            );
                        })}
                    </g>
                )}

                {mark === 'pixel' && (
                    <g stroke="currentColor" fill="none">
                        {/* Pipeline nodes */}
                        <rect
                            x="40"
                            y="32"
                            width="56"
                            height="32"
                            rx="4"
                            strokeWidth="1.5"
                            opacity="0.7"
                        />
                        <path
                            d="M96 48 L130 48"
                            strokeWidth="1.5"
                            markerEnd="url(#arrow)"
                            opacity="0.5"
                        />
                        <rect
                            x="132"
                            y="24"
                            width="56"
                            height="48"
                            rx="4"
                            strokeWidth="1.8"
                            opacity="0.9"
                        />
                        <path d="M188 48 L222 48" strokeWidth="1.5" opacity="0.5" />
                        <rect
                            x="224"
                            y="32"
                            width="56"
                            height="32"
                            rx="4"
                            strokeWidth="1.5"
                            opacity="0.7"
                        />
                        {/* Internal miniature glyphs */}
                        <line x1="52" y1="42" x2="84" y2="42" strokeWidth="1" opacity="0.4" />
                        <line x1="52" y1="52" x2="74" y2="52" strokeWidth="1" opacity="0.4" />
                        <circle cx="160" cy="48" r="8" strokeWidth="1.2" opacity="0.8" />
                        <line x1="236" y1="42" x2="268" y2="42" strokeWidth="1" opacity="0.4" />
                        <line x1="236" y1="52" x2="258" y2="52" strokeWidth="1" opacity="0.4" />
                    </g>
                )}

                {mark === 'pixel-manipulator' && (
                    <g fill="currentColor">
                        {/* 3x3 Convolution Matrix */}
                        <g transform="translate(132, 20)">
                            {[0, 1, 2].map((r) =>
                                [0, 1, 2].map((c) => (
                                    <rect
                                        key={`${r}-${c}`}
                                        x={c * 18}
                                        y={r * 18}
                                        width="14"
                                        height="14"
                                        rx="2"
                                        opacity={r === 1 && c === 1 ? 0.95 : 0.45}
                                    />
                                )),
                            )}
                        </g>
                        {/* Dither pattern samples left and right */}
                        <g opacity="0.3">
                            <circle cx="60" cy="40" r="2" />
                            <circle cx="76" cy="40" r="4" />
                            <circle cx="92" cy="40" r="6" />
                            <circle cx="60" cy="56" r="4" />
                            <circle cx="76" cy="56" r="6" />
                            <circle cx="92" cy="56" r="2" />

                            <circle cx="228" cy="40" r="6" />
                            <circle cx="244" cy="40" r="4" />
                            <circle cx="260" cy="40" r="2" />
                            <circle cx="228" cy="56" r="2" />
                            <circle cx="244" cy="56" r="6" />
                            <circle cx="260" cy="56" r="4" />
                        </g>
                    </g>
                )}

                {mark === 'notebook' && (
                    <g stroke="currentColor" fill="none">
                        {/* Markdown cell notebook */}
                        <rect
                            x="60"
                            y="16"
                            width="200"
                            height="64"
                            rx="4"
                            strokeWidth="1.2"
                            opacity="0.5"
                        />
                        <line x1="60" y1="36" x2="260" y2="36" strokeWidth="1" opacity="0.25" />
                        <text
                            x="72"
                            y="29"
                            fontFamily="monospace"
                            fontSize="10"
                            fill="currentColor"
                            opacity="0.6"
                        >
                            In [1]: def evolve(x, t):
                        </text>
                        <path
                            d="M 80 58 Q 120 42, 160 54 T 240 48"
                            strokeWidth="1.8"
                            opacity="0.85"
                        />
                    </g>
                )}

                {mark === 'sequencer' && (
                    <g fill="currentColor">
                        {/* 16-step grid across 4 tracks */}
                        {[0, 1, 2, 3].map((track) => {
                            const y = 18 + track * 16;
                            return (
                                <g key={track}>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
                                        (step) => {
                                            const x = 32 + step * 16;
                                            const isTrigger =
                                                (track === 0 && step % 4 === 0) ||
                                                (track === 1 && step % 8 === 4) ||
                                                (track === 2 && step % 2 === 0) ||
                                                (track === 3 && (step === 3 || step === 11));
                                            return (
                                                <rect
                                                    key={step}
                                                    x={x}
                                                    y={y}
                                                    width="11"
                                                    height="10"
                                                    rx="1.5"
                                                    opacity={isTrigger ? 0.9 : 0.18}
                                                />
                                            );
                                        },
                                    )}
                                </g>
                            );
                        })}
                    </g>
                )}
            </svg>
        </div>
    );
}
