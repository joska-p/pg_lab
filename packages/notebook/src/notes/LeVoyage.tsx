import './le-voyage.css';
import { useState } from 'react';

type Level = {
    num: number;
    name: string;
    short: string;
    color: string;
    letter: string;
    api: string;
    envelope: string;
    action: string;
};

const LEVELS: Level[] = [
    {
        num: 1,
        name: 'Humain',
        short: 'Humain',
        color: '#ebdbb2',
        letter: 'L’intention d’envoyer une note',
        api: 'Le doigt sur le bouton de la souris',
        envelope: 'Mouvement physique',
        action: 'La lettre est glissée dans une enveloppe de mouvement physique.',
    },
    {
        num: 2,
        name: 'Matériel (Hardware)',
        short: 'Hardware',
        color: '#fe8019',
        letter: 'Le mouvement physique',
        api: 'Le capteur mécanique de la souris',
        envelope: 'Impulsion électrique · 5 V',
        action: 'Le mouvement est reconditionné en impulsion électrique (5 V). L’ancienne enveloppe est jetée.',
    },
    {
        num: 3,
        name: 'Système d’Exploitation (OS)',
        short: 'OS',
        color: '#fb4934',
        letter: 'L’impulsion électrique',
        api: 'Le port USB · pilote (driver)',
        envelope: 'Trame USB · protocole',
        action: 'Le signal électrique devient une trame USB. Le pilote la décode.',
    },
    {
        num: 4,
        name: 'Réseau (Network)',
        short: 'Réseau',
        color: '#b8bb26',
        letter: 'La trame USB',
        api: 'La pile TCP/IP',
        envelope: 'Paquet IP · segment TCP',
        action: 'La lettre est réemballée pour le réseau. L’interface physique disparaît.',
    },
    {
        num: 5,
        name: 'Transport (TCP)',
        short: 'TCP',
        color: '#83a598',
        letter: 'Le paquet IP',
        api: 'Le socket TCP',
        envelope: 'Segment TCP · port',
        action: 'Le paquet est réencapsulé en segment. Le port devient la nouvelle enveloppe.',
    },
    {
        num: 6,
        name: 'Application (HTTP)',
        short: 'HTTP',
        color: '#d3869b',
        letter: 'Le segment TCP',
        api: 'Le client HTTP',
        envelope: 'Requête HTTP',
        action: 'Le segment est lu par le client, qui construit une requête HTTP.',
    },
    {
        num: 7,
        name: 'Serveur (Backend)',
        short: 'Serveur',
        color: '#b16286',
        letter: 'La requête HTTP',
        api: 'Le handler du serveur',
        envelope: 'Réponse HTTP',
        action: 'Le serveur traite la requête et scelle une réponse dans une nouvelle enveloppe.',
    },
    {
        num: 8,
        name: 'Humain (destination)',
        short: 'Dest.',
        color: '#689d6a',
        letter: 'La réponse HTTP',
        api: 'L’écran du destinataire',
        envelope: 'Lumière · pixels',
        action: 'La réponse est déballée jusqu’à la lumière : la lettre arrive enfin.',
    },
];

function pad(n: number): string {
    return String(n).padStart(2, '0');
}

export function Note() {
    const [index, setIndex] = useState(0);
    const last = LEVELS.length - 1;

    function go(next: number) {
        setIndex(Math.min(last, Math.max(0, next)));
    }

    const activeLevel = LEVELS[index];
    const color = activeLevel.color;

    return (
        <div
            className="le-voyage-doc"
            style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.25rem' }}
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    go(index + 1);
                } else if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    go(index - 1);
                }
            }}
        >
            <header style={{ marginBottom: '3rem' }}>
                <p
                    style={{
                        fontSize: '0.75rem',
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        opacity: 0.7,
                    }}
                >
                    Note interactive · une lettre, huit enveloppes
                </p>
                <h2
                    style={{
                        fontSize: 'clamp(1.8rem, 4vw, 2.9rem)',
                        lineHeight: 1.1,
                        fontWeight: 600,
                        marginTop: '0.75rem',
                    }}
                >
                    Le voyage d’un clic
                </h2>
                <p
                    style={{
                        marginTop: '1rem',
                        maxWidth: '42rem',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        opacity: 0.85,
                    }}
                >
                    Une seule intention, huit reconditionnements. À chaque étape, la lettre est
                    extraite de son enveloppe, lue par l’interface du niveau, puis glissée dans une
                    enveloppe neuve, adaptée au médium suivant. L’ancienne enveloppe n’est pas
                    empilée&nbsp;: elle est abandonnée sur place.
                </p>
            </header>

            <nav
                aria-label="Progression du voyage, étape par étape"
                style={{ marginBottom: '3rem', overflowX: 'auto' }}
            >
                <div style={{ position: 'relative', minWidth: '43rem' }}>
                    <div className="timeline-track" aria-hidden="true">
                        <i
                            className="track-fill"
                            style={
                                {
                                    width: `${(index / last) * 100}%`,
                                    '--fill-c': color,
                                } as React.CSSProperties
                            }
                        />
                    </div>
                    <ol
                        style={{
                            display: 'flex',
                            width: '100%',
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                        }}
                    >
                        {LEVELS.map((level, levelIndex) => (
                            <li
                                key={level.num}
                                style={{ minWidth: '3.25rem', flex: 1, padding: '0 0.5rem' }}
                            >
                                <button
                                    type="button"
                                    className={`node ${levelIndex === index ? 'is-current' : levelIndex < index ? 'is-done' : ''}`}
                                    style={{ '--lv': level.color } as React.CSSProperties}
                                    aria-label={`Étape ${pad(level.num)} · ${level.name}`}
                                    onClick={() => go(levelIndex)}
                                >
                                    <span className="node-dot">{pad(level.num)}</span>
                                    <span className="node-name">{level.short}</span>
                                </button>
                            </li>
                        ))}
                    </ol>
                </div>
            </nav>

            <div className="glass-panel rounded-2xl" style={{ padding: '1.5rem 2rem' }}>
                <p className="sr-only" role="status">
                    {`Étape ${index + 1} sur ${LEVELS.length} : ${activeLevel.name}`}
                </p>

                {LEVELS.map((level, levelIndex) => {
                    const prev = levelIndex > 0 ? LEVELS[levelIndex - 1] : null;
                    const isActive = levelIndex === index;
                    if (!isActive) {
                        return null;
                    }
                    return (
                        <article
                            key={level.num}
                            className="levoyage-step is-active"
                            style={{ '--lv': level.color } as React.CSSProperties}
                        >
                            <header className="step-head">
                                <div>
                                    <p className="step-kicker">
                                        Étape {pad(level.num)}{' '}
                                        <span style={{ opacity: 0.5 }}>/ 08</span>
                                    </p>
                                    <h3 className="step-name">
                                        <span className="step-swatch" aria-hidden="true" />
                                        {level.name}
                                    </h3>
                                </div>
                                <span className="step-watermark" aria-hidden="true">
                                    {pad(level.num)}
                                </span>
                            </header>

                            <div className="pipeline">
                                <section className="stop">
                                    <p className="stop-label">Enveloppe précédente</p>
                                    {prev ? (
                                        <div className="card old-card">
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="size-9 shrink-0"
                                                aria-hidden="true"
                                            >
                                                <rect x="3" y="5" width="18" height="14" rx="2" />
                                                <path d="m3 7 9 6 9-6" />
                                            </svg>
                                            <span className="old-name">{prev.envelope}</span>
                                        </div>
                                    ) : (
                                        <div className="card old-ghost">
                                            aucune enveloppe —
                                            <br />
                                            la lettre naît libre
                                        </div>
                                    )}
                                    <p className="stop-note">
                                        {prev ? (
                                            <span className="discarded">
                                                ✗ enveloppe abandonnée
                                            </span>
                                        ) : (
                                            <span className="bare">état initial</span>
                                        )}
                                    </p>
                                </section>

                                <div className="flow-arrow" aria-hidden="true">
                                    {prev && <i className="rupture">✗</i>}
                                </div>

                                <section className="stop stop-letter">
                                    <p className="stop-label">La lettre</p>
                                    <div className="paper">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="size-5 shrink-0"
                                            aria-hidden="true"
                                        >
                                            <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                                            <path d="M14 3v6h6" />
                                        </svg>
                                        <blockquote>«&nbsp;{level.letter}&nbsp;»</blockquote>
                                    </div>
                                    <p className="stop-note">
                                        {prev ? (
                                            <span className="neutral">extraite de l’enveloppe</span>
                                        ) : (
                                            <span className="neutral">nue, sans contenant</span>
                                        )}
                                    </p>
                                </section>

                                <div className="flow-arrow" aria-hidden="true" />

                                <section className="stop">
                                    <p className="stop-label">Interface · API</p>
                                    <div className="card api-card">
                                        <span className="api-glyph" aria-hidden="true">
                                            {'{ }'}
                                        </span>
                                        <span className="api-name">{level.api}</span>
                                    </div>
                                    <p className="stop-note">
                                        <span className="neutral">ouvre, lit, transfère</span>
                                    </p>
                                </section>

                                <div className="flow-arrow" aria-hidden="true" />

                                <section className="stop">
                                    <p className="stop-label">Nouvelle enveloppe</p>
                                    <div className="card new-card">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="size-9 shrink-0"
                                            aria-hidden="true"
                                        >
                                            <rect x="3" y="5" width="18" height="14" rx="2" />
                                            <path d="m3 7 9 6 9-6" />
                                        </svg>
                                        <span className="new-name">{level.envelope}</span>
                                    </div>
                                    <p className="stop-note">
                                        <span className="sealed">● neuve · scellée</span>
                                    </p>
                                </section>
                            </div>

                            <p className="action">
                                <span className="action-label">L’action</span>
                                {level.action}
                            </p>
                        </article>
                    );
                })}

                <footer
                    style={{
                        marginTop: '2.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1.5rem',
                    }}
                >
                    <button
                        type="button"
                        className="ctl"
                        disabled={index === 0}
                        onClick={() => go(index - 1)}
                    >
                        ← Précédent
                    </button>
                    <p
                        style={{ fontSize: '0.75rem', opacity: 0.6 }}
                        className="hidden sm:flex items-center gap-2"
                    >
                        clavier
                        <kbd
                            style={{
                                border: '1px solid currentColor',
                                borderRadius: '0.25rem',
                                padding: '0.15rem 0.4rem',
                            }}
                        >
                            ←
                        </kbd>
                        <kbd
                            style={{
                                border: '1px solid currentColor',
                                borderRadius: '0.25rem',
                                padding: '0.15rem 0.4rem',
                            }}
                        >
                            →
                        </kbd>
                    </p>
                    <button
                        type="button"
                        className="ctl ctl-next"
                        onClick={() => go(index === last ? 0 : index + 1)}
                    >
                        <span>{index === last ? 'Recommencer ↺' : 'Suivant →'}</span>
                    </button>
                </footer>
            </div>

            <p
                style={{
                    marginTop: '3.5rem',
                    maxWidth: '42rem',
                    fontSize: '0.8rem',
                    lineHeight: 1.6,
                    opacity: 0.7,
                }}
            >
                Ce voyage n’est pas un emboîtement à la poupée russe&nbsp;: il n’y a jamais qu’une
                seule enveloppe à la fois. À chaque niveau, l’interface ouvre l’ancienne, en extrait
                la lettre — qui ne change jamais — puis la referme dans une enveloppe taillée pour
                le médium suivant.
            </p>
        </div>
    );
}
