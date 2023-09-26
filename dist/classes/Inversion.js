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
Object.defineProperty(exports, "__esModule", { value: true });
exports.inversion = exports.Inversion = void 0;
const Utils = __importStar(require("../utils/utils"));
const index_1 = require("./index");
/**
 * Class Inversion represent operator of inversion in circle
 * Inversion is a transformation of the Euclidean plane that maps generalized circles
 * (where line is considered as a circle with infinite radius) into generalized circles
 * See also https://en.wikipedia.org/wiki/Inversive_geometry and
 * http://mathworld.wolfram.com/Inversion.html <br/>
 * @type {Inversion}
 */
class Inversion {
    /**
     * Inversion constructor
     * @param {Circle} inversion_circle inversion circle
     */
    constructor(inversion_circle) {
        this.circle = inversion_circle;
    }
    get inversion_circle() {
        return this.circle;
    }
    static inversePoint(inversion_circle, point) {
        const v = new index_1.Vector(inversion_circle.pc, point);
        const k2 = inversion_circle.r * inversion_circle.r;
        const len2 = v.dot(v);
        const reflected_point = Utils.EQ_0(len2) ?
            new index_1.Point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY) :
            inversion_circle.pc.translate(v.multiply(k2 / len2));
        return reflected_point;
    }
    static inverseCircle(inversion_circle, circle) {
        const dist = inversion_circle.pc.distanceTo(circle.pc)[0];
        if (Utils.EQ(dist, circle.r)) { // Circle passing through inversion center mapped into line
            let d = (inversion_circle.r * inversion_circle.r) / (2 * circle.r);
            let v = new index_1.Vector(inversion_circle.pc, circle.pc);
            v = v.normalize();
            let pt = inversion_circle.pc.translate(v.multiply(d));
            return new index_1.Line(pt, v);
        }
        else { // Circle not passing through inversion center - map into another circle */
            /* Taken from http://mathworld.wolfram.com */
            let v = new index_1.Vector(inversion_circle.pc, circle.pc);
            let s = inversion_circle.r * inversion_circle.r / (v.dot(v) - circle.r * circle.r);
            let pc = inversion_circle.pc.translate(v.multiply(s));
            let r = Math.abs(s) * circle.r;
            return new index_1.Circle(pc, r);
        }
    }
    static inverseLine(inversion_circle, line) {
        const [dist, shortest_segment] = inversion_circle.pc.distanceTo(line);
        if (Utils.EQ_0(dist)) { // Line passing through inversion center, is mapping to itself
            return line.clone();
        }
        else { // Line not passing through inversion center is mapping into circle
            let r = inversion_circle.r * inversion_circle.r / (2 * dist);
            let v = new index_1.Vector(inversion_circle.pc, shortest_segment.end);
            v = v.multiply(r / dist);
            return new index_1.Circle(inversion_circle.pc.translate(v), r);
        }
    }
    inverse(shape) {
        if (shape instanceof index_1.Point) {
            return Inversion.inversePoint(this.circle, shape);
        }
        else if (shape instanceof index_1.Circle) {
            return Inversion.inverseCircle(this.circle, shape);
        }
        else if (shape instanceof index_1.Line) {
            return Inversion.inverseLine(this.circle, shape);
        }
    }
}
exports.Inversion = Inversion;
;
/**
 * Shortcut to create inversion operator
 * @param circle
 * @returns {Inversion}
 */
const inversion = (circle) => new Inversion(circle);
exports.inversion = inversion;
