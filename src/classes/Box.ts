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
    static EMPTY = Object.freeze(new Box(0, 0, 0, 0));

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

    contains(other: Shape<unknown>): boolean {
        if (other instanceof Point) {
            return other.x >= this.xmin && other.x <= this.xmax && other.y >= this.ymin && other.y <= this.ymax
        }

        throw new Error('unimplemented')
    }

    /**
     * Property low need for interval tree interface
     */
    get low() {
        return new Point(this.xmin, this.ymin);
    }

    /**
     * Property high need for interval tree interface
     */
    get high() {
        return new Point(this.xmax, this.ymax);
    }

    /**
     * Property max returns the box itself !
     */
    get max() {
        return this.clone();
    }
    
    /**
     * Return center of the box
     */
    get center() {
        return new Point((this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2);
    }

    /**
     * Return the width of the box
     */
    get width() {
        return Math.abs(this.xmax - this.xmin);
    }

    /**
     * Return the height of the box
     */
    get height() {
        return Math.abs(this.ymax - this.ymin);
    }
    
    /**
     * Return property box like all other shapes
     */
    get box() {
        return this;
    }

    /**
     * Snap the point to a grid.
     */
    snapToGrid(grid: number);
    snapToGrid(xGrid: number, yGrid: number);
    snapToGrid(a: number = 1, b?: unknown) {
        const xGrid = a
        const yGrid = b === undefined ? a : b as number
        return new Box(
            Math.round(this.xmin / xGrid) * xGrid,
            Math.round(this.ymin / yGrid) * yGrid,
            Math.round(this.xmax / xGrid) * xGrid,
            Math.round(this.ymax / yGrid) * yGrid,
        )
    }

    /**
     * Returns true if not intersected with other box
     * @param otherBox - other box to test
     */
    notIntersect(otherBox: Box) {
        return (
            this.xmax < otherBox.xmin ||
            this.xmin > otherBox.xmax ||
            this.ymax < otherBox.ymin ||
            this.ymin > otherBox.ymax
        );
    }

    /**
     * Returns true if intersected with other box
     * @param otherBox - Query box
     */
    intersect(otherBox: Box) {
        return !this.notIntersect(otherBox);
    }

    /**
     * Returns new box merged with other box
     * @param otherBox - Other box to merge with
     */
    merge(otherBox: Box) {
        return new Box(
            this.xmin === undefined ? otherBox.xmin : Math.min(this.xmin, otherBox.xmin),
            this.ymin === undefined ? otherBox.ymin : Math.min(this.ymin, otherBox.ymin),
            this.xmax === undefined ? otherBox.xmax : Math.max(this.xmax, otherBox.xmax),
            this.ymax === undefined ? otherBox.ymax : Math.max(this.ymax, otherBox.ymax)
        );
    }

    /**
     * Defines predicate "less than" between two boxes. Need for interval index
     * @param otherBox - other box
     */
    lessThan(otherBox: Box) {
        if (this.low.lessThan(otherBox.low))
            return true;
        if (this.low.equalTo(otherBox.low) && this.high.lessThan(otherBox.high))
            return true;
        return false;
    }

    /**
     * Returns true if this box is equal to other box, false otherwise
     * @param otherBox - query box
     */
    equalTo(otherBox: Box) {
        return (this.low.equalTo(otherBox.low) && this.high.equalTo(otherBox.high));
    }

    output() {
        return this.clone();
    }

    static comparableMax(box1, box2) {
        // return pt1.lessThan(pt2) ? pt2.clone() : pt1.clone();
        return box1.merge(box2);
    }

    static comparableLessThan(pt1, pt2) {
        return pt1.lessThan(pt2);
    }

    /**
     * Set new values to the box object
     */
    set(xmin: number, ymin: number, xmax: number, ymax: number) {
        this.xmin = xmin;
        this.ymin = ymin;
        this.xmax = xmax;
        this.ymax = ymax;
    }

    /**
     * Transform box into array of points from low left corner in counterclockwise
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
