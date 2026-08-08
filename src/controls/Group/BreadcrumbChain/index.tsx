import { ReactNode, createContext, useContext, useLayoutEffect, useMemo, useState } from 'react';

import { useScrollIntoViewOnChange } from '../useScrollIntoViewOnChange';
import { Breadcrumb } from './Breadcrumb';
import { S } from './styles';
import { BreadcrumbSegment } from './types';

export type { BreadcrumbSegment };

interface Registry {
    register: (depth: number, segment: BreadcrumbSegment) => void;
    unregister: (depth: number) => void;
}

const RegistryContext = createContext<Registry | undefined>(undefined);
const DepthContext = createContext(0);

// The caller always builds a fresh segment object literal on every render, so
// reference equality would never match - compare the parts that actually affect
// what's displayed instead. Without this, register() would replace the segment with
// an object that's semantically identical but reference-different on every render,
// which re-renders this component, which re-registers, forever.
function segmentsAreEquivalent(a: BreadcrumbSegment, b: BreadcrumbSegment) {
    if (a.key !== b.key || a.title !== b.title || a.count !== b.count || !!a.onRemove !== !!b.onRemove) {
        return false;
    }

    if (a.alternatives.length !== b.alternatives.length) {
        return false;
    }

    return a.alternatives.every(
        (alternative, index) =>
            alternative.key === b.alternatives[index]?.key &&
            alternative.title === b.alternatives[index]?.title &&
            alternative.isActive === b.alternatives[index]?.isActive,
    );
}

function useRegisterSegment(registry: Registry, depth: number, segment: BreadcrumbSegment) {
    // No dependency array on purpose: a segment's alternatives/onRemove close over
    // fresh state every render (e.g. the current items list), so this always
    // re-registers with the latest data rather than risking a stale closure.
    // register() itself bails out (returns the same state reference) when nothing
    // meaningful changed, so re-running this every render doesn't cause a loop -
    // but only as long as nothing clears the slot in between renders.
    useLayoutEffect(() => {
        registry.register(depth, segment);
    });

    // Unregistering has to be its own effect, gated on depth/registry rather than
    // running unconditionally: pairing it with the effect above (as a same-render
    // cleanup) would delete this depth's entry right before register() re-adds it
    // on every single render, so register()'s equivalence check would never see an
    // existing entry to compare against - producing a "different" state object on
    // every render and looping forever. This only needs to fire once the position
    // actually goes away (unmount, or - in practice never - depth/registry itself
    // changing), not on every re-render.
    useLayoutEffect(() => {
        return () => registry.unregister(depth);
    }, [registry, depth]);
}

// Wraps one position of a nested accordion chain (a sibling group, or a repeat
// instance) so its header merges into a single breadcrumb bar instead of nesting a
// box-with-header per level. The outermost segment in a chain owns the registry and
// renders the combined bar; every deeper one (detected via RegistryContext already
// being set) just registers into it and passes its own children through untouched,
// so the actual leaf content ends up as the chain's only body.
export function BreadcrumbSegmentBoundary(props: { segment: BreadcrumbSegment; children: ReactNode }) {
    const { segment, children } = props;

    const parentRegistry = useContext(RegistryContext);
    const depth = useContext(DepthContext);

    const [segmentsByDepth, setSegmentsByDepth] = useState<Record<number, BreadcrumbSegment>>({});
    const ownRegistry = useMemo<Registry>(
        () => ({
            register: (d, s) =>
                setSegmentsByDepth((prev) => {
                    const existing = prev[d];

                    if (existing && segmentsAreEquivalent(existing, s)) {
                        return prev;
                    }

                    return { ...prev, [d]: s };
                }),
            unregister: (d) =>
                setSegmentsByDepth((prev) => {
                    if (!(d in prev)) {
                        return prev;
                    }

                    const next = { ...prev };
                    delete next[d];
                    return next;
                }),
        }),
        [],
    );

    const isRoot = !parentRegistry;
    const registry = parentRegistry ?? ownRegistry;

    useRegisterSegment(registry, isRoot ? 0 : depth, segment);

    const orderedSegments = Object.keys(segmentsByDepth)
        .map(Number)
        .sort((a, b) => a - b)
        .map((d) => segmentsByDepth[d]!);
    const displayedSegments = orderedSegments.length ? orderedSegments : [segment];

    // Scrolls the chain into view when the active path changes (a different sibling
    // or instance is picked), but not on first mount. Unused (and harmless) when
    // this isn't the root of a chain.
    const chainRef = useScrollIntoViewOnChange<HTMLDivElement, string>(displayedSegments.map((s) => s.key).join('>'));

    if (!isRoot) {
        return <DepthContext.Provider value={depth + 1}>{children}</DepthContext.Provider>;
    }

    return (
        <S.Chain ref={chainRef}>
            <Breadcrumb segments={displayedSegments} />
            <S.Content>
                <RegistryContext.Provider value={registry}>
                    <DepthContext.Provider value={1}>{children}</DepthContext.Provider>
                </RegistryContext.Provider>
            </S.Content>
        </S.Chain>
    );
}
