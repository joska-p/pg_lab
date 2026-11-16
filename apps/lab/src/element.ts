/*
 * Classe de base custom element (light DOM) pour pg_lab.
 * - Light DOM uniquement (pas de shadow DOM) : les CSS vars --pg-* de :root s'appliquent naturellement.
 * - render() : rendu explicite, appelé au montage et après chaque setState / changement d'attribut.
 * - setState(patch) : fusion superficielle dans this.state, puis appel à render() laissé à l'appelant.
 * Aucun fichier existant n'est modifié.
 */

export abstract class PgElement extends HTMLElement {
    protected state: Record<string, unknown> = {};

    static get observedAttributes(): string[] {
        return [];
    }

    connectedCallback(): void {
        this.render();
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
        if (oldValue !== newValue) {
            this.setState({ [name]: newValue ?? null });
            this.render();
        }
    }

    abstract render(): void;

    setState(patch: Record<string, unknown>): void {
        Object.assign(this.state, patch);
    }
}
