import { ComponentType, createContext } from 'react';
import { FCEQuestionnaireItem, FormItems } from 'sdc-qrf';

export interface AnnotationImageProps {
    questionItem: FCEQuestionnaireItem;
    items: FormItems[];
    activeIndex?: number;
    /** Fired with a new annotation item holding the clicked position. Omit to make the image readonly */
    onAdd?: (item: FormItems) => void;
    /** Fired when a marker is clicked. Omit to disable markers */
    onSelect?: (index: number) => void;
}

/** Custom image annotation renderers keyed by the `backgroundImage` url of the image-annotation group */
export type ImageAnnotationComponents = Record<string, ComponentType<AnnotationImageProps>>;

export const ImageAnnotationProvider = createContext<ImageAnnotationComponents>({});
