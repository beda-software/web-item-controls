import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FCEQuestionnaireItem, FormGroupItems, FormItems, populateItemKey } from 'sdc-qrf';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { AnnotationImageProps } from 'src/contexts/image-annotation';
import { withColorSchemeDecorator } from 'src/storybook/decorators';

import { BodyAnnotationImage } from '.';

const QUESTION_ITEM: FCEQuestionnaireItem = {
    linkId: 'procedure-location',
    type: 'group',
    text: 'Procedure location',
    repeats: true,
    item: [
        {
            linkId: 'body-site',
            type: 'choice',
            text: 'Body site',
            answerValueSet: 'http://hl7.org/fhir/ValueSet/body-site',
        },
        { linkId: 'comment', type: 'text', text: 'Comment' },
    ],
};

const annotation = (code: string): FormItems => {
    const item: FormItems = {
        'body-site': [{ value: { Coding: { code } } }],
    };

    return populateItemKey(item as FormGroupItems);
};

type Args = Pick<AnnotationImageProps, 'items' | 'activeIndex' | 'onAdd' | 'onSelect'>;

/** Keeps the annotations in local state the same way the image-annotation control does */
function BodyAnnotationImageDemo({ items: initialItems, activeIndex: initialIndex, onAdd, onSelect }: Args) {
    const [items, setItems] = useState(initialItems);
    const [activeIndex, setActiveIndex] = useState(initialIndex);

    return (
        <BodyAnnotationImage
            questionItem={QUESTION_ITEM}
            items={items}
            activeIndex={activeIndex}
            onAdd={
                onAdd &&
                ((item) => {
                    onAdd(item);
                    setItems([...items, item]);
                    setActiveIndex(items.length);
                })
            }
            onSelect={
                onSelect &&
                ((index) => {
                    onSelect(index);
                    setActiveIndex(index);
                })
            }
        />
    );
}

const meta: Meta<typeof BodyAnnotationImageDemo> = {
    title: 'Questionnaire / image annotation providers / body',
    component: BodyAnnotationImageDemo,
    decorators: [withColorSchemeDecorator],
    // Render a single color scheme so that the play functions query a single chart
    globals: { scheme: 'light' },
    args: { items: [], onAdd: fn(), onSelect: fn() },
};

export default meta;
type Story = StoryObj<typeof BodyAnnotationImageDemo>;

export const Empty: Story = {
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const leftKnee = canvas.getByRole('button', { name: 'Left knee' });
        await expect(leftKnee).toHaveAttribute('aria-pressed', 'false');

        await userEvent.click(leftKnee);

        await expect(args.onAdd).toHaveBeenCalledWith(
            expect.objectContaining({
                'body-site': [
                    {
                        value: {
                            Coding: { code: '82169009' },
                        },
                    },
                ],
            }),
        );
        await waitFor(() => expect(leftKnee).toHaveAttribute('aria-pressed', 'true'));

        // A click on an annotated region selects its annotation instead of adding another one
        await userEvent.click(leftKnee);
        await expect(args.onAdd).toHaveBeenCalledTimes(1);
        await expect(args.onSelect).toHaveBeenCalledWith(0);
    },
};

export const WithAnnotations: Story = {
    args: {
        items: [annotation('368208006'), annotation('1017211000'), annotation('61396006')],
        activeIndex: 0,
    },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const chart = canvas.getByTestId('body-annotation-image');
        await expect(chart).toHaveAttribute('data-view', 'front');
        await expect(canvas.getByRole('button', { name: 'Left upper arm' })).toHaveAttribute('aria-pressed', 'true');

        // Regions with the same code on both sides (thigh) stay selected in the back view
        // The arm and the thigh are on both views, the lower back only on the back one
        await expect(canvas.getByRole('radio', { name: 'Front (2)' })).toBeChecked();
        await userEvent.click(canvas.getByText('Back (3)'));
        await waitFor(() => expect(chart).toHaveAttribute('data-view', 'back'));
        await expect(canvas.getByRole('button', { name: 'Left thigh' })).toHaveAttribute('aria-pressed', 'true');

        await userEvent.click(canvas.getByRole('button', { name: 'Right lower back' }));
        await expect(args.onSelect).toHaveBeenCalledWith(1);
    },
};

export const ActiveAnnotationOnBack: Story = {
    name: 'Opens the view of the selected annotation',
    args: {
        items: [annotation('368208006'), annotation('1373283007')],
        activeIndex: 1,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByTestId('body-annotation-image')).toHaveAttribute('data-view', 'back');
        await expect(canvas.getByRole('button', { name: 'Back of right knee' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );
    },
};

export const Readonly: Story = {
    args: {
        items: [annotation('89545001'), annotation('416011007')],
        onAdd: undefined,
        onSelect: undefined,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Nothing is clickable, the annotated regions are just highlighted
        await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
        await expect(canvas.getByRole('img', { name: 'Face' })).toBeInTheDocument();
        await expect(canvas.getByText('2')).toBeInTheDocument();
    },
};
