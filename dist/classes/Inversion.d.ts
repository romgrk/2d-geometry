import { Circle, Line } from './index';
/**
 * Class Inversion represent operator of inversion in circle
 * Inversion is a transformation of the Euclidean plane that maps generalized circles
 * (where line is considered as a circle with infinite radius) into generalized circles
 * See also https://en.wikipedia.org/wiki/Inversive_geometry and
 * http://mathworld.wolfram.com/Inversion.html <br/>
 * @type {Inversion}
 */
export declare class Inversion {
    circle: Circle;
    /**
     * Inversion constructor
     * @param {Circle} inversion_circle inversion circle
     */
    constructor(inversion_circle: any);
    get inversion_circle(): Circle;
    static inversePoint(inversion_circle: any, point: any): any;
    static inverseCircle(inversion_circle: any, circle: any): Line | Circle;
    static inverseLine(inversion_circle: any, line: any): any;
    inverse(shape: any): any;
}
/**
 * Shortcut to create inversion operator
 * @param circle
 * @returns {Inversion}
 */
export declare const inversion: (circle: any) => Inversion;
//# sourceMappingURL=Inversion.d.ts.map