import * as Intersection from '../algorithms/intersection'
import Errors from '../utils/errors'
import * as Distance from '../algorithms/distance'
import * as Utils from '../utils/utils'
import * as geom from './index'
import type { Matrix } from './Matrix'
import { Shape, ShapeTag } from './Shape'
import { Point } from './Point'
import { Vector, vector } from './Vector'

/**
 * Class representing a line
 * @type {Line}
 */
export class Line extends Shape<Line> {
  /**
   * Point a line passes through
   */
  pt: Point
  /**
   * Normal vector to a line <br/>
   * Vector is normalized (length == 1)<br/>
   * Direction of the vector is chosen to satisfy inequality norm * p >= 0
   */
  norm: Vector

  /**
   * Line may be constructed by point and normal vector or by two points that a line passes through
   * @param {Point} pt - point that a line passes through
   * @param {Vector|Point} norm - normal vector to a line or second point a line passes through
   */
  constructor(...args) {
    super()
    this.pt = new Point()
    this.norm = new Vector(0, 1)

    if (args.length === 0) {
      return
    }

    if (args.length === 1 && args[0] instanceof Object && args[0].name === 'line') {
      let { pt, norm } = args[0]
      this.pt = new Point(pt)
      this.norm = new Vector(norm)
      return
    }

    if (args.length === 2) {
      let a1 = args[0]
      let a2 = args[1]

      if (a1 instanceof Point && a2 instanceof Point) {
        this.pt = a1
        this.norm = Line.points2norm(a1, a2)
        if (this.norm.dot(vector(this.pt.x, this.pt.y)) >= 0) {
          this.norm.invert()
        }
        return
      }

      if (a1 instanceof Point && a2 instanceof Vector) {
        if (Utils.EQ_0(a2.x) && Utils.EQ_0(a2.y)) {
          throw Errors.ILLEGAL_PARAMETERS
        }
        this.pt = a1.clone()
        this.norm = a2.clone()
        this.norm = this.norm.normalize()
        if (this.norm.dot(vector(this.pt.x, this.pt.y)) >= 0) {
          this.norm.invert()
        }
        return
      }

      if (a1 instanceof Vector && a2 instanceof Point) {
        if (Utils.EQ_0(a1.x) && Utils.EQ_0(a1.y)) {
          throw Errors.ILLEGAL_PARAMETERS
        }
        this.pt = a2.clone()
        this.norm = a1.clone()
        this.norm = this.norm.normalize()
        if (this.norm.dot(vector(this.pt.x, this.pt.y)) >= 0) {
          this.norm.invert()
        }
        return
      }
    }

    throw Errors.ILLEGAL_PARAMETERS
  }

  /**
   * Return new cloned instance of line
   */
  clone() {
    return new Line(this.pt, this.norm)
  }

  get tag() {
    return ShapeTag.Line
  }

  get center() {
    return this.pt
  }

  /* The following methods need for implementation of Edge interface
    /**
     * Line has no start point
     */
  get start() {
    return undefined
  }

  /**
   * Line has no end point
   */
  get end() {
    return undefined
  }

  /**
   * Return positive infinity number as length
   */
  get length() {
    return Number.POSITIVE_INFINITY
  }

  /**
   * Returns infinite box
   */
  get box() {
    return new geom.Box(
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
    )
  }

  /**
   * Middle point is undefined
   */
  get middle() {
    return undefined
  }

  /**
   * Slope of the line - angle in radians between line and axe x from 0 to 2PI
   */
  get slope() {
    return new Vector(this.norm.y, -this.norm.x).slope
  }

  /**
   * Get coefficients [A,B,C] of a standard line equation in the form Ax + By = C
   * @code [A, B, C] = line.standard
   */
  get standard() {
    const A = this.norm.x
    const B = this.norm.y
    const C = this.norm.dot(vector(this.pt.x, this.pt.y))

    return [A, B, C] as const
  }

  /**
   * Return true if parallel or incident to other line
   * @param {Line} other_line - line to check
   * @returns {boolean}
   */
  parallelTo(other_line) {
    return Utils.EQ_0(this.norm.cross(other_line.norm))
  }

  /**
   * Returns true if incident to other line
   * @param {Line} other_line - line to check
   * @returns {boolean}
   */
  incidentTo(other_line) {
    return this.parallelTo(other_line) && this.pt.on(other_line)
  }

  /**
   * Returns true if point belongs to line
   * @param {Point} pt Query point
   * @returns {boolean}
   */
  contains(pt) {
    if (this.pt.equalTo(pt)) {
      return true
    }
    /* Line contains point if vector to point is orthogonal to the line normal vector */
    let vec = new Vector(this.pt, pt)
    return Utils.EQ_0(this.norm.dot(vec))
  }

  /**
   * Return coordinate of the point that lies on the line in the transformed
   * coordinate system where center is the projection of the point(0,0) to
   * the line and axe y is collinear to the normal vector. <br/>
   * This method assumes that point lies on the line and does not check it
   * @param {Point} pt - point on a line
   * @returns {number}
   */
  coord(pt) {
    return vector(pt.x, pt.y).cross(this.norm)
  }

  /**
   * Returns array of intersection points
   * @param {Shape} shape - shape to intersect with
   * @returns {Point[]}
   */
  intersect(shape) {
    if (shape instanceof geom.Point) {
      return this.contains(shape) ? [shape] : []
    }

    if (shape instanceof geom.Line) {
      return Intersection.intersectLine2Line(this, shape)
    }

    if (shape instanceof geom.Ray) {
      return Intersection.intersectRay2Line(shape, this)
    }

    if (shape instanceof geom.Circle) {
      return Intersection.intersectLine2Circle(this, shape)
    }

    if (shape instanceof geom.Box) {
      return Intersection.intersectLine2Box(this, shape)
    }

    if (shape instanceof geom.Segment) {
      return Intersection.intersectSegment2Line(shape, this)
    }

    if (shape instanceof geom.Arc) {
      return Intersection.intersectLine2Arc(this, shape)
    }

    if (shape instanceof geom.Polygon) {
      return Intersection.intersectLine2Polygon(this, shape)
    }
  }

  /**
   * Calculate distance and shortest segment from line to shape and returns array [distance, shortest_segment]
   * @param shape Shape of the one of the types Point, Circle, Segment, Arc, Polygon
   */
  distanceTo(shape: geom.Shape<any>): [number, geom.Segment] {
    if (shape instanceof geom.Point) {
      let [distance, shortest_segment] = Distance.point2line(shape, this)
      shortest_segment = shortest_segment.reverse()
      return [distance, shortest_segment]
    }

    if (shape instanceof geom.Circle) {
      let [distance, shortest_segment] = Distance.circle2line(shape, this)
      shortest_segment = shortest_segment.reverse()
      return [distance, shortest_segment]
    }

    if (shape instanceof geom.Segment) {
      let [distance, shortest_segment] = Distance.segment2line(shape, this)
      return [distance, shortest_segment.reverse()]
    }

    if (shape instanceof geom.Arc) {
      let [distance, shortest_segment] = Distance.arc2line(shape, this)
      return [distance, shortest_segment.reverse()]
    }

    if (shape instanceof geom.Polygon) {
      let [distance, shortest_segment] = Distance.shape2polygon(this, shape)
      return [distance, shortest_segment]
    }
  }

  /**
   * Split line with a point or array of points and return array of shapes
   * Assumed (but not checked) that all points lay on the line
   * @param {Point | Point[]} pt
   * @returns {MultilineShapes}
   */
  split(pt) {
    if (pt instanceof Point) {
      return [new geom.Ray(pt, this.norm.invert()), new geom.Ray(pt, this.norm)]
    } else {
      let multiline = new geom.Multiline([this])
      let sorted_points = this.sortPoints(pt)
      multiline.split(sorted_points)
      return multiline.toShapes()
    }
  }

  /**
   * Return new line rotated by angle
   * @param {number} angle - angle in radians
   * @param {Point} center - center of rotation
   */
  rotate(angle, center = new Point()) {
    return new Line(this.pt.rotate(angle, center), this.norm.rotate(angle))
  }

  /**
   * Return new line transformed by affine transformation matrix
   * @param m - affine transformation matrix (a,b,c,d,tx,ty)
   */
  transform(m: Matrix) {
    return new Line(this.pt.transform(m), this.norm.clone())
  }

  /**
   * Sort given array of points that lay on a line with respect to coordinate on a line
   * The method assumes that points lay on the line and does not check this
   * @param {Point[]} pts - array of points
   * @returns {Point[]} new array sorted
   */
  sortPoints(pts) {
    return pts.slice().sort((pt1, pt2) => {
      if (this.coord(pt1) < this.coord(pt2)) {
        return -1
      }
      if (this.coord(pt1) > this.coord(pt2)) {
        return 1
      }
      return 0
    })
  }

  get name() {
    return 'line'
  }

  static points2norm(pt1, pt2) {
    if (pt1.equalTo(pt2)) {
      throw Errors.ILLEGAL_PARAMETERS
    }
    let vec = new Vector(pt1, pt2)
    let unit = vec.normalize()
    return unit.rotate90CW()
  }
}

/**
 * Function to create line equivalent to "new" constructor
 * @param args
 */
export const line = (...args) => new Line(...args)
