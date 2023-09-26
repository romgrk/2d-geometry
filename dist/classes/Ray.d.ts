import * as geom from "./index";
import { Shape } from "./Shape";
/**
 * Class representing a ray (a half-infinite line).
 */
export declare class Ray extends Shape<Ray> {
    pt: geom.Point;
    norm: geom.Vector;
    /**
     * Ray may be constructed by setting an <b>origin</b> point and a <b>normal</b> vector, so that any point <b>x</b>
     * on a ray fit an equation: <br />
     *  (<b>x</b> - <b>origin</b>) * <b>vector</b> = 0 <br />
     * Ray defined by constructor is a right semi-infinite line with respect to the normal vector <br/>
     * If normal vector is omitted ray is considered horizontal (normal vector is (0,1)). <br/>
     * Don't be confused: direction of the normal vector is orthogonal to the ray <br/>
     * @param {Point} pt - start point
     * @param {Vector} norm - normal vector
     */
    constructor(...args: any[]);
    /**
     * Return new cloned instance of ray
     * @returns {Ray}
     */
    clone(): geom.Ray;
    /**
     * Slope of the ray - angle in radians between ray and axe x from 0 to 2PI
     * @returns {number} - slope of the line
     */
    get slope(): number;
    /**
     * Returns half-infinite bounding box of the ray
     * @returns {Box} - bounding box
     */
    get box(): geom.Box;
    /**
     * Return ray start point
     * @returns {Point} - ray start point
     */
    get start(): geom.Point;
    /**
     * Ray has no end point?
     * @returns {undefined}
     */
    get end(): any;
    /**
     * Return positive infinity number as length
     * @returns {number}
     */
    get length(): number;
    /**
     * Returns true if point belongs to ray
     * @param {Point} pt Query point
     * @returns {boolean}
     */
    contains(pt: any): boolean;
    /**
     * Split ray with point and return array of segment and new ray
     * @param {Point} pt
     * @returns [Segment,Ray]
     */
    split(pt: any): (geom.Segment | geom.Ray)[];
    /**
     * Returns array of intersection points between ray and another shape
     * @param {Shape} shape - Shape to intersect with ray
     * @returns {Point[]} array of intersection points
     */
    intersect(shape: any): geom.Point[];
    /**
     * Return new line rotated by angle
     * @param {number} angle - angle in radians
     * @param {Point} center - center of rotation
     */
    rotate(angle: any, center?: geom.Point): geom.Ray;
    /**
     * Return new ray transformed by affine transformation matrix
     * @param {Matrix} m - affine transformation matrix (a,b,c,d,tx,ty)
     * @returns {Ray}
     */
    transform(m: any): geom.Ray;
    get name(): string;
    /**
     * Return string to draw svg segment representing ray inside given box
     * @param {Box} box Box representing drawing area
     * @param {Object} attrs - an object with attributes of svg segment element
     */
    svg(box: any, attrs?: {}): string;
}
export declare const ray: (...args: any[]) => geom.Ray;
//# sourceMappingURL=Ray.d.ts.map