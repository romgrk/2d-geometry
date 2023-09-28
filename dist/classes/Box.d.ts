import { Matrix } from './Matrix';
import { Point } from './Point';
import { Segment } from './Segment';
import { Shape } from './Shape';
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
    constructor(xmin?: number, ymin?: number, xmax?: number, ymax?: number);
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
     */
    get high(): Point;
    /**
     * Property max returns the box itself !
     */
    get max(): Box;
    /**
     * Return center of the box
     */
    get center(): Point;
    /**
     * Return the width of the box
     */
    get width(): number;
    /**
     * Return the height of the box
     */
    get height(): number;
    /**
     * Return property box like all other shapes
     */
    get box(): Box;
    /**
     * Returns true if not intersected with other box
     * @param otherBox - other box to test
     */
    notIntersect(otherBox: Box): boolean;
    /**
     * Returns true if intersected with other box
     * @param otherBox - Query box
     */
    intersect(otherBox: Box): boolean;
    /**
     * Returns new box merged with other box
     * @param otherBox - Other box to merge with
     */
    merge(otherBox: Box): Box;
    /**
     * Defines predicate "less than" between two boxes. Need for interval index
     * @param otherBox - other box
     */
    lessThan(otherBox: Box): boolean;
    /**
     * Returns true if this box is equal to other box, false otherwise
     * @param otherBox - query box
     */
    equalTo(otherBox: Box): boolean;
    output(): Box;
    static comparableMax(box1: any, box2: any): any;
    static comparableLessThan(pt1: any, pt2: any): any;
    /**
     * Set new values to the box object
     */
    set(xmin: number, ymin: number, xmax: number, ymax: number): void;
    /**
     * Transform box into array of points from low left corner in counterclockwise
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
 */
export declare const box: (xmin?: number, ymin?: number, xmax?: number, ymax?: number) => Box;
//# sourceMappingURL=Box.d.ts.map