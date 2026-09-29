import type { Meta, StoryObj } from '@storybook/react-vite';
import { FCEQuestionnaire } from 'sdc-qrf';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { withColorSchemeDecorator, withDemoWidthDecorator } from 'src/storybook/decorators';
import { QuestionnaireDemo } from 'src/storybook/demo/QuestionnaireDemo';

const QUESTIONNAIRE: FCEQuestionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
        {
            linkId: 'annotations',
            type: 'group',
            text: 'Note',
            repeats: true,
            itemControl: { coding: [{ code: 'image-annotation' }] },
            backgroundImage: { url: '/images/dental-chart.svg' },
            item: [
                { linkId: 'x', type: 'decimal', text: 'X' },
                { linkId: 'y', type: 'decimal', text: 'Y' },
                { linkId: 'title', type: 'string', text: 'Title' },
                { linkId: 'comment', type: 'text', text: 'Comment' },
            ],
        },
    ],
};

const meta: Meta<typeof QuestionnaireDemo> = {
    title: 'Questionnaire / questions / group / image annotation',
    component: QuestionnaireDemo,
    decorators: [withColorSchemeDecorator, withDemoWidthDecorator],
};

export default meta;
type Story = StoryObj<typeof QuestionnaireDemo>;

export const Default: Story = {
    // Render a single color scheme so that the play function queries a single form
    globals: { scheme: 'light' },
    render: () => <QuestionnaireDemo questionnaire={QUESTIONNAIRE} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const area = await canvas.findByTestId('image-annotation-canvas');
        // The click handler needs the laid out image size, so wait until it is loaded
        await waitFor(() => expect(within(area).getByRole('img')).toHaveProperty('complete', true));

        fireEvent.click(area, { clientX: 100, clientY: 100 });
        // A click builds the new list from the rendered value, so let the first marker render before the next click
        await waitFor(() => expect(canvas.getByTestId('annotation-marker-0')).toBeInTheDocument());
        fireEvent.click(area, { clientX: 200, clientY: 150 });

        await waitFor(() => expect(canvas.getByTestId('annotation-marker-1')).toBeInTheDocument());
        // Only the selected annotation is displayed at a time
        expect(canvas.getAllByTestId('title')).toHaveLength(1);
        expect(canvas.getByText('Note 2')).toBeInTheDocument();

        await userEvent.click(canvas.getByTestId('annotation-marker-0'));
        await waitFor(() => expect(canvas.getByText('Note 1')).toBeInTheDocument());

        await userEvent.click(canvas.getByTestId('remove-annotation-button'));
        await waitFor(() => expect(canvas.queryByTestId('annotation-marker-1')).not.toBeInTheDocument());
    },
};

const answer = (type: 'decimal' | 'string', value: number | string) => [{ value: { [type]: value } }];

export const Readonly: Story = {
    globals: { scheme: 'light' },
    render: () => (
        <QuestionnaireDemo
            questionnaire={QUESTIONNAIRE}
            readonly
            defaultValues={{
                annotations: {
                    items: [
                        {
                            x: answer('decimal', 45),
                            y: answer('decimal', 10),
                            title: answer('string', 'Missing tooth'),
                        },
                        { x: answer('decimal', 70), y: answer('decimal', 20), title: answer('string', 'Mobility') },
                    ],
                },
            }}
        />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => expect(canvas.getByTestId('annotation-marker-1')).toBeInTheDocument());
        // Readonly view lists all the annotations at once
        expect(canvas.getByText('Missing tooth')).toBeInTheDocument();
        expect(canvas.getByText('Mobility')).toBeInTheDocument();
    },
};
