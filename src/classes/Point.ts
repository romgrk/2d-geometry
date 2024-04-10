import Errors from '../utils/errors'
import * as Distance from '../algorithms/distance'
import * as Utils from '../utils/utils'
import * as geom from './index'
import type { Line } from './Line'
import type { Matrix } from './Matrix'
import type { Segment } from './Segment'
import { Shape, ShapeTag } from './Shape'

export type PointLike = {
  x: number
  y: number
}

/**
 * Class representing a point
 */
export class Point extends Shape<Point> {
  static EMPTY = Object.freeze(new Point(0, 0))

  /** x-coordinate (float number) */
  x: number
  /** y-coordinate (float number) */
  y: number

  constructor()
  constructor(x: number, y: number)
  constructor(other: PointLike)
  constructor(other: [number, number])
  /**
   * Point may be constructed by two numbers, or by array of two numbers
   */
  constructor(a?: unknown, b?: unknown) {
    super()
    this.x = NaN
    this.y = NaN
    this.x = 0
    this.y = 0

    const argsLength = +(a !== undefined) + +(b !== undefined)

    if (argsLength === 0) {
      return
    }

    if (argsLength === 1 && a instanceof Array) {
      this.x = a[0]
      this.y = a[1]
      return
    }

    if (argsLength === 1) {
      let { x, y } = a as PointLike
      this.x = x
      this.y = y
      return
    }

    if (argsLength === 2) {
      this.x = a as number
      this.y = b as number
      return
    }

    throw Errors.ILLEGAL_PARAMETERS
  }

  /**
   * Return new cloned instance of point
   */
  clone() {
    return new Point(this.x, this.y)
  }

  get tag() {
    return ShapeTag.Point
  }

  get name() {
    return 'point'
  }

  /**
   * Returns bounding box of a point
   */
  get box(): geom.Box {
    return new geom.Box(this.x, this.y, this.x, this.y)
  }

  get center() {
    return this
  }

  isEmpty() {
    return this.x === 0 && this.y === 0
  }

  get vertices() {
    return [this]
  }

  contains(other: Point) {
    return this.equalTo(other)
  }

  /**
   * Returns true if points are equal up to [Utils.DP_TOL]{@link DP_TOL} tolerance
   */
  equalTo(pt: Point) {
    return Utils.EQ(this.x, pt.x) && Utils.EQ(this.y, pt.y)
  }

  /**
   * Defines predicate "less than" between points. Returns true if the point is less than query points, false otherwise <br/>
   * By definition point1 < point2 if {point1.y < point2.y || point1.y == point2.y && point1.x < point2.x <br/>
   * Numeric values compared with [Utils.DP_TOL]{@link DP_TOL} tolerance
   */
  lessThan(pt: Point) {
    if (Utils.LT(this.y, pt.y)) return true
    if (Utils.EQ(this.y, pt.y) && Utils.LT(this.x, pt.x)) return true
    return false
  }

  /**
   * Return new point transformed by affine transformation matrix
   */
  transform(m: Matrix) {
    return new Point(m.transform(this.x, this.y))
  }

  /**
   * Returns projection point on given line
   */
  projectionOn(line: Line) {
    if (this.equalTo(line.pt))
      // this point equal to line anchor point
      return this.clone()

    let vec = new geom.Vector(this, line.pt)
    if (Utils.EQ_0(vec.cross(line.norm)))
      // vector to point from anchor point collinear to normal vector
      return line.pt.clone()

    let dist = vec.dot(line.norm) // signed distance
    let proj_vec = line.norm.multiply(dist)
    return this.translate(proj_vec)
  }

  /**
   * Returns true if point belongs to the "left" semi-plane, which means, point belongs to the same semi plane where line normal vector points to
   * Return false if point belongs to the "right" semi-plane or to the line itself
   */
  leftTo(line: Line) {
    let vec = new geom.Vector(line.pt, this)
    let onLeftSemiPlane = Utils.GT(vec.dot(line.norm), 0)
    return onLeftSemiPlane
  }

  /**
   * Snap the point to a grid.
   */
  snapToGrid(grid: number): Point
  snapToGrid(xGrid: number, yGrid: number): Point
  snapToGrid(a: number = 1, b?: unknown) {
    const xGrid = a
    const yGrid = b === undefined ? a : (b as number)
    return new Point(Math.round(this.x / xGrid) * xGrid, Math.round(this.y / yGrid) * yGrid)
  }

  /**
   * Calculate distance and shortest segment from point to shape and return as array [distance, shortest segment]
   * @param shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
   * @returns distance from point to shape
   * @returns shortest segment between point and shape (started at point, ended at shape)
   */
  distanceTo(shape: Shape): [number, Segment] {
    if (shape instanceof Point) {
      let dx = shape.x - this.x
      let dy = shape.y - this.y
      return [Math.sqrt(dx * dx + dy * dy), new geom.Segment(this, shape)]
    }

    if (shape instanceof geom.Line) {
      return Distance.point2line(this, shape)
    }

    if (shape instanceof geom.Circle) {
      return Distance.point2circle(this, shape)
    }

    if (shape instanceof geom.Segment) {
      return Distance.point2segment(this, shape)
    }

    if (shape instanceof geom.Arc) {
      return Distance.point2arc(this, shape)
    }

    if (shape instanceof geom.Polygon) {
      return Distance.point2polygon(this, shape)
    }

    throw new Error('unimplemented')

    // TODO: enable
    // if (shape instanceof PlanarSet) {
    //     return Distance.shape2planarSet(this, shape);
    // }
  }

  /**
   * Returns true if point is on a shape, false otherwise
   * @param shape - Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon
   */
  on(shape: Shape<any>): boolean {
    if (shape instanceof Point) {
      return this.equalTo(shape)
    }
    return shape.contains(this)
  }
}

export const point = (a: any, b: any) => new Point(a, b)
