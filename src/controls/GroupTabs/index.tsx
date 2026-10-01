import { Badge, Flex, Tabs, theme } from 'antd';
import _ from 'lodash';
import type { Tab } from 'rc-tabs/lib/interface';
import { useState } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import { GroupItemProps, QuestionItems, getEnabledQuestions } from 'sdc-qrf';

import { GroupWizardBus } from 'src/controls/GroupWizard';

import { countValidationErrors } from './utils';

export function GroupTabs(props: GroupItemProps) {
    const { parentPath, questionItem, context } = props;

    if (questionItem.repeats) {
        console.warn('GroupTabs does not support repeatable groups in the first level');
    }

    const formValues = useWatch();
    const { errors } = useFormState();
    const { token } = theme.useToken();
    const [activeKey, setActiveKey] = useState<string>();

    // NOTE: not memoized on purpose: react-hook-form mutates `errors` in place,
    // and tabs are rebuilt on every form values change anyway
    const getTabsItems = (): Tab[] => {
        const { linkId } = questionItem;

        const groupContext = context[0];
        if (!groupContext) {
            return [];
        }

        const item = getEnabledQuestions(questionItem.item ?? [], parentPath, formValues, groupContext);

        return item
            .filter((i) => !i.hidden)
            .map((item) => {
                const itemsPath = [...parentPath, linkId, 'items', item.linkId, 'items'];
                const errorsCount = countValidationErrors(_.get(errors, itemsPath));
                const hasErrors = errorsCount > 0;

                return {
                    key: item.linkId,
                    label: (
                        <Flex
                            align="center"
                            gap={8}
                            data-testid={`group-tab-${item.linkId}`}
                            data-has-errors={hasErrors}
                            style={hasErrors ? { color: token.colorError } : undefined}
                        >
                            {item.text}
                            {hasErrors ? (
                                <Badge
                                    count={errorsCount}
                                    size="small"
                                    data-testid={`group-tab-errors-count-${item.linkId}`}
                                />
                            ) : null}
                        </Flex>
                    ),
                    children: (
                        <Flex gap={16} vertical={true}>
                            <QuestionItems questionItems={item.item!} parentPath={itemsPath} context={groupContext} />
                        </Flex>
                    ),
                };
            });
    };
    const tabsItems = getTabsItems();

    GroupWizardBus.useBus(
        'scrollTo',
        ({ groupLinkId }) => {
            if (tabsItems.some((tab) => tab.key === groupLinkId)) {
                setActiveKey(groupLinkId);
            }
        },
        [tabsItems],
    );

    return (
        <Tabs
            type="card"
            items={tabsItems}
            activeKey={activeKey ?? tabsItems[0]?.key}
            onChange={setActiveKey}
            destroyInactiveTabPane
        />
    );
}
