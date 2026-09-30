import { Attachment, QuestionnaireItemAnswerOption } from 'fhir/r4b';

/** Attachment rendered next to the answer option, the same extension as the item level one */
export const answerOptionBackgroundImageUrl = 'http://aidbox.io/questionnaire-backgroundImage';

export function getAnswerOptionBackgroundImage(answerOption: QuestionnaireItemAnswerOption): Attachment | undefined {
    return answerOption.extension?.find(({ url }) => url === answerOptionBackgroundImageUrl)?.valueAttachment;
}
