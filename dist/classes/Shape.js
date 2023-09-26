"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shape = void 0;
const errors_1 = __importDefault(require("../utils/errors"));
const Matrix_1 = require("./Matrix");
const Point_1 = require("./Point");
/**
 * Base class representing shape
 * Implement common methods of affine transformations
 */
class Shape {
    get name() {
        throw (errors_1.default.CANNOT_INVOKE_ABSTRACT_METHOD);
    }
    get box() {
        throw (errors_1.default.CANNOT_INVOKE_ABSTRACT_METHOD);
    }
    clone() {
        throw (errors_1.default.CANNOT_INVOKE_ABSTRACT_METHOD);
    }
    /**
     * Returns new shape translated by given vector.
     * Translation vector may be also defined by a pair of numbers.
     * @param vector - Translation vector or
     * @param tx - Translation by x-axis
     * @param ty - Translation by y-axis
     */
    translate(...args) {
        return this.transform(new Matrix_1.Matrix().translate(...args));
    }
    /**
     * Returns new shape rotated by given angle around given center point.
     * If center point is omitted, rotates around zero point (0,0).
     * Positive value of angle defines rotation in counterclockwise direction,
     * negative angle defines rotation in clockwise direction
     * @param angle - angle in radians
     * @param [center=(0,0)] center
     */
    rotate(angle, center = new Point_1.Point()) {
        return this.transform(new Matrix_1.Matrix().rotate(angle, center.x, center.y));
    }
    /**
     * Return new shape with coordinates multiplied by scaling factor
     * @param sx - x-axis scaling factor
     * @param sy - y-axis scaling factor
     */
    scale(sx, sy) {
        return this.transform(new Matrix_1.Matrix().scale(sx, sy));
    }
    transform(...args) {
        throw (errors_1.default.CANNOT_INVOKE_ABSTRACT_METHOD);
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
        throw (errors_1.default.CANNOT_INVOKE_ABSTRACT_METHOD);
    }
}
exports.Shape = Shape;
