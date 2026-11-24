import { requireRoot } from '@repo/ui/mount';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';
import { App } from './App';

createRoot(requireRoot()).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
