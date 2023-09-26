import * as geom from './index';
import { Shape } from "./Shape";
/**
 * Class representing a segment
 * @type {Segment}
 */
export declare class Segment extends Shape<Segment> {
    /** Start point */
    ps: geom.Point;
    /** End Point */
    pe: geom.Point;
    /**
     *
     * @param {Point} ps - start point
     * @param {Point} pe - end point
     */
    constructor(...args: any[]);
    /**
     * Return new cloned instance of segment
     * @returns {Segment}
     */
    clone(): geom.Segment;
    /**
     * Start point
     * @returns {Point}
     */
    get start(): geom.Point;
    /**
     * End point
     * @returns {Point}
     */
    get end(): geom.Point;
    /**
     * Returns array of start and end point
     * @returns [Point,Point]
     */
    get vertices(): geom.Point[];
    /**
     * Length of a segment
     * @returns {number}
     */
    get length(): any;
    /**
     * Slope of the line - angle to axe x in radians from 0 to 2PI
     * @returns {number}
     */
    get slope(): number;
    /**
     * Bounding box
     * @returns {Box}
     */
    get box(): geom.Box;
    /**
     * Returns true if equals to query segment, false otherwise
     * @param {Seg} seg - query segment
     * @returns {boolean}
     */
    equalTo(seg: any): boolean;
    /**
     * Returns true if segment contains point
     * @param {Point} pt Query point
     * @returns {boolean}
     */
    contains(pt: any): boolean;
    /**
     * Returns array of intersection points between segment and other shape
     * @param {Shape} shape - Shape of the one of supported types <br/>
     * @returns {Point[]}
     */
    intersect(shape: any): any[];
    /**
     * Calculate distance and shortest segment from segment to shape and return as array [distance, shortest segment]
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
     * @returns {number} distance from segment to shape
     * @returns {Segment} shortest segment between segment and shape (started at segment, ended at shape)
     */
    distanceTo(shape: any): (number | geom.Segment)[];
    /**
     * Returns unit vector in the direction from start to end
     * @returns {Vector}
     */
    tangentInStart(): geom.Vector;
    /**
     * Return unit vector in the direction from end to start
     * @returns {Vector}
     */
    tangentInEnd(): geom.Vector;
    /**
     * Returns new segment with swapped start and end points
     * @returns {Segment}
     */
    reverse(): geom.Segment;
    /**
     * When point belongs to segment, return array of two segments split by given point,
     * if point is inside segment. Returns clone of this segment if query point is incident
     * to start or end point of the segment. Returns empty array if point does not belong to segment
     * @param {Point} pt Query point
     * @returns {Segment[]}
     */
    split(pt: any): geom.Segment[];
    /**
     * Return middle point of the segment
     * @returns {Point}
     */
    middle(): geom.Point;
    /**
     * Get point at given length
     * @param {number} length - The length along the segment
     * @returns {Point}
     */
    pointAtLength(length: any): geom.Point;
    distanceToPoint(pt: any): number;
    definiteIntegral(ymin?: number): number;
    /**
     * Return new segment transformed using affine transformation matrix
     * @param {Matrix} matrix - affine transformation matrix
     * @returns {Segment} - transformed segment
     */
    transform(matrix?: geom.Matrix): geom.Segment;
    /**
     * Returns true if segment start is equal to segment end up to DP_TOL
     * @returns {boolean}
     */
    isZeroLength(): boolean;
    /**
     * Sort given array of points from segment start to end, assuming all points lay on the segment
     * @param {Point[]} - array of points
     * @returns {Point[]} new array sorted
     */
    sortPoints(pts: any): any;
    get name(): string;
    /**
     * Return string to draw segment in svg
     * @param {Object} attrs - an object with attributes for svg path element,
     * like "stroke", "strokeWidth" <br/>
     * Defaults are stroke:"black", strokeWidth:"1"
     * @returns {string}
     */
    svg(attrs?: {}): string;
}
/**
 * Shortcut method to create new segment
 */
export declare const segment: (...args: any[]) => geom.Segment;
//# sourceMappingURL=Segment.d.ts.map