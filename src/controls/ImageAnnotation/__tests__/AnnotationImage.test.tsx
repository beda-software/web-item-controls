import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { FCEQuestionnaireItem, FormGroupItems, FormItems, getItemKey, populateItemKey } from 'sdc-qrf';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { AnnotationImage } from 'src/controls/ImageAnnotation/AnnotationImage';
import { getAnnotationDetailItems } from 'src/controls/ImageAnnotation/utils';
import { ThemeProvider } from 'src/theme';

const questionItem: FCEQuestionnaireItem = {
    linkId: 'annotations',
    type: 'group',
    text: 'Note',
    repeats: true,
    backgroundImage: { url: '/images/dental-chart.svg' },
    item: [
        { linkId: 'x', type: 'decimal' },
        { linkId: 'y', type: 'decimal' },
        { linkId: 'title', type: 'string' },
    ],
};

const annotation = (x: number, y: number): FormItems => {
    const item: FormItems = {
        x: [{ value: { decimal: x } }],
        y: [{ value: { decimal: y } }],
    };

    return populateItemKey(item as FormGroupItems);
};

function renderImage(props: Partial<Parameters<typeof AnnotationImage>[0]> = {}) {
    return render(
        <ThemeProvider>
            <I18nProvider i18n={i18n}>
                <AnnotationImage questionItem={questionItem} items={[]} {...props} />
            </I18nProvider>
        </ThemeProvider>,
    );
}

function mockCanvasRect(width: number, height: number) {
    const canvas = screen.getByTestId('image-annotation-canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width,
        height,
    } as DOMRect);

    return canvas;
}

describe('AnnotationImage', () => {
    beforeAll(() => {
        i18n.activate('en');
    });

    test('fires onAdd with a new item holding the clicked position in percent', () => {
        const onAdd = vi.fn();
        renderImage({ onAdd });

        fireEvent.click(mockCanvasRect(200, 100), { clientX: 50, clientY: 25 });

        expect(onAdd).toHaveBeenCalledTimes(1);
        const newItem = onAdd.mock.calls[0]![0] as FormItems;
        expect(newItem.x).toEqual([{ value: { decimal: 25 } }]);
        expect(newItem.y).toEqual([{ value: { decimal: 25 } }]);
        expect(getItemKey(newItem)).toBeTruthy();
    });

    test('ignores clicks while the image has no size', () => {
        const onAdd = vi.fn();
        renderImage({ onAdd });

        fireEvent.click(mockCanvasRect(0, 0), { clientX: 10, clientY: 10 });

        expect(onAdd).not.toHaveBeenCalled();
    });

    test('fires onSelect on marker click without adding a new annotation', () => {
        const onAdd = vi.fn();
        const onSelect = vi.fn();
        renderImage({ items: [annotation(10, 10), annotation(50, 50)], onAdd, onSelect });
        mockCanvasRect(200, 100);

        fireEvent.click(screen.getByTestId('annotation-marker-1'));

        expect(onSelect).toHaveBeenCalledWith(1);
        expect(onAdd).not.toHaveBeenCalled();
    });

    test('is not interactive without onAdd and skips items without coordinates', () => {
        renderImage({ items: [annotation(10, 10), populateItemKey({})] });

        expect(screen.queryByText('Click on the diagram to place a marker')).not.toBeInTheDocument();
        expect(screen.getByTestId('annotation-marker-0')).toBeDisabled();
        expect(screen.queryByTestId('annotation-marker-1')).not.toBeInTheDocument();
    });

    test('renders nothing when the first two children are not decimals', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const invalidItem: FCEQuestionnaireItem = {
            ...questionItem,
            item: [
                { linkId: 'x', type: 'string' },
                { linkId: 'y', type: 'decimal' },
            ],
        };

        renderImage({ questionItem: invalidItem });

        expect(screen.queryByTestId('image-annotation-canvas')).not.toBeInTheDocument();
        expect(getAnnotationDetailItems(invalidItem)).toBeUndefined();
        expect(getAnnotationDetailItems(questionItem)).toEqual([questionItem.item![2]]);
        warn.mockRestore();
    });
});
