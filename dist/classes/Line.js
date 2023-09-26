"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.line = exports.Line = void 0;
const Intersection = __importStar(require("../algorithms/intersection"));
const errors_1 = __importDefault(require("../utils/errors"));
const distance_1 = require("../algorithms/distance");
const Utils = __importStar(require("../utils/utils"));
const geom = __importStar(require("./index"));
const Shape_1 = require("./Shape");
const Point_1 = require("./Point");
const Vector_1 = require("./Vector");
/**
 * Class representing a line
 * @type {Line}
 */
class Line extends Shape_1.Shape {
    /**
     * Line may be constructed by point and normal vector or by two points that a line passes through
     * @param {Point} pt - point that a line passes through
     * @param {Vector|Point} norm - normal vector to a line or second point a line passes through
     */
    constructor(...args) {
        super();
        /**
         * Point a line passes through
         * @type {Point}
         */
        this.pt = new Point_1.Point();
        /**
         * Normal vector to a line <br/>
         * Vector is normalized (length == 1)<br/>
         * Direction of the vector is chosen to satisfy inequality norm * p >= 0
         * @type {Vector}
         */
        this.norm = new Vector_1.Vector(0, 1);
        if (args.length === 0) {
            return;
        }
        if (args.length === 1 && args[0] instanceof Object && args[0].name === "line") {
            let { pt, norm } = args[0];
            this.pt = new Point_1.Point(pt);
            this.norm = new Vector_1.Vector(norm);
            return;
        }
        if (args.length === 2) {
            let a1 = args[0];
            let a2 = args[1];
            if (a1 instanceof Point_1.Point && a2 instanceof Point_1.Point) {
                this.pt = a1;
                this.norm = Line.points2norm(a1, a2);
                if (this.norm.dot((0, Vector_1.vector)(this.pt.x, this.pt.y)) >= 0) {
                    this.norm.invert();
                }
                return;
            }
            if (a1 instanceof Point_1.Point && a2 instanceof Vector_1.Vector) {
                if (Utils.EQ_0(a2.x) && Utils.EQ_0(a2.y)) {
                    throw errors_1.default.ILLEGAL_PARAMETERS;
                }
                this.pt = a1.clone();
                this.norm = a2.clone();
                this.norm = this.norm.normalize();
                if (this.norm.dot((0, Vector_1.vector)(this.pt.x, this.pt.y)) >= 0) {
                    this.norm.invert();
                }
                return;
            }
            if (a1 instanceof Vector_1.Vector && a2 instanceof Point_1.Point) {
                if (Utils.EQ_0(a1.x) && Utils.EQ_0(a1.y)) {
                    throw errors_1.default.ILLEGAL_PARAMETERS;
                }
                this.pt = a2.clone();
                this.norm = a1.clone();
                this.norm = this.norm.normalize();
                if (this.norm.dot((0, Vector_1.vector)(this.pt.x, this.pt.y)) >= 0) {
                    this.norm.invert();
                }
                return;
            }
        }
        throw errors_1.default.ILLEGAL_PARAMETERS;
    }
    /**
     * Return new cloned instance of line
     * @returns {Line}
     */
    clone() {
        return new Line(this.pt, this.norm);
    }
    /* The following methods need for implementation of Edge interface
    /**
     * Line has no start point
     * @returns {undefined}
     */
    get start() { return undefined; }
    /**
     * Line has no end point
     */
    get end() { return undefined; }
    /**
     * Return positive infinity number as length
     * @returns {number}
     */
    get length() { return Number.POSITIVE_INFINITY; }
    /**
     * Returns infinite box
     * @returns {Box}
     */
    get box() {
        return new geom.Box(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    }
    /**
     * Middle point is undefined
     * @returns {undefined}
     */
    get middle() { return undefined; }
    /**
     * Slope of the line - angle in radians between line and axe x from 0 to 2PI
     * @returns {number} - slope of the line
     */
    get slope() {
        let vec = new Vector_1.Vector(this.norm.y, -this.norm.x);
        return vec.slope;
    }
    /**
     * Get coefficients [A,B,C] of a standard line equation in the form Ax + By = C
     * @code [A, B, C] = line.standard
     * @returns {number[]} - array of coefficients
     */
    get standard() {
        let A = this.norm.x;
        let B = this.norm.y;
        let C = this.norm.dot((0, Vector_1.vector)(this.pt.x, this.pt.y));
        return [A, B, C];
    }
    /**
     * Return true if parallel or incident to other line
     * @param {Line} other_line - line to check
     * @returns {boolean}
     */
    parallelTo(other_line) {
        return Utils.EQ_0(this.norm.cross(other_line.norm));
    }
    /**
     * Returns true if incident to other line
     * @param {Line} other_line - line to check
     * @returns {boolean}
     */
    incidentTo(other_line) {
        return this.parallelTo(other_line) && this.pt.on(other_line);
    }
    /**
     * Returns true if point belongs to line
     * @param {Point} pt Query point
     * @returns {boolean}
     */
    contains(pt) {
        if (this.pt.equalTo(pt)) {
            return true;
        }
        /* Line contains point if vector to point is orthogonal to the line normal vector */
        let vec = new Vector_1.Vector(this.pt, pt);
        return Utils.EQ_0(this.norm.dot(vec));
    }
    /**
     * Return coordinate of the point that lies on the line in the transformed
     * coordinate system where center is the projection of the point(0,0) to
     * the line and axe y is collinear to the normal vector. <br/>
     * This method assumes that point lies on the line and does not check it
     * @param {Point} pt - point on a line
     * @returns {number}
     */
    coord(pt) {
        return (0, Vector_1.vector)(pt.x, pt.y).cross(this.norm);
    }
    /**
     * Returns array of intersection points
     * @param {Shape} shape - shape to intersect with
     * @returns {Point[]}
     */
    intersect(shape) {
        if (shape instanceof geom.Point) {
            return this.contains(shape) ? [shape] : [];
        }
        if (shape instanceof geom.Line) {
            return Intersection.intersectLine2Line(this, shape);
        }
        if (shape instanceof geom.Ray) {
            return Intersection.intersectRay2Line(shape, this);
        }
        if (shape instanceof geom.Circle) {
            return Intersection.intersectLine2Circle(this, shape);
        }
        if (shape instanceof geom.Box) {
            return Intersection.intersectLine2Box(this, shape);
        }
        if (shape instanceof geom.Segment) {
            return Intersection.intersectSegment2Line(shape, this);
        }
        if (shape instanceof geom.Arc) {
            return Intersection.intersectLine2Arc(this, shape);
        }
        if (shape instanceof geom.Polygon) {
            return Intersection.intersectLine2Polygon(this, shape);
        }
    }
    /**
     * Calculate distance and shortest segment from line to shape and returns array [distance, shortest_segment]
     * @param {Shape} shape Shape of the one of the types Point, Circle, Segment, Arc, Polygon
     * @returns {[number, Segment]}
     */
    distanceTo(shape) {
        if (shape instanceof geom.Point) {
            let [distance, shortest_segment] = distance_1.Distance.point2line(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [distance, shortest_segment];
        }
        if (shape instanceof geom.Circle) {
            let [distance, shortest_segment] = distance_1.Distance.circle2line(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [distance, shortest_segment];
        }
        if (shape instanceof geom.Segment) {
            let [distance, shortest_segment] = distance_1.Distance.segment2line(shape, this);
            return [distance, shortest_segment.reverse()];
        }
        if (shape instanceof geom.Arc) {
            let [distance, shortest_segment] = distance_1.Distance.arc2line(shape, this);
            return [distance, shortest_segment.reverse()];
        }
        if (shape instanceof geom.Polygon) {
            let [distance, shortest_segment] = distance_1.Distance.shape2polygon(this, shape);
            return [distance, shortest_segment];
        }
    }
    /**
     * Split line with a point or array of points and return array of shapes
     * Assumed (but not checked) that all points lay on the line
     * @param {Point | Point[]} pt
     * @returns {MultilineShapes}
     */
    split(pt) {
        if (pt instanceof Point_1.Point) {
            return [new geom.Ray(pt, this.norm.invert()), new geom.Ray(pt, this.norm)];
        }
        else {
            let multiline = new geom.Multiline([this]);
            let sorted_points = this.sortPoints(pt);
            multiline.split(sorted_points);
            return multiline.toShapes();
        }
    }
    /**
     * Return new line rotated by angle
     * @param {number} angle - angle in radians
     * @param {Point} center - center of rotation
     */
    rotate(angle, center = new Point_1.Point()) {
        return new Line(this.pt.rotate(angle, center), this.norm.rotate(angle));
    }
    /**
     * Return new line transformed by affine transformation matrix
     * @param {Matrix} m - affine transformation matrix (a,b,c,d,tx,ty)
     * @returns {Line}
     */
    transform(m) {
        return new Line(this.pt.transform(m), this.norm.clone());
    }
    /**
     * Sort given array of points that lay on a line with respect to coordinate on a line
     * The method assumes that points lay on the line and does not check this
     * @param {Point[]} pts - array of points
     * @returns {Point[]} new array sorted
     */
    sortPoints(pts) {
        return pts.slice().sort((pt1, pt2) => {
            if (this.coord(pt1) < this.coord(pt2)) {
                return -1;
            }
            if (this.coord(pt1) > this.coord(pt2)) {
                return 1;
            }
            return 0;
        });
    }
    get name() {
        return "line";
    }
    /**
     * Return string to draw svg segment representing line inside given box
     * @param {Box} box Box representing drawing area
     * @param {Object} attrs - an object with attributes of svg circle element
     */
    svg(box, attrs = {}) {
        let ip = Intersection.intersectLine2Box(this, box);
        if (ip.length === 0)
            return "";
        let ps = ip[0];
        let pe = ip.length === 2 ? ip[1] : ip.find(pt => !pt.equalTo(ps));
        if (pe === undefined)
            pe = ps;
        let segment = new geom.Segment(ps, pe);
        return segment.svg(attrs);
    }
    static points2norm(pt1, pt2) {
        if (pt1.equalTo(pt2)) {
            throw errors_1.default.ILLEGAL_PARAMETERS;
        }
        let vec = new Vector_1.Vector(pt1, pt2);
        let unit = vec.normalize();
        return unit.rotate90CCW();
    }
}
exports.Line = Line;
/**
 * Function to create line equivalent to "new" constructor
 * @param args
 */
const line = (...args) => new Line(...args);
exports.line = line;