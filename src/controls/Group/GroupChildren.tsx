import { LockOutlined } from '@ant-design/icons';
import { Trans } from '@lingui/macro';
import { FCEQuestionnaireItem, ItemContext, QuestionItems } from 'sdc-qrf';

import {
    itemControlQuestionItemComponents as readonlyItemControlQuestionItemComponents,
    questionItemComponents as readonlyQuestionItemComponents,
} from 'src/readonly-controls';

import { unwrapVoiceGroup, useGroupGateInfo } from './accordionContext';
import { S } from './styles';

// Renders a gated field's current value with the library's readonly display
// components (src/readonly-controls) rather than the editable QuestionItems/
// QuestionItem pipeline - while a sibling collection is open it's meant to be read,
// not edited, so it shouldn't look like a disabled edit control. Mirrors
// QuestionItem's own itemControl-then-type component resolution (see
// node_modules/sdc-qrf/dist/components.js) against the readonly mapping instead.
// getAccordionGateFields only ever admits a bare leaf or a group-voice wrapper around
// exactly one leaf (unwrapVoiceGroup's own definition), so there's always exactly one
// real leaf to resolve here - never a group that itself needs QuestionItems.
function ReadOnlyGateField(props: { item: FCEQuestionnaireItem; parentPath: string[]; context: ItemContext }) {
    const { item, parentPath, context } = props;
    const leaf = unwrapVoiceGroup(item);
    const itemControlCode = leaf.itemControl?.coding?.[0]?.code;
    const Component =
        (itemControlCode && readonlyItemControlQuestionItemComponents[itemControlCode]) ||
        readonlyQuestionItemComponents[leaf.type];

    if (!Component) {
        return null;
    }

    // The leaf's own path sits one level deeper than `item`'s when it's wrapped (e.g.
    // group-voice) - same convention as isGateFieldAnswered in accordionContext.ts.
    const leafParentPath = leaf === item ? parentPath : [...parentPath, item.linkId, 'items'];

    return <Component questionItem={leaf} parentPath={leafParentPath} context={context} />;
}

// Renders a group's direct children individually (rather than one <QuestionItems
// questionItems={item} /> call for all of them) so a gate field among them (see
// getAccordionGateFields in accordionContext.ts) can be wrapped in its own read-only
// overlay without affecting its siblings. getEnabledQuestions (called internally by
// QuestionItems) evaluates each item's own enableWhen against form values, not
// sibling adjacency, so splitting the array like this renders the same items as one
// combined call would. Shared by Group/index.tsx (plain/section groups) and
// GroupCard/index.tsx (main-card/sub-card groups) so a gate field works the same way
// under either itemControl.
export function GroupChildren(props: { item: FCEQuestionnaireItem[]; parentPath: string[]; context: ItemContext }) {
    const { item, parentPath, context } = props;
    const gateInfo = useGroupGateInfo();

    return (
        <>
            {item.map((child) => {
                if (gateInfo?.isGateField(child.linkId) && gateInfo.isReadOnly) {
                    return (
                        <S.GateOverlay
                            key={child.linkId}
                            onClick={gateInfo.onReactivate}
                            data-testid={`gate-field-${child.linkId}`}
                        >
                            <S.GateHint>
                                <LockOutlined />
                                <Trans>Read-only while editing {gateInfo.activeTitle} - click to edit</Trans>
                            </S.GateHint>
                            <ReadOnlyGateField item={child} parentPath={parentPath} context={context} />
                        </S.GateOverlay>
                    );
                }

                return (
                    <QuestionItems
                        key={child.linkId}
                        questionItems={[child]}
                        parentPath={parentPath}
                        context={context}
                    />
                );
            })}
        </>
    );
}
