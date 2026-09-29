import type { Meta, StoryObj } from '@storybook/react-vite';
import { FCEQuestionnaire } from 'sdc-qrf';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { withColorSchemeDecorator, withDemoWidthDecorator } from 'src/storybook/decorators';

import { QuestionnaireDemo } from './QuestionnaireDemo';
import dentalChartRaw from './questionnaires/dental-chart.yaml';

const DENTAL_CHART_QUESTIONNAIRE = dentalChartRaw as unknown as FCEQuestionnaire;

const meta: Meta<typeof QuestionnaireDemo> = {
    title: 'Questionnaire / demo / Dental chart',
    component: QuestionnaireDemo,
    decorators: [withColorSchemeDecorator, withDemoWidthDecorator],
};

export default meta;
type Story = StoryObj<typeof QuestionnaireDemo>;

export const Default: Story = {
    globals: { scheme: 'light' },
    render: () => <QuestionnaireDemo questionnaire={DENTAL_CHART_QUESTIONNAIRE} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const area = await canvas.findByTestId('image-annotation-canvas');
        // The click handler needs the laid out image size, so wait until it is loaded
        await waitFor(() => expect(within(area).getByRole('img')).toHaveProperty('complete', true));
        fireEvent.click(area, { clientX: 100, clientY: 100 });

        const select = await canvas.findByTestId('question-choice');
        await userEvent.click(within(select).getByRole('combobox'));

        expect(await canvas.findByText('11 — Upper right central incisor')).toBeInTheDocument();
    },
};
