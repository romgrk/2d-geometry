"use strict";

module.exports = function(Flatten) {
    /**
     * Class representing an affine transformation 3x3 matrix:
     * <pre>
     *      [ a  c  tx
     * A =    b  d  ty
     *        0  0  1  ]
     * </pre
     * @type {Matrix}
     */
    Flatten.Matrix = class Matrix {
        /**
         * Construct new instance of affine transformation matrix <br/>
         * If parameters omitted, construct identity matrix a = 1, d = 1
         * @param {number} a - position(0,0)   sx*cos(alpha)
         * @param {number} b - position (0,1)  sx*sin(alpha)
         * @param {number} c - position (1,0)  -sy*sin(alpha)
         * @param {number} d - position (1,1)  sy*cos(alpha)
         * @param {number} tx - position (2,0) translation by x
         * @param {number} ty - position (2,1) translation by y
         */
        constructor(a=1,b=0,c=0,d=1,tx=0,ty=0) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
        }

        /**
         * Returns a clone of the Matrix instance.
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
                vector[0]*this.a+vector[1]*this.c+this.tx,
                vector[0]*this.b+vector[1]*this.d+this.ty
            ]
        };

        /**
         * Returns result of multiplication of this matrix by other matrix
         * @param {Matrix} other_matrix - matrix to multiply by
         * @returns {Matrix}
         */
        multiply(other_matrix) {
            return new Matrix(
                this.a*other_matrix.a + this.c*other_matrix.b,
                this.b*other_matrix.a + this.d*other_matrix.b,
                this.a*other_matrix.c + this.c*other_matrix.d,
                this.b*other_matrix.c + this.d*other_matrix.d,
                this.a*other_matrix.tx + this.c*other_matrix.ty + this.tx,
                this.b*other_matrix.tx + this.d*other_matrix.ty + this.ty
            )
        };

        /**
         * Return new matrix as a result of multiplication of the current matrix
         * by the matrix(1,0,0,1,tx,ty)
         * @param {number} tx - translation by x
         * @param {number} ty - translation by y
         * @returns {Matrix}
         */
        translate(tx, ty) {
            return this.multiply(new Matrix(1,0,0,1,tx,ty))
        };

        /**
         * Return new matrix as a result of multiplication of the current matrix
         * by the matrix that defines rotation by given angle (in radians) around
         * point (0,0) in counter clockwise direction
         * @param angle
         * @returns {Matrix}
         */
        rotate(angle) {
            let cos = Math.cos(angle);
            let sin = Math.sin(angle);
            return this.multiply(new Matrix(cos,sin,-sin,cos,0,0));
        };

        /**
         * Return new matrix as result of mutiplication of the current matrix
         * by the matrix (sx,0,0,sy,0,0) that defines scaling
         * @param sx
         * @param sy
         * @returns {Matrix}
         */
        scale(sx, sy) {
            return this.multiply(new Matrix(sx,0,0,sy,0,0));
        };

        /**
         * Returns true if two matrix are equal parameter by parameter
         * @param {Matrix} matrix - other matrix
         * @returns {boolean} true if equal, false otherwise
         */
        equalTo(matrix) {
            if (!Flatten.Utils.EQ(this.tx, matrix.tx)) return false;
            if (!Flatten.Utils.EQ(this.ty, matrix.ty)) return false;
            if (!Flatten.Utils.EQ(this.a, matrix.a)) return false;
            if (!Flatten.Utils.EQ(this.b, matrix.b)) return false;
            if (!Flatten.Utils.EQ(this.c, matrix.c)) return false;
            if (!Flatten.Utils.EQ(this.d, matrix.d)) return false;
            return true;
        };
    };

    /**
     * Function to create matrix equivalent to "new" constructor
     * @param args
     */
    Flatten.matrix = (...args) => new Flatten.Matrix(...args);
};