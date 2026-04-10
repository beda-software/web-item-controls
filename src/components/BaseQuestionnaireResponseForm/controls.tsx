import {
    GroupItemComponent,
    ItemControlGroupItemComponentMapping,
    ItemControlQuestionItemComponentMapping,
    QuestionItemComponentMapping,
} from 'sdc-qrf';

import {
    MarkdownCard,
    MarkdownDisplay,
} from 'src/components/BaseQuestionnaireResponseForm/readonly-widgets/MarkdownRender';
import { TextWithMacroFill } from 'src/components/TextWithMacroFill';
import { AudioRecorderUploader } from 'src/controls/AudioRecorderUploader';
import { Barcode } from 'src/controls/Barcode';
import { BloodPressure } from 'src/controls/BloodPressure';
import { QuestionBoolean } from 'src/controls/Boolean';
import { QuestionChoice } from 'src/controls/Choice';
import { Display } from 'src/controls/Display';
import { EditableGroup } from 'src/controls/EditableGroup';
import { GroupTable } from 'src/controls/GroupTable';
import { GroupTabs } from 'src/controls/GroupTabs';
import { GroupVoice } from 'src/controls/GroupVoice';
import { GroupWizard, GroupWizardVertical, GroupWizardWithTooltips } from 'src/controls/GroupWizard';
import { QuestionInputInsideText } from 'src/controls/InsideText';
import { QuestionDecimal, QuestionInteger, QuestionQuantity } from 'src/controls/Number';
import { QuestionDateTime } from 'src/controls/QuestionDateTime';
import { QuestionSolidRadio } from 'src/controls/Radio';
import { QuestionReference } from 'src/controls/Reference';
import { QuestionSlider } from 'src/controls/Slider';
import { QuestionEmail, QuestionString, QuestionText } from 'src/controls/String';
import { UploadFileControl } from 'src/controls/UploadFileControl';

import {
    Col,
    Grid,
    Group,
    Gtable,
    InlineChoice,
    MDEditorControl,
    MainCard,
    QuestionPhone,
    Row,
    Section,
    SectionWithDivider,
    SubCard,
    TimeRangePickerControl,
} from './widgets';
import { InlineReference } from './widgets/inline-reference';
import { PasswordInput } from './widgets/PasswordInput';

export const itemComponents: QuestionItemComponentMapping = {
    text: QuestionText,
    string: QuestionString,
    decimal: QuestionDecimal,
    integer: QuestionInteger,
    date: QuestionDateTime,
    dateTime: QuestionDateTime,
    time: QuestionDateTime,
    choice: QuestionChoice,
    'open-choice': QuestionChoice,
    boolean: QuestionBoolean,
    display: Display,
    reference: QuestionReference,
    quantity: QuestionQuantity,
    attachment: UploadFileControl,
};

export const groupComponent: GroupItemComponent = Group;

export const itemControlComponents: ItemControlQuestionItemComponentMapping = {
    phoneWidget: QuestionPhone,
    email: QuestionEmail,
    passwordWidget: PasswordInput,
    slider: QuestionSlider,
    'solid-radio-button': QuestionSolidRadio,
    'inline-choice': InlineChoice,
    'inline-reference': InlineReference,
    'text-with-macro': TextWithMacroFill,
    'radio-button': InlineChoice,
    'check-box': InlineChoice,
    'input-inside-text': QuestionInputInsideText,
    'markdown-editor': MDEditorControl,
    'audio-recorder-uploader': AudioRecorderUploader,
    barcode: Barcode,
    markdown: MarkdownDisplay,
    'markdown-card': MarkdownCard,
    // reference-radio-button is deprecated, use inline-reference instead
    'reference-radio-button': InlineReference,
};

export const groupControlComponents: ItemControlGroupItemComponentMapping = {
    col: Col,
    row: Row,
    gtable: Gtable,
    table: Gtable,
    grid: Grid,
    section: Section,
    'section-with-divider': SectionWithDivider,
    'main-card': MainCard,
    'sub-card': SubCard,
    'blood-pressure': BloodPressure,
    'time-range-picker': TimeRangePickerControl,
    wizard: GroupWizard,
    'wizard-with-tooltips': GroupWizardWithTooltips,
    'wizard-navigation-group': GroupWizard,
    'wizard-vertical': GroupWizardVertical,
    'group-tabs': GroupTabs,
    'group-table': GroupTable,
    'editable-group': EditableGroup,
    'group-voice': GroupVoice,
};
