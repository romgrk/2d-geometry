declare class DE9IM {
    /** Array representing 3x3 intersection matrix */
    m: any[];
    /**
     * Create new instance of DE9IM matrix
     */
    constructor();
    /**
     * Get Interior To Interior intersection
     * @returns {Shape[] | undefined}
     */
    get I2I(): any;
    /**
     * Set Interior To Interior intersection
     * @param geom
     */
    set I2I(geom: any);
    /**
     * Get Interior To Boundary intersection
     * @returns {Shape[] | undefined}
     */
    get I2B(): any;
    /**
     * Set Interior to Boundary intersection
     * @param geomc
     */
    set I2B(geom: any);
    /**
     * Get Interior To Exterior intersection
     * @returns {Shape[] | undefined}
     */
    get I2E(): any;
    /**
     * Set Interior to Exterior intersection
     * @param geom
     */
    set I2E(geom: any);
    /**
     * Get Boundary To Interior intersection
     * @returns {Shape[] | undefined}
     */
    get B2I(): any;
    /**
     * Set Boundary to Interior intersection
     * @param geom
     */
    set B2I(geom: any);
    /**
     * Get Boundary To Boundary intersection
     * @returns {Shape[] | undefined}
     */
    get B2B(): any;
    /**
     * Set Boundary to Boundary intersection
     * @param geom
     */
    set B2B(geom: any);
    /**
     * Get Boundary To Exterior intersection
     * @returns {Shape[] | undefined}
     */
    get B2E(): any;
    /**
     * Set Boundary to Exterior intersection
     * @param geom
     */
    set B2E(geom: any);
    /**
     * Get Exterior To Interior intersection
     * @returns {Shape[] | undefined}
     */
    get E2I(): any;
    /**
     * Set Exterior to Interior intersection
     * @param geom
     */
    set E2I(geom: any);
    /**
     * Get Exterior To Boundary intersection
     * @returns {Shape[] | undefined}
     */
    get E2B(): any;
    /**
     * Set Exterior to Boundary intersection
     * @param geom
     */
    set E2B(geom: any);
    /**
     * Get Exterior to Exterior intersection
     * @returns {Shape[] | undefined}
     */
    get E2E(): any;
    /**
     * Set Exterior to Exterior intersection
     * @param geom
     */
    set E2E(geom: any);
    /**
     * Return de9im matrix as string where<br/>
     * - intersection is 'T'<br/>
     * - not intersected is 'F'<br/>
     * - not relevant is '*'<br/>
     * For example, string 'FF**FF****' means 'DISJOINT'
     * @returns {string}
     */
    toString(): string;
    equal(): boolean;
    intersect(): boolean;
    touch(): boolean;
    inside(): boolean;
    covered(): boolean;
}
export default DE9IM;
//# sourceMappingURL=de9im.d.ts.map