import Errors from '../utils/errors'
import * as Utils from '../utils/utils'
import * as geom from './index'
import {Shape} from "./Shape";
import {Matrix} from "./Matrix";

/**
 * Class representing a vector
 * @type {Vector}
 */
export class Vector extends Shape<Vector> {
    static EMPTY = Object.freeze(new Vector(0, 0));

    /** x-coordinate of a vector (float number) */
    x: number
    /** y-coordinate of a vector (float number) */
    y: number

    /**
     * Vector may be constructed by two points, or by two float numbers,
     * or by array of two numbers
     * @param {Point} start - start point
     * @param {Point} end - end point
     */
    constructor(...args) {
        super()
        this.x = 0;
        this.y = 0;

        /* return zero vector */
        if (args.length === 0) {
            return;
        }

        if (args.length === 1 && args[0] instanceof Array && args[0].length === 2) {
            let arr = args[0];
            if (typeof (arr[0]) == "number" && typeof (arr[1]) == "number") {
                this.x = arr[0];
                this.y = arr[1];
                return;
            }
        }

        if (args.length === 1 && args[0] instanceof Object && args[0].name === "vector") {
            let {x, y} = args[0];
            this.x = x;
            this.y = y;
            return;
        }

        if (args.length === 2) {
            let a1 = args[0];
            let a2 = args[1];

            if (typeof (a1) == "number" && typeof (a2) == "number") {
                this.x = a1;
                this.y = a2;
                return;
            }

            if (a1 instanceof geom.Point && a2 instanceof geom.Point) {
                this.x = a2.x - a1.x;
                this.y = a2.y - a1.y;
                return;
            }

        }

        throw Errors.ILLEGAL_PARAMETERS;
    }

    /**
     * Method clone returns new instance of Vector
     * @returns {Vector}
     */
    clone() {
        return new Vector(this.x, this.y);
    }

    /**
     * Slope of the vector in radians from 0 to 2PI
     * @returns {number}
     */
    get slope() {
        let angle = Math.atan2(this.y, this.x);
        if (angle < 0) angle = 2 * Math.PI + angle;
        return angle;
    }

    /**
     * Length of vector
     * @returns {number}
     */
    get length() {
        return Math.sqrt(this.dot(this));
    }

    /**
     * Returns true if vectors are equal up to [DP_TOL]{@link http://localhost:63342/flatten-js/docs/global.html#DP_TOL}
     * tolerance
     * @param {Vector} v
     * @returns {boolean}
     */
    equalTo(v) {
        return Utils.EQ(this.x, v.x) && Utils.EQ(this.y, v.y);
    }

    /**
     * Returns new vector multiplied by scalar
     * @param {number} scalar
     * @returns {Vector}
     */
    multiply(scalar) {
        return (new Vector(scalar * this.x, scalar * this.y));
    }

    /**
     * Returns scalar product (dot product) of two vectors <br/>
     * <code>dot_product = (this * v)</code>
     * @param {Vector} v Other vector
     * @returns {number}
     */
    dot(v) {
        return (this.x * v.x + this.y * v.y);
    }

    /**
     * Returns vector product (cross product) of two vectors <br/>
     * <code>cross_product = (this x v)</code>
     * @param {Vector} v Other vector
     * @returns {number}
     */
    cross(v) {
        return (this.x * v.y - this.y * v.x);
    }

    /**
     * Returns unit vector.<br/>
     * Throw error if given vector has zero length
     * @returns {Vector}
     */
    normalize() {
        if (!Utils.EQ_0(this.length)) {
            return (new Vector(this.x / this.length, this.y / this.length));
        }
        throw Errors.ZERO_DIVISION;
    }

    /**
     * Returns new vector rotated by given angle,
     * positive angle defines rotation in counterclockwise direction,
     * negative - in clockwise direction
     * Vector only can be rotated around (0,0) point!
     * @param {number} angle - Angle in radians
     * @returns {Vector}
     */
    rotate(angle, center = new geom.Point()) {
        if (center.x === 0 && center.y === 0) {
            return this.transform(new Matrix().rotate(angle));
        }
        throw(Errors.OPERATION_IS_NOT_SUPPORTED);
    }

    /**
     * Return new vector transformed by affine transformation matrix m
     * @param {Matrix} m - affine transformation matrix (a,b,c,d,tx,ty)
     * @returns {Vector}
     */
    transform(m) {
        return new Vector(m.transform([this.x, this.y]))
    }

    /**
     * Returns vector rotated 90 degrees counterclockwise
     * @returns {Vector}
     */
    rotate90CCW() {
        return new Vector(-this.y, this.x);
    };

    /**
     * Returns vector rotated 90 degrees clockwise
     * @returns {Vector}
     */
    rotate90CW() {
        return new Vector(this.y, -this.x);
    };

    /**
     * Return inverted vector
     * @returns {Vector}
     */
    invert() {
        return new Vector(-this.x, -this.y);
    }

    /**
     * Return result of addition of other vector to this vector as a new vector
     * @param {Vector} v Other vector
     * @returns {Vector}
     */
    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    /**
     * Return result of subtraction of other vector from current vector as a new vector
     * @param {Vector} v Another vector
     * @returns {Vector}
     */
    subtract(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    /**
     * Return angle between this vector and other vector. <br/>
     * Angle is measured from 0 to 2*PI in the counterclockwise direction
     * from current vector to  another.
     * @param {Vector} v Another vector
     * @returns {number}
     */
    angleTo(v) {
        let norm1 = this.normalize();
        let norm2 = v.normalize();
        let angle = Math.atan2(norm1.cross(norm2), norm1.dot(norm2));
        if (angle < 0) angle += 2 * Math.PI;
        return angle;
    }

    /**
     * Return vector projection of the current vector on another vector
     * @param {Vector} v Another vector
     * @returns {Vector}
     */
    projectionOn(v) {
        let n = v.normalize();
        let d = this.dot(n);
        return n.multiply(d);
    }

    get name() {
        return "vector"
    }
}

/**
 * Function to create vector equivalent to "new" constructor
 * @param args
 */
export const vector = (...args) => new Vector(...args);
