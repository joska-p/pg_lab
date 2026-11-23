// @vitest-environment jsdom

import { createAgent } from '@ui-sdk/react/agent';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { afterEach, describe, expect, it, test, vi } from 'vite-plus/test';

import { Segmented } from './Segmented';

vi.mock('@stylexjs/stylex', () => ({
    create: (styles: object) => styles,
    defineConsts: (values: object) => values,
    defineVars: (values: Record<string, string>) =>
        Object.fromEntries(Object.keys(values).map((key) => [key, `var(--${key})`])),
    props: () => ({ className: '' }),
}));

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
    var __UI_SDK_STRICT__: boolean | undefined;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.__UI_SDK_STRICT__ = true;
if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
}

let roots: Root[] = [];

function render(ui: React.ReactNode) {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    roots.push(root);
    act(() => root.render(ui));
    return container;
}

function items(container: HTMLElement) {
    return [...container.querySelectorAll<HTMLElement>('[role="radio"]')];
}

afterEach(() => {
    act(() => roots.forEach((root) => root.unmount()));
    roots = [];
    document.body.replaceChildren();
});

describe('Segmented', () => {
    it('names the control with its label and checks the first option by default', () => {
        const container = render(<Segmented label="View" options={['list', 'grid']} />);
        const control = container.querySelector<HTMLElement>('[data-slot="segmented-control"]');

        expect(container.textContent).toContain('View');
        expect(control?.getAttribute('aria-labelledby')).toBeTruthy();
        expect(items(container).map((item) => item.getAttribute('aria-checked'))).toEqual([
            'true',
            'false',
        ]);
    });

    it('calls back with a non-null value and the reason', () => {
        const onValueChange = vi.fn();
        const container = render(
            <Segmented options={['list', 'grid']} value="list" onValueChange={onValueChange} />,
        );
        const grid = items(container).find((item) => item.textContent === 'grid');

        void act(() => grid?.dispatchEvent(new MouseEvent('click', { bubbles: true })));

        expect(onValueChange).toHaveBeenCalledWith(
            'grid',
            expect.objectContaining({ reason: 'item-press' }),
        );
    });

    it('moves the value with the arrow keys', () => {
        const onValueChange = vi.fn();
        const container = render(
            <Segmented options={['list', 'grid']} onValueChange={onValueChange} />,
        );
        const [list] = items(container);

        act(() => {
            list?.focus();
            list?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        });

        expect(onValueChange).toHaveBeenCalledWith('grid', expect.anything());
        expect(
            items(container)
                .find((item) => item.textContent === 'grid')
                ?.getAttribute('aria-checked'),
        ).toBe('true');
    });

    it('falls back to a generic accessible name without a label', () => {
        const container = render(<Segmented options={['list', 'grid']} />);

        expect(
            container.querySelector('[data-slot="segmented-control"]')?.getAttribute('aria-label'),
        ).toBe('selection');
    });
});

test('an agent can find and change the control', async () => {
    const agent = createAgent();
    const container = render(<Segmented label="View" options={['list', 'grid']} />);

    const components = agent
        .snapshot()
        .filter((entry) => !entry.offPage && entry.component !== 'more');
    expect(components.map((entry) => entry.label)).toContain('View');

    const result = await act(async () =>
        agent.act({
            steps: [{ ref: 'View', action: 'setValue', args: ['grid'] }],
        }),
    );

    expect(result.ok, result.error?.message).toBe(true);
    expect(
        items(container)
            .find((item) => item.textContent === 'grid')
            ?.getAttribute('aria-checked'),
    ).toBe('true');
});
