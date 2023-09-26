"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanarSet = void 0;
const interval_tree_1 = __importDefault(require("@flatten-js/interval-tree"));
const Box_1 = require("../classes/Box");
/**
 * Class representing a planar set - a generic container with ability to keep and retrieve shapes and
 * perform spatial queries. Planar set is an extension of Set container, so it supports
 * Set properties and methods
 */
class PlanarSet extends Set {
    /**
     * Create new instance of PlanarSet
     * @param shapes - array or set of geometric objects to store in planar set
     * Each object should have a <b>box</b> property
     */
    constructor(shapes) {
        super(shapes);
        this.index = new interval_tree_1.default();
        this.forEach(shape => this.index.insert(shape));
    }
    /**
     * Add new shape to planar set and to its spatial index.<br/>
     * If shape already exist, it will not be added again.
     * This happens with no error, it is possible to use <i>size</i> property to check if
     * a shape was actually added.<br/>
     * Method returns planar set object updated and may be chained
     * @param shape - shape to be added, should have valid <i>box</i> property
     * @returns {PlanarSet}
     */
    add(shape) {
        let size = this.size;
        super.add(shape);
        // size not changed - item not added, probably trying to add same item twice
        if (this.size > size) {
            let node = this.index.insert(shape.box, shape);
        }
        return this; // in accordance to Set.add interface
    }
    /**
     * Delete shape from planar set. Returns true if shape was actually deleted, false otherwise
     * @param {AnyShape} shape - shape to be deleted
     * @returns {boolean}
     */
    delete(shape) {
        let deleted = super.delete(shape);
        if (deleted) {
            this.index.remove(shape.box, shape);
        }
        return deleted;
    }
    /**
     * Clear planar set
     */
    clear() {
        super.clear();
        this.index = new interval_tree_1.default();
    }
    /**
     * 2d range search in planar set.<br/>
     * Returns array of all shapes in planar set which bounding box is intersected with query box
     * @param {Box} box - query box
     * @returns {AnyShape[]}
     */
    search(box) {
        let resp = this.index.search(box);
        return resp;
    }
    /**
     * Point location test. Returns array of shapes which contains given point
     * @param {Point} point - query point
     * @returns {Array}
     */
    hit(point) {
        let box = new Box_1.Box(point.x - 1, point.y - 1, point.x + 1, point.y + 1);
        let resp = this.index.search(box);
        return resp.filter((shape) => point.on(shape));
    }
    /**
     * Returns svg string to draw all shapes in planar set
     * @returns {String}
     */
    svg() {
        let svgcontent = [...this].reduce((acc, shape) => acc + shape.svg(), "");
        return svgcontent;
    }
}
exports.PlanarSet = PlanarSet;
