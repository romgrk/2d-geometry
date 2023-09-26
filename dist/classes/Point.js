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
exports.point = exports.Point = void 0;
const errors_1 = __importDefault(require("../utils/errors"));
const attributes_1 = require("../utils/attributes");
const distance_1 = require("../algorithms/distance");
const Utils = __importStar(require("../utils/utils"));
const geom = __importStar(require("./index"));
const Shape_1 = require("./Shape");
/**
 * Class representing a point
 * @type {Point}
 */
class Point extends Shape_1.Shape {
    /**
     * Point may be constructed by two numbers, or by array of two numbers
     * @param {number} x - x-coordinate (float number)
     * @param {number} y - y-coordinate (float number)
     */
    constructor(...args) {
        super();
        this.x = 0;
        this.y = 0;
        if (args.length === 0) {
            return;
        }
        if (args.length === 1 && args[0] instanceof Array && args[0].length === 2) {
            let arr = args[0];
            if (typeof (arr[0]) == "number" && typeof (arr[1]) == "number") {
                this.x = arr[0];
                this.y = arr[1];
                return;
            }
        }
        if (args.length === 1 && args[0] instanceof Object && args[0].name === "point") {
            let { x, y } = args[0];
            this.x = x;
            this.y = y;
            return;
        }
        if (args.length === 2) {
            if (typeof (args[0]) == "number" && typeof (args[1]) == "number") {
                this.x = args[0];
                this.y = args[1];
                return;
            }
        }
        throw errors_1.default.ILLEGAL_PARAMETERS;
    }
    /**
     * Returns bounding box of a point
     * @returns {Box}
     */
    get box() {
        return new geom.Box(this.x, this.y, this.x, this.y);
    }
    /**
     * Return new cloned instance of point
     * @returns {Point}
     */
    clone() {
        return new Point(this.x, this.y);
    }
    get vertices() {
        return [this.clone()];
    }
    /**
     * Returns true if points are equal up to [Utils.DP_TOL]{@link DP_TOL} tolerance
     * @param {Point} pt Query point
     * @returns {boolean}
     */
    equalTo(pt) {
        return Utils.EQ(this.x, pt.x) && Utils.EQ(this.y, pt.y);
    }
    /**
     * Defines predicate "less than" between points. Returns true if the point is less than query points, false otherwise <br/>
     * By definition point1 < point2 if {point1.y < point2.y || point1.y == point2.y && point1.x < point2.x <br/>
     * Numeric values compared with [Utils.DP_TOL]{@link DP_TOL} tolerance
     * @param {Point} pt Query point
     * @returns {boolean}
     */
    lessThan(pt) {
        if (Utils.LT(this.y, pt.y))
            return true;
        if (Utils.EQ(this.y, pt.y) && Utils.LT(this.x, pt.x))
            return true;
        return false;
    }
    /**
     * Return new point transformed by affine transformation matrix
     * @param {Matrix} m - affine transformation matrix (a,b,c,d,tx,ty)
     * @returns {Point}
     */
    transform(m) {
        return new Point(m.transform([this.x, this.y]));
    }
    /**
     * Returns projection point on given line
     * @param {Line} line Line this point be projected on
     * @returns {Point}
     */
    projectionOn(line) {
        if (this.equalTo(line.pt)) // this point equal to line anchor point
            return this.clone();
        let vec = new geom.Vector(this, line.pt);
        if (Utils.EQ_0(vec.cross(line.norm))) // vector to point from anchor point collinear to normal vector
            return line.pt.clone();
        let dist = vec.dot(line.norm); // signed distance
        let proj_vec = line.norm.multiply(dist);
        return this.translate(proj_vec);
    }
    /**
     * Returns true if point belongs to the "left" semi-plane, which means, point belongs to the same semi plane where line normal vector points to
     * Return false if point belongs to the "right" semi-plane or to the line itself
     * @param {Line} line Query line
     * @returns {boolean}
     */
    leftTo(line) {
        let vec = new geom.Vector(line.pt, this);
        let onLeftSemiPlane = Utils.GT(vec.dot(line.norm), 0);
        return onLeftSemiPlane;
    }
    /**
     * Calculate distance and shortest segment from point to shape and return as array [distance, shortest segment]
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
     * @returns {number} distance from point to shape
     * @returns {Segment} shortest segment between point and shape (started at point, ended at shape)
     */
    distanceTo(shape) {
        if (shape instanceof Point) {
            let dx = shape.x - this.x;
            let dy = shape.y - this.y;
            return [Math.sqrt(dx * dx + dy * dy), new geom.Segment(this, shape)];
        }
        if (shape instanceof geom.Line) {
            return distance_1.Distance.point2line(this, shape);
        }
        if (shape instanceof geom.Circle) {
            return distance_1.Distance.point2circle(this, shape);
        }
        if (shape instanceof geom.Segment) {
            return distance_1.Distance.point2segment(this, shape);
        }
        if (shape instanceof geom.Arc) {
            return distance_1.Distance.point2arc(this, shape);
        }
        if (shape instanceof geom.Polygon) {
            return distance_1.Distance.point2polygon(this, shape);
        }
        // TODO: enable
        // if (shape instanceof PlanarSet) {
        //     return Distance.shape2planarSet(this, shape);
        // }
    }
    /**
     * Returns true if point is on a shape, false otherwise
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon
     * @returns {boolean}
     */
    on(shape) {
        if (shape instanceof geom.Point) {
            return this.equalTo(shape);
        }
        if (shape instanceof geom.Line) {
            return shape.contains(this);
        }
        if (shape instanceof geom.Ray) {
            return shape.contains(this);
        }
        if (shape instanceof geom.Circle) {
            return shape.contains(this);
        }
        if (shape instanceof geom.Segment) {
            return shape.contains(this);
        }
        if (shape instanceof geom.Arc) {
            return shape.contains(this);
        }
        if (shape instanceof geom.Polygon) {
            return shape.contains(this);
        }
    }
    get name() {
        return "point";
    }
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
    svg(attrs = {}) {
        const r = attrs.r ?? 3; // default radius - 3
        return `\n<circle cx="${this.x}" cy="${this.y}" r="${r}"
            ${(0, attributes_1.convertToString)({ fill: "red", ...attrs })} />`;
    }
}
exports.Point = Point;
const point = (...args) => new Point(...args);
exports.point = point;
