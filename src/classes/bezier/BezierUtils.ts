import { curves } from './const';

/**
 * Utilities for bezier curves
 * @private
 */
export class BezierUtils
{
    /**
     * Calculate length of bezier curve.
     * Analytical solution is impossible, since it involves an integral that does not integrate in general.
     * Therefore numerical solution is used.
     * @private
     * @param fromX - Starting point x
     * @param fromY - Starting point y
     * @param cpX - Control point x
     * @param cpY - Control point y
     * @param cpX2 - Second Control point x
     * @param cpY2 - Second Control point y
     * @param toX - Destination point x
     * @param toY - Destination point y
     * @returns - Length of bezier curve
     */
    static curveLength(
        fromX: number, fromY: number,
        cpX: number, cpY: number,
        cpX2: number, cpY2: number,
        toX: number, toY: number): number
    {
        const n = 10;
        let result = 0.0;
        let t = 0.0;
        let t2 = 0.0;
        let t3 = 0.0;
        let nt = 0.0;
        let nt2 = 0.0;
        let nt3 = 0.0;
        let x = 0.0;
        let y = 0.0;
        let dx = 0.0;
        let dy = 0.0;
        let prevX = fromX;
        let prevY = fromY;

        for (let i = 1; i <= n; ++i)
        {
            t = i / n;
            t2 = t * t;
            t3 = t2 * t;
            nt = (1.0 - t);
            nt2 = nt * nt;
            nt3 = nt2 * nt;

            x = (nt3 * fromX) + (3.0 * nt2 * t * cpX) + (3.0 * nt * t2 * cpX2) + (t3 * toX);
            y = (nt3 * fromY) + (3.0 * nt2 * t * cpY) + (3 * nt * t2 * cpY2) + (t3 * toY);
            dx = prevX - x;
            dy = prevY - y;
            prevX = x;
            prevY = y;

            result += Math.sqrt((dx * dx) + (dy * dy));
        }

        return result;
    }

    /**
     * Calculate the points for a bezier curve and then draws it.
     *
     * Ignored from docs since it is not directly exposed.
     * @ignore
     * @param toX - Source point x
     * @param toY - Source point y
     * @param cpX - Control point x
     * @param cpY - Control point y
     * @param cpX2 - Second Control point x
     * @param cpY2 - Second Control point y
     * @param toX - Destination point x
     * @param toY - Destination point y
     */
    static curveTo(
        fromX: number, fromY: number,
        cpX: number, cpY: number,
        cpX2: number, cpY2: number,
        toX: number, toY: number)
    {
        const lut = [] as number[] // [x, y, t, len, ...]

        const n = curves._segmentsCount(
            BezierUtils.curveLength(fromX, fromY, cpX, cpY, cpX2, cpY2, toX, toY)
        );

        let dt = 0;
        let dt2 = 0;
        let dt3 = 0;
        let t2 = 0;
        let t3 = 0;

        let lastX = fromX
        let lastY = fromY
        let totalLength = 0;

        lut.push(fromX, fromY, dt, totalLength);

        for (let i = 1, t = 0; i <= n; ++i)
        {
            t = i / n;

            dt = (1 - t);
            dt2 = dt * dt;
            dt3 = dt2 * dt;

            t2 = t * t;
            t3 = t2 * t;

            const x = (dt3 * fromX) + (3 * dt2 * t * cpX) + (3 * dt * t2 * cpX2) + (t3 * toX)
            const y = (dt3 * fromY) + (3 * dt2 * t * cpY) + (3 * dt * t2 * cpY2) + (t3 * toY)

            const dx = x - lastX
            const dy = y - lastY

            totalLength += Math.sqrt(dx * dx + dy * dy)

            lut.push(x, y, t, totalLength);

            lastX = x
            lastY = y
        }

        return lut
    }
}
