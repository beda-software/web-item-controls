import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { useScrollIntoViewOnChange } from '../useScrollIntoViewOnChange';

describe('useScrollIntoViewOnChange', () => {
    test('does not scroll on initial mount', () => {
        const scrollIntoView = vi.fn();
        const element = document.createElement('div');
        element.scrollIntoView = scrollIntoView;

        const { result } = renderHook((value: string) => useScrollIntoViewOnChange<HTMLDivElement, string>(value), {
            initialProps: 'a',
        });
        // @ts-expect-error - assigning a plain object to a readonly ref for the test
        result.current.current = element;

        expect(scrollIntoView).not.toHaveBeenCalled();
    });

    test('scrolls the element into view when the value changes after mount', () => {
        const scrollIntoView = vi.fn();
        const element = document.createElement('div');
        element.scrollIntoView = scrollIntoView;

        const { result, rerender } = renderHook(
            (value: string) => useScrollIntoViewOnChange<HTMLDivElement, string>(value),
            { initialProps: 'a' },
        );
        // @ts-expect-error - assigning a plain object to a readonly ref for the test
        result.current.current = element;

        rerender('b');

        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });

    test('does not scroll when rerendered with the same value', () => {
        const scrollIntoView = vi.fn();
        const element = document.createElement('div');
        element.scrollIntoView = scrollIntoView;

        const { result, rerender } = renderHook(
            (value: string) => useScrollIntoViewOnChange<HTMLDivElement, string>(value),
            { initialProps: 'a' },
        );
        // @ts-expect-error - assigning a plain object to a readonly ref for the test
        result.current.current = element;

        rerender('a');

        expect(scrollIntoView).not.toHaveBeenCalled();
    });

    test('does not throw when the element has no scrollIntoView (e.g. jsdom)', () => {
        const element = document.createElement('div');

        const { result, rerender } = renderHook(
            (value: string) => useScrollIntoViewOnChange<HTMLDivElement, string>(value),
            { initialProps: 'a' },
        );
        // @ts-expect-error - assigning a plain object to a readonly ref for the test
        result.current.current = element;

        expect(() => rerender('b')).not.toThrow();
    });
});
