import LinkedList from '../data_structures/linked_list';
import { convertToString } from '../utils/attributes';
import * as geom from './index'
import type { Shape } from './Shape';

type EdgeShape = geom.Segment | geom.Arc | geom.Ray | geom.Line

/**
 * Class Multiline represent connected path of [edges]{@link geom.Edge}, where each edge may be
 * [segment]{@link geom.Segment}, [arc]{@link geom.Arc}, [line]{@link geom.Line} or [ray]{@link geom.Ray}
 */
export class Multiline extends LinkedList<any> {
    edges: geom.Edge[]

    constructor(shapes?: Shape<EdgeShape>[]) {
        super();
        if (shapes) {
            // TODO: more strict validation:
            // there may be only one line
            // only first and last may be rays
            let validShapes = shapes.every((shape) => {
                return shape instanceof geom.Segment ||
                    shape instanceof geom.Arc ||
                    shape instanceof geom.Ray ||
                    shape instanceof geom.Line
            });
            if (!validShapes)
                throw new Error('invalid shapes')

            this.edges = shapes.map(s => new geom.Edge(s as any))
        } else {
            this.edges = []
        }
    }

    /**
     * The bounding box of the multiline
     */
    get box() {
        return this.edges.reduce((acc,edge) => acc = acc.merge(edge.box), new geom.Box());
    }

    /**
     * The array of vertices
     */
    get vertices() {
        let v = this.edges.map(edge => edge.start);
        const last = this.edges[this.edges.length - 1]
        if (last)
            v.push(last.end);
        return v;
    }

    /**
     * Return new cloned instance of Multiline
     */
    clone() {
        return new Multiline(this.toShapes());
    }

    /**
     * Split edge and add new vertex, return new edge inserted
     */
    addVertex(pt: geom.Point, edge: geom.Edge) {
        let shapes = edge.shape.split(pt);
        // if (shapes.length < 2) return;

        if (shapes[0] === null)   // point incident to edge start vertex, return previous edge
           return edge.prev;

        if (shapes[1] === null)   // point incident to edge end vertex, return edge itself
           return edge;

        let newEdge = new geom.Edge(shapes[0]);
        let edgeBefore = edge.prev;

        /* Insert first split edge into linked list after edgeBefore */
        this.insert(newEdge, edgeBefore);     // edge.face ?

        // Update edge shape with second split edge keeping links
        edge.shape = shapes[1];

        return newEdge;
    }

    /**
     * Split edges of multiline with intersection points and return mutated multiline
     * @param {Point[]} ip - array of points to be added as new vertices
     * @returns {Multiline}
     */
    split(ip) {
        for (let pt of ip) {
            let edge = this.findEdgeByPoint(pt);
            this.addVertex(pt, edge);
        }
        return this;
    }

    /**
     * Returns edge which contains given point
     * @param {Point} pt
     * @returns {Edge}
     */
    findEdgeByPoint(pt) {
        let edgeFound;
        for (let edge of this) {
            if (edge.shape.contains(pt)) {
                edgeFound = edge;
                break;
            }
        }
        return edgeFound;
    }

    /**
     * Returns new multiline translated by vector vec
     * @param {Vector} vec
     * @returns {Multiline}
     */
    translate(vec) {
        return new Multiline(this.edges.map( edge => edge.shape.translate(vec)));
    }

    /**
     * Return new multiline rotated by given angle around given point
     * If point omitted, rotate around origin (0,0)
     * Positive value of angle defines rotation counterclockwise, negative - clockwise
     * @param {number} angle - rotation angle in radians
     * @param {Point} center - rotation center, default is (0,0)
     * @returns {Multiline} - new rotated polygon
     */
    rotate(angle = 0, center = new geom.Point()) {
        return new Multiline(this.edges.map( edge => edge.shape.rotate(angle, center) ));
    }

    /**
     * Return new multiline transformed using affine transformation matrix
     * Method does not support unbounded shapes
     * @param {Matrix} matrix - affine transformation matrix
     * @returns {Multiline} - new multiline
     */
    transform(matrix = new geom.Matrix()) {
        return new Multiline(this.edges.map( edge => edge.shape.transform(matrix)));
    }

    /**
     * Transform multiline into array of shapes
     * @returns {Shape[]}
     */
    toShapes() {
        return this.edges.map(edge => edge.shape.clone())
    }

    /**
     * This method returns an object that defines how data will be
     * serialized when called JSON.stringify() method
     * @returns {Object}
     */
    toJSON() {
        return this.edges.map(edge => edge.toJSON());
    }

    /**
     * Return string to draw multiline in svg
     * @param attrs  - an object with attributes for svg path element
     * TODO: support semi-infinite Ray and infinite Line
     * @returns {string}
     */
    svg(attrs = {}) {
        let svgStr = `\n<path ${convertToString({fill: "none", ...attrs})} d="`;
        svgStr += `\nM${this.first.start.x},${this.first.start.y}`;
        for (let edge of this) {
            svgStr += edge.svg();
        }
        svgStr += `" >\n</path>`;
        return svgStr;
    }
}

/**
 * Shortcut function to create multiline
 */
export const multiline = (shapes?: Shape<EdgeShape>[]) => new geom.Multiline(shapes);
