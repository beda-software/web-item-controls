import { Meta, StoryObj } from '@storybook/react-vite';
import { FCEQuestionnaireItem, ItemContext } from 'sdc-qrf';
import { expect, within, userEvent, findByTestId } from 'storybook/test';

import { WithQuestionFormProviderDecorator, withColorSchemeDecorator } from 'src/storybook/decorators';

import { InlineChoice } from './index';

const meta: Meta<typeof InlineChoice> = {
    title: 'Questionnaire / questions / inline-choice',
    component: InlineChoice,
    decorators: [withColorSchemeDecorator, WithQuestionFormProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof InlineChoice>;

export const Default: Story = {
    render: () => <InlineChoice parentPath={[]} questionItem={questionItemDefault} context={{} as ItemContext} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const getQuestion = () => canvas.findAllByTestId('type');

        const questions: HTMLElement[] = await getQuestion();
        await expect(questions.length > 0).toBe(true);

        // Choose an item in the list
        const checkbox1 = await findByTestId<HTMLInputElement>(questions[0]!, 'inline-choice__medication');
        await expect(checkbox1).not.toBeChecked();

        await userEvent.click(checkbox1);
        await expect(checkbox1).toBeChecked();

        // Choose another item in the list
        const checkbox2 = await findByTestId<HTMLInputElement>(questions[0]!, 'inline-choice__food');
        await expect(checkbox2).not.toBeChecked();

        await userEvent.click(checkbox2);
        await expect(checkbox1).not.toBeChecked();
        await expect(checkbox2).toBeChecked();
    },
};

export const Multiple: Story = {
    render: () => <InlineChoice parentPath={[]} questionItem={questionItemMultiple} context={{} as ItemContext} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const getQuestion = () => canvas.findAllByTestId('reaction');

        const questions: HTMLElement[] = await getQuestion();
        await expect(questions.length > 0).toBe(true);

        // Choose an item in the list
        const checkbox1 = await findByTestId<HTMLInputElement>(questions[0]!, 'inline-choice__headache');
        await expect(checkbox1).not.toBeChecked();

        await userEvent.click(checkbox1);
        await expect(checkbox1).toBeChecked();

        // Choose another item in the list
        const checkbox2 = await findByTestId<HTMLInputElement>(questions[0]!, 'inline-choice__nausea');
        await expect(checkbox2).not.toBeChecked();

        await userEvent.click(checkbox2);
        await expect(checkbox1).toBeChecked();
        await expect(checkbox2).toBeChecked();
    },
};

export const Horizontal: Story = {
    render: () => (
        <InlineChoice
            parentPath={[]}
            questionItem={{
                ...questionItemMultiple,
                choiceOrientation: 'horizontal',
            }}
            context={{} as ItemContext}
        />
    ),
};

export const Columns: Story = {
    render: () => (
        <InlineChoice
            parentPath={[]}
            questionItem={{
                ...questionItemMultiple,
                colsNumber: 3,
            }}
            context={{} as ItemContext}
        />
    ),
};

export const Disabled: Story = {
    render: () => (
        <InlineChoice
            parentPath={[]}
            questionItem={{
                ...questionItemDefault,
                readOnly: true,
            }}
            context={{} as ItemContext}
        />
    ),
};

export const WithImages: Story = {
    render: () => <InlineChoice parentPath={[]} questionItem={questionItemWithImages} context={{} as ItemContext} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const [question] = await canvas.findAllByTestId('stool-type');

        const images = question!.querySelectorAll('img');
        await expect(images.length).toBe(bristolTypes.length);
        await expect(images[0]).toHaveAttribute('src', '/images/bristol-stool-scale/type-1.png');

        const radio1 = await findByTestId<HTMLInputElement>(question!, 'inline-choice__type-1');
        const radio2 = await findByTestId<HTMLInputElement>(question!, 'inline-choice__type-2');
        await expect(radio1).not.toBeChecked();

        await userEvent.click(radio1);
        await expect(radio1).toBeChecked();

        await userEvent.click(radio2);
        await expect(radio1).not.toBeChecked();
        await expect(radio2).toBeChecked();
    },
};

export const WithImagesMultiple: Story = {
    render: () => (
        <InlineChoice
            parentPath={[]}
            questionItem={{ ...questionItemWithImages, repeats: true }}
            context={{} as ItemContext}
        />
    ),
};

export const WithImagesHorizontal: Story = {
    render: () => (
        <InlineChoice
            parentPath={[]}
            questionItem={{ ...questionItemWithImages, choiceOrientation: 'horizontal' }}
            context={{} as ItemContext}
        />
    ),
};

export const WithImagesColumns: Story = {
    render: () => (
        <InlineChoice
            parentPath={[]}
            questionItem={{ ...questionItemWithImages, colsNumber: 2 }}
            context={{} as ItemContext}
        />
    ),
};

export const WithImagesDisabled: Story = {
    render: () => (
        <InlineChoice
            parentPath={[]}
            questionItem={{ ...questionItemWithImages, readOnly: true }}
            context={{} as ItemContext}
        />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const [question] = await canvas.findAllByTestId('stool-type');

        const radio1 = await findByTestId<HTMLInputElement>(question!, 'inline-choice__type-1');
        await expect(radio1).toBeDisabled();

        await userEvent.click(radio1, { pointerEventsCheck: 0 });
        await expect(radio1).not.toBeChecked();
    },
};

const questionItemDefault: FCEQuestionnaireItem = {
    text: 'Type',
    type: 'choice',
    linkId: 'type',
    required: true,
    answerOption: [
        {
            valueCoding: {
                code: 'medication',
                system: 'http://hl7.org/fhir/allergy-intolerance-category',
                display: 'Medication',
            },
        },
        {
            valueCoding: {
                code: 'food',
                system: 'http://hl7.org/fhir/allergy-intolerance-category',
                display: 'Food',
            },
        },
        {
            valueCoding: {
                code: 'environment',
                system: 'http://hl7.org/fhir/allergy-intolerance-category',
                display: 'Environment',
            },
        },
    ],
    itemControl: {
        coding: [
            {
                code: 'inline-choice',
            },
        ],
    },
};

const questionItemMultiple: FCEQuestionnaireItem = {
    text: 'Reaction',
    type: 'choice',
    linkId: 'reaction',
    repeats: true,
    answerOption: [
        {
            valueCoding: {
                code: '39579001',
                system: 'http://snomed.ct',
                display: 'Anaphylaxis',
            },
        },
        {
            valueCoding: {
                code: '25064002',
                system: 'http://snomed.ct',
                display: 'Headache',
            },
        },
        {
            valueCoding: {
                code: '247472004',
                system: 'http://snomed.ct',
                display: 'Hives (Wheal)',
            },
        },
        {
            valueCoding: {
                code: '422587007',
                system: 'http://snomed.ct',
                display: 'Nausea',
            },
        },
        {
            valueCoding: {
                code: '422400008',
                system: 'http://snomed.ct',
                display: 'Vomiting',
            },
        },
    ],
    itemControl: {
        coding: [
            {
                code: 'inline-choice',
            },
        ],
    },
};

const bristolTypes = [
    'Separate hard lumps, like nuts (hard to pass)',
    'Sausage-shaped but lumpy',
    'Like a sausage but with cracks on its surface',
    'Like a sausage or snake, smooth and soft',
    'Soft blobs with clear-cut edges (passed easily)',
    'Fluffy pieces with ragged edges, a mushy stool',
    'Watery, no solid pieces, entirely liquid',
];

const questionItemWithImages: FCEQuestionnaireItem = {
    text: 'Type',
    type: 'choice',
    linkId: 'stool-type',
    answerOption: bristolTypes.map((description, index) => ({
        extension: [
            {
                url: 'http://aidbox.io/questionnaire-backgroundImage',
                valueAttachment: {
                    url: `/images/bristol-stool-scale/type-${index + 1}.png`,
                    title: description,
                },
            },
        ],
        valueCoding: {
            code: `type-${index + 1}`,
            system: 'http://example.org/bristol-stool-scale',
            display: `Type ${index + 1}`,
        },
    })),
    itemControl: {
        coding: [
            {
                code: 'radio-button',
            },
        ],
    },
};
