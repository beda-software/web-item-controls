import { setProjectAnnotations } from '@storybook/react-vite';

import * as projectAnnotations from './preview';

// Apply the global decorators/parameters from preview.tsx to stories run by the Vitest addon
setProjectAnnotations([projectAnnotations]);
