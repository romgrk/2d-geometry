import Errors from '../utils/errors'
import { EQ } from '../utils/utils'
import type { PointLike } from './Point'
import type { Vector } from './Vector'

const det = (a: number, b: number, c: number, d: number) => a * d - b * c

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

  _inverse: Matrix | null

  static EMPTY = Object.freeze(new Matrix(0, 0, 0, 0, 0, 0))
  static IDENTITY = Object.freeze(new Matrix(1, 0, 0, 1, 0, 0))

  static fromTransform(x: number, y: number, rotation: number, scale: number) {
    return new Matrix(
      +scale * Math.cos(rotation),
      +scale * Math.sin(rotation),
      -scale * Math.sin(rotation),
      +scale * Math.cos(rotation),
      x,
      y,
    )
  }

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
    this.a = NaN
    this.b = NaN
    this.c = NaN
    this.d = NaN
    this.tx = NaN
    this.ty = NaN
    this._inverse = null

    this.a = a
    this.b = b
    this.c = c
    this.d = d
    this.tx = tx
    this.ty = ty
  }

  /**
   * Return new cloned instance of matrix
   */
  clone() {
    return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty)
  }

  get inverse() {
    const inverse = this._inverse ??= this.invert()
    inverse._inverse = this
    return inverse
  }

  /**
   * Return the matrix inverse
   */
  invert() {
    return this.clone().invertMut()
  }

  /**
   * Return this matrix, inverted
   */
  invertMut() {
    this._inverse = null

    const a = this.a
    const b = this.c
    const c = this.tx
    const d = this.b
    const e = this.d
    const f = this.ty
    const g = 0
    const h = 0
    const i = 1
    // const current = [
    //     a, b, c,
    //     d, e, f,
    //     g, h, i
    // ]
    // const cofactors = [
    //     det(e, f, h, i), -det(d, f, g, i),  det(d, e, g, g),
    //    -det(b, c, h, i),  det(a, c, g, i), -det(a, b, g, h),
    //     det(b, c, e, f), -det(a, c, d, f),  det(a, b, d, e),
    // ]
    // const adjoint = [
    //     det(e, f, h, i), -det(b, c, h, i),  det(b, c, e, f),
    //    -det(d, f, g, i),  det(a, c, g, i), -det(a, c, d, f),
    //     det(d, e, g, g), -det(a, b, g, h),  det(a, b, d, e),
    // ]
    const D = this.determinant()
    // const inverse = [
    //     det(e, f, h, i) / D, -det(b, c, h, i) / D,  det(b, c, e, f) / D,
    //    -det(d, f, g, i) / D,  det(a, c, g, i) / D, -det(a, c, d, f) / D,
    //     det(d, e, g, g) / D, -det(a, b, g, h) / D,  det(a, b, d, e) / D,
    // ]

    const ai  =  det(e, f, h, i) / D
    const ci  = -det(b, c, h, i) / D
    const txi =  det(b, c, e, f) / D
    const bi  = -det(d, f, g, i) / D
    const di  =  det(a, c, g, i) / D
    const tyi = -det(a, c, d, f) / D

    this.a = ai
    this.b = bi
    this.c = ci
    this.d = di
    this.tx = txi
    this.ty = tyi

    return this
  }

  /**
   * Get the determinant of matrix
   */
  determinant() {
    const a = this.a
    const b = this.c
    const c = this.tx
    const d = this.b
    const e = this.d
    const f = this.ty
    const g = 0
    const h = 0
    const i = 1

    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g)
  }

  /**
   * Transform vector [x,y] using transformation matrix. <br/>
   * Vector [x,y] is an abstract array[2] of numbers and not a FlattenJS object <br/>
   * The result is also an abstract vector [x',y'] = A * [x,y]:
   * <code>
   * [x'       [ ax + by + tx
   *  y'   =     cx + dy + ty
   *  1]                    1 ]
   * </code>
   */
  transform(x: number, y: number): [number, number] {
    return [x * this.a + y * this.c + this.tx, x * this.b + y * this.d + this.ty]
  }

  transformMut(p: PointLike): PointLike {
    p.x = p.x * this.a + p.y * this.c + this.tx
    p.y = p.x * this.b + p.y * this.d + this.ty
    return p
  }

  /**
   * Returns result of multiplication of this matrix by other matrix
   */
  multiply(other: Matrix) {
    return this.clone().multiplyMut(other)
  }

  multiplyMut(other: Matrix) {
    const a = this.a
    const b = this.b
    const c = this.c
    const d = this.d
    const tx = this.tx
    const ty = this.ty
    this.a  = a * other.a  + c * other.b
    this.b  = b * other.a  + d * other.b
    this.c  = a * other.c  + c * other.d
    this.d  = b * other.c  + d * other.d
    this.tx = a * other.tx + c * other.ty + tx
    this.ty = b * other.tx + d * other.ty + ty
    this._inverse = null
    return this
  }

  /**
   * Return new matrix as a result of multiplication of the current matrix
   * by the matrix(1,0,0,1,tx,ty)
   */
  translate(v: Vector): Matrix
  translate(x: number, y: number): Matrix
  translate(a: unknown, b?: unknown) {
    let tx: number
    let ty: number
    if (a && typeof a === 'object' && !isNaN((a as any).x) && !isNaN((a as any).y)) {
      tx = (a as Vector).x
      ty = (a as Vector).y
    } else if (typeof a == 'number' && typeof b == 'number') {
      tx = a
      ty = b
    } else {
      throw Errors.ILLEGAL_PARAMETERS
    }
    return this.clone().multiplyMut(new Matrix(1, 0, 0, 1, tx, ty))
  }

  /**
   * Return new matrix as a result of multiplication of the current matrix
   * by the matrix that defines rotation by given angle (in radians) around
   * center of rotation (centerX,centerY) in counterclockwise direction
   * @param angle - angle in radians
   * @param centerX - center of rotation
   * @param centerY - center of rotation
   */
  rotate(angle: number, centerX: number = 0.0, centerY: number = 0.0) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return this
      .translate(centerX, centerY)
      .multiply(new Matrix(cos, sin, -sin, cos, 0, 0))
      .translate(-centerX, -centerY)
  }

  /**
   * Return new matrix as a result of multiplication of the current matrix
   * by the matrix (sx,0,0,sy,0,0) that defines scaling
   * @param sx
   * @param sy
   */
  scale(sx: number, sy: number) {
    return this.multiply(new Matrix(sx, 0, 0, sy, 0, 0))
  }

  /**
   * Returns true if two matrix are equal parameter by parameter
   */
  equalTo(matrix: Matrix) {
    if (!EQ(this.tx, matrix.tx)) return false
    if (!EQ(this.ty, matrix.ty)) return false
    if (!EQ(this.a, matrix.a)) return false
    if (!EQ(this.b, matrix.b)) return false
    if (!EQ(this.c, matrix.c)) return false
    if (!EQ(this.d, matrix.d)) return false
    return true
  }

  isIdentity() {
    return this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 && this.tx === 0 && this.ty === 0
  }
}

/**
 * Function to create matrix equivalent to "new" constructor
 */
export const matrix = (a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number) => new Matrix(a, b, c, d, tx, ty)
