import Errors from '../utils/errors'
import { Matrix } from './Matrix'
import { Point } from './Point'
import { Segment } from './Segment'
import { Shape, ShapeTag } from './Shape'

/**
 * WARNING: Does not represent a rectangle.
 * Box represents the bounding box of a shape. You can think of it as an
 * axis-aligned rectangle.
 */
export class Box extends Shape<Box> {
  static EMPTY = Object.freeze(new Box(0, 0, 0, 0))
  /** Abstract box that has no dimensions (xmin is Infinity, xmax is -Infinity, etc) */
  static VOID = Object.freeze(new Box(Infinity, Infinity, -Infinity, -Infinity))

  /** Minimal x coordinate */
  xmin: number
  /** Minimal y coordinate */
  ymin: number
  /** Maximal x coordinate */
  xmax: number
  /** Maximal y coordinate */
  ymax: number

  constructor(xmin: number = Infinity, ymin: number = Infinity, xmax: number = -Infinity, ymax: number = -Infinity) {
    super()
    this.xmin = NaN
    this.ymin = NaN
    this.xmax = NaN
    this.ymax = NaN
    this.xmin = xmin
    this.ymin = ymin
    this.xmax = xmax
    this.ymax = ymax
  }

  /**
   * Return new cloned instance of box
   */
  clone() {
    return new Box(this.xmin, this.ymin, this.xmax, this.ymax)
  }

  get tag() {
    return ShapeTag.Box
  }

  get name() {
    return 'box'
  }

  /**
   * Return property box like all other shapes
   */
  get box() {
    return this
  }

  /**
   * Return center of the box
   */
  get center() {
    return new Point((this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)
  }

  /**
   * Return the width of the box
   */
  get width() {
    return Math.abs(this.xmax - this.xmin)
  }

  /**
   * Return the height of the box
   */
  get height() {
    return Math.abs(this.ymax - this.ymin)
  }

  /**
   * Returns true if point is contained in box.
   */
  contains(other: Point): boolean {
    return other.x >= this.xmin && other.x <= this.xmax && other.y >= this.ymin && other.y <= this.ymax
  }

  /**
   * Returns true if intersected with other box
   */
  intersect(otherBox: Box) {
    return !(
      this.xmax < otherBox.xmin || this.xmin > otherBox.xmax || this.ymax < otherBox.ymin || this.ymin > otherBox.ymax
    )
  }

  /**
   * Returns new box merged with other box
   */
  merge(otherBox: Box) {
    return new Box(
      Math.min(this.xmin, otherBox.xmin),
      Math.min(this.ymin, otherBox.ymin),
      Math.max(this.xmax, otherBox.xmax),
      Math.max(this.ymax, otherBox.ymax),
    )
  }

  /**
   * Returns true if this box is equal to other box, false otherwise
   */
  equalTo(otherBox: Box) {
    return this.low.equalTo(otherBox.low) && this.high.equalTo(otherBox.high)
  }

  /**
   * Transform box into array of points from low left corner in counterclockwise
   */
  toPoints() {
    return [
      new Point(this.xmin, this.ymin),
      new Point(this.xmax, this.ymin),
      new Point(this.xmax, this.ymax),
      new Point(this.xmin, this.ymax),
    ]
  }

  /**
   * Transform box into array of segments from low left corner in counterclockwise
   */
  toSegments() {
    const pts = this.toPoints()
    return [
      new Segment(pts[0], pts[1]),
      new Segment(pts[1], pts[2]),
      new Segment(pts[2], pts[3]),
      new Segment(pts[3], pts[0]),
    ]
  }

  /**
   * This method _will_ throw. Box rotation is not supported.
   */
  rotate(_angle: number, _center = Point.EMPTY): Box {
    throw Errors.OPERATION_IS_NOT_SUPPORTED
  }

  /**
   * Return new box transformed using affine transformation matrix
   * New box is a bounding box of transformed corner points.
   */
  transform(m = Matrix.IDENTITY) {
    return this.toPoints().map(p => p.transform(m)).reduce((new_box, pt) => new_box.merge(pt.box), Box.VOID)
  }

  /**
   * Property low need for interval tree interface
   */
  get low() {
    return new Point(this.xmin, this.ymin)
  }

  /**
   * Property high need for interval tree interface
   */
  get high() {
    return new Point(this.xmax, this.ymax)
  }

  /**
   * Property max returns the box itself !
   */
  get max() {
    return this.clone()
  }

  /**
   * Defines predicate "less than" between two boxes. Need for interval index
   */
  lessThan(otherBox: Box) {
    if (this.low.lessThan(otherBox.low)) return true
    if (this.low.equalTo(otherBox.low) && this.high.lessThan(otherBox.high)) return true
    return false
  }

  output() {
    return this.clone()
  }

  static comparableMax(a: Box, b: Box) {
    return a.merge(b)
  }

  static comparableLessThan(a: Point, b: Point) {
    return a.lessThan(b)
  }
}

/**
 * Shortcut to create new box
 */
export const box = (xmin?: number, ymin?: number, xmax?: number, ymax?: number) => new Box(xmin, ymin, xmax, ymax)
