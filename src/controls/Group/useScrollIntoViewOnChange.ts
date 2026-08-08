import { useEffect, useRef } from 'react';

// Scrolls the returned ref's element into view whenever `value` changes - skips the
// very first render so a default-open item doesn't jump the page on initial mount,
// only when something is actually expanded/switched afterwards (a click, or a
// GroupWizardBus-driven add/navigate/expand). `value` is a breadcrumb chain's
// deepest active segment path, since it switches between several active choices
// rather than a simple open/closed flag.
export function useScrollIntoViewOnChange<T extends HTMLElement, V>(value: V) {
    const ref = useRef<T>(null);
    const isFirstRender = useRef(true);
    const previousValue = useRef(value);

    useEffect(() => {
        const changed = previousValue.current !== value;
        previousValue.current = value;

        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (changed && typeof ref.current?.scrollIntoView === 'function') {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [value]);

    return ref;
}
