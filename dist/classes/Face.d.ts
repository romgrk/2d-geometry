import CircularLinkedList from '../data_structures/circular_linked_list';
import * as geom from './index';
import { Box } from './Box';
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
export declare class Face extends CircularLinkedList<any> {
    _box: Box | undefined;
    _orientation: number | undefined;
    constructor(polygon: any, ...args: any[]);
    /**
     * Return array of edges from first to last
     * @returns {Array}
     */
    get edges(): any[];
    /**
     * Return array of shapes which comprise face
     * @returns {Array}
     */
    get shapes(): any[];
    /**
     * Return bounding box of the face
     * @returns {Box}
     */
    get box(): geom.Box;
    /**
     * Get all edges length
     * @returns {number}
     */
    get perimeter(): any;
    /**
     * Get point on face boundary at given length
     * @param {number} length - The length along the face boundary
     * @returns {Point}
     */
    pointAtLength(length: any): any;
    static points2segments(points: any): any[];
    shapes2face(edges: any, shapes: any): void;
    /**
     * Append edge after the last edge of the face (and before the first edge). <br/>
     * @param {Edge} edge - Edge to be appended to the linked list
     * @returns {Face}
     */
    append(edge: any): this;
    /**
     * Insert edge newEdge into the linked list after the edge edgeBefore <br/>
     * @param {Edge} newEdge - Edge to be inserted into linked list
     * @param {Edge} edgeBefore - Edge to insert newEdge after it
     * @returns {Face}
     */
    insert(newEdge: any, edgeBefore: any): this;
    /**
     * Remove the given edge from the linked list of the face <br/>
     * @param {Edge} edge - Edge to be removed
     * @returns {Face}
     */
    remove(edge: any): this;
    /**
     * Merge current edge with the next edge. Given edge will be extended,
     * next edge after it will be removed. The distortion of the polygon
     * is on the responsibility of the user of this method
     * @param {Edge} edge - edge to be extended
     * @returns {Face}
     */
    merge_with_next_edge(edge: any): this;
    /**
     * Reverse orientation of the face: first edge become last and vice a verse,
     * all edges starts and ends swapped, direction of arcs inverted. If face was oriented
     * clockwise, it becomes counterclockwise and vice versa
     */
    reverse(): void;
    /**
     * Set arc_length property for each of the edges in the face.
     * Arc_length of the edge it the arc length from the first edge of the face
     */
    setArcLength(): void;
    setOneEdgeArcLength(edge: any): void;
    /**
     * Returns the absolute value of the area of the face
     * @returns {number}
     */
    area(): number;
    /**
     * Returns signed area of the simple face.
     * Face is simple if it has no self intersections that change its orientation.
     * Then the area will be positive if the orientation of the face is clockwise,
     * and negative if orientation is counterclockwise.
     * It may be zero if polygon is degenerated.
     * @returns {number}
     */
    signedArea(): number;
    /**
     * Return face orientation: one of geom.ORIENTATION.CCW, geom.ORIENTATION.CW, geom.ORIENTATION.NOT_ORIENTABLE <br/>
     * According to Green theorem the area of a closed curve may be calculated as double integral,
     * and the sign of the integral will be defined by the direction of the curve.
     * When the integral ("signed area") will be negative, direction is counterclockwise,
     * when positive - clockwise and when it is zero, polygon is not orientable.
     * See {@link https://mathinsight.org/greens_theorem_find_area}
     * @returns {number}
     */
    orientation(): number;
    /**
     * Returns true if face of the polygon is simple (no self-intersection points found)
     * NOTE: this method is incomplete because it does not exclude touching points.
     * Self intersection test should check if polygon change orientation in the test point.
     * @param {PlanarSet} edges - reference to polygon edges to provide search index
     * @returns {boolean}
     */
    isSimple(edges: any): boolean;
    static getSelfIntersections(face: any, edges: any, exitOnFirst?: boolean): any[];
    /**
     * Returns edge which contains given point
     * @param {Point} pt - test point
     * @returns {Edge}
     */
    findEdgeByPoint(pt: any): any;
    /**
     * Returns new polygon created from one face
     * @returns {Polygon}
     */
    toPolygon(): geom.Polygon;
    toJSON(): any[];
    /**
     * Returns string to be assigned to "d" attribute inside defined "path"
     */
    svg(): string;
}
//# sourceMappingURL=Face.d.ts.map