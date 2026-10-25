export function Note() {
    return (
        <div className="note-root">
            <p>This is an invitation to a walk.</p>
            <p>At every crossroads we will ask a simple question:</p>
            <blockquote>What if ?</blockquote>
            <p>
                It is this question, asked again and again, that builds the whole architecture of
                numbers.
            </p>
            <p>From the ground up, step by step.</p>
            <br />
            <br />
            <h2 className="text-primary my-8 text-center text-2xl font-bold sm:text-3xl">
                <span className="text-muted-foreground/50 border-border inline-flex aspect-square w-fit items-center rounded-full border px-4 text-sm font-medium">
                    <p>Step 01</p>
                </span>
                <div className="mt-16 flex items-center gap-4">
                    <span className="shrink-0">The Natural Numbers</span>
                    <div className="bg-border h-px flex-grow"></div>
                    <span className="text-accent shrink-0">N</span>
                </div>
            </h2>
            <br />
            <p>We must begin somewhere.</p>
            <blockquote>What if something exists ?</blockquote>
            <p>Call it "1". Then we add a single rule:</p>
            <pre>
                <code>If a number exists, its successor also exists.</code>
            </pre>
            <div className="not-prose border-secondary bg-secondary/5 text-secondary my-8 border-l-4 p-6 text-xl">
                <span className="block pl-4">1 + 1 = something</span>
            </div>
            <p>The mechanism is as simple as it is tireless.</p>
            <p>From one brick and one generative rule, an infinite set unfolds.</p>
            <p>1 + 2 + 3 + ... infinity = N</p>
            <br />
            <p>Then, multiplication is not a new invention.</p>
            <pre>
                <code>It is just a compact notation for repeated addition.</code>
            </pre>
            <p>1 + 1 = 1 x 2</p>
            <br />
            <br />
            <h2 className="text-primary my-8 text-center text-2xl font-bold sm:text-3xl">
                <span className="text-muted-foreground/50 border-border inline-flex aspect-square w-fit items-center rounded-full border px-4 text-sm font-medium">
                    <p>Step 02</p>
                </span>
                <div className="mt-16 flex items-center gap-4">
                    <span className="shrink-0">Zero and the Negatives</span>
                    <div className="bg-border h-px flex-grow"></div>
                    <span className="text-accent shrink-0">Z</span>
                </div>
            </h2>
            <br />
            <blockquote>What if we undo the addition ?</blockquote>
            <pre>
                <code>If we can add, we must be able to reverse the operation.</code>
            </pre>
            <p>We invent subtraction. And for a while, everything holds.</p>
            <br />
            <p>Then someone dares to write:</p>
            <div className="not-prose border-secondary bg-secondary/5 text-secondary my-8 border-l-4 p-6 text-xl">
                <span className="block pl-4">1 - 1 = something</span>
            </div>
            <p>Silence.</p>
            <br />
            <blockquote>The result should exist.</blockquote>
            <pre>
                <code>The answer lives nowhere in our universe.</code>
            </pre>
            <p>We have only one option: enlarge it.</p>
            <p>We invent a new symbol for the void: "0"</p>
            <p>And a new direction for the negatives: "-1".</p>
            <p>
                We give the <strong>negative numbers</strong> somewhere to live. The integers.
            </p>
            <br />
            <br />
            <h2 className="text-primary my-8 text-center text-2xl font-bold sm:text-3xl">
                <span className="text-muted-foreground/50 border-border inline-flex aspect-square w-fit items-center rounded-full border px-4 text-sm font-medium">
                    <p>Step 03</p>
                </span>
                <div className="mt-16 flex items-center gap-4">
                    <span className="shrink-0">The Rational Numbers</span>
                    <div className="bg-border h-px flex-grow"></div>
                    <span className="text-accent shrink-0">Q</span>
                </div>
            </h2>
            <br />
            <blockquote>What if we undo a multiplication ?</blockquote>
            <p>
                The same reasoning repeats. If we can multiply, we must be able to invert the
                operation.
            </p>
            <p>We invent division. And once again at the beginning, everything works perfectly.</p>
            <br />
            <blockquote>But what if it doesn't divide cleanly ?</blockquote>
            <div className="not-prose border-secondary bg-secondary/5 text-secondary my-8 border-l-4 p-6 text-xl">
                <span className="block pl-4">1 / 2 = something</span>
            </div>
            <pre>
                <code>
                    The space between the integers is empty. There are no positions between one and
                    two.
                </code>
            </pre>
            <p>We invent new symbols to describe the pieces.</p>
            <br />
            <p>a/b, where a, b E Z and b != 0.</p>
            <br />
            <p>These new numbers need a home.</p>
            <blockquote>The number line becomes dense in Q.</blockquote>
            <br />
            <br />
            <h2 className="text-primary my-8 text-center text-2xl font-bold sm:text-3xl">
                <span className="text-muted-foreground/50 border-border inline-flex aspect-square w-fit items-center rounded-full border px-4 text-sm font-medium">
                    <p>Step 04</p>
                </span>
                <div className="mt-16 flex items-center gap-4">
                    <span className="shrink-0">The Real Numbers</span>
                    <div className="bg-border h-px flex-grow"></div>
                    <span className="text-accent shrink-0">R</span>
                </div>
            </h2>
            <br />
            <p>From multiplication, we derive exponentiation.</p>
            <p>3 x 3 x 3 = 3^3</p>
            <pre>
                <code>It is just a fancy notation.</code>
            </pre>
            <br />
            <blockquote>What if we undo the exponentiation ?</blockquote>
            <p>We build a tool for it: the square root.</p>
            <p>sqrt(a) = b means that b^2 = a</p>
            <p>For a while it was fine. Then a crack appeared in the geometry.</p>
            <br />
            <blockquote>What if we undo the square of 2 ?</blockquote>
            <div className="not-prose border-secondary bg-secondary/5 text-secondary my-8 border-l-4 p-6 text-xl">
                <span className="block pl-4">sqrt(2) = something</span>
            </div>
            <pre>
                <code>
                    We checked every fraction. No two integers can be divided to produce this ratio.
                    It cannot be written.
                </code>
            </pre>
            <p>The Real Numbers R are born to fill the infinite gaps.</p>
            <p>sqrt(2), pi, e, 3.33333333... are real numbers</p>
            <br />
            <br />
            <h2 className="text-primary my-8 text-center text-2xl font-bold sm:text-3xl">
                <span className="text-muted-foreground/50 border-border inline-flex aspect-square w-fit items-center rounded-full border px-4 text-sm font-medium">
                    <p>Step 05</p>
                </span>
                <div className="mt-16 flex items-center gap-4">
                    <span className="shrink-0">The Imaginary Unit</span>
                    <div className="bg-border h-px flex-grow"></div>
                    <span className="text-accent shrink-0">i</span>
                </div>
            </h2>
            <br />
            <p>
                We have noticed that when you square a real number, the result is always positive.
                Even if you square a negative number, the result is still positive.
            </p>
            <p>It enforces one absolute law of our reality:</p>
            <p>Every real square is &gt;= 0.</p>
            <br />
            <blockquote>What if we allow a square to be a negative number ?</blockquote>
            <pre>
                <code>The equation x^2 + 1 = 0 has no real solution.</code>
            </pre>
            <p>
                Mathematicians chose to act rather than retreat. They postulated the existence of a
                number i such that:
            </p>
            <div className="not-prose border-secondary bg-secondary/5 text-secondary my-8 border-l-4 p-6 text-xl">
                <span className="block pl-4">i^2 = -1</span>
            </div>
            <p>
                Not a trick. Not a shorthand for something else. A legitimate new entity born from a
                necessity.
            </p>
            <br />
            <br />
            <h2 className="text-primary my-8 text-center text-2xl font-bold sm:text-3xl">
                <span className="text-muted-foreground/50 border-border inline-flex aspect-square w-fit items-center rounded-full border px-4 text-sm font-medium">
                    <p>Step 06</p>
                </span>
                <div className="mt-16 flex items-center gap-4">
                    <span className="shrink-0">The Complex Plane</span>
                    <div className="bg-border h-px flex-grow"></div>
                    <span className="text-accent shrink-0">C</span>
                </div>
            </h2>
            <br />
            <blockquote>Where is i ?</blockquote>
            <p>
                $i$ is not in the real world. It does not lie anywhere on our line. We need to be
                creative.
            </p>
            <p>We create a new dimension.</p>
            <pre>
                <code>We visualize it as an axis perpendicular to the real axis.</code>
            </pre>
            <br />
            <p>
                And now with those two axes, the real number line extends into a plane. This is
                where the complex numbers live: C
            </p>
            <p>Every complex number takes the form:</p>
            <div className="not-prose border-secondary bg-secondary/5 text-secondary my-8 border-l-4 p-6 text-xl">
                <span className="block pl-4">Z = a + ib where a, b E R</span>
            </div>
            <p>
                where "a" is the real part and "b" is the imaginary part. The line has become a
                plane.
            </p>
            <br />
            <br />
            <h2 className="text-primary my-8 text-center text-2xl font-bold sm:text-3xl">
                <span className="text-muted-foreground/50 border-border inline-flex aspect-square w-fit items-center rounded-full border px-4 text-sm font-medium">
                    <p>Epilogue</p>
                </span>
                <div className="mt-16 flex items-center gap-4">
                    <span className="shrink-0">Euler's Formula</span>
                    <div className="bg-border h-px flex-grow"></div>
                    <span className="text-accent shrink-0">e^(i\pi) = -1</span>
                </div>
            </h2>
            <br />
            <blockquote>What if we bring them all together ?</blockquote>
            <p>Five symbols. Five different origins. One equation.</p>
            <p>
                They come from different centuries, different problems, and different branches of
                mathematics.
            </p>
            <p>They have no obvious reason to meet.</p>
            <pre>
                <code>And yet.</code>
            </pre>
            <br />
            <figure title="Euler's Formula" className="text-center">
                <span className="text-accent text-5xl">e^(i\pi) + 1 = 0</span>
                <figcaption className="text-accent/80">Euler's Identity</figcaption>
            </figure>
            <br />
            <blockquote>The walk has no end.</blockquote>
            <br />
        </div>
    );
}
