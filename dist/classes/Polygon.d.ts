import { PlanarSet } from '../data_structures/planar_set';
import * as geom from '../classes';
/**
 * Class representing a polygon.<br/>
 * Polygon in FlattenJS is a multipolygon comprised from a set of [faces]{@link geom.Face}. <br/>
 * Face, in turn, is a closed loop of [edges]{@link geom.Edge}, where edge may be segment or circular arc<br/>
 * @type {Polygon}
 */
export declare class Polygon {
    faces: PlanarSet;
    edges: PlanarSet;
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
    constructor(...args: any[]);
    /**
     * (Getter) Returns bounding box of the polygon
     * @returns {Box}
     */
    get box(): any;
    /**
     * (Getter) Returns array of vertices
     * @returns {Array}
     */
    get vertices(): any[];
    /**
     * Create new cloned instance of the polygon
     * @returns {Polygon}
     */
    clone(): geom.Polygon;
    /**
     * Return true is polygon has no edges
     * @returns {boolean}
     */
    isEmpty(): boolean;
    /**
     * Return true if polygon is valid for boolean operations
     * Polygon is valid if <br/>
     * 1. All faces are simple polygons (there are no self-intersected polygons) <br/>
     * 2. All faces are orientable and there is no island inside island or hole inside hole - TODO <br/>
     * 3. There is no intersections between faces (excluding touching) - TODO <br/>
     * @returns {boolean}
     */
    isValid(): boolean;
    /**
     * Returns area of the polygon. Area of an island will be added, area of a hole will be subtracted
     * @returns {number}
     */
    area(): number;
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
    addFace(...args: any[]): geom.Face;
    /**
     * Delete existing face from polygon
     * @param {Face} face Face to be deleted
     * @returns {boolean}
     */
    deleteFace(face: any): boolean;
    /**
     * Clear all faces and create new faces from edges
     */
    recreateFaces(): void;
    /**
     * Delete chain of edges from the face.
     * @param {Face} face Face to remove chain
     * @param {Edge} edgeFrom Start of the chain of edges to be removed
     * @param {Edge} edgeTo End of the chain of edges to be removed
     */
    removeChain(face: any, edgeFrom: any, edgeTo: any): void;
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
    addVertex(pt: any, edge: any): any;
    /**
     * Merge given edge with next edge and remove vertex between them
     * @param {Edge} edge
     */
    removeEndVertex(edge: any): void;
    /**
     * Cut polygon with multiline and return array of new polygons
     * Multiline should be constructed from a line with intersection point, see notebook:
     * https://next.observablehq.com/@alexbol99/cut-polygon-with-line
     * @param {Multiline} multiline
     * @returns {Polygon[]}
     */
    cut(multiline: any): geom.Polygon[];
    /**
     * Cut face of polygon with a segment between two points and create two new polygons
     * Supposed that a segments between points does not intersect any other edge
     * @param {Point} pt1
     * @param {Point} pt2
     * @returns {Polygon[]}
     */
    cutFace(pt1: any, pt2: any): geom.Polygon[];
    /**
     * Return a result of cutting polygon with line
     * @param {Line} line - cutting line
     * @returns {Polygon} newPoly - resulted polygon
     */
    cutWithLine(line: any): geom.Polygon;
    /**
     * Returns the first found edge of polygon that contains given point
     * If point is a vertex, return the edge where the point is an end vertex, not a start one
     * @param {Point} pt
     * @returns {Edge}
     */
    findEdgeByPoint(pt: any): any;
    /**
     * Split polygon into array of polygons, where each polygon is an island with all
     * hole that it contains
     * @returns {geom.Polygon[]}
     */
    splitToIslands(): any[];
    /**
     * Reverse orientation of all faces to opposite
     * @returns {Polygon}
     */
    reverse(): this;
    /**
     * Returns true if polygon contains shape: no point of shape lay outside of the polygon,
     * false otherwise
     * @param {Shape} shape - test shape
     * @returns {boolean}
     */
    contains(shape: any): boolean;
    /**
     * Return distance and shortest segment between polygon and other shape as array [distance, shortest_segment]
     * @param {Shape} shape Shape of one of the types Point, Circle, Line, Segment, Arc or Polygon
     * @returns {Number | Segment}
     */
    distanceTo(shape: any): any[] | readonly [number, geom.Segment];
    /**
     * Return array of intersection points between polygon and other shape
     * @param shape Shape of the one of supported types <br/>
     * @returns {Point[]}
     */
    intersect(shape: any): geom.Point[];
    /**
     * Returns new polygon translated by vector vec
     * @param {Vector} vec
     * @returns {Polygon}
     */
    translate(vec: any): geom.Polygon;
    /**
     * Return new polygon rotated by given angle around given point
     * If point omitted, rotate around origin (0,0)
     * Positive value of angle defines rotation counterclockwise, negative - clockwise
     * @param {number} angle - rotation angle in radians
     * @param {Point} center - rotation center, default is (0,0)
     * @returns {Polygon} - new rotated polygon
     */
    rotate(angle?: number, center?: geom.Point): geom.Polygon;
    /**
     * Return new polygon with coordinates multiplied by scaling factor
     * @param {number} sx - x-axis scaling factor
     * @param {number} sy - y-axis scaling factor
     * @returns {Polygon}
     */
    scale(sx: any, sy: any): geom.Polygon;
    /**
     * Return new polygon transformed using affine transformation matrix
     * @param {Matrix} matrix - affine transformation matrix
     * @returns {Polygon} - new polygon
     */
    transform(matrix?: geom.Matrix): geom.Polygon;
    /**
     * This method returns an object that defines how data will be
     * serialized when called JSON.stringify() method
     * @returns {Object}
     */
    toJSON(): any[];
    /**
     * Transform all faces into array of polygons
     * @returns {geom.Polygon[]}
     */
    toArray(): any[];
    /**
     * Return string to draw polygon in svg
     * @param attrs  - an object with attributes for svg path element
     * @returns {string}
     */
    svg(attrs?: {}): string;
}
/**
 * Shortcut method to create new polygon
 */
export declare const polygon: (...args: any[]) => geom.Polygon;
//# sourceMappingURL=Polygon.d.ts.map