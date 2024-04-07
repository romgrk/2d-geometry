import { Arc } from './Arc'
import { Point } from './Point'
import { Segment } from './Segment'
import { Shape, ShapeTag } from './Shape'
import { lerp } from '../utils/lerp'
import type { Matrix } from './Matrix'
import * as Utils from '../utils/utils'
import * as Intersection from '../algorithms/intersection'
import * as Distance from '../algorithms/distance'
import * as curves from './curves'

const EMPTY = Object.freeze([]) as any[]

/**
 * Class representing a cubic bezier
 * @type {Quadratic}
 */
export class Quadratic extends Shape<Quadratic> {
  static EMPTY = Object.seal(new Quadratic(Point.EMPTY, Point.EMPTY, Point.EMPTY))

  /** Start point */
  start: Point
  /** End point */
  end: Point
  /** Control point 1 */
  control1: Point

  _lut: number[]
  _vertices: Point[]
  _segments: Segment[]

  constructor(other: Quadratic)
  constructor(start: Point, control1: Point, end: Point)
  constructor(a: unknown, b?: unknown, c?: unknown) {
    super()

    if (a instanceof Quadratic) {
      this.start = a.start
      this.end = a.end
      this.control1 = a.control1
    } else {
      this.start = a as any
      this.end = c as any
      this.control1 = b as any
    }

    this._lut = EMPTY
    this._vertices = EMPTY
    this._segments = EMPTY
  }

  /**
   * Return new cloned instance of segment
   */
  clone() {
    return new Quadratic(this.start, this.control1, this.end)
  }

  get tag() {
    return ShapeTag.Quadratic
  }

  /**
   * Returns LUT
   */
  get lut() {
    if (this._lut === EMPTY) {
      this._lut = curves.quadratic.generateLUT(
        this.start.x,
        this.start.y,
        this.control1.x,
        this.control1.y,
        this.end.x,
        this.end.y,
      )
    }
    return this._lut
  }

  /**
   * Returns array of points
   */
  get vertices() {
    if (this._vertices === EMPTY) {
      const lut = this.lut
      this._vertices = []
      for (let i = 0; i < lut.length; i += 4) {
        const x = lut[i + 0]
        const y = lut[i + 1]
        this._vertices.push(new Point(x, y))
      }
    }
    return this._vertices
  }

  /**
   * Returns array of segments
   */
  get segments() {
    if (this._segments === EMPTY) {
      let previous = this.vertices[0]
      this._segments = this.vertices.slice(1).reduce((result, current) => {
        result.push(new Segment(previous, current))
        previous = current
        return result
      }, [] as Segment[])
    }
    return this._segments
  }

  /**
   * Length of the curve
   */
  get length() {
    return this.lut[this.lut.length - 1]
  }

  /**
   * Bounding box
   */
  get box() {
    // FIXME: use the analytical solution
    return curves.boxFromLUT(this.lut)
  }

  get center() {
    return this.pointAtLength(this.length / 2)
  }

  /**
   * Returns true if equals to query segment, false otherwise
   */
  equalTo(other: Quadratic): boolean {
    return this.start.equalTo(other.start) && this.end.equalTo(other.end) && this.control1.equalTo(other.control1)
  }

  /**
   * Returns true if curve contains point
   */
  contains(point: Point): boolean {
    return this.segments.some((segment) => segment.contains(point))
  }

  /**
   * Returns array of intersection points between segment and other shape
   */
  intersect(shape: Shape): Point[] {
    if (shape instanceof Point) {
      return this.contains(shape) ? [shape] : []
    }

    const intersect = getSegmentIntersect(shape) as (s: Segment, o: any) => Point[]
    const segments = this.segments.map((segment) => intersect(segment, shape)).flat()

    return segments
  }

  /**
   * Calculate distance and shortest segment from segment to shape and return as array [distance, shortest segment]
   * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
   * @returns {number} distance from segment to shape
   * @returns {Segment} shortest segment between segment and shape (started at segment, ended at shape)
   */
  distanceTo(shape: Shape): [number, Segment] {
    const distance = getSegmentDistance(shape)
    return this.segments.reduce(
      (result, current) => {
        const currentResult = distance(current, shape)
        if (currentResult[0] < result[0]) return currentResult
        return result
      },
      [Infinity, Segment.EMPTY as Segment],
    )
  }

  /**
   * Returns new curve with swapped start and end points
   */
  reverse() {
    return new Quadratic(this.end, this.control1, this.start)
  }

  /**
   * When point belongs to segment, return array of two segments split by given point,
   * if point is inside segment. Returns clone of this segment if query point is incident
   * to start or end point of the segment. Returns empty array if point does not belong to segment
   */
  split(_point: Point): (Quadratic | null)[] {
    throw new Error('unimplemented')
  }

  splitAtLength(length: number): (Quadratic | null)[] {
    if (Utils.EQ_0(length)) return [null, this.clone()]

    if (Utils.EQ(length, this.length) || Utils.GT(length, this.length)) return [this.clone(), null]

    const lut = this.lut
    const index = curves.findIndexFromLUT(lut, length)

    const ta = lut[index * 4 + 2]
    const la = lut[index * 4 + 3]

    const tb = lut[(index + 1) * 4 + 2]
    const lb = lut[(index + 1) * 4 + 3]

    const f = (length - la) / (lb - la)
    const t = lerp(ta, tb, f)

    return this.splitAtT(t)
  }

  /**
   * @param t Factor from 0.0 to 1.0
   */
  splitAtT(t: number) {
    if (Utils.EQ_0(t)) return [null, this.clone()]

    if (Utils.GE(t, 1.0)) return [this.clone(), null]

    // https://stackoverflow.com/questions/18655135/divide-bezier-curve-into-two-equal-halves
    const A = this.start
    const B = this.control1
    const C = this.end
    const D = pointAtRatio(A, B, t)
    const E = pointAtRatio(B, C, t)
    const F = pointAtRatio(D, E, t)

    return [new Quadratic(A, D, F), new Quadratic(F, E, C)]
  }

  /**
   * Return middle point of the curve
   */
  middle(): Point {
    return this.pointAtLength(this.length / 2)
  }

  /**
   * Get point at given length
   * @param length The length along the segment
   */
  pointAtLength(length: number): Point {
    if (length === 0) {
      return this.start
    }

    const segments = this.segments

    if (segments.length === 0) return Point.EMPTY

    const lut = this.lut
    const index = curves.findIndexFromLUT(lut, length)
    const lengthAtIndex = lut[index * 4 + 3]
    const lengthInSegment = length - lengthAtIndex
    const segment = segments[index]

    return segment.pointAtLength(lengthInSegment)
  }

  distanceToPoint(point: Point) {
    return this.segments.reduce(
      (result, current) => {
        const currentResult = Distance.segment2point(current, point)
        if (currentResult[0] < result[0]) return currentResult
        return result
      },
      [Infinity, Segment.EMPTY as Segment] as [number, Segment],
    )
  }

  /**
   * Return new segment transformed using affine transformation matrix
   */
  transform(matrix: Matrix): Quadratic {
    return new Quadratic(this.start.transform(matrix), this.control1.transform(matrix), this.end.transform(matrix))
  }

  /**
   * Returns true if segment start is equal to segment end up to DP_TOL
   */
  isZeroLength(): boolean {
    return this.start.equalTo(this.end) && this.start.equalTo(this.control1)
  }

  get name() {
    return 'bezier'
  }
}

function pointAtRatio(start: Point, end: Point, f: number) {
  if (f <= 0) return start
  if (f >= 1.0) return end
  return new Point((end.x - start.x) * f + start.x, (end.y - start.y) * f + start.y)
}

function getSegmentIntersect(shape: Shape) {
  if (shape instanceof Segment) {
    return Intersection.intersectSegment2Segment
  }
  if (shape instanceof Arc) {
    return Intersection.intersectSegment2Arc
  }
  throw new Error('unimplemented')
}

function getSegmentDistance(shape: Shape): (s: Segment, o: any) => [number, Segment] {
  if (shape instanceof Point) {
    return Distance.segment2point
  }
  if (shape instanceof Segment) {
    return Distance.segment2segment
  }
  if (shape instanceof Arc) {
    return Distance.segment2arc
  }
  throw new Error('unimplemented')
}

/**
 * Shortcut method to create new quadratic
 */
export const quadratic = (...args) =>
  // @ts-ignore
  new Quadratic(...args)
