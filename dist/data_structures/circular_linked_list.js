"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const linked_list_1 = __importDefault(require("./linked_list"));
/**
 * Class implements circular bidirectional linked list <br/>
 * LinkedListElement - object of any type that has properties next and prev.
 */
class CircularLinkedList extends linked_list_1.default {
    constructor(first, last) {
        super(first, last);
        this.setCircularLinks();
    }
    setCircularLinks() {
        if (this.isEmpty())
            return;
        this.last.next = this.first;
        this.first.prev = this.last;
    }
    [Symbol.iterator]() {
        let element = undefined;
        return {
            next: () => {
                let value = element ? element : this.first;
                let done = this.first ? (element ? element === this.first : false) : true;
                element = value ? value.next : undefined;
                return { value: value, done: done };
            }
        };
    }
    ;
    /**
     * Append new element to the end of the list
     * @param {LinkedListElement} element - new element to be appended
     * @returns {CircularLinkedList}
     */
    append(element) {
        super.append(element);
        this.setCircularLinks();
        return this;
    }
    /**
     * Insert new element to the list after elementBefore
     * @param {LinkedListElement} newElement - new element to be inserted
     * @param {LinkedListElement} elementBefore - element in the list to insert after it
     * @returns {CircularLinkedList}
     */
    insert(newElement, elementBefore) {
        super.insert(newElement, elementBefore);
        this.setCircularLinks();
        return this;
    }
    /**
     * Remove element from the list
     * @param {LinkedListElement} element - element to be removed from the list
     * @returns {CircularLinkedList}
     */
    remove(element) {
        super.remove(element);
        // this.setCircularLinks();
        return this;
    }
}
exports.default = CircularLinkedList;
