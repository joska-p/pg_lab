import { Title } from '@solidjs/meta';
import type { RouteDefinition } from '@solidjs/router';
import { httpStatus } from '@solidjs/web';

import { paths } from '../router';

// httpStatus() only affects SSR, where this hook runs before the head flushes.
export const route = {
    preload: () => httpStatus(404),
} satisfies RouteDefinition;

export default function NotFound() {
    return (
        <main class="not-found">
            <Title>Not Found - Solid App</Title>
            <h1>Page Not Found</h1>
            <p>The requested prototype does not exist in this PoC.</p>
            <p>
                <a href={paths()}>Back to the catalogue</a>
            </p>
        </main>
    );
}
