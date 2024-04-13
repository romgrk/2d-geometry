import { Box } from '../classes/Box'
import type { Point } from '../classes/Point'
import { IntervalTree } from '../data_structures/interval-tree'

/**
 * Class representing a planar set - a generic container with ability to keep and retrieve shapes and
 * perform spatial queries. Planar set is an extension of Set container, so it supports
 * Set properties and methods
 */
export class PlanarSet<T extends { box: Box }> {
  set: Set<T>
  index: IntervalTree

  /**
   * Create new instance of PlanarSet
   * @param shapes - array or set of geometric objects to store in planar set
   */
  constructor(shapes?: T[]) {
    this.set = new Set<T>(shapes)
    this.index = new IntervalTree()
    this.set.forEach((shape) => this.index.insert(shape))
  }

  [Symbol.iterator]() {
    return this.set[Symbol.iterator]()
  }

  get size() {
    return this.set.size
  }

  has(shape: T) {
    return this.set.has(shape)
  }

  forEach(fn: (shape: T) => void) {
    this.set.forEach(fn)
  }

  /**
   * Add new shape to planar set and to its spatial index.<br/>
   * If shape already exist, it will not be added again.
   * This happens with no error, it is possible to use <i>size</i> property to check if
   * a shape was actually added.<br/>
   * Method returns planar set object updated and may be chained
   */
  add(shape: T) {
    const size = this.set.size
    this.set.add(shape)
    // size not changed - item not added, probably trying to add same item twice
    if (this.set.size > size) {
      this.index.insert(shape.box as any, shape)
    }
    return this // in accordance to Set.add interface
  }

  /**
   * Delete shape from planar set. Returns true if shape was actually deleted, false otherwise
   */
  delete(shape: T) {
    const deleted = this.set.delete(shape)
    if (deleted) {
      this.index.remove(shape.box, shape)
    }
    return deleted
  }

  /**
   * Clear planar set
   */
  clear() {
    this.set.clear()
    this.index = new IntervalTree()
  }

  /**
   * 2d range search in planar set.<br/>
   * Returns array of all shapes in planar set which bounding box is intersected with query box
   * @param box - query box
   */
  search(box: Box) {
    return this.index.search(box)
  }

  /**
   * Point location test. Returns array of shapes which contains given point
   * @param point - query point
   */
  hit(point: Point) {
    const box = new Box(point.x - 1, point.y - 1, point.x + 1, point.y + 1)
    return this.index.search(box as any).filter((shape) => point.on(shape))
  }
}
