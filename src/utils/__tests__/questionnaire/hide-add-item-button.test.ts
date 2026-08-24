import { FCEQuestionnaireItem } from 'sdc-qrf';
import { describe, expect, test } from 'vitest';

import { GROUP_HIDE_ADD_ITEM_BUTTON_EXTENSION_URL, isGroupAddItemButtonHidden } from 'src/utils';

function groupItem(extension?: FCEQuestionnaireItem['extension']): FCEQuestionnaireItem {
    return {
        linkId: 'repeatable-group',
        type: 'group',
        repeats: true,
        extension,
    } as FCEQuestionnaireItem;
}

describe('isGroupAddItemButtonHidden', () => {
    test('returns false when there is no extension', () => {
        expect(isGroupAddItemButtonHidden(groupItem())).toBe(false);
    });

    test('returns false when the extension is present with valueBoolean=false', () => {
        const item = groupItem([{ url: GROUP_HIDE_ADD_ITEM_BUTTON_EXTENSION_URL, valueBoolean: false }]);

        expect(isGroupAddItemButtonHidden(item)).toBe(false);
    });

    test('returns true when the extension is present with valueBoolean=true', () => {
        const item = groupItem([{ url: GROUP_HIDE_ADD_ITEM_BUTTON_EXTENSION_URL, valueBoolean: true }]);

        expect(isGroupAddItemButtonHidden(item)).toBe(true);
    });

    test('ignores unrelated extensions', () => {
        const item = groupItem([
            { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden', valueBoolean: true },
        ]);

        expect(isGroupAddItemButtonHidden(item)).toBe(false);
    });
});
