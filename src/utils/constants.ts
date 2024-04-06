/**
 * Global constant CCW defines counterclockwise direction of arc
 */
export const CCW = true;

/**
 * Global constant CW defines clockwise direction of arc
 */
export const CW = false;

/**
 * Defines orientation for face of the polygon: clockwise, counterclockwise
 * or not orientable in the case of self-intersection
 */
export const ORIENTATION = {
    CCW: -1,
    CW: 1,
    NOT_ORIENTABLE: 0
};

export const TAU = 2 * Math.PI;

export const INSIDE = 1;
export const OUTSIDE = 0;
export const BOUNDARY = 2;
export const CONTAINS = 3;
export const INTERLACE = 4;

export enum Position {
    INSIDE = 1,
    OUTSIDE = 0,
}

export const OVERLAP_SAME = 1;
export const OVERLAP_OPPOSITE = 2;
export enum Overlap {
    SAME = 1,
    OPPOSITE = 2,
}

export const NOT_VERTEX = 0;
export const START_VERTEX = 1;
export const END_VERTEX = 2;

