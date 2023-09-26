"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreFaces = exports.removeOldFaces = exports.removeNotRelevantChains = exports.calculateIntersections = exports.outerClip = exports.innerClip = exports.intersect = exports.subtract = exports.unify = exports.BOOLEAN_SUBTRACT = exports.BOOLEAN_INTERSECT = exports.BOOLEAN_UNION = void 0;
const errors_1 = __importDefault(require("../utils/errors"));
const Utils = __importStar(require("../utils/utils"));
const Constants = __importStar(require("../utils/constants"));
const linked_list_1 = __importDefault(require("../data_structures/linked_list"));
const smart_intersections_1 = require("../data_structures/smart_intersections");
const { INSIDE, OUTSIDE, BOUNDARY, OVERLAP_SAME, OVERLAP_OPPOSITE } = Constants;
const { NOT_VERTEX, START_VERTEX, END_VERTEX } = Constants;
exports.BOOLEAN_UNION = 1;
exports.BOOLEAN_INTERSECT = 2;
exports.BOOLEAN_SUBTRACT = 3;
/**
 * Unify two polygons polygons and returns new polygon. <br/>
 * Point belongs to the resulted polygon if it belongs to the first OR to the second polygon
 * @param {Polygon} polygon1 - first operand
 * @param {Polygon} polygon2 - second operand
 * @returns {Polygon}
 */
function unify(polygon1, polygon2) {
    let [res_poly, wrk_poly] = booleanOpBinary(polygon1, polygon2, exports.BOOLEAN_UNION, true);
    return res_poly;
}
exports.unify = unify;
/**
 * Subtract second polygon from the first and returns new polygon
 * Point belongs to the resulted polygon if it belongs to the first polygon AND NOT to the second polygon
 * @param {Polygon} polygon1 - first operand
 * @param {Polygon} polygon2 - second operand
 * @returns {Polygon}
 */
function subtract(polygon1, polygon2) {
    let polygon2_tmp = polygon2.clone();
    let polygon2_reversed = polygon2_tmp.reverse();
    let [res_poly, wrk_poly] = booleanOpBinary(polygon1, polygon2_reversed, exports.BOOLEAN_SUBTRACT, true);
    return res_poly;
}
exports.subtract = subtract;
/**
 * Intersect two polygons and returns new polygon
 * Point belongs to the resulted polygon is it belongs to the first AND to the second polygon
 * @param {Polygon} polygon1 - first operand
 * @param {Polygon} polygon2 - second operand
 * @returns {Polygon}
 */
function intersect(polygon1, polygon2) {
    let [res_poly, wrk_poly] = booleanOpBinary(polygon1, polygon2, exports.BOOLEAN_INTERSECT, true);
    return res_poly;
}
exports.intersect = intersect;
/**
 * Returns boundary of intersection between two polygons as two arrays of shapes (Segments/Arcs) <br/>
 * The first array are shapes from the first polygon, the second array are shapes from the second
 * @param {Polygon} polygon1 - first operand
 * @param {Polygon} polygon2 - second operand
 * @returns {Shape[][]}
 */
function innerClip(polygon1, polygon2) {
    let [res_poly, wrk_poly] = booleanOpBinary(polygon1, polygon2, exports.BOOLEAN_INTERSECT, false);
    let clip_shapes1 = [];
    for (let face of res_poly.faces) {
        clip_shapes1 = [...clip_shapes1, ...[...face.edges].map(edge => edge.shape)];
    }
    let clip_shapes2 = [];
    for (let face of wrk_poly.faces) {
        clip_shapes2 = [...clip_shapes2, ...[...face.edges].map(edge => edge.shape)];
    }
    return [clip_shapes1, clip_shapes2];
}
exports.innerClip = innerClip;
/**
 * Returns boundary of subtraction of the second polygon from first polygon as array of shapes
 * @param {Polygon} polygon1 - first operand
 * @param {Polygon} polygon2 - second operand
 * @returns {Shape[]}
 */
function outerClip(polygon1, polygon2) {
    let [res_poly, wrk_poly] = booleanOpBinary(polygon1, polygon2, exports.BOOLEAN_SUBTRACT, false);
    let clip_shapes1 = [];
    for (let face of res_poly.faces) {
        clip_shapes1 = [...clip_shapes1, ...[...face.edges].map(edge => edge.shape)];
    }
    return clip_shapes1;
}
exports.outerClip = outerClip;
/**
 * Returns intersection points between boundaries of two polygons as two array of points <br/>
 * Points in the first array belong to first polygon, points from the second - to the second.
 * Points in each array are ordered according to the direction of the correspondent polygon
 * @param {Polygon} polygon1 - first operand
 * @param {Polygon} polygon2 - second operand
 * @returns {Point[][]}
 */
function calculateIntersections(polygon1, polygon2) {
    let res_poly = polygon1.clone();
    let wrk_poly = polygon2.clone();
    // get intersection points
    let intersections = getIntersections(res_poly, wrk_poly);
    // sort intersection points
    (0, smart_intersections_1.sortIntersections)(intersections);
    // split by intersection points
    (0, smart_intersections_1.splitByIntersections)(res_poly, intersections.int_points1_sorted);
    (0, smart_intersections_1.splitByIntersections)(wrk_poly, intersections.int_points2_sorted);
    // filter duplicated intersection points
    (0, smart_intersections_1.filterDuplicatedIntersections)(intersections);
    // sort intersection points again after filtering
    (0, smart_intersections_1.sortIntersections)(intersections);
    let ip_sorted1 = intersections.int_points1_sorted.map(int_point => int_point.pt);
    let ip_sorted2 = intersections.int_points2_sorted.map(int_point => int_point.pt);
    return [ip_sorted1, ip_sorted2];
}
exports.calculateIntersections = calculateIntersections;
function filterNotRelevantEdges(res_poly, wrk_poly, intersections, op) {
    // keep not intersected faces for further remove and merge
    let notIntersectedFacesRes = getNotIntersectedFaces(res_poly, intersections.int_points1);
    let notIntersectedFacesWrk = getNotIntersectedFaces(wrk_poly, intersections.int_points2);
    // calculate inclusion flag for not intersected faces
    calcInclusionForNotIntersectedFaces(notIntersectedFacesRes, wrk_poly);
    calcInclusionForNotIntersectedFaces(notIntersectedFacesWrk, res_poly);
    // initialize inclusion flags for edges incident to intersections
    (0, smart_intersections_1.initializeInclusionFlags)(intersections.int_points1);
    (0, smart_intersections_1.initializeInclusionFlags)(intersections.int_points2);
    // calculate inclusion flags only for edges incident to intersections
    (0, smart_intersections_1.calculateInclusionFlags)(intersections.int_points1, wrk_poly);
    (0, smart_intersections_1.calculateInclusionFlags)(intersections.int_points2, res_poly);
    // fix boundary conflicts
    while (fixBoundaryConflicts(res_poly, wrk_poly, intersections.int_points1, intersections.int_points1_sorted, intersections.int_points2, intersections))
        ;
    // while (fixBoundaryConflicts(wrk_poly, res_poly, intersections.int_points2, intersections.int_points2_sorted, intersections.int_points1, intersections));
    // Set overlapping flags for boundary chains: SAME or OPPOSITE
    (0, smart_intersections_1.setOverlappingFlags)(intersections);
    // remove not relevant chains between intersection points
    removeNotRelevantChains(res_poly, op, intersections.int_points1_sorted, true);
    removeNotRelevantChains(wrk_poly, op, intersections.int_points2_sorted, false);
    // remove not relevant not intersected faces from res_polygon and wrk_polygon
    // if op == UNION, remove faces that are included in wrk_polygon without intersection
    // if op == INTERSECT, remove faces that are not included into wrk_polygon
    removeNotRelevantNotIntersectedFaces(res_poly, notIntersectedFacesRes, op, true);
    removeNotRelevantNotIntersectedFaces(wrk_poly, notIntersectedFacesWrk, op, false);
}
function swapLinksAndRestore(res_poly, wrk_poly, intersections, op) {
    // add edges of wrk_poly into the edge container of res_poly
    copyWrkToRes(res_poly, wrk_poly, op, intersections.int_points2);
    // swap links from res_poly to wrk_poly and vice versa
    swapLinks(res_poly, wrk_poly, intersections);
    // remove old faces
    removeOldFaces(res_poly, intersections.int_points1);
    removeOldFaces(wrk_poly, intersections.int_points2);
    // restore faces
    restoreFaces(res_poly, intersections.int_points1, intersections.int_points2);
    restoreFaces(res_poly, intersections.int_points2, intersections.int_points1);
    // merge relevant not intersected faces from wrk_polygon to res_polygon
    // mergeRelevantNotIntersectedFaces(res_poly, wrk_poly);
}
function booleanOpBinary(polygon1, polygon2, op, restore) {
    let res_poly = polygon1.clone();
    let wrk_poly = polygon2.clone();
    // get intersection points
    let intersections = getIntersections(res_poly, wrk_poly);
    // sort intersection points
    (0, smart_intersections_1.sortIntersections)(intersections);
    // split by intersection points
    (0, smart_intersections_1.splitByIntersections)(res_poly, intersections.int_points1_sorted);
    (0, smart_intersections_1.splitByIntersections)(wrk_poly, intersections.int_points2_sorted);
    // filter duplicated intersection points
    (0, smart_intersections_1.filterDuplicatedIntersections)(intersections);
    // sort intersection points again after filtering
    (0, smart_intersections_1.sortIntersections)(intersections);
    // calculate inclusion and remove not relevant edges
    filterNotRelevantEdges(res_poly, wrk_poly, intersections, op);
    if (restore) {
        swapLinksAndRestore(res_poly, wrk_poly, intersections, op);
    }
    return [res_poly, wrk_poly];
}
function getIntersections(polygon1, polygon2) {
    let intersections = {
        int_points1: [],
        int_points2: [],
        int_points1_sorted: [],
        int_points2_sorted: [],
    };
    // calculate intersections
    for (let edge1 of polygon1.edges) {
        // request edges of polygon2 in the box of edge1
        let resp = polygon2.edges.search(edge1.box);
        // for each edge2 in response
        for (let edge2 of resp) {
            // calculate intersections between edge1 and edge2
            let ip = edge1.shape.intersect(edge2.shape);
            // for each intersection point
            for (let pt of ip) {
                (0, smart_intersections_1.addToIntPoints)(edge1, pt, intersections.int_points1);
                (0, smart_intersections_1.addToIntPoints)(edge2, pt, intersections.int_points2);
            }
        }
    }
    return intersections;
}
function getNotIntersectedFaces(poly, int_points) {
    let notIntersected = [];
    for (let face of poly.faces) {
        if (!int_points.find((ip) => ip.face === face)) {
            notIntersected.push(face);
        }
    }
    return notIntersected;
}
function calcInclusionForNotIntersectedFaces(notIntersectedFaces, poly2) {
    for (let face of notIntersectedFaces) {
        face.first.bv = face.first.bvStart = face.first.bvEnd = undefined;
        face.first.setInclusion(poly2);
    }
}
function fixBoundaryConflicts(poly1, poly2, int_points1, int_points1_sorted, int_points2, intersections) {
    let cur_face;
    let first_int_point_in_face_id;
    let next_int_point1;
    let num_int_points = int_points1_sorted.length;
    let iterate_more = false;
    for (let i = 0; i < num_int_points; i++) {
        let cur_int_point1 = int_points1_sorted[i];
        // Find boundary chain in the polygon1
        if (cur_int_point1.face !== cur_face) { // next chain started
            first_int_point_in_face_id = i; // cur_int_point1;
            cur_face = cur_int_point1.face;
        }
        // Skip duplicated points with same <x,y> in "cur_int_point1" pool
        let int_points_cur_pool_start = i;
        let int_points_cur_pool_num = (0, smart_intersections_1.intPointsPoolCount)(int_points1_sorted, i, cur_face);
        let next_int_point_id;
        if (int_points_cur_pool_start + int_points_cur_pool_num < num_int_points &&
            int_points1_sorted[int_points_cur_pool_start + int_points_cur_pool_num].face === cur_face) {
            next_int_point_id = int_points_cur_pool_start + int_points_cur_pool_num;
        }
        else { // get first point from the same face
            next_int_point_id = first_int_point_in_face_id;
        }
        // From all points with same ,x,y. in 'next_int_point1' pool choose one that
        // has same face both in res_poly and in wrk_poly
        let int_points_next_pool_num = (0, smart_intersections_1.intPointsPoolCount)(int_points1_sorted, next_int_point_id, cur_face);
        next_int_point1 = null;
        for (let j = next_int_point_id; j < next_int_point_id + int_points_next_pool_num; j++) {
            let next_int_point1_tmp = int_points1_sorted[j];
            if (next_int_point1_tmp.face === cur_face &&
                int_points2[next_int_point1_tmp.id].face === int_points2[cur_int_point1.id].face) {
                next_int_point1 = next_int_point1_tmp;
                break;
            }
        }
        if (next_int_point1 === null)
            continue;
        let edge_from1 = cur_int_point1.edge_after;
        let edge_to1 = next_int_point1.edge_before;
        // Case #1. One of the ends is not boundary - probably tiny edge wrongly marked as boundary
        if (edge_from1.bv === BOUNDARY && edge_to1.bv != BOUNDARY) {
            edge_from1.bv = edge_to1.bv;
            continue;
        }
        if (edge_from1.bv != BOUNDARY && edge_to1.bv === BOUNDARY) {
            edge_to1.bv = edge_from1.bv;
            continue;
        }
        // Set up all boundary values for middle edges. Need for cases 2 and 3
        if ((edge_from1.bv === BOUNDARY && edge_to1.bv === BOUNDARY && edge_from1 != edge_to1) ||
            (edge_from1.bv === INSIDE && edge_to1.bv === OUTSIDE || edge_from1.bv === OUTSIDE && edge_to1.bv === INSIDE)) {
            let edge_tmp = edge_from1.next;
            while (edge_tmp != edge_to1) {
                edge_tmp.bvStart = undefined;
                edge_tmp.bvEnd = undefined;
                edge_tmp.bv = undefined;
                edge_tmp.setInclusion(poly2);
                edge_tmp = edge_tmp.next;
            }
        }
        // Case #2. Both of the ends boundary. Check all the edges in the middle
        // If some edges in the middle are not boundary then update bv of 'from' and 'to' edges
        if (edge_from1.bv === BOUNDARY && edge_to1.bv === BOUNDARY && edge_from1 != edge_to1) {
            let edge_tmp = edge_from1.next;
            let new_bv;
            while (edge_tmp != edge_to1) {
                if (edge_tmp.bv != BOUNDARY) {
                    if (new_bv === undefined) { // first not boundary edge between from and to
                        new_bv = edge_tmp.bv;
                    }
                    else { // another not boundary edge between from and to
                        if (edge_tmp.bv != new_bv) { // and it has different bv - can't resolve conflict
                            throw errors_1.default.UNRESOLVED_BOUNDARY_CONFLICT;
                        }
                    }
                }
                edge_tmp = edge_tmp.next;
            }
            if (new_bv != undefined) {
                edge_from1.bv = new_bv;
                edge_to1.bv = new_bv;
            }
            continue; // all middle edges are boundary, proceed with this
        }
        // Case 3. One of the ends is inner, another is outer
        if (edge_from1.bv === INSIDE && edge_to1.bv === OUTSIDE || edge_from1.bv === OUTSIDE && edge_to1.bv === INSIDE) {
            let edge_tmp = edge_from1;
            // Find missing intersection point
            while (edge_tmp != edge_to1) {
                if (edge_tmp.bvStart === edge_from1.bv && edge_tmp.bvEnd === edge_to1.bv) {
                    let [dist, segment] = edge_tmp.shape.distanceTo(poly2);
                    if (dist < 10 * Utils.getTolerance()) { // it should be very close
                        // let pt = edge_tmp.end;
                        // add to the list of intersections of poly1
                        (0, smart_intersections_1.addToIntPoints)(edge_tmp, segment.ps, int_points1);
                        // split edge_tmp in poly1 if need
                        let int_point1 = int_points1[int_points1.length - 1];
                        if (int_point1.is_vertex & START_VERTEX) { // nothing to split
                            int_point1.edge_after = edge_tmp;
                            int_point1.edge_before = edge_tmp.prev;
                            edge_tmp.bvStart = BOUNDARY;
                            edge_tmp.bv = undefined;
                            edge_tmp.setInclusion(poly2);
                        }
                        else if (int_point1.is_vertex & END_VERTEX) { // nothing to split
                            int_point1.edge_after = edge_tmp.next;
                            edge_tmp.bvEnd = BOUNDARY;
                            edge_tmp.bv = undefined;
                            edge_tmp.setInclusion(poly2);
                        }
                        else { // split edge here
                            let newEdge1 = poly2.addVertex(int_point1.pt, edge_tmp);
                            int_point1.edge_before = newEdge1;
                            int_point1.edge_after = newEdge1.next;
                            newEdge1.setInclusion(poly2);
                            newEdge1.next.bvStart = BOUNDARY;
                            newEdge1.next.bvEnd = undefined;
                            newEdge1.next.bv = undefined;
                            newEdge1.next.setInclusion(poly2);
                        }
                        // add to the list of intersections of poly2
                        let edge2 = poly2.findEdgeByPoint(segment.pe);
                        (0, smart_intersections_1.addToIntPoints)(edge2, segment.pe, int_points2);
                        // split edge2 in poly2 if need
                        let int_point2 = int_points2[int_points2.length - 1];
                        if (int_point2.is_vertex & START_VERTEX) { // nothing to split
                            int_point2.edge_after = edge2;
                            int_point2.edge_before = edge2.prev;
                        }
                        else if (int_point2.is_vertex & END_VERTEX) { // nothing to split
                            int_point2.edge_after = edge2.next;
                        }
                        else { // split edge here
                            // first locate int_points that may refer to edge2 as edge.after
                            // let int_point2_edge_before = int_points2.find( int_point => int_point.edge_before === edge2)
                            let int_point2_edge_after = int_points2.find(int_point => int_point.edge_after === edge2);
                            let newEdge2 = poly2.addVertex(int_point2.pt, edge2);
                            int_point2.edge_before = newEdge2;
                            int_point2.edge_after = newEdge2.next;
                            if (int_point2_edge_after)
                                int_point2_edge_after.edge_after = newEdge2;
                            newEdge2.bvStart = undefined;
                            newEdge2.bvEnd = BOUNDARY;
                            newEdge2.bv = undefined;
                            newEdge2.setInclusion(poly1);
                            newEdge2.next.bvStart = BOUNDARY;
                            newEdge2.next.bvEnd = undefined;
                            newEdge2.next.bv = undefined;
                            newEdge2.next.setInclusion(poly1);
                        }
                        (0, smart_intersections_1.sortIntersections)(intersections);
                        iterate_more = true;
                        break;
                    }
                }
                edge_tmp = edge_tmp.next;
            }
            // we changed intersections inside loop, have to exit and repair again
            if (iterate_more)
                break;
            throw errors_1.default.UNRESOLVED_BOUNDARY_CONFLICT;
        }
    }
    return iterate_more;
}
function removeNotRelevantChains(polygon, op, int_points, is_res_polygon) {
    if (!int_points)
        return;
    let cur_face = undefined;
    let first_int_point_in_face_num = undefined;
    let int_point_current;
    let int_point_next;
    for (let i = 0; i < int_points.length; i++) {
        int_point_current = int_points[i];
        if (int_point_current.face !== cur_face) { // next face started
            first_int_point_in_face_num = i;
            cur_face = int_point_current.face;
        }
        if (cur_face.isEmpty()) // ??
            continue;
        // Get next int point from the same face that current
        // Count how many duplicated points with same <x,y> in "points from" pool ?
        let int_points_from_pull_start = i;
        let int_points_from_pull_num = (0, smart_intersections_1.intPointsPoolCount)(int_points, i, cur_face);
        let next_int_point_num;
        if (int_points_from_pull_start + int_points_from_pull_num < int_points.length &&
            int_points[int_points_from_pull_start + int_points_from_pull_num].face === int_point_current.face) {
            next_int_point_num = int_points_from_pull_start + int_points_from_pull_num;
        }
        else { // get first point from the same face
            next_int_point_num = first_int_point_in_face_num;
        }
        int_point_next = int_points[next_int_point_num];
        /* Count how many duplicated points with same <x,y> in "points to" pull ? */
        let int_points_to_pull_start = next_int_point_num;
        let int_points_to_pull_num = (0, smart_intersections_1.intPointsPoolCount)(int_points, int_points_to_pull_start, cur_face);
        let edge_from = int_point_current.edge_after;
        let edge_to = int_point_next.edge_before;
        if ((edge_from.bv === INSIDE && edge_to.bv === INSIDE && op === exports.BOOLEAN_UNION) ||
            (edge_from.bv === OUTSIDE && edge_to.bv === OUTSIDE && op === exports.BOOLEAN_INTERSECT) ||
            ((edge_from.bv === OUTSIDE || edge_to.bv === OUTSIDE) && op === exports.BOOLEAN_SUBTRACT && !is_res_polygon) ||
            ((edge_from.bv === INSIDE || edge_to.bv === INSIDE) && op === exports.BOOLEAN_SUBTRACT && is_res_polygon) ||
            (edge_from.bv === BOUNDARY && edge_to.bv === BOUNDARY && (edge_from.overlap & OVERLAP_SAME) && is_res_polygon) ||
            (edge_from.bv === BOUNDARY && edge_to.bv === BOUNDARY && (edge_from.overlap & OVERLAP_OPPOSITE))) {
            polygon.removeChain(cur_face, edge_from, edge_to);
            /* update all points in "points from" pull */
            for (let k = int_points_from_pull_start; k < int_points_from_pull_start + int_points_from_pull_num; k++) {
                int_points[k].edge_after = undefined;
            }
            /* update all points in "points to" pull */
            for (let k = int_points_to_pull_start; k < int_points_to_pull_start + int_points_to_pull_num; k++) {
                int_points[k].edge_before = undefined;
            }
        }
        /* skip to the last point in "points from" group */
        i += int_points_from_pull_num - 1;
    }
}
exports.removeNotRelevantChains = removeNotRelevantChains;
;
function copyWrkToRes(res_polygon, wrk_polygon, op, int_points) {
    for (let face of wrk_polygon.faces) {
        for (let edge of face) {
            res_polygon.edges.add(edge);
        }
        // If union - add face from wrk_polygon that is not intersected with res_polygon
        if ( /*(op === BOOLEAN_UNION || op == BOOLEAN_SUBTRACT) &&*/int_points.find((ip) => (ip.face === face)) === undefined) {
            res_polygon.addFace(face.first, face.last);
        }
    }
}
function swapLinks(res_polygon, wrk_polygon, intersections) {
    if (intersections.int_points1.length === 0)
        return;
    for (let i = 0; i < intersections.int_points1.length; i++) {
        let int_point1 = intersections.int_points1[i];
        let int_point2 = intersections.int_points2[i];
        // Simple case - find continuation on the other polygon
        // Process edge from res_polygon
        if (int_point1.edge_before !== undefined && int_point1.edge_after === undefined) { // swap need
            if (int_point2.edge_before === undefined && int_point2.edge_after !== undefined) { // simple case
                // Connect edges
                int_point1.edge_before.next = int_point2.edge_after;
                int_point2.edge_after.prev = int_point1.edge_before;
                // Fill in missed links in intersection points
                int_point1.edge_after = int_point2.edge_after;
                int_point2.edge_before = int_point1.edge_before;
            }
        }
        // Process edge from wrk_polygon
        if (int_point2.edge_before !== undefined && int_point2.edge_after === undefined) { // swap need
            if (int_point1.edge_before === undefined && int_point1.edge_after !== undefined) { // simple case
                // Connect edges
                int_point2.edge_before.next = int_point1.edge_after;
                int_point1.edge_after.prev = int_point2.edge_before;
                // Complete missed links
                int_point2.edge_after = int_point1.edge_after;
                int_point1.edge_before = int_point2.edge_before;
            }
        }
        // Continuation not found - complex case
        // Continuation will be found on the same polygon.
        // It happens when intersection point is actually touching point
        // Polygon1
        if (int_point1.edge_before !== undefined && int_point1.edge_after === undefined) { // still swap need
            for (let int_point of intersections.int_points1_sorted) {
                if (int_point === int_point1)
                    continue; // skip same
                if (int_point.edge_before === undefined && int_point.edge_after !== undefined) {
                    if (int_point.pt.equalTo(int_point1.pt)) {
                        // Connect edges
                        int_point1.edge_before.next = int_point.edge_after;
                        int_point.edge_after.prev = int_point1.edge_before;
                        // Complete missed links
                        int_point1.edge_after = int_point.edge_after;
                        int_point.edge_before = int_point1.edge_before;
                    }
                }
            }
        }
        // Polygon2
        if (int_point2.edge_before !== undefined && int_point2.edge_after === undefined) { // still swap need
            for (let int_point of intersections.int_points2_sorted) {
                if (int_point === int_point2)
                    continue; // skip same
                if (int_point.edge_before === undefined && int_point.edge_after !== undefined) {
                    if (int_point.pt.equalTo(int_point2.pt)) {
                        // Connect edges
                        int_point2.edge_before.next = int_point.edge_after;
                        int_point.edge_after.prev = int_point2.edge_before;
                        // Complete missed links
                        int_point2.edge_after = int_point.edge_after;
                        int_point.edge_before = int_point2.edge_before;
                    }
                }
            }
        }
    }
    // Sanity check that no dead ends left
}
function removeOldFaces(polygon, int_points) {
    for (let int_point of int_points) {
        polygon.faces.delete(int_point.face);
        int_point.face = undefined;
        if (int_point.edge_before)
            int_point.edge_before.face = undefined;
        if (int_point.edge_after)
            int_point.edge_after.face = undefined;
    }
}
exports.removeOldFaces = removeOldFaces;
function restoreFaces(polygon, int_points, other_int_points) {
    // For each intersection point - create new face
    for (let int_point of int_points) {
        if (int_point.edge_before === undefined || int_point.edge_after === undefined) // completely deleted
            continue;
        if (int_point.face) // already restored
            continue;
        if (int_point.edge_after.face || int_point.edge_before.face) // Face already created. Possible case in duplicated intersection points
            continue;
        let first = int_point.edge_after; // face start
        let last = int_point.edge_before; // face end;
        linked_list_1.default.testInfiniteLoop(first); // check and throw error if infinite loop found
        let face = polygon.addFace(first, last);
        // Mark intersection points from the newly create face
        // to avoid multiple creation of the same face
        // Face was assigned to each edge of new face in addFace function
        for (let int_point_tmp of int_points) {
            if (int_point_tmp.edge_before && int_point_tmp.edge_after &&
                int_point_tmp.edge_before.face === face && int_point_tmp.edge_after.face === face) {
                int_point_tmp.face = face;
            }
        }
        // Mark other intersection points as well
        for (let int_point_tmp of other_int_points) {
            if (int_point_tmp.edge_before && int_point_tmp.edge_after &&
                int_point_tmp.edge_before.face === face && int_point_tmp.edge_after.face === face) {
                int_point_tmp.face = face;
            }
        }
    }
}
exports.restoreFaces = restoreFaces;
function removeNotRelevantNotIntersectedFaces(polygon, notIntersectedFaces, op, is_res_polygon) {
    for (let face of notIntersectedFaces) {
        let rel = face.first.bv;
        if (op === exports.BOOLEAN_UNION && rel === INSIDE ||
            op === exports.BOOLEAN_SUBTRACT && rel === INSIDE && is_res_polygon ||
            op === exports.BOOLEAN_SUBTRACT && rel === OUTSIDE && !is_res_polygon ||
            op === exports.BOOLEAN_INTERSECT && rel === OUTSIDE) {
            polygon.deleteFace(face);
        }
    }
}
function mergeRelevantNotIntersectedFaces(res_polygon, wrk_polygon) {
    // All not relevant faces should be already deleted from wrk_polygon
    for (let face of wrk_polygon.faces) {
        res_polygon.addFace(face);
    }
}
