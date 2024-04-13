/**
 * Global constant CW defines clockwise direction of arc
 */
export const CW = true

/**
 * Global constant CCW defines counterclockwise direction of arc
 */
export const CCW = false

/**
 * Defines orientation for face of the polygon: clockwise, counterclockwise
 * or not orientable in the case of self-intersection
 */
export const ORIENTATION = {
  CW: -1,
  CCW: 1,
  NOT_ORIENTABLE: 0,
}

export const TAU = 2 * Math.PI

export enum Inclusion {
  INSIDE = 1,
  OUTSIDE = 0,
  BOUNDARY = 2,
}

export enum Overlap {
  SAME = 1,
  OPPOSITE = 2,
}

export const NOT_VERTEX = 0
export const START_VERTEX = 1
export const END_VERTEX = 2
