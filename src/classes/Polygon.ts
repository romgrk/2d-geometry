import {ray_shoot} from "../algorithms/ray_shooting";
import * as Utils from '../utils/utils'
import * as Distance from '../algorithms/distance'
import * as Intersection from "../algorithms/intersection";
import * as Relations from "../algorithms/relation";
import {
    addToIntPoints, calculateInclusionFlags, filterDuplicatedIntersections,
    getSortedArray, getSortedArrayOnLine, initializeInclusionFlags, insertBetweenIntPoints,
    splitByIntersections
} from "../data_structures/smart_intersections";
import {Multiline} from "./Multiline";
import {intersectEdge2Line} from "../algorithms/intersection";
import {INSIDE, BOUNDARY} from "../utils/constants";
import {convertToString} from "../utils/attributes";
import { PlanarSet } from '../data_structures/planar_set';
import * as geom from '../classes'

/**
 * Class representing a polygon.<br/>
 * Polygon in FlattenJS is a multipolygon comprised from a set of [faces]{@link geom.Face}. <br/>
 * Face, in turn, is a closed loop of [edges]{@link geom.Edge}, where edge may be segment or circular arc<br/>
 * @type {Polygon}
 */
export class Polygon {
    faces: PlanarSet
    edges: PlanarSet

    /**
     * Constructor creates new instance of polygon. With no arguments new polygon is empty.<br/>
     * Constructor accepts as argument array that define loop of shapes
     * or array of arrays in case of multi polygon <br/>
     * Loop may be defined in different ways: <br/>
     * - array of shapes of type Segment or Arc <br/>
     * - array of points (geom.Point) <br/>
     * - array of numeric pairs which represent points <br/>
     * - box or circle object <br/>
     * Alternatively, it is possible to use polygon.addFace method
     * @param {args} - array of shapes or array of arrays
     */
    constructor(...args: any[]) {
        /**
         * Container of faces (closed loops), may be empty
         * @type {PlanarSet}
         */
        this.faces = new PlanarSet();
        /**
         * Container of edges
         * @type {PlanarSet}
         */
        this.edges = new PlanarSet();

        /* It may be array of something that may represent one loop (face) or
         array of arrays that represent multiple loops
         */
        if (args.length === 1 &&
            ((args[0] instanceof Array && args[0].length > 0) ||
                args[0] instanceof geom.Circle || args[0] instanceof geom.Box)) {

            let argsArray = args[0] as any;

            if (args[0] instanceof Array && args[0].every(loop => loop instanceof Array)) {
                if (argsArray.every(el => {
                    return el instanceof Array && el.length === 2 && typeof (el[0]) === "number" && typeof (el[1]) === "number"
                })) {
                    this.faces.add(new geom.Face(this, argsArray));    // one-loop polygon as array of pairs of numbers
                } else {
                    for (let loop of argsArray) {   // multi-loop polygon
                        /* Check extra level of nesting for GeoJSON-style multi polygons */
                        if (loop instanceof Array && loop[0] instanceof Array &&
                            loop[0].every(el => {
                                return el instanceof Array && el.length === 2 && typeof (el[0]) === "number" && typeof (el[1]) === "number"
                            })) {
                            for (let loop1 of loop) {
                                this.faces.add(new geom.Face(this, loop1));
                            }
                        } else {
                            this.faces.add(new geom.Face(this, loop));
                        }
                    }
                }
            } else {
                this.faces.add(new geom.Face(this, argsArray));    // one-loop polygon
            }
        }
    }

    /**
     * (Getter) Returns bounding box of the polygon
     * @returns {Box}
     */
    get box() {
        return [...this.faces].reduce((acc, face) => acc.merge(face.box), new geom.Box());
    }

    /**
     * (Getter) Returns array of vertices
     * @returns {Array}
     */
    get vertices() {
        return [...this.edges].map(edge => edge.start);
    }

    /**
     * Create new cloned instance of the polygon
     * @returns {Polygon}
     */
    clone() {
        let polygon = new Polygon();
        for (let face of this.faces) {
            polygon.addFace(face.shapes);
        }
        return polygon;
    }

    /**
     * Return true is polygon has no edges
     * @returns {boolean}
     */
    isEmpty() {
        return this.edges.size === 0;
    }

    /**
     * Return true if polygon is valid for boolean operations
     * Polygon is valid if <br/>
     * 1. All faces are simple polygons (there are no self-intersected polygons) <br/>
     * 2. All faces are orientable and there is no island inside island or hole inside hole - TODO <br/>
     * 3. There is no intersections between faces (excluding touching) - TODO <br/>
     * @returns {boolean}
     */
    isValid() {
        let valid = true;
        // 1. Polygon is invalid if at least one face is not simple
        for (let face of this.faces) {
            if (!face.isSimple(this.edges)) {
                valid = false;
                break;
            }
        }
        // 2. TODO: check if no island inside island and no hole inside hole
        // 3. TODO: check the there is no intersection between faces
        return valid;
    }

    /**
     * Returns area of the polygon. Area of an island will be added, area of a hole will be subtracted
     * @returns {number}
     */
    area() {
        let signedArea = [...this.faces].reduce((acc, face) => acc + face.signedArea(), 0);
        return Math.abs(signedArea);
    }

    /**
     * Add new face to polygon. Returns added face
     * @param {Point[]|Segment[]|Arc[]|Circle|Box} args -  new face may be create with one of the following ways: <br/>
     * 1) array of points that describe closed path (edges are segments) <br/>
     * 2) array of shapes (segments and arcs) which describe closed path <br/>
     * 3) circle - will be added as counterclockwise arc <br/>
     * 4) box - will be added as counterclockwise rectangle <br/>
     * You can chain method face.reverse() is you need to change direction of the creates face
     * @returns {Face}
     */
    addFace(...args) {
        let face = new geom.Face(this, ...args);
        this.faces.add(face);
        return face;
    }

    /**
     * Delete existing face from polygon
     * @param {Face} face Face to be deleted
     * @returns {boolean}
     */
    deleteFace(face) {
        for (let edge of face) {
            this.edges.delete(edge);
        }
        return this.faces.delete(face);
    }

    /**
     * Clear all faces and create new faces from edges
     */
    recreateFaces() {
        // Remove all faces
        this.faces.clear();
        for (let edge of this.edges) {
            edge.face = null;
        }

        // Restore faces
        let first;
        let unassignedEdgeFound = true;
        while (unassignedEdgeFound) {
            unassignedEdgeFound = false;
            for (let edge of this.edges) {
                if (edge.face === null) {
                    first = edge;
                    unassignedEdgeFound = true;
                    break;
                }
            }

            if (unassignedEdgeFound) {
                let last = first;
                do {
                    last = last.next;
                } while (last.next !== first)

                this.addFace(first, last);
            }
        }
    }

    /**
     * Delete chain of edges from the face.
     * @param {Face} face Face to remove chain
     * @param {Edge} edgeFrom Start of the chain of edges to be removed
     * @param {Edge} edgeTo End of the chain of edges to be removed
     */
    removeChain(face, edgeFrom, edgeTo) {
        // Special case: all edges removed
        if (edgeTo.next === edgeFrom) {
            this.deleteFace(face);
            return;
        }
        for (let edge = edgeFrom; edge !== edgeTo.next; edge = edge.next) {
            face.remove(edge);
            this.edges.delete(edge);      // delete from PlanarSet of edges and update index
            if (face.isEmpty()) {
                this.deleteFace(face);    // delete from PlanarSet of faces and update index
                break;
            }
        }
    }

    /**
     * Add point as a new vertex and split edge. Point supposed to belong to an edge.
     * When edge is split, new edge created from the start of the edge to the new vertex
     * and inserted before current edge.
     * Current edge is trimmed and updated.
     * Method returns new edge added. If no edge added, it returns edge before vertex
     * @param {Point} pt Point to be added as a new vertex
     * @param {Edge} edge Edge to be split with new vertex and then trimmed from start
     * @returns {Edge}
     */
    addVertex(pt, edge) {
        let shapes = edge.shape.split(pt);
        // if (shapes.length < 2) return;

        if (shapes[0] === null)   // point incident to edge start vertex, return previous edge
            return edge.prev;

        if (shapes[1] === null)   // point incident to edge end vertex, return edge itself
            return edge;

        let newEdge = new geom.Edge(shapes[0]);
        let edgeBefore = edge.prev;

        /* Insert first split edge into linked list after edgeBefore */
        edge.face.insert(newEdge, edgeBefore);

        // Remove old edge from edges container and 2d index
        this.edges.delete(edge);

        // Insert new edge to the edges container and 2d index
        this.edges.add(newEdge);

        // Update edge shape with second split edge keeping links
        edge.shape = shapes[1];

        // Add updated edge to the edges container and 2d index
        this.edges.add(edge);

        return newEdge;
    }

    /**
     * Merge given edge with next edge and remove vertex between them
     * @param {Edge} edge
     */
    removeEndVertex(edge) {
        const edge_next = edge.next
        if (edge_next === edge) return
        edge.face.merge_with_next_edge(edge)
        this.edges.delete(edge_next)
    }

    /**
     * Cut polygon with multiline and return array of new polygons
     * Multiline should be constructed from a line with intersection point, see notebook:
     * https://next.observablehq.com/@alexbol99/cut-polygon-with-line
     * @param {Multiline} multiline
     * @returns {Polygon[]}
     */
    cut(multiline) {
        let cutPolygons = [this.clone()];
        for (let edge of multiline) {
            if (edge.setInclusion(this) !== INSIDE)
                continue;

            let cut_edge_start = edge.shape.start;
            let cut_edge_end = edge.shape.end;

            let newCutPolygons = [];
            for (let polygon of cutPolygons) {
                if (polygon.findEdgeByPoint(cut_edge_start) === undefined) {
                    newCutPolygons.push(polygon);
                } else {
                    let [cutPoly1, cutPoly2] = polygon.cutFace(cut_edge_start, cut_edge_end);
                    newCutPolygons.push(cutPoly1, cutPoly2);
                }
            }
            cutPolygons = newCutPolygons;
        }
        return cutPolygons;
    }

    /**
     * Cut face of polygon with a segment between two points and create two new polygons
     * Supposed that a segments between points does not intersect any other edge
     * @param {Point} pt1
     * @param {Point} pt2
     * @returns {Polygon[]}
     */
    cutFace(pt1, pt2) {
        let edge1 = this.findEdgeByPoint(pt1);
        let edge2 = this.findEdgeByPoint(pt2);
        if (edge1.face !== edge2.face)
            return [];

        // Cut face into two and create new polygon with two faces
        let edgeBefore1 = this.addVertex(pt1, edge1);
        edge2 = this.findEdgeByPoint(pt2);
        let edgeBefore2 = this.addVertex(pt2, edge2);

        let face = edgeBefore1.face;
        let newEdge1 = new geom.Edge(
            new geom.Segment(edgeBefore1.end, edgeBefore2.end)
        );
        let newEdge2 = new geom.Edge(
            new geom.Segment(edgeBefore2.end, edgeBefore1.end)
        );

        // Swap links
        edgeBefore1.next.prev = newEdge2;
        newEdge2.next = edgeBefore1.next;

        edgeBefore1.next = newEdge1;
        newEdge1.prev = edgeBefore1;

        edgeBefore2.next.prev = newEdge1;
        newEdge1.next = edgeBefore2.next;

        edgeBefore2.next = newEdge2;
        newEdge2.prev = edgeBefore2;

        // Insert new edge to the edges container and 2d index
        this.edges.add(newEdge1);
        this.edges.add(newEdge2);

        // Add two new faces
        let face1 = this.addFace(newEdge1, edgeBefore1);
        let face2 = this.addFace(newEdge2, edgeBefore2);

        // Remove old face
        this.faces.delete(face);

        return [face1.toPolygon(), face2.toPolygon()];
    }

    /**
     * Return a result of cutting polygon with line
     * @param {Line} line - cutting line
     * @returns {Polygon} newPoly - resulted polygon
     */
    cutWithLine(line) {
        let newPoly = this.clone();

        let multiline = new Multiline([line]);

        // smart intersections
        let intersections = {
            int_points1: [],
            int_points2: [],
            int_points1_sorted: [],
            int_points2_sorted: []
        };

        // intersect line with each edge of the polygon
        // and create smart intersections
        for (let edge of newPoly.edges) {
            let ip = intersectEdge2Line(edge, line);
            // for each intersection point
            for (let pt of ip) {
                addToIntPoints(multiline.first, pt, intersections.int_points1);
                addToIntPoints(edge, pt, intersections.int_points2);
            }
        }

        // No intersections - return a copy of the original polygon
        if (intersections.int_points1.length === 0)
            return newPoly;

        // sort smart intersections
        intersections.int_points1_sorted = getSortedArrayOnLine(line, intersections.int_points1);
        intersections.int_points2_sorted = getSortedArray(intersections.int_points2);

        // split by intersection points
        splitByIntersections(multiline, intersections.int_points1_sorted);
        splitByIntersections(newPoly, intersections.int_points2_sorted);

        // filter duplicated intersection points
        filterDuplicatedIntersections(intersections);

        // sort intersection points again after filtering
        intersections.int_points1_sorted = getSortedArrayOnLine(line, intersections.int_points1);
        intersections.int_points2_sorted = getSortedArray(intersections.int_points2);

        // initialize inclusion flags for edges of multiline incident to intersections
        initializeInclusionFlags(intersections.int_points1);

        // calculate inclusion flag for edges of multiline incident to intersections
        calculateInclusionFlags(intersections.int_points1, newPoly);

        // filter intersections between two edges that got same inclusion flag
        for (let int_point1 of intersections.int_points1_sorted) {
            if (int_point1.edge_before.bv === int_point1.edge_after.bv) {
                intersections.int_points2[int_point1.id] = -1;   // to be filtered out
                int_point1.id = -1;                              // to be filtered out
            }
        }
        intersections.int_points1 = intersections.int_points1.filter( int_point => int_point.id >= 0);
        intersections.int_points2 = intersections.int_points2.filter( int_point => int_point.id >= 0);

        // No intersections left after filtering - return a copy of the original polygon
        if (intersections.int_points1.length === 0)
            return newPoly;

        // sort intersection points 3d time after filtering
        intersections.int_points1_sorted = getSortedArrayOnLine(line, intersections.int_points1);
        intersections.int_points2_sorted = getSortedArray(intersections.int_points2);

        // Add 2 new inner edges between intersection points
        let int_point1_prev = intersections.int_points1[0];
        let new_edge;
        for (let int_point1_curr of intersections.int_points1_sorted) {
            if (int_point1_curr.edge_before.bv === INSIDE) {
                new_edge = new geom.Edge(new geom.Segment(int_point1_prev.pt, int_point1_curr.pt));    // (int_point1_curr.edge_before.shape);
                insertBetweenIntPoints(intersections.int_points2[int_point1_prev.id], intersections.int_points2[int_point1_curr.id], new_edge);
                newPoly.edges.add(new_edge);

                new_edge = new geom.Edge(new geom.Segment(int_point1_curr.pt, int_point1_prev.pt));    // (int_point1_curr.edge_before.shape.reverse());
                insertBetweenIntPoints(intersections.int_points2[int_point1_curr.id], intersections.int_points2[int_point1_prev.id], new_edge);
                newPoly.edges.add(new_edge);
            }
            int_point1_prev = int_point1_curr;
        }

        // Recreate faces
        newPoly.recreateFaces();
        return newPoly;
    }

    /**
     * Returns the first found edge of polygon that contains given point
     * If point is a vertex, return the edge where the point is an end vertex, not a start one
     * @param {Point} pt
     * @returns {Edge}
     */
    findEdgeByPoint(pt) {
        let edge;
        for (let face of this.faces) {
            edge = face.findEdgeByPoint(pt);
            if (edge !== undefined)
                break;
        }
        return edge;
    }

    /**
     * Split polygon into array of polygons, where each polygon is an island with all
     * hole that it contains
     * @returns {geom.Polygon[]}
     */
    splitToIslands() {
        if (this.isEmpty()) return [];      // return empty array if polygon is empty
        let polygons = this.toArray();      // split into array of one-loop polygons
        /* Sort polygons by area in descending order */
        polygons.sort((polygon1, polygon2) => polygon2.area() - polygon1.area());
        /* define orientation of the island by orientation of the first polygon in array */
        let orientation = [...polygons[0].faces][0].orientation();
        /* Create output array from polygons with same orientation as a first polygon (array of islands) */
        let newPolygons = polygons.filter(polygon => [...polygon.faces][0].orientation() === orientation);
        for (let polygon of polygons) {
            let face = [...polygon.faces][0];
            if (face.orientation() === orientation) continue;  // skip same orientation
            /* Proceed with opposite orientation */
            /* Look if any of island polygons contains tested polygon as a hole */
            for (let islandPolygon of newPolygons) {
                if (face.shapes.every(shape => islandPolygon.contains(shape))) {
                    islandPolygon.addFace(face.shapes);      // add polygon as a hole in islandPolygon
                    break;
                }
            }
        }
        // TODO: assert if not all polygons added into output
        return newPolygons;
    }

    /**
     * Reverse orientation of all faces to opposite
     * @returns {Polygon}
     */
    reverse() {
        for (let face of this.faces) {
            face.reverse();
        }
        return this;
    }

    /**
     * Returns true if polygon contains shape: no point of shape lay outside of the polygon,
     * false otherwise
     * @param {Shape} shape - test shape
     * @returns {boolean}
     */
    contains(shape) {
        if (shape instanceof geom.Point) {
            let rel = ray_shoot(this, shape);
            return rel === INSIDE || rel === BOUNDARY;
        } else {
            return Relations.cover(this, shape);
        }
    }

    /**
     * Return distance and shortest segment between polygon and other shape as array [distance, shortest_segment]
     * @param {Shape} shape Shape of one of the types Point, Circle, Line, Segment, Arc or Polygon
     * @returns {Number | Segment}
     */
    distanceTo(shape) {
        // let {Distance} = Flatten;

        if (shape instanceof geom.Point) {
            let [dist, shortest_segment] = Distance.point2polygon(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [dist, shortest_segment];
        }

        if (shape instanceof geom.Circle ||
            shape instanceof geom.Line ||
            shape instanceof geom.Segment ||
            shape instanceof geom.Arc) {
            let [dist, shortest_segment] = Distance.shape2polygon(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [dist, shortest_segment];
        }

        /* this method is bit faster */
        if (shape instanceof geom.Polygon) {
            let min_dist_and_segment = [Number.POSITIVE_INFINITY, new geom.Segment()] as const;
            let dist, shortest_segment;

            for (let edge of this.edges) {
                // let [dist, shortest_segment] = Distance.shape2polygon(edge.shape, shape);
                let min_stop = min_dist_and_segment[0];
                [dist, shortest_segment] = Distance.shape2planarSet(edge.shape, shape.edges, min_stop);
                if (Utils.LT(dist, min_stop)) {
                    min_dist_and_segment = [dist, shortest_segment];
                }
            }
            return min_dist_and_segment;
        }
    }

    /**
     * Return array of intersection points between polygon and other shape
     * @param shape Shape of the one of supported types <br/>
     * @returns {Point[]}
     */
    intersect(shape) {
        if (shape instanceof geom.Point) {
            return this.contains(shape) ? [shape] : [];
        }

        if (shape instanceof geom.Line) {
            return Intersection.intersectLine2Polygon(shape, this);
        }

        if (shape instanceof geom.Ray) {
            return Intersection.intersectRay2Polygon(shape, this);
        }

        if (shape instanceof geom.Circle) {
            return Intersection.intersectCircle2Polygon(shape, this);
        }

        if (shape instanceof geom.Segment) {
            return Intersection.intersectSegment2Polygon(shape, this);
        }

        if (shape instanceof geom.Arc) {
            return Intersection.intersectArc2Polygon(shape, this);
        }

        if (shape instanceof geom.Polygon) {
            return Intersection.intersectPolygon2Polygon(shape, this);
        }
    }

    /**
     * Returns new polygon translated by vector vec
     * @param {Vector} vec
     * @returns {Polygon}
     */
    translate(vec) {
        let newPolygon = new Polygon();
        for (let face of this.faces) {
            newPolygon.addFace(face.shapes.map(shape => shape.translate(vec)));
        }
        return newPolygon;
    }

    /**
     * Return new polygon rotated by given angle around given point
     * If point omitted, rotate around origin (0,0)
     * Positive value of angle defines rotation counterclockwise, negative - clockwise
     * @param {number} angle - rotation angle in radians
     * @param {Point} center - rotation center, default is (0,0)
     * @returns {Polygon} - new rotated polygon
     */
    rotate(angle = 0, center = new geom.Point()) {
        let newPolygon = new Polygon();
        for (let face of this.faces) {
            newPolygon.addFace(face.shapes.map(shape => shape.rotate(angle, center)));
        }
        return newPolygon;
    }

    /**
     * Return new polygon with coordinates multiplied by scaling factor
     * @param {number} sx - x-axis scaling factor
     * @param {number} sy - y-axis scaling factor
     * @returns {Polygon}
     */
    scale(sx, sy) {
        let newPolygon = new Polygon();
        for (let face of this.faces) {
            newPolygon.addFace(face.shapes.map(shape => shape.scale(sx, sy)));
        }
        return newPolygon;
    }

    /**
     * Return new polygon transformed using affine transformation matrix
     * @param {Matrix} matrix - affine transformation matrix
     * @returns {Polygon} - new polygon
     */
    transform(matrix = new geom.Matrix()) {
        let newPolygon = new Polygon();
        for (let face of this.faces) {
            newPolygon.addFace(face.shapes.map(shape => shape.transform(matrix)));
        }
        return newPolygon;
    }

    /**
     * This method returns an object that defines how data will be
     * serialized when called JSON.stringify() method
     * @returns {Object}
     */
    toJSON() {
        return [...this.faces].map(face => face.toJSON());
    }

    /**
     * Transform all faces into array of polygons
     * @returns {geom.Polygon[]}
     */
    toArray() {
        return [...this.faces].map(face => face.toPolygon());
    }

    /**
     * Return string to draw polygon in svg
     * @param attrs  - an object with attributes for svg path element
     * @returns {string}
     */
    svg(attrs = {}) {
        let svgStr = `\n<path ${convertToString({fillRule: "evenodd", fill: "lightcyan", ...attrs})} d="`;
        for (let face of this.faces) {
            svgStr += face.svg();
        }
        svgStr += `" >\n</path>`;
        return svgStr;
    }
}

/**
 * Shortcut method to create new polygon
 */
export const polygon = (...args) => new geom.Polygon(...args);

