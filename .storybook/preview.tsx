import 'antd/dist/reset.css';
import 'src/styles/index.scss';
import { Preview } from '@storybook/react-vite';
import { formatDateUserInvocationTable, initFHIRPathEvaluateOptions } from 'src/utils/fhirpath';
import { withI18nDecorator, withThemeDecorator } from './decorators';

initFHIRPathEvaluateOptions(formatDateUserInvocationTable);

const preview: Preview = {
    parameters: {
        options: {
            storySort: {
                order: ['Theme', 'components', '*'],
            },
        },
        layout: 'fullscreen',
        actions: {},
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
    },
    decorators: [withThemeDecorator, withI18nDecorator],
};

export const globalTypes = {
    scheme: {
        name: 'Scheme',
        description: 'Select dark or light scheme',
        defaultValue: 'both',
        toolbar: {
            icon: 'mirror',
            items: ['light', 'dark', 'both'],
            dynamicTitle: true,
        },
    },
};

export default preview;
