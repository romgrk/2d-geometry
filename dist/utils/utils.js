"use strict";
/**
 * Created by Alex Bol on 2/18/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LE = exports.LT = exports.GE = exports.GT = exports.EQ = exports.EQ_0 = exports.DECIMALS = exports.getTolerance = exports.setTolerance = void 0;
/**
 * Floating point comparison tolerance.
 * Default value is 0.000001 (10e-6)
 * @type {number}
 */
let DP_TOL = 0.000001;
/**
 * Set new floating point comparison tolerance
 * @param {number} tolerance
 */
function setTolerance(tolerance) { DP_TOL = tolerance; }
exports.setTolerance = setTolerance;
/**
 * Get floating point comparison tolerance
 * @returns {number}
 */
function getTolerance() { return DP_TOL; }
exports.getTolerance = getTolerance;
exports.DECIMALS = 3;
/**
 * Returns *true* if value comparable to zero
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
function EQ_0(x) {
    return (x < DP_TOL && x > -DP_TOL);
}
exports.EQ_0 = EQ_0;
/**
 * Returns *true* if two values are equal up to DP_TOL
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
function EQ(x, y) {
    return (x - y < DP_TOL && x - y > -DP_TOL);
}
exports.EQ = EQ;
/**
 * Returns *true* if first argument greater than second argument up to DP_TOL
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
function GT(x, y) {
    return (x - y > DP_TOL);
}
exports.GT = GT;
/**
 * Returns *true* if first argument greater than or equal to second argument up to DP_TOL
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
function GE(x, y) {
    return (x - y > -DP_TOL);
}
exports.GE = GE;
/**
 * Returns *true* if first argument less than second argument up to DP_TOL
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
function LT(x, y) {
    return (x - y < -DP_TOL);
}
exports.LT = LT;
/**
 * Returns *true* if first argument less than or equal to second argument up to DP_TOL
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
function LE(x, y) {
    return (x - y < DP_TOL);
}
exports.LE = LE;
