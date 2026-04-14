import { ReactElement } from 'react';

interface AppProps {
    authenticatedRoutes?: ReactElement;
    anonymousRoutes?: ReactElement;
    populateUserInfoSharedState?: () => Promise<any>;
    UserWithNoRolesComponent?: () => ReactElement;
}

export function App(props: AppProps) {
    return <div data-testid="app-container"></div>;
}
