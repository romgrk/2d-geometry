import Errors from '../utils/errors';
import * as Utils from '../utils/utils';
import * as Intersection from "../algorithms/intersection";
import * as geom from "./index";
import { Shape } from "./Shape";
/**
 * Class representing a ray (a half-infinite line).
 */
export class Ray extends Shape {
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
    constructor(...args) {
        super();
        this.pt = new geom.Point();
        this.norm = new geom.Vector(0, 1);
        if (args.length === 0) {
            return;
        }
        if (args.length >= 1 && args[0] instanceof geom.Point) {
            this.pt = args[0].clone();
        }
        if (args.length === 1) {
            return;
        }
        if (args.length === 2 && args[1] instanceof geom.Vector) {
            this.norm = args[1].clone();
            return;
        }
        throw Errors.ILLEGAL_PARAMETERS;
    }
    /**
     * Return new cloned instance of ray
     * @returns {Ray}
     */
    clone() {
        return new Ray(this.pt, this.norm);
    }
    /**
     * Slope of the ray - angle in radians between ray and axe x from 0 to 2PI
     * @returns {number} - slope of the line
     */
    get slope() {
        let vec = new geom.Vector(this.norm.y, -this.norm.x);
        return vec.slope;
    }
    /**
     * Returns half-infinite bounding box of the ray
     * @returns {Box} - bounding box
     */
    get box() {
        let slope = this.slope;
        return new geom.Box(slope > Math.PI / 2 && slope < 3 * Math.PI / 2 ? Number.NEGATIVE_INFINITY : this.pt.x, slope >= 0 && slope <= Math.PI ? this.pt.y : Number.NEGATIVE_INFINITY, slope >= Math.PI / 2 && slope <= 3 * Math.PI / 2 ? this.pt.x : Number.POSITIVE_INFINITY, slope >= Math.PI && slope <= 2 * Math.PI || slope === 0 ? this.pt.y : Number.POSITIVE_INFINITY);
    }
    /**
     * Return ray start point
     * @returns {Point} - ray start point
     */
    get start() {
        return this.pt;
    }
    /**
     * Ray has no end point?
     * @returns {undefined}
     */
    get end() { return undefined; }
    /**
     * Return positive infinity number as length
     * @returns {number}
     */
    get length() { return Number.POSITIVE_INFINITY; }
    /**
     * Returns true if point belongs to ray
     * @param {Point} pt Query point
     * @returns {boolean}
     */
    contains(pt) {
        if (this.pt.equalTo(pt)) {
            return true;
        }
        /* Ray contains point if vector to point is orthogonal to the ray normal vector
            and cross product from vector to point is positive */
        let vec = new geom.Vector(this.pt, pt);
        return Utils.EQ_0(this.norm.dot(vec)) && Utils.GE(vec.cross(this.norm), 0);
    }
    /**
     * Split ray with point and return array of segment and new ray
     * @param {Point} pt
     * @returns [Segment,Ray]
     */
    split(pt) {
        if (!this.contains(pt))
            return [];
        if (this.pt.equalTo(pt)) {
            return [this];
        }
        return [
            new geom.Segment(this.pt, pt),
            new geom.Ray(pt, this.norm)
        ];
    }
    /**
     * Returns array of intersection points between ray and another shape
     * @param {Shape} shape - Shape to intersect with ray
     * @returns {Point[]} array of intersection points
     */
    intersect(shape) {
        if (shape instanceof geom.Point) {
            return this.contains(shape) ? [shape] : [];
        }
        if (shape instanceof geom.Segment) {
            return Intersection.intersectRay2Segment(this, shape);
        }
        if (shape instanceof geom.Arc) {
            return Intersection.intersectRay2Arc(this, shape);
        }
        if (shape instanceof geom.Line) {
            return Intersection.intersectRay2Line(this, shape);
        }
        if (shape instanceof geom.Ray) {
            return Intersection.intersectRay2Ray(this, shape);
        }
        if (shape instanceof geom.Circle) {
            return Intersection.intersectRay2Circle(this, shape);
        }
        if (shape instanceof geom.Box) {
            return Intersection.intersectRay2Box(this, shape);
        }
        if (shape instanceof geom.Polygon) {
            return Intersection.intersectRay2Polygon(this, shape);
        }
    }
    /**
     * Return new line rotated by angle
     * @param {number} angle - angle in radians
     * @param {Point} center - center of rotation
     */
    rotate(angle, center = new geom.Point()) {
        return new geom.Ray(this.pt.rotate(angle, center), this.norm.rotate(angle));
    }
    /**
     * Return new ray transformed by affine transformation matrix
     * @param {Matrix} m - affine transformation matrix (a,b,c,d,tx,ty)
     * @returns {Ray}
     */
    transform(m) {
        return new geom.Ray(this.pt.transform(m), this.norm.clone());
    }
    get name() {
        return "ray";
    }
    /**
     * Return string to draw svg segment representing ray inside given box
     * @param {Box} box Box representing drawing area
     * @param {Object} attrs - an object with attributes of svg segment element
     */
    svg(box, attrs = {}) {
        let line = new geom.Line(this.pt, this.norm);
        let ip = Intersection.intersectLine2Box(line, box);
        ip = ip.filter(pt => this.contains(pt));
        if (ip.length === 0 || ip.length === 2)
            return "";
        let segment = new geom.Segment(this.pt, ip[0]);
        return segment.svg(attrs);
    }
}
export const ray = (...args) => new geom.Ray(...args);
