import type { Meta, StoryObj } from '@storybook/react-vite';
import { FCEQuestionnaire } from 'sdc-qrf';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ImageAnnotationProvider, ImageAnnotationComponents } from 'src/contexts/image-annotation';
import { BodyAnnotationImage } from 'src/controls/ImageAnnotation/BodyAnnotationImage';
import { withColorSchemeDecorator, withDemoWidthDecorator } from 'src/storybook/decorators';
import { QuestionnaireDemo } from 'src/storybook/demo/QuestionnaireDemo';

// The url only identifies the renderer registered in ImageAnnotationProvider
const BODY_CHART_URL = '/images/body-chart.svg';

const IMAGE_ANNOTATION_COMPONENTS: ImageAnnotationComponents = { [BODY_CHART_URL]: BodyAnnotationImage };

const QUESTIONNAIRE: FCEQuestionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
        {
            linkId: 'procedure-location',
            type: 'group',
            text: 'Procedure',
            repeats: true,
            itemControl: { coding: [{ code: 'image-annotation' }] },
            backgroundImage: { url: BODY_CHART_URL },
            item: [
                {
                    linkId: 'body-site',
                    type: 'choice',
                    text: 'Body site',
                    answerValueSet: 'http://hl7.org/fhir/ValueSet/body-site',
                },
                { linkId: 'procedure', type: 'string', text: 'Procedure' },
                { linkId: 'comment', type: 'text', text: 'Comment' },
            ],
        },
    ],
};

const meta: Meta<typeof QuestionnaireDemo> = {
    title: 'Questionnaire / questions / group / body annotation',
    component: QuestionnaireDemo,
    decorators: [
        (Story) => (
            <ImageAnnotationProvider.Provider value={IMAGE_ANNOTATION_COMPONENTS}>
                <Story />
            </ImageAnnotationProvider.Provider>
        ),
        withColorSchemeDecorator,
        withDemoWidthDecorator,
    ],
};

export default meta;
type Story = StoryObj<typeof QuestionnaireDemo>;

export const Default: Story = {
    // Render a single color scheme so that the play function queries a single form
    globals: { scheme: 'light' },
    render: () => <QuestionnaireDemo questionnaire={QUESTIONNAIRE} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(await canvas.findByRole('button', { name: 'Left forearm' }));
        await waitFor(() => expect(canvas.getByText('Procedure 1')).toBeInTheDocument());

        await userEvent.click(canvas.getByRole('button', { name: 'Right knee' }));
        await waitFor(() => expect(canvas.getByText('Procedure 2')).toBeInTheDocument());
        // Only the selected annotation is displayed at a time and the body site is not edited in the details
        expect(canvas.getAllByTestId('procedure')).toHaveLength(1);
        expect(canvas.queryByTestId('body-site')).not.toBeInTheDocument();

        await userEvent.click(canvas.getByRole('button', { name: 'Left forearm' }));
        await waitFor(() => expect(canvas.getByText('Procedure 1')).toBeInTheDocument());

        await userEvent.click(canvas.getByTestId('remove-annotation-button'));
        await waitFor(() =>
            expect(canvas.getByRole('button', { name: 'Left forearm' })).toHaveAttribute('aria-pressed', 'false'),
        );
    },
};

const bodySite = (code: string) => [{ value: { Coding: { code } } }];

export const Readonly: Story = {
    globals: { scheme: 'light' },
    render: () => (
        <QuestionnaireDemo
            questionnaire={QUESTIONNAIRE}
            readonly
            defaultValues={{
                'procedure-location': {
                    items: [
                        {
                            'body-site': bodySite('66480008'),
                            procedure: [{ value: { string: 'Wound dressing' } }],
                        },
                        {
                            'body-site': bodySite('1017210004'),
                            procedure: [{ value: { string: 'Epidural injection' } }],
                        },
                    ],
                },
            }}
        />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => expect(canvas.getByRole('img', { name: 'Left forearm' })).toBeInTheDocument());
        // Readonly view lists all the annotations at once
        expect(canvas.getByText('Wound dressing')).toBeInTheDocument();
        expect(canvas.getByText('Epidural injection')).toBeInTheDocument();
    },
};
