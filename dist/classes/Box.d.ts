import { Matrix, Point, Segment, Shape } from "./index";
/**
 * Class Box represents bounding box of the shape.
 * It may also represent axis-aligned rectangle
 * @type {Box}
 */
export declare class Box extends Shape<Box> {
    /** Minimal x coordinate */
    xmin: number;
    /** Minimal y coordinate */
    ymin: number;
    /** Maximal x coordinate */
    xmax: number;
    /** Maximal y coordinate */
    ymax: number;
    /**
     *
     * @param xmin - minimal x coordinate
     * @param ymin - minimal y coordinate
     * @param xmax - maximal x coordinate
     * @param ymax - maximal y coordinate
     */
    constructor(xmin?: any, ymin?: any, xmax?: any, ymax?: any);
    /**
     * Return new cloned instance of box
     */
    clone(): Box;
    /**
     * Property low need for interval tree interface
     */
    get low(): Point;
    /**
     * Property high need for interval tree interface
     * @returns {Point}
     */
    get high(): Point;
    /**
     * Property max returns the box itself !
     * @returns {Box}
     */
    get max(): Box;
    /**
     * Return center of the box
     * @returns {Point}
     */
    get center(): Point;
    /**
     * Return the width of the box
     * @returns {number}
     */
    get width(): number;
    /**
     * Return the height of the box
     * @returns {number}
     */
    get height(): number;
    /**
     * Return property box like all other shapes
     * @returns {Box}
     */
    get box(): Box;
    /**
     * Returns true if not intersected with other box
     * @param {Box} other_box - other box to test
     * @returns {boolean}
     */
    not_intersect(other_box: any): boolean;
    /**
     * Returns true if intersected with other box
     * @param {Box} other_box - Query box
     * @returns {boolean}
     */
    intersect(other_box: any): boolean;
    /**
     * Returns new box merged with other box
     * @param {Box} other_box - Other box to merge with
     * @returns {Box}
     */
    merge(other_box: any): Box;
    /**
     * Defines predicate "less than" between two boxes. Need for interval index
     * @param {Box} other_box - other box
     * @returns {boolean} - true if this box less than other box, false otherwise
     */
    less_than(other_box: any): boolean;
    /**
     * Returns true if this box is equal to other box, false otherwise
     * @param {Box} other_box - query box
     * @returns {boolean}
     */
    equal_to(other_box: any): boolean;
    output(): Box;
    static comparable_max(box1: any, box2: any): any;
    static comparable_less_than(pt1: any, pt2: any): any;
    /**
     * Set new values to the box object
     * @param {number} xmin - mininal x coordinate
     * @param {number} ymin - minimal y coordinate
     * @param {number} xmax - maximal x coordinate
     * @param {number} ymax - maximal y coordinate
     */
    set(xmin: any, ymin: any, xmax: any, ymax: any): void;
    /**
     * Transform box into array of points from low left corner in counterclockwise
     * @returns {Point[]}
     */
    toPoints(): Point[];
    /**
     * Transform box into array of segments from low left corner in counterclockwise
     * @returns {Segment[]}
     */
    toSegments(): Segment[];
    /**
     * Box rotation is not supported
     * Attempt to rotate box throws error
     * @param {number} angle - angle in radians
     * @param {Point} [center=(0,0)] center
     */
    rotate(angle: any, center?: Point): Box;
    /**
     * Return new box transformed using affine transformation matrix
     * New box is a bounding box of transformed corner points
     * @param {Matrix} m - affine transformation matrix
     * @returns {Box}
     */
    transform(m?: Matrix): Box;
    get name(): string;
    /**
     * Return string to draw box in svg
     * @param {Object} attrs - an object with attributes of svg rectangle element
     * @returns {string}
     */
    svg(attrs?: {}): string;
}
/**
 * Shortcut to create new box
 * @param args
 * @returns {Box}
 */
export declare const box: (...args: any[]) => Box;
//# sourceMappingURL=Box.d.ts.map