import { Title } from '@solidjs/meta';
import { For, Show } from 'solid-js';

import { experimentRegistry } from '../data/experiments';
import { paths } from '../router';

const availableExperiments = experimentRegistry.filter((experiment) => experiment.available);

export default function Catalogue() {
    return (
        <main class="catalogue">
            <Title>Catalogue - Solid App</Title>
            <h1>Prototype catalogue</h1>
            <p>
                {availableExperiments.length} of {experimentRegistry.length} prototypes are
                available in the Solid PoC.
            </p>
            <Show
                when={availableExperiments.length > 0}
                fallback={<p>No prototype has been migrated yet.</p>}
            >
                <ul class="experiment-list">
                    <For each={availableExperiments} keyed={false}>
                        {(experiment) => (
                            <li>
                                <a href={paths.lab({ experiment: experiment().id })}>
                                    {experiment().label}
                                </a>
                            </li>
                        )}
                    </For>
                </ul>
            </Show>
        </main>
    );
}
