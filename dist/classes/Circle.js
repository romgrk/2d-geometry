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
exports.circle = exports.Circle = void 0;
const errors_1 = __importDefault(require("../utils/errors"));
const distance_1 = require("../algorithms/distance");
const planar_set_1 = require("../data_structures/planar_set");
const Utils = __importStar(require("../utils/utils"));
const Intersection = __importStar(require("../algorithms/intersection"));
const attributes_1 = require("../utils/attributes");
const geom = __importStar(require("./index"));
const Shape_1 = require("./Shape");
/**
 * Class representing a circle
 * @type {Circle}
 */
class Circle extends Shape_1.Shape {
    /**
     *
     * @param {Point} pc - circle center point
     * @param {number} r - circle radius
     */
    constructor(...args) {
        super();
        this.pc = new geom.Point();
        this.r = 1;
        if (args.length === 1 && args[0] instanceof Object && args[0].name === "circle") {
            let { pc, r } = args[0];
            this.pc = new geom.Point(pc);
            this.r = r;
        }
        else {
            let [pc, r] = [...args];
            if (pc && pc instanceof geom.Point)
                this.pc = pc.clone();
            if (r !== undefined)
                this.r = r;
        }
        // throw Errors.ILLEGAL_PARAMETERS;    unreachable code
    }
    /**
     * Return new cloned instance of circle
     * @returns {Circle}
     */
    clone() {
        return new geom.Circle(this.pc.clone(), this.r);
    }
    /**
     * Circle center
     * @returns {Point}
     */
    get center() {
        return this.pc;
    }
    /**
     * Circle bounding box
     * @returns {Box}
     */
    get box() {
        return new geom.Box(this.pc.x - this.r, this.pc.y - this.r, this.pc.x + this.r, this.pc.y + this.r);
    }
    /**
     * Return true if circle contains shape: no point of shape lies outside of the circle
     * @param {Shape} shape - test shape
     * @returns {boolean}
     */
    contains(shape) {
        if (shape instanceof geom.Point) {
            return Utils.LE(shape.distanceTo(this.center)[0], this.r);
        }
        if (shape instanceof geom.Segment) {
            return Utils.LE(shape.start.distanceTo(this.center)[0], this.r) &&
                Utils.LE(shape.end.distanceTo(this.center)[0], this.r);
        }
        if (shape instanceof geom.Arc) {
            return this.intersect(shape).length === 0 &&
                Utils.LE(shape.start.distanceTo(this.center)[0], this.r) &&
                Utils.LE(shape.end.distanceTo(this.center)[0], this.r);
        }
        if (shape instanceof geom.Circle) {
            return this.intersect(shape).length === 0 &&
                Utils.LE(shape.r, this.r) &&
                Utils.LE(shape.center.distanceTo(this.center)[0], this.r);
        }
        /* TODO: box, polygon */
    }
    /**
     * Transform circle to closed arc
     * @param {boolean} counterclockwise
     * @returns {Arc}
     */
    toArc(counterclockwise = true) {
        return new geom.Arc(this.center, this.r, Math.PI, -Math.PI, counterclockwise);
    }
    /**
     * Method scale is supported only for uniform scaling of the circle with (0,0) center
     * @param {number} sx
     * @param {number} sy
     * @returns {Circle}
     */
    scale(sx, sy) {
        if (sx !== sy)
            throw errors_1.default.OPERATION_IS_NOT_SUPPORTED;
        if (!(this.pc.x === 0.0 && this.pc.y === 0.0))
            throw errors_1.default.OPERATION_IS_NOT_SUPPORTED;
        return new geom.Circle(this.pc, this.r * sx);
    }
    /**
     * Return new circle transformed using affine transformation matrix
     * @param {Matrix} matrix - affine transformation matrix
     * @returns {Circle}
     */
    transform(matrix = new geom.Matrix()) {
        return new geom.Circle(this.pc.transform(matrix), this.r);
    }
    /**
     * Returns array of intersection points between circle and other shape
     * @param {Shape} shape Shape of the one of supported types
     * @returns {Point[]}
     */
    intersect(shape) {
        if (shape instanceof geom.Point) {
            return this.contains(shape) ? [shape] : [];
        }
        if (shape instanceof geom.Line) {
            return Intersection.intersectLine2Circle(shape, this);
        }
        if (shape instanceof geom.Ray) {
            return Intersection.intersectRay2Circle(shape, this);
        }
        if (shape instanceof geom.Segment) {
            return Intersection.intersectSegment2Circle(shape, this);
        }
        if (shape instanceof geom.Circle) {
            return Intersection.intersectCircle2Circle(shape, this);
        }
        if (shape instanceof geom.Box) {
            return Intersection.intersectCircle2Box(this, shape);
        }
        if (shape instanceof geom.Arc) {
            return Intersection.intersectArc2Circle(shape, this);
        }
        if (shape instanceof geom.Polygon) {
            return Intersection.intersectCircle2Polygon(this, shape);
        }
    }
    /**
     * Calculate distance and shortest segment from circle to shape and return array [distance, shortest segment]
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
     * @returns {number} distance from circle to shape
     * @returns {Segment} shortest segment between circle and shape (started at circle, ended at shape)

     */
    distanceTo(shape) {
        if (shape instanceof geom.Point) {
            let [distance, shortest_segment] = distance_1.Distance.point2circle(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [distance, shortest_segment];
        }
        if (shape instanceof geom.Circle) {
            let [distance, shortest_segment] = distance_1.Distance.circle2circle(this, shape);
            return [distance, shortest_segment];
        }
        if (shape instanceof geom.Line) {
            let [distance, shortest_segment] = distance_1.Distance.circle2line(this, shape);
            return [distance, shortest_segment];
        }
        if (shape instanceof geom.Segment) {
            let [distance, shortest_segment] = distance_1.Distance.segment2circle(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [distance, shortest_segment];
        }
        if (shape instanceof geom.Arc) {
            let [distance, shortest_segment] = distance_1.Distance.arc2circle(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [distance, shortest_segment];
        }
        if (shape instanceof geom.Polygon) {
            let [distance, shortest_segment] = distance_1.Distance.shape2polygon(this, shape);
            return [distance, shortest_segment];
        }
        if (shape instanceof planar_set_1.PlanarSet) {
            let [dist, shortest_segment] = distance_1.Distance.shape2planarSet(this, shape);
            return [dist, shortest_segment];
        }
    }
    get name() {
        return "circle";
    }
    /**
     * Return string to draw circle in svg
     * @param {Object} attrs - an object with attributes of svg circle element
     * @returns {string}
     */
    svg(attrs = {}) {
        return `\n<circle cx="${this.pc.x}" cy="${this.pc.y}" r="${this.r}"
                ${(0, attributes_1.convertToString)({ fill: "none", ...attrs })} />`;
    }
}
exports.Circle = Circle;
/**
 * Shortcut to create new circle
 * @param args
 */
const circle = (...args) => new geom.Circle(...args);
exports.circle = circle;
