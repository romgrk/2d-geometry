import Errors from '../utils/errors'
import * as Utils from '../utils/utils'
import * as geom from './index'
import { Shape, ShapeTag } from './Shape'
import { Matrix } from './Matrix'
import { Point } from './Point'
import { TAU } from '../utils/constants'

/**
 * Class representing a vector
 */
export class Vector extends Shape<Vector> {
  static EMPTY = Object.freeze(new Vector(0, 0))

  /** x-coordinate of a vector (float number) */
  x: number
  /** y-coordinate of a vector (float number) */
  y: number

  /**
   * Vector may be constructed by two points, or by two float numbers,
   * or by array of two numbers
   */
  constructor(a?: unknown, b?: unknown) {
    super()
    this.x = NaN
    this.y = NaN
    this.x = 0
    this.y = 0

    const argsLength = +(a !== undefined) + +(b !== undefined)

    /* return zero vector */
    if (argsLength === 0) {
      return
    }

    if (argsLength === 1 && a instanceof Array && a.length === 2) {
      if (typeof a[0] == 'number' && typeof a[1] == 'number') {
        this.x = a[0]
        this.y = a[1]
        return
      }
    }

    if (argsLength === 1 && a instanceof Object && (a as any).name === 'vector') {
      let { x, y } = a as Vector
      this.x = x
      this.y = y
      return
    }

    if (argsLength === 1 && typeof a === 'number') {
      this.x = Math.cos(a)
      this.y = Math.sin(a)
      return
    }

    if (argsLength === 2) {
      if (typeof a == 'number' && typeof b == 'number') {
        this.x = a
        this.y = b
        return
      }

      if (a instanceof geom.Point && b instanceof geom.Point) {
        this.x = b.x - a.x
        this.y = b.y - a.y
        return
      }
    }

    throw Errors.ILLEGAL_PARAMETERS
  }

  /**
   * Method clone returns new instance of Vector
   */
  clone() {
    return new Vector(this.x, this.y)
  }

  contains(_other: Shape<unknown>): boolean {
    throw new Error('unimplemented')
  }

  get tag() {
    return ShapeTag.Vector
  }

  get name() {
    return 'vector'
  }

  get center() {
    return new Point(this.x / 2, this.y / 2)
  }

  get box() {
    return new geom.Box(Math.min(0, this.x), Math.min(0, this.y), Math.max(0, this.x), Math.max(0, this.y))
  }

  /**
   * Slope of the vector in radians from 0 to 2PI
   */
  get slope() {
    let angle = Math.atan2(this.y, this.x)
    if (angle < 0) angle = TAU + angle
    return angle
  }

  /**
   * Length of vector
   */
  get length() {
    return Math.sqrt(this.dot(this))
  }

  /**
   * Returns true if vectors are equal up to [DP_TOL]{@link http://localhost:63342/flatten-js/docs/global.html#DP_TOL}
   * tolerance
   */
  equalTo(v: Vector) {
    return Utils.EQ(this.x, v.x) && Utils.EQ(this.y, v.y)
  }

  /**
   * Returns new vector multiplied by scalar
   */
  multiply(scalar: number) {
    return new Vector(scalar * this.x, scalar * this.y)
  }

  /**
   * Returns scalar product (dot product) of two vectors <br/>
   * <code>dot_product = (this * v)</code>
   */
  dot(v: Vector) {
    return this.x * v.x + this.y * v.y
  }

  /**
   * Returns vector product (cross product) of two vectors <br/>
   * <code>cross_product = (this x v)</code>
   */
  cross(v: Vector) {
    return this.x * v.y - this.y * v.x
  }

  /**
   * Returns unit vector.<br/>
   * Throw error if given vector has zero length
   */
  normalize() {
    if (!Utils.EQ_0(this.length)) {
      return new Vector(this.x / this.length, this.y / this.length)
    }
    throw Errors.ZERO_DIVISION
  }

  /**
   * Returns new vector rotated by given angle,
   * positive angle defines rotation in counterclockwise direction,
   * negative - in clockwise direction
   * Vector only can be rotated around (0,0) point!
   * @param angle - Angle in radians
   */
  rotate(angle: number, center = geom.Point.EMPTY) {
    if (center.x === 0 && center.y === 0) {
      return this.transform(new Matrix().rotate(angle))
    }
    throw Errors.OPERATION_IS_NOT_SUPPORTED
  }

  /**
   * Return new vector transformed by affine transformation matrix.
   */
  transform(m: Matrix) {
    return new Vector(m.transform(this.x, this.y))
  }

  /**
   * Returns vector rotated 90 degrees counterclockwise
   */
  rotate90CW() {
    return new Vector(-this.y, this.x)
  }

  /**
   * Returns vector rotated 90 degrees clockwise
   */
  rotate90CCW() {
    return new Vector(this.y, -this.x)
  }

  /**
   * Return inverted vector
   */
  invert() {
    return new Vector(-this.x, -this.y)
  }

  /**
   * Return result of addition of other vector to this vector as a new vector
   */
  add(v: Vector) {
    return new Vector(this.x + v.x, this.y + v.y)
  }

  /**
   * Return result of subtraction of other vector from current vector as a new vector
   */
  subtract(v: Vector) {
    return new Vector(this.x - v.x, this.y - v.y)
  }

  /**
   * Return angle between this vector and other vector. <br/>
   * Angle is measured from 0 to 2*PI in the counterclockwise direction
   * from current vector to  another.
   */
  angleTo(v: Vector) {
    let norm1 = this.normalize()
    let norm2 = v.normalize()
    let angle = Math.atan2(norm1.cross(norm2), norm1.dot(norm2))
    if (angle < 0) angle += TAU
    return angle
  }

  /**
   * Return vector projection of the current vector on another vector
   */
  projectionOn(v: Vector) {
    let n = v.normalize()
    let d = this.dot(n)
    return n.multiply(d)
  }
}

/**
 * Function to create vector equivalent to "new" constructor
 */
export const vector = (a: any, b: any) => new Vector(a, b)
