import Errors from '../utils/errors'
import { Matrix } from './Matrix'
import type { Box } from './Box'
import type { Point } from './Point'
import type { Vector } from './Vector'

export type AnyShape = Shape<unknown>

let ORIGIN_POINT: Point

/**
 * Base class representing shape
 * Implement common methods of affine transformations
 */
export abstract class Shape<T> {
    get name(): string {
        throw(Errors.CANNOT_INVOKE_ABSTRACT_METHOD);
    }

    get box(): Box {
        throw(Errors.CANNOT_INVOKE_ABSTRACT_METHOD);
    }

    clone() {
        throw(Errors.CANNOT_INVOKE_ABSTRACT_METHOD);
    }

    /**
     * Returns new shape translated by given vector.
     * Translation vector may be also defined by a pair of numbers.
     */
    translate(v: Vector): T;
    translate(p: { x: number, y: number }): T;
    translate(x: number, y: number): T;
    translate(a: unknown, b?: unknown): T {
        return this.transform(new Matrix().translate(a as any, b as any))
    }

    /**
     * Returns new shape rotated by given angle around given center point.
     * If center point is omitted, rotates around zero point (0,0).
     * Positive value of angle defines rotation in counterclockwise direction,
     * negative angle defines rotation in clockwise direction
     * @param angle - angle in radians
     * @param [center=(0,0)] center
     */
    rotate(angle: number, center: Point = ORIGIN_POINT): T {
        return this.transform(new Matrix().rotate(angle, center.x, center.y));
    }

    /**
     * Return new shape with coordinates multiplied by scaling factor
     */
    scale(s: number): T;
    scale(sx: number, sy: number): T;
    scale(a: unknown, b?: unknown): T {
        return this.transform(new Matrix().scale(a, b ?? a));
    }

    transform(...args): T {
        throw(Errors.CANNOT_INVOKE_ABSTRACT_METHOD);
    }


    abstract contains(point: Point): boolean

    /**
     * This method returns an object that defines how data will be
     * serialized when called JSON.stringify() method
     * @returns {Object}
     */
    toJSON() {
        return Object.assign({}, this, {name: this.name});
    }

    svg(attrs = {}) {
        throw(Errors.CANNOT_INVOKE_ABSTRACT_METHOD);
    }
}

/**
 * There is a circular dependency between Shape & Point, so we inject point later
 * when everything is properly defined.
 * @private
 */
export function _setupShape(point: Function) {
    ORIGIN_POINT = point()
}
