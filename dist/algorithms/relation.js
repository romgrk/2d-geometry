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
exports.relate = exports.cover = exports.contain = exports.covered = exports.inside = exports.disjoint = exports.touch = exports.intersect = exports.equal = void 0;
const de9im_1 = __importDefault(require("../data_structures/de9im"));
const k = __importStar(require("../utils/constants"));
const intersection_1 = require("./intersection");
const ray_shooting_1 = require("./ray_shooting");
const BooleanOperations = __importStar(require("./boolean_op"));
const Multiline_1 = require("../classes/Multiline");
const geom = __importStar(require("../classes"));
/**
 * Returns true if shapes are topologically equal:  their interiors intersect and
 * no part of the interior or boundary of one geometry intersects the exterior of the other
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
function equal(shape1, shape2) {
    return relate(shape1, shape2).equal();
}
exports.equal = equal;
/**
 * Returns true if shapes have at least one point in common, same as "not disjoint"
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
function intersect(shape1, shape2) {
    return relate(shape1, shape2).intersect();
}
exports.intersect = intersect;
/**
 * Returns true if shapes have at least one point in common, but their interiors do not intersect
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
function touch(shape1, shape2) {
    return relate(shape1, shape2).touch();
}
exports.touch = touch;
/**
 * Returns true if shapes have no points in common neither in interior nor in boundary
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
function disjoint(shape1, shape2) {
    return !intersect(shape1, shape2);
}
exports.disjoint = disjoint;
/**
 * Returns true shape1 lies in the interior of shape2
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
function inside(shape1, shape2) {
    return relate(shape1, shape2).inside();
}
exports.inside = inside;
/**
 * Returns true if every point in shape1 lies in the interior or on the boundary of shape2
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
function covered(shape1, shape2) {
    return relate(shape1, shape2).covered();
}
exports.covered = covered;
/**
 * Returns true shape1's interior contains shape2 <br/>
 * Same as inside(shape2, shape1)
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
function contain(shape1, shape2) {
    return inside(shape2, shape1);
}
exports.contain = contain;
/**
 * Returns true shape1's cover shape2, same as shape2 covered by shape1
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
function cover(shape1, shape2) {
    return covered(shape2, shape1);
}
exports.cover = cover;
/**
 * Returns relation between two shapes as intersection 3x3 matrix, where each
 * element contains relevant intersection as array of shapes.
 * If there is no intersection, element contains empty array
 * If intersection is irrelevant it left undefined. (For example, intersection
 * between two exteriors is usually irrelevant)
 * @param shape1
 * @param shape2
 * @returns {DE9IM}
 */
function relate(shape1, shape2) {
    if (shape1 instanceof geom.Line && shape2 instanceof geom.Line) {
        return relateLine2Line(shape1, shape2);
    }
    else if (shape1 instanceof geom.Line && shape2 instanceof geom.Circle) {
        return relateLine2Circle(shape1, shape2);
    }
    else if (shape1 instanceof geom.Line && shape2 instanceof geom.Box) {
        return relateLine2Box(shape1, shape2);
    }
    else if (shape1 instanceof geom.Line && shape2 instanceof geom.Polygon) {
        return relateLine2Polygon(shape1, shape2);
    }
    else if ((shape1 instanceof geom.Segment || shape1 instanceof geom.Arc) && shape2 instanceof geom.Polygon) {
        return relateShape2Polygon(shape1, shape2);
    }
    else if ((shape1 instanceof geom.Segment || shape1 instanceof geom.Arc) &&
        (shape2 instanceof geom.Circle || shape2 instanceof geom.Box)) {
        return relateShape2Polygon(shape1, new geom.Polygon(shape2));
    }
    else if (shape1 instanceof geom.Polygon && shape2 instanceof geom.Polygon) {
        return relatePolygon2Polygon(shape1, shape2);
    }
    else if ((shape1 instanceof geom.Circle || shape1 instanceof geom.Box) &&
        (shape2 instanceof geom.Circle || shape2 instanceof geom.Box)) {
        return relatePolygon2Polygon(new geom.Polygon(shape1), new geom.Polygon(shape2));
    }
    else if ((shape1 instanceof geom.Circle || shape1 instanceof geom.Box) && shape2 instanceof geom.Polygon) {
        return relatePolygon2Polygon(new geom.Polygon(shape1), shape2);
    }
    else if (shape1 instanceof geom.Polygon && (shape2 instanceof geom.Circle || shape2 instanceof geom.Box)) {
        return relatePolygon2Polygon(shape1, new geom.Polygon(shape2));
    }
}
exports.relate = relate;
function relateLine2Line(line1, line2) {
    let denim = new de9im_1.default();
    let ip = (0, intersection_1.intersectLine2Line)(line1, line2);
    if (ip.length === 0) { // parallel or equal ?
        if (line1.contains(line2.pt) && line2.contains(line1.pt)) {
            denim.I2I = [line1]; // equal  'T.F...F..'  - no boundary
            denim.I2E = [];
            denim.E2I = [];
        }
        else { // parallel - disjoint 'FFTFF*T**'
            denim.I2I = [];
            denim.I2E = [line1];
            denim.E2I = [line2];
        }
    }
    else { // intersect   'T********'
        denim.I2I = ip;
        denim.I2E = line1.split(ip);
        denim.E2I = line2.split(ip);
    }
    return denim;
}
function relateLine2Circle(line, circle) {
    let denim = new de9im_1.default();
    let ip = (0, intersection_1.intersectLine2Circle)(line, circle);
    if (ip.length === 0) {
        denim.I2I = [];
        denim.I2B = [];
        denim.I2E = [line];
        denim.E2I = [circle];
    }
    else if (ip.length === 1) {
        denim.I2I = [];
        denim.I2B = ip;
        denim.I2E = line.split(ip);
        denim.E2I = [circle];
    }
    else { // ip.length == 2
        let multiline = new Multiline_1.Multiline([line]);
        let ip_sorted = line.sortPoints(ip);
        multiline.split(ip_sorted);
        let splitShapes = multiline.toShapes();
        denim.I2I = [splitShapes[1]];
        denim.I2B = ip_sorted;
        denim.I2E = [splitShapes[0], splitShapes[2]];
        denim.E2I = new geom.Polygon([circle.toArc()]).cut(multiline);
    }
    return denim;
}
function relateLine2Box(line, box) {
    let denim = new de9im_1.default();
    let ip = (0, intersection_1.intersectLine2Box)(line, box);
    if (ip.length === 0) {
        denim.I2I = [];
        denim.I2B = [];
        denim.I2E = [line];
        denim.E2I = [box];
    }
    else if (ip.length === 1) {
        denim.I2I = [];
        denim.I2B = ip;
        denim.I2E = line.split(ip);
        denim.E2I = [box];
    }
    else { // ip.length == 2
        let multiline = new Multiline_1.Multiline([line]);
        let ip_sorted = line.sortPoints(ip);
        multiline.split(ip_sorted);
        let splitShapes = multiline.toShapes();
        /* Are two intersection points on the same segment of the box boundary ? */
        if (box.toSegments().some(segment => segment.contains(ip[0]) && segment.contains(ip[1]))) {
            denim.I2I = []; // case of touching
            denim.I2B = [splitShapes[1]];
            denim.I2E = [splitShapes[0], splitShapes[2]];
            denim.E2I = [box];
        }
        else { // case of intersection
            denim.I2I = [splitShapes[1]]; // [segment(ip[0], ip[1])];
            denim.I2B = ip_sorted;
            denim.I2E = [splitShapes[0], splitShapes[2]];
            denim.E2I = new geom.Polygon(box.toSegments()).cut(multiline);
        }
    }
    return denim;
}
function relateLine2Polygon(line, polygon) {
    let denim = new de9im_1.default();
    let ip = (0, intersection_1.intersectLine2Polygon)(line, polygon);
    let multiline = new Multiline_1.Multiline([line]);
    let ip_sorted = ip.length > 0 ? ip.slice() : line.sortPoints(ip);
    multiline.split(ip_sorted);
    [...multiline].forEach(edge => edge.setInclusion(polygon));
    denim.I2I = [...multiline].filter(edge => edge.bv === k.INSIDE).map(edge => edge.shape);
    denim.I2B = [...multiline].slice(1).map((edge) => edge.bv === k.BOUNDARY ? edge.shape : edge.shape.start);
    denim.I2E = [...multiline].filter(edge => edge.bv === k.OUTSIDE).map(edge => edge.shape);
    denim.E2I = polygon.cut(multiline);
    return denim;
}
function relateShape2Polygon(shape, polygon) {
    let denim = new de9im_1.default();
    let ip = (0, intersection_1.intersectShape2Polygon)(shape, polygon);
    let ip_sorted = ip.length > 0 ? ip.slice() : shape.sortPoints(ip);
    let multiline = new Multiline_1.Multiline([shape]);
    multiline.split(ip_sorted);
    [...multiline].forEach(edge => edge.setInclusion(polygon));
    denim.I2I = [...multiline].filter(edge => edge.bv === k.INSIDE).map(edge => edge.shape);
    denim.I2B = [...multiline].slice(1).map((edge) => edge.bv === k.BOUNDARY ? edge.shape : edge.shape.start);
    denim.I2E = [...multiline].filter(edge => edge.bv === k.OUTSIDE).map(edge => edge.shape);
    denim.B2I = [];
    denim.B2B = [];
    denim.B2E = [];
    for (let pt of [shape.start, shape.end]) {
        switch ((0, ray_shooting_1.ray_shoot)(polygon, pt)) {
            case k.INSIDE:
                denim.B2I.push(pt);
                break;
            case k.BOUNDARY:
                denim.B2B.push(pt);
                break;
            case k.OUTSIDE:
                denim.B2E.push(pt);
                break;
            default:
                break;
        }
    }
    // denim.E2I  TODO: calculate, not clear what is expected result
    return denim;
}
function relatePolygon2Polygon(polygon1, polygon2) {
    let denim = new de9im_1.default();
    let [ip_sorted1, ip_sorted2] = BooleanOperations.calculateIntersections(polygon1, polygon2);
    let boolean_intersection = BooleanOperations.intersect(polygon1, polygon2);
    let boolean_difference1 = BooleanOperations.subtract(polygon1, polygon2);
    let boolean_difference2 = BooleanOperations.subtract(polygon2, polygon1);
    let [inner_clip_shapes1, inner_clip_shapes2] = BooleanOperations.innerClip(polygon1, polygon2);
    let outer_clip_shapes1 = BooleanOperations.outerClip(polygon1, polygon2);
    let outer_clip_shapes2 = BooleanOperations.outerClip(polygon2, polygon1);
    denim.I2I = boolean_intersection.isEmpty() ? [] : [boolean_intersection];
    denim.I2B = inner_clip_shapes2;
    denim.I2E = boolean_difference1.isEmpty() ? [] : [boolean_difference1];
    denim.B2I = inner_clip_shapes1;
    denim.B2B = ip_sorted1;
    denim.B2E = outer_clip_shapes1;
    denim.E2I = boolean_difference2.isEmpty() ? [] : [boolean_difference2];
    denim.E2B = outer_clip_shapes2;
    // denim.E2E    not relevant meanwhile
    return denim;
}
