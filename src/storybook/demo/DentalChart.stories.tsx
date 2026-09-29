import type { Meta, StoryObj } from '@storybook/react-vite';
import { FCEQuestionnaire } from 'sdc-qrf';

import { withColorSchemeDecorator, withDemoWidthDecorator } from 'src/storybook/decorators';

import dentalChartImage from './assets/dental-chart.svg';
import { QuestionnaireDemo } from './QuestionnaireDemo';
import dentalChartRaw from './questionnaires/dental-chart.yaml';

const DENTAL_CHART_QUESTIONNAIRE = {
    ...(dentalChartRaw as unknown as FCEQuestionnaire),
    item: (dentalChartRaw as unknown as FCEQuestionnaire).item?.map((item) => ({
        ...item,
        backgroundImage: { url: dentalChartImage },
    })),
} as FCEQuestionnaire;

const meta: Meta<typeof QuestionnaireDemo> = {
    title: 'Questionnaire / demo / Dental chart',
    component: QuestionnaireDemo,
    decorators: [withColorSchemeDecorator, withDemoWidthDecorator],
};

export default meta;
type Story = StoryObj<typeof QuestionnaireDemo>;

export const Default: Story = {
    render: () => <QuestionnaireDemo questionnaire={DENTAL_CHART_QUESTIONNAIRE} />,
};
