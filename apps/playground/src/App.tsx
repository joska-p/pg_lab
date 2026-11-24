import { Route, Routes } from 'react-router';

import { ExperimentLayout } from './components/ExperimentLayout';

export function App() {
    return (
        <Routes>
            <Route path="/" element={<ExperimentLayout />} />
            <Route path="/:experiment" element={<ExperimentLayout />} />
        </Routes>
    );
}
