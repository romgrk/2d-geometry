"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.END_VERTEX = exports.START_VERTEX = exports.NOT_VERTEX = exports.Overlap = exports.OVERLAP_OPPOSITE = exports.OVERLAP_SAME = exports.Position = exports.INTERLACE = exports.CONTAINS = exports.BOUNDARY = exports.OUTSIDE = exports.INSIDE = exports.PIx2 = exports.ORIENTATION = exports.CW = exports.CCW = void 0;
/**
 * Global constant CCW defines counterclockwise direction of arc
 * @type {boolean}
 */
exports.CCW = true;
/**
 * Global constant CW defines clockwise direction of arc
 * @type {boolean}
 */
exports.CW = false;
/**
 * Defines orientation for face of the polygon: clockwise, counterclockwise
 * or not orientable in the case of self-intersection
 * @type {{CW: number, CCW: number, NOT_ORIENTABLE: number}}
 */
exports.ORIENTATION = {
    CCW: -1,
    CW: 1,
    NOT_ORIENTABLE: 0
};
exports.PIx2 = 2 * Math.PI;
exports.INSIDE = 1;
exports.OUTSIDE = 0;
exports.BOUNDARY = 2;
exports.CONTAINS = 3;
exports.INTERLACE = 4;
var Position;
(function (Position) {
    Position[Position["INSIDE"] = 1] = "INSIDE";
    Position[Position["OUTSIDE"] = 0] = "OUTSIDE";
})(Position || (exports.Position = Position = {}));
exports.OVERLAP_SAME = 1;
exports.OVERLAP_OPPOSITE = 2;
var Overlap;
(function (Overlap) {
    Overlap[Overlap["SAME"] = 1] = "SAME";
    Overlap[Overlap["OPPOSITE"] = 2] = "OPPOSITE";
})(Overlap || (exports.Overlap = Overlap = {}));
exports.NOT_VERTEX = 0;
exports.START_VERTEX = 1;
exports.END_VERTEX = 2;
