import {convertToString} from "../utils/attributes";
import Errors from '../utils/errors'
import { Matrix } from './Matrix'
import { Point } from './Point'
import { Segment } from './Segment'
import { Shape } from './Shape'

/**
 * Class Box represents bounding box of the shape.
 * It may also represent axis-aligned rectangle
 * @type {Box}
 */
export class Box extends Shape<Box> {
    /** Minimal x coordinate */
    xmin: number
    /** Minimal y coordinate */
    ymin: number
    /** Maximal x coordinate */
    xmax: number
    /** Maximal y coordinate */
    ymax: number

    constructor(xmin?: number, ymin?: number, xmax?: number, ymax?: number) {
        super()
        this.xmin = xmin;
        this.ymin = ymin;
        this.xmax = xmax;
        this.ymax = ymax;
    }

    /**
     * Return new cloned instance of box
     */
    clone() {
        return new Box(this.xmin, this.ymin, this.xmax, this.ymax);
    }

    /**
     * Property low need for interval tree interface
     */
    get low() {
        return new Point(this.xmin, this.ymin);
    }

    /**
     * Property high need for interval tree interface
     * @returns {Point}
     */
    get high() {
        return new Point(this.xmax, this.ymax);
    }

    /**
     * Property max returns the box itself !
     * @returns {Box}
     */
    get max() {
        return this.clone();
    }
    
    /**
     * Return center of the box
     * @returns {Point}
     */
    get center() {
        return new Point((this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2);
    }

    /**
     * Return the width of the box
     * @returns {number}
     */
    get width() {
        return Math.abs(this.xmax - this.xmin);
    }

    /**
     * Return the height of the box
     * @returns {number}
     */
    get height() {
        return Math.abs(this.ymax - this.ymin);
    }
    
    /**
     * Return property box like all other shapes
     * @returns {Box}
     */
    get box() {
        return this.clone();
    }

    /**
     * Returns true if not intersected with other box
     * @param {Box} other_box - other box to test
     * @returns {boolean}
     */
    notIntersect(other_box) {
        return (
            this.xmax < other_box.xmin ||
            this.xmin > other_box.xmax ||
            this.ymax < other_box.ymin ||
            this.ymin > other_box.ymax
        );
    }

    /**
     * Returns true if intersected with other box
     * @param {Box} other_box - Query box
     * @returns {boolean}
     */
    intersect(other_box) {
        return !this.notIntersect(other_box);
    }

    /**
     * Returns new box merged with other box
     * @param {Box} other_box - Other box to merge with
     * @returns {Box}
     */
    merge(other_box) {
        return new Box(
            this.xmin === undefined ? other_box.xmin : Math.min(this.xmin, other_box.xmin),
            this.ymin === undefined ? other_box.ymin : Math.min(this.ymin, other_box.ymin),
            this.xmax === undefined ? other_box.xmax : Math.max(this.xmax, other_box.xmax),
            this.ymax === undefined ? other_box.ymax : Math.max(this.ymax, other_box.ymax)
        );
    }

    /**
     * Defines predicate "less than" between two boxes. Need for interval index
     * @param {Box} other_box - other box
     * @returns {boolean} - true if this box less than other box, false otherwise
     */
    less_than(other_box) {
        if (this.low.lessThan(other_box.low))
            return true;
        if (this.low.equalTo(other_box.low) && this.high.lessThan(other_box.high))
            return true;
        return false;
    }

    /**
     * Returns true if this box is equal to other box, false otherwise
     * @param {Box} other_box - query box
     * @returns {boolean}
     */
    equal_to(other_box) {
        return (this.low.equalTo(other_box.low) && this.high.equalTo(other_box.high));
    }

    output() {
        return this.clone();
    }

    static comparable_max(box1, box2) {
        // return pt1.lessThan(pt2) ? pt2.clone() : pt1.clone();
        return box1.merge(box2);
    }

    static comparable_less_than(pt1, pt2) {
        return pt1.lessThan(pt2);
    }

    /**
     * Set new values to the box object
     * @param {number} xmin - mininal x coordinate
     * @param {number} ymin - minimal y coordinate
     * @param {number} xmax - maximal x coordinate
     * @param {number} ymax - maximal y coordinate
     */
    set(xmin, ymin, xmax, ymax) {
        this.xmin = xmin;
        this.ymin = ymin;
        this.xmax = xmax;
        this.ymax = ymax;
    }

    /**
     * Transform box into array of points from low left corner in counterclockwise
     * @returns {Point[]}
     */
    toPoints() {
        return [
            new Point(this.xmin, this.ymin),
            new Point(this.xmax, this.ymin),
            new Point(this.xmax, this.ymax),
            new Point(this.xmin, this.ymax)
        ];
    }

    /**
     * Transform box into array of segments from low left corner in counterclockwise
     * @returns {Segment[]}
     */
    toSegments() {
        let pts = this.toPoints();
        return [
            new Segment(pts[0], pts[1]),
            new Segment(pts[1], pts[2]),
            new Segment(pts[2], pts[3]),
            new Segment(pts[3], pts[0])
        ];
    }

    /**
     * Box rotation is not supported
     * Attempt to rotate box throws error
     * @param {number} angle - angle in radians
     * @param {Point} [center=(0,0)] center
     */
    rotate(angle, center = new Point()): Box {
        throw Errors.OPERATION_IS_NOT_SUPPORTED
    }

    /**
     * Return new box transformed using affine transformation matrix
     * New box is a bounding box of transformed corner points
     * @param {Matrix} m - affine transformation matrix
     * @returns {Box}
     */
    transform(m = new Matrix()) {
        const transformed_points = this.toPoints().map(pt => pt.transform(m))
        return transformed_points.reduce(
            (new_box, pt) => new_box.merge(pt.box), new Box())
    }

    get name() {
        return "box"
    }

    /**
     * Return string to draw box in svg
     * @param {Object} attrs - an object with attributes of svg rectangle element
     * @returns {string}
     */
    svg(attrs = {}) {
        const width = this.xmax - this.xmin;
        const height = this.ymax - this.ymin;
        return `\n<rect x="${this.xmin}" y="${this.ymin}" width=${width} height=${height}
                ${convertToString({fill: "none", ...attrs})} />`;
    };
}

/**
 * Shortcut to create new box
 */
export const box = (xmin?: number, ymin?: number, xmax?: number, ymax?: number) =>
    new Box(xmin, ymin, xmax, ymax);
