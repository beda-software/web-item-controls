import { Trans } from '@lingui/macro';
import React from 'react';
import { QuestionItem } from 'sdc-qrf';

import { S } from './Grid.styles';
import { useGridGroup } from './hooks';
import { GridGroupProps } from './types';
import { RepeatableGroups } from '../RepeatableGroups';

export function GridGroup({ groupItem }: GridGroupProps) {
    const { questionItem } = groupItem;

    const { gridMap } = useGridGroup(questionItem);

    if (!gridMap) {
        return null;
    }

    return (
        <S.Widget>
            <S.Header>
                <S.GridRowLabel>{questionItem.text}</S.GridRowLabel>
            </S.Header>

            <S.GridContainer columns={gridMap.columns.length + 1}>
                <S.GridHeaderCell>
                    <Trans>Parameter</Trans>
                </S.GridHeaderCell>
                {gridMap.columns.map((column) => (
                    <S.GridHeaderCell key={column}>{column}</S.GridHeaderCell>
                ))}

                {gridMap.groups.map((groupMap) => (
                    <React.Fragment key={groupMap.group.linkId}>
                        <S.GridItem $bold>{groupMap.group.text}</S.GridItem>

                        {groupMap.items.map((item, itemIndex) =>
                            item ? (
                                <S.GridItem key={item.linkId}>
                                    {item.type === 'group' ? (
                                        <RepeatableGroups
                                            groupItem={{
                                                questionItem: item,
                                                context: groupItem.context,
                                                parentPath: [
                                                    ...groupItem.parentPath,
                                                    groupItem.questionItem.linkId,
                                                    'items',
                                                    groupMap.group.linkId,
                                                    'items',
                                                ],
                                            }}
                                        />
                                    ) : (
                                        <QuestionItem
                                            questionItem={item}
                                            parentPath={[
                                                ...groupItem.parentPath,
                                                groupItem.questionItem.linkId,
                                                'items',
                                                groupMap.group.linkId,
                                                'items',
                                            ]}
                                            context={groupItem.context[0]!}
                                        />
                                    )}
                                </S.GridItem>
                            ) : (
                                <S.GridItem key={itemIndex} />
                            ),
                        )}
                    </React.Fragment>
                ))}
            </S.GridContainer>
        </S.Widget>
    );
}
