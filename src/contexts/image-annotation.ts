import { ComponentType, createContext } from 'react';
import { FCEQuestionnaireItem, FormItems } from 'sdc-qrf';

export interface AnnotationImageProps {
    questionItem: FCEQuestionnaireItem;
    items: FormItems[];
    activeIndex?: number;
    /** Fired with a new annotation item holding the clicked location. Omit to make the image readonly */
    onAdd?: (item: FormItems) => void;
    /** Fired when a marker is clicked. Omit to disable markers */
    onSelect?: (index: number) => void;
}

/**
 * Image annotation renderer. Besides the component itself it decides which child items of the group store
 * the annotation location (e.g. x/y coordinates or a body site code) and which ones describe the annotation.
 */
export type AnnotationImageComponent = ComponentType<AnnotationImageProps> & {
    /** Child items shown in the annotation details panel; undefined when the group doesn't fit the renderer */
    getDetailItems: (questionItem: FCEQuestionnaireItem) => FCEQuestionnaireItem[] | undefined;
};

/** Custom image annotation renderers keyed by the `backgroundImage` url of the image-annotation group */
export type ImageAnnotationComponents = Record<string, AnnotationImageComponent>;

export const ImageAnnotationProvider = createContext<ImageAnnotationComponents>({});
