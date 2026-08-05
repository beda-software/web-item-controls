import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { CONTEXT, SLIDER_ITEM, WithGroupSliderProviderDecorator } from './GroupSlider.stories.utils';
import { GroupSlider } from './index';

const meta: Meta<typeof GroupSlider> = {
    title: 'Questionnaire / questions / group / slider',
    component: GroupSlider,
    decorators: [WithGroupSliderProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof GroupSlider>;

export const Slider: Story = {
    render: () => <GroupSlider parentPath={[]} questionItem={SLIDER_ITEM} context={CONTEXT} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByTestId('group-slider-empty')).toBeInTheDocument();
        await expect(canvas.getByTestId('group-slider-position')).toHaveTextContent('0 of 0');

        const addButton = canvas.getByTestId('group-slider-add-button');

        // Adding the first item renders it as the only slide.
        await userEvent.click(addButton);
        await expect(canvas.getByTestId('group-slider-position')).toHaveTextContent('1 of 1');
        await expect(canvas.getAllByTestId('medication-name')).toHaveLength(1);

        const firstNameInput = canvas.getByTestId('medication-name').querySelector('input')!;
        await userEvent.type(firstNameInput, 'Aspirin');

        // Adding a second item navigates to it and the first item is no longer rendered.
        await userEvent.click(addButton);
        await expect(canvas.getByTestId('group-slider-position')).toHaveTextContent('2 of 2');
        await expect(canvas.getAllByTestId('medication-name')).toHaveLength(1);

        const secondNameInput = canvas.getByTestId('medication-name').querySelector('input')!;
        await expect(secondNameInput).toHaveValue('');
        await userEvent.type(secondNameInput, 'Ibuprofen');

        // Navigating back shows only the first item's data, the second is not rendered.
        const prevButton = canvas.getByTestId('group-slider-prev-button');
        await userEvent.click(prevButton);
        await expect(canvas.getByTestId('group-slider-position')).toHaveTextContent('1 of 2');
        await expect(canvas.getAllByTestId('medication-name')).toHaveLength(1);
        await expect(canvas.getByTestId('medication-name').querySelector('input')).toHaveValue('Aspirin');

        const nextButton = canvas.getByTestId('group-slider-next-button');
        await userEvent.click(nextButton);
        await expect(canvas.getByTestId('medication-name').querySelector('input')).toHaveValue('Ibuprofen');

        // Removing the current item drops it and shows the remaining one.
        const removeButton = canvas.getByTestId('group-slider-remove-button');
        await userEvent.click(removeButton);
        await expect(canvas.getByTestId('group-slider-position')).toHaveTextContent('1 of 1');
        await expect(canvas.getByTestId('medication-name').querySelector('input')).toHaveValue('Aspirin');
    },
};

export const Empty: Story = {
    render: () => <GroupSlider parentPath={[]} questionItem={SLIDER_ITEM} context={CONTEXT} />,
};
