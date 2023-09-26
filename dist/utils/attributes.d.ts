declare class SVGAttributes {
    stroke: string;
    constructor(args?: {
        stroke: string;
    });
    toAttributesString(): string;
    toAttrString(key: any, value: any): string;
    convertCamelToKebabCase(str: any): any;
}
export declare function convertToString(attrs: any): string;
export default SVGAttributes;
//# sourceMappingURL=attributes.d.ts.map