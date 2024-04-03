import { TAU, CCW } from '../utils/constants';
import * as Distance from '../algorithms/distance';
import { PlanarSet } from '../data_structures/PlanarSet';
import * as Utils from '../utils/utils'
import * as Intersection from '../algorithms/intersection';
import {convertToString} from '../utils/attributes';
import * as geom from './index'
import {Point} from './Point';
import { Shape, ShapeTag } from './Shape'

/**
 * Class representing a circular arc
 */
export class Arc extends Shape<Arc> {
    static EMPTY = Object.freeze(new Arc(Point.EMPTY, 0, 0, 0, CCW));

    /**
     * Arc center
     */
    pc: Point
    /**
     * Arc radius
     */
    r: number
    /**
     * Arc start angle in radians
     */
    startAngle: number
    /**
     * Arc end angle in radians
     */
    endAngle: number
    /**
     * Arc orientation
     */
    counterClockwise: boolean

    /**
     * @param {Point} pc - arc center
     * @param {number} r - arc radius
     * @param {number} startAngle - start angle in radians from 0 to 2*PI
     * @param {number} endAngle - end angle in radians from 0 to 2*PI
     * @param {boolean} counterClockwise - arc direction, true - clockwise, false - counterclockwise
     */
    constructor(...args) {
        super()
        this.pc = Point.EMPTY;
        this.r = NaN;
        this.startAngle = NaN;
        this.endAngle = NaN;
        this.r = 1;
        this.startAngle = 0;
        this.endAngle = 2 * Math.PI;
        this.counterClockwise = CCW;

        if (args.length === 0)
            return;

        if (args.length === 1 && args[0] instanceof Object && args[0].name === "arc") {
            let {pc, r, startAngle, endAngle, counterClockwise} = args[0];
            this.pc = new Point(pc.x, pc.y);
            this.r = r;
            this.startAngle = startAngle;
            this.endAngle = endAngle;
            this.counterClockwise = counterClockwise;
        } else {
            let [pc, r, startAngle, endAngle, counterClockwise] = [...args];
            if (pc && pc instanceof Point) this.pc = pc.clone();
            if (r !== undefined) this.r = r;
            if (startAngle !== undefined) this.startAngle = startAngle;
            if (endAngle !== undefined) this.endAngle = endAngle;
            if (counterClockwise !== undefined) this.counterClockwise = counterClockwise;
        }

        // throw geom.Errors.ILLEGAL_PARAMETERS; unreachable code
    }

    /**
     * Return new cloned instance of arc
     */
    clone() {
        return new geom.Arc(this.pc.clone(), this.r, this.startAngle, this.endAngle, this.counterClockwise);
    }

    get tag() {
        return ShapeTag.Arc
    }

    /**
     * Get bounding box of the arc
     */
    get box() {
        let func_arcs = this.breakToFunctional();
        let box = func_arcs.reduce((acc, arc) => acc.merge(arc.start.box), new geom.Box());
        box = box.merge(this.end.box);
        return box;
    }

    get center() {
        return this.pc
    }

    /**
     * Get sweep angle in radians. Sweep angle is non-negative number from 0 to 2*PI
     */
    get sweep() {
        if (Utils.EQ(this.startAngle, this.endAngle))
            return 0.0;
        if (Utils.EQ(Math.abs(this.startAngle - this.endAngle), TAU)) {
            return TAU;
        }
        let sweep: number;
        if (this.counterClockwise) {
            sweep = Utils.GT(this.endAngle, this.startAngle) ?
                this.endAngle - this.startAngle : this.endAngle - this.startAngle + TAU;
        } else {
            sweep = Utils.GT(this.startAngle, this.endAngle) ?
                this.startAngle - this.endAngle : this.startAngle - this.endAngle + TAU;
        }

        if (Utils.GT(sweep, TAU)) {
            sweep -= TAU;
        }
        if (Utils.LT(sweep, 0)) {
            sweep += TAU;
        }
        return sweep;
    }

    /**
     * Get start point of arc
     */
    get start(): Point {
        let p0 = new Point(this.pc.x + this.r, this.pc.y);
        return p0.rotate(this.startAngle, this.pc) as Point;
    }

    /**
     * Get end point of arc
     */
    get end() {
        let p0 = new Point(this.pc.x + this.r, this.pc.y);
        return p0.rotate(this.endAngle, this.pc) as Point;
    }

    get vertices() {
        return [this.start, this.end];
    }

    /**
     * Get arc length
     */
    get length() {
        return Math.abs(this.sweep * this.r);
    }

    /**
     * Returns true if arc contains point, false otherwise
     */
    contains(pt: Point) {
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
     */
    split(pt: Point): (Arc | null)[] {
        if (this.start.equalTo(pt))
            return [null, this.clone()];

        if (this.end.equalTo(pt))
            return [this.clone(), null];

        let angle = new geom.Vector(this.pc, pt).slope;

        return [
            new geom.Arc(this.pc, this.r, this.startAngle, angle, this.counterClockwise),
            new geom.Arc(this.pc, this.r, angle, this.endAngle, this.counterClockwise)
        ]
    }

    splitAtLength(length: number): Arc[] {
        if (Utils.EQ_0(length))
            return [null, this.clone()];

        if (Utils.EQ(length, this.length))
            return [this.clone(), null];

        let angle = this.startAngle + TAU * (length / this.length);

        return [
            new geom.Arc(this.pc, this.r, this.startAngle, angle, this.counterClockwise),
            new geom.Arc(this.pc, this.r, angle, this.endAngle, this.counterClockwise)
        ]
    }

    /**
     * Return middle point of the arc
     */
    middle() {
        let endAngle = this.counterClockwise ? this.startAngle + this.sweep / 2 : this.startAngle - this.sweep / 2;
        let arc = new geom.Arc(this.pc, this.r, this.startAngle, endAngle, this.counterClockwise);
        return arc.end;
    }

    /**
     * Get point at given length
     * @param length - The length along the arc
     */
    pointAtLength(length: number) {
        if (length > this.length || length < 0) return null;
        if (length === 0) return this.start;
        if (length === this.length) return this.end;
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
        if (shape instanceof Point) {
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
            let [dist, shortest_segment] = Distance.point2arc(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [dist, shortest_segment];
        }

        if (shape instanceof geom.Circle) {
            let [dist, shortest_segment] = Distance.arc2circle(this, shape);
            return [dist, shortest_segment];
        }

        if (shape instanceof geom.Line) {
            let [dist, shortest_segment] = Distance.arc2line(this, shape);
            return [dist, shortest_segment];
        }

        if (shape instanceof geom.Segment) {
            let [dist, shortest_segment] = Distance.segment2arc(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [dist, shortest_segment];
        }

        if (shape instanceof geom.Arc) {
            let [dist, shortest_segment] = Distance.arc2arc(this, shape);
            return [dist, shortest_segment];
        }

        if (shape instanceof geom.Polygon) {
            let [dist, shortest_segment] = Distance.shape2polygon(this, shape);
            return [dist, shortest_segment];
        }

        if (shape instanceof PlanarSet) {
            let [dist, shortest_segment] = Distance.shape2planarSet(this, shape);
            return [dist, shortest_segment];
        }
    }

    /**
     * Breaks arc in extreme point 0, pi/2, pi, 3*pi/2 and returns array of sub-arcs
     */
    breakToFunctional() {
        let func_arcs_array = [] as Arc[];
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

        if (test_arcs.length === 0) {                  // arc does contain any extreme point
            func_arcs_array.push(this.clone());
        } else {                                        // arc passes extreme point
            // sort these arcs by length
            test_arcs.sort((arc1, arc2) => arc1.length - arc2.length);

            for (let i = 0; i < test_arcs.length; i++) {
                let prev_arc = func_arcs_array.length > 0 ? func_arcs_array[func_arcs_array.length - 1] : undefined;
                let new_arc;
                if (prev_arc) {
                    new_arc = new geom.Arc(this.pc, this.r, prev_arc.endAngle, test_arcs[i].endAngle, this.counterClockwise);
                } else {
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
            } else {
                new_arc = new geom.Arc(this.pc, this.r, this.startAngle, this.endAngle, this.counterClockwise);
            }
            // It could be 2*PI when occasionally start = 0 and end = 2*PI but this is not valid for breakToFunctional
            if (!Utils.EQ_0(new_arc.length) && !Utils.EQ(new_arc.sweep, 2*Math.PI)) {
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
        let {vector} = geom;
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
        return (0.5 * this.r * this.r * (this.sweep - Math.sin(this.sweep)))
    }

    /**
     * Sort given array of points from arc start to end, assuming all points lay on the arc
     * @param {Point[]} pts array of points
     * @returns {Point[]} new array sorted
     */
    sortPoints(pts) {
        let {vector} = geom;
        return pts.slice().sort( (pt1, pt2) => {
            let slope1 = vector(this.pc, pt1).slope;
            let slope2 = vector(this.pc, pt2).slope;
            if (slope1 < slope2) {
                return -1;
            }
            if (slope1 > slope2) {
                return 1;
            }
            return 0;
        })
    }

    get name() {
        return "arc"
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
        } else {
            return `\n<path d="M${(this.start as any).x},${this.start.y}
                             A${this.r},${this.r} 0 ${largeArcFlag},${sweepFlag} ${this.end.x},${this.end.y}"
                    ${convertToString({fill: "none", ...attrs})} />`
        }
    }

}

/**
 * Function to create arc equivalent to "new" constructor
 * @param args
 */
export const arc = (...args) => new geom.Arc(...args);
