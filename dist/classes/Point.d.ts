import * as geom from './index';
import { Shape } from "./Shape";
/**
 * Class representing a point
 * @type {Point}
 */
export declare class Point extends Shape<Point> {
    /** x-coordinate (float number) */
    x: number;
    /** y-coordinate (float number) */
    y: number;
    /**
     * Point may be constructed by two numbers, or by array of two numbers
     * @param {number} x - x-coordinate (float number)
     * @param {number} y - y-coordinate (float number)
     */
    constructor(...args: any[]);
    /**
     * Returns bounding box of a point
     * @returns {Box}
     */
    get box(): geom.Box;
    /**
     * Return new cloned instance of point
     * @returns {Point}
     */
    clone(): geom.Point;
    get vertices(): geom.Point[];
    /**
     * Returns true if points are equal up to [Utils.DP_TOL]{@link DP_TOL} tolerance
     * @param {Point} pt Query point
     * @returns {boolean}
     */
    equalTo(pt: any): boolean;
    /**
     * Defines predicate "less than" between points. Returns true if the point is less than query points, false otherwise <br/>
     * By definition point1 < point2 if {point1.y < point2.y || point1.y == point2.y && point1.x < point2.x <br/>
     * Numeric values compared with [Utils.DP_TOL]{@link DP_TOL} tolerance
     * @param {Point} pt Query point
     * @returns {boolean}
     */
    lessThan(pt: any): boolean;
    /**
     * Return new point transformed by affine transformation matrix
     * @param {Matrix} m - affine transformation matrix (a,b,c,d,tx,ty)
     * @returns {Point}
     */
    transform(m: any): geom.Point;
    /**
     * Returns projection point on given line
     * @param {Line} line Line this point be projected on
     * @returns {Point}
     */
    projectionOn(line: any): any;
    /**
     * Returns true if point belongs to the "left" semi-plane, which means, point belongs to the same semi plane where line normal vector points to
     * Return false if point belongs to the "right" semi-plane or to the line itself
     * @param {Line} line Query line
     * @returns {boolean}
     */
    leftTo(line: any): boolean;
    /**
     * Snap the point to a grid.
     */
    snapToGrid(grid: number): any;
    snapToGrid(xGrid: number, yGrid: number): any;
    /**
     * Calculate distance and shortest segment from point to shape and return as array [distance, shortest segment]
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
     * @returns {number} distance from point to shape
     * @returns {Segment} shortest segment between point and shape (started at point, ended at shape)
     */
    distanceTo(shape: any): any;
    /**
     * Returns true if point is on a shape, false otherwise
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon
     * @returns {boolean}
     */
    on(shape: any): boolean;
    get name(): string;
    /**
     * Return string to draw point in svg as circle with radius "r" <br/>
     * Accept any valid attributes of svg elements as svg object
     * Defaults attribues are: <br/>
     * {
     *    r:"3",
     *    stroke:"black",
     *    strokeWidth:"1",
     *    fill:"red"
     * }
     * @param attrs - Any valid attributes of svg circle element, like "r", "stroke", "strokeWidth", "fill"
     */
    svg(attrs?: Record<string, string>): string;
}
export declare const point: (...args: any[]) => geom.Point;
//# sourceMappingURL=Point.d.ts.map