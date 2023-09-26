import * as geom from './index';
import { Shape } from "./Shape";
import { Point } from './Point';
import { Vector } from './Vector';
/**
 * Class representing a line
 * @type {Line}
 */
export declare class Line extends Shape<Line> {
    pt: Point;
    norm: Vector;
    /**
     * Line may be constructed by point and normal vector or by two points that a line passes through
     * @param {Point} pt - point that a line passes through
     * @param {Vector|Point} norm - normal vector to a line or second point a line passes through
     */
    constructor(...args: any[]);
    /**
     * Return new cloned instance of line
     * @returns {Line}
     */
    clone(): geom.Line;
    get start(): any;
    /**
     * Line has no end point
     */
    get end(): any;
    /**
     * Return positive infinity number as length
     * @returns {number}
     */
    get length(): number;
    /**
     * Returns infinite box
     * @returns {Box}
     */
    get box(): geom.Box;
    /**
     * Middle point is undefined
     * @returns {undefined}
     */
    get middle(): any;
    /**
     * Slope of the line - angle in radians between line and axe x from 0 to 2PI
     * @returns {number} - slope of the line
     */
    get slope(): number;
    /**
     * Get coefficients [A,B,C] of a standard line equation in the form Ax + By = C
     * @code [A, B, C] = line.standard
     * @returns {number[]} - array of coefficients
     */
    get standard(): number[];
    /**
     * Return true if parallel or incident to other line
     * @param {Line} other_line - line to check
     * @returns {boolean}
     */
    parallelTo(other_line: any): boolean;
    /**
     * Returns true if incident to other line
     * @param {Line} other_line - line to check
     * @returns {boolean}
     */
    incidentTo(other_line: any): any;
    /**
     * Returns true if point belongs to line
     * @param {Point} pt Query point
     * @returns {boolean}
     */
    contains(pt: any): boolean;
    /**
     * Return coordinate of the point that lies on the line in the transformed
     * coordinate system where center is the projection of the point(0,0) to
     * the line and axe y is collinear to the normal vector. <br/>
     * This method assumes that point lies on the line and does not check it
     * @param {Point} pt - point on a line
     * @returns {number}
     */
    coord(pt: any): number;
    /**
     * Returns array of intersection points
     * @param {Shape} shape - shape to intersect with
     * @returns {Point[]}
     */
    intersect(shape: any): any;
    /**
     * Calculate distance and shortest segment from line to shape and returns array [distance, shortest_segment]
     * @param {Shape} shape Shape of the one of the types Point, Circle, Segment, Arc, Polygon
     * @returns {[number, Segment]}
     */
    distanceTo(shape: any): (number | geom.Segment)[];
    /**
     * Split line with a point or array of points and return array of shapes
     * Assumed (but not checked) that all points lay on the line
     * @param {Point | Point[]} pt
     * @returns {MultilineShapes}
     */
    split(pt: any): any[];
    /**
     * Return new line rotated by angle
     * @param {number} angle - angle in radians
     * @param {Point} center - center of rotation
     */
    rotate(angle: any, center?: geom.Point): geom.Line;
    /**
     * Return new line transformed by affine transformation matrix
     * @param {Matrix} m - affine transformation matrix (a,b,c,d,tx,ty)
     * @returns {Line}
     */
    transform(m: any): geom.Line;
    /**
     * Sort given array of points that lay on a line with respect to coordinate on a line
     * The method assumes that points lay on the line and does not check this
     * @param {Point[]} pts - array of points
     * @returns {Point[]} new array sorted
     */
    sortPoints(pts: any): any;
    get name(): string;
    /**
     * Return string to draw svg segment representing line inside given box
     * @param {Box} box Box representing drawing area
     * @param {Object} attrs - an object with attributes of svg circle element
     */
    svg(box: any, attrs?: {}): string;
    static points2norm(pt1: any, pt2: any): geom.Vector;
}
/**
 * Function to create line equivalent to "new" constructor
 * @param args
 */
export declare const line: (...args: any[]) => geom.Line;
//# sourceMappingURL=Line.d.ts.map