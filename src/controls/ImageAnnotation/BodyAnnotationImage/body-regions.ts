// Generated from the Figma body charts (DPC): the front view (node 1779-15393, 289x566) and the back view
// (node 1779-14903, 160x320, scaled into the front view box). The patient's left is on the right in the front view
// and on the left in the back view.
// Region codes come from the http://hl7.org/fhir/ValueSet/body-site value set; paths share a code where there is
// no side-specific code for a smaller area (e.g. both upper arm paths are coded as the whole upper arm).

export const BODY_VIEW_BOX = { width: 289, height: 566 };

const FRONT_PATHS = {
    head: 'M122.678 8.25714L115.6 34.2082L121.498 56.6204L133.294 67.2367L143.91 73.1347L158.065 64.8776L166.322 55.4408L171.041 29.4898L165.143 7.07755L143.91 0L122.678 8.25714Z',
    leftNeck:
        'M160.425 68.416L146.269 96.7262V113.241L178.118 115.6L204.069 129.755L200.531 106.163L182.837 101.445L168.682 88.4691L160.425 68.416Z',
    rightNeck:
        'M84 127.98L87.5388 105.567L105.233 99.6694L119.388 85.5143L128.824 69L141.8 96.1306L140.62 111.465L109.951 112.645L84 127.98Z',
    leftShoulder:
        'M226.482 153.347L230.02 138.012L228.841 119.139L219.404 109.702L205.249 104.984L208.788 123.857L206.429 136.833L226.482 153.347Z',
    rightShoulder:
        'M81.3919 136.833L61.3388 153.347L57.8 138.012L58.9796 117.959L70.7756 107.343H82.5715L77.8531 125.037L81.3919 136.833Z',
    leftChest:
        'M149.808 120.318L147.449 159.245L167.502 167.502L195.812 160.424L204.069 136.833L179.298 120.318H149.808Z',
    rightChest: 'M86 132.976L90.7184 158.927L117.849 166.004L139.082 157.747L137.902 120H108.412L86 132.976Z',
    leftFlank:
        'M198.171 182.836L194.633 165.143L169.861 172.22L173.4 185.196L174.58 240.636L189.914 227.661L192.273 201.71L198.171 182.836Z',
    rightFlank:
        'M97.9061 226.481L95.5469 207.608L89.6489 182.836L93.1877 165.143L117.959 171.041L113.241 182.836V241.816L97.9061 226.481Z',
    leftAbdomen:
        'M162.784 171.041L167.502 185.196L168.682 225.302V267.767L162.784 284.281L159.245 300.796L148.629 311.412L147.449 244.175L146.269 194.632L147.449 165.143L162.784 171.041Z',
    rightAbdomen:
        'M126.216 169.861L140.371 165.143L141.551 194.632L140.371 244.175L139.192 310.232L128.575 299.616L117.959 264.228V226.481L119.139 186.375L126.216 169.861Z',
    leftUpperArmLateral:
        'M206.429 142.731L202.89 158.066L220.584 191.094L235.918 207.608L239.457 199.351L227.661 160.425L206.429 142.731Z',
    leftUpperArmMedial: 'M200.531 160.425V178.119L219.404 209.968L224.122 202.89L218.225 194.633L200.531 160.425Z',
    rightUpperArmLateral:
        'M48.3633 196.992L51.9021 206.429L66.0572 191.094L83.751 155.706L80.2123 142.731L58.9796 161.604L48.3633 196.992Z',
    rightUpperArmMedial: 'M64.8776 200.531L86.1102 160.425V175.759L66.0572 211.147L64.8776 200.531Z',
    leftForearmLateral:
        'M244.176 201.71L240.637 212.327L231.2 211.147L274.845 284.282L289 290.18L270.127 258.331L259.51 220.584L244.176 201.71Z',
    leftForearmMedial:
        'M224.122 208.788V224.122L232.38 242.996L246.535 259.51L266.588 292.539L273.665 287.82L224.122 208.788Z',
    rightForearmLateral:
        'M17.6939 255.971L29.4898 217.045L42.4653 202.89L47.1837 214.686L55.4408 212.326L12.9755 281.922L0 289L17.6939 255.971Z',
    rightForearmMedial:
        'M20.053 292.539L38.9265 261.869L54.2612 242.996L62.5183 222.943L61.3387 207.608L14.155 285.461L20.053 292.539Z',
    leftGroin:
        'M152.167 318.49L156.886 360.955L173.4 318.49L179.298 289L187.555 272.485L173.4 267.767L163.963 301.975L152.167 318.49Z',
    rightGroin:
        'M138.012 319.67L129.755 362.135L121.498 335.004L116.78 326.747L114.42 310.233L109.702 296.078L100.265 271.306L114.42 266.588L120.318 286.641L126.216 304.335L138.012 319.67Z',
    leftThighAnterior:
        'M182.837 305.515L186.376 289L193.453 273.666L202.89 292.539L205.249 323.208L196.992 384.547L188.735 397.523L180.478 371.572L179.298 322.029L182.837 305.515Z',
    leftThighMedial:
        'M172.22 421.114L160.424 372.751L175.759 329.106L176.939 376.29L185.196 403.42L181.657 423.473L172.22 421.114Z',
    leftThighLateral:
        'M207.608 326.747L213.506 358.596V405.78L209.967 421.114L192.273 399.882L202.89 385.727L207.608 326.747Z',
    rightThighAnterior:
        'M100.265 285.461L107.343 312.592V369.212L99.0857 396.343L89.649 383.368L84.9306 346.8L81.3918 322.029L84.9306 291.359L93.1878 273.666L100.265 285.461Z',
    rightThighMedial:
        'M112.061 373.931L110.882 324.388L119.139 342.082L128.576 373.931L123.857 390.445L115.6 422.294L104.984 423.473L102.625 404.6L112.061 373.931Z',
    rightThighLateral:
        'M94.3673 399.882L76.6734 421.114L74.3142 395.163V368.033L77.853 330.286L84.9305 385.726L94.3673 399.882Z',
    leftKnee: 'M189.914 404.6L208.788 427.012V439.988L201.71 454.143L187.555 452.963L181.657 436.449L189.914 404.6Z',
    rightKnee:
        'M97.9062 404.6L100.265 414.037L102.625 425.833L104.984 436.449L101.445 452.963H86.1103L79.0327 441.167V425.833L87.2899 416.396L97.9062 404.6Z',
    leftLowerLegLateral:
        'M206.429 463.579L212.327 443.526L221.763 465.939L230.02 484.812L226.482 542.612L230.02 565.024H215.865L206.429 463.579Z',
    leftLowerLegMedial:
        'M209.967 563.845L201.71 460.041L188.735 457.682L185.196 469.478V477.735L189.914 511.943L209.967 563.845Z',
    rightLowerLegLateral:
        'M71.9551 562.665L80.2122 476.555L81.3918 463.58L75.4939 445.886L71.9551 455.322L64.8776 467.118L60.1592 484.812L63.698 543.792L60.1592 565.025L71.9551 562.665Z',
    rightLowerLegMedial:
        'M102.624 457.682L103.804 469.478V482.453L101.445 497.788V510.763L93.1877 526.098L88.4694 541.433L77.853 562.665L79.0326 542.612L81.3918 521.38L82.5714 507.225L83.751 490.71L86.1102 474.196L87.2898 458.861L102.624 457.682Z',
};

const BACK_PATHS = {
    head: 'M81.0211 0L73.5317 1.3617L65.3615 8.85106L64.6807 20.4255L72.17 32H89.1913L94.6381 21.7872L95.319 7.48936L89.1913 2.04255L81.0211 0Z',
    leftTrapezius:
        'M71.4894 34.7234H76.2553L75.5745 61.2766L76.2553 103.489L61.2766 85.1064L56.5107 65.3617L49.7021 58.5532L62.6383 53.1064L70.1277 43.5745L71.4894 34.7234Z',
    rightTrapezius:
        'M83.7446 34.7234H89.1914L90.5531 43.5745L97.3616 52.4255L110.298 58.5532L103.489 64.6808L98.7234 85.1064L83.7446 103.489L85.1063 61.2766L83.7446 34.7234Z',
    leftShoulder:
        'M46.9789 59.2341L36.7661 62.6384L27.915 70.8086L29.2767 85.7873L38.8087 78.9788L43.5746 74.2129L46.9789 59.2341Z',
    rightShoulder:
        'M113.702 59.2341L125.277 63.3192L132.085 71.4894L130.723 85.7873L119.83 78.298L115.745 72.1703L113.702 59.2341Z',
    leftScapula:
        'M49.702 61.9575L44.936 78.2979L45.6169 88.5107L54.468 120.511L75.5743 113.702V106.213L58.5531 86.4682L53.7871 66.0426L49.702 61.9575Z',
    rightScapula:
        'M110.298 61.9575L115.064 78.9788L114.383 89.8724L105.532 120.511L84.4253 113.702V106.213L101.447 87.149L106.213 66.7235L110.298 61.9575Z',
    leftUpperArmLateral:
        'M42.8936 79.6597L28.5957 89.1916L23.1489 115.745L26.5532 130.723L34.7234 102.128L42.8936 89.1916V79.6597Z',
    rightUpperArmLateral:
        'M117.787 80.3403L131.404 89.1914L137.532 117.106L133.447 131.404L124.596 100.766L117.106 89.1914L117.787 80.3403Z',
    leftUpperArmMedial: 'M42.8935 93.2766V109.617L36.7658 120.511L30.6382 123.915L36.085 104.851L42.8935 93.2766Z',
    rightUpperArmMedial: 'M116.426 93.2766L123.234 103.489L128.681 123.915L122.553 120.511L116.426 110.298V93.2766Z',
    leftLowerBack: 'M76.2553 116.426L55.1489 123.234L56.5106 133.447L78.9787 163.404L74.8936 132.766L76.2553 116.426Z',
    rightLowerBack: 'M83.7449 116.426L104.851 123.234L103.49 133.447L81.0215 163.404L85.1066 134.128L83.7449 116.426Z',
    rightForearmLateral:
        'M138.213 121.191L145.702 133.447L149.106 150.468L160 170.213L153.872 166.808L140.936 142.979L134.809 134.128L138.213 121.191Z',
    leftForearmLateral:
        'M21.7872 121.191L14.2979 134.128L10.8936 149.787L0 170.213L6.12766 166.808L19.7447 141.617L25.1915 132.766L21.7872 121.191Z',
    rightForearmMedial:
        'M130.043 127.319L123.915 124.596L126.638 135.489L145.702 166.128L149.107 174.298L151.149 167.489L130.043 127.319Z',
    leftForearmMedial:
        'M29.9576 127.319L35.4045 124.596L33.3619 134.808L14.9789 164.766L10.8938 173.617L8.17041 167.489L29.9576 127.319Z',
    leftButtock:
        'M71.4895 159.319L48.3405 173.617L47.6597 189.957L50.3831 201.532L75.5746 194.042L78.9788 183.83L71.4895 159.319Z',
    rightButtock:
        'M88.5107 158.638L81.7021 183.149L83.7447 193.362L108.936 201.532L111.66 190.638L110.979 173.617L88.5107 158.638Z',
    leftThighMedial:
        'M76.9361 196.766H71.4893L66.0425 200.851L72.1701 230.808L77.617 217.191L78.2978 206.979L76.9361 196.766Z',
    rightThighMedial:
        'M83.0638 196.085L89.1915 197.447L94.6383 201.532L87.8298 230.809L83.0638 217.872L81.7021 206.979L83.0638 196.085Z',
    leftThighLateral:
        'M46.2981 195.404L49.7024 206.979L58.5534 201.532L56.5109 216.511L55.1492 240.34L46.979 253.277L46.2981 234.894L44.2556 226.043L43.5747 210.383L46.2981 195.404Z',
    rightThighLateral:
        'M114.383 194.723L110.979 206.298L102.127 201.532L104.851 218.553L106.213 240.34L113.702 253.277L114.383 236.255L116.425 227.404L117.787 211.064L114.383 194.723Z',
    leftThighPosterior:
        'M61.9577 200.851L70.8087 233.532L64.6811 266.894L57.8726 244.426L59.2343 216.511L61.9577 200.851Z',
    rightThighPosterior:
        'M98.7236 200.851L101.447 217.872L102.809 245.106L96.0002 266.894L89.8726 234.213L98.7236 200.851Z',
    leftPopliteal: 'M55.149 245.106L49.7021 254.638L53.7873 266.213L59.9149 260.085L55.149 245.106Z',
    rightPopliteal: 'M106.213 245.787L100.766 260.766L106.894 266.213L110.979 254.638L106.213 245.787Z',
    leftCalfLateral:
        'M46.9785 256.681L45.6168 267.575L39.4891 287.319L38.1274 308.426L40.8508 315.234L45.6168 309.106L47.6594 288L51.0636 273.702V266.894L46.9785 256.681Z',
    leftCalfMedial:
        'M59.9148 264.17L56.5105 268.255L53.1063 275.064L49.702 288.681L48.3403 307.064L54.468 320L61.9574 305.021L62.6382 270.298L59.9148 264.17Z',
    rightCalfMedial:
        'M100.766 264.17L98.0425 269.617L98.7233 305.021L106.213 319.319L113.021 307.064L110.298 287.319L106.894 272.34L100.766 264.17Z',
    rightCalfLateral:
        'M113.021 256.681L115.745 269.617L121.191 286.638L122.553 308.426L119.149 314.553L115.745 309.787L113.021 287.319L108.936 268.936L113.021 256.681Z',
    leftHeel: 'M45.617 313.191H48.3404L53.7872 322.723L49.0212 352L45.617 341.787L42.8936 317.277L45.617 313.191Z',
    rightHeel:
        'M111.659 313.191H115.064L117.787 317.277L115.064 341.106L112.34 351.319L107.574 323.404L111.659 313.191Z',
};

export type BodyView = 'front' | 'back';

export type BodyRegionKey =
    | 'face'
    | 'backOfHead'
    | 'leftNeck'
    | 'rightNeck'
    | 'leftShoulder'
    | 'rightShoulder'
    | 'leftChest'
    | 'rightChest'
    | 'leftUpperBack'
    | 'rightUpperBack'
    | 'leftFlank'
    | 'rightFlank'
    | 'leftAbdomen'
    | 'rightAbdomen'
    | 'leftLowerBack'
    | 'rightLowerBack'
    | 'leftUpperArm'
    | 'rightUpperArm'
    | 'leftForearm'
    | 'rightForearm'
    | 'leftGroin'
    | 'rightGroin'
    | 'leftButtock'
    | 'rightButtock'
    | 'leftThigh'
    | 'rightThigh'
    | 'leftKnee'
    | 'rightKnee'
    | 'leftBackOfKnee'
    | 'rightBackOfKnee'
    | 'leftLowerLeg'
    | 'rightLowerLeg'
    | 'leftCalf'
    | 'rightCalf'
    | 'leftHeel'
    | 'rightHeel';

export interface BodyRegion {
    key: BodyRegionKey;
    code: string;
    paths: string[];
    /** Centroid of the largest region path in view box coordinates, used to place the annotation number */
    label: { x: number; y: number };
}

export interface BodyViewConfig {
    /** Maps the view paths into the view box */
    transform?: string;
    regions: BodyRegion[];
}

export const BODY_VIEWS: Record<BodyView, BodyViewConfig> = {
    front: {
        regions: [
            { code: '89545001', key: 'face', paths: [FRONT_PATHS.head], label: { x: 143.7, y: 35.0 } },
            {
                code: '170583000',
                key: 'leftNeck',
                paths: [FRONT_PATHS.leftNeck],
                label: { x: 171.2, y: 103.2 },
            },
            {
                code: '170303002',
                key: 'rightNeck',
                paths: [FRONT_PATHS.rightNeck],
                label: { x: 116.9, y: 101.3 },
            },
            {
                code: '91775009',
                key: 'leftShoulder',
                paths: [FRONT_PATHS.leftShoulder],
                label: { x: 218.3, y: 128.2 },
            },
            {
                code: '91774008',
                key: 'rightShoulder',
                paths: [FRONT_PATHS.rightShoulder],
                label: { x: 69.2, y: 128.2 },
            },
            {
                code: '1290343009',
                key: 'leftChest',
                paths: [FRONT_PATHS.leftChest],
                label: { x: 172.9, y: 143.1 },
            },
            {
                code: '1290342004',
                key: 'rightChest',
                paths: [FRONT_PATHS.rightChest],
                label: { x: 114.6, y: 142.0 },
            },
            {
                code: '1290341006',
                key: 'leftFlank',
                paths: [FRONT_PATHS.leftFlank],
                label: { x: 183.6, y: 197.9 },
            },
            {
                code: '1290340007',
                key: 'rightFlank',
                paths: [FRONT_PATHS.rightFlank],
                label: { x: 103.8, y: 197.8 },
            },
            {
                code: '416011007',
                key: 'leftAbdomen',
                paths: [FRONT_PATHS.leftAbdomen],
                label: { x: 157.0, y: 233.1 },
            },
            {
                code: '415994006',
                key: 'rightAbdomen',
                paths: [FRONT_PATHS.rightAbdomen],
                label: { x: 130.3, y: 232.7 },
            },
            {
                code: '368208006',
                key: 'leftUpperArm',
                paths: [FRONT_PATHS.leftUpperArmLateral, FRONT_PATHS.leftUpperArmMedial],
                label: { x: 221.4, y: 173.9 },
            },
            {
                code: '368209003',
                key: 'rightUpperArm',
                paths: [FRONT_PATHS.rightUpperArmLateral, FRONT_PATHS.rightUpperArmMedial],
                label: { x: 65.5, y: 173.6 },
            },
            {
                code: '66480008',
                key: 'leftForearm',
                paths: [FRONT_PATHS.leftForearmLateral, FRONT_PATHS.leftForearmMedial],
                label: { x: 258.0, y: 241.7 },
            },
            {
                code: '64262003',
                key: 'rightForearm',
                paths: [FRONT_PATHS.rightForearmLateral, FRONT_PATHS.rightForearmMedial],
                label: { x: 29.5, y: 240.8 },
            },
            {
                code: '85119005',
                key: 'leftGroin',
                paths: [FRONT_PATHS.leftGroin],
                label: { x: 167.3, y: 310.1 },
            },
            {
                code: '37117007',
                key: 'rightGroin',
                paths: [FRONT_PATHS.rightGroin],
                label: { x: 121.0, y: 309.7 },
            },
            {
                code: '61396006',
                key: 'leftThigh',
                paths: [FRONT_PATHS.leftThighAnterior, FRONT_PATHS.leftThighMedial, FRONT_PATHS.leftThighLateral],
                label: { x: 191.8, y: 334.5 },
            },
            {
                code: '11207009',
                key: 'rightThigh',
                paths: [FRONT_PATHS.rightThighAnterior, FRONT_PATHS.rightThighMedial, FRONT_PATHS.rightThighLateral],
                label: { x: 95.5, y: 334.0 },
            },
            {
                code: '82169009',
                key: 'leftKnee',
                paths: [FRONT_PATHS.leftKnee],
                label: { x: 195.2, y: 433.1 },
            },
            {
                code: '6757004',
                key: 'rightKnee',
                paths: [FRONT_PATHS.rightKnee],
                label: { x: 92.3, y: 432.8 },
            },
            {
                code: '48979004',
                key: 'leftLowerLeg',
                paths: [FRONT_PATHS.leftLowerLegLateral, FRONT_PATHS.leftLowerLegMedial],
                label: { x: 218.8, y: 506.4 },
            },
            {
                code: '32696007',
                key: 'rightLowerLeg',
                paths: [FRONT_PATHS.rightLowerLegLateral, FRONT_PATHS.rightLowerLegMedial],
                label: { x: 70.0, y: 504.5 },
            },
        ],
    },
    back: {
        transform: 'translate(3.00 0) scale(1.7688)',
        regions: [
            {
                code: '43631005',
                key: 'backOfHead',
                paths: [BACK_PATHS.head],
                label: { x: 145.0, y: 28.9 },
            },
            {
                code: '91775009',
                key: 'leftShoulder',
                paths: [BACK_PATHS.leftShoulder],
                label: { x: 67.9, y: 126.9 },
            },
            {
                code: '91774008',
                key: 'rightShoulder',
                paths: [BACK_PATHS.rightShoulder],
                label: { x: 221.3, y: 126.9 },
            },
            {
                code: '1303210008',
                key: 'leftUpperBack',
                paths: [BACK_PATHS.leftScapula, BACK_PATHS.leftTrapezius],
                label: { x: 123.0, y: 120.5 },
            },
            {
                code: '1303211007',
                key: 'rightUpperBack',
                paths: [BACK_PATHS.rightScapula, BACK_PATHS.rightTrapezius],
                label: { x: 166.3, y: 119.9 },
            },
            {
                code: '1017210004',
                key: 'leftLowerBack',
                paths: [BACK_PATHS.leftLowerBack],
                label: { x: 123.9, y: 238.8 },
            },
            {
                code: '1017211000',
                key: 'rightLowerBack',
                paths: [BACK_PATHS.rightLowerBack],
                label: { x: 165.2, y: 238.7 },
            },
            {
                code: '368208006',
                key: 'leftUpperArm',
                paths: [BACK_PATHS.leftUpperArmLateral, BACK_PATHS.leftUpperArmMedial],
                label: { x: 59.3, y: 179.2 },
            },
            {
                code: '368209003',
                key: 'rightUpperArm',
                paths: [BACK_PATHS.rightUpperArmLateral, BACK_PATHS.rightUpperArmMedial],
                label: { x: 230.4, y: 181.0 },
            },
            {
                code: '66480008',
                key: 'leftForearm',
                paths: [BACK_PATHS.leftForearmLateral, BACK_PATHS.leftForearmMedial],
                label: { x: 42.2, y: 261.1 },
            },
            {
                code: '64262003',
                key: 'rightForearm',
                paths: [BACK_PATHS.rightForearmLateral, BACK_PATHS.rightForearmMedial],
                label: { x: 245.7, y: 260.2 },
            },
            {
                code: '723979003',
                key: 'leftButtock',
                paths: [BACK_PATHS.leftButtock],
                label: { x: 114.0, y: 321.9 },
            },
            {
                code: '723980000',
                key: 'rightButtock',
                paths: [BACK_PATHS.rightButtock],
                label: { x: 174.7, y: 321.4 },
            },
            {
                code: '61396006',
                key: 'leftThigh',
                paths: [BACK_PATHS.leftThighPosterior, BACK_PATHS.leftThighLateral, BACK_PATHS.leftThighMedial],
                label: { x: 92.0, y: 394.1 },
            },
            {
                code: '11207009',
                key: 'rightThigh',
                paths: [BACK_PATHS.rightThighPosterior, BACK_PATHS.rightThighLateral, BACK_PATHS.rightThighMedial],
                label: { x: 198.9, y: 392.8 },
            },
            {
                code: '1373282002',
                key: 'leftBackOfKnee',
                paths: [BACK_PATHS.leftPopliteal],
                label: { x: 99.8, y: 453.3 },
            },
            {
                code: '1373283007',
                key: 'rightBackOfKnee',
                paths: [BACK_PATHS.rightPopliteal],
                label: { x: 190.6, y: 454.1 },
            },
            {
                code: '722115008',
                key: 'leftCalf',
                paths: [BACK_PATHS.leftCalfLateral, BACK_PATHS.leftCalfMedial],
                label: { x: 102.3, y: 517.2 },
            },
            {
                code: '722116009',
                key: 'rightCalf',
                paths: [BACK_PATHS.rightCalfLateral, BACK_PATHS.rightCalfMedial],
                label: { x: 188.0, y: 517.2 },
            },
            {
                code: '723606006',
                key: 'leftHeel',
                paths: [BACK_PATHS.leftHeel],
                label: { x: 88.2, y: 582.0 },
            },
            {
                code: '723607002',
                key: 'rightHeel',
                paths: [BACK_PATHS.rightHeel],
                label: { x: 202.5, y: 580.8 },
            },
        ],
    },
};
