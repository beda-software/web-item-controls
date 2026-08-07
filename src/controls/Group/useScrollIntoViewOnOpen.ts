import { useEffect, useRef } from 'react';

// Scrolls the returned ref's element to the top of the viewport whenever `isOpen`
// flips to true - skips the very first render so a default-open item doesn't jump
// the page on initial mount, only when something is actually expanded afterwards
// (a click, or a GroupWizardBus-driven add/navigate/expand).
export function useScrollIntoViewOnOpen<T extends HTMLElement>(isOpen: boolean | undefined) {
    const ref = useRef<T>(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (isOpen && typeof ref.current?.scrollIntoView === 'function') {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isOpen]);

    return ref;
}
