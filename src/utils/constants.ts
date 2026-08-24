// NOTE: The purpose of this file is to determine a list of variables that
// can be used in multiple files across the project. Please, use understandable
// names of variables or add comments.

// This variable describes the code for the role attribute in the PractitionerRole
// resource. PractitionerRoles with this role can be used in selects when we need
// to provide healthcare service.
export const practitionerRoleDoctor = 'doctor';

export const LOINC_CODESYSTEM = 'http://loinc.org';

// https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton
// Applied to a repeating group item (type=group, repeats=true) to hide the "add item" button for it.
export const GROUP_HIDE_ADD_ITEM_BUTTON_EXTENSION_URL =
    'https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton';
