import Errors from '../utils/errors'
import * as Utils from '../utils/utils'
import type { Vector } from './Vector'

/**
 * Class representing an affine transformation 3x3 matrix:
 * <pre>
 *      [ a  c  tx
 * A =    b  d  ty
 *        0  0  1  ]
 * </pre
 * @type {Matrix}
 */
export class Matrix {
    a: number
    b: number
    c: number
    d: number
    tx: number
    ty: number

    /**
     * Construct new instance of affine transformation matrix <br/>
     * If parameters omitted, construct identity matrix a = 1, d = 1
     * @param a - position(0,0)   sx*cos(alpha)
     * @param b - position (0,1)  sx*sin(alpha)
     * @param c - position (1,0)  -sy*sin(alpha)
     * @param d - position (1,1)  sy*cos(alpha)
     * @param tx - position (2,0) translation by x
     * @param ty - position (2,1) translation by y
     */
    constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
    }

    /**
     * Return new cloned instance of matrix
     * @return {Matrix}
     **/
    clone() {
        return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
    };

    /**
     * Transform vector [x,y] using transformation matrix. <br/>
     * Vector [x,y] is an abstract array[2] of numbers and not a FlattenJS object <br/>
     * The result is also an abstract vector [x',y'] = A * [x,y]:
     * <code>
     * [x'       [ ax + by + tx
     *  y'   =     cx + dy + ty
     *  1]                    1 ]
     * </code>
     * @param {number[]} vector - array[2] of numbers
     * @returns {number[]} transformation result - array[2] of numbers
     */
    transform(vector) {
        return [
            vector[0] * this.a + vector[1] * this.c + this.tx,
            vector[0] * this.b + vector[1] * this.d + this.ty
        ]
    };

    /**
     * Returns result of multiplication of this matrix by other matrix
     * @param {Matrix} other_matrix - matrix to multiply by
     * @returns {Matrix}
     */
    multiply(other_matrix) {
        return new Matrix(
            this.a * other_matrix.a + this.c * other_matrix.b,
            this.b * other_matrix.a + this.d * other_matrix.b,
            this.a * other_matrix.c + this.c * other_matrix.d,
            this.b * other_matrix.c + this.d * other_matrix.d,
            this.a * other_matrix.tx + this.c * other_matrix.ty + this.tx,
            this.b * other_matrix.tx + this.d * other_matrix.ty + this.ty
        )
    };

    /**
     * Return new matrix as a result of multiplication of the current matrix
     * by the matrix(1,0,0,1,tx,ty)
     */
    translate(v: Vector): Matrix;
    translate(x: number, y: number): Matrix;
    translate(a: unknown, b?: unknown) {
        let tx: number
        let ty: number
        if (a && typeof a === 'object' && !isNaN((a as any).x) && !isNaN((a as any).y)) {
            tx = (a as Vector).x;
            ty = (a as Vector).y;
        } else if (typeof a == 'number' && typeof b == 'number') {
            tx = a;
            ty = b;
        } else {
            throw Errors.ILLEGAL_PARAMETERS;
        }
        return this.multiply(new Matrix(1, 0, 0, 1, tx, ty))
    };

    /**
     * Return new matrix as a result of multiplication of the current matrix
     * by the matrix that defines rotation by given angle (in radians) around
     * center of rotation (centerX,centerY) in counterclockwise direction
     * @param {number} angle - angle in radians
     * @param {number} centerX - center of rotation
     * @param {number} centerY - center of rotation
     * @returns {Matrix}
     */
    rotate(angle, centerX = 0.0, centerY = 0.0) {
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        return this
            .translate(centerX, centerY)
            .multiply(new Matrix(cos, sin, -sin, cos, 0, 0))
            .translate(-centerX, -centerY);
    };

    /**
     * Return new matrix as a result of multiplication of the current matrix
     * by the matrix (sx,0,0,sy,0,0) that defines scaling
     * @param {number} sx
     * @param {number} sy
     * @returns {Matrix}
     */
    scale(sx, sy) {
        return this.multiply(new Matrix(sx, 0, 0, sy, 0, 0));
    };

    /**
     * Returns true if two matrix are equal parameter by parameter
     * @param {Matrix} matrix - other matrix
     * @returns {boolean} true if equal, false otherwise
     */
    equalTo(matrix) {
        if (!Utils.EQ(this.tx, matrix.tx)) return false;
        if (!Utils.EQ(this.ty, matrix.ty)) return false;
        if (!Utils.EQ(this.a, matrix.a)) return false;
        if (!Utils.EQ(this.b, matrix.b)) return false;
        if (!Utils.EQ(this.c, matrix.c)) return false;
        if (!Utils.EQ(this.d, matrix.d)) return false;
        return true;
    };
};

/**
 * Function to create matrix equivalent to "new" constructor
 * @param args
 */
export const matrix = (...args) => new Matrix(...args);
