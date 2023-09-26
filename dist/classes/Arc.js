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
Object.defineProperty(exports, "__esModule", { value: true });
exports.arc = exports.Arc = void 0;
const constants_1 = require("../utils/constants");
const distance_1 = require("../algorithms/distance");
const planar_set_1 = require("../data_structures/planar_set");
const Utils = __importStar(require("../utils/utils"));
const Intersection = __importStar(require("../algorithms/intersection"));
const attributes_1 = require("../utils/attributes");
const geom = __importStar(require("./index"));
const Shape_1 = require("./Shape");
/**
 * Class representing a circular arc
 * @type {Arc}
 */
class Arc extends Shape_1.Shape {
    /**
     * @param {Point} pc - arc center
     * @param {number} r - arc radius
     * @param {number} startAngle - start angle in radians from 0 to 2*PI
     * @param {number} endAngle - end angle in radians from 0 to 2*PI
     * @param {boolean} counterClockwise - arc direction, true - clockwise, false - counterclockwise
     */
    constructor(...args) {
        super();
        /**
         * Arc center
         * @type {Point}
         */
        this.pc = new geom.Point();
        /**
         * Arc radius
         * @type {number}
         */
        this.r = 1;
        /**
         * Arc start angle in radians
         * @type {number}
         */
        this.startAngle = 0;
        /**
         * Arc end angle in radians
         * @type {number}
         */
        this.endAngle = 2 * Math.PI;
        /**
         * Arc orientation
         * @type {boolean}
         */
        this.counterClockwise = constants_1.CCW;
        if (args.length === 0)
            return;
        if (args.length === 1 && args[0] instanceof Object && args[0].name === "arc") {
            let { pc, r, startAngle, endAngle, counterClockwise } = args[0];
            this.pc = new geom.Point(pc.x, pc.y);
            this.r = r;
            this.startAngle = startAngle;
            this.endAngle = endAngle;
            this.counterClockwise = counterClockwise;
        }
        else {
            let [pc, r, startAngle, endAngle, counterClockwise] = [...args];
            if (pc && pc instanceof geom.Point)
                this.pc = pc.clone();
            if (r !== undefined)
                this.r = r;
            if (startAngle !== undefined)
                this.startAngle = startAngle;
            if (endAngle !== undefined)
                this.endAngle = endAngle;
            if (counterClockwise !== undefined)
                this.counterClockwise = counterClockwise;
        }
        // throw geom.Errors.ILLEGAL_PARAMETERS; unreachable code
    }
    /**
     * Return new cloned instance of arc
     * @returns {Arc}
     */
    clone() {
        return new geom.Arc(this.pc.clone(), this.r, this.startAngle, this.endAngle, this.counterClockwise);
    }
    /**
     * Get sweep angle in radians. Sweep angle is non-negative number from 0 to 2*PI
     * @returns {number}
     */
    get sweep() {
        if (Utils.EQ(this.startAngle, this.endAngle))
            return 0.0;
        if (Utils.EQ(Math.abs(this.startAngle - this.endAngle), constants_1.PIx2)) {
            return constants_1.PIx2;
        }
        let sweep;
        if (this.counterClockwise) {
            sweep = Utils.GT(this.endAngle, this.startAngle) ?
                this.endAngle - this.startAngle : this.endAngle - this.startAngle + constants_1.PIx2;
        }
        else {
            sweep = Utils.GT(this.startAngle, this.endAngle) ?
                this.startAngle - this.endAngle : this.startAngle - this.endAngle + constants_1.PIx2;
        }
        if (Utils.GT(sweep, constants_1.PIx2)) {
            sweep -= constants_1.PIx2;
        }
        if (Utils.LT(sweep, 0)) {
            sweep += constants_1.PIx2;
        }
        return sweep;
    }
    /**
     * Get start point of arc
     */
    get start() {
        let p0 = new geom.Point(this.pc.x + this.r, this.pc.y);
        return p0.rotate(this.startAngle, this.pc);
    }
    /**
     * Get end point of arc
     */
    get end() {
        let p0 = new geom.Point(this.pc.x + this.r, this.pc.y);
        return p0.rotate(this.endAngle, this.pc);
    }
    /**
     * Get center of arc
     * @returns {Point}
     */
    get center() {
        return this.pc.clone();
    }
    get vertices() {
        return [this.start.clone(), this.end.clone()];
    }
    /**
     * Get arc length
     * @returns {number}
     */
    get length() {
        return Math.abs(this.sweep * this.r);
    }
    /**
     * Get bounding box of the arc
     * @returns {Box}
     */
    get box() {
        let func_arcs = this.breakToFunctional();
        let box = func_arcs.reduce((acc, arc) => acc.merge(arc.start.box), new geom.Box());
        box = box.merge(this.end.box);
        return box;
    }
    /**
     * Returns true if arc contains point, false otherwise
     * @param {Point} pt - point to test
     * @returns {boolean}
     */
    contains(pt) {
        // first check if  point on circle (pc,r)
        if (!Utils.EQ(this.pc.distanceTo(pt)[0], this.r))
            return false;
        // point on circle
        if (pt.equalTo(this.start))
            return true;
        let angle = new geom.Vector(this.pc, pt).slope;
        let test_arc = new geom.Arc(this.pc, this.r, this.startAngle, angle, this.counterClockwise);
        return Utils.LE(test_arc.length, this.length);
    }
    /**
     * When given point belongs to arc, return array of two arcs split by this point. If points is incident
     * to start or end point of the arc, return clone of the arc. If point does not belong to the arcs, return
     * empty array.
     * @param {Point} pt Query point
     * @returns {Arc[]}
     */
    split(pt) {
        if (this.start.equalTo(pt))
            return [null, this.clone()];
        if (this.end.equalTo(pt))
            return [this.clone(), null];
        let angle = new geom.Vector(this.pc, pt).slope;
        return [
            new geom.Arc(this.pc, this.r, this.startAngle, angle, this.counterClockwise),
            new geom.Arc(this.pc, this.r, angle, this.endAngle, this.counterClockwise)
        ];
    }
    /**
     * Return middle point of the arc
     * @returns {Point}
     */
    middle() {
        let endAngle = this.counterClockwise ? this.startAngle + this.sweep / 2 : this.startAngle - this.sweep / 2;
        let arc = new geom.Arc(this.pc, this.r, this.startAngle, endAngle, this.counterClockwise);
        return arc.end;
    }
    /**
     * Get point at given length
     * @param {number} length - The length along the arc
     * @returns {Point}
     */
    pointAtLength(length) {
        if (length > this.length || length < 0)
            return null;
        if (length === 0)
            return this.start;
        if (length === this.length)
            return this.end;
        let factor = length / this.length;
        let endAngle = this.counterClockwise ? this.startAngle + this.sweep * factor : this.startAngle - this.sweep * factor;
        let arc = new geom.Arc(this.pc, this.r, this.startAngle, endAngle, this.counterClockwise);
        return arc.end;
    }
    /**
     * Returns chord height ("sagitta") of the arc
     * @returns {number}
     */
    chordHeight() {
        return (1.0 - Math.cos(Math.abs(this.sweep / 2.0))) * this.r;
    }
    /**
     * Returns array of intersection points between arc and other shape
     * @param {Shape} shape Shape of the one of supported types <br/>
     * @returns {Point[]}
     */
    intersect(shape) {
        if (shape instanceof geom.Point) {
            return this.contains(shape) ? [shape] : [];
        }
        if (shape instanceof geom.Line) {
            return Intersection.intersectLine2Arc(shape, this);
        }
        if (shape instanceof geom.Ray) {
            return Intersection.intersectRay2Arc(shape, this);
        }
        if (shape instanceof geom.Circle) {
            return Intersection.intersectArc2Circle(this, shape);
        }
        if (shape instanceof geom.Segment) {
            return Intersection.intersectSegment2Arc(shape, this);
        }
        if (shape instanceof geom.Box) {
            return Intersection.intersectArc2Box(this, shape);
        }
        if (shape instanceof geom.Arc) {
            return Intersection.intersectArc2Arc(this, shape);
        }
        if (shape instanceof geom.Polygon) {
            return Intersection.intersectArc2Polygon(this, shape);
        }
    }
    /**
     * Calculate distance and shortest segment from arc to shape and return array [distance, shortest segment]
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
     * @returns {number} distance from arc to shape
     * @returns {Segment} shortest segment between arc and shape (started at arc, ended at shape)

     */
    distanceTo(shape) {
        if (shape instanceof geom.Point) {
            let [dist, shortest_segment] = distance_1.Distance.point2arc(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [dist, shortest_segment];
        }
        if (shape instanceof geom.Circle) {
            let [dist, shortest_segment] = distance_1.Distance.arc2circle(this, shape);
            return [dist, shortest_segment];
        }
        if (shape instanceof geom.Line) {
            let [dist, shortest_segment] = distance_1.Distance.arc2line(this, shape);
            return [dist, shortest_segment];
        }
        if (shape instanceof geom.Segment) {
            let [dist, shortest_segment] = distance_1.Distance.segment2arc(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [dist, shortest_segment];
        }
        if (shape instanceof geom.Arc) {
            let [dist, shortest_segment] = distance_1.Distance.arc2arc(this, shape);
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
     * Breaks arc in extreme point 0, pi/2, pi, 3*pi/2 and returns array of sub-arcs
     * @returns {Arc[]}
     */
    breakToFunctional() {
        let func_arcs_array = [];
        let angles = [0, Math.PI / 2, 2 * Math.PI / 2, 3 * Math.PI / 2];
        let pts = [
            this.pc.translate(this.r, 0),
            this.pc.translate(0, this.r),
            this.pc.translate(-this.r, 0),
            this.pc.translate(0, -this.r)
        ];
        // If arc contains extreme point,
        // create test arc started at start point and ended at this extreme point
        let test_arcs = [];
        for (let i = 0; i < 4; i++) {
            if (pts[i].on(this)) {
                test_arcs.push(new geom.Arc(this.pc, this.r, this.startAngle, angles[i], this.counterClockwise));
            }
        }
        if (test_arcs.length === 0) { // arc does contain any extreme point
            func_arcs_array.push(this.clone());
        }
        else { // arc passes extreme point
            // sort these arcs by length
            test_arcs.sort((arc1, arc2) => arc1.length - arc2.length);
            for (let i = 0; i < test_arcs.length; i++) {
                let prev_arc = func_arcs_array.length > 0 ? func_arcs_array[func_arcs_array.length - 1] : undefined;
                let new_arc;
                if (prev_arc) {
                    new_arc = new geom.Arc(this.pc, this.r, prev_arc.endAngle, test_arcs[i].endAngle, this.counterClockwise);
                }
                else {
                    new_arc = new geom.Arc(this.pc, this.r, this.startAngle, test_arcs[i].endAngle, this.counterClockwise);
                }
                if (!Utils.EQ_0(new_arc.length)) {
                    func_arcs_array.push(new_arc.clone());
                }
            }
            // add last sub arc
            let prev_arc = func_arcs_array.length > 0 ? func_arcs_array[func_arcs_array.length - 1] : undefined;
            let new_arc;
            if (prev_arc) {
                new_arc = new geom.Arc(this.pc, this.r, prev_arc.endAngle, this.endAngle, this.counterClockwise);
            }
            else {
                new_arc = new geom.Arc(this.pc, this.r, this.startAngle, this.endAngle, this.counterClockwise);
            }
            // It could be 2*PI when occasionally start = 0 and end = 2*PI but this is not valid for breakToFunctional
            if (!Utils.EQ_0(new_arc.length) && !Utils.EQ(new_arc.sweep, 2 * Math.PI)) {
                func_arcs_array.push(new_arc.clone());
            }
        }
        return func_arcs_array;
    }
    /**
     * Return tangent unit vector in the start point in the direction from start to end
     * @returns {Vector}
     */
    tangentInStart() {
        let vec = new geom.Vector(this.pc, this.start);
        let angle = this.counterClockwise ? Math.PI / 2. : -Math.PI / 2.;
        return vec.rotate(angle).normalize();
    }
    /**
     * Return tangent unit vector in the end point in the direction from end to start
     * @returns {Vector}
     */
    tangentInEnd() {
        let vec = new geom.Vector(this.pc, this.end);
        let angle = this.counterClockwise ? -Math.PI / 2. : Math.PI / 2.;
        return vec.rotate(angle).normalize();
    }
    /**
     * Returns new arc with swapped start and end angles and reversed direction
     * @returns {Arc}
     */
    reverse() {
        return new geom.Arc(this.pc, this.r, this.endAngle, this.startAngle, !this.counterClockwise);
    }
    /**
     * Return new arc transformed using affine transformation matrix <br/>
     */
    transform(matrix = new geom.Matrix()) {
        let newStart = this.start.transform(matrix);
        let newEnd = this.end.transform(matrix);
        let newCenter = this.pc.transform(matrix);
        let newDirection = this.counterClockwise;
        if (matrix.a * matrix.d < 0) {
            newDirection = !newDirection;
        }
        return geom.Arc.arcSE(newCenter, newStart, newEnd, newDirection);
    }
    static arcSE(center, start, end, counterClockwise) {
        let { vector } = geom;
        let startAngle = vector(center, start).slope;
        let endAngle = vector(center, end).slope;
        if (Utils.EQ(startAngle, endAngle)) {
            endAngle += 2 * Math.PI;
            counterClockwise = true;
        }
        let r = vector(center, start).length;
        return new geom.Arc(center, r, startAngle, endAngle, counterClockwise);
    }
    definiteIntegral(ymin = 0) {
        let f_arcs = this.breakToFunctional();
        let area = f_arcs.reduce((acc, arc) => acc + arc.circularSegmentDefiniteIntegral(ymin), 0.0);
        return area;
    }
    circularSegmentDefiniteIntegral(ymin) {
        let line = new geom.Line(this.start, this.end);
        let onLeftSide = this.pc.leftTo(line);
        let segment = new geom.Segment(this.start, this.end);
        let areaTrapez = segment.definiteIntegral(ymin);
        let areaCircularSegment = this.circularSegmentArea();
        let area = onLeftSide ? areaTrapez - areaCircularSegment : areaTrapez + areaCircularSegment;
        return area;
    }
    circularSegmentArea() {
        return (0.5 * this.r * this.r * (this.sweep - Math.sin(this.sweep)));
    }
    /**
     * Sort given array of points from arc start to end, assuming all points lay on the arc
     * @param {Point[]} pts array of points
     * @returns {Point[]} new array sorted
     */
    sortPoints(pts) {
        let { vector } = geom;
        return pts.slice().sort((pt1, pt2) => {
            let slope1 = vector(this.pc, pt1).slope;
            let slope2 = vector(this.pc, pt2).slope;
            if (slope1 < slope2) {
                return -1;
            }
            if (slope1 > slope2) {
                return 1;
            }
            return 0;
        });
    }
    get name() {
        return "arc";
    }
    /**
     * Return string to draw arc in svg
     * @param {Object} attrs - an object with attributes of svg path element
     * @returns {string}
     */
    svg(attrs = {}) {
        let largeArcFlag = this.sweep <= Math.PI ? "0" : "1";
        let sweepFlag = this.counterClockwise ? "1" : "0";
        if (Utils.EQ(this.sweep, 2 * Math.PI)) {
            let circle = new geom.Circle(this.pc, this.r);
            return circle.svg(attrs);
        }
        else {
            return `\n<path d="M${this.start.x},${this.start.y}
                             A${this.r},${this.r} 0 ${largeArcFlag},${sweepFlag} ${this.end.x},${this.end.y}"
                    ${(0, attributes_1.convertToString)({ fill: "none", ...attrs })} />`;
        }
    }
}
exports.Arc = Arc;
/**
 * Function to create arc equivalent to "new" constructor
 * @param args
 */
const arc = (...args) => new geom.Arc(...args);
exports.arc = arc;
