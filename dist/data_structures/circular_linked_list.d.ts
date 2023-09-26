import LinkedList from './linked_list';
/**
 * Class implements circular bidirectional linked list <br/>
 * LinkedListElement - object of any type that has properties next and prev.
 */
declare class CircularLinkedList<T extends {
    next?: T;
    prev?: T;
}> extends LinkedList<T> {
    constructor(first?: T, last?: T);
    setCircularLinks(): void;
    [Symbol.iterator](): {
        next: () => {
            value: any;
            done: boolean;
        };
    };
    /**
     * Append new element to the end of the list
     * @param {LinkedListElement} element - new element to be appended
     * @returns {CircularLinkedList}
     */
    append(element: any): this;
    /**
     * Insert new element to the list after elementBefore
     * @param {LinkedListElement} newElement - new element to be inserted
     * @param {LinkedListElement} elementBefore - element in the list to insert after it
     * @returns {CircularLinkedList}
     */
    insert(newElement: any, elementBefore: any): this;
    /**
     * Remove element from the list
     * @param {LinkedListElement} element - element to be removed from the list
     * @returns {CircularLinkedList}
     */
    remove(element: any): this;
}
export default CircularLinkedList;
//# sourceMappingURL=circular_linked_list.d.ts.map