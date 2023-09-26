import { Arc, Face, Segment } from './index';
/**
 * Class representing an edge of polygon. Edge shape may be Segment or Arc.
 * Each edge contains references to the next and previous edges in the face of the polygon.
 *
 * @type {Edge}
 */
export declare class Edge {
    /**
     * Shape of the edge: Segment or Arc
     */
    shape: Segment | Arc;
    /**
     * Pointer to the next edge in the face
     */
    next: Edge;
    /**
     * Pointer to the previous edge in the face
     */
    prev: Edge;
    /**
     * Pointer to the face containing this edge
     */
    face: Face;
    /**
     * "Arc distance" from the face start
     */
    arc_length: number;
    /**
     * Start inclusion flag (inside/outside/boundary)
     */
    bvStart: any;
    /**
     * End inclusion flag (inside/outside/boundary)
     */
    bvEnd: any;
    /**
     * Edge inclusion flag (INSIDE, OUTSIDE, BOUNDARY)
     */
    bv: any;
    /**
     * Overlap flag for boundary edge (Overlap.SAME/Overlap.OPPOSITE)
     */
    overlap: any;
    /**
     * Construct new instance of edge
     * @param shape Shape of type Segment or Arc
     */
    constructor(shape: Segment | Arc);
    /**
     * Get edge start point
     */
    get start(): import("./Point").Point;
    /**
     * Get edge end point
     */
    get end(): import("./Point").Point;
    /**
     * Get edge length
     */
    get length(): any;
    /**
     * Get bounding box of the edge
     * @returns {Box}
     */
    get box(): any;
    isSegment(): boolean;
    isArc(): boolean;
    /**
     * Get middle point of the edge
     * @returns {Point}
     */
    middle(): import("./Point").Point;
    /**
     * Get point at given length
     * @param {number} length - The length along the edge
     * @returns {Point}
     */
    pointAtLength(length: any): import("./Point").Point;
    /**
     * Returns true if point belongs to the edge, false otherwise
     * @param {Point} pt - test point
     */
    contains(pt: any): boolean;
    /**
     * Set inclusion flag of the edge with respect to another polygon
     * Inclusion flag is one of INSIDE, OUTSIDE, BOUNDARY
     * @param polygon
     */
    setInclusion(polygon: any): any;
    /**
     * Set overlapping between two coincident boundary edges
     * Overlapping flag is one of Overlap.SAME or Overlap.OPPOSITE
     * @param edge
     */
    setOverlap(edge: any): void;
    svg(): string;
    toJSON(): any;
}
//# sourceMappingURL=Edge.d.ts.map