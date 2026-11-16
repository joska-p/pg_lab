/*
 * Point d'entrée de la page témoin `test`.
 * Monte un custom element light DOM qui réagit à un changement d'attribut
 * (clic incrémente l'attribut `count` et déclenche un réaffichage).
 * Aucun fichier existant n'est modifié.
 */

import { PgElement } from '../../element.js';

class PgTestElement extends PgElement {
    static get observedAttributes(): string[] {
        return ['count'];
    }

    render(): void {
        const count = Number(this.state.count ?? 0);

        this.innerHTML = '';
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = `clics : ${count}`;
        button.addEventListener('click', () => {
            this.setAttribute('count', String(count + 1));
        });
        this.append(button);
    }
}

customElements.define('pg-test', PgTestElement);
