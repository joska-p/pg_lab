import { Title } from '@solidjs/meta';
import { Loading } from 'solid-js';

import { paths, Router } from './router';

import './App.css';
import './styles/tokens.css';

export default function App() {
    return (
        <Router>
            {(props) => (
                <>
                    <Title>Solid App</Title>
                    <nav class="app-nav" aria-label="Main">
                        <a href={paths()}>Catalogue</a>
                        <a href={paths.lab()}>Lab</a>
                    </nav>
                    <Loading fallback={<main class="route-loading">Loading…</main>}>
                        {props.children}
                    </Loading>
                </>
            )}
        </Router>
    );
}
