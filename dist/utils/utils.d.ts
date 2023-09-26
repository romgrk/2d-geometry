/**
 * Created by Alex Bol on 2/18/2017.
 */
/**
 * Set new floating point comparison tolerance
 * @param {number} tolerance
 */
export declare function setTolerance(tolerance: any): void;
/**
 * Get floating point comparison tolerance
 * @returns {number}
 */
export declare function getTolerance(): number;
export declare const DECIMALS = 3;
/**
 * Returns *true* if value comparable to zero
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
export declare function EQ_0(x: any): boolean;
/**
 * Returns *true* if two values are equal up to DP_TOL
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
export declare function EQ(x: any, y: any): boolean;
/**
 * Returns *true* if first argument greater than second argument up to DP_TOL
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
export declare function GT(x: any, y: any): boolean;
/**
 * Returns *true* if first argument greater than or equal to second argument up to DP_TOL
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
export declare function GE(x: any, y: any): boolean;
/**
 * Returns *true* if first argument less than second argument up to DP_TOL
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
export declare function LT(x: any, y: any): boolean;
/**
 * Returns *true* if first argument less than or equal to second argument up to DP_TOL
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
export declare function LE(x: any, y: any): boolean;
//# sourceMappingURL=utils.d.ts.map