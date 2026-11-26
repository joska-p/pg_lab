import { Route, Routes } from 'react-router';

import { ExperimentRoute, HomeRoute, NotFoundRoute } from './routes';

export function App() {
    return (
        <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/:experiment" element={<ExperimentRoute />} />
            <Route path="*" element={<NotFoundRoute />} />
        </Routes>
    );
}
