import Errors from '../utils/errors'
import * as Utils from '../utils/utils'
import * as Constants from '../utils/constants'
import LinkedList from '../data_structures/linked_list'
import {
  addToIntPoints,
  sortIntersections,
  filterDuplicatedIntersections,
  initializeInclusionFlags,
  calculateInclusionFlags,
  setOverlappingFlags,
  intPointsPoolCount,
  splitByIntersections,
  Intersections,
  Intersection,
} from '../data_structures/smart_intersections'
import type { Point } from '../classes/Point'
import type { Polygon } from '../classes/Polygon'
import type { Segment } from '../classes/Segment'
import type { Shape } from '../classes/Shape'
import { Face } from '../classes'

const { Inclusion, Overlap } = Constants
const { START_VERTEX, END_VERTEX } = Constants

export enum BooleanOp {
  UNION = 1,
  INTERSECT = 2,
  SUBTRACT = 3,
}

/**
 * Unify two polygons polygons and returns new polygon. <br/>
 * Point belongs to the resulted polygon if it belongs to the first OR to the second polygon
 */
export function unify(polygon1: Polygon, polygon2: Polygon): Polygon {
  return booleanOpBinary(polygon1, polygon2, BooleanOp.UNION, true)[0]
}

/**
 * Subtract second polygon from the first and returns new polygon
 * Point belongs to the resulted polygon if it belongs to the first polygon AND NOT to the second polygon
 */
export function subtract(polygon1: Polygon, polygon2: Polygon): Polygon {
  const polygon2_reversed = polygon2.clone().reverse()
  return booleanOpBinary(polygon1, polygon2_reversed, BooleanOp.SUBTRACT, true)[0]
}

/**
 * Intersect two polygons and returns new polygon
 * Point belongs to the resulted polygon is it belongs to the first AND to the second polygon
 */
export function intersect(polygon1: Polygon, polygon2: Polygon): Polygon {
  return booleanOpBinary(polygon1, polygon2, BooleanOp.INTERSECT, true)[0]
}

/**
 * Returns boundary of intersection between two polygons as two arrays of shapes (Segments/Arcs) <br/>
 * The first array are shapes from the first polygon, the second array are shapes from the second
 */
export function innerClip(polygon1: Polygon, polygon2: Polygon): Shape[][] {
  let [res_poly, wrk_poly] = booleanOpBinary(polygon1, polygon2, BooleanOp.INTERSECT, false)

  let clip_shapes1 = []
  for (let face of res_poly.faces) {
    clip_shapes1 = [...clip_shapes1, ...[...face.edges].map((edge) => edge.shape)]
  }
  let clip_shapes2 = []
  for (let face of wrk_poly.faces) {
    clip_shapes2 = [...clip_shapes2, ...[...face.edges].map((edge) => edge.shape)]
  }
  return [clip_shapes1, clip_shapes2]
}

/**
 * Returns boundary of subtraction of the second polygon from first polygon as array of shapes
 */
export function outerClip(polygon1: Polygon, polygon2: Polygon): Shape[] {
  const [res_poly] = booleanOpBinary(polygon1, polygon2, BooleanOp.SUBTRACT, false)

  let clip_shapes1 = []
  for (let face of res_poly.faces) {
    clip_shapes1 = [...clip_shapes1, ...[...face.edges].map((edge) => edge.shape)]
  }

  return clip_shapes1
}

/**
 * Returns intersection points between boundaries of two polygons as two array of points <br/>
 * Points in the first array belong to first polygon, points from the second - to the second.
 * Points in each array are ordered according to the direction of the correspondent polygon
 */
export function calculateIntersections(polygon1: Polygon, polygon2: Polygon): Point[][] {
  let res_poly = polygon1.clone()
  let wrk_poly = polygon2.clone()

  // get intersection points
  let intersections = getIntersections(res_poly, wrk_poly)

  // sort intersection points
  sortIntersections(intersections)

  // split by intersection points
  splitByIntersections(res_poly, intersections.int_points1_sorted)
  splitByIntersections(wrk_poly, intersections.int_points2_sorted)

  // filter duplicated intersection points
  filterDuplicatedIntersections(intersections)

  // sort intersection points again after filtering
  sortIntersections(intersections)

  let ip_sorted1 = intersections.int_points1_sorted.map((int_point) => int_point.pt)
  let ip_sorted2 = intersections.int_points2_sorted.map((int_point) => int_point.pt)
  return [ip_sorted1, ip_sorted2]
}

function filterNotRelevantEdges(res_poly: Polygon, wrk_poly: Polygon, intersections: Intersections, op: BooleanOp) {
  // keep not intersected faces for further remove and merge
  let notIntersectedFacesRes = getNotIntersectedFaces(res_poly, intersections.int_points1)
  let notIntersectedFacesWrk = getNotIntersectedFaces(wrk_poly, intersections.int_points2)

  // calculate inclusion flag for not intersected faces
  calcInclusionForNotIntersectedFaces(notIntersectedFacesRes, wrk_poly)
  calcInclusionForNotIntersectedFaces(notIntersectedFacesWrk, res_poly)

  // initialize inclusion flags for edges incident to intersections
  initializeInclusionFlags(intersections.int_points1)
  initializeInclusionFlags(intersections.int_points2)

  // calculate inclusion flags only for edges incident to intersections
  calculateInclusionFlags(intersections.int_points1, wrk_poly)
  calculateInclusionFlags(intersections.int_points2, res_poly)

  // fix boundary conflicts
  while (
    fixBoundaryConflicts(
      res_poly,
      wrk_poly,
      intersections.int_points1,
      intersections.int_points1_sorted,
      intersections.int_points2,
      intersections,
    )
  );
  // while (fixBoundaryConflicts(wrk_poly, res_poly, intersections.int_points2, intersections.int_points2_sorted, intersections.int_points1, intersections));

  // Set overlapping flags for boundary chains: SAME or OPPOSITE
  setOverlappingFlags(intersections)

  // remove not relevant chains between intersection points
  removeNotRelevantChains(res_poly, op, intersections.int_points1_sorted, true)
  removeNotRelevantChains(wrk_poly, op, intersections.int_points2_sorted, false)

  // remove not relevant not intersected faces from res_polygon and wrk_polygon
  // if op == UNION, remove faces that are included in wrk_polygon without intersection
  // if op == INTERSECT, remove faces that are not included into wrk_polygon
  removeNotRelevantNotIntersectedFaces(res_poly, notIntersectedFacesRes, op, true)
  removeNotRelevantNotIntersectedFaces(wrk_poly, notIntersectedFacesWrk, op, false)
}

function swapLinksAndRestore(res_poly: Polygon, wrk_poly: Polygon, intersections: Intersections, op: BooleanOp) {
  // add edges of wrk_poly into the edge container of res_poly
  copyWrkToRes(res_poly, wrk_poly, op, intersections.int_points2)

  // swap links from res_poly to wrk_poly and vice versa
  swapLinks(res_poly, wrk_poly, intersections)

  // remove old faces
  removeOldFaces(res_poly, intersections.int_points1)
  removeOldFaces(wrk_poly, intersections.int_points2)

  // restore faces
  restoreFaces(res_poly, intersections.int_points1, intersections.int_points2)
  restoreFaces(res_poly, intersections.int_points2, intersections.int_points1)

  // merge relevant not intersected faces from wrk_polygon to res_polygon
  // mergeRelevantNotIntersectedFaces(res_poly, wrk_poly);
}

function booleanOpBinary(polygon1: Polygon, polygon2: Polygon, op: BooleanOp, restore: boolean) {
  let res_poly = polygon1.clone()
  let wrk_poly = polygon2.clone()

  // get intersection points
  let intersections = getIntersections(res_poly, wrk_poly)

  // sort intersection points
  sortIntersections(intersections)

  // split by intersection points
  splitByIntersections(res_poly, intersections.int_points1_sorted)
  splitByIntersections(wrk_poly, intersections.int_points2_sorted)

  // filter duplicated intersection points
  filterDuplicatedIntersections(intersections)

  // sort intersection points again after filtering
  sortIntersections(intersections)

  // calculate inclusion and remove not relevant edges
  filterNotRelevantEdges(res_poly, wrk_poly, intersections, op)

  if (restore) {
    swapLinksAndRestore(res_poly, wrk_poly, intersections, op)
  }

  return [res_poly, wrk_poly]
}

function getIntersections(polygon1: Polygon, polygon2: Polygon) {
  let intersections = {
    int_points1: [],
    int_points2: [],
    int_points1_sorted: [],
    int_points2_sorted: [],
  }

  // calculate intersections
  for (let edge1 of polygon1.edges) {
    // request edges of polygon2 in the box of edge1
    let resp = polygon2.edges.search(edge1.box)

    // for each edge2 in response
    for (let edge2 of resp) {
      // calculate intersections between edge1 and edge2
      let ip = edge1.shape.intersect(edge2.shape)

      // for each intersection point
      for (let pt of ip) {
        addToIntPoints(edge1, pt, intersections.int_points1)
        addToIntPoints(edge2, pt, intersections.int_points2)
      }
    }
  }
  return intersections
}

function getNotIntersectedFaces(poly: Polygon, int_points: Intersection[]) {
  let notIntersected = []
  for (let face of poly.faces) {
    if (!int_points.find((ip) => ip.face === face)) {
      notIntersected.push(face)
    }
  }
  return notIntersected
}

function calcInclusionForNotIntersectedFaces(notIntersectedFaces: Face[], poly2: Polygon) {
  for (let face of notIntersectedFaces) {
    face.first.bv = face.first.bvStart = face.first.bvEnd = undefined
    face.first.setInclusion(poly2)
  }
}

function fixBoundaryConflicts(
  poly1: Polygon,
  poly2: Polygon,
  int_points1: Intersection[],
  int_points1_sorted: Intersection[],
  int_points2: Intersection[],
  intersections: Intersections
) {
  let cur_face
  let first_int_point_in_face_id
  let next_int_point1
  let num_int_points = int_points1_sorted.length
  let iterate_more = false

  for (let i = 0; i < num_int_points; i++) {
    let cur_int_point1 = int_points1_sorted[i]

    // Find boundary chain in the polygon1
    if (cur_int_point1.face !== cur_face) {
      // next chain started
      first_int_point_in_face_id = i // cur_int_point1;
      cur_face = cur_int_point1.face
    }

    // Skip duplicated points with same <x,y> in "cur_int_point1" pool
    let int_points_cur_pool_start = i
    let int_points_cur_pool_num = intPointsPoolCount(int_points1_sorted, i, cur_face)
    let next_int_point_id
    if (
      int_points_cur_pool_start + int_points_cur_pool_num < num_int_points &&
      int_points1_sorted[int_points_cur_pool_start + int_points_cur_pool_num].face === cur_face
    ) {
      next_int_point_id = int_points_cur_pool_start + int_points_cur_pool_num
    } else {
      // get first point from the same face
      next_int_point_id = first_int_point_in_face_id
    }

    // From all points with same ,x,y. in 'next_int_point1' pool choose one that
    // has same face both in res_poly and in wrk_poly
    let int_points_next_pool_num = intPointsPoolCount(int_points1_sorted, next_int_point_id, cur_face)
    next_int_point1 = null
    for (let j = next_int_point_id; j < next_int_point_id + int_points_next_pool_num; j++) {
      let next_int_point1_tmp = int_points1_sorted[j]
      if (
        next_int_point1_tmp.face === cur_face &&
        int_points2[next_int_point1_tmp.id].face === int_points2[cur_int_point1.id].face
      ) {
        next_int_point1 = next_int_point1_tmp
        break
      }
    }
    if (next_int_point1 === null) continue

    let edge_from1 = cur_int_point1.edge_after
    let edge_to1 = next_int_point1.edge_before

    // Case #1. One of the ends is not boundary - probably tiny edge wrongly marked as boundary
    if (edge_from1.bv === Inclusion.BOUNDARY && edge_to1.bv != Inclusion.BOUNDARY) {
      edge_from1.bv = edge_to1.bv
      continue
    }

    if (edge_from1.bv != Inclusion.BOUNDARY && edge_to1.bv === Inclusion.BOUNDARY) {
      edge_to1.bv = edge_from1.bv
      continue
    }

    // Set up all boundary values for middle edges. Need for cases 2 and 3
    if (
      (edge_from1.bv === Inclusion.BOUNDARY && edge_to1.bv === Inclusion.BOUNDARY && edge_from1 != edge_to1) ||
      (edge_from1.bv === Inclusion.INSIDE && edge_to1.bv === Inclusion.OUTSIDE) ||
      (edge_from1.bv === Inclusion.OUTSIDE && edge_to1.bv === Inclusion.INSIDE)
    ) {
      let edge_tmp = edge_from1.next
      while (edge_tmp != edge_to1) {
        edge_tmp.bvStart = undefined
        edge_tmp.bvEnd = undefined
        edge_tmp.bv = undefined
        edge_tmp.setInclusion(poly2)
        edge_tmp = edge_tmp.next
      }
    }

    // Case #2. Both of the ends boundary. Check all the edges in the middle
    // If some edges in the middle are not boundary then update bv of 'from' and 'to' edges
    if (edge_from1.bv === Inclusion.BOUNDARY && edge_to1.bv === Inclusion.BOUNDARY && edge_from1 != edge_to1) {
      let edge_tmp = edge_from1.next
      let new_bv
      while (edge_tmp != edge_to1) {
        if (edge_tmp.bv != Inclusion.BOUNDARY) {
          if (new_bv === undefined) {
            // first not boundary edge between from and to
            new_bv = edge_tmp.bv
          } else {
            // another not boundary edge between from and to
            if (edge_tmp.bv != new_bv) {
              // and it has different bv - can't resolve conflict
              throw Errors.UNRESOLVED_BOUNDARY_CONFLICT
            }
          }
        }
        edge_tmp = edge_tmp.next
      }

      if (new_bv != undefined) {
        edge_from1.bv = new_bv
        edge_to1.bv = new_bv
      }
      continue // all middle edges are boundary, proceed with this
    }

    // Case 3. One of the ends is inner, another is outer
    if (
      (edge_from1.bv === Inclusion.INSIDE && edge_to1.bv === Inclusion.OUTSIDE) ||
      (edge_from1.bv === Inclusion.OUTSIDE && edge_to1.bv === Inclusion.INSIDE)
    ) {
      let edge_tmp = edge_from1
      // Find missing intersection point
      while (edge_tmp != edge_to1) {
        if (edge_tmp.bvStart === edge_from1.bv && edge_tmp.bvEnd === edge_to1.bv) {
          let [dist, segment] = edge_tmp.shape.distanceTo(poly2) as [number, Segment]
          if (dist < 10 * Utils.getTolerance()) {
            // it should be very close
            // let pt = edge_tmp.end;
            // add to the list of intersections of poly1
            addToIntPoints(edge_tmp, segment.start, int_points1)

            // split edge_tmp in poly1 if need
            let int_point1 = int_points1[int_points1.length - 1]
            if (int_point1.is_vertex & START_VERTEX) {
              // nothing to split
              int_point1.edge_after = edge_tmp
              int_point1.edge_before = edge_tmp.prev
              edge_tmp.bvStart = Inclusion.BOUNDARY
              edge_tmp.bv = undefined
              edge_tmp.setInclusion(poly2)
            } else if (int_point1.is_vertex & END_VERTEX) {
              // nothing to split
              int_point1.edge_after = edge_tmp.next
              edge_tmp.bvEnd = Inclusion.BOUNDARY
              edge_tmp.bv = undefined
              edge_tmp.setInclusion(poly2)
            } else {
              // split edge here
              let newEdge1 = poly2.addVertex(int_point1.pt, edge_tmp)
              int_point1.edge_before = newEdge1
              int_point1.edge_after = newEdge1.next

              newEdge1.setInclusion(poly2)

              newEdge1.next.bvStart = Inclusion.BOUNDARY
              newEdge1.next.bvEnd = undefined
              newEdge1.next.bv = undefined
              newEdge1.next.setInclusion(poly2)
            }

            // add to the list of intersections of poly2
            let edge2 = poly2.findEdgeByPoint(segment.end)
            addToIntPoints(edge2, segment.end, int_points2)
            // split edge2 in poly2 if need
            let int_point2 = int_points2[int_points2.length - 1]
            if (int_point2.is_vertex & START_VERTEX) {
              // nothing to split
              int_point2.edge_after = edge2
              int_point2.edge_before = edge2.prev
            } else if (int_point2.is_vertex & END_VERTEX) {
              // nothing to split
              int_point2.edge_after = edge2.next
            } else {
              // split edge here
              // first locate int_points that may refer to edge2 as edge.after
              // let int_point2_edge_before = int_points2.find( int_point => int_point.edge_before === edge2)
              let int_point2_edge_after = int_points2.find((int_point) => int_point.edge_after === edge2)

              let newEdge2 = poly2.addVertex(int_point2.pt, edge2)
              int_point2.edge_before = newEdge2
              int_point2.edge_after = newEdge2.next

              if (int_point2_edge_after) int_point2_edge_after.edge_after = newEdge2

              newEdge2.bvStart = undefined
              newEdge2.bvEnd = Inclusion.BOUNDARY
              newEdge2.bv = undefined
              newEdge2.setInclusion(poly1)

              newEdge2.next.bvStart = Inclusion.BOUNDARY
              newEdge2.next.bvEnd = undefined
              newEdge2.next.bv = undefined
              newEdge2.next.setInclusion(poly1)
            }

            sortIntersections(intersections)

            iterate_more = true
            break
          }
        }
        edge_tmp = edge_tmp.next
      }

      // we changed intersections inside loop, have to exit and repair again
      if (iterate_more) break

      throw Errors.UNRESOLVED_BOUNDARY_CONFLICT
    }
  }

  return iterate_more
}

export function removeNotRelevantChains(
  polygon: Polygon,
  op: BooleanOp,
  int_points: Intersection[],
  is_res_polygon: boolean,
) {
  if (!int_points) return
  let cur_face = undefined
  let first_int_point_in_face_num = undefined
  let int_point_current: Intersection
  let int_point_next: Intersection

  for (let i = 0; i < int_points.length; i++) {
    int_point_current = int_points[i]

    if (int_point_current.face !== cur_face) {
      // next face started
      first_int_point_in_face_num = i
      cur_face = int_point_current.face
    }

    if (cur_face.isEmpty())
      // ??
      continue

    // Get next int point from the same face that current

    // Count how many duplicated points with same <x,y> in "points from" pool ?
    let int_points_from_pull_start = i
    let int_points_from_pull_num = intPointsPoolCount(int_points, i, cur_face)
    let next_int_point_num
    if (
      int_points_from_pull_start + int_points_from_pull_num < int_points.length &&
      int_points[int_points_from_pull_start + int_points_from_pull_num].face === int_point_current.face
    ) {
      next_int_point_num = int_points_from_pull_start + int_points_from_pull_num
    } else {
      // get first point from the same face
      next_int_point_num = first_int_point_in_face_num
    }
    int_point_next = int_points[next_int_point_num]

    /* Count how many duplicated points with same <x,y> in "points to" pull ? */
    let int_points_to_pull_start = next_int_point_num
    let int_points_to_pull_num = intPointsPoolCount(int_points, int_points_to_pull_start, cur_face)

    let edge_from = int_point_current.edge_after
    let edge_to = int_point_next.edge_before

    if (
      (edge_from.bv === Inclusion.INSIDE && edge_to.bv === Inclusion.INSIDE && op === BooleanOp.UNION) ||
      (edge_from.bv === Inclusion.OUTSIDE && edge_to.bv === Inclusion.OUTSIDE && op === BooleanOp.INTERSECT) ||
      ((edge_from.bv === Inclusion.OUTSIDE || edge_to.bv === Inclusion.OUTSIDE) && op === BooleanOp.SUBTRACT && !is_res_polygon) ||
      ((edge_from.bv === Inclusion.INSIDE || edge_to.bv === Inclusion.INSIDE) && op === BooleanOp.SUBTRACT && is_res_polygon) ||
      (edge_from.bv === Inclusion.BOUNDARY && edge_to.bv === Inclusion.BOUNDARY && edge_from.overlap & Overlap.SAME && is_res_polygon) ||
      (edge_from.bv === Inclusion.BOUNDARY && edge_to.bv === Inclusion.BOUNDARY && edge_from.overlap & Overlap.OPPOSITE)
    ) {
      polygon.removeChain(cur_face, edge_from, edge_to)

      /* update all points in "points from" pull */
      for (let k = int_points_from_pull_start; k < int_points_from_pull_start + int_points_from_pull_num; k++) {
        int_points[k].edge_after = undefined
      }

      /* update all points in "points to" pull */
      for (let k = int_points_to_pull_start; k < int_points_to_pull_start + int_points_to_pull_num; k++) {
        int_points[k].edge_before = undefined
      }
    }

    /* skip to the last point in "points from" group */
    i += int_points_from_pull_num - 1
  }
}

function copyWrkToRes(res_polygon: Polygon, wrk_polygon: Polygon, op: BooleanOp, int_points: Intersection[]) {
  for (let face of wrk_polygon.faces) {
    for (let edge of face) {
      res_polygon.edges.add(edge)
    }
    // If union - add face from wrk_polygon that is not intersected with res_polygon
    if (
      /*(op === BooleanOp.UNION || op == BooleanOp.SUBTRACT) &&*/
      int_points.find((ip) => ip.face === face) === undefined
    ) {
      res_polygon.addFace(face.first, face.last)
    }
  }
}

function swapLinks(res_polygon: Polygon, wrk_polygon: Polygon, intersections: Intersections) {
  if (intersections.int_points1.length === 0) return

  for (let i = 0; i < intersections.int_points1.length; i++) {
    let int_point1 = intersections.int_points1[i]
    let int_point2 = intersections.int_points2[i]

    // Simple case - find continuation on the other polygon

    // Process edge from res_polygon
    if (int_point1.edge_before !== undefined && int_point1.edge_after === undefined) {
      // swap need
      if (int_point2.edge_before === undefined && int_point2.edge_after !== undefined) {
        // simple case
        // Connect edges
        int_point1.edge_before.next = int_point2.edge_after
        int_point2.edge_after.prev = int_point1.edge_before

        // Fill in missed links in intersection points
        int_point1.edge_after = int_point2.edge_after
        int_point2.edge_before = int_point1.edge_before
      }
    }
    // Process edge from wrk_polygon
    if (int_point2.edge_before !== undefined && int_point2.edge_after === undefined) {
      // swap need
      if (int_point1.edge_before === undefined && int_point1.edge_after !== undefined) {
        // simple case
        // Connect edges
        int_point2.edge_before.next = int_point1.edge_after
        int_point1.edge_after.prev = int_point2.edge_before

        // Complete missed links
        int_point2.edge_after = int_point1.edge_after
        int_point1.edge_before = int_point2.edge_before
      }
    }

    // Continuation not found - complex case
    // Continuation will be found on the same polygon.
    // It happens when intersection point is actually touching point
    // Polygon1
    if (int_point1.edge_before !== undefined && int_point1.edge_after === undefined) {
      // still swap need
      for (let int_point of intersections.int_points1_sorted) {
        if (int_point === int_point1) continue // skip same
        if (int_point.edge_before === undefined && int_point.edge_after !== undefined) {
          if (int_point.pt.equalTo(int_point1.pt)) {
            // Connect edges
            int_point1.edge_before.next = int_point.edge_after
            int_point.edge_after.prev = int_point1.edge_before

            // Complete missed links
            int_point1.edge_after = int_point.edge_after
            int_point.edge_before = int_point1.edge_before
          }
        }
      }
    }
    // Polygon2
    if (int_point2.edge_before !== undefined && int_point2.edge_after === undefined) {
      // still swap need
      for (let int_point of intersections.int_points2_sorted) {
        if (int_point === int_point2) continue // skip same
        if (int_point.edge_before === undefined && int_point.edge_after !== undefined) {
          if (int_point.pt.equalTo(int_point2.pt)) {
            // Connect edges
            int_point2.edge_before.next = int_point.edge_after
            int_point.edge_after.prev = int_point2.edge_before

            // Complete missed links
            int_point2.edge_after = int_point.edge_after
            int_point.edge_before = int_point2.edge_before
          }
        }
      }
    }
  }
  // Sanity check that no dead ends left
}

export function removeOldFaces(polygon: Polygon, int_points: Intersection[]) {
  for (let int_point of int_points) {
    polygon.faces.delete(int_point.face)
    int_point.face = undefined
    if (int_point.edge_before) int_point.edge_before.face = undefined
    if (int_point.edge_after) int_point.edge_after.face = undefined
  }
}

export function restoreFaces(polygon: Polygon, int_points: Intersection[], other_int_points: Intersection[]) {
  // For each intersection point - create new face
  for (let int_point of int_points) {
    if (int_point.edge_before === undefined || int_point.edge_after === undefined)
      // completely deleted
      continue
    if (int_point.face)
      // already restored
      continue

    if (int_point.edge_after.face || int_point.edge_before.face)
      // Face already created. Possible case in duplicated intersection points
      continue

    let first = int_point.edge_after // face start
    let last = int_point.edge_before // face end;

    LinkedList.testInfiniteLoop(first) // check and throw error if infinite loop found

    let face = polygon.addFace(first, last)

    // Mark intersection points from the newly create face
    // to avoid multiple creation of the same face
    // Face was assigned to each edge of new face in addFace function
    for (let int_point_tmp of int_points) {
      if (
        int_point_tmp.edge_before &&
        int_point_tmp.edge_after &&
        int_point_tmp.edge_before.face === face &&
        int_point_tmp.edge_after.face === face
      ) {
        int_point_tmp.face = face
      }
    }
    // Mark other intersection points as well
    for (let int_point_tmp of other_int_points) {
      if (
        int_point_tmp.edge_before &&
        int_point_tmp.edge_after &&
        int_point_tmp.edge_before.face === face &&
        int_point_tmp.edge_after.face === face
      ) {
        int_point_tmp.face = face
      }
    }
  }
}

function removeNotRelevantNotIntersectedFaces(polygon: Polygon, notIntersectedFaces: Face[], op: BooleanOp, is_res_polygon: boolean) {
  for (let face of notIntersectedFaces) {
    let rel = face.first.bv
    if (
      (op === BooleanOp.UNION && rel === Inclusion.INSIDE) ||
      (op === BooleanOp.SUBTRACT && rel === Inclusion.INSIDE && is_res_polygon) ||
      (op === BooleanOp.SUBTRACT && rel === Inclusion.OUTSIDE && !is_res_polygon) ||
      (op === BooleanOp.INTERSECT && rel === Inclusion.OUTSIDE)
    ) {
      polygon.deleteFace(face)
    }
  }
}

function mergeRelevantNotIntersectedFaces(res_polygon: Polygon, wrk_polygon: Polygon) {
  // All not relevant faces should be already deleted from wrk_polygon
  for (let face of wrk_polygon.faces) {
    res_polygon.addFace(face)
  }
}
