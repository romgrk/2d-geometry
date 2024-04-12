import CircularLinkedList from '../data_structures/circular_linked_list'
import * as Utils from '../utils/utils'
import { CW, ORIENTATION } from '../utils/constants'
import * as geom from './index'
import { Box } from './Box'
import type { Edge } from './Edge'
import type { Point } from './Point'
import type { Polygon } from './Polygon'
import type { PlanarSet } from '../data_structures/PlanarSet'

/**
 * Class representing a face (closed loop) in a [polygon]{@link geom.Polygon} object.
 * Face is a circular bidirectional linked list of [edges]{@link geom.Edge}.
 * Face object cannot be instantiated with a constructor.
 * Instead, use [polygon.addFace()]{@link geom.Polygon#addFace} method.
 * <br/>
 * Note, that face only set entry point to the linked list of edges but does not contain edges by itself.
 * Container of edges is a property of the polygon object. <br/>
 *
 * @example
 * // Face implements "next" iterator which enables to iterate edges in for loop:
 * for (let edge of face) {
 *      console.log(edge.shape.length)     // do something
 * }
 *
 * // Instead, it is possible to iterate edges as linked list, starting from face.first:
 * let edge = face.first;
 * do {
 *   console.log(edge.shape.length);   // do something
 *   edge = edge.next;
 * } while (edge != face.first)
 */
export class Face extends CircularLinkedList<any> {
  _box: Box | undefined
  _orientation: number | undefined

  constructor(polygon: Polygon)
  constructor(polygon: Polygon, points: geom.Point[])
  constructor(polygon: Polygon, shape: [number, number][])
  constructor(polygon: Polygon, shape: (geom.Segment | geom.Arc)[])
  constructor(polygon: Polygon, path: geom.Path)
  constructor(polygon: Polygon, face: Face)
  constructor(polygon: Polygon, shape: geom.Box | geom.Circle)
  constructor(polygon: Polygon, a: geom.Edge, b: geom.Edge)
  constructor(polygon: Polygon, a?: unknown, b?: unknown) {
    super()

    this._box = undefined
    this._orientation = undefined

    if (!a && !b) {
      return
    }

    /* If passed an array it supposed to be:
     * 1) array of shapes that performs close loop or
     * 2) array of points that performs set of vertices
     */
    if (a !== undefined && b === undefined) {
      if (a instanceof Array) {
        const shapes = a
        if (shapes.length === 0) return

        /* array of geom.Points */
        if (shapes.every((shape) => shape instanceof geom.Point)) {
          let segments = Face.points2segments(shapes)
          this.shapes2face(polygon.edges, segments)
        } else if (shapes.every((shape) => shape instanceof Array && shape.length === 2)) {
        /* array of points as pairs of numbers */
          const points = shapes.map((shape) => new geom.Point(shape[0], shape[1]))
          const segments = Face.points2segments(points)
          this.shapes2face(polygon.edges, segments)
        } else if (shapes[0] instanceof geom.Segment || shapes[0] instanceof geom.Arc || shapes[0] instanceof geom.Bezier || shapes[0] instanceof geom.Quadratic) {
        /* array of edges */
          this.shapes2face(polygon.edges, shapes)
        }
        // this is from JSON.parse object
        else if (shapes.every((shape) => shape.name === 'segment' || shape.name === 'arc')) {
          let flattenShapes = []
          for (let shape of shapes) {
            if (shape.name === 'segment') {
              flattenShapes.push(new geom.Segment(shape))
            } else {
              flattenShapes.push(new geom.Arc(shape))
            }
          }
          this.shapes2face(polygon.edges, flattenShapes)
        }
      }
      else if (a instanceof Face) {
      /* Create new face and copy edges into polygon.edges set */
        const face = a
        this.first = face.first
        this.last = face.last
        for (const edge of face) {
          polygon.edges.add(edge)
        }
      } else if (a instanceof geom.Circle) {
      /* Instantiate face from a circle in CW orientation */
        this.shapes2face(polygon.edges, [a.toArc(CW)])
      } else if (a instanceof geom.Box) {
      /* Instantiate face from a box in CW orientation */
        const box = a
        this.shapes2face(polygon.edges, [
          new geom.Segment(new geom.Point(box.xmin, box.ymin), new geom.Point(box.xmax, box.ymin)),
          new geom.Segment(new geom.Point(box.xmax, box.ymin), new geom.Point(box.xmax, box.ymax)),
          new geom.Segment(new geom.Point(box.xmax, box.ymax), new geom.Point(box.xmin, box.ymax)),
          new geom.Segment(new geom.Point(box.xmin, box.ymax), new geom.Point(box.xmin, box.ymin)),
        ])
      } else if (a instanceof geom.Path) {
      /* Instantiate face from a path in CW orientation */
        const path = a
        this.shapes2face(polygon.edges, path.parts)
      }
    }

    /* If passed two edges, consider them as start and end of the face loop */
    /* THIS METHOD WILL BE USED BY BOOLEAN OPERATIONS */
    /* Assume that edges already copied to polygon.edges set in the clip algorithm !!! */
    if (a instanceof geom.Edge && b instanceof geom.Edge) {
      this.first = a // first edge in face or undefined
      this.last = b // last edge in face or undefined
      this.last.next = this.first
      this.first.prev = this.last

      // set arc length
      this.setArcLength()

      // this.box = this.getBox();
      // this.orientation = this.getOrientation();      // face direction ccw or cw
    }
  }

  /**
   * Return array of edges from first to last
   */
  get edges() {
    return this.toArray()
  }

  /**
   * Return array of shapes which comprise face
   */
  get shapes() {
    return this.edges.map((edge) => edge.shape.clone())
  }

  /**
   * Return bounding box of the face
   */
  get box() {
    if (this._box === undefined) {
      let box = geom.Box.VOID
      for (let edge of this) {
        box = box.merge(edge.box)
      }
      this._box = box
    }
    return this._box
  }

  /**
   * Get all edges length
   */
  get perimeter() {
    return this.last.arc_length + this.last.length
  }

  /**
   * Get point on face boundary at given length
   * @param length - The length along the face boundary
   */
  pointAtLength(length: number) {
    if (length > this.perimeter || length < 0) return null
    let point = null
    for (let edge of this) {
      if (length >= edge.arc_length && (edge === this.last || length < edge.next.arc_length)) {
        point = edge.pointAtLength(length - edge.arc_length)
        break
      }
    }
    return point
  }

  static points2segments(points: Point[]) {
    let segments = []
    for (let i = 0; i < points.length; i++) {
      // skip zero length segment
      if (points[i].equalTo(points[(i + 1) % points.length])) continue
      segments.push(new geom.Segment(points[i], points[(i + 1) % points.length]))
    }
    return segments
  }

  shapes2face(edges, shapes) {
    for (let shape of shapes) {
      let edge = new geom.Edge(shape)
      this.append(edge)
      // this.box = this.box.merge(shape.box);
      edges.add(edge)
    }
    // this.orientation = this.getOrientation();              // face direction ccw or cw
  }

  /**
   * Append edge after the last edge of the face (and before the first edge). <br/>
   * @param edge - Edge to be appended to the linked list
   */
  append(edge: Edge) {
    super.append(edge)
    // set arc length
    this.setOneEdgeArcLength(edge)
    edge.face = this
    // edges.add(edge);      // Add new edges into edges container
    return this
  }

  /**
   * Insert edge newEdge into the linked list after the edge edgeBefore <br/>
   * @param newEdge - Edge to be inserted into linked list
   * @param edgeBefore - Edge to insert newEdge after it
   */
  insert(newEdge: Edge, edgeBefore: Edge) {
    super.insert(newEdge, edgeBefore)
    // set arc length
    this.setOneEdgeArcLength(newEdge)
    newEdge.face = this
    return this
  }

  /**
   * Remove the given edge from the linked list of the face <br/>
   * @param edge - Edge to be removed
   */
  remove(edge: Edge) {
    super.remove(edge)
    // Recalculate arc length
    this.setArcLength()
    return this
  }

  /**
   * Merge current edge with the next edge. Given edge will be extended,
   * next edge after it will be removed. The distortion of the polygon
   * is on the responsibility of the user of this method
   * @param edge - edge to be extended
   */
  mergeWithNextEdge(edge: Edge) {
    edge.shape.end.x = edge.next.shape.end.x
    edge.shape.end.y = edge.next.shape.end.y
    this.remove(edge.next)
    return this
  }

  /**
   * Reverse orientation of the face: first edge become last and vice a verse,
   * all edges starts and ends swapped, direction of arcs inverted. If face was oriented
   * clockwise, it becomes counterclockwise and vice versa
   */
  reverse() {
    // collect edges in revert order with reverted shapes
    let edges = []
    let edge_tmp = this.last
    do {
      // reverse shape
      edge_tmp.shape = edge_tmp.shape.reverse()
      edges.push(edge_tmp)
      edge_tmp = edge_tmp.prev
    } while (edge_tmp !== this.last)

    // restore linked list
    this.first = undefined
    this.last = undefined
    for (let edge of edges) {
      if (this.first === undefined) {
        edge.prev = edge
        edge.next = edge
        this.first = edge
        this.last = edge
      } else {
        // append to end
        edge.prev = this.last
        this.last.next = edge

        // update edge to be last
        this.last = edge

        // restore circular links
        this.last.next = this.first
        this.first.prev = this.last
      }
      // set arc length
      this.setOneEdgeArcLength(edge)
    }

    // Recalculate orientation, if set
    if (this._orientation !== undefined) {
      this._orientation = undefined
      this._orientation = this.orientation()
    }
  }

  /**
   * Set arc_length property for each of the edges in the face.
   * Arc_length of the edge it the arc length from the first edge of the face
   */
  setArcLength() {
    for (let edge of this) {
      this.setOneEdgeArcLength(edge)
      edge.face = this
    }
  }

  setOneEdgeArcLength(edge) {
    if (edge === this.first) {
      edge.arc_length = 0.0
    } else {
      edge.arc_length = edge.prev.arc_length + edge.prev.length
    }
  }

  /**
   * Returns the absolute value of the area of the face
   */
  area() {
    return Math.abs(this.signedArea())
  }

  /**
   * Returns signed area of the simple face.
   * Face is simple if it has no self intersections that change its orientation.
   * Then the area will be positive if the orientation of the face is clockwise,
   * and negative if orientation is counterclockwise.
   * It may be zero if polygon is degenerated.
   */
  signedArea() {
    let sArea = 0
    let ymin = this.box.ymin
    for (let edge of this) {
      sArea += edge.shape.definiteIntegral(ymin)
    }
    return sArea
  }

  /**
   * Return face orientation: one of geom.ORIENTATION.CW, geom.ORIENTATION.CCW, geom.ORIENTATION.NOT_ORIENTABLE <br/>
   * According to Green theorem the area of a closed curve may be calculated as double integral,
   * and the sign of the integral will be defined by the direction of the curve.
   * When the integral ("signed area") will be negative, direction is counterclockwise,
   * when positive - clockwise and when it is zero, polygon is not orientable.
   * See {@link https://mathinsight.org/greens_theorem_find_area}
   */
  orientation() {
    if (this._orientation === undefined) {
      let area = this.signedArea()
      if (Utils.EQ_0(area)) {
        this._orientation = ORIENTATION.NOT_ORIENTABLE
      } else if (Utils.LT(area, 0)) {
        this._orientation = ORIENTATION.CW
      } else {
        this._orientation = ORIENTATION.CCW
      }
    }
    return this._orientation
  }

  /**
   * Returns true if face of the polygon is simple (no self-intersection points found)
   * NOTE: this method is incomplete because it does not exclude touching points.
   * Self intersection test should check if polygon change orientation in the test point.
   * @param edges - reference to polygon edges to provide search index
   */
  isSimple(edges: PlanarSet<Edge>) {
    return Face.getSelfIntersections(this, edges, true).length === 0
  }

  static getSelfIntersections(face, edges, exitOnFirst = false) {
    let int_points = []

    // calculate intersections
    for (let edge1 of face) {
      // request edges of polygon in the box of edge1
      let resp = edges.search(edge1.box)

      // for each edge2 in response
      for (let edge2 of resp) {
        // Skip itself
        if (edge1 === edge2) continue

        // Skip is edge2 belongs to another face
        if (edge2.face !== face) continue

        // Skip next and previous edge if both are segment (if one of them arc - calc intersection)
        if (
          edge1.shape instanceof geom.Segment &&
          edge2.shape instanceof geom.Segment &&
          (edge1.next === edge2 || edge1.prev === edge2)
        )
          continue

        // calculate intersections between edge1 and edge2
        let ip = edge1.shape.intersect(edge2.shape)

        // for each intersection point
        for (let pt of ip) {
          // skip start-end connections
          if (pt.equalTo(edge1.start) && pt.equalTo(edge2.end) && edge2 === edge1.prev) continue
          if (pt.equalTo(edge1.end) && pt.equalTo(edge2.start) && edge2 === edge1.next) continue

          int_points.push(pt)

          if (exitOnFirst) break
        }

        if (int_points.length > 0 && exitOnFirst) break
      }

      if (int_points.length > 0 && exitOnFirst) break
    }
    return int_points
  }

  /**
   * Returns edge which contains given point
   */
  findEdgeByPoint(p: Point) {
    let edgeFound: Edge
    for (let edge of this) {
      if (p.equalTo(edge.shape.start)) continue
      if (p.equalTo(edge.shape.end) || edge.shape.contains(p)) {
        edgeFound = edge
        break
      }
    }
    return edgeFound
  }

  /**
   * Returns new polygon created from one face
   */
  toPolygon() {
    return new geom.Polygon(this.shapes)
  }

  toJSON() {
    return this.edges.map((edge) => edge.toJSON())
  }
}
