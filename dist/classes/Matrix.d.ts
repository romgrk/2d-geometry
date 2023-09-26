import type { Vector } from './Vector';
/**
 * Class representing an affine transformation 3x3 matrix:
 * <pre>
 *      [ a  c  tx
 * A =    b  d  ty
 *        0  0  1  ]
 * </pre
 * @type {Matrix}
 */
export declare class Matrix {
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
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
    constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);
    /**
     * Return new cloned instance of matrix
     * @return {Matrix}
     **/
    clone(): Matrix;
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
    transform(vector: any): number[];
    /**
     * Returns result of multiplication of this matrix by other matrix
     * @param {Matrix} other_matrix - matrix to multiply by
     * @returns {Matrix}
     */
    multiply(other_matrix: any): Matrix;
    /**
     * Return new matrix as a result of multiplication of the current matrix
     * by the matrix(1,0,0,1,tx,ty)
     */
    translate(v: Vector): Matrix;
    translate(x: number, y: number): Matrix;
    /**
     * Return new matrix as a result of multiplication of the current matrix
     * by the matrix that defines rotation by given angle (in radians) around
     * center of rotation (centerX,centerY) in counterclockwise direction
     * @param {number} angle - angle in radians
     * @param {number} centerX - center of rotation
     * @param {number} centerY - center of rotation
     * @returns {Matrix}
     */
    rotate(angle: any, centerX?: number, centerY?: number): Matrix;
    /**
     * Return new matrix as a result of multiplication of the current matrix
     * by the matrix (sx,0,0,sy,0,0) that defines scaling
     * @param {number} sx
     * @param {number} sy
     * @returns {Matrix}
     */
    scale(sx: any, sy: any): Matrix;
    /**
     * Returns true if two matrix are equal parameter by parameter
     * @param {Matrix} matrix - other matrix
     * @returns {boolean} true if equal, false otherwise
     */
    equalTo(matrix: any): boolean;
}
/**
 * Function to create matrix equivalent to "new" constructor
 * @param args
 */
export declare const matrix: (...args: any[]) => Matrix;
//# sourceMappingURL=Matrix.d.ts.map