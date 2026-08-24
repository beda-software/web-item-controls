import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4b';
import { FormProvider, useForm } from 'react-hook-form';
import { FCEQuestionnaireItem, FormItems, ItemContext, QuestionnaireResponseFormProvider } from 'sdc-qrf';

import { success } from '@beda.software/remote-data';

import s from 'src/components/BaseQuestionnaireResponseForm/BaseQuestionnaireResponseForm.module.scss';
import { ValueSetExpandProvider } from 'src/contexts';
import { questionItemComponents } from 'src/controls';
import { Gtable } from 'src/controls/Group';
import { withColorSchemeDecorator } from 'src/storybook/decorators';
import { GROUP_HIDE_ADD_ITEM_BUTTON_EXTENSION_URL } from 'src/utils/constants';

function buildInterventionsItem(hideAddButton: boolean): FCEQuestionnaireItem {
    return {
        linkId: 'interventions',
        text: 'Interventions and actions',
        type: 'group',
        repeats: true,
        itemControl: { coding: [{ code: 'gtable' }] },
        extension: hideAddButton ? [{ url: GROUP_HIDE_ADD_ITEM_BUTTON_EXTENSION_URL, valueBoolean: true }] : undefined,
        item: [
            { linkId: 'interventions-action', text: 'Action', type: 'string' },
            { linkId: 'interventions-owner', text: 'Owner', type: 'string' },
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
    interventions: {
        items: [{ items: {} }, { items: {} }],
    },
};

const WithInterventionsProviderDecorator: Decorator = (Story) => {
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

const meta: Meta<typeof Gtable> = {
    title: 'GroupHideAddItemButton / GTable',
    component: Gtable,
    decorators: [withColorSchemeDecorator, WithInterventionsProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof Gtable>;

function renderStory(hideAddButton: boolean) {
    const questionItem = buildInterventionsItem(hideAddButton);

    return <Gtable parentPath={[]} questionItem={questionItem} context={buildContext(questionItem)} />;
}

export const AddAndDeleteVisible: Story = {
    render: () => renderStory(false),
};

export const AddAndDeleteHidden: Story = {
    render: () => renderStory(true),
};
