import * as geom from './index';
import { Shape } from "./Shape";
/**
 * Class representing a vector
 * @type {Vector}
 */
export declare class Vector extends Shape<Vector> {
    /** x-coordinate of a vector (float number) */
    x: number;
    /** y-coordinate of a vector (float number) */
    y: number;
    /**
     * Vector may be constructed by two points, or by two float numbers,
     * or by array of two numbers
     * @param {Point} start - start point
     * @param {Point} end - end point
     */
    constructor(...args: any[]);
    /**
     * Method clone returns new instance of Vector
     * @returns {Vector}
     */
    clone(): geom.Vector;
    /**
     * Slope of the vector in radians from 0 to 2PI
     * @returns {number}
     */
    get slope(): number;
    /**
     * Length of vector
     * @returns {number}
     */
    get length(): number;
    /**
     * Returns true if vectors are equal up to [DP_TOL]{@link http://localhost:63342/flatten-js/docs/global.html#DP_TOL}
     * tolerance
     * @param {Vector} v
     * @returns {boolean}
     */
    equalTo(v: any): boolean;
    /**
     * Returns new vector multiplied by scalar
     * @param {number} scalar
     * @returns {Vector}
     */
    multiply(scalar: any): geom.Vector;
    /**
     * Returns scalar product (dot product) of two vectors <br/>
     * <code>dot_product = (this * v)</code>
     * @param {Vector} v Other vector
     * @returns {number}
     */
    dot(v: any): number;
    /**
     * Returns vector product (cross product) of two vectors <br/>
     * <code>cross_product = (this x v)</code>
     * @param {Vector} v Other vector
     * @returns {number}
     */
    cross(v: any): number;
    /**
     * Returns unit vector.<br/>
     * Throw error if given vector has zero length
     * @returns {Vector}
     */
    normalize(): geom.Vector;
    /**
     * Returns new vector rotated by given angle,
     * positive angle defines rotation in counterclockwise direction,
     * negative - in clockwise direction
     * Vector only can be rotated around (0,0) point!
     * @param {number} angle - Angle in radians
     * @returns {Vector}
     */
    rotate(angle: any, center?: geom.Point): geom.Vector;
    /**
     * Return new vector transformed by affine transformation matrix m
     * @param {Matrix} m - affine transformation matrix (a,b,c,d,tx,ty)
     * @returns {Vector}
     */
    transform(m: any): geom.Vector;
    /**
     * Returns vector rotated 90 degrees counterclockwise
     * @returns {Vector}
     */
    rotate90CCW(): geom.Vector;
    /**
     * Returns vector rotated 90 degrees clockwise
     * @returns {Vector}
     */
    rotate90CW(): geom.Vector;
    /**
     * Return inverted vector
     * @returns {Vector}
     */
    invert(): geom.Vector;
    /**
     * Return result of addition of other vector to this vector as a new vector
     * @param {Vector} v Other vector
     * @returns {Vector}
     */
    add(v: any): geom.Vector;
    /**
     * Return result of subtraction of other vector from current vector as a new vector
     * @param {Vector} v Another vector
     * @returns {Vector}
     */
    subtract(v: any): geom.Vector;
    /**
     * Return angle between this vector and other vector. <br/>
     * Angle is measured from 0 to 2*PI in the counterclockwise direction
     * from current vector to  another.
     * @param {Vector} v Another vector
     * @returns {number}
     */
    angleTo(v: any): number;
    /**
     * Return vector projection of the current vector on another vector
     * @param {Vector} v Another vector
     * @returns {Vector}
     */
    projectionOn(v: any): any;
    get name(): string;
}
/**
 * Function to create vector equivalent to "new" constructor
 * @param args
 */
export declare const vector: (...args: any[]) => geom.Vector;
//# sourceMappingURL=Vector.d.ts.map