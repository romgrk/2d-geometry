import IntervalTree from '@flatten-js/interval-tree';
import * as geom from '../classes';
export declare class Distance {
    /**
     * Calculate distance and shortest segment between points
     * @param pt1
     * @param pt2
     * @returns {Number | Segment} - distance and shortest segment
     */
    static point2point(pt1: any, pt2: any): [number, geom.Segment];
    /**
     * Calculate distance and shortest segment between point and line
     */
    static point2line(pt: geom.Point, line: geom.Line): [number, geom.Segment];
    /**
     * Calculate distance and shortest segment between point and circle
     */
    static point2circle(pt: geom.Point, circle: geom.Circle): [number, geom.Segment];
    /**
     * Calculate distance and shortest segment between point and segment
     */
    static point2segment(pt: geom.Point, segment: geom.Segment): [number, geom.Segment];
    /**
     * Calculate distance and shortest segment between point and arc
     */
    static point2arc(pt: geom.Point, arc: geom.Arc): [number, geom.Segment];
    /**
     * Calculate distance and shortest segment between segment and line
     */
    static segment2line(seg: geom.Segment, line: geom.Line): [number, geom.Segment];
    /**
     * Calculate distance and shortest segment between two segments
     * @param seg1
     * @param seg2
     * @returns {Number | Segment} - distance and shortest segment
     */
    static segment2segment(seg1: any, seg2: any): [number, geom.Segment];
    /**
     * Calculate distance and shortest segment between segment and circle
     * @param seg
     * @param circle
     * @returns {Number | Segment} - distance and shortest segment
     */
    static segment2circle(seg: any, circle: any): [number, geom.Segment];
    /**
     * Calculate distance and shortest segment between segment and arc
     * @param seg
     * @param arc
     * @returns {Number | Segment} - distance and shortest segment
     */
    static segment2arc(seg: any, arc: any): [number, geom.Segment];
    /**
     * Calculate distance and shortest segment between two circles
     * @param circle1
     * @param circle2
     * @returns {Number | Segment} - distance and shortest segment
     */
    static circle2circle(circle1: any, circle2: any): [number, geom.Segment];
    /**
     * Calculate distance and shortest segment between two circles
     * @param circle
     * @param line
     * @returns {Number | Segment} - distance and shortest segment
     */
    static circle2line(circle: any, line: any): [number, geom.Segment];
    /**
     * Calculate distance and shortest segment between arc and line
     * @param arc
     * @param line
     * @returns {Number | Segment} - distance and shortest segment
     */
    static arc2line(arc: any, line: any): [number, geom.Segment];
    /**
     * Calculate distance and shortest segment between arc and circle
     * @param arc
     * @param circle2
     * @returns {Number | Segment} - distance and shortest segment
     */
    static arc2circle(arc: any, circle2: any): [number, geom.Segment];
    /**
     * Calculate distance and shortest segment between two arcs
     * @param arc1
     * @param arc2
     * @returns {Number | Segment} - distance and shortest segment
     */
    static arc2arc(arc1: any, arc2: any): [number, geom.Segment];
    /**
     * Calculate distance and shortest segment between point and polygon
     * @param point
     * @param polygon
     * @returns {Number | Segment} - distance and shortest segment
     */
    static point2polygon(point: any, polygon: any): [number, geom.Segment];
    static shape2polygon(shape: any, polygon: any): [number, geom.Segment];
    /**
     * Calculate distance and shortest segment between two polygons
     * @param polygon1
     * @param polygon2
     * @returns {Number | Segment} - distance and shortest segment
     */
    static polygon2polygon(polygon1: any, polygon2: any): [number, geom.Segment];
    /**
     * Returns [mindist, maxdist] array of squared minimal and maximal distance between boxes
     * Minimal distance by x is
     *    (box2.xmin - box1.xmax), if box1 is left to box2
     *    (box1.xmin - box2.xmax), if box2 is left to box1
     *    0,                       if box1 and box2 are intersected by x
     * Minimal distance by y is defined in the same way
     *
     * Maximal distance is estimated as a sum of squared dimensions of the merged box
     *
     * @param box1
     * @param box2
     */
    static box2box_minmax(box1: any, box2: any): readonly [number, number];
    static minmax_tree_process_level(shape: any, level: any, min_stop: any, tree: any): any;
    /**
     * Calculates sorted tree of [mindist, maxdist] intervals between query shape
     * and shapes of the planar set.
     * @param shape
     * @param set
     */
    static minmax_tree(shape: any, set: any, min_stop: any): IntervalTree<any>;
    static minmax_tree_calc_distance(shape: any, node: any, min_dist_and_segment: any): any[];
    /**
     * Calculates distance between shape and Planar Set of shapes
     * @param shape
     * @param {PlanarSet} set
     * @param {Number} min_stop
     */
    static shape2planarSet(shape: any, set: any, min_stop?: number): readonly [number, geom.Segment];
    static sort(dist_and_segment: any): void;
    static distance(shape1: any, shape2: any): any;
}
//# sourceMappingURL=distance.d.ts.map