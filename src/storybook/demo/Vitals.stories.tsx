import type { Meta, StoryObj } from '@storybook/react-vite';
import { FCEQuestionnaire } from 'sdc-qrf';

import { withColorSchemeDecorator, withDemoWidthDecorator } from 'src/storybook/decorators';

import { QuestionnaireDemo } from './QuestionnaireDemo';
import vitalsRaw from './questionnaires/vitals.yaml';

// Source: https://github.com/beda-software/fhir-emr/blob/main/resources/init-seeds/Questionnaire/vitals.yaml
const VITALS_QUESTIONNAIRE = vitalsRaw as unknown as FCEQuestionnaire;

const meta: Meta<typeof QuestionnaireDemo> = {
    title: 'Questionnaire / demo / Vitals',
    component: QuestionnaireDemo,
    decorators: [withColorSchemeDecorator, withDemoWidthDecorator],
};

export default meta;
type Story = StoryObj<typeof QuestionnaireDemo>;

export const Default: Story = {
    render: () => <QuestionnaireDemo questionnaire={VITALS_QUESTIONNAIRE} />,
};
