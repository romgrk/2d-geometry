export declare const BOOLEAN_UNION = 1;
export declare const BOOLEAN_INTERSECT = 2;
export declare const BOOLEAN_SUBTRACT = 3;
/**
 * Unify two polygons polygons and returns new polygon. <br/>
 * Point belongs to the resulted polygon if it belongs to the first OR to the second polygon
 * @param {Polygon} polygon1 - first operand
 * @param {Polygon} polygon2 - second operand
 * @returns {Polygon}
 */
export declare function unify(polygon1: any, polygon2: any): any;
/**
 * Subtract second polygon from the first and returns new polygon
 * Point belongs to the resulted polygon if it belongs to the first polygon AND NOT to the second polygon
 * @param {Polygon} polygon1 - first operand
 * @param {Polygon} polygon2 - second operand
 * @returns {Polygon}
 */
export declare function subtract(polygon1: any, polygon2: any): any;
/**
 * Intersect two polygons and returns new polygon
 * Point belongs to the resulted polygon is it belongs to the first AND to the second polygon
 * @param {Polygon} polygon1 - first operand
 * @param {Polygon} polygon2 - second operand
 * @returns {Polygon}
 */
export declare function intersect(polygon1: any, polygon2: any): any;
/**
 * Returns boundary of intersection between two polygons as two arrays of shapes (Segments/Arcs) <br/>
 * The first array are shapes from the first polygon, the second array are shapes from the second
 * @param {Polygon} polygon1 - first operand
 * @param {Polygon} polygon2 - second operand
 * @returns {Shape[][]}
 */
export declare function innerClip(polygon1: any, polygon2: any): any[][];
/**
 * Returns boundary of subtraction of the second polygon from first polygon as array of shapes
 * @param {Polygon} polygon1 - first operand
 * @param {Polygon} polygon2 - second operand
 * @returns {Shape[]}
 */
export declare function outerClip(polygon1: any, polygon2: any): any[];
/**
 * Returns intersection points between boundaries of two polygons as two array of points <br/>
 * Points in the first array belong to first polygon, points from the second - to the second.
 * Points in each array are ordered according to the direction of the correspondent polygon
 * @param {Polygon} polygon1 - first operand
 * @param {Polygon} polygon2 - second operand
 * @returns {Point[][]}
 */
export declare function calculateIntersections(polygon1: any, polygon2: any): any[][];
export declare function removeNotRelevantChains(polygon: any, op: any, int_points: any, is_res_polygon: any): void;
export declare function removeOldFaces(polygon: any, int_points: any): void;
export declare function restoreFaces(polygon: any, int_points: any, other_int_points: any): void;
//# sourceMappingURL=boolean_op.d.ts.map