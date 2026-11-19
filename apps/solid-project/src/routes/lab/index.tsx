import { Title } from '@solidjs/meta';

import { paths } from '../../router';

export default function LabIndex() {
    return (
        <section class="lab-landing">
            <Title>Lab - Solid App</Title>
            <h1>Lab</h1>
            <p>Pick a prototype from the catalogue to start exploring the Solid PoC.</p>
            <p>
                <a href={paths()}>Browse the catalogue</a>
            </p>
        </section>
    );
}
