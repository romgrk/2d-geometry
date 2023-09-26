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
exports.segment = exports.Segment = void 0;
const errors_1 = __importDefault(require("../utils/errors"));
const Utils = __importStar(require("../utils/utils"));
const distance_1 = require("../algorithms/distance");
const Intersection = __importStar(require("../algorithms/intersection"));
const attributes_1 = require("../utils/attributes");
const planar_set_1 = require("../data_structures/planar_set");
const geom = __importStar(require("./index"));
const Shape_1 = require("./Shape");
/**
 * Class representing a segment
 * @type {Segment}
 */
class Segment extends Shape_1.Shape {
    /**
     *
     * @param {Point} ps - start point
     * @param {Point} pe - end point
     */
    constructor(...args) {
        super();
        /**
         * Start point
         * @type {Point}
         */
        this.ps = new geom.Point();
        /**
         * End Point
         * @type {Point}
         */
        this.pe = new geom.Point();
        if (args.length === 0) {
            return;
        }
        if (args.length === 1 && args[0] instanceof Array && args[0].length === 4) {
            let coords = args[0];
            this.ps = new geom.Point(coords[0], coords[1]);
            this.pe = new geom.Point(coords[2], coords[3]);
            return;
        }
        if (args.length === 1 && args[0] instanceof Object && args[0].name === "segment") {
            let { ps, pe } = args[0];
            this.ps = new geom.Point(ps.x, ps.y);
            this.pe = new geom.Point(pe.x, pe.y);
            return;
        }
        // second point omitted issue #84
        if (args.length === 1 && args[0] instanceof geom.Point) {
            this.ps = args[0].clone();
            return;
        }
        if (args.length === 2 && args[0] instanceof geom.Point && args[1] instanceof geom.Point) {
            this.ps = args[0].clone();
            this.pe = args[1].clone();
            return;
        }
        if (args.length === 4) {
            this.ps = new geom.Point(args[0], args[1]);
            this.pe = new geom.Point(args[2], args[3]);
            return;
        }
        throw errors_1.default.ILLEGAL_PARAMETERS;
    }
    /**
     * Return new cloned instance of segment
     * @returns {Segment}
     */
    clone() {
        return new geom.Segment(this.start, this.end);
    }
    /**
     * Start point
     * @returns {Point}
     */
    get start() {
        return this.ps;
    }
    /**
     * End point
     * @returns {Point}
     */
    get end() {
        return this.pe;
    }
    /**
     * Returns array of start and end point
     * @returns [Point,Point]
     */
    get vertices() {
        return [this.ps.clone(), this.pe.clone()];
    }
    /**
     * Length of a segment
     * @returns {number}
     */
    get length() {
        return this.start.distanceTo(this.end)[0];
    }
    /**
     * Slope of the line - angle to axe x in radians from 0 to 2PI
     * @returns {number}
     */
    get slope() {
        let vec = new geom.Vector(this.start, this.end);
        return vec.slope;
    }
    /**
     * Bounding box
     * @returns {Box}
     */
    get box() {
        return new geom.Box(Math.min(this.start.x, this.end.x), Math.min(this.start.y, this.end.y), Math.max(this.start.x, this.end.x), Math.max(this.start.y, this.end.y));
    }
    /**
     * Returns true if equals to query segment, false otherwise
     * @param {Seg} seg - query segment
     * @returns {boolean}
     */
    equalTo(seg) {
        return this.ps.equalTo(seg.ps) && this.pe.equalTo(seg.pe);
    }
    /**
     * Returns true if segment contains point
     * @param {Point} pt Query point
     * @returns {boolean}
     */
    contains(pt) {
        return Utils.EQ_0(this.distanceToPoint(pt));
    }
    /**
     * Returns array of intersection points between segment and other shape
     * @param {Shape} shape - Shape of the one of supported types <br/>
     * @returns {Point[]}
     */
    intersect(shape) {
        if (shape instanceof geom.Point) {
            return this.contains(shape) ? [shape] : [];
        }
        if (shape instanceof geom.Line) {
            return Intersection.intersectSegment2Line(this, shape);
        }
        if (shape instanceof geom.Ray) {
            return Intersection.intersectRay2Segment(shape, this);
        }
        if (shape instanceof geom.Segment) {
            return Intersection.intersectSegment2Segment(this, shape);
        }
        if (shape instanceof geom.Circle) {
            return Intersection.intersectSegment2Circle(this, shape);
        }
        if (shape instanceof geom.Box) {
            return Intersection.intersectSegment2Box(this, shape);
        }
        if (shape instanceof geom.Arc) {
            return Intersection.intersectSegment2Arc(this, shape);
        }
        if (shape instanceof geom.Polygon) {
            return Intersection.intersectSegment2Polygon(this, shape);
        }
    }
    /**
     * Calculate distance and shortest segment from segment to shape and return as array [distance, shortest segment]
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
     * @returns {number} distance from segment to shape
     * @returns {Segment} shortest segment between segment and shape (started at segment, ended at shape)
     */
    distanceTo(shape) {
        if (shape instanceof geom.Point) {
            let [dist, shortest_segment] = distance_1.Distance.point2segment(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [dist, shortest_segment];
        }
        if (shape instanceof geom.Circle) {
            let [dist, shortest_segment] = distance_1.Distance.segment2circle(this, shape);
            return [dist, shortest_segment];
        }
        if (shape instanceof geom.Line) {
            let [dist, shortest_segment] = distance_1.Distance.segment2line(this, shape);
            return [dist, shortest_segment];
        }
        if (shape instanceof geom.Segment) {
            let [dist, shortest_segment] = distance_1.Distance.segment2segment(this, shape);
            return [dist, shortest_segment];
        }
        if (shape instanceof geom.Arc) {
            let [dist, shortest_segment] = distance_1.Distance.segment2arc(this, shape);
            return [dist, shortest_segment];
        }
        if (shape instanceof geom.Polygon) {
            let [dist, shortest_segment] = distance_1.Distance.shape2polygon(this, shape);
            return [dist, shortest_segment];
        }
        if (shape instanceof planar_set_1.PlanarSet) {
            let [dist, shortest_segment] = distance_1.Distance.shape2planarSet(this, shape);
            return [dist, shortest_segment];
        }
    }
    /**
     * Returns unit vector in the direction from start to end
     * @returns {Vector}
     */
    tangentInStart() {
        let vec = new geom.Vector(this.start, this.end);
        return vec.normalize();
    }
    /**
     * Return unit vector in the direction from end to start
     * @returns {Vector}
     */
    tangentInEnd() {
        let vec = new geom.Vector(this.end, this.start);
        return vec.normalize();
    }
    /**
     * Returns new segment with swapped start and end points
     * @returns {Segment}
     */
    reverse() {
        return new Segment(this.end, this.start);
    }
    /**
     * When point belongs to segment, return array of two segments split by given point,
     * if point is inside segment. Returns clone of this segment if query point is incident
     * to start or end point of the segment. Returns empty array if point does not belong to segment
     * @param {Point} pt Query point
     * @returns {Segment[]}
     */
    split(pt) {
        if (this.start.equalTo(pt))
            return [null, this.clone()];
        if (this.end.equalTo(pt))
            return [this.clone(), null];
        return [
            new geom.Segment(this.start, pt),
            new geom.Segment(pt, this.end)
        ];
    }
    /**
     * Return middle point of the segment
     * @returns {Point}
     */
    middle() {
        return new geom.Point((this.start.x + this.end.x) / 2, (this.start.y + this.end.y) / 2);
    }
    /**
     * Get point at given length
     * @param {number} length - The length along the segment
     * @returns {Point}
     */
    pointAtLength(length) {
        if (length > this.length || length < 0)
            return null;
        if (length == 0)
            return this.start;
        if (length == this.length)
            return this.end;
        let factor = length / this.length;
        return new geom.Point((this.end.x - this.start.x) * factor + this.start.x, (this.end.y - this.start.y) * factor + this.start.y);
    }
    distanceToPoint(pt) {
        let [dist, ...rest] = distance_1.Distance.point2segment(pt, this);
        return dist;
    }
    ;
    definiteIntegral(ymin = 0.0) {
        let dx = this.end.x - this.start.x;
        let dy1 = this.start.y - ymin;
        let dy2 = this.end.y - ymin;
        return (dx * (dy1 + dy2) / 2);
    }
    /**
     * Return new segment transformed using affine transformation matrix
     * @param {Matrix} matrix - affine transformation matrix
     * @returns {Segment} - transformed segment
     */
    transform(matrix = new geom.Matrix()) {
        return new Segment(this.ps.transform(matrix), this.pe.transform(matrix));
    }
    /**
     * Returns true if segment start is equal to segment end up to DP_TOL
     * @returns {boolean}
     */
    isZeroLength() {
        return this.ps.equalTo(this.pe);
    }
    /**
     * Sort given array of points from segment start to end, assuming all points lay on the segment
     * @param {Point[]} - array of points
     * @returns {Point[]} new array sorted
     */
    sortPoints(pts) {
        let line = new geom.Line(this.start, this.end);
        return line.sortPoints(pts);
    }
    get name() {
        return "segment";
    }
    /**
     * Return string to draw segment in svg
     * @param {Object} attrs - an object with attributes for svg path element,
     * like "stroke", "strokeWidth" <br/>
     * Defaults are stroke:"black", strokeWidth:"1"
     * @returns {string}
     */
    svg(attrs = {}) {
        return `\n<line x1="${this.start.x}" y1="${this.start.y}" x2="${this.end.x}" y2="${this.end.y}" ${(0, attributes_1.convertToString)(attrs)} />`;
    }
}
exports.Segment = Segment;
/**
 * Shortcut method to create new segment
 */
const segment = (...args) => new geom.Segment(...args);
exports.segment = segment;
