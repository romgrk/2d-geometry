import IntervalTree from '@flatten-js/interval-tree';
import { Box } from '../classes/Box';

type AnyShape = {
    box: Box
}

/**
 * Class representing a planar set - a generic container with ability to keep and retrieve shapes and
 * perform spatial queries. Planar set is an extension of Set container, so it supports
 * Set properties and methods
 */
export class PlanarSet extends Set {
    index: IntervalTree

    /**
     * Create new instance of PlanarSet
     * @param shapes - array or set of geometric objects to store in planar set
     * Each object should have a <b>box</b> property
     */
    constructor(shapes?: AnyShape[]) {
        super(shapes);
        this.index = new IntervalTree();
        this.forEach(shape => this.index.insert(shape))
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
    add(shape: AnyShape) {
        let size = this.size;
        super.add(shape);
        // size not changed - item not added, probably trying to add same item twice
        if (this.size > size) {
            let node = this.index.insert(shape.box as any, shape);
        }
        return this;         // in accordance to Set.add interface
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
        this.index = new IntervalTree();
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
        let box = new Box(point.x - 1, point.y - 1, point.x + 1, point.y + 1);
        let resp = this.index.search(box as any);
        return resp.filter((shape) => point.on(shape));
    }

    /**
     * Returns svg string to draw all shapes in planar set
     * @returns {String}
     */
    svg() {
        let svgcontent = [...(this as any)].reduce((acc, shape) => acc + shape.svg(), "");
        return svgcontent;
    }
}
