import { t } from '@lingui/macro';
import { Questionnaire } from 'fhir/r4b';
import { ReactElement } from 'react';
import { Route } from 'react-router-dom';

import { QuestionnaireResponseForm } from '@beda.software/fhir-questionnaire';
import { questionnaireServiceLoader } from '@beda.software/fhir-questionnaire/components/QuestionnaireResponseForm/questionnaire-response-form-data';
import { success } from '@beda.software/remote-data';

import { AnonymousLayout } from 'src/components/BaseLayout';
import { defaultFooterLayout } from 'src/components/BaseLayout/Footer/context';
import { defaultMenuLayout } from 'src/components/BaseLayout/Sidebar/SidebarTop/context';
import {
    groupControlComponents,
    itemComponents,
    itemControlComponents,
} from 'src/components/BaseQuestionnaireResponseForm/controls';
import { FormWrapper, GroupItemComponent } from 'src/components/FormWrapper';
import { PublicAppointment } from 'src/containers/Appointment/PublicAppointment';
import { SignIn } from 'src/containers/SignIn';
import { service } from 'src/services';

import { EMR } from '../EMR';
import { NotificationPage } from '../NotificationPage';
import { SetPassword } from '../SetPassword';

const getQuestionnaire = (): Questionnaire => {
    return {
        id: 'repeatable-group',
        name: 'Repeatable Group',
        title: 'Repeatable Group',
        status: 'active',
        meta: {
            profile: ['https://emr-core.beda.software/StructureDefinition/fhir-emr-questionnaire'],
        },
        item: [
            {
                text: 'Text',
                type: 'string',
                linkId: 'simple-text',
            },
            {
                text: 'Items',
                type: 'group',
                linkId: 'repeatable-group',
                item: [
                    {
                        item: [
                            {
                                text: 'Text',
                                type: 'string',
                                linkId: 'repeatable-group-text',
                            },
                        ],
                        type: 'group',
                        linkId: 'repeatable-group-inner',
                        repeats: true,
                    },
                ],
            },
        ],
        resourceType: 'Questionnaire',
    };
};

interface AppProps {
    authenticatedRoutes?: ReactElement;
    anonymousRoutes?: ReactElement;
    populateUserInfoSharedState?: () => Promise<any>;
    UserWithNoRolesComponent?: () => ReactElement;
}

export function App(props: AppProps) {
    const { authenticatedRoutes, anonymousRoutes, populateUserInfoSharedState, UserWithNoRolesComponent } = props;

    // Define the default authenticated routes
    const defaultAuthenticatedRoutes = (
        <>
            <Route
                path="/questionnaire"
                element={
                    <QuestionnaireResponseForm
                        questionnaireLoader={questionnaireServiceLoader(() =>
                            Promise.resolve(success(getQuestionnaire())),
                        )}
                        widgetsByQuestionType={itemComponents}
                        widgetsByQuestionItemControl={itemControlComponents}
                        widgetsByGroupQuestionItemControl={groupControlComponents}
                        FormWrapper={FormWrapper}
                        groupItemComponent={GroupItemComponent}
                        serviceProvider={{ service }}
                    />
                }
            />
        </>
    );

    // Define the default anonymous routes
    const defaultAnonymousRoutes = (
        <>
            <Route path="/signin" element={<SignIn originPathName={window.location.pathname} />} />
            <Route path="/reset-password/:code" element={<SetPassword />} />
            <Route
                path="/appointment/book"
                element={
                    <AnonymousLayout>
                        <PublicAppointment />
                    </AnonymousLayout>
                }
            />
            <Route
                path="/questionnaire"
                element={
                    <QuestionnaireResponseForm
                        questionnaireLoader={questionnaireServiceLoader(() =>
                            Promise.resolve(success(getQuestionnaire())),
                        )}
                        widgetsByQuestionType={itemComponents}
                        widgetsByQuestionItemControl={itemControlComponents}
                        widgetsByGroupQuestionItemControl={groupControlComponents}
                        FormWrapper={FormWrapper}
                        groupItemComponent={GroupItemComponent}
                        serviceProvider={{ service }}
                    />
                }
            />
            <Route
                path="/thanks"
                element={
                    <NotificationPage
                        title={t`Thank you!`}
                        text={t`Thank you for filling out the questionnaire. Now you can close this page.`}
                    />
                }
            />
        </>
    );

    return (
        <div data-testid="app-container">
            <EMR
                authenticatedRoutes={authenticatedRoutes ? authenticatedRoutes : defaultAuthenticatedRoutes}
                anonymousRoutes={anonymousRoutes ? anonymousRoutes : defaultAnonymousRoutes}
                populateUserInfoSharedState={populateUserInfoSharedState}
                UserWithNoRolesComponent={UserWithNoRolesComponent}
                menuLayout={defaultMenuLayout}
                footer={defaultFooterLayout}
            />
        </div>
    );
}
