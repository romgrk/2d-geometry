import IntervalTree from '@flatten-js/interval-tree';
import { Box } from '../classes/Box';
type AnyShape = {
    box: Box;
};
/**
 * Class representing a planar set - a generic container with ability to keep and retrieve shapes and
 * perform spatial queries. Planar set is an extension of Set container, so it supports
 * Set properties and methods
 */
export declare class PlanarSet extends Set {
    index: IntervalTree;
    /**
     * Create new instance of PlanarSet
     * @param shapes - array or set of geometric objects to store in planar set
     * Each object should have a <b>box</b> property
     */
    constructor(shapes?: AnyShape[]);
    /**
     * Add new shape to planar set and to its spatial index.<br/>
     * If shape already exist, it will not be added again.
     * This happens with no error, it is possible to use <i>size</i> property to check if
     * a shape was actually added.<br/>
     * Method returns planar set object updated and may be chained
     * @param shape - shape to be added, should have valid <i>box</i> property
     * @returns {PlanarSet}
     */
    add(shape: AnyShape): this;
    /**
     * Delete shape from planar set. Returns true if shape was actually deleted, false otherwise
     * @param {AnyShape} shape - shape to be deleted
     * @returns {boolean}
     */
    delete(shape: any): boolean;
    /**
     * Clear planar set
     */
    clear(): void;
    /**
     * 2d range search in planar set.<br/>
     * Returns array of all shapes in planar set which bounding box is intersected with query box
     * @param {Box} box - query box
     * @returns {AnyShape[]}
     */
    search(box: any): import("@flatten-js/interval-tree").SearchOutput<any>;
    /**
     * Point location test. Returns array of shapes which contains given point
     * @param {Point} point - query point
     * @returns {Array}
     */
    hit(point: any): any[];
    /**
     * Returns svg string to draw all shapes in planar set
     * @returns {String}
     */
    svg(): any;
}
export {};
//# sourceMappingURL=planar_set.d.ts.map