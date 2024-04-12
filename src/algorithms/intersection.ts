import * as Utils from '../utils/utils'
import * as g from '../classes'

export function intersectLine2Line(line1: g.Line, line2: g.Line): g.Point[] {
  let ip = []

  let [A1, B1, C1] = line1.standard
  let [A2, B2, C2] = line2.standard

  /* Cramer's rule */
  let det = A1 * B2 - B1 * A2
  let detX = C1 * B2 - B1 * C2
  let detY = A1 * C2 - C1 * A2

  if (!Utils.EQ_0(det)) {
    let x: number, y: number

    if (B1 === 0) {
      // vertical line x  = C1/A1, where A1 == +1 or -1
      x = C1 / A1
      y = detY / det
    } else if (B2 === 0) {
      // vertical line x = C2/A2, where A2 = +1 or -1
      x = C2 / A2
      y = detY / det
    } else if (A1 === 0) {
      // horizontal line y = C1/B1, where B1 = +1 or -1
      x = detX / det
      y = C1 / B1
    } else if (A2 === 0) {
      // horizontal line y = C2/B2, where B2 = +1 or -1
      x = detX / det
      y = C2 / B2
    } else {
      x = detX / det
      y = detY / det
    }

    ip.push(new g.Point(x, y))
  }

  return ip
}

export function intersectLine2Circle(line: g.Line, circle: g.Circle): g.Point[] {
  let ip = []
  let prj = circle.pc.projectionOn(line) // projection of circle center on a line
  let dist = circle.pc.distanceTo(prj)[0] // distance from circle center to projection

  if (Utils.EQ(dist, circle.r)) {
    // line tangent to circle - return single intersection point
    ip.push(prj)
  } else if (Utils.LT(dist, circle.r)) {
    // return two intersection points
    let delta = Math.sqrt(circle.r * circle.r - dist * dist)
    let v_trans: g.Vector, pt: g.Point

    v_trans = line.norm.rotate90CW().multiply(delta)
    pt = prj.translate(v_trans)
    ip.push(pt)

    v_trans = line.norm.rotate90CCW().multiply(delta)
    pt = prj.translate(v_trans)
    ip.push(pt)
  }
  return ip
}

export function intersectLine2Box(line: g.Line, box: g.Box): g.Point[] {
  let ips = []
  for (let seg of box.toSegments()) {
    let ips_tmp = intersectSegment2Line(seg, line)
    for (let pt of ips_tmp) {
      if (!ptInIntPoints(pt, ips)) {
        ips.push(pt)
      }
    }
  }
  return ips
}

export function intersectLine2Arc(line: g.Line, arc: g.Arc): g.Point[] {
  let ip = []

  if (intersectLine2Box(line, arc.box).length === 0) {
    return ip
  }

  let circle = new g.Circle(arc.pc, arc.r)
  let ip_tmp = intersectLine2Circle(line, circle)
  for (let pt of ip_tmp) {
    if (arc.contains(pt)) {
      ip.push(pt)
    }
  }

  return ip
}

export function intersectSegment2Line(seg: g.Segment, line: g.Line): g.Point[] {
  let ip = []

  // Boundary cases
  if (seg.start.on(line)) {
    ip.push(seg.start)
  }
  // If both ends lay on line, return two intersection points
  if (seg.end.on(line) && !seg.isZeroLength()) {
    ip.push(seg.end)
  }

  if (ip.length > 0) {
    return ip // done, intersection found
  }

  // If zero-length segment and nothing found, return no intersections
  if (seg.isZeroLength()) {
    return ip
  }

  // Not a boundary case, check if both points are on the same side and
  // hence there is no intersection
  if ((seg.start.leftTo(line) && seg.end.leftTo(line)) || (!seg.start.leftTo(line) && !seg.end.leftTo(line))) {
    return ip
  }

  // Calculate intersection between lines
  let line1 = new g.Line(seg.start, seg.end)
  return intersectLine2Line(line1, line)
}

export function intersectSegment2Segment(seg1: g.Segment, seg2: g.Segment): g.Point[] {
  let ip = []

  // quick reject
  if (!seg1.box.intersect(seg2.box)) {
    return ip
  }

  // Special case of seg1 zero length
  if (seg1.isZeroLength()) {
    if (seg1.start.on(seg2)) {
      ip.push(seg1.start)
    }
    return ip
  }

  // Special case of seg2 zero length
  if (seg2.isZeroLength()) {
    if (seg2.start.on(seg1)) {
      ip.push(seg2.start)
    }
    return ip
  }

  // Neither seg1 nor seg2 is zero length
  let line1 = new g.Line(seg1.start, seg1.end)
  let line2 = new g.Line(seg2.start, seg2.end)

  // Check overlapping between segments in case of incidence
  // If segments touching, add one point. If overlapping, add two points
  if (line1.incidentTo(line2)) {
    if (seg1.start.on(seg2)) {
      ip.push(seg1.start)
    }
    if (seg1.end.on(seg2)) {
      ip.push(seg1.end)
    }
    if (seg2.start.on(seg1) && !seg2.start.equalTo(seg1.start) && !seg2.start.equalTo(seg1.end)) {
      ip.push(seg2.start)
    }
    if (seg2.end.on(seg1) && !seg2.end.equalTo(seg1.start) && !seg2.end.equalTo(seg1.end)) {
      ip.push(seg2.end)
    }
  } else {
    /* not incident - parallel or intersect */
    // Calculate intersection between lines
    let new_ip = intersectLine2Line(line1, line2)
    if (new_ip.length > 0) {
      if (isPointInSegmentBox(new_ip[0], seg1) && isPointInSegmentBox(new_ip[0], seg2)) {
        ip.push(new_ip[0])
      }
    }
  }
  return ip
}

function isPointInSegmentBox(point: g.Point, segment: g.Segment) {
  const box = segment.box
  return (
    Utils.LE(point.x, box.xmax) &&
    Utils.GE(point.x, box.xmin) &&
    Utils.LE(point.y, box.ymax) &&
    Utils.GE(point.y, box.ymin)
  )
}

export function intersectSegment2Circle(segment: g.Segment, circle: g.Circle): g.Point[] {
  let ips = []

  if (!segment.box.intersect(circle.box)) {
    return ips
  }

  // Special case of zero length segment
  if (segment.isZeroLength()) {
    let [dist, _] = segment.start.distanceTo(circle.pc)
    if (Utils.EQ(dist, circle.r)) {
      ips.push(segment.start)
    }
    return ips
  }

  // Non zero-length segment
  let line = new g.Line(segment.start, segment.end)

  let ips_tmp = intersectLine2Circle(line, circle)

  for (let ip of ips_tmp) {
    if (ip.on(segment)) {
      ips.push(ip)
    }
  }

  return ips
}

export function intersectSegment2Arc(segment: g.Segment, arc: g.Arc): g.Point[] {
  let ip = []

  if (!segment.box.intersect(arc.box)) {
    return ip
  }

  // Special case of zero-length segment
  if (segment.isZeroLength()) {
    if (segment.start.on(arc)) {
      ip.push(segment.start)
    }
    return ip
  }

  // Non-zero length segment
  let line = new g.Line(segment.start, segment.end)
  let circle = new g.Circle(arc.pc, arc.r)

  let ip_tmp = intersectLine2Circle(line, circle)

  for (let pt of ip_tmp) {
    if (pt.on(segment) && pt.on(arc)) {
      ip.push(pt)
    }
  }
  return ip
}

export function intersectSegment2Box(segment: g.Segment, box: g.Box): g.Point[] {
  let ips = []
  for (let seg of box.toSegments()) {
    let ips_tmp = intersectSegment2Segment(seg, segment)
    for (let ip of ips_tmp) {
      ips.push(ip)
    }
  }
  return ips
}

export function intersectCircle2Circle(circle1: g.Circle, circle2: g.Circle): g.Point[] {
  let ip = []

  if (!circle1.box.intersect(circle2.box)) {
    return ip
  }

  let vec = new g.Vector(circle1.pc, circle2.pc)

  let r1 = circle1.r
  let r2 = circle2.r

  // Degenerated circle
  if (Utils.EQ_0(r1) || Utils.EQ_0(r2)) return ip

  // In case of equal circles return one leftmost point
  if (Utils.EQ_0(vec.x) && Utils.EQ_0(vec.y) && Utils.EQ(r1, r2)) {
    ip.push(circle1.pc.translate(-r1, 0))
    return ip
  }

  let dist = circle1.pc.distanceTo(circle2.pc)[0]

  if (Utils.GT(dist, r1 + r2))
    // circles too far, no intersections
    return ip

  if (Utils.LT(dist, Math.abs(r1 - r2)))
    // one circle is contained within another, no intersections
    return ip

  // Normalize vector.
  vec.x /= dist
  vec.y /= dist

  let pt: g.Point

  // Case of touching from outside or from inside - single intersection point
  // TODO: check this specifically not sure if correct
  if (Utils.EQ(dist, r1 + r2) || Utils.EQ(dist, Math.abs(r1 - r2))) {
    pt = circle1.pc.translate(r1 * vec.x, r1 * vec.y)
    ip.push(pt)
    return ip
  }

  // Case of two intersection points

  // Distance from first center to center of common chord:
  //   a = (r1^2 - r2^2 + d^2) / 2d
  // Separate for better accuracy
  let a = (r1 * r1) / (2 * dist) - (r2 * r2) / (2 * dist) + dist / 2

  let mid_pt = circle1.pc.translate(a * vec.x, a * vec.y)
  let h = Math.sqrt(r1 * r1 - a * a)
  // let norm;

  // norm = vec.rotate90CW().multiply(h);
  pt = mid_pt.translate(vec.rotate90CW().multiply(h))
  ip.push(pt)

  // norm = vec.rotate90CCW();
  pt = mid_pt.translate(vec.rotate90CCW().multiply(h))
  ip.push(pt)

  return ip
}

export function intersectCircle2Box(circle: g.Circle, box: g.Box): g.Point[] {
  let ips = []
  for (let seg of box.toSegments()) {
    let ips_tmp = intersectSegment2Circle(seg, circle)
    for (let ip of ips_tmp) {
      ips.push(ip)
    }
  }
  return ips
}

export function intersectArc2Arc(arc1: g.Arc, arc2: g.Arc): g.Point[] {
  let ip = []

  if (!arc1.box.intersect(arc2.box)) {
    return ip
  }

  // Special case: overlapping arcs
  // May return up to 4 intersection points
  if (arc1.pc.equalTo(arc2.pc) && Utils.EQ(arc1.r, arc2.r)) {
    let pt: g.Point

    pt = arc1.start
    if (pt.on(arc2)) ip.push(pt)

    pt = arc1.end
    if (pt.on(arc2)) ip.push(pt)

    pt = arc2.start
    if (pt.on(arc1)) ip.push(pt)

    pt = arc2.end
    if (pt.on(arc1)) ip.push(pt)

    return ip
  }

  // Common case
  let circle1 = new g.Circle(arc1.pc, arc1.r)
  let circle2 = new g.Circle(arc2.pc, arc2.r)
  let ip_tmp = circle1.intersect(circle2)
  for (let pt of ip_tmp) {
    if (pt.on(arc1) && pt.on(arc2)) {
      ip.push(pt)
    }
  }
  return ip
}

export function intersectArc2Circle(arc: g.Arc, circle: g.Circle): g.Point[] {
  let ip = []

  if (!arc.box.intersect(circle.box)) {
    return ip
  }

  // Case when arc center incident to circle center
  // Return arc's end points as 2 intersection points
  if (circle.pc.equalTo(arc.pc) && Utils.EQ(circle.r, arc.r)) {
    ip.push(arc.start)
    ip.push(arc.end)
    return ip
  }

  // Common case
  let circle1 = circle
  let circle2 = new g.Circle(arc.pc, arc.r)
  let ip_tmp = intersectCircle2Circle(circle1, circle2)
  for (let pt of ip_tmp) {
    if (pt.on(arc)) {
      ip.push(pt)
    }
  }
  return ip
}

export function intersectArc2Box(arc: g.Arc, box: g.Box): g.Point[] {
  let ips = []
  for (let seg of box.toSegments()) {
    let ips_tmp = intersectSegment2Arc(seg, arc)
    for (let ip of ips_tmp) {
      ips.push(ip)
    }
  }
  return ips
}

export function intersectEdge2Segment(edge: g.Edge, segment: g.Segment): g.Point[] {
  if (edge.isSegment())
    return intersectSegment2Segment(edge.shape, segment)
  if (edge.isArc())
    return intersectSegment2Arc(segment, edge.shape)
  throw new Error('unimplemented')
}

export function intersectEdge2Arc(edge: g.Edge, arc: g.Arc): g.Point[] {
  if (edge.isSegment())
    return intersectSegment2Arc(edge.shape, arc)
  if (edge.isArc())
    return intersectArc2Arc(edge.shape, arc)
  throw new Error('unimplemented')
}

export function intersectEdge2Line(edge: g.Edge, line: g.Line): g.Point[] {
  if (edge.isSegment())
    return intersectSegment2Line(edge.shape, line)
  if (edge.isArc())
    return intersectLine2Arc(line, edge.shape)
  throw new Error('unimplemented')
}

export function intersectEdge2Circle(edge: g.Edge, circle: g.Circle): g.Point[] {
  if (edge.isSegment())
    return intersectSegment2Circle(edge.shape, circle)
  if (edge.isArc())
    return intersectArc2Circle(edge.shape, circle)
  throw new Error('unimplemented')
}

export function intersectSegment2Polygon(segment: g.Segment, polygon: g.Polygon): g.Point[] {
  let ip = []

  for (let edge of polygon.edges) {
    for (let pt of intersectEdge2Segment(edge, segment)) {
      ip.push(pt)
    }
  }

  return ip
}

export function intersectArc2Polygon(arc: g.Arc, polygon: g.Polygon): g.Point[] {
  let ip = []

  for (let edge of polygon.edges) {
    for (let pt of intersectEdge2Arc(edge, arc)) {
      ip.push(pt)
    }
  }

  return ip
}

export function intersectLine2Polygon(line: g.Line, polygon: g.Polygon): g.Point[] {
  let ip = []

  if (polygon.isEmpty()) {
    return ip
  }

  for (let edge of polygon.edges) {
    for (let pt of intersectEdge2Line(edge, line)) {
      if (!ptInIntPoints(pt, ip)) {
        ip.push(pt)
      }
    }
  }

  return line.sortPoints(ip)
}

export function intersectCircle2Polygon(circle: g.Circle, polygon: g.Polygon): g.Point[] {
  let ip = []

  if (polygon.isEmpty()) {
    return ip
  }

  for (let edge of polygon.edges) {
    for (let pt of intersectEdge2Circle(edge, circle)) {
      ip.push(pt)
    }
  }

  return ip
}

export function intersectEdge2Edge(edge1: g.Edge, edge2: g.Edge): g.Point[] {
  if (edge1.isSegment()) { return intersectEdge2Segment(edge2, edge1.shape) }
  if (edge1.isArc()) { return intersectEdge2Arc(edge2, edge1.shape) }
  throw new Error('unimplemented')
}

export function intersectEdge2Polygon(edge: g.Edge, polygon: g.Polygon) {
  let ip = [] as g.Point[]
  if (polygon.isEmpty() || !edge.shape.box.intersect(polygon.box)) {
    return ip
  }
  let resp_edges = polygon.edges.search(edge.shape.box)

  for (let resp_edge of resp_edges) {
    ip = [...ip, ...intersectEdge2Edge(edge, resp_edge)]
  }

  return ip
}

export function intersectMultiline2Polygon(multiline: g.Multiline, polygon: g.Polygon): g.Point[] {
  let ip = []

  if (polygon.isEmpty() || multiline.size === 0) {
    return ip
  }

  for (let edge of multiline) {
    ip = [...ip, ...intersectEdge2Polygon(edge, polygon)]
  }

  return ip
}

export function intersectPolygon2Polygon(polygon1: g.Polygon, polygon2: g.Polygon): g.Point[] {
  if (polygon1.isEmpty() || polygon2.isEmpty()) {
    return []
  }
  if (!polygon1.box.intersect(polygon2.box)) {
    return []
  }

  const ip = []
  for (let edge1 of polygon1.edges) {
    ip.push(...intersectEdge2Polygon(edge1, polygon2))
  }
  return ip
}

export function intersectBox2Box(box1: g.Box, box2: g.Box): g.Point[] {
  let ip = []
  for (let segment1 of box1.toSegments()) {
    for (let segment2 of box2.toSegments()) {
      for (let pt of intersectSegment2Segment(segment1, segment2)) {
        ip.push(pt)
      }
    }
  }
  return ip
}

export function intersectShape2Polygon(shape: g.Shape<any>, polygon: g.Polygon): g.Point[] {
  if (shape instanceof g.Line) {
    return intersectLine2Polygon(shape, polygon)
  } else if (shape instanceof g.Segment) {
    return intersectSegment2Polygon(shape, polygon)
  } else if (shape instanceof g.Arc) {
    return intersectArc2Polygon(shape, polygon)
  } else {
    return []
  }
}

function ptInIntPoints(new_pt: g.Point, ip: g.Point[]) {
  return ip.some((pt) => pt.equalTo(new_pt))
}

function createLineFromRay(ray: g.Ray) {
  return new g.Line(ray.start, ray.norm)
}
export function intersectRay2Segment(ray: g.Ray, segment: g.Segment): g.Point[] {
  return intersectSegment2Line(segment, createLineFromRay(ray)).filter((pt) => ray.contains(pt))
}

export function intersectRay2Arc(ray: g.Ray, arc: g.Arc): g.Point[] {
  return intersectLine2Arc(createLineFromRay(ray), arc).filter((pt) => ray.contains(pt))
}

export function intersectRay2Circle(ray: g.Ray, circle: g.Circle): g.Point[] {
  return intersectLine2Circle(createLineFromRay(ray), circle).filter((pt) => ray.contains(pt))
}

export function intersectRay2Box(ray: g.Ray, box: g.Box): g.Point[] {
  return intersectLine2Box(createLineFromRay(ray), box).filter((pt) => ray.contains(pt))
}

export function intersectRay2Line(ray: g.Ray, line: g.Line): g.Point[] {
  return intersectLine2Line(createLineFromRay(ray), line).filter((pt) => ray.contains(pt))
}

export function intersectRay2Ray(ray1: g.Ray, ray2: g.Ray): g.Point[] {
  return intersectLine2Line(createLineFromRay(ray1), createLineFromRay(ray2))
    .filter((pt) => ray1.contains(pt))
    .filter((pt) => ray2.contains(pt))
}

export function intersectRay2Polygon(ray: g.Ray, polygon: g.Polygon): g.Point[] {
  return intersectLine2Polygon(createLineFromRay(ray), polygon).filter((pt) => ray.contains(pt))
}
