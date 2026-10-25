import { BirthOfComplexity } from '../notes/birth-of-complexity';
import { useSelectedNoteSlug } from '../stores/appStore';

export function Scene() {
    const selectedNoteSlug = useSelectedNoteSlug();

    return <>{selectedNoteSlug === 'birth-of-complexity' ? <BirthOfComplexity /> : null}</>;
}
