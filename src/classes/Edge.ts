import { Inclusion, Overlap } from '../utils/constants'
import { ray_shoot } from '../algorithms/ray_shooting'
import { Arc, Face, Line, Ray, Quadratic, Bezier } from './index'
import type { Point } from './Point'
import { Segment } from './Segment'

export type EdgeShape = Segment | Arc | Quadratic | Bezier

/**
 * Class representing an edge of polygon. Edge shape may be Segment or Arc.
 * Each edge contains references to the next and previous edges in the face of the polygon.
 */
export class Edge<T extends EdgeShape = EdgeShape> {
  static EMPTY = Object.freeze(new Edge(Segment.EMPTY))

  /** Shape of the edge: Segment or Arc */
  shape: T
  /** Pointer to the next edge in the face */
  next: Edge
  /** Pointer to the previous edge in the face */
  prev: Edge
  /** Pointer to the face containing this edge */
  face: Face
  /** "Arc distance" from the face start */
  arc_length: number
  /** Start inclusion flag (inside/outside/boundary) */
  bvStart: any
  /** End inclusion flag (inside/outside/boundary) */
  bvEnd: any
  /** Edge inclusion flag (INSIDE, OUTSIDE, BOUNDARY) */
  bv: any
  /** Overlap flag for boundary edge (Overlap.SAME/Overlap.OPPOSITE) */
  overlap: any

  /**
   * Construct new instance of edge
   * @param shape Shape of type Segment or Arc
   */
  constructor(shape: T) {
    this.shape = shape
    this.next = undefined
    this.prev = undefined
    this.face = undefined
    this.arc_length = 0
    this.bvStart = undefined
    this.bvEnd = undefined
    this.bv = undefined
    this.overlap = undefined
  }

  /** Get edge start point */
  get start() {
    return this.shape.start
  }

  /** Get edge end point */
  get end() {
    return this.shape.end
  }

  /** Get edge length */
  get length() {
    return this.shape.length
  }

  /** Get bounding box of the edge */
  get box() {
    return this.shape.box
  }

  isSegment(): this is Edge<Segment> {
    return this.shape instanceof Segment
  }

  isArc(): this is Edge<Arc> {
    return this.shape instanceof Arc
  }

  /** Get middle point of the edge */
  middle() {
    return this.shape.middle()
  }

  /** Get point at given length */
  pointAtLength(length: number) {
    return this.shape.pointAtLength(length)
  }

  /** Returns true if point belongs to the edge, false otherwise */
  contains(pt: Point) {
    return this.shape.contains(pt)
  }

  /**
   * Set inclusion flag of the edge with respect to another polygon
   * Inclusion flag is one of INSIDE, OUTSIDE, BOUNDARY
   */
  setInclusion(polygon) {
    if (this.bv !== undefined) return this.bv

    if (this.shape instanceof Line || this.shape instanceof Ray) {
      this.bv = Inclusion.OUTSIDE
      return this.bv
    }

    if (this.bvStart === undefined) {
      this.bvStart = ray_shoot(polygon, this.start)
    }
    if (this.bvEnd === undefined) {
      this.bvEnd = ray_shoot(polygon, this.end)
    }
    /* At least one end outside - the whole edge outside */
    if (this.bvStart === Inclusion.OUTSIDE || this.bvEnd == Inclusion.OUTSIDE) {
      this.bv = Inclusion.OUTSIDE
    } else if (this.bvStart === Inclusion.INSIDE || this.bvEnd == Inclusion.INSIDE) {
    /* At least one end inside - the whole edge inside */
      this.bv = Inclusion.INSIDE
    } else {
    /* Both are boundary - check the middle point */
      let bvMiddle = ray_shoot(polygon, this.middle())
      // let boundary = this.middle().distanceTo(polygon)[0] < 10*DP_TOL;
      // let bvMiddle = boundary ? BOUNDARY : ray_shoot(polygon, this.middle());
      this.bv = bvMiddle
    }
    return this.bv
  }

  /**
   * Set overlapping between two coincident boundary edges
   * Overlapping flag is one of Overlap.SAME or Overlap.OPPOSITE
   */
  setOverlap(edge) {
    let flag = undefined
    let shape1 = this.shape
    let shape2 = edge.shape

    if (shape1 instanceof Segment && shape2 instanceof Segment) {
      if (shape1.start.equalTo(shape2.start) && shape1.end.equalTo(shape2.end)) {
        flag = Overlap.SAME
      } else if (shape1.start.equalTo(shape2.end) && shape1.end.equalTo(shape2.start)) {
        flag = Overlap.OPPOSITE
      }
    } else if (shape1 instanceof Arc && shape2 instanceof Arc) {
      if (
        shape1.start.equalTo(shape2.start) &&
        shape1.end.equalTo(shape2.end) /*shape1.clockwise === shape2.clockwise &&*/ &&
        shape1.middle().equalTo(shape2.middle())
      ) {
        flag = Overlap.SAME
      } else if (
        shape1.start.equalTo(shape2.end) &&
        shape1.end.equalTo(shape2.start) /*shape1.clockwise !== shape2.clockwise &&*/ &&
        shape1.middle().equalTo(shape2.middle())
      ) {
        flag = Overlap.OPPOSITE
      }
    } else if (
      (shape1 instanceof Segment && shape2 instanceof Arc) ||
      (shape1 instanceof Arc && shape2 instanceof Segment)
    ) {
      if (
        shape1.start.equalTo(shape2.start) &&
        shape1.end.equalTo(shape2.end) &&
        shape1.middle().equalTo(shape2.middle())
      ) {
        flag = Overlap.SAME
      } else if (
        shape1.start.equalTo(shape2.end) &&
        shape1.end.equalTo(shape2.start) &&
        shape1.middle().equalTo(shape2.middle())
      ) {
        flag = Overlap.OPPOSITE
      }
    }

    /* Do not update overlap flag if already set on previous chain */
    if (this.overlap === undefined) this.overlap = flag
    if (edge.overlap === undefined) edge.overlap = flag
  }

  toJSON() {
    return (this.shape as any).toJSON()
  }
}
