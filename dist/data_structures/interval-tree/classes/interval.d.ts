/**
 * Interval is a pair of numbers or a pair of any comparable objects on which may be defined predicates
 * *equal*, *less* and method *max(p1, p1)* that returns maximum in a pair.
 * When interval is an object rather than pair of numbers, this object should have properties *low*, *high*, *max*
 * and implement methods *lessThan(), equalTo(), intersect(), not_intersect(), clone(), output()*.
 * Two static methods *comparableMax(), comparable_less_than()* define how to compare values in pair. <br/>
 * This interface is described in typescript definition file *index.d.ts*
 *
 * Axis aligned rectangle is an example of such interval.
 * We may look at rectangle as an interval between its low left and top right corners.
 * See **Box** class in [flatten-js](https://github.com/alexbol99/flatten-js) library as the example
 * of Interval interface implementation
 * @type {Interval}
 */
export default class Interval {
    low: number;
    high: number;
    /**
     * Accept two comparable values and creates new instance of interval
     * Predicate Interval.comparable_less(low, high) supposed to return true on these values
     * @param low
     * @param high
     */
    constructor(low: any, high: any);
    /**
     * Clone interval
     * @returns {Interval}
     */
    clone(): Interval;
    /**
     * Propery max returns clone of this interval
     * @returns {Interval}
     */
    get max(): Interval;
    /**
     * Predicate returns true is this interval less than other interval
     * @param other_interval
     * @returns {boolean}
     */
    lessThan(other_interval: any): boolean;
    /**
     * Predicate returns true is this interval equals to other interval
     * @param other_interval
     * @returns {boolean}
     */
    equalTo(other_interval: any): boolean;
    /**
     * Predicate returns true if this interval intersects other interval
     * @param other_interval
     * @returns {boolean}
     */
    intersect(other_interval: any): boolean;
    /**
     * Predicate returns true if this interval does not intersect other interval
     * @param other_interval
     * @returns {boolean}
     */
    not_intersect(other_interval: any): boolean;
    /**
     * Returns new interval merged with other interval
     * @param {Interval} interval - Other interval to merge with
     * @returns {Interval}
     */
    merge(other_interval: any): Interval;
    /**
     * Returns how key should return
     */
    output(): number[];
    /**
     * Function returns maximum between two comparable values
     * @param interval1
     * @param interval2
     * @returns {Interval}
     */
    static comparableMax(interval1: any, interval2: any): any;
    /**
     * Predicate returns true if first value less than second value
     * @param val1
     * @param val2
     * @returns {boolean}
     */
    static comparable_less_than(val1: any, val2: any): boolean;
}
//# sourceMappingURL=interval.d.ts.map