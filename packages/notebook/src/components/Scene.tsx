import { Suspense, use } from 'react';

import { findNote, loadNoteModule } from '../notes/registry';
import { useSelectedNoteSlug } from '../stores/appStore';

function SelectedNote({ slug }: { slug: string }) {
    const module = use(loadNoteModule(slug));
    const Note = module.Note;
    return <Note />;
}

export function Scene() {
    const slug = useSelectedNoteSlug();
    const note = findNote(slug);

    return (
        <div style={{ padding: '1rem', overflowY: 'auto' }}>
            <article style={{ maxWidth: '72ch', margin: '0 auto' }}>
                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', lineHeight: 1.2, margin: '0 0 0.5rem' }}>
                        {note.title}
                    </h1>
                    {note.description ? (
                        <p style={{ opacity: 0.8, margin: '0.25rem 0' }}>{note.description}</p>
                    ) : null}
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            fontSize: '0.85rem',
                            opacity: 0.7,
                            marginTop: '0.75rem',
                        }}
                    >
                        {note.date ? <span>{note.date}</span> : null}
                        {(note.tags ?? []).map((tag) => (
                            <span key={tag}>{tag}</span>
                        ))}
                    </div>
                </header>
                <Suspense fallback={<p>Loading note…</p>}>
                    <SelectedNote slug={note.slug} />
                </Suspense>
            </article>
        </div>
    );
}
