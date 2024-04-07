/**
 * Interval is a pair of numbers or a pair of any comparable objects on which may be defined predicates
 * *equal*, *less* and method *max(p1, p1)* that returns maximum in a pair.
 * When interval is an object rather than pair of numbers, this object should have properties *low*, *high*, *max*
 * and implement methods *lessThan(), equalTo(), intersect(), not_intersect(), clone(), output()*.
 * Two static methods *comparableMax(), comparableLessThan()* define how to compare values in pair. <br/>
 * This interface is described in typescript definition file *index.d.ts*
 *
 * Axis aligned rectangle is an example of such interval.
 * We may look at rectangle as an interval between its low left and top right corners.
 * See **Box** class in [flatten-js](https://github.com/alexbol99/flatten-js) library as the example
 * of Interval interface implementation
 * @type {Interval}
 */
export default class Interval {
  low: number
  high: number

  /**
   * Accept two comparable values and creates new instance of interval
   * Predicate Interval.comparableLess(low, high) supposed to return true on these values
   * @param low
   * @param high
   */
  constructor(low, high) {
    this.low = low
    this.high = high
  }

  /**
   * Clone interval
   * @returns {Interval}
   */
  clone() {
    return new Interval(this.low, this.high)
  }

  /**
   * Propery max returns clone of this interval
   * @returns {Interval}
   */
  get max() {
    return this.clone() // this.high;
  }

  /**
   * Predicate returns true is this interval less than other interval
   * @param other_interval
   * @returns {boolean}
   */
  lessThan(other_interval) {
    return this.low < other_interval.low || (this.low == other_interval.low && this.high < other_interval.high)
  }

  /**
   * Predicate returns true is this interval equals to other interval
   * @param other_interval
   * @returns {boolean}
   */
  equalTo(other_interval) {
    return this.low == other_interval.low && this.high == other_interval.high
  }

  /**
   * Predicate returns true if this interval intersects other interval
   * @param other_interval
   * @returns {boolean}
   */
  intersect(other_interval) {
    return !this.not_intersect(other_interval)
  }

  /**
   * Predicate returns true if this interval does not intersect other interval
   * @param other_interval
   * @returns {boolean}
   */
  not_intersect(other_interval) {
    return this.high < other_interval.low || other_interval.high < this.low
  }

  /**
   * Returns new interval merged with other interval
   * @param {Interval} interval - Other interval to merge with
   * @returns {Interval}
   */
  merge(other_interval) {
    return new Interval(
      this.low === undefined ? other_interval.low : Math.min(this.low, other_interval.low),
      this.high === undefined ? other_interval.high : Math.max(this.high, other_interval.high),
    )
  }

  /**
   * Returns how key should return
   */
  output() {
    return [this.low, this.high]
  }

  /**
   * Function returns maximum between two comparable values
   * @param interval1
   * @param interval2
   * @returns {Interval}
   */
  static comparableMax(interval1, interval2) {
    return interval1.merge(interval2)
  }

  /**
   * Predicate returns true if first value less than second value
   * @param val1
   * @param val2
   * @returns {boolean}
   */
  static comparableLessThan(val1, val2) {
    return val1 < val2
  }
}
