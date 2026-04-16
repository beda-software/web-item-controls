import generatePicker from 'antd/es/date-picker/generatePicker';
import momentGenerateConfig from 'rc-picker/lib/generate/moment';

const resolvedMomentGenerateConfig =
    (momentGenerateConfig as unknown as { default?: typeof momentGenerateConfig }).default ?? momentGenerateConfig;

export const DatePicker = generatePicker<moment.Moment>(resolvedMomentGenerateConfig);
