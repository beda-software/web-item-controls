import { Flex, Tabs } from 'antd';
import type { Tab } from 'rc-tabs/lib/interface';
import { useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { GroupItemProps, QuestionItems, getEnabledQuestions } from 'sdc-qrf';

import { GroupWizardBus } from 'src/controls/GroupWizard';

export function GroupTabs(props: GroupItemProps) {
    const { parentPath, questionItem, context } = props;

    if (questionItem.repeats) {
        console.warn('GroupTabs does not support repeatable groups in the first level');
    }

    const formValues = useWatch();
    const [activeKey, setActiveKey] = useState<string>();

    const tabsItems: Tab[] = useMemo(() => {
        const { linkId } = questionItem;

        const groupContext = context[0];
        if (!groupContext) {
            return [];
        }

        const item = getEnabledQuestions(questionItem.item ?? [], parentPath, formValues, groupContext);

        return item
            .filter((i) => !i.hidden)
            .map((item) => {
                return {
                    key: item.linkId,
                    label: item.text,
                    children: (
                        <Flex gap={16} vertical={true}>
                            <QuestionItems
                                questionItems={item.item!}
                                parentPath={[...parentPath, linkId, 'items', item.linkId, 'items']}
                                context={groupContext}
                            />
                        </Flex>
                    ),
                };
            });
    }, [context, formValues, parentPath, questionItem]);

    GroupWizardBus.useBus(
        'scrollTo',
        ({ groupLinkId }) => {
            setActiveKey(groupLinkId);
        },
        [],
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
