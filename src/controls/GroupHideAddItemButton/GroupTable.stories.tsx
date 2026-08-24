import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4b';
import { FormProvider, useForm } from 'react-hook-form';
import { FCEQuestionnaireItem, FormItems, ItemContext, QuestionnaireResponseFormProvider } from 'sdc-qrf';

import { BaseQuestionnaireResponseFormPropsContext } from '@beda.software/fhir-questionnaire/contexts';
import { success } from '@beda.software/remote-data';

import s from 'src/components/BaseQuestionnaireResponseForm/BaseQuestionnaireResponseForm.module.scss';
import { ValueSetExpandProvider } from 'src/contexts';
import { questionItemComponents } from 'src/controls';
import { GroupTable } from 'src/controls/GroupTable';
import { withColorSchemeDecorator } from 'src/storybook/decorators';
import { GROUP_HIDE_ADD_ITEM_BUTTON_EXTENSION_URL } from 'src/utils/constants';

function buildMedicationsItem(hideAddButton: boolean): FCEQuestionnaireItem {
    return {
        linkId: 'medications',
        text: 'Medications',
        type: 'group',
        repeats: true,
        itemControl: { coding: [{ code: 'group-table' }] },
        extension: hideAddButton ? [{ url: GROUP_HIDE_ADD_ITEM_BUTTON_EXTENSION_URL, valueBoolean: true }] : undefined,
        item: [
            { linkId: 'name', text: 'Name', type: 'string' },
            { linkId: 'dose', text: 'Dose', type: 'string' },
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
        items: [
            { name: [{ value: { string: 'Amoxicillin' } }], dose: [{ value: { string: '500mg' } }] },
            { name: [{ value: { string: 'Ibuprofen' } }], dose: [{ value: { string: '200mg' } }] },
        ],
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
                    <BaseQuestionnaireResponseFormPropsContext.Provider value={{ submitting: false }}>
                        <form className={s.form}>
                            <Story />
                        </form>
                    </BaseQuestionnaireResponseFormPropsContext.Provider>
                </ValueSetExpandProvider.Provider>
            </QuestionnaireResponseFormProvider>
        </FormProvider>
    );
};

const meta: Meta<typeof GroupTable> = {
    title: 'GroupHideAddItemButton / GroupTable',
    component: GroupTable,
    decorators: [withColorSchemeDecorator, WithMedicationsProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof GroupTable>;

function renderStory(hideAddButton: boolean) {
    const questionItem = buildMedicationsItem(hideAddButton);

    return <GroupTable parentPath={[]} questionItem={questionItem} context={buildContext(questionItem)} />;
}

export const AddAndDeleteVisible: Story = {
    render: () => renderStory(false),
};

export const AddAndDeleteHidden: Story = {
    render: () => renderStory(true),
};
