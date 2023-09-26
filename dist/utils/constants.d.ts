/**
 * Global constant CCW defines counterclockwise direction of arc
 * @type {boolean}
 */
export declare const CCW = true;
/**
 * Global constant CW defines clockwise direction of arc
 * @type {boolean}
 */
export declare const CW = false;
/**
 * Defines orientation for face of the polygon: clockwise, counterclockwise
 * or not orientable in the case of self-intersection
 * @type {{CW: number, CCW: number, NOT_ORIENTABLE: number}}
 */
export declare const ORIENTATION: {
    CCW: number;
    CW: number;
    NOT_ORIENTABLE: number;
};
export declare const PIx2: number;
export declare const INSIDE = 1;
export declare const OUTSIDE = 0;
export declare const BOUNDARY = 2;
export declare const CONTAINS = 3;
export declare const INTERLACE = 4;
export declare enum Position {
    INSIDE = 1,
    OUTSIDE = 0
}
export declare const OVERLAP_SAME = 1;
export declare const OVERLAP_OPPOSITE = 2;
export declare enum Overlap {
    SAME = 1,
    OPPOSITE = 2
}
export declare const NOT_VERTEX = 0;
export declare const START_VERTEX = 1;
export declare const END_VERTEX = 2;
//# sourceMappingURL=constants.d.ts.map