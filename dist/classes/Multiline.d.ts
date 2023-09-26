import LinkedList from '../data_structures/linked_list';
import * as geom from './index';
import type { Shape } from './Shape';
/**
 * Class Multiline represent connected path of [edges]{@link geom.Edge}, where each edge may be
 * [segment]{@link geom.Segment}, [arc]{@link geom.Arc}, [line]{@link geom.Line} or [ray]{@link geom.Ray}
 */
export declare class Multiline extends LinkedList<any> {
    constructor(input?: Shape<geom.Segment | geom.Arc | geom.Ray | geom.Line>[]);
    /**
     * (Getter) Return array of edges
     * @returns {Edge[]}
     */
    get edges(): any[];
    /**
     * (Getter) Return bounding box of the multiline
     * @returns {Box}
     */
    get box(): any;
    /**
     * (Getter) Returns array of vertices
     * @returns {Point[]}
     */
    get vertices(): any[];
    /**
     * Return new cloned instance of Multiline
     * @returns {Multiline}
     */
    clone(): geom.Multiline;
    /**
     * Split edge and add new vertex, return new edge inserted
     * @param {Point} pt - point on edge that will be added as new vertex
     * @param {Edge} edge - edge to split
     * @returns {Edge}
     */
    addVertex(pt: any, edge: any): any;
    /**
     * Split edges of multiline with intersection points and return mutated multiline
     * @param {Point[]} ip - array of points to be added as new vertices
     * @returns {Multiline}
     */
    split(ip: any): this;
    /**
     * Returns edge which contains given point
     * @param {Point} pt
     * @returns {Edge}
     */
    findEdgeByPoint(pt: any): any;
    /**
     * Returns new multiline translated by vector vec
     * @param {Vector} vec
     * @returns {Multiline}
     */
    translate(vec: any): geom.Multiline;
    /**
     * Return new multiline rotated by given angle around given point
     * If point omitted, rotate around origin (0,0)
     * Positive value of angle defines rotation counterclockwise, negative - clockwise
     * @param {number} angle - rotation angle in radians
     * @param {Point} center - rotation center, default is (0,0)
     * @returns {Multiline} - new rotated polygon
     */
    rotate(angle?: number, center?: geom.Point): geom.Multiline;
    /**
     * Return new multiline transformed using affine transformation matrix
     * Method does not support unbounded shapes
     * @param {Matrix} matrix - affine transformation matrix
     * @returns {Multiline} - new multiline
     */
    transform(matrix?: geom.Matrix): geom.Multiline;
    /**
     * Transform multiline into array of shapes
     * @returns {Shape[]}
     */
    toShapes(): any[];
    /**
     * This method returns an object that defines how data will be
     * serialized when called JSON.stringify() method
     * @returns {Object}
     */
    toJSON(): any[];
    /**
     * Return string to draw multiline in svg
     * @param attrs  - an object with attributes for svg path element
     * TODO: support semi-infinite Ray and infinite Line
     * @returns {string}
     */
    svg(attrs?: {}): string;
}
/**
 * Shortcut function to create multiline
 * @param args
 */
export declare const multiline: (...args: any[]) => geom.Multiline;
//# sourceMappingURL=Multiline.d.ts.map