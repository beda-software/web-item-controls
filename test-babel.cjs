const { transformAsync } = require('@babel/core');
const fs = require('fs');

async function main() {
    const code = fs.readFileSync('node_modules/@beda.software/fhir-questionnaire/components/QuestionnaireResponseForm/BaseQuestionnaireResponseForm/utils.tsx', 'utf8');
    const result = await transformAsync(code, {
        filename: 'node_modules/@beda.software/fhir-questionnaire/components/QuestionnaireResponseForm/BaseQuestionnaireResponseForm/utils.tsx',
        plugins: ['macros'],
        presets: ['@babel/preset-typescript'],
        babelrc: false,
        configFile: false,
    });
    if (result.code.includes('@lingui/macro')) {
        console.log('Macro was NOT stripped.');
    } else {
        console.log('Macro WAS stripped.');
    }
}
main().catch(console.error);
