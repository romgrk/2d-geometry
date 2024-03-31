import { convertToString } from '../utils/attributes'
import { Arc } from './Arc'
import { Box } from './Box'
import { Bezier } from './Bezier'
import { Matrix } from './Matrix'
import { Point } from './Point'
import { Segment } from './Segment'
import { Shape } from './Shape'

type Part = Segment | Arc | Bezier

/**
 * Class representing a path
 */
export class Path extends Shape<Path> {
    static EMPTY = Object.freeze(new Path([]));

    static fromPoints(points: Point[]) {
        const segments = []
        for (let i = 0; i < points.length - 1; i++) {
            segments.push(new Segment(points[i], points[i + 1]))
        }
        return new Path(segments)
    }

    parts: Part[]
    private _length: number
    private _box: Box | null

    constructor(parts: Part[]) {
        super()
        this.parts = parts
        this._length = NaN
        this._box = null
    }

    clone() {
        return new Path(this.parts)
    }

    contains(other: Shape<unknown>): boolean {
        if (other instanceof Point) {
            return this.parts.some(part => part.contains(other))
        }
        return false
    }

    /**
     * The total path length
     */
    get length() {
        if (Number.isNaN(this._length))
            this._length = this.parts.reduce((l, p) => l + p.length, 0)
        return this._length
    }

    /**
     * Path center
     */
    get center() {
        return this.box.center;
    }

    /**
     * The bounding box
     */
    get box() {
        return (this._box ??= this.parts.reduce((acc, p) => acc = acc.merge(p.box), new Box()))
    }

    /**
     * Return new segment transformed using affine transformation matrix
     */
    transform(matrix = new Matrix()) {
        return new Path(this.parts.map(p => p.transform(matrix)))
    }

    /**
     * Point at a distance along the path.
     */
    pointAtLength(length: number) {
        if (this.parts.length === 0)
            return Point.EMPTY

        let currentLength = 0

        for (let i = 0; i < this.parts.length; i++) {
            const part = this.parts[i]
            currentLength += part.length
            if (currentLength >= length) {
                const lengthInsidePart = length - (currentLength - part.length)
                return part.pointAtLength(lengthInsidePart)
            }
        }
        const last = this.parts[this.parts.length - 1]
        return last.pointAtLength(last.length)
    }

    /**
     * Slice path at lengths `start` and `end`, returning a new path.
     */
    slice(start: number, end: number) {
        if (this.parts.length === 0)
            return this.clone()

        let currentLength = 0
        let newParts = []
        let didStart = false

        for (let i = 0; i < this.parts.length; i++) {
            const part = this.parts[i]
            let didMatchHere = false
            currentLength += part.length

            if (currentLength >= start && !didStart) {
                const lengthInsidePart = start - (currentLength - part.length)
                const [_, second] = part.splitAtLength(lengthInsidePart)
                if (second !== null) {
                    if (currentLength >= end) {
                        const lengthInsidePartEnd = end - (currentLength - part.length)
                        const [first] = second.splitAtLength(lengthInsidePartEnd - lengthInsidePart)
                        if (first !== null)
                            newParts.push(first)
                        return new Path(newParts)
                    } else {
                        newParts.push(second)
                    }
                }
                didStart = true
                didMatchHere = true
            }

            if (currentLength >= end) {
                const lengthInsidePart = end - (currentLength - part.length)
                const [first] = part.splitAtLength(lengthInsidePart)
                if (first !== null)
                    newParts.push(first)
                break
            }

            if (didStart && !didMatchHere) {
                newParts.push(part)
            }
        }

        return new Path(newParts)
    }

    /**
     * Get the SVGPath "d" attribute
     */
    toSVG() {
        const start = this.pointAtLength(0)

        let result = `M${start.x},${start.y} `

        for (const part of this.parts) {
            if (part instanceof Segment) {
                result += `L${part.end.x},${part.end.y}`
            } else {
            throw new Error('unreachable')
            }
        }

        return result
    }

    svg(attrs: Record<any, any> = {}) {
        return (
            `<path d="${this.toSVG()}" ${convertToString({fill: "none", ...attrs})} />`
        );
    };
}
