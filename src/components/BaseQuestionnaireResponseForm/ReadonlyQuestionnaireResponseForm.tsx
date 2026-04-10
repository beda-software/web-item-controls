import { useContext } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    calcInitialContext,
    FormItems,
    QRFContextData,
    QuestionItems,
    QuestionnaireResponseFormData,
    QuestionnaireResponseFormProvider,
} from 'sdc-qrf';

import {
    ItemControlGroupItemReadonlyWidgetsContext,
    ItemControlQuestionItemReadonlyWidgetsContext,
} from 'src/components/BaseQuestionnaireResponseForm/context';
import { Barcode } from 'src/controls/Barcode';
import { AudioAttachment } from 'src/readonly-controls/AudioAttachment';
import { QuestionBoolean } from 'src/readonly-controls/Boolean';
import { QuestionChoice } from 'src/readonly-controls/Choice';
import { QuestionDateTime } from 'src/readonly-controls/DateTime';
import { Display } from 'src/readonly-controls/Display';
import { Col, Group, Row } from 'src/readonly-controls/Group';
import { NavigationGroup } from 'src/readonly-controls/Group/NavigationGroup';
import { GroupWizardVertical } from 'src/readonly-controls/GroupWizard';
import { MarkdownCard, MarkdownDisplay, MarkdownRenderControl } from 'src/readonly-controls/MarkdownRender';
import { service } from 'src/services/fhir';
import { evaluate } from 'src/utils/fhirpath';

import { QuestionInteger, QuestionDecimal, QuestionQuantity } from './readonly-widgets/number';
import { QuestionReference } from './readonly-widgets/reference';
import { AnxietyScore, DepressionScore } from './readonly-widgets/score';
import { QuestionText, TextWithInput } from './readonly-widgets/string';
import { TimeRangePickerControl } from './readonly-widgets/TimeRangePickerControl';
import { UploadFile } from './readonly-widgets/UploadFile';

interface Props extends Partial<QRFContextData> {
    formData: QuestionnaireResponseFormData;
}

export function ReadonlyQuestionnaireResponseForm(props: Props) {
    const {
        formData,
        questionItemComponents,
        itemControlQuestionItemComponents,
        itemControlGroupItemComponents,
        ...other
    } = props;
    const methods = useForm<FormItems>({
        defaultValues: formData.formValues,
    });
    const { watch } = methods;

    const formValues = watch();

    const ItemControlQuestionItemReadonlyWidgetsFromContext = useContext(ItemControlQuestionItemReadonlyWidgetsContext);
    const ItemControlGroupItemReadonlyWidgetsFromContext = useContext(ItemControlGroupItemReadonlyWidgetsContext);

    return (
        <FormProvider {...methods}>
            <form>
                <QuestionnaireResponseFormProvider
                    {...other}
                    fhirService={service}
                    formValues={formValues}
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    setFormValues={() => {}}
                    groupItemComponent={Group}
                    itemControlGroupItemComponents={{
                        col: Col,
                        row: Row,
                        'time-range-picker': TimeRangePickerControl,
                        'wizard-navigation-group': NavigationGroup,
                        'wizard-vertical': GroupWizardVertical,
                        ...itemControlGroupItemComponents,
                        ...ItemControlGroupItemReadonlyWidgetsFromContext,
                    }}
                    questionItemComponents={{
                        text: QuestionText,
                        time: QuestionDateTime,
                        string: QuestionText,
                        integer: QuestionInteger,
                        decimal: QuestionDecimal,
                        quantity: QuestionQuantity,
                        choice: QuestionChoice,
                        date: QuestionDateTime,
                        dateTime: QuestionDateTime,
                        reference: QuestionReference,
                        display: Display,
                        boolean: QuestionBoolean,
                        attachment: UploadFile,
                        ...questionItemComponents,
                    }}
                    itemControlQuestionItemComponents={{
                        'inline-choice': QuestionChoice,
                        'anxiety-score': AnxietyScore,
                        'depression-score': DepressionScore,
                        'input-inside-text': TextWithInput,
                        'audio-recorder-uploader': AudioAttachment,
                        barcode: Barcode,
                        markdown: MarkdownDisplay,
                        'markdown-card': MarkdownCard,
                        'markdown-editor': MarkdownRenderControl,
                        ...itemControlQuestionItemComponents,
                        ...ItemControlQuestionItemReadonlyWidgetsFromContext,
                    }}
                    evaluateFhirpath={evaluate}
                >
                    <>
                        <QuestionItems
                            questionItems={formData.context.fceQuestionnaire.item!}
                            parentPath={[]}
                            context={calcInitialContext(formData.context, formValues)}
                        />
                    </>
                </QuestionnaireResponseFormProvider>
            </form>
        </FormProvider>
    );
}
