/**
 * Class implements bidirectional non-circular linked list. <br/>
 * LinkedListElement - object of any type that has properties next and prev.
 */
declare class LinkedList<T extends {
    next?: T;
    prev?: T;
}> {
    first: T;
    last: T;
    constructor(first?: T, last?: T);
    [Symbol.iterator](): {
        next: () => {
            value: any;
            done: boolean;
        };
    };
    /**
     * Return number of elements in the list
     * @returns {number}
     */
    get size(): number;
    /**
     * Return array of elements from start to end,
     * If start or end not defined, take first as start, last as end
     * @returns {Array}
     */
    toArray(start?: any, end?: any): any[];
    /**
     * Append new element to the end of the list
     * @param {LinkedListElement} element
     * @returns {LinkedList}
     */
    append(element: any): this;
    /**
     * Insert new element to the list after elementBefore
     * @param {LinkedListElement} newElement
     * @param {LinkedListElement} elementBefore
     * @returns {LinkedList}
     */
    insert(newElement: any, elementBefore: any): this;
    /**
     * Remove element from the list
     * @param {LinkedListElement} element
     * @returns {LinkedList}
     */
    remove(element: any): this;
    /**
     * Return true if list is empty
     * @returns {boolean}
     */
    isEmpty(): boolean;
    /**
     * Throw an error if circular loop detected in the linked list
     * @param {LinkedListElement} first element to start iteration
     * @throws {Errors.INFINITE_LOOP}
     */
    static testInfiniteLoop(first: any): void;
}
export default LinkedList;
//# sourceMappingURL=linked_list.d.ts.map