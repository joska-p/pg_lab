import { requireRoot } from '@repo/ui/mount';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

import './style.css';

createRoot(requireRoot()).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
