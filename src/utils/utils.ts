/**
 * Floating point comparison tolerance.
 * Default value is 0.000001 (10e-6)
 */
let DP_TOL: number = 0.000001

/**
 * Set new floating point comparison tolerance
 */
export function setTolerance(tolerance: number) {
  DP_TOL = tolerance
}

/**
 * Get floating point comparison tolerance
 */
export function getTolerance() {
  return DP_TOL
}

export const DECIMALS = 3

/**
 * Returns *true* if value comparable to zero
 */
export function EQ_0(x: number) {
  return x < DP_TOL && x > -DP_TOL
}

/**
 * Returns *true* if two values are equal up to DP_TOL
 */
export function EQ(x: number, y: number) {
  return x - y < DP_TOL && x - y > -DP_TOL
}

/**
 * Returns *true* if first argument greater than second argument up to DP_TOL
 */
export function GT(x: number, y: number) {
  return x - y > DP_TOL
}

/**
 * Returns *true* if first argument greater than or equal to second argument up to DP_TOL
 */
export function GE(x: number, y: number) {
  return x - y > -DP_TOL
}

/**
 * Returns *true* if first argument less than second argument up to DP_TOL
 */
export function LT(x: number, y: number) {
  return x - y < -DP_TOL
}

/**
 * Returns *true* if first argument less than or equal to second argument up to DP_TOL
 */
export function LE(x: number, y: number) {
  return x - y < DP_TOL
}
