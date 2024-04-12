import * as Utils from '../utils/utils'
import * as Intersection from '../algorithms/intersection'
import * as g from '../classes'
import { PlanarSet } from '../data_structures/PlanarSet'
import { IntervalTree } from '../data_structures/interval-tree'

export function reverse(result: [number, g.Segment]): [number, g.Segment] {
  result[1] = result[1].reverse()
  return result
}

/**
 * Calculate distance and shortest segment between points
 */
export function point2point(a: g.Point, b: g.Point): [number, g.Segment] {
  return a.distanceTo(b)
}

/**
 * Calculate distance and shortest segment between point and line
 */
export function point2line(pt: g.Point, line: g.Line): [number, g.Segment] {
  let closest_point = pt.projectionOn(line)
  let vec = new g.Vector(pt, closest_point)
  return [vec.length, new g.Segment(pt, closest_point)]
}

/**
 * Calculate distance and shortest segment between point and circle
 */
export function point2circle(pt: g.Point, circle: g.Circle): [number, g.Segment] {
  let [dist2center, shortest_dist] = pt.distanceTo(circle.center)
  if (Utils.EQ_0(dist2center)) {
    return [circle.r, new g.Segment(pt, circle.toArc().start)]
  } else {
    let dist = Math.abs(dist2center - circle.r)
    let v = new g.Vector(circle.pc, pt).normalize().multiply(circle.r)
    let closest_point = circle.pc.translate(v)
    return [dist, new g.Segment(pt, closest_point)]
  }
}

/**
 * Calculate distance and shortest segment between point and segment
 */
export function point2segment(pt: g.Point, segment: g.Segment): [number, g.Segment] {
  /* Degenerated case of zero-length segment */
  if (segment.start.equalTo(segment.end)) {
    return point2point(pt, segment.start)
  }

  let v_seg = new g.Vector(segment.start, segment.end)
  let v_ps2pt = new g.Vector(segment.start, pt)
  let v_pe2pt = new g.Vector(segment.end, pt)
  let start_sp = v_seg.dot(v_ps2pt)
  /* dot product v_seg * v_ps2pt */
  let end_sp = -v_seg.dot(v_pe2pt)
  /* minus dot product v_seg * v_pe2pt */

  let dist
  let closest_point
  if (Utils.GE(start_sp, 0) && Utils.GE(end_sp, 0)) {
    /* point inside segment scope */
    let v_unit = segment.tangentInStart() // new g.Vector(v_seg.x / this.length, v_seg.y / this.length);
    /* unit vector ||v_unit|| = 1 */
    dist = Math.abs(v_unit.cross(v_ps2pt))
    /* dist = abs(v_unit x v_ps2pt) */
    closest_point = segment.start.translate(v_unit.multiply(v_unit.dot(v_ps2pt)))
    return [dist, new g.Segment(pt, closest_point)]
  } else if (start_sp < 0) {
    /* point is out of scope closer to start */
    return pt.distanceTo(segment.start)
  } else {
    /* point is out of scope closer to end */
    return pt.distanceTo(segment.end)
  }
}

/**
 * Calculate distance and shortest segment between point and arc
 */
export function point2arc(pt: g.Point, arc: g.Arc): [number, g.Segment] {
  let circle = new g.Circle(arc.pc, arc.r)
  let dist_and_segment = []
  let dist, shortest_segment
  ;[dist, shortest_segment] = point2circle(pt, circle)
  if (shortest_segment.end.on(arc)) {
    dist_and_segment.push(point2circle(pt, circle))
  }
  dist_and_segment.push(point2point(pt, arc.start))
  dist_and_segment.push(point2point(pt, arc.end))

  sort(dist_and_segment)

  return dist_and_segment[0]
}

/**
 * Calculate distance and shortest segment between segment and point
 */
export function segment2point(segment: g.Segment, point: g.Point): [number, g.Segment] {
  const result = point2segment(point, segment)
  result[1] = result[1].reverse()
  return result
}

/**
 * Calculate distance and shortest segment between segment and line
 */
export function segment2line(seg: g.Segment, line: g.Line): [number, g.Segment] {
  let ip = seg.intersect(line)
  if (ip.length > 0) {
    return [0, new g.Segment(ip[0], ip[0])] // distance = 0, closest point is the first point
  }
  let dist_and_segment = []
  dist_and_segment.push(point2line(seg.start, line))
  dist_and_segment.push(point2line(seg.end, line))

  sort(dist_and_segment)
  return dist_and_segment[0]
}

/**
 * Calculate distance and shortest segment between two segments
 * @param seg1
 * @param seg2
 * @returns {Number | Segment} - distance and shortest segment
 */
export function segment2segment(seg1, seg2): [number, g.Segment] {
  let ip = Intersection.intersectSegment2Segment(seg1, seg2)
  if (ip.length > 0) {
    return [0, new g.Segment(ip[0], ip[0])] // distance = 0, closest point is the first point
  }

  // Seg1 and seg2 not intersected
  let dist_and_segment = []
  let dist_tmp, shortest_segment_tmp
  ;[dist_tmp, shortest_segment_tmp] = point2segment(seg2.start, seg1)
  dist_and_segment.push([dist_tmp, shortest_segment_tmp.reverse()])
  ;[dist_tmp, shortest_segment_tmp] = point2segment(seg2.end, seg1)
  dist_and_segment.push([dist_tmp, shortest_segment_tmp.reverse()])
  dist_and_segment.push(point2segment(seg1.start, seg2))
  dist_and_segment.push(point2segment(seg1.end, seg2))

  sort(dist_and_segment)
  return dist_and_segment[0]
}

/**
 * Calculate distance and shortest segment between segment and circle
 * @param seg
 * @param circle
 * @returns {Number | Segment} - distance and shortest segment
 */
export function segment2circle(seg: g.Segment, circle: g.Circle): [number, g.Segment] {
  /* Case 1 Segment and circle intersected. Return the first point and zero distance */
  let ip = seg.intersect(circle)
  if (ip.length > 0) {
    return [0, new g.Segment(ip[0], ip[0])]
  }

  // No intersection between segment and circle

  /* Case 2. Distance to projection of center point to line bigger than radius
   * And projection point belong to segment
   * Then measure again distance from projection to circle and return it */
  let line = new g.Line(seg.start, seg.end)
  let [dist, shortest_segment] = point2line(circle.center, line)
  if (Utils.GE(dist, circle.r) && shortest_segment.end.on(seg)) {
    return point2circle(shortest_segment.end, circle)
  } else {
  /* Case 3. Otherwise closest point is one of the end points of the segment */
    let [dist_from_start, shortest_segment_from_start] = point2circle(seg.start, circle)
    let [dist_from_end, shortest_segment_from_end] = point2circle(seg.end, circle)
    return Utils.LT(dist_from_start, dist_from_end)
      ? [dist_from_start, shortest_segment_from_start]
      : [dist_from_end, shortest_segment_from_end]
  }
}

/**
 * Calculate distance and shortest segment between segment and arc
 * @param seg
 * @param arc
 * @returns {Number | Segment} - distance and shortest segment
 */
export function segment2arc(seg, arc): [number, g.Segment] {
  /* Case 1 Segment and arc intersected. Return the first point and zero distance */
  let ip = seg.intersect(arc)
  if (ip.length > 0) {
    return [0, new g.Segment(ip[0], ip[0])]
  }

  // No intersection between segment and arc
  let line = new g.Line(seg.start, seg.end)
  let circle = new g.Circle(arc.pc, arc.r)

  /* Case 2. Distance to projection of center point to line bigger than radius AND
   * projection point belongs to segment AND
   * distance from projection point to circle belongs to arc  =>
   * return this distance from projection to circle */
  let [dist_from_center, shortest_segment_from_center] = point2line(circle.center, line)
  if (Utils.GE(dist_from_center, circle.r) && shortest_segment_from_center.end.on(seg)) {
    let [dist_from_projection, shortest_segment_from_projection] = point2circle(
      shortest_segment_from_center.end,
      circle,
    )
    if (shortest_segment_from_projection.end.on(arc)) {
      return [dist_from_projection, shortest_segment_from_projection]
    }
  }
  /* Case 3. Otherwise closest point is one of the end points of the segment */
  let dist_and_segment = []
  dist_and_segment.push(point2arc(seg.start, arc))
  dist_and_segment.push(point2arc(seg.end, arc))

  let dist_tmp, segment_tmp
  ;[dist_tmp, segment_tmp] = point2segment(arc.start, seg)
  dist_and_segment.push([dist_tmp, segment_tmp.reverse()])

  ;[dist_tmp, segment_tmp] = point2segment(arc.end, seg)
  dist_and_segment.push([dist_tmp, segment_tmp.reverse()])

  sort(dist_and_segment)
  return dist_and_segment[0]
}

/**
 * Calculate distance and shortest segment between two circles
 * @param circle1
 * @param circle2
 * @returns {Number | Segment} - distance and shortest segment
 */
export function circle2circle(circle1, circle2): [number, g.Segment] {
  let ip = circle1.intersect(circle2)
  if (ip.length > 0) {
    return [0, new g.Segment(ip[0], ip[0])]
  }

  // Case 1. Concentric circles. Convert to arcs and take distance between two arc starts
  if (circle1.center.equalTo(circle2.center)) {
    let arc1 = circle1.toArc()
    let arc2 = circle2.toArc()
    return point2point(arc1.start, arc2.start)
  } else {
    // Case 2. Not concentric circles
    let line = new g.Line(circle1.center, circle2.center)
    let ip1 = line.intersect(circle1)
    let ip2 = line.intersect(circle2)

    let dist_and_segment = []

    dist_and_segment.push(point2point(ip1[0], ip2[0]))
    dist_and_segment.push(point2point(ip1[0], ip2[1]))
    dist_and_segment.push(point2point(ip1[1], ip2[0]))
    dist_and_segment.push(point2point(ip1[1], ip2[1]))

    sort(dist_and_segment)
    return dist_and_segment[0]
  }
}

/**
 * Calculate distance and shortest segment between two circles
 * @param circle
 * @param line
 * @returns {Number | Segment} - distance and shortest segment
 */
export function circle2line(circle, line): [number, g.Segment] {
  let ip = circle.intersect(line)
  if (ip.length > 0) {
    return [0, new g.Segment(ip[0], ip[0])]
  }

  let [dist_from_center, shortest_segment_from_center] = point2line(circle.center, line)
  let [dist, shortest_segment] = point2circle(shortest_segment_from_center.end, circle)
  shortest_segment = shortest_segment.reverse()
  return [dist, shortest_segment]
}

/**
 * Calculate distance and shortest segment between an arc and a point
 */
export function arc2point(arc: g.Arc, point: g.Point) {
  return reverse(point2arc(point, arc))
}

/**
 * Calculate distance and shortest segment between an arc and a point
 */
export function arc2segment(arc: g.Arc, segment: g.Segment) {
  return reverse(segment2arc(segment, arc))
}

/**
 * Calculate distance and shortest segment between arc and line
 * @param arc
 * @param line
 * @returns {Number | Segment} - distance and shortest segment
 */
export function arc2line(arc, line): [number, g.Segment] {
  /* Case 1 Line and arc intersected. Return the first point and zero distance */
  let ip = line.intersect(arc)
  if (ip.length > 0) {
    return [0, new g.Segment(ip[0], ip[0])]
  }

  let circle = new g.Circle(arc.center, arc.r)

  /* Case 2. Distance to projection of center point to line bigger than radius AND
   * projection point belongs to segment AND
   * distance from projection point to circle belongs to arc  =>
   * return this distance from projection to circle */
  let [dist_from_center, shortest_segment_from_center] = point2line(circle.center, line)
  if (Utils.GE(dist_from_center, circle.r)) {
    let [dist_from_projection, shortest_segment_from_projection] = point2circle(
      shortest_segment_from_center.end,
      circle,
    )
    if (shortest_segment_from_projection.end.on(arc)) {
      return [dist_from_projection, shortest_segment_from_projection]
    }
  } else {
    let dist_and_segment = []
    dist_and_segment.push(point2line(arc.start, line))
    dist_and_segment.push(point2line(arc.end, line))

    sort(dist_and_segment)
    return dist_and_segment[0]
  }
}

/**
 * Calculate distance and shortest segment between arc and circle
 * @param arc
 * @param circle2
 * @returns {Number | Segment} - distance and shortest segment
 */
export function arc2circle(arc, circle2): [number, g.Segment] {
  let ip = arc.intersect(circle2)
  if (ip.length > 0) {
    return [0, new g.Segment(ip[0], ip[0])]
  }

  let circle1 = new g.Circle(arc.center, arc.r)

  let [dist, shortest_segment] = circle2circle(circle1, circle2)
  if (shortest_segment.start.on(arc)) {
    return [dist, shortest_segment]
  } else {
    let dist_and_segment = []

    dist_and_segment.push(point2circle(arc.start, circle2))
    dist_and_segment.push(point2circle(arc.end, circle2))

    sort(dist_and_segment)

    return dist_and_segment[0]
  }
}

/**
 * Calculate distance and shortest segment between two arcs
 * @param arc1
 * @param arc2
 * @returns {Number | Segment} - distance and shortest segment
 */
export function arc2arc(arc1, arc2): [number, g.Segment] {
  let ip = arc1.intersect(arc2)
  if (ip.length > 0) {
    return [0, new g.Segment(ip[0], ip[0])]
  }

  let circle1 = new g.Circle(arc1.center, arc1.r)
  let circle2 = new g.Circle(arc2.center, arc2.r)

  let [dist, shortest_segment] = circle2circle(circle1, circle2)
  if (shortest_segment.start.on(arc1) && shortest_segment.end.on(arc2)) {
    return [dist, shortest_segment]
  } else {
    let dist_and_segment = []

    let dist_tmp, segment_tmp

    ;[dist_tmp, segment_tmp] = point2arc(arc1.start, arc2)
    if (segment_tmp.end.on(arc2)) {
      dist_and_segment.push([dist_tmp, segment_tmp])
    }

    ;[dist_tmp, segment_tmp] = point2arc(arc1.end, arc2)
    if (segment_tmp.end.on(arc2)) {
      dist_and_segment.push([dist_tmp, segment_tmp])
    }

    ;[dist_tmp, segment_tmp] = point2arc(arc2.start, arc1)
    if (segment_tmp.end.on(arc1)) {
      dist_and_segment.push([dist_tmp, segment_tmp.reverse()])
    }

    ;[dist_tmp, segment_tmp] = point2arc(arc2.end, arc1)
    if (segment_tmp.end.on(arc1)) {
      dist_and_segment.push([dist_tmp, segment_tmp.reverse()])
    }

    ;[dist_tmp, segment_tmp] = point2point(arc1.start, arc2.start)
    dist_and_segment.push([dist_tmp, segment_tmp])

    ;[dist_tmp, segment_tmp] = point2point(arc1.start, arc2.end)
    dist_and_segment.push([dist_tmp, segment_tmp])

    ;[dist_tmp, segment_tmp] = point2point(arc1.end, arc2.start)
    dist_and_segment.push([dist_tmp, segment_tmp])

    ;[dist_tmp, segment_tmp] = point2point(arc1.end, arc2.end)
    dist_and_segment.push([dist_tmp, segment_tmp])

    sort(dist_and_segment)

    return dist_and_segment[0]
  }
}

/**
 * Calculate distance and shortest segment between point and polygon
 * @param point
 * @param polygon
 * @returns {Number | Segment} - distance and shortest segment
 */
export function point2polygon(point, polygon): [number, g.Segment] {
  let min_dist_and_segment = [Number.POSITIVE_INFINITY, new g.Segment()] as [number, g.Segment]
  for (let edge of polygon.edges) {
    let [dist, shortest_segment] =
      edge.shape instanceof g.Segment ? point2segment(point, edge.shape) : point2arc(point, edge.shape)
    if (Utils.LT(dist, min_dist_and_segment[0])) {
      min_dist_and_segment = [dist, shortest_segment] as [number, g.Segment]
    }
  }
  return min_dist_and_segment
}

export function shape2polygon(shape, polygon): [number, g.Segment] {
  let min_dist_and_segment = [Number.POSITIVE_INFINITY, new g.Segment()] as [number, g.Segment]
  for (let edge of polygon.edges) {
    let [dist, shortest_segment] = shape.distanceTo(edge.shape)
    if (Utils.LT(dist, min_dist_and_segment[0])) {
      min_dist_and_segment = [dist, shortest_segment] as [number, g.Segment]
    }
  }
  return min_dist_and_segment
}

/**
 * Calculate distance and shortest segment between two polygons
 * @param polygon1
 * @param polygon2
 * @returns {Number | Segment} - distance and shortest segment
 */
export function polygon2polygon(polygon1, polygon2): [number, g.Segment] {
  let min_dist_and_segment = [Number.POSITIVE_INFINITY, new g.Segment()] as [number, g.Segment]
  for (let edge1 of polygon1.edges) {
    for (let edge2 of polygon2.edges) {
      let [dist, shortest_segment] = edge1.shape.distanceTo(edge2.shape)
      if (Utils.LT(dist, min_dist_and_segment[0])) {
        min_dist_and_segment = [dist, shortest_segment] as [number, g.Segment]
      }
    }
  }
  return min_dist_and_segment
}

/**
 * Returns [mindist, maxdist] array of squared minimal and maximal distance between boxes
 * Minimal distance by x is
 *    (box2.xmin - box1.xmax), if box1 is left to box2
 *    (box1.xmin - box2.xmax), if box2 is left to box1
 *    0,                       if box1 and box2 are intersected by x
 * Minimal distance by y is defined in the same way
 *
 * Maximal distance is estimated as a sum of squared dimensions of the merged box
 *
 * @param box1
 * @param box2
 */
export function box2box_minmax(box1, box2) {
  let mindist_x = Math.max(Math.max(box1.xmin - box2.xmax, 0), Math.max(box2.xmin - box1.xmax, 0))
  let mindist_y = Math.max(Math.max(box1.ymin - box2.ymax, 0), Math.max(box2.ymin - box1.ymax, 0))
  let mindist = mindist_x * mindist_x + mindist_y * mindist_y

  let box = box1.merge(box2)
  let dx = box.xmax - box.xmin
  let dy = box.ymax - box.ymin
  let maxdist = dx * dx + dy * dy

  return [mindist, maxdist] as const
}

export function minmax_tree_process_level(shape, level, min_stop, tree) {
  // Calculate minmax distance to each shape in current level
  // Insert result into the interval tree for further processing
  // update min_stop with maxdist, it will be the new stop distance
  let mindist, maxdist
  for (let node of level) {
    // [mindist, maxdist] = box2box_minmax(shape.box, node.max);
    // if (Utils.GT(mindist, min_stop))
    //     continue;

    // Estimate min-max dist to the shape stored in the node.item, using node.item.key which is shape's box
    ;[mindist, maxdist] = box2box_minmax(shape.box, node.item.key)
    if (node.item.value instanceof g.Edge) {
      tree.insert([mindist, maxdist], node.item.value.shape)
    } else {
      tree.insert([mindist, maxdist], node.item.value)
    }
    if (Utils.LT(maxdist, min_stop)) {
      min_stop = maxdist // this will be the new distance estimation
    }
  }

  if (level.length === 0) return min_stop

  // Calculate new level from left and right children of the current
  let new_level_left = level
    .map((node) => (node.left.isNil() ? undefined : node.left))
    .filter((node) => node !== undefined)
  let new_level_right = level
    .map((node) => (node.right.isNil() ? undefined : node.right))
    .filter((node) => node !== undefined)
  // Merge left and right subtrees and leave only relevant subtrees
  let new_level = [...new_level_left, ...new_level_right].filter((node) => {
    // Node subtree quick reject, node.max is a subtree box
    let [mindist, maxdist] = box2box_minmax(shape.box, node.max)
    return Utils.LE(mindist, min_stop)
  })

  min_stop = minmax_tree_process_level(shape, new_level, min_stop, tree)
  return min_stop
}

/**
 * Calculates sorted tree of [mindist, maxdist] intervals between query shape
 * and shapes of the planar set.
 * @param shape
 * @param set
 */
export function minmax_tree(shape, set, min_stop) {
  let tree = new IntervalTree()
  let level = [set.index.root]
  let squared_min_stop = min_stop < Number.POSITIVE_INFINITY ? min_stop * min_stop : Number.POSITIVE_INFINITY
  squared_min_stop = minmax_tree_process_level(shape, level, squared_min_stop, tree)
  return tree
}

export function minmax_tree_calc_distance(shape, node, min_dist_and_segment) {
  let min_dist_and_segment_new, stop
  if (node != null && !node.isNil()) {
    ;[min_dist_and_segment_new, stop] = minmax_tree_calc_distance(shape, node.left, min_dist_and_segment)

    if (stop) {
      return [min_dist_and_segment_new, stop]
    }

    if (Utils.LT(min_dist_and_segment_new[0], Math.sqrt(node.item.key.low))) {
      return [min_dist_and_segment_new, true] // stop condition
    }

    let [dist, shortest_segment] = distance(shape, node.item.value)
    // console.log(dist)
    if (Utils.LT(dist, min_dist_and_segment_new[0])) {
      min_dist_and_segment_new = [dist, shortest_segment]
    }

    ;[min_dist_and_segment_new, stop] = minmax_tree_calc_distance(shape, node.right, min_dist_and_segment_new)

    return [min_dist_and_segment_new, stop]
  }

  return [min_dist_and_segment, false]
}

/**
 * Calculates distance between shape and Planar Set of shapes
 * @param shape
 * @param {PlanarSet} set
 * @param {Number} min_stop
 */
export function shape2planarSet(shape, set, min_stop = Number.POSITIVE_INFINITY) {
  let min_dist_and_segment = [min_stop, new g.Segment()] as [number, g.Segment]
  let stop = false
  if (set instanceof PlanarSet) {
    let tree = minmax_tree(shape, set, min_stop)
    ;[min_dist_and_segment, stop] = minmax_tree_calc_distance(shape, tree.root, min_dist_and_segment)
  }
  return min_dist_and_segment
}

export function sort(dist_and_segment) {
  dist_and_segment.sort((d1, d2) => {
    if (Utils.LT(d1[0], d2[0])) {
      return -1
    }
    if (Utils.GT(d1[0], d2[0])) {
      return 1
    }
    return 0
  })
}

export function distance(shape1, shape2) {
  return shape1.distanceTo(shape2)
}

export function pythagore(width: number, height: number) {
  return Math.sqrt(width * width + height * height)
}
