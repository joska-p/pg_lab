import { requireRoot } from '@repo/ui/mount';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';

import './style.css';
import { App } from './App';

createRoot(requireRoot()).render(
    <StrictMode>
        <HashRouter>
            <App />
        </HashRouter>
    </StrictMode>,
);
