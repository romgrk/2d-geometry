import Node from './node.js';
/**
 * Implementation of interval binary search tree <br/>
 * Interval tree stores items which are couples of {key:interval, value: value} <br/>
 * Interval is an object with high and low properties or simply pair [low,high] of numeric values <br />
 * @type {IntervalTree}
 */
declare class IntervalTree {
    root: Node | null;
    nil_node: Node;
    /**
     * Construct new empty instance of IntervalTree
     */
    constructor();
    /**
     * Returns number of items stored in the interval tree
     * @returns {number}
     */
    get size(): number;
    /**
     * Returns array of sorted keys in the ascending order
     * @returns {Array}
     */
    get keys(): any[];
    /**
     * Return array of values in the ascending keys order
     * @returns {Array}
     */
    get values(): any[];
    /**
     * Returns array of items (<key,value> pairs) in the ascended keys order
     * @returns {Array}
     */
    get items(): any[];
    /**
     * Returns true if tree is empty
     * @returns {boolean}
     */
    isEmpty(): boolean;
    /**
     * Clear tree
     */
    clear(): void;
    /**
     * Insert new item into interval tree
     * @param {Interval} key - interval object or array of two numbers [low, high]
     * @param {any} value - value representing any object (optional)
     * @returns {Node} returns reference to inserted node as an object {key:interval, value: value}
     */
    insert(key: any, value?: any): Node;
    /**
     * Returns true if item {key,value} exist in the tree
     * @param {Interval} key - interval correspondent to keys stored in the tree
     * @param {any} value - value object to be checked
     * @returns {boolean} true if item {key, value} exist in the tree, false otherwise
     */
    exist(key: any, value?: any): boolean;
    /**
     * Remove entry {key, value} from the tree
     * @param {Interval} key - interval correspondent to keys stored in the tree
     * @param {any} value - value object
     * @returns {boolean} true if item {key, value} deleted, false if not found
     */
    remove(key: any, value?: any): any;
    /**
     * Returns array of entry values which keys intersect with given interval <br/>
     * If no values stored in the tree, returns array of keys which intersect given interval
     * @param {Interval} interval - search interval, or tuple [low, high]
     * @param outputMapperFn(value,key) - optional function that maps (value, key) to custom output
     * @returns {Array}
     */
    search(interval: any, outputMapperFn?: (value: any, key: any) => any): any[];
    /**
     * Returns true if intersection between given and any interval stored in the tree found
     * @param {Interval} interval - search interval or tuple [low, high]
     * @returns {boolean}
     */
    intersect_any(interval: any): any;
    /**
     * Tree visitor. For each node implement a callback function. <br/>
     * Method calls a callback function with two parameters (key, value)
     * @param visitor(key,value) - function to be called for each tree item
     */
    forEach(visitor: any): void;
    /**
     * Value Mapper. Walk through every node and map node value to another value
     * @param callback(value,key) - function to be called for each tree item
     */
    map(callback: any): IntervalTree;
    /**
     * @param {Interval} interval - optional if the iterator is intended to start from the beginning
     * @param outputMapperFn(value,key) - optional function that maps (value, key) to custom output
     * @returns {Iterator}
     */
    iterate(interval: any, outputMapperFn?: (value: any, key: any) => any): Generator<any, void, unknown>;
    recalc_max(node: any): void;
    tree_insert(insert_node: any): void;
    insert_fixup(insert_node: any): void;
    tree_delete(delete_node: any): void;
    delete_fixup(fix_node: any): void;
    tree_search(node: any, search_node: any): any;
    tree_search_nearest_forward(node: any, search_node: any): any;
    tree_search_interval(node: any, search_node: any, res: any): void;
    tree_find_any_interval(node: any, search_node: any): any;
    local_minimum(node: any): any;
    local_maximum(node: any): any;
    tree_successor(node: any): any;
    rotate_left(x: any): void;
    rotate_right(y: any): void;
    tree_walk(node: any, action: any): void;
    testRedBlackProperty(): boolean;
    testBlackHeightProperty(node: any): number;
}
export default IntervalTree;
//# sourceMappingURL=intervalTree.d.ts.map