import {
    GroupItemComponent,
    ItemControlGroupItemComponentMapping,
    ItemControlQuestionItemComponentMapping,
    QuestionItemComponentMapping,
} from 'sdc-qrf';

import {
    AnxietyScore,
    AudioAttachment,
    Col,
    DepressionScore,
    Display,
    Group,
    GroupWizardVertical,
    MarkdownCard,
    MarkdownDisplay,
    MarkdownRenderControl,
    NavigationGroup,
    QuestionBoolean,
    QuestionChoice,
    QuestionDateTime,
    QuestionDecimal,
    QuestionInteger,
    QuestionQuantity,
    QuestionReference,
    QuestionText,
    Row,
    TextWithInput,
    TimeRangePickerControl,
    UploadFile,
} from 'src/readonly-controls';

export const itemComponents: QuestionItemComponentMapping = {
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
};

export const groupComponent: GroupItemComponent = Group;

export const itemControlComponents: ItemControlQuestionItemComponentMapping = {
    'inline-choice': QuestionChoice,
    'anxiety-score': AnxietyScore,
    'depression-score': DepressionScore,
    'input-inside-text': TextWithInput,
    'audio-recorder-uploader': AudioAttachment,
    markdown: MarkdownDisplay,
    'markdown-card': MarkdownCard,
    'markdown-editor': MarkdownRenderControl,
};

export const groupControlComponents: ItemControlGroupItemComponentMapping = {
    col: Col,
    row: Row,
    'time-range-picker': TimeRangePickerControl,
    'wizard-navigation-group': NavigationGroup,
    'wizard-vertical': GroupWizardVertical,
};
