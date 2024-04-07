/*
 * Dimensionally extended 9-intersected model
 * See https://en.wikipedia.org/wiki/DE-9IM for more details
 */

// const DISJOINT = RegExp('FF.FF....');
const EQUAL       = RegExp('T.F..FFF.|T.F...F..');
const INTERSECT   = RegExp('T........|.T.......|...T.....|....T....');
const TOUCH       = RegExp('FT.......|F..T.....|F...T....');
const INSIDE      = RegExp('T.F..F...');
const COVERED     = RegExp('T.F..F...|.TF..F...|..FT.F...|..F.TF...');

class DE9IM {
    /** Array representing 3x3 intersection matrix */
    m: (unknown[] | undefined)[]

    /**
     * Create new instance of DE9IM matrix
     */
    constructor() {
        this.m = new Array(9).fill(undefined);
    }

    /** Get Interior To Interior intersection */
    get I2I() { return this.m[0] }
    /** Set Interior To Interior intersection */
    set I2I(geom) { this.m[0] = geom }

    /** Get Interior To Boundary intersection */
    get I2B() { return this.m[1] }
    /** Set Interior to Boundary intersection */
    set I2B(geom) { this.m[1] = geom }

    /** Get Interior To Exterior intersection */
    get I2E() { return this.m[2] }
    /** Set Interior to Exterior intersection */
    set I2E(geom) { this.m[2] = geom }

    /** Get Boundary To Interior intersection */
    get B2I() { return this.m[3] }
    /** Set Boundary to Interior intersection */
    set B2I(geom) { this.m[3] = geom }

    /** Get Boundary To Boundary intersection */
    get B2B() { return this.m[4] }
    /** Set Boundary to Boundary intersection */
    set B2B(geom) { this.m[4] = geom }

    /** Get Boundary To Exterior intersection */
    get B2E() { return this.m[5] }
    /** Set Boundary to Exterior intersection */
    set B2E(geom) { this.m[5] = geom }

    /** Get Exterior To Interior intersection */
    get E2I() { return this.m[6] }
    /** Set Exterior to Interior intersection */
    set E2I(geom) { this.m[6] = geom }

    /** Get Exterior To Boundary intersection */
    get E2B() { return this.m[7] }
    /** Set Exterior to Boundary intersection */
    set E2B(geom) { this.m[7] = geom }

    /** Get Exterior to Exterior intersection */
    get E2E() { return this.m[8] }
    /** Set Exterior to Exterior intersection */
    set E2E(geom) { this.m[8] = geom }

    /**
     * Return de9im matrix as string where<br/>
     * - intersection is 'T'<br/>
     * - not intersected is 'F'<br/>
     * - not relevant is '*'<br/>
     * For example, string 'FF**FF****' means 'DISJOINT'
     */
    toString() {
        return this.m.reduce((string, e) => {
            if (!e) return string + '*'
            if (e.length > 0) { return string + 'T' }
            return string + 'F' // e.length === 0
        }, '')
    }

    equal() { return EQUAL.test(this.toString()) }

    intersect() { return INTERSECT.test(this.toString()) }

    touch() { return TOUCH.test(this.toString()) }

    inside() { return INSIDE.test(this.toString()) }

    covered() { return COVERED.test(this.toString()) }
}

export default DE9IM;
