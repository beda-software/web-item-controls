import { useContext } from 'react';
import { FCEQuestionnaireItem } from 'sdc-qrf';

import { ImageAnnotationProvider } from 'src/contexts/image-annotation';

import { AnnotationImage } from './AnnotationImage';

/** Picks the image renderer registered for the group's `backgroundImage` url, `AnnotationImage` by default */
export function useAnnotationImageComponent(questionItem: FCEQuestionnaireItem) {
    const components = useContext(ImageAnnotationProvider);
    const url = questionItem.backgroundImage?.url;

    return (url && components[url]) || AnnotationImage;
}
