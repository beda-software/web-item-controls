import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4b';
import { FormProvider, useForm } from 'react-hook-form';
import { FCEQuestionnaireItem, FormItems, ItemContext, QuestionnaireResponseFormProvider } from 'sdc-qrf';

import { success } from '@beda.software/remote-data';

import s from 'src/components/BaseQuestionnaireResponseForm/BaseQuestionnaireResponseForm.module.scss';
import { ValueSetExpandProvider } from 'src/contexts';
import { questionItemComponents } from 'src/controls';
import { Group } from 'src/controls/Group';
import { withColorSchemeDecorator } from 'src/storybook/decorators';
import { GROUP_HIDE_ADD_ITEM_BUTTON_EXTENSION_URL } from 'src/utils/constants';

function buildMedicationsItem(hideAddButton: boolean): FCEQuestionnaireItem {
    return {
        linkId: 'medications',
        text: 'Medications',
        type: 'group',
        repeats: true,
        extension: hideAddButton ? [{ url: GROUP_HIDE_ADD_ITEM_BUTTON_EXTENSION_URL, valueBoolean: true }] : undefined,
        item: [
            { linkId: 'medications-name', text: 'Name', type: 'string' },
            { linkId: 'medications-dose', text: 'Dose', type: 'string' },
        ],
    };
}

function buildContext(item: FCEQuestionnaireItem): ItemContext[] {
    const questionnaire: Questionnaire = { resourceType: 'Questionnaire', status: 'active', item: [item] };
    const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
    };

    return [{ questionnaire, resource: questionnaireResponse, context: questionnaireResponse }];
}

const FORM_VALUES: FormItems = {
    medications: {
        items: [{ items: {} }],
    },
};

const WithMedicationsProviderDecorator: Decorator = (Story) => {
    const methods = useForm<FormItems>({ defaultValues: FORM_VALUES });

    return (
        <FormProvider {...methods}>
            <QuestionnaireResponseFormProvider
                questionItemComponents={questionItemComponents}
                formValues={{}}
                setFormValues={() => undefined}
                fhirService={async () => success(undefined)}
                evaluateFhirpath={() => []}
            >
                <ValueSetExpandProvider.Provider value={async () => []}>
                    <form className={s.form}>
                        <Story />
                    </form>
                </ValueSetExpandProvider.Provider>
            </QuestionnaireResponseFormProvider>
        </FormProvider>
    );
};

const meta: Meta<typeof Group> = {
    title: 'GroupHideAddItemButton / RepeatableGroups',
    component: Group,
    decorators: [withColorSchemeDecorator, WithMedicationsProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof Group>;

function renderStory(hideAddButton: boolean) {
    const questionItem = buildMedicationsItem(hideAddButton);

    return <Group parentPath={[]} questionItem={questionItem} context={buildContext(questionItem)} />;
}

export const AddAndRemoveVisible: Story = {
    render: () => renderStory(false),
};

export const AddAndRemoveHidden: Story = {
    render: () => renderStory(true),
};
