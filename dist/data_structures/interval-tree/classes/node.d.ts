import Interval from './interval';
import { Color } from '../utils/constants';
declare class Node {
    left: Node;
    right: Node;
    parent: Node;
    color: Color;
    item: {
        key: any;
        value: any;
    };
    max: Interval | undefined;
    constructor(key?: any, value?: any, left?: any, right?: any, parent?: any, color?: Color);
    isNil(): boolean;
    _value_less_than(other_node: any): any;
    lessThan(other_node: any): any;
    _value_equal(other_node: any): any;
    equalTo(other_node: any): any;
    intersect(other_node: any): any;
    copy_data(other_node: any): void;
    update_max(): void;
    not_intersect_left_subtree(search_node: any): any;
    not_intersect_right_subtree(search_node: any): any;
}
export default Node;
//# sourceMappingURL=node.d.ts.map