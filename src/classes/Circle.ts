import Errors from '../utils/errors'
import { PlanarSet } from '../data_structures/PlanarSet'
import * as Utils from '../utils/utils'
import * as Distance from '../algorithms/distance'
import * as Intersection from '../algorithms/intersection'
import { Arc } from './Arc'
import { Box } from './Box'
import { Line } from './Line'
import { Matrix } from './Matrix'
import { Ray } from './Ray'
import { Segment } from './Segment'
import { Polygon } from './Polygon'
import { Point, PointLike } from './Point'
import { Shape, ShapeTag } from './Shape'

/**
 * Class representing a circle
 */
export class Circle extends Shape<Circle> {
  static EMPTY = Object.freeze(new Circle(Point.EMPTY, 0))

  /** Circle center */
  pc: Point
  /** Circle radius */
  r: number

  constructor()
  constructor(other: Circle)
  constructor(pc: PointLike, r?: number)
  constructor(x: number, y: number, r?: number)
  constructor(a?: unknown, b?: unknown, c?: unknown) {
    super()
    this.pc = Point.EMPTY
    this.r = NaN
    this.r = 1

    if (a instanceof Circle) {
      this.pc = new Point(a.pc)
      this.r = a.r
    } else if (a instanceof Point) {
      this.pc = a
      this.r = (b as number) ?? 1
    } else if (typeof a === 'object' && a !== null) {
      this.pc = new Point(a as PointLike)
      this.r = (b as number) ?? 1
    } else if (typeof a === 'number') {
      this.pc = new Point(a, b as number)
      this.r = (c as number) ?? 1
    } else {
      throw Errors.ILLEGAL_PARAMETERS
    }
  }

  /**
   * Return new cloned instance of circle
   */
  clone() {
    return new Circle(this.pc.clone(), this.r)
  }

  get tag() {
    return ShapeTag.Circle
  }

  get name() {
    return 'circle'
  }

  get box() {
    return new Box(this.pc.x - this.r, this.pc.y - this.r, this.pc.x + this.r, this.pc.y + this.r)
  }

  get center() {
    return this.pc
  }

  /**
   * Return true if circle contains shape: no point of shape lies outside of the circle
   */
  contains(shape: Shape): boolean {
    if (shape instanceof Point) {
      return Utils.LE(shape.distanceTo(this.center)[0], this.r)
    }

    if (shape instanceof Segment) {
      return (
        Utils.LE(shape.start.distanceTo(this.center)[0], this.r) &&
        Utils.LE(shape.end.distanceTo(this.center)[0], this.r)
      )
    }

    if (shape instanceof Arc) {
      return (
        this.intersect(shape).length === 0 &&
        Utils.LE(shape.start.distanceTo(this.center)[0], this.r) &&
        Utils.LE(shape.end.distanceTo(this.center)[0], this.r)
      )
    }

    if (shape instanceof Circle) {
      return (
        this.intersect(shape).length === 0 &&
        Utils.LE(shape.r, this.r) &&
        Utils.LE(shape.center.distanceTo(this.center)[0], this.r)
      )
    }

    /* TODO: box, polygon */
    throw new Error('unimplemented')
  }

  /**
   * Transform circle to closed arc
   */
  toArc(counterclockwise = true) {
    return new Arc(this.center, this.r, Math.PI, -Math.PI, counterclockwise)
  }

  /**
   * Method scale is supported only for uniform scaling of the circle with (0,0) center
   */
  scale(s: number): Circle
  scale(sx: number, sy: number): Circle
  scale(a: number, b?: number): Circle {
    if (b !== undefined && a !== b) throw Errors.OPERATION_IS_NOT_SUPPORTED
    return new Circle(this.pc, this.r * a)
  }

  /**
   * Return new circle transformed using affine transformation matrix
   */
  transform(matrix = new Matrix()) {
    return new Circle(this.pc.transform(matrix), this.r)
  }

  /**
   * Returns array of intersection points between circle and other shape
   */
  intersect(shape: Shape<any>): Point[] {
    if (shape instanceof Point) { return this.contains(shape) ? [shape] : [] }
    if (shape instanceof Line) { return Intersection.intersectLine2Circle(shape, this) }
    if (shape instanceof Ray) { return Intersection.intersectRay2Circle(shape, this) }
    if (shape instanceof Segment) { return Intersection.intersectSegment2Circle(shape, this) }
    if (shape instanceof Circle) { return Intersection.intersectCircle2Circle(shape, this) }
    if (shape instanceof Box) { return Intersection.intersectCircle2Box(this, shape) }
    if (shape instanceof Arc) { return Intersection.intersectArc2Circle(shape, this) }
    if (shape instanceof Polygon) { return Intersection.intersectCircle2Polygon(this, shape) }
    throw new Error('unimplemented')
  }

  /**
   * Calculate distance and shortest segment from circle to shape and return array [distance, shortest segment]
   * @param shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
   * @returns {number} distance from circle to shape
   * @returns {Segment} shortest segment between circle and shape (started at circle, ended at shape)
   */
  distanceTo(shape: Shape): [number, Segment] {
    if (shape instanceof Point) { return Distance.reverse(Distance.point2circle(shape, this)) }
    if (shape instanceof Circle) { return Distance.circle2circle(this, shape) }
    if (shape instanceof Line) { return Distance.circle2line(this, shape) }
    if (shape instanceof Segment) { return Distance.reverse(Distance.segment2circle(shape, this)) }
    if (shape instanceof Arc) { return Distance.reverse(Distance.arc2circle(shape, this)) }
    if (shape instanceof Polygon) { return Distance.shape2polygon(this, shape) }
    if (shape instanceof PlanarSet) { return Distance.shape2planarSet(this, shape) }
    throw new Error('unimplemented')
  }
}

/**
 * Shortcut to create new circle
 */
export const circle = (a: any, b: any, c: any) => new Circle(a, b, c)
