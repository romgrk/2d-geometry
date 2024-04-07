import Interval from './interval'
import { Color } from '../utils/constants'

class Node {
  left: Node
  right: Node
  parent: Node
  color: Color
  item: { key: any; value: any }
  max: Interval | undefined

  constructor(key = undefined, value = undefined, left = null, right = null, parent = null, color = Color.BLACK) {
    this.left = left // reference to left child node
    this.right = right // reference to right child node
    this.parent = parent // reference to parent node
    this.color = color

    this.item = { key: key, value: value } // key is supposed to be instance of Interval

    /* If not, this should by an array of two numbers */
    if (key && key instanceof Array && key.length == 2) {
      if (!Number.isNaN(key[0]) && !Number.isNaN(key[1])) {
        this.item.key = new Interval(Math.min(key[0], key[1]), Math.max(key[0], key[1]))
      }
    }

    this.max = this.item.key ? this.item.key.max : undefined
  }

  isNil() {
    return (
      this.item.key === undefined &&
      this.item.value === undefined &&
      this.left === null &&
      this.right === null &&
      this.color === Color.BLACK
    )
  }

  _value_less_than(other_node) {
    return this.item.value && other_node.item.value && this.item.value.lessThan
      ? this.item.value.lessThan(other_node.item.value)
      : this.item.value < other_node.item.value
  }

  lessThan(other_node) {
    // if tree stores only keys
    if (this.item.value === this.item.key && other_node.item.value === other_node.item.key) {
      return this.item.key.lessThan(other_node.item.key)
    } else {
      // if tree stores keys and values
      return (
        this.item.key.lessThan(other_node.item.key) ||
        (this.item.key.equalTo(other_node.item.key) && this._value_less_than(other_node))
      )
    }
  }

  _value_equal(other_node) {
    return this.item.value && other_node.item.value && this.item.value.equalTo
      ? this.item.value.equalTo(other_node.item.value)
      : this.item.value == other_node.item.value
  }
  equalTo(other_node) {
    // if tree stores only keys
    if (this.item.value === this.item.key && other_node.item.value === other_node.item.key) {
      return this.item.key.equalTo(other_node.item.key)
    } else {
      // if tree stores keys and values
      return this.item.key.equalTo(other_node.item.key) && this._value_equal(other_node)
    }
  }

  intersect(other_node) {
    return this.item.key.intersect(other_node.item.key)
  }

  copy_data(other_node) {
    this.item.key = other_node.item.key
    this.item.value = other_node.item.value
  }

  update_max() {
    // use key (Interval) max property instead of key.high
    this.max = this.item.key ? this.item.key.max : undefined
    if (this.right && this.right.max) {
      const comparableMax = this.item.key.constructor.comparableMax // static method
      this.max = comparableMax(this.max, this.right.max)
    }
    if (this.left && this.left.max) {
      const comparableMax = this.item.key.constructor.comparableMax // static method
      this.max = comparableMax(this.max, this.left.max)
    }
  }

  // Other_node does not intersect any node of left subtree, if this.left.max < other_node.item.key.low
  not_intersect_left_subtree(search_node) {
    const comparableLessThan = this.item.key.constructor.comparableLessThan // static method
    let high = this.left.max.high !== undefined ? this.left.max.high : this.left.max
    return comparableLessThan(high, search_node.item.key.low)
  }

  // Other_node does not intersect right subtree if other_node.item.key.high < this.right.key.low
  not_intersect_right_subtree(search_node) {
    const comparableLessThan = this.item.key.constructor.comparableLessThan // static method
    let low = this.right.max.low !== undefined ? this.right.max.low : this.right.item.key.low
    return comparableLessThan(search_node.item.key.high, low)
  }
}

export default Node
