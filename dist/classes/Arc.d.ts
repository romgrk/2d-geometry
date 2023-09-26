import * as geom from './index';
import { Shape } from "./Shape";
/**
 * Class representing a circular arc
 * @type {Arc}
 */
export declare class Arc extends Shape<Arc> {
    /**
     * Arc center
     */
    pc: geom.Point;
    /**
     * Arc radius
     */
    r: number;
    /**
     * Arc start angle in radians
     */
    startAngle: number;
    /**
     * Arc end angle in radians
     */
    endAngle: number;
    /**
     * Arc orientation
     */
    counterClockwise: boolean;
    /**
     * @param {Point} pc - arc center
     * @param {number} r - arc radius
     * @param {number} startAngle - start angle in radians from 0 to 2*PI
     * @param {number} endAngle - end angle in radians from 0 to 2*PI
     * @param {boolean} counterClockwise - arc direction, true - clockwise, false - counterclockwise
     */
    constructor(...args: any[]);
    /**
     * Return new cloned instance of arc
     * @returns {Arc}
     */
    clone(): geom.Arc;
    /**
     * Get sweep angle in radians. Sweep angle is non-negative number from 0 to 2*PI
     * @returns {number}
     */
    get sweep(): any;
    /**
     * Get start point of arc
     */
    get start(): geom.Point;
    /**
     * Get end point of arc
     */
    get end(): geom.Point;
    /**
     * Get center of arc
     * @returns {Point}
     */
    get center(): geom.Point;
    get vertices(): geom.Point[];
    /**
     * Get arc length
     * @returns {number}
     */
    get length(): number;
    /**
     * Get bounding box of the arc
     * @returns {Box}
     */
    get box(): any;
    /**
     * Returns true if arc contains point, false otherwise
     * @param {Point} pt - point to test
     * @returns {boolean}
     */
    contains(pt: any): boolean;
    /**
     * When given point belongs to arc, return array of two arcs split by this point. If points is incident
     * to start or end point of the arc, return clone of the arc. If point does not belong to the arcs, return
     * empty array.
     * @param {Point} pt Query point
     * @returns {Arc[]}
     */
    split(pt: any): geom.Arc[];
    /**
     * Return middle point of the arc
     * @returns {Point}
     */
    middle(): geom.Point;
    /**
     * Get point at given length
     * @param {number} length - The length along the arc
     * @returns {Point}
     */
    pointAtLength(length: any): geom.Point;
    /**
     * Returns chord height ("sagitta") of the arc
     * @returns {number}
     */
    chordHeight(): number;
    /**
     * Returns array of intersection points between arc and other shape
     * @param {Shape} shape Shape of the one of supported types <br/>
     * @returns {Point[]}
     */
    intersect(shape: any): geom.Point[];
    /**
     * Calculate distance and shortest segment from arc to shape and return array [distance, shortest segment]
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
     * @returns {number} distance from arc to shape
     * @returns {Segment} shortest segment between arc and shape (started at arc, ended at shape)

     */
    distanceTo(shape: any): (number | geom.Segment)[];
    /**
     * Breaks arc in extreme point 0, pi/2, pi, 3*pi/2 and returns array of sub-arcs
     * @returns {Arc[]}
     */
    breakToFunctional(): any[];
    /**
     * Return tangent unit vector in the start point in the direction from start to end
     * @returns {Vector}
     */
    tangentInStart(): geom.Vector;
    /**
     * Return tangent unit vector in the end point in the direction from end to start
     * @returns {Vector}
     */
    tangentInEnd(): geom.Vector;
    /**
     * Returns new arc with swapped start and end angles and reversed direction
     * @returns {Arc}
     */
    reverse(): geom.Arc;
    /**
     * Return new arc transformed using affine transformation matrix <br/>
     */
    transform(matrix?: geom.Matrix): geom.Arc;
    static arcSE(center: any, start: any, end: any, counterClockwise: any): geom.Arc;
    definiteIntegral(ymin?: number): any;
    circularSegmentDefiniteIntegral(ymin: any): number;
    circularSegmentArea(): number;
    /**
     * Sort given array of points from arc start to end, assuming all points lay on the arc
     * @param {Point[]} pts array of points
     * @returns {Point[]} new array sorted
     */
    sortPoints(pts: any): any;
    get name(): string;
    /**
     * Return string to draw arc in svg
     * @param {Object} attrs - an object with attributes of svg path element
     * @returns {string}
     */
    svg(attrs?: {}): string;
}
/**
 * Function to create arc equivalent to "new" constructor
 * @param args
 */
export declare const arc: (...args: any[]) => geom.Arc;
//# sourceMappingURL=Arc.d.ts.map