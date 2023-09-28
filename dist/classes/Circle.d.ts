import * as geom from './index';
import { Shape } from "./Shape";
/**
 * Class representing a circle
 * @type {Circle}
 */
export declare class Circle extends Shape<Circle> {
    /** Circle center */
    pc: geom.Point;
    /** Circle radius */
    r: number;
    /**
     *
     * @param {Point} pc - circle center point
     * @param {number} r - circle radius
     */
    constructor(...args: any[]);
    /**
     * Return new cloned instance of circle
     * @returns {Circle}
     */
    clone(): geom.Circle;
    /**
     * Circle center
     * @returns {Point}
     */
    get center(): geom.Point;
    /**
     * Circle bounding box
     * @returns {Box}
     */
    get box(): geom.Box;
    /**
     * Return true if circle contains shape: no point of shape lies outside of the circle
     * @param {Shape} shape - test shape
     * @returns {boolean}
     */
    contains(shape: any): boolean;
    /**
     * Transform circle to closed arc
     * @param {boolean} counterclockwise
     * @returns {Arc}
     */
    toArc(counterclockwise?: boolean): geom.Arc;
    /**
     * Method scale is supported only for uniform scaling of the circle with (0,0) center
     */
    scale(s: number): any;
    scale(sx: number, sy: number): any;
    /**
     * Return new circle transformed using affine transformation matrix
     */
    transform(matrix?: geom.Matrix): geom.Circle;
    /**
     * Returns array of intersection points between circle and other shape
     */
    intersect(shape: geom.Shape<any>): geom.Point[];
    /**
     * Calculate distance and shortest segment from circle to shape and return array [distance, shortest segment]
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
     * @returns {number} distance from circle to shape
     * @returns {Segment} shortest segment between circle and shape (started at circle, ended at shape)

     */
    distanceTo(shape: any): (number | geom.Segment)[];
    get name(): string;
    /**
     * Return string to draw circle in svg
     * @param {Object} attrs - an object with attributes of svg circle element
     * @returns {string}
     */
    svg(attrs?: {}): string;
}
/**
 * Shortcut to create new circle
 * @param args
 */
export declare const circle: (...args: any[]) => geom.Circle;
//# sourceMappingURL=Circle.d.ts.map