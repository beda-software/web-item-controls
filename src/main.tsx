import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import 'src/services/initialize';

import 'antd/dist/reset.css';
import 'src/styles/index.scss';

// import { PatientDashboardProvider } from 'src/components/Dashboard/contexts';
import { App } from 'src/containers/App';
// import { dashboard } from 'src/dashboard.config';
import { dynamicActivate, getCurrentLocale } from 'src/services/i18n';
import { expandEMRValueSet } from 'src/services/valueset-expand';

import { ValueSetExpandProvider } from './contexts';
import * as serviceWorker from './serviceWorker';
import { ThemeProvider } from './theme/ThemeProvider';

const AppWithContext = () => {
    useEffect(() => {
        dynamicActivate(getCurrentLocale());
    }, []);

    return (
        <ValueSetExpandProvider.Provider value={expandEMRValueSet}>
            <ThemeProvider>
                <I18nProvider i18n={i18n}>
                    <App />
                </I18nProvider>
            </ThemeProvider>
        </ValueSetExpandProvider.Provider>
    );
};

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <AppWithContext />
    </React.StrictMode>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
