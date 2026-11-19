import type { ParentProps } from 'solid-js';

import { paths } from '../router';

// Pairing lab.tsx with lab/ wraps every prototype page in this shared frame.
export default function LabLayout(props: ParentProps) {
    return (
        <div class="lab-layout">
            <nav class="lab-nav" aria-label="Lab">
                <span>Lab</span>
                <a href={paths()}>Catalogue</a>
            </nav>
            <main class="lab-content">{props.children}</main>
        </div>
    );
}
