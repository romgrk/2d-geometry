import * as Utils from '../utils/utils'
import * as Intersection from '../algorithms/intersection'
import * as geom from './index'
import { Shape, ShapeTag } from './Shape'

/**
 * Class representing a ray (a half-infinite line).
 */
export class Ray extends Shape<Ray> {
  pt: geom.Point
  norm: geom.Vector

  /**
   * Ray may be constructed by setting an *origin* point and a *normal* vector, so that any point *p*
   * on a ray fit an equation:
   *  (p - origin) * vector = 0
   * Ray defined by constructor is a right semi-infinite line with respect to the normal vector
   * If normal vector is omitted ray is considered horizontal (normal vector is (0,1)).
   * Don't be confused: direction of the normal vector is orthogonal to the ray
   */
  constructor(pt?: geom.Point, norm?: geom.Vector) {
    super()
    this.pt = pt ?? geom.Point.EMPTY
    this.norm = norm ?? new geom.Vector(0, 1)
  }

  /**
   * Return new cloned instance of ray
   */
  clone() {
    return new Ray(this.pt, this.norm)
  }

  get tag() {
    return ShapeTag.Ray
  }

  get name() {
    return 'ray'
  }

  get center() {
    return this.pt
  }

  /**
   * Slope of the ray - angle in radians between ray and axe x from 0 to 2PI
   */
  get slope() {
    return new geom.Vector(this.norm.y, -this.norm.x).slope
  }

  /**
   * Returns half-infinite bounding box of the ray
   */
  get box() {
    let slope = this.slope
    return new geom.Box(
      slope > Math.PI / 2 && slope < (3 * Math.PI) / 2 ? Number.NEGATIVE_INFINITY : this.pt.x,
      slope >= 0 && slope <= Math.PI ? this.pt.y : Number.NEGATIVE_INFINITY,
      slope >= Math.PI / 2 && slope <= (3 * Math.PI) / 2 ? this.pt.x : Number.POSITIVE_INFINITY,
      (slope >= Math.PI && slope <= 2 * Math.PI) || slope === 0 ? this.pt.y : Number.POSITIVE_INFINITY,
    )
  }

  /**
   * Return start point
   */
  get start() {
    return this.pt
  }

  /**
   * Ray has no end point
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
   * Return coordinate of the point that lies on the ray in the transformed
   * coordinate system where center is the projection of the point(0,0) to
   * the line containing this ray and axe y is collinear to the normal vector. <br/>
   * This method assumes that point lies on the ray
   */
  coord(pt: geom.Point) {
    return new geom.Vector(pt.x, pt.y).cross(this.norm);
  }

  /**
   * Returns true if point belongs to ray
   */
  contains(pt: geom.Point) {
    if (this.pt.equalTo(pt)) {
      return true
    }
    /* Ray contains point if vector to point is orthogonal to the ray normal vector
     * and cross product from vector to point is positive */
    const vec = new geom.Vector(this.pt, pt)
    return Utils.EQ_0(this.norm.dot(vec)) && Utils.GE(vec.cross(this.norm), 0)
  }

  /**
   * Split ray with point and return array of segment and new ray
   */
  split(pt: geom.Point) {
    if (!this.contains(pt)) return []

    if (this.pt.equalTo(pt)) {
      return [this]
    }

    return [new geom.Segment(this.pt, pt), new Ray(pt, this.norm)]
  }

  /**
   * Returns array of intersection points between ray and another shape
   */
  intersect(shape: geom.Shape) {
    if (shape instanceof geom.Point) { return this.contains(shape) ? [shape] : [] }
    if (shape instanceof geom.Segment) { return Intersection.intersectRay2Segment(this, shape) }
    if (shape instanceof geom.Arc) { return Intersection.intersectRay2Arc(this, shape) }
    if (shape instanceof geom.Line) { return Intersection.intersectRay2Line(this, shape) }
    if (shape instanceof geom.Ray) { return Intersection.intersectRay2Ray(this, shape) }
    if (shape instanceof geom.Circle) { return Intersection.intersectRay2Circle(this, shape) }
    if (shape instanceof geom.Box) { return Intersection.intersectRay2Box(this, shape) }
    if (shape instanceof geom.Polygon) { return Intersection.intersectRay2Polygon(this, shape) }
    throw new Error('unimplemented')
  }

  /**
   * Return new line rotated by angle.
   */
  rotate(angle: number, center = geom.Point.EMPTY) {
    return new Ray(this.pt.rotate(angle, center), this.norm.rotate(angle))
  }

  /**
   * Return new ray transformed by affine transformation matrix
   */
  transform(m: geom.Matrix) {
    return new Ray(this.pt.transform(m), this.norm.clone())
  }
}

export const ray = (pt?: geom.Point, norm?: geom.Vector) => new Ray(pt, norm)
