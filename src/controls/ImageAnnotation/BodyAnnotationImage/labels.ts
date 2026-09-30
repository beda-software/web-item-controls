import { t } from '@lingui/macro';

import { BodyRegionKey } from './body-regions';

export function getBodyRegionLabel(key: BodyRegionKey): string {
    const labels: Record<BodyRegionKey, string> = {
        face: t`Face`,
        backOfHead: t`Back of head`,
        leftNeck: t`Left side of neck`,
        rightNeck: t`Right side of neck`,
        leftShoulder: t`Left shoulder`,
        rightShoulder: t`Right shoulder`,
        leftChest: t`Left chest`,
        rightChest: t`Right chest`,
        leftUpperBack: t`Left upper back`,
        rightUpperBack: t`Right upper back`,
        leftFlank: t`Left flank`,
        rightFlank: t`Right flank`,
        leftAbdomen: t`Left abdomen`,
        rightAbdomen: t`Right abdomen`,
        leftLowerBack: t`Left lower back`,
        rightLowerBack: t`Right lower back`,
        leftUpperArm: t`Left upper arm`,
        rightUpperArm: t`Right upper arm`,
        leftForearm: t`Left forearm`,
        rightForearm: t`Right forearm`,
        leftGroin: t`Left groin`,
        rightGroin: t`Right groin`,
        leftButtock: t`Left buttock`,
        rightButtock: t`Right buttock`,
        leftThigh: t`Left thigh`,
        rightThigh: t`Right thigh`,
        leftKnee: t`Left knee`,
        rightKnee: t`Right knee`,
        leftBackOfKnee: t`Back of left knee`,
        rightBackOfKnee: t`Back of right knee`,
        leftLowerLeg: t`Left lower leg`,
        rightLowerLeg: t`Right lower leg`,
        leftCalf: t`Left calf`,
        rightCalf: t`Right calf`,
        leftHeel: t`Left heel`,
        rightHeel: t`Right heel`,
    };

    return labels[key];
}
