import type { Meta, StoryObj } from '@storybook/react-vite';
import { FCEQuestionnaire } from 'sdc-qrf';

import { withColorSchemeDecorator, withDemoWidthDecorator } from 'src/storybook/decorators';

import { QuestionnaireDemo } from './QuestionnaireDemo';
import xssRaw from './questionnaires/xss-markdown.yaml';

/**
 * Security reproduction for CVE-2026-PENDING - stored XSS via unsanitized markdown.
 *
 * This questionnaire holds a `display` item with the `markdown` itemControl whose `text`
 * is a raw-HTML payload. Because `MarkdownRender` runs `react-markdown` with `rehype-raw`
 * and no `rehype-sanitize`, the HTML executes when the form is rendered. In a real EMR the
 * questionnaire is loaded from the FHIR server, so any attacker with Questionnaire write
 * access can persist this and have it fire for every clinician who opens the form.
 *
 * The payload here is harmless - it runs `alert('hacked')` with no token/localStorage
 * access - purely to prove that arbitrary script executes. It should stop firing once
 * `rehype-sanitize` is added to the component, so this story doubles as a regression guard.
 *
 * Rendered in `readonly` mode because the markdown display controls live in the readonly
 * control set (`markdown` -> `MarkdownDisplay`).
 */
const XSS_QUESTIONNAIRE = xssRaw as unknown as FCEQuestionnaire;

const meta: Meta<typeof QuestionnaireDemo> = {
    title: 'Questionnaire / demo / XSS Markdown (CVE-2026-PENDING)',
    component: QuestionnaireDemo,
    decorators: [withColorSchemeDecorator, withDemoWidthDecorator],
    parameters: {
        chromatic: { disableSnapshot: true },
    },
};

export default meta;
type Story = StoryObj<typeof QuestionnaireDemo>;

export const Default: Story = {
    render: () => <QuestionnaireDemo questionnaire={XSS_QUESTIONNAIRE} readonly />,
};
