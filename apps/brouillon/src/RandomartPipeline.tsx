import { Badge } from '@repo/ui/components/Badge';
import { Card } from '@repo/ui/components/Card';
import { SectionHeading } from '@repo/ui/components/SectionHeading';
import { Stack } from '@repo/ui/components/Stack';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

import {
    COMPILE_STATS,
    DEFAULT_WEIGHTS,
    DRAW_TRACE,
    FORMULAS,
    GRAMMAR_BOUNDS,
    SHADER_SOURCE,
} from './randomartPipelineData';

const styles = stylex.create({
    scroll: {
        height: '100%',
        overflowY: 'auto',
        backgroundColor: 'light-dark(#f7f6f2, #171b22)',
    },
    page: {
        maxWidth: '1080px',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingTop: '40px',
        paddingBottom: '120px',
        paddingLeft: '28px',
        paddingRight: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '56px',
    },
    topbar: {
        position: 'sticky',
        top: 0,
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        paddingTop: '10px',
        paddingBottom: '10px',
        marginBottom: '-28px',
        backgroundColor: 'light-dark(#f7f6f2, #171b22)',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'light-dark(#d8dbd3, #343b45)',
    },
    nav: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '12px',
    },
    navLink: {
        color: 'light-dark(#4c35ad, #bcaaff)',
        textDecoration: 'none',
    },
    kicker: {
        fontFamily: 'var(--doc-mono)',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'light-dark(#4c35ad, #bcaaff)',
    },
    hero: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    },
    h1: {
        margin: 0,
        fontSize: 'clamp(32px, 5vw, 50px)',
        lineHeight: 1.1,
        letterSpacing: '-0.025em',
    },
    h2: {
        margin: 0,
        fontSize: '26px',
        lineHeight: 1.25,
        letterSpacing: '-0.015em',
    },
    h3: {
        marginTop: '22px',
        marginBottom: '8px',
        fontSize: '16px',
    },
    lede: {
        margin: 0,
        maxWidth: '780px',
        fontSize: '17px',
        lineHeight: 1.7,
        color: 'light-dark(#46505e, #b7c0cd)',
    },
    p: {
        marginTop: '10px',
        marginBottom: '10px',
        lineHeight: 1.75,
    },
    muted: {
        color: 'light-dark(#46505e, #b7c0cd)',
    },
    mono: {
        fontFamily: 'var(--doc-mono)',
    },
    inlineCode: {
        fontFamily: 'var(--doc-mono)',
        fontSize: '0.88em',
        paddingLeft: '4px',
        paddingRight: '4px',
        paddingTop: '1px',
        paddingBottom: '1px',
        borderRadius: '4px',
        backgroundColor: 'light-dark(#e9e8e0, #262d37)',
        color: 'light-dark(#3b2f8a, #d3c8ff)',
    },
    step: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        scrollMarginTop: '70px',
    },
    stepHead: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
    },
    stepNum: {
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '9999px',
        backgroundColor: 'light-dark(#3a2f8c, #6d5efc)',
        color: '#ffffff',
        fontFamily: 'var(--doc-mono)',
        fontSize: '13px',
        fontWeight: 700,
    },
    stepLead: {
        marginTop: '5px',
        marginBottom: 0,
        color: 'light-dark(#46505e, #b7c0cd)',
    },
    stepBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        paddingLeft: '50px',
    },
    flow: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        padding: '14px',
        borderRadius: '10px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'light-dark(#d8dbd3, #343b45)',
        backgroundColor: 'light-dark(#ffffff, #1d222b)',
    },
    flowBox: {
        fontFamily: 'var(--doc-mono)',
        fontSize: '12px',
        padding: '7px 10px',
        borderRadius: '7px',
        backgroundColor: 'light-dark(#eeecff, #2b2750)',
    },
    arrow: {
        color: 'light-dark(#4c35ad, #bcaaff)',
        fontWeight: 700,
    },
    figure: {
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    caption: {
        fontFamily: 'var(--doc-mono)',
        fontSize: '11px',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'light-dark(#5c6675, #a9b3c1)',
    },
    pre: {
        margin: 0,
        padding: '18px 20px',
        borderRadius: '10px',
        overflowX: 'auto',
        whiteSpace: 'pre',
        backgroundColor: '#151a22',
        color: '#e8edf4',
        fontFamily: 'var(--doc-mono)',
        fontSize: '12.5px',
        lineHeight: 1.65,
        tabSize: 4,
    },
    tableWrap: {
        overflowX: 'auto',
        borderRadius: '10px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'light-dark(#d8dbd3, #343b45)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13px',
    },
    th: {
        textAlign: 'left',
        padding: '9px 12px',
        backgroundColor: 'light-dark(#eeede7, #222832)',
        fontFamily: 'var(--doc-mono)',
        fontSize: '11px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
    },
    td: {
        padding: '8px 12px',
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        borderTopColor: 'light-dark(#e4e4dd, #2d343e)',
        verticalAlign: 'top',
    },
    tdMono: {
        fontFamily: 'var(--doc-mono)',
        whiteSpace: 'nowrap',
    },
    tdRight: {
        fontFamily: 'var(--doc-mono)',
        textAlign: 'right',
    },
    grid2: {
        display: 'grid',
        gridTemplateColumns: { default: '1fr', '@media (min-width: 860px)': '1fr 1fr' },
        gap: '14px',
    },
    callout: {
        gap: '8px',
    },
    noteTitle: {
        fontFamily: 'var(--doc-mono)',
        fontSize: '12px',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
    },
    details: {
        borderRadius: '10px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'light-dark(#d8dbd3, #343b45)',
        backgroundColor: 'light-dark(#ffffff, #1d222b)',
    },
    summary: {
        cursor: 'pointer',
        padding: '12px 16px',
        fontWeight: 600,
    },
    detailsBody: {
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingBottom: '16px',
    },
    footer: {
        paddingTop: '20px',
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        borderTopColor: 'light-dark(#d8dbd3, #343b45)',
        fontSize: '13px',
        color: 'light-dark(#46505e, #b7c0cd)',
    },
});

function roleOf(name: string): string {
    if (['x', 'y', 'const'].includes(name)) {
        return 'terminal';
    }
    if (['gt', 'select'].includes(name)) {
        return 'logique';
    }
    if (name === 'warp') {
        return 'transformation';
    }
    return 'arithmétique / trig.';
}

function Code({ text, caption }: { text: string; caption?: string }) {
    return (
        <figure {...stylex.props(styles.figure)}>
            {caption ? <figcaption {...stylex.props(styles.caption)}>{caption}</figcaption> : null}
            <pre {...stylex.props(styles.pre)}>
                <code>{text}</code>
            </pre>
        </figure>
    );
}

function Step({
    id,
    index,
    title,
    lead,
    children,
}: {
    id: string;
    index: number;
    title: string;
    lead: string;
    children: ReactNode;
}) {
    return (
        <section id={id} {...stylex.props(styles.step)}>
            <div {...stylex.props(styles.stepHead)}>
                <span {...stylex.props(styles.stepNum)}>{String(index).padStart(2, '0')}</span>
                <div>
                    <h2 {...stylex.props(styles.h2)}>{title}</h2>
                    <p {...stylex.props(styles.stepLead)}>{lead}</p>
                </div>
            </div>
            <div {...stylex.props(styles.stepBody)}>{children}</div>
        </section>
    );
}

function Callout({
    title,
    tone = 'aurora',
    children,
}: {
    title: string;
    tone?: 'aurora' | 'solder' | 'amber';
    children: ReactNode;
}) {
    return (
        <Card color={tone} background="soft" border="subtle" radius="md" style={styles.callout}>
            <span {...stylex.props(styles.noteTitle)}>{title}</span>
            <div>{children}</div>
        </Card>
    );
}

const TOC = [
    ['vue', 'Vue d’ensemble'],
    ['seed', 'La seed'],
    ['grammaire', 'La grammaire'],
    ['faisabilite', 'Faisabilité'],
    ['descente', 'La descente'],
    ['tronc', 'Tronc partagé'],
    ['arbre', 'L’arbre'],
    ['lecture', 'Lire l’arbre'],
    ['lower', 'Le DAG'],
    ['emit', 'L’émission GLSL'],
    ['shader', 'Le shader'],
    ['invariants', 'Invariants'],
] as const;

export function RandomartPipeline() {
    return (
        <div {...stylex.props(styles.scroll)}>
            <div {...stylex.props(styles.page)}>
                <div {...stylex.props(styles.topbar)}>
                    <span {...stylex.props(styles.kicker)}>Randomart · note de lecture</span>
                    <nav {...stylex.props(styles.nav)} aria-label="Sommaire">
                        {TOC.map(([id, label]) => (
                            <a key={id} href={`#${id}`} {...stylex.props(styles.navLink)}>
                                {label}
                            </a>
                        ))}
                    </nav>
                </div>

                <header {...stylex.props(styles.hero)}>
                    <h1 {...stylex.props(styles.h1)}>De la seed 42 à un shader GLSL</h1>
                    <p {...stylex.props(styles.lede)}>
                        Le chemin complet, étape par étape, avec les valeurs réelles produites par
                        le projet : grammaire <em>default</em>, seed{' '}
                        <code {...stylex.props(styles.inlineCode)}>{'"42"'}</code>, espace de
                        couleur <em>oklch</em>. Ce sont exactement les entrées des tests golden.
                    </p>
                    <Stack direction="horizontal" gap="2">
                        <Badge color="purple">seed 42</Badge>
                        <Badge color="aurora">grammar default</Badge>
                        <Badge color="solder">oklch</Badge>
                        <Badge color="amber">GENERATOR_VERSION 3</Badge>
                    </Stack>
                </header>

                <Step
                    id="vue"
                    index={0}
                    title="Vue d’ensemble"
                    lead="Neuf transformations, deux objets centraux : l’Expression (arbre) puis le DAG."
                >
                    <div {...stylex.props(styles.flow)}>
                        <span {...stylex.props(styles.flowBox)}>{'seed "42"'}</span>
                        <span {...stylex.props(styles.arrow)}>→</span>
                        <span {...stylex.props(styles.flowBox)}>createRng</span>
                        <span {...stylex.props(styles.arrow)}>→</span>
                        <span {...stylex.props(styles.flowBox)}>generateTrunk</span>
                        <span {...stylex.props(styles.arrow)}>→</span>
                        <span {...stylex.props(styles.flowBox)}>Expression {'{r,g,b}'}</span>
                        <span {...stylex.props(styles.arrow)}>→</span>
                        <span {...stylex.props(styles.flowBox)}>lower</span>
                        <span {...stylex.props(styles.arrow)}>→</span>
                        <span {...stylex.props(styles.flowBox)}>LoweredDag</span>
                        <span {...stylex.props(styles.arrow)}>→</span>
                        <span {...stylex.props(styles.flowBox)}>emit</span>
                        <span {...stylex.props(styles.arrow)}>→</span>
                        <span {...stylex.props(styles.flowBox)}>GLSL</span>
                    </div>
                    <p {...stylex.props(styles.p)}>
                        L’orchestration est dans{' '}
                        <code {...stylex.props(styles.inlineCode)}>
                            packages/randomart-ui/src/artwork/artwork.ts
                        </code>{' '}
                        :{' '}
                        <code {...stylex.props(styles.inlineCode)}>
                            buildArtwork(grammar, seed, space)
                        </code>{' '}
                        appelle <code {...stylex.props(styles.inlineCode)}>generate()</code> puis{' '}
                        <code {...stylex.props(styles.inlineCode)}>compile()</code>. L’espace de
                        couleur n’intervient qu’à la compilation : changer d’espace ne régénère pas
                        l’arbre.
                    </p>
                    <Callout title="Idée clé">
                        <p {...stylex.props(styles.p)}>
                            Il n’y a <strong>pas de parser de texte</strong>. Le générateur fait le
                            travail d’un parser LL / <em>top-down à l’envers</em> : il construit
                            l’arbre de dérivation au lieu de le reconnaître. Chaque opérateur a un
                            nom et une arité uniques, donc pas de lookahead FIRST/FOLLOW ni
                            d’ambiguïté.
                        </p>
                    </Callout>
                </Step>

                <Step
                    id="seed"
                    index={1}
                    title="La seed devient un flux de tirages"
                    lead="Une identité textuelle, un hash, puis un générateur déterministe."
                >
                    <Code
                        caption="packages/randomart-core/src/rng.ts · seed.ts"
                        text={`createSeed("42")            → Seed  (chaîne trimmée, ≤ 64 caractères)

createRng(seed):
  xmur3("42")()             → uint32 initial
  mulberry32(uint32)        → next() dans [0, 1)
  int(max)                  = floor(next() * max)
  weighted(pool, weightOf)  = next() * Σ poids, puis marche dans l'ordre canonique`}
                    />
                    <p {...stylex.props(styles.p)}>
                        La seed est une <em>chaîne</em> :{' '}
                        <code {...stylex.props(styles.inlineCode)}>42</code> et{' '}
                        <code {...stylex.props(styles.inlineCode)}>{'" 42 "'}</code> désignent la
                        même entrée. Le flux est figé pour toujours : même seed + même grammaire ⇒
                        même expression. Le premier tirage de{' '}
                        <code {...stylex.props(styles.inlineCode)}>42</code> vaut{' '}
                        <span {...stylex.props(styles.mono)}>0.16827</span> — c’est lui qui choisira
                        l’opérateur racine.
                    </p>
                    <Code
                        caption="journal réel — premiers tirages"
                        text={`#   type       profondeur / budget   résultat
1   opérateur   d1 / 25                add      (raw 0.16827)
2   opérateur   d2 / 12                max      (raw 0.28864)
3   opérateur   d3 / 5                 cos      (raw 0.18515)
4   opérateur   d4 / 4                 smax     (raw 0.62074)
5   paramètre   smax.k                 0.5      (raw 0.96120 → grille 0.05)
6   opérateur   d5 / 1                 const    (raw 0.19623)
7   paramètre   const.value            -0.574   (raw 0.21280 → continu [-1,1])
8   opérateur   d5 / 2                 x        (raw 0.25945)
9   paramètre   x.amp                  0.3      (raw 0.29313)
10  paramètre   x.phase                1        (raw 0.93750)
11  paramètre   x.cycles               1        (raw 0.20258)`}
                    />
                </Step>

                <Step
                    id="grammaire"
                    index={2}
                    title="La grammaire pose les règles du jeu"
                    lead="Un catalogue d’opérateurs, des poids et quatre bornes de dérivation."
                >
                    <div {...stylex.props(styles.grid2)}>
                        <Code
                            caption="Grammar (preset default)"
                            text={`{
  weights: { /* voir le tableau */ },
  minDepth:   ${GRAMMAR_BOUNDS.minDepth},
  maxDepth:   ${GRAMMAR_BOUNDS.maxDepth},
  maxNodes:   ${GRAMMAR_BOUNDS.maxNodes},
  shareDepth: ${GRAMMAR_BOUNDS.shareDepth},
}
space: 'oklch'  (hors grammaire)`}
                        />
                        <div {...stylex.props(styles.tableWrap)}>
                            <table {...stylex.props(styles.table)}>
                                <thead>
                                    <tr>
                                        <th {...stylex.props(styles.th)}>Opérateur</th>
                                        <th {...stylex.props(styles.th)}>Poids</th>
                                        <th {...stylex.props(styles.th)}>Rôle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {DEFAULT_WEIGHTS.map(([name, weight]) => (
                                        <tr key={name}>
                                            <td {...stylex.props(styles.td, styles.tdMono)}>
                                                {name}
                                            </td>
                                            <td {...stylex.props(styles.td, styles.tdRight)}>
                                                {weight}
                                            </td>
                                            <td {...stylex.props(styles.td)}>{roleOf(name)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <h3 {...stylex.props(styles.h3)}>Traduction avec les notions de compilateur</h3>
                    <div {...stylex.props(styles.tableWrap)}>
                        <table {...stylex.props(styles.table)}>
                            <thead>
                                <tr>
                                    <th {...stylex.props(styles.th)}>Notion vue dans la vidéo</th>
                                    <th {...stylex.props(styles.th)}>Équivalent randomart</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    [
                                        'Grammaire CFG',
                                        'Grammar (grammar.ts) + catalogue OPS (ops.ts)',
                                    ],
                                    [
                                        'Règle de production',
                                        'Op → op(params, enfant₁ … enfantₙ), arité fixe',
                                    ],
                                    [
                                        'Terminal / non-terminal',
                                        'arity === 0 (x, y, const) / arity > 0',
                                    ],
                                    ['Choix par lookahead', 'rng.weighted(pool, weightOf)'],
                                    ['Arbre de syntaxe', 'Node / Expression (tree.ts)'],
                                    ['Analyse de grammaire', 'createMinimumSizer (DP bottom-up)'],
                                    ['IR / CSE', 'lower.ts (hash-consing, comptage d’usages)'],
                                    ['Unparse', 'formatFormula() → chaîne préfixée'],
                                    ['Parser', 'absent ; seul deserialize() valide du JSON'],
                                ].map(([left, right]) => (
                                    <tr key={left}>
                                        <td {...stylex.props(styles.td)}>{left}</td>
                                        <td {...stylex.props(styles.td)}>{right}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Step>

                <Step
                    id="faisabilite"
                    index={3}
                    title="Faisabilité : vérifier avant de tirer"
                    lead="Le même invariant sert à rejeter une grammaire et à borner chaque nœud."
                >
                    <Code
                        caption="createMinimumSizer — récurrence bottom-up"
                        text={`minimumSize(d) = 1                                       si d >= minDepth
                = min over O non-terminal : 1 + arity(O) * minimumSize(d+1)

minimumNodes(grammar) = createMinimumSizer(vocabulary, minDepth)(1)`}
                    />
                    <p {...stylex.props(styles.p)}>
                        Exemple du test{' '}
                        <code {...stylex.props(styles.inlineCode)}>grammar.test.ts</code> avec{' '}
                        <code {...stylex.props(styles.inlineCode)}>{'{ add: 1, x: 1 }'}</code> et{' '}
                        <code {...stylex.props(styles.inlineCode)}>minDepth: 3</code> :{' '}
                        <span {...stylex.props(styles.mono)}>
                            minimumSize(3)=1, minimumSize(2)=3, minimumSize(1)=7
                        </span>
                        . Donc <code {...stylex.props(styles.inlineCode)}>maxNodes: 7</code> passe,
                        6 lève une{' '}
                        <code {...stylex.props(styles.inlineCode)}>InfeasibleGrammarError</code>.
                        Ici le preset default a des opérateurs unaires, donc{' '}
                        <span {...stylex.props(styles.mono)}>minimumNodes = 2</span> ≪ 25 : c’est
                        largement faisable.{' '}
                        <code {...stylex.props(styles.inlineCode)}>shareDepth</code> est ignoré dans
                        ce calcul car le tronc est répliqué dans chaque canal.
                    </p>
                    <Callout title="Question ouverte du document de départ" tone="amber">
                        <p {...stylex.props(styles.p)}>
                            Dès qu’un non-terminal unaire est activé, faisable ⇔{' '}
                            <code {...stylex.props(styles.inlineCode)}>maxNodes ≥ minDepth</code>.
                            On pourrait donc construire une grammaire faisable par construction au
                            lieu des 100 essais de{' '}
                            <code {...stylex.props(styles.inlineCode)}>drawGrammar()</code>. Mais
                            les pins sont un contrat : on réparerait le <em>vocabulaire</em>, jamais
                            les pins. La consommation RNG changerait (d’autres grammaires pour la
                            même rngSeed), sans toucher au mapping{' '}
                            <code {...stylex.props(styles.inlineCode)}>
                                (grammar, seed) → expression
                            </code>
                            .
                        </p>
                    </Callout>
                </Step>

                <Step
                    id="descente"
                    index={4}
                    title="La descente récursive, cœur du générateur"
                    lead="drawOperator → drawParams → buildChildren, depuis la racine jusqu’aux terminaux."
                >
                    <Code
                        caption="packages/randomart-core/src/generate.ts (simplifié)"
                        text={`generate(grammar, seed):
  rng = createRng(seed)
  minimumSize = createMinimumSizer(vocab, grammar.minDepth)
  trunk = generateTrunk(state, depth = 1, budget = grammar.maxNodes)

generateNode(state, depth, budget):
  name     = drawOperator(state, depth, budget)
  params   = drawParams(state, name)
  children = arity === 0 ? [] : buildChildren(..., child => generateNode(depth + 1, child))
  return createNode(name, children, params)`}
                    />
                    <h3 {...stylex.props(styles.h3)}>1. Choisir une production</h3>
                    <p {...stylex.props(styles.p)}>
                        <code {...stylex.props(styles.inlineCode)}>drawOperator</code> filtre le
                        vocabulaire : un terminal est autorisé seulement si{' '}
                        <code {...stylex.props(styles.inlineCode)}>depth ≥ minDepth</code> ; un
                        non-terminal seulement si{' '}
                        <code {...stylex.props(styles.inlineCode)}>depth &lt; maxDepth</code> et si{' '}
                        <span {...stylex.props(styles.mono)}>
                            1 + arité × minimumSize(depth+1) ≤ budget
                        </span>
                        . À la racine,{' '}
                        <code {...stylex.props(styles.inlineCode)}>LOGIC_MIN_DEPTH = 2</code> retire{' '}
                        <code {...stylex.props(styles.inlineCode)}>gt</code> et{' '}
                        <code {...stylex.props(styles.inlineCode)}>select</code> pour garder des
                        canaux continus. Le pool est ensuite tiré au poids dans l’ordre alphabétique
                        des noms.
                    </p>
                    <div {...stylex.props(styles.tableWrap)}>
                        <table {...stylex.props(styles.table)}>
                            <thead>
                                <tr>
                                    <th {...stylex.props(styles.th)}>Profondeur</th>
                                    <th {...stylex.props(styles.th)}>Budget</th>
                                    <th {...stylex.props(styles.th)}>Pool</th>
                                    <th {...stylex.props(styles.th)}>Tirage</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td {...stylex.props(styles.td, styles.tdMono)}>1</td>
                                    <td {...stylex.props(styles.td, styles.tdRight)}>25</td>
                                    <td {...stylex.props(styles.td)}>
                                        14 non-terminaux non-logiques
                                    </td>
                                    <td {...stylex.props(styles.td, styles.tdMono)}>add</td>
                                </tr>
                                <tr>
                                    <td {...stylex.props(styles.td, styles.tdMono)}>2</td>
                                    <td {...stylex.props(styles.td, styles.tdRight)}>12</td>
                                    <td {...stylex.props(styles.td)}>19 opérateurs</td>
                                    <td {...stylex.props(styles.td, styles.tdMono)}>max</td>
                                </tr>
                                <tr>
                                    <td {...stylex.props(styles.td, styles.tdMono)}>3 → 4</td>
                                    <td {...stylex.props(styles.td, styles.tdRight)}>5 → 4</td>
                                    <td {...stylex.props(styles.td)}>19 opérateurs</td>
                                    <td {...stylex.props(styles.td, styles.tdMono)}>cos, smax</td>
                                </tr>
                                <tr>
                                    <td {...stylex.props(styles.td, styles.tdMono)}>5</td>
                                    <td {...stylex.props(styles.td, styles.tdRight)}>1 ou 2</td>
                                    <td {...stylex.props(styles.td)}>3 terminaux (const, x, y)</td>
                                    <td {...stylex.props(styles.td, styles.tdMono)}>const, x, …</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <h3 {...stylex.props(styles.h3)}>2. Tirer les paramètres</h3>
                    <p {...stylex.props(styles.p)}>
                        <code {...stylex.props(styles.inlineCode)}>drawParams</code> parcourt les
                        paramètres dans l’ordre de déclaration de l’opérateur : continu arrondi à 3
                        décimales, ou grille discrète quand{' '}
                        <code {...stylex.props(styles.inlineCode)}>step</code> est défini. Exemple :{' '}
                        <span {...stylex.props(styles.mono)}>smax.k = 0.5</span> (grille 0.05),{' '}
                        <span {...stylex.props(styles.mono)}>x(amp=0.3, phase=1, cycles=1)</span>{' '}
                        (grille 0.1).
                    </p>
                    <h3 {...stylex.props(styles.h3)}>3. Répartir le budget</h3>
                    <Code
                        caption="buildChildren"
                        text={`minimum = minimumSize(depth + 1)          // ici 1
remaining = budget - 1 - arity * minimum   // 25 - 1 - 2 = 22
for i in 0..arity-1:
  share = floor(remaining / max(1, arity - i))
  enfant = build(minimum + share)
  remaining -= enfant.size - minimum

→ enfant 1 : budget 12, produit 12 nœuds (max)
→ remaining = 22 - (12 - 1) = 11
→ enfant 2 : budget 12, produit x(0.3, 0.8, 1)`}
                    />
                    <details {...stylex.props(styles.details)}>
                        <summary {...stylex.props(styles.summary)}>
                            Journal complet des 64 tirages (25 opérateurs + 39 paramètres)
                        </summary>
                        <div {...stylex.props(styles.detailsBody)}>
                            <div {...stylex.props(styles.tableWrap)}>
                                <table {...stylex.props(styles.table)}>
                                    <thead>
                                        <tr>
                                            <th {...stylex.props(styles.th)}>#</th>
                                            <th {...stylex.props(styles.th)}>Type</th>
                                            <th {...stylex.props(styles.th)}>Contexte</th>
                                            <th {...stylex.props(styles.th)}>Résultat</th>
                                            <th {...stylex.props(styles.th)}>Raw</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {DRAW_TRACE.map(([n, kind, depth, budget, name, value]) => (
                                            <tr key={n}>
                                                <td {...stylex.props(styles.td, styles.tdRight)}>
                                                    {n}
                                                </td>
                                                <td {...stylex.props(styles.td)}>
                                                    {kind === 'op' ? 'opérateur' : 'paramètre'}
                                                </td>
                                                <td {...stylex.props(styles.td, styles.tdMono)}>
                                                    {depth === null
                                                        ? name.split('.')[0]
                                                        : `d${depth} / ${budget}`}
                                                </td>
                                                <td {...stylex.props(styles.td, styles.tdMono)}>
                                                    {name}
                                                    {kind === 'p' ? ` = ${value}` : ''}
                                                </td>
                                                <td {...stylex.props(styles.td, styles.tdRight)}>
                                                    {value}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </details>
                </Step>

                <Step
                    id="tronc"
                    index={5}
                    title="Tronc partagé, canaux divergents"
                    lead="shareDepth = 2 : les deux premiers niveaux sont tirés une seule fois."
                >
                    <p {...stylex.props(styles.p)}>
                        <code {...stylex.props(styles.inlineCode)}>generateTrunk</code> tire
                        l’opérateur et ses enfants une seule fois tant que{' '}
                        <code {...stylex.props(styles.inlineCode)}>depth ≤ shareDepth</code>, puis
                        réplique le même nœud dans r, g et b. En dessous,{' '}
                        <code {...stylex.props(styles.inlineCode)}>generateNode</code> est appelé
                        trois fois indépendamment : les canaux divergent.
                    </p>
                    <Code
                        caption="ce que la seed 42 produit"
                        text={`d1  add              ← tiré une fois (partagé)
     ├─ d2  max        ← tiré une fois (partagé)
     │      ├─ d3 cos(…)    ← canal r
     │      ├─ d3 x(…)      ← canal g
     │      └─ d3 mul(…)    ← canal b
     └─ d2  x(0.3, 0.8, 1)  ← tiré une fois (partagé)

résultat : x(amp=0.3, phase=0.8, cycles=1) est le 2e enfant
de add dans LES TROIS canaux — ce n’est pas une coïncidence.`}
                    />
                    <Callout title="Pourquoi c’est visible dans le GLSL" tone="solder">
                        <p {...stylex.props(styles.p)}>
                            Le partage « logique » du tronc est retrouvé « physiquement » par{' '}
                            <code {...stylex.props(styles.inlineCode)}>lower()</code> grâce à
                            l’égalité structurelle. Le terminal partagé est utilisé 3 fois → il est
                            hissé en variable{' '}
                            <code {...stylex.props(styles.inlineCode)}>float v0 = …</code> par{' '}
                            <code {...stylex.props(styles.inlineCode)}>emit()</code>.
                        </p>
                    </Callout>
                </Step>

                <Step
                    id="arbre"
                    index={6}
                    title="L’arbre de dérivation obtenu"
                    lead="Trois arbres immuables, un par canal ; voici celui de r."
                >
                    <Code
                        caption="canal r — 12 nœuds, profondeur 5"
                        text={`add                                   d1 · partagé
├─ max                                d2 · partagé
│  ├─ cos                             d3 · r
│  │  └─ smax(k=0.5)
│  │     ├─ const(value=-0.574)
│  │     └─ x(amp=0.3, phase=1, cycles=1)
│  └─ mix
│     ├─ y(amp=0.9, phase=1, cycles=4)
│     ├─ x(amp=0.2, phase=0.7, cycles=4)
│     └─ mul
│        ├─ y(amp=0.9, phase=0.7, cycles=1)
│        └─ y(amp=0.8, phase=0.8, cycles=1)
└─ x(amp=0.3, phase=0.8, cycles=1)    d2 · partagé`}
                    />
                    <details {...stylex.props(styles.details)}>
                        <summary {...stylex.props(styles.summary)}>
                            Les trois formules complètes
                        </summary>
                        <div {...stylex.props(styles.detailsBody)}>
                            {(['r', 'g', 'b'] as const).map((channel) => (
                                <Code
                                    key={channel}
                                    caption={`expression.${channel}`}
                                    text={FORMULAS[channel]}
                                />
                            ))}
                        </div>
                    </details>
                </Step>

                <Step
                    id="lecture"
                    index={7}
                    title="Lire l’arbre sans le relire"
                    lead="formatFormula est un unparse en lecture seule ; deserialize est l’unique garde-fou."
                >
                    <p {...stylex.props(styles.p)}>
                        <code {...stylex.props(styles.inlineCode)}>formatFormula()</code> produit la
                        chaîne préfixée affichée dans l’<em>Inspector</em>. Rien ne la réinterprète.
                        Les seules frontières de lecture sont{' '}
                        <code {...stylex.props(styles.inlineCode)}>deserialize()</code> (validation
                        récursive du JSON : version, champs, arité, bornes, profondeur, chemins
                        d’erreur) et <code {...stylex.props(styles.inlineCode)}>parseSeed()</code>{' '}
                        (trim + longueur max).{' '}
                        <code {...stylex.props(styles.inlineCode)}>emit()</code> ne parse pas le
                        GLSL : il s’appuie sur le contrat{' '}
                        <code {...stylex.props(styles.inlineCode)}>isAtom</code> pour décider des
                        parenthèses.
                    </p>
                </Step>

                <Step
                    id="lower"
                    index={8}
                    title="Duplication → DAG"
                    lead="lower() est le seul parcours bottom-up du pipeline de génération."
                >
                    <p {...stylex.props(styles.p)}>
                        Parcours post-order : chaque nœud devient une clé{' '}
                        <code {...stylex.props(styles.inlineCode)}>
                            {'`${contexte}|${op}|${params}|${inputs}`'}
                        </code>
                        . Si la clé existe déjà, on réutilise le sommet ; sinon on l’ajoute à
                        l’ordre topologique. Chaque référence incrémente un compteur d’usages. Un{' '}
                        <code>nœud warp</code> crée un <em>contexte</em> (
                        <code {...stylex.props(styles.inlineCode)}>vec2 c1</code>) au lieu d’un
                        sommet.
                    </p>
                    <div {...stylex.props(styles.grid2)}>
                        <Card color="purple" background="soft" border="subtle" radius="md">
                            <SectionHeading title="Résultat pour seed 42" color="purple" />
                            <p {...stylex.props(styles.p)}>
                                <span {...stylex.props(styles.mono)}>roots = [12, 18, 27]</span>
                                <br />
                                <span {...stylex.props(styles.mono)}>
                                    vertices = {COMPILE_STATS.vertices}
                                </span>
                                <br />
                                <span {...stylex.props(styles.mono)}>
                                    contexts = {COMPILE_STATS.contexts}
                                </span>
                                <br />
                                <span {...stylex.props(styles.mono)}>
                                    variables = {COMPILE_STATS.variables}
                                </span>
                            </p>
                        </Card>
                        <Code
                            caption="ce que compte le compteur d’usages"
                            text={`x(amp=0.3, phase=0.8, cycles=1)
  ├─ enfant de add (d2)   → canal r
  ├─ enfant de add (d2)   → canal g
  └─ enfant de add (d2)   → canal b

usages = 3  ⇒  emit() écrit  float v0 = ...;
              et réutilise  v0  aux 3 endroits`}
                        />
                    </div>
                </Step>

                <Step
                    id="emit"
                    index={9}
                    title="Émission du GLSL"
                    lead="Chaque sommet devient une chaîne, puis le shader est assemblé."
                >
                    <div {...stylex.props(styles.tableWrap)}>
                        <table {...stylex.props(styles.table)}>
                            <thead>
                                <tr>
                                    <th {...stylex.props(styles.th)}>Opérateur</th>
                                    <th {...stylex.props(styles.th)}>GLSL produit</th>
                                    <th {...stylex.props(styles.th)}>Remarque</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['add(a,b)', '(a+b)*0.5', 'moyenne, bornée dans [-1,1]'],
                                    ['max(a,b)', 'max(a,b)', 'passé direct'],
                                    [
                                        'smax(a,b,k)',
                                        'ra_smax(a,b,0.5)',
                                        'fonction auxiliaire injectée',
                                    ],
                                    ['cos(a)', 'cos(PI*a)', 'période 2 sur [-1,1]'],
                                    [
                                        'const(-0.574)',
                                        '(-0.574)',
                                        'négatif parenthésé : c’est un atome',
                                    ],
                                    [
                                        'x(amp=0.3,…)',
                                        'mix(v_p.x, sin(…), 0.3)',
                                        'v_p = coordonnée pixel',
                                    ],
                                ].map(([op, glsl, note]) => (
                                    <tr key={op}>
                                        <td {...stylex.props(styles.td, styles.tdMono)}>{op}</td>
                                        <td {...stylex.props(styles.td, styles.tdMono)}>{glsl}</td>
                                        <td {...stylex.props(styles.td)}>{note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p {...stylex.props(styles.p)}>
                        L’ordre d’émission est l’ordre topologique du DAG. Pour chaque sommet,{' '}
                        <code {...stylex.props(styles.inlineCode)}>expressionOf()</code> parenthèse
                        les entrées quand{' '}
                        <code {...stylex.props(styles.inlineCode)}>isAtom === false</code> (un
                        terminal doit toujours produire une expression primaire). Si un sommet est
                        utilisé ≥ 2 fois, on écrit{' '}
                        <code {...stylex.props(styles.inlineCode)}>float vN = …;</code>. Enfin,{' '}
                        <code {...stylex.props(styles.inlineCode)}>compile()</code> préfixe le
                        header, les fonctions requises (
                        <code {...stylex.props(styles.inlineCode)}>ra_smax</code>), le hook de temps
                        (<code {...stylex.props(styles.inlineCode)}>ra_phase</code> car des
                        terminaux utilisent{' '}
                        <code {...stylex.props(styles.inlineCode)}>u_phase</code>), la fonction de
                        couleur (<code {...stylex.props(styles.inlineCode)}>ra_oklch</code>), puis{' '}
                        <code {...stylex.props(styles.inlineCode)}>mainImage</code>.
                    </p>
                    <Code
                        caption="structure du shader"
                        text={`SHADER_HEADER
float ra_smax(...)        ← requis par smax
float ra_phase()          ← animated = true
vec3 ra_oklabToLinear(…) / ra_inGamut / ra_oklabToSrgb / vec3 ra_oklch(…)

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 v_p = fragCoord / iResolution.xy * 2.0 - 1.0;
    float u_phase = ra_phase();
    float v0 = mix(v_p.x, sin(2.0*PI*1.0*u_phase+PI*0.8), 0.3);

    fragColor = vec4(ra_oklch(vec3(R, G, B)), 1.0);
}`}
                    />
                </Step>

                <Step
                    id="shader"
                    index={10}
                    title="Le shader complet"
                    lead="68 lignes, 2 942 caractères, générés sans aucune chaîne écrite à la main."
                >
                    <details {...stylex.props(styles.details)} open>
                        <summary {...stylex.props(styles.summary)}>
                            Afficher le GLSL intégral (seed 42 · default · oklch)
                        </summary>
                        <div {...stylex.props(styles.detailsBody)}>
                            <Code text={SHADER_SOURCE} />
                        </div>
                    </details>
                </Step>

                <Step
                    id="invariants"
                    index={11}
                    title="Ce qui change et ce qui ne change pas"
                    lead="Les points à retenir pour ne pas casser la reproductibilité."
                >
                    <div {...stylex.props(styles.tableWrap)}>
                        <table {...stylex.props(styles.table)}>
                            <thead>
                                <tr>
                                    <th {...stylex.props(styles.th)}>Action</th>
                                    <th {...stylex.props(styles.th)}>Effet</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Changer la seed', 'Nouvelle expression, nouveau shader.'],
                                    [
                                        'Modifier un poids',
                                        'Nouvelle expression pour la même seed ; la grammaire est stockée dans l’Artwork.',
                                    ],
                                    [
                                        'Changer d’espace de couleur',
                                        'recompileArtwork() : même expression, seul le shader change.',
                                    ],
                                    [
                                        'Modifier l’algorithme de génération',
                                        'Bump de GENERATOR_VERSION (actuellement 3) : les seeds persistées doivent être rejouées avec leur version.',
                                    ],
                                    [
                                        'Modifier drawGrammar() (faisabilité constructive)',
                                        'Aucun bump : le mapping (grammar, seed) → expression est inchangé ; mais la consommation RNG change, donc les grammaires et certains goldens bougent.',
                                    ],
                                ].map(([action, effect]) => (
                                    <tr key={action}>
                                        <td {...stylex.props(styles.td)}>{action}</td>
                                        <td {...stylex.props(styles.td)}>{effect}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Callout title="Et le bottom-up ?" tone="amber">
                        <p {...stylex.props(styles.p)}>
                            Démarrer des terminaux et réduire k sous-arbres avec un opérateur
                            d’arité k donnerait le même ensemble d’arbres, mais avec une mesure
                            d’échantillonnage différente et une correspondance seed → expression
                            modifiée. On perdrait le contrôle direct de{' '}
                            <code {...stylex.props(styles.inlineCode)}>minDepth</code>,{' '}
                            <code {...stylex.props(styles.inlineCode)}>shareDepth</code> et le
                            fail-fast de{' '}
                            <code {...stylex.props(styles.inlineCode)}>createGrammar()</code>. Le LR
                            au sens strict (pile, états, conflits shift/reduce) n’a pas de sens sans
                            texte à reconnaître.
                        </p>
                    </Callout>
                </Step>

                <footer {...stylex.props(styles.footer)}>
                    Sources :{' '}
                    <span {...stylex.props(styles.mono)}>
                        packages/randomart-core/src/
                        {'{seed,rng,grammar,ops,generate,tree,lower,emit}.ts'}
                    </span>
                    ,{' '}
                    <span {...stylex.props(styles.mono)}>
                        packages/randomart-ui/src/artwork/artwork.ts
                    </span>
                    , <span {...stylex.props(styles.mono)}>_TMP/randomart-grammar-suite.md</span>.
                    Les valeurs affichées ont été extraites en exécutant le code du dépôt, pas
                    recopiées à la main.
                </footer>
            </div>
        </div>
    );
}
