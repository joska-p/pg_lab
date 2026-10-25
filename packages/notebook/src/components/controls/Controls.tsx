import { ControlSection } from '@repo/ui/components/ControlSection';
import { Segmented } from '@repo/ui/components/Segmented';
import { Select } from '@repo/ui/components/Select';

import { NOTES } from '../../notes/registry';
import {
    useSelectedNoteSlug,
    useTheme,
    setSelectedNoteSlug,
    setTheme,
} from '../../stores/appStore';

export function Controls() {
    const theme = useTheme();
    const selectedSlug = useSelectedNoteSlug();

    const handleNoteChange = (slug: string) => {
        setSelectedNoteSlug(slug);
        if (typeof window !== 'undefined') {
            window.location.hash = slug;
        }
    };

    return (
        <>
            <ControlSection title="Theme">
                <Segmented<'light' | 'dark' | 'system'>
                    options={['light', 'dark', 'system']}
                    value={theme}
                    onValueChange={setTheme}
                />
            </ControlSection>
            <ControlSection title="Note">
                <Select<string>
                    options={NOTES.map((note) => ({
                        value: note.slug,
                        label: note.title,
                    }))}
                    value={selectedSlug}
                    onValueChange={handleNoteChange}
                />
            </ControlSection>
        </>
    );
}
