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
exports.Edge = void 0;
const constants_1 = require("../utils/constants");
const Utils = __importStar(require("../utils/utils"));
const ray_shooting_1 = require("../algorithms/ray_shooting");
const index_1 = require("./index");
/**
 * Class representing an edge of polygon. Edge shape may be Segment or Arc.
 * Each edge contains references to the next and previous edges in the face of the polygon.
 *
 * @type {Edge}
 */
class Edge {
    /**
     * Construct new instance of edge
     * @param shape Shape of type Segment or Arc
     */
    constructor(shape) {
        this.shape = shape;
        this.next = undefined;
        this.prev = undefined;
        this.face = undefined;
        this.arc_length = 0;
        this.bvStart = undefined;
        this.bvEnd = undefined;
        this.bv = undefined;
        this.overlap = undefined;
    }
    /**
     * Get edge start point
     */
    get start() {
        return this.shape.start;
    }
    /**
     * Get edge end point
     */
    get end() {
        return this.shape.end;
    }
    /**
     * Get edge length
     */
    get length() {
        return this.shape.length;
    }
    /**
     * Get bounding box of the edge
     * @returns {Box}
     */
    get box() {
        return this.shape.box;
    }
    isSegment() {
        return this.shape instanceof index_1.Segment;
    }
    isArc() {
        return this.shape instanceof index_1.Arc;
    }
    /**
     * Get middle point of the edge
     * @returns {Point}
     */
    middle() {
        return this.shape.middle();
    }
    /**
     * Get point at given length
     * @param {number} length - The length along the edge
     * @returns {Point}
     */
    pointAtLength(length) {
        return this.shape.pointAtLength(length);
    }
    /**
     * Returns true if point belongs to the edge, false otherwise
     * @param {Point} pt - test point
     */
    contains(pt) {
        return this.shape.contains(pt);
    }
    /**
     * Set inclusion flag of the edge with respect to another polygon
     * Inclusion flag is one of INSIDE, OUTSIDE, BOUNDARY
     * @param polygon
     */
    setInclusion(polygon) {
        if (this.bv !== undefined)
            return this.bv;
        if (this.shape instanceof index_1.Line || this.shape instanceof index_1.Ray) {
            this.bv = constants_1.Position.OUTSIDE;
            return this.bv;
        }
        if (this.bvStart === undefined) {
            this.bvStart = (0, ray_shooting_1.ray_shoot)(polygon, this.start);
        }
        if (this.bvEnd === undefined) {
            this.bvEnd = (0, ray_shooting_1.ray_shoot)(polygon, this.end);
        }
        /* At least one end outside - the whole edge outside */
        if (this.bvStart === constants_1.Position.OUTSIDE || this.bvEnd == constants_1.Position.OUTSIDE) {
            this.bv = constants_1.Position.OUTSIDE;
        }
        /* At least one end inside - the whole edge inside */
        else if (this.bvStart === constants_1.Position.INSIDE || this.bvEnd == constants_1.Position.INSIDE) {
            this.bv = constants_1.Position.INSIDE;
        }
        /* Both are boundary - check the middle point */
        else {
            let bvMiddle = (0, ray_shooting_1.ray_shoot)(polygon, this.middle());
            // let boundary = this.middle().distanceTo(polygon)[0] < 10*DP_TOL;
            // let bvMiddle = boundary ? BOUNDARY : ray_shoot(polygon, this.middle());
            this.bv = bvMiddle;
        }
        return this.bv;
    }
    /**
     * Set overlapping between two coincident boundary edges
     * Overlapping flag is one of Overlap.SAME or Overlap.OPPOSITE
     * @param edge
     */
    setOverlap(edge) {
        let flag = undefined;
        let shape1 = this.shape;
        let shape2 = edge.shape;
        if (shape1 instanceof index_1.Segment && shape2 instanceof index_1.Segment) {
            if (shape1.start.equalTo(shape2.start) && shape1.end.equalTo(shape2.end)) {
                flag = constants_1.Overlap.SAME;
            }
            else if (shape1.start.equalTo(shape2.end) && shape1.end.equalTo(shape2.start)) {
                flag = constants_1.Overlap.OPPOSITE;
            }
        }
        else if (shape1 instanceof index_1.Arc && shape2 instanceof index_1.Arc) {
            if (shape1.start.equalTo(shape2.start) && shape1.end.equalTo(shape2.end) && /*shape1.counterClockwise === shape2.counterClockwise &&*/
                shape1.middle().equalTo(shape2.middle())) {
                flag = constants_1.Overlap.SAME;
            }
            else if (shape1.start.equalTo(shape2.end) && shape1.end.equalTo(shape2.start) && /*shape1.counterClockwise !== shape2.counterClockwise &&*/
                shape1.middle().equalTo(shape2.middle())) {
                flag = constants_1.Overlap.OPPOSITE;
            }
        }
        else if (shape1 instanceof index_1.Segment && shape2 instanceof index_1.Arc ||
            shape1 instanceof index_1.Arc && shape2 instanceof index_1.Segment) {
            if (shape1.start.equalTo(shape2.start) && shape1.end.equalTo(shape2.end) && shape1.middle().equalTo(shape2.middle())) {
                flag = constants_1.Overlap.SAME;
            }
            else if (shape1.start.equalTo(shape2.end) && shape1.end.equalTo(shape2.start) && shape1.middle().equalTo(shape2.middle())) {
                flag = constants_1.Overlap.OPPOSITE;
            }
        }
        /* Do not update overlap flag if already set on previous chain */
        if (this.overlap === undefined)
            this.overlap = flag;
        if (edge.overlap === undefined)
            edge.overlap = flag;
    }
    svg() {
        if (this.shape instanceof index_1.Segment) {
            return ` L${this.shape.end.x},${this.shape.end.y}`;
        }
        else if (this.shape instanceof index_1.Arc) {
            let arc = this.shape;
            let largeArcFlag;
            let sweepFlag = arc.counterClockwise ? "1" : "0";
            // Draw full circe arc as special case: split it into two half-circles
            if (Utils.EQ(arc.sweep, 2 * Math.PI)) {
                let sign = arc.counterClockwise ? 1 : -1;
                let halfArc1 = new index_1.Arc(arc.pc, arc.r, arc.startAngle, arc.startAngle + sign * Math.PI, arc.counterClockwise);
                let halfArc2 = new index_1.Arc(arc.pc, arc.r, arc.startAngle + sign * Math.PI, arc.endAngle, arc.counterClockwise);
                largeArcFlag = "0";
                return ` A${halfArc1.r},${halfArc1.r} 0 ${largeArcFlag},${sweepFlag} ${halfArc1.end.x},${halfArc1.end.y}
                    A${halfArc2.r},${halfArc2.r} 0 ${largeArcFlag},${sweepFlag} ${halfArc2.end.x},${halfArc2.end.y}`;
            }
            else {
                largeArcFlag = arc.sweep <= Math.PI ? "0" : "1";
                return ` A${arc.r},${arc.r} 0 ${largeArcFlag},${sweepFlag} ${arc.end.x},${arc.end.y}`;
            }
        }
    }
    toJSON() {
        return this.shape.toJSON();
    }
}
exports.Edge = Edge;
;
