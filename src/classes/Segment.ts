import Errors from '../utils/errors'
import * as Utils from '../utils/utils'
import * as Distance from '../algorithms/distance'
import * as Intersection from '../algorithms/intersection'
import { PlanarSet } from '../data_structures/PlanarSet'
import * as geom from './index'
import { Point } from './Point'
import { Shape, ShapeTag } from './Shape'

/**
 * A segment is a finite line with start and end points
 */
export class Segment extends Shape<Segment> {
  static EMPTY = Object.freeze(new Segment(Point.EMPTY, Point.EMPTY))

  /** Start point */
  start: Point
  /** End Point */
  end: Point

  constructor()
  constructor(other: Segment)
  constructor(start: Point, end: Point)
  constructor(coords: [number, number, number, number])
  constructor(x1: number, y1: number, x2: number, y2: number)
  constructor(a?: unknown, b?: unknown, c?: unknown, d?: unknown) {
    super()
    this.start = Point.EMPTY
    this.end = Point.EMPTY

    const argsLength = +(a !== undefined) + +(b !== undefined) + +(c !== undefined) + +(d !== undefined)

    if (argsLength === 0) {
      return
    }

    if (argsLength === 1 && Array.isArray(a)) {
      let coords = a
      this.start = new Point(coords[0], coords[1])
      this.end = new Point(coords[2], coords[3])
      return
    }

    if (argsLength === 1 && (a as any).name === 'segment') {
      let { start, end } = a as Segment
      this.start = new Point(start.x, start.y)
      this.end = new Point(end.x, end.y)
      return
    }

    // second point omitted issue #84
    if (argsLength === 1 && a instanceof Point) {
      this.start = a.clone()
      return
    }

    if (argsLength === 2 && a instanceof Point && b instanceof Point) {
      this.start = a.clone()
      this.end = b.clone()
      return
    }

    if (argsLength === 4) {
      this.start = new Point(a as any, b as any)
      this.end = new Point(c as any, d as any)
      return
    }

    throw Errors.ILLEGAL_PARAMETERS
  }

  /**
   * Return new cloned instance of segment
   */
  clone() {
    return new Segment(this.start, this.end)
  }

  get tag() {
    return ShapeTag.Segment
  }

  get name() {
    return 'segment'
  }

  get box() {
    return new geom.Box(
      Math.min(this.start.x, this.end.x),
      Math.min(this.start.y, this.end.y),
      Math.max(this.start.x, this.end.x),
      Math.max(this.start.y, this.end.y),
    )
  }

  get center() {
    return new Point((this.start.x + this.end.x) / 2, (this.start.y + this.end.y) / 2)
  }

  /**
   * Returns array of start and end point
   * @returns [Point,Point]
   */
  get vertices() {
    return [this.start, this.end]
  }

  /**
   * Length of a segment
   */
  get length() {
    return this.start.distanceTo(this.end)[0]
  }

  /**
   * Slope of the line - angle to axe x in radians from 0 to 2PI
   */
  get slope() {
    return new geom.Vector(this.start, this.end).slope
  }

  get vector() {
    return new geom.Vector(this.start, this.end)
  }

  /**
   * Returns true if equals to query segment, false otherwise
   */
  equalTo(seg: Segment) {
    return this.start.equalTo(seg.start) && this.end.equalTo(seg.end)
  }

  /**
   * Returns true if segment contains point
   */
  contains(pt: Point) {
    return Utils.EQ_0(this.distanceToPoint(pt))
  }

  /**
   * Returns array of intersection points between segment and other shape
   */
  intersect(shape: Shape) {
    if (shape instanceof Point) {
      return this.contains(shape) ? [shape] : []
    }

    if (shape instanceof geom.Line) {
      return Intersection.intersectSegment2Line(this, shape)
    }

    if (shape instanceof geom.Ray) {
      return Intersection.intersectRay2Segment(shape, this)
    }

    if (shape instanceof geom.Segment) {
      return Intersection.intersectSegment2Segment(this, shape)
    }

    if (shape instanceof geom.Circle) {
      return Intersection.intersectSegment2Circle(this, shape)
    }

    if (shape instanceof geom.Box) {
      return Intersection.intersectSegment2Box(this, shape)
    }

    if (shape instanceof geom.Arc) {
      return Intersection.intersectSegment2Arc(this, shape)
    }

    if (shape instanceof geom.Polygon) {
      return Intersection.intersectSegment2Polygon(this, shape)
    }

    throw new Error('unreachable')
  }

  /**
   * Calculate distance and shortest segment from segment to shape and return as array [distance, shortest segment]
   * @param shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
   * @returns {number} distance from segment to shape
   * @returns {[number, Segment]} shortest segment between segment and shape (started at segment, ended at shape)
   */
  distanceTo(shape: Shape): [number, Segment] {
    if (shape instanceof Point) {
      let [dist, shortest_segment] = Distance.segment2point(this, shape)
      return [dist, shortest_segment]
    }

    if (shape instanceof geom.Circle) {
      let [dist, shortest_segment] = Distance.segment2circle(this, shape)
      return [dist, shortest_segment]
    }

    if (shape instanceof geom.Line) {
      let [dist, shortest_segment] = Distance.segment2line(this, shape)
      return [dist, shortest_segment]
    }

    if (shape instanceof geom.Segment) {
      let [dist, shortest_segment] = Distance.segment2segment(this, shape)
      return [dist, shortest_segment]
    }

    if (shape instanceof geom.Arc) {
      let [dist, shortest_segment] = Distance.segment2arc(this, shape)
      return [dist, shortest_segment]
    }

    if (shape instanceof geom.Polygon) {
      let [dist, shortest_segment] = Distance.shape2polygon(this, shape)
      return [dist, shortest_segment]
    }

    if (shape instanceof PlanarSet) {
      let [dist, shortest_segment] = Distance.shape2planarSet(this, shape)
      return [dist, shortest_segment]
    }
  }

  /**
   * Returns unit vector in the direction from start to end
   */
  tangentInStart(): geom.Vector {
    let vec = new geom.Vector(this.start, this.end)
    return vec.normalize()
  }

  /**
   * Return unit vector in the direction from end to start
   */
  tangentInEnd() {
    let vec = new geom.Vector(this.end, this.start)
    return vec.normalize()
  }

  /**
   * Returns new segment with swapped start and end points
   */
  reverse() {
    return new Segment(this.end, this.start)
  }

  /**
   * When point belongs to segment, return array of two segments split by given point,
   * if point is inside segment. Returns clone of this segment if query point is incident
   * to start or end point of the segment. Returns empty array if point does not belong to segment
   * @param point Query point
   */
  split(point: Point) {
    if (this.start.equalTo(point)) return [null, this.clone()]

    if (this.end.equalTo(point)) return [this.clone(), null]

    return [new geom.Segment(this.start, point), new geom.Segment(point, this.end)]
  }

  splitAtLength(length: number) {
    if (Utils.EQ_0(length)) return [null, this.clone()]

    if (Utils.EQ(length, this.length)) return [this.clone(), null]

    const point = this.pointAtLength(length)

    return [new geom.Segment(this.start, point), new geom.Segment(point, this.end)]
  }

  /**
   * Return middle point of the segment
   */
  middle() {
    return this.center
  }

  /**
   * Get point at given length
   */
  pointAtLength(length: number) {
    if (length <= 0) return this.start
    if (length >= this.length) return this.end
    const factor = length / this.length
    return new Point(
      (this.end.x - this.start.x) * factor + this.start.x,
      (this.end.y - this.start.y) * factor + this.start.y,
    )
  }

  distanceToPoint(point: Point) {
    const [dist] = Distance.point2segment(point, this)
    return dist
  }

  definiteIntegral(ymin = 0.0) {
    const dx = this.end.x - this.start.x
    const dy1 = this.start.y - ymin
    const dy2 = this.end.y - ymin
    return (dx * (dy1 + dy2)) / 2
  }

  /**
   * Return new segment transformed using affine transformation matrix
   */
  transform(matrix: geom.Matrix): Segment {
    return new Segment(this.start.transform(matrix), this.end.transform(matrix))
  }

  /**
   * Returns true if segment start is equal to segment end up to DP_TOL
   */
  isZeroLength(): boolean {
    return this.start.equalTo(this.end)
  }

  /**
   * Sort given array of points from segment start to end, assuming all points lay on the segment
   */
  sortPoints(pts: Point[]): Point[] {
    const line = new geom.Line(this.start, this.end)
    return line.sortPoints(pts)
  }
}

/**
 * Shortcut method to create new segment
 */
export const segment = (x1: number, y1: number, x2: number, y2: number) => new Segment(x1, y1, x2, y2)
