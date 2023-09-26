import Errors from '../utils/errors';
import { Matrix } from './Matrix';
/**
 * Base class representing shape
 * Implement common methods of affine transformations
 */
export class Shape {
    get name() {
        throw (Errors.CANNOT_INVOKE_ABSTRACT_METHOD);
    }
    get box() {
        throw (Errors.CANNOT_INVOKE_ABSTRACT_METHOD);
    }
    clone() {
        throw (Errors.CANNOT_INVOKE_ABSTRACT_METHOD);
    }
    /**
     * Returns new shape translated by given vector.
     * Translation vector may be also defined by a pair of numbers.
     * @param vector - Translation vector or
     * @param tx - Translation by x-axis
     * @param ty - Translation by y-axis
     */
    translate(...args) {
        return this.transform(new Matrix().translate(...args));
    }
    /**
     * Returns new shape rotated by given angle around given center point.
     * If center point is omitted, rotates around zero point (0,0).
     * Positive value of angle defines rotation in counterclockwise direction,
     * negative angle defines rotation in clockwise direction
     * @param angle - angle in radians
     * @param [center=(0,0)] center
     */
    rotate(angle, center = {} /* fixed in _setupShape */) {
        return this.transform(new Matrix().rotate(angle, center.x, center.y));
    }
    /**
     * Return new shape with coordinates multiplied by scaling factor
     * @param sx - x-axis scaling factor
     * @param sy - y-axis scaling factor
     */
    scale(sx, sy) {
        return this.transform(new Matrix().scale(sx, sy));
    }
    transform(...args) {
        throw (Errors.CANNOT_INVOKE_ABSTRACT_METHOD);
    }
    /**
     * This method returns an object that defines how data will be
     * serialized when called JSON.stringify() method
     * @returns {Object}
     */
    toJSON() {
        return Object.assign({}, this, { name: this.name });
    }
    svg(attrs = {}) {
        throw (Errors.CANNOT_INVOKE_ABSTRACT_METHOD);
    }
}
export function _setupShape(point) {
    Shape.prototype.rotate = function rotate(angle, center = point()) {
        return this.transform(new Matrix().rotate(angle, center.x, center.y));
    };
}
