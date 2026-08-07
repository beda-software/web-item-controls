import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { useScrollIntoViewOnOpen } from '../useScrollIntoViewOnOpen';

describe('useScrollIntoViewOnOpen', () => {
    test('does not scroll on initial mount even when already open', () => {
        const scrollIntoView = vi.fn();
        const element = document.createElement('div');
        element.scrollIntoView = scrollIntoView;

        const { result } = renderHook((isOpen: boolean) => useScrollIntoViewOnOpen<HTMLDivElement>(isOpen), {
            initialProps: true,
        });
        // @ts-expect-error - assigning a plain object to a readonly ref for the test
        result.current.current = element;

        expect(scrollIntoView).not.toHaveBeenCalled();
    });

    test('scrolls the element into view when isOpen flips to true after mount', () => {
        const scrollIntoView = vi.fn();
        const element = document.createElement('div');
        element.scrollIntoView = scrollIntoView;

        const { result, rerender } = renderHook((isOpen: boolean) => useScrollIntoViewOnOpen<HTMLDivElement>(isOpen), {
            initialProps: false,
        });
        // @ts-expect-error - assigning a plain object to a readonly ref for the test
        result.current.current = element;

        rerender(true);

        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });

    test('does not scroll when isOpen flips to false', () => {
        const scrollIntoView = vi.fn();
        const element = document.createElement('div');
        element.scrollIntoView = scrollIntoView;

        const { result, rerender } = renderHook((isOpen: boolean) => useScrollIntoViewOnOpen<HTMLDivElement>(isOpen), {
            initialProps: true,
        });
        // @ts-expect-error - assigning a plain object to a readonly ref for the test
        result.current.current = element;

        rerender(false);

        expect(scrollIntoView).not.toHaveBeenCalled();
    });

    test('does not throw when the element has no scrollIntoView (e.g. jsdom)', () => {
        const element = document.createElement('div');

        const { result, rerender } = renderHook((isOpen: boolean) => useScrollIntoViewOnOpen<HTMLDivElement>(isOpen), {
            initialProps: false,
        });
        // @ts-expect-error - assigning a plain object to a readonly ref for the test
        result.current.current = element;

        expect(() => rerender(true)).not.toThrow();
    });
});
