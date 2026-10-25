import { Segmented } from '@repo/ui/components/Segmented';

import { setLogSortOrder, useLogSortOrder } from './store';
import type { LogSortOrder } from './types';

export function Commands() {
    const sortOrder = useLogSortOrder();

    return (
        <Segmented<LogSortOrder>
            label="Ordre"
            color="orange"
            value={sortOrder}
            onValueChange={setLogSortOrder}
            options={[
                { value: 'newest-first', label: "Récents d'abord" },
                { value: 'oldest-first', label: 'Anciens d’abord' },
            ]}
        />
    );
}
