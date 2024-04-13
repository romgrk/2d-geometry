import { ray_shoot } from '../algorithms/ray_shooting'
import * as Utils from '../utils/utils'
import * as Distance from '../algorithms/distance'
import * as Intersection from '../algorithms/intersection'
import * as Relations from '../algorithms/relation'
import {
  addToIntPoints,
  calculateInclusionFlags,
  filterDuplicatedIntersections,
  getSortedArray,
  getSortedArrayOnLine,
  initializeInclusionFlags,
  insertBetweenIntPoints,
  splitByIntersections,
} from '../data_structures/smart_intersections'
import { Multiline } from './Multiline'
import { intersectEdge2Line } from '../algorithms/intersection'
import { Inclusion } from '../utils/constants'
import { PlanarSet } from '../data_structures/PlanarSet'
import * as geom from '../classes'
import type { Box } from '../classes/Box'
import type { Face } from '../classes/Face'
import type { Line } from '../classes/Line'
import type { Point } from '../classes/Point'
import type { Segment } from '../classes/Segment'
import type { Edge, EdgeShape } from '../classes/Edge'
import { Matrix } from '../classes/Matrix'
import { Vector } from '../classes/Vector'
import { Shape, ShapeTag } from './Shape'

const isPointLike = (n: any): n is [number, number] =>
  Array.isArray(n) && n.length === 2 && typeof n[0] === 'number' && typeof n[1] === 'number'

const isPoints = (e: any): e is (Point | [number, number])[] =>
  Array.isArray(e) && (e.length === 0 || e[0] instanceof geom.Point || isPointLike(e[0]))

/**
 * Class representing a polygon.
 * Polygon in FlattenJS is a multipolygon comprised from a set of [faces]{@link geom.Face}.
 * Face, in turn, is a closed loop of [edges]{@link geom.Edge}, where edge may be segment
 * or circular arc
 */
export class Polygon extends Shape<Polygon> {
  static EMPTY = Object.freeze(new Polygon([]))

  /**
   * Container of faces (closed loops), may be empty
   */
  faces: PlanarSet<geom.Face>
  /**
   * Container of edges
   */
  edges: PlanarSet<geom.Edge>

  /**
   * Constructor creates new instance of polygon. With no arguments new polygon is empty.
   * Constructor accepts as argument array that define loop of shapes
   * or array of arrays in case of multi polygon
   * Loop may be defined in different ways:
   * - array of shapes of type Segment or Arc
   * - array of points (geom.Point)
   * - array of numeric pairs which represent points
   * - box or circle object
   * Alternatively, it is possible to use polygon.addFace method
   * @param {args} - array of shapes or array of arrays
   */
  constructor()
  constructor(edges: EdgeShape[])
  constructor(points: Point[])
  constructor(points: number[][])
  constructor(shape: geom.Box | geom.Circle)
  constructor(arg?: unknown) {
    super()
    this.faces = new PlanarSet()
    this.edges = new PlanarSet()

    /*
     * It may be array of something that may represent one loop (face) or
     * array of arrays that represent multiple loops
     */
    if (Array.isArray(arg)) {
      if (arg.length === 0) {
      } else if (isPoints(arg)) {
        /* one-loop polygon as array of pairs of numbers */
        this.faces.add(new geom.Face(this, arg as any))
      } else if (arg[0].tag <= geom.MAX_EDGE_SHAPE_TAG) {
        /* one-loop polygon as array of edges */
        this.faces.add(new geom.Face(this, arg as any))
      } else {
        /* multi-loop polygon */
        for (let loop of arg) {
          /* Check extra level of nesting for GeoJSON-style multi polygons */
          if (Array.isArray(loop) && isPoints(loop[0])) {
            for (let subloop of loop) {
              this.faces.add(new geom.Face(this, subloop))
            }
          } else {
            this.faces.add(new geom.Face(this, loop))
          }
        }
      }
    }
    else if (arg instanceof geom.Box) {
      this.faces.add(new geom.Face(this, arg))
    }
    else if (arg instanceof geom.Circle) {
      this.faces.add(new geom.Face(this, arg))
    }
    else if (arg instanceof geom.Path) {
      this.faces.add(new geom.Face(this, arg))
    }
  }

  get tag() {
    return ShapeTag.Polygon
  }

  get name() {
    return 'polygon'
  }

  get parts() {
    return Array.from(this.edges).map(e => e.shape)
  }

  /**
   * Returns bounding box of the polygon
   */
  get box(): Box {
    return [...this.faces].reduce((acc, face) => acc.merge(face.box), geom.Box.VOID)
  }

  /**
   * Returns bounding box of the polygon
   */
  get center() {
    return this.box.center
  }

  /**
   * Returns array of vertices
   */
  get vertices() {
    return [...this.edges].map((edge) => edge.start)
  }

  /**
   * Create new cloned instance of the polygon
   */
  clone() {
    const polygon = new Polygon()
    for (let face of this.faces) {
      polygon.addFace(face.shapes)
    }
    return polygon as any
  }

  /**
   * Return true is polygon has no edges
   */
  isEmpty() {
    return this.edges.size === 0
  }

  /**
   * Return true if polygon is valid for boolean operations
   * Polygon is valid if
   * 1. All faces are simple polygons (there are no self-intersected polygons)
   * 2. All faces are orientable and there is no island inside island or hole inside hole - TODO
   * 3. There is no intersections between faces (excluding touching) - TODO
   */
  isValid() {
    // 1. Polygon is invalid if at least one face is not simple
    for (let face of this.faces) {
      if (!face.isSimple(this.edges)) {
        return false
      }
    }
    // 2. TODO: check if no island inside island and no hole inside hole
    // 3. TODO: check the there is no intersection between faces
    return true
  }

  /**
   * Returns area of the polygon. Area of an island will be added, area of a hole will be subtracted
   */
  area() {
    const signedArea = [...this.faces].reduce((acc, face) => acc + face.signedArea(), 0)
    return Math.abs(signedArea)
  }

  /**
   * Add new face to polygon. Returns added face
   * @param {Point[]|Segment[]|Arc[]|Circle|Box} args -  new face may be create with one of the following ways:
   * 1) array of points that describe closed path (edges are segments)
   * 2) array of shapes (segments and arcs) which describe closed path
   * 3) circle - will be added as counterclockwise arc
   * 4) box - will be added as counterclockwise rectangle
   * You can chain method face.reverse() is you need to change direction of the creates face
   */
  addFace(a: unknown, b?: unknown) {
    // @ts-ignore
    let face = new geom.Face(this, a, b)
    this.faces.add(face)
    return face
  }

  /**
   * Delete existing face from polygon
   */
  deleteFace(face: geom.Face) {
    for (let edge of face) {
      this.edges.delete(edge)
    }
    return this.faces.delete(face)
  }

  /**
   * Clear all faces and create new faces from edges
   */
  recreateFaces() {
    // Remove all faces
    this.faces.clear()
    for (let edge of this.edges) {
      edge.face = null
    }

    // Restore faces
    let first
    let unassignedEdgeFound = true
    while (unassignedEdgeFound) {
      unassignedEdgeFound = false
      for (let edge of this.edges) {
        if (edge.face === null) {
          first = edge
          unassignedEdgeFound = true
          break
        }
      }

      if (unassignedEdgeFound) {
        let last = first
        do {
          last = last.next
        } while (last.next !== first)

        this.addFace(first, last)
      }
    }
  }

  /**
   * Delete chain of edges from the face.
   * @param face Face to remove chain
   * @param edgeFrom Start of the chain of edges to be removed
   * @param edgeTo End of the chain of edges to be removed
   */
  removeChain(face: Face, edgeFrom: Edge, edgeTo: Edge) {
    // Special case: all edges removed
    if (edgeTo.next === edgeFrom) {
      this.deleteFace(face)
      return
    }
    for (let edge = edgeFrom; edge !== edgeTo.next; edge = edge.next) {
      face.remove(edge)
      this.edges.delete(edge) // delete from PlanarSet of edges and update index
      if (face.isEmpty()) {
        this.deleteFace(face) // delete from PlanarSet of faces and update index
        break
      }
    }
  }

  /**
   * Add point as a new vertex and split edge. Point supposed to belong to an edge.
   * When edge is split, new edge created from the start of the edge to the new vertex
   * and inserted before current edge.
   * Current edge is trimmed and updated.
   * Method returns new edge added. If no edge added, it returns edge before vertex
   * @param pt Point to be added as a new vertex
   * @param edge Edge to be split with new vertex and then trimmed from start
   */
  addVertex(pt: Point, edge: Edge) {
    let shapes = edge.shape.split(pt)
    // if (shapes.length < 2) return;

    if (shapes[0] === null)
      // point incident to edge start vertex, return previous edge
      return edge.prev

    if (shapes[1] === null)
      // point incident to edge end vertex, return edge itself
      return edge

    let newEdge = new geom.Edge(shapes[0])
    let edgeBefore = edge.prev

    /* Insert first split edge into linked list after edgeBefore */
    edge.face.insert(newEdge, edgeBefore)

    // Remove old edge from edges container and 2d index
    this.edges.delete(edge)

    // Insert new edge to the edges container and 2d index
    this.edges.add(newEdge)

    // Update edge shape with second split edge keeping links
    edge.shape = shapes[1]

    // Add updated edge to the edges container and 2d index
    this.edges.add(edge)

    return newEdge
  }

  /**
   * Merge given edge with next edge and remove vertex between them
   */
  removeEndVertex(edge: Edge) {
    const edge_next = edge.next
    if (edge_next === edge) return
    edge.face.mergeWithNextEdge(edge)
    this.edges.delete(edge_next)
  }

  /**
   * Cut polygon with multiline and return array of new polygons
   * Multiline should be constructed from a line with intersection point, see notebook:
   * https://next.observablehq.com/@alexbol99/cut-polygon-with-line
   */
  cut(multiline: Multiline) {
    let cutPolygons = [this.clone()]
    for (const edge of multiline) {
      if (edge.setInclusion(this) !== Inclusion.INSIDE) continue

      const cut_edge_start = edge.shape.start
      const cut_edge_end = edge.shape.end

      const newCutPolygons = []
      for (const polygon of cutPolygons) {
        if (polygon.findEdgeByPoint(cut_edge_start) === undefined) {
          newCutPolygons.push(polygon)
        } else {
          const [cutPoly1, cutPoly2] = polygon.cutFace(cut_edge_start, cut_edge_end)
          newCutPolygons.push(cutPoly1, cutPoly2)
        }
      }
      cutPolygons = newCutPolygons
    }
    return cutPolygons
  }

  /**
   * Cut face of polygon with a segment between two points and create two new polygons
   * Supposed that a segments between points does not intersect any other edge
   * @param pt1
   * @param pt2
   */
  cutFace(pt1: Point, pt2: Point) {
    let edge1 = this.findEdgeByPoint(pt1)
    let edge2 = this.findEdgeByPoint(pt2)
    if (edge1.face !== edge2.face) return []

    // Cut face into two and create new polygon with two faces
    let edgeBefore1 = this.addVertex(pt1, edge1)
    edge2 = this.findEdgeByPoint(pt2)
    let edgeBefore2 = this.addVertex(pt2, edge2)

    let face = edgeBefore1.face
    let newEdge1 = new geom.Edge(new geom.Segment(edgeBefore1.end, edgeBefore2.end))
    let newEdge2 = new geom.Edge(new geom.Segment(edgeBefore2.end, edgeBefore1.end))

    // Swap links
    edgeBefore1.next.prev = newEdge2
    newEdge2.next = edgeBefore1.next

    edgeBefore1.next = newEdge1
    newEdge1.prev = edgeBefore1

    edgeBefore2.next.prev = newEdge1
    newEdge1.next = edgeBefore2.next

    edgeBefore2.next = newEdge2
    newEdge2.prev = edgeBefore2

    // Insert new edge to the edges container and 2d index
    this.edges.add(newEdge1)
    this.edges.add(newEdge2)

    // Add two new faces
    let face1 = this.addFace(newEdge1, edgeBefore1)
    let face2 = this.addFace(newEdge2, edgeBefore2)

    // Remove old face
    this.faces.delete(face)

    return [face1.toPolygon(), face2.toPolygon()]
  }

  /**
   * Return a result of cutting polygon with line
   */
  cutWithLine(line: Line) {
    let newPoly = this.clone()

    let multiline = new Multiline([line])

    // smart intersections
    let intersections = {
      int_points1: [],
      int_points2: [],
      int_points1_sorted: [],
      int_points2_sorted: [],
    }

    // intersect line with each edge of the polygon
    // and create smart intersections
    for (let edge of newPoly.edges) {
      let ip = intersectEdge2Line(edge, line)
      // for each intersection point
      for (let pt of ip) {
        addToIntPoints(multiline.first, pt, intersections.int_points1)
        addToIntPoints(edge, pt, intersections.int_points2)
      }
    }

    // No intersections - return a copy of the original polygon
    if (intersections.int_points1.length === 0) return newPoly

    // sort smart intersections
    intersections.int_points1_sorted = getSortedArrayOnLine(line, intersections.int_points1)
    intersections.int_points2_sorted = getSortedArray(intersections.int_points2)

    // split by intersection points
    splitByIntersections(multiline, intersections.int_points1_sorted)
    splitByIntersections(newPoly, intersections.int_points2_sorted)

    // filter duplicated intersection points
    filterDuplicatedIntersections(intersections)

    // sort intersection points again after filtering
    intersections.int_points1_sorted = getSortedArrayOnLine(line, intersections.int_points1)
    intersections.int_points2_sorted = getSortedArray(intersections.int_points2)

    // initialize inclusion flags for edges of multiline incident to intersections
    initializeInclusionFlags(intersections.int_points1)

    // calculate inclusion flag for edges of multiline incident to intersections
    calculateInclusionFlags(intersections.int_points1, newPoly)

    // filter intersections between two edges that got same inclusion flag
    for (let int_point1 of intersections.int_points1_sorted) {
      if (int_point1.edge_before.bv === int_point1.edge_after.bv) {
        intersections.int_points2[int_point1.id] = -1 // to be filtered out
        int_point1.id = -1 // to be filtered out
      }
    }
    intersections.int_points1 = intersections.int_points1.filter((int_point) => int_point.id >= 0)
    intersections.int_points2 = intersections.int_points2.filter((int_point) => int_point.id >= 0)

    // No intersections left after filtering - return a copy of the original polygon
    if (intersections.int_points1.length === 0) return newPoly

    // sort intersection points 3d time after filtering
    intersections.int_points1_sorted = getSortedArrayOnLine(line, intersections.int_points1)
    intersections.int_points2_sorted = getSortedArray(intersections.int_points2)

    // Add 2 new inner edges between intersection points
    let int_point1_prev = intersections.int_points1[0]
    let new_edge
    for (let int_point1_curr of intersections.int_points1_sorted) {
      if (int_point1_curr.edge_before.bv === Inclusion.INSIDE) {
        new_edge = new geom.Edge(new geom.Segment(int_point1_prev.pt, int_point1_curr.pt)) // (int_point1_curr.edge_before.shape);
        insertBetweenIntPoints(
          intersections.int_points2[int_point1_prev.id],
          intersections.int_points2[int_point1_curr.id],
          new_edge,
        )
        newPoly.edges.add(new_edge)

        new_edge = new geom.Edge(new geom.Segment(int_point1_curr.pt, int_point1_prev.pt)) // (int_point1_curr.edge_before.shape.reverse());
        insertBetweenIntPoints(
          intersections.int_points2[int_point1_curr.id],
          intersections.int_points2[int_point1_prev.id],
          new_edge,
        )
        newPoly.edges.add(new_edge)
      }
      int_point1_prev = int_point1_curr
    }

    // Recreate faces
    newPoly.recreateFaces()
    return newPoly
  }

  /**
   * Returns the first found edge of polygon that contains given point
   * If point is a vertex, return the edge where the point is an end vertex, not a start one
   */
  findEdgeByPoint(pt: Point) {
    let edge: Edge
    for (let face of this.faces) {
      edge = face.findEdgeByPoint(pt)
      if (edge !== undefined) break
    }
    return edge
  }

  /**
   * Split polygon into array of polygons, where each polygon is an island with all
   * hole that it contains
   */
  splitToIslands() {
    if (this.isEmpty()) return [] // return empty array if polygon is empty
    let polygons = this.toArray() // split into array of one-loop polygons
    /* Sort polygons by area in descending order */
    polygons.sort((polygon1, polygon2) => polygon2.area() - polygon1.area())
    /* define orientation of the island by orientation of the first polygon in array */
    let orientation = [...polygons[0].faces][0].orientation()
    /* Create output array from polygons with same orientation as a first polygon (array of islands) */
    let newPolygons = polygons.filter((polygon) => [...polygon.faces][0].orientation() === orientation)
    for (let polygon of polygons) {
      let face = [...polygon.faces][0]
      if (face.orientation() === orientation) continue // skip same orientation
      /* Proceed with opposite orientation */
      /* Look if any of island polygons contains tested polygon as a hole */
      for (let islandPolygon of newPolygons) {
        if (face.shapes.every((shape) => islandPolygon.contains(shape))) {
          islandPolygon.addFace(face.shapes) // add polygon as a hole in islandPolygon
          break
        }
      }
    }
    // TODO: assert if not all polygons added into output
    return newPolygons
  }

  /**
   * Reverse orientation of all faces to opposite
   */
  reverse() {
    for (let face of this.faces) {
      face.reverse()
    }
    return this
  }

  /**
   * Returns true if polygon contains shape: no point of shape lay outside of the polygon,
   * false otherwise
   */
  contains(shape: Shape) {
    if (shape instanceof geom.Point) {
      let rel = ray_shoot(this, shape)
      return rel === Inclusion.INSIDE || rel === Inclusion.BOUNDARY
    } else {
      return Relations.cover(this, shape)
    }
  }

  /**
   * Return distance and shortest segment between polygon and other shape as array [distance, shortest_segment]
   */
  distanceTo(shape: Shape): [number, Segment] {
    if (shape instanceof geom.Point) {
      let [dist, shortest_segment] = Distance.point2polygon(shape, this)
      shortest_segment = shortest_segment.reverse()
      return [dist, shortest_segment]
    }

    if (
      shape instanceof geom.Circle ||
      shape instanceof geom.Line ||
      shape instanceof geom.Segment ||
      shape instanceof geom.Arc
    ) {
      let [dist, shortest_segment] = Distance.shape2polygon(shape, this)
      shortest_segment = shortest_segment.reverse()
      return [dist, shortest_segment]
    }

    /* this method is bit faster */
    if (shape instanceof geom.Polygon) {
      let min_dist_and_segment = [Number.POSITIVE_INFINITY, geom.Segment.EMPTY] as [number, Segment]

      for (let edge of this.edges) {
        let min_stop = min_dist_and_segment[0]
        const [dist, shortest_segment] = Distance.shape2planarSet(edge.shape, shape.edges, min_stop)
        if (Utils.LT(dist, min_stop)) {
          min_dist_and_segment = [dist, shortest_segment]
        }
      }
      return min_dist_and_segment
    }

    throw new Error('unimplemented')
  }

  /**
   * Return array of intersection points between polygon and other shape
   * @param shape Shape of the one of supported types
   */
  intersect(shape: Shape) {
    if (shape instanceof geom.Point) {
      return this.contains(shape) ? [shape] : []
    }

    if (shape instanceof geom.Line) {
      return Intersection.intersectLine2Polygon(shape, this)
    }

    if (shape instanceof geom.Ray) {
      return Intersection.intersectRay2Polygon(shape, this)
    }

    if (shape instanceof geom.Circle) {
      return Intersection.intersectCircle2Polygon(shape, this)
    }

    if (shape instanceof geom.Segment) {
      return Intersection.intersectSegment2Polygon(shape, this)
    }

    if (shape instanceof geom.Arc) {
      return Intersection.intersectArc2Polygon(shape, this)
    }

    if (shape instanceof geom.Polygon) {
      return Intersection.intersectPolygon2Polygon(shape, this)
    }

    throw new Error('unimplemented')
  }

  /**
   * Returns new polygon translated by vector vec
   */
  translate(a: unknown, b?: unknown) {
    const vec = new Vector(a, b)
    const newPolygon = new Polygon()
    for (let face of this.faces) {
      newPolygon.addFace(face.shapes.map((shape) => shape.translate(vec)))
    }
    return newPolygon
  }

  /**
   * Return new polygon rotated by given angle around given point
   * If point omitted, rotate around origin (0,0)
   * Positive value of angle defines rotation counterclockwise, negative - clockwise
   * @param angle - rotation angle in radians
   * @param center - rotation center, default is (0,0)
   */
  rotate(angle = 0, center = new geom.Point()) {
    let newPolygon = new Polygon()
    for (let face of this.faces) {
      newPolygon.addFace(face.shapes.map((shape) => shape.rotate(angle, center)))
    }
    return newPolygon
  }

  /**
   * Return new polygon with coordinates multiplied by scaling factor
   * @param sx - x-axis scaling factor
   * @param sy - y-axis scaling factor
   */
  scale(sx: number, sy?: number) {
    const newPolygon = new Polygon()
    for (let face of this.faces) {
      newPolygon.addFace(face.shapes.map((shape) => shape.scale(sx, sy)))
    }
    return newPolygon
  }

  /**
   * Return new polygon transformed using affine transformation matrix
   */
  transform(matrix = Matrix.IDENTITY) {
    const newPolygon = new Polygon()
    for (let face of this.faces) {
      newPolygon.addFace(face.shapes.map((shape) => shape.transform(matrix)))
    }
    return newPolygon
  }

  /**
   * This method returns an object that defines how data will be
   * serialized when called JSON.stringify() method
   */
  toJSON() {
    return { name: this.name, faces: [...this.faces].map((face) => face.toJSON()) }
  }

  /**
   * Transform all faces into array of polygons
   */
  toArray() {
    return [...this.faces].map((face) => face.toPolygon())
  }
}

/**
 * Shortcut method to create new polygon
 */
export const polygon = (a) => new geom.Polygon(a)
