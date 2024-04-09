import { Polygon } from './Polygon'

/**
 * Class representing a rectangle
 */
export class Rect extends Polygon {
  constructor(x: number, y: number, width: number, height: number) {
    super([
      [x, y],
      [x + width, y],
      [x + width, y + height],
      [x, y + height],
    ])
  }
}

/**
 * Shortcut to create new rectangle
 */
export const rect = (x: number, y: number, width: number, height: number) => new Rect(x, y, width, height)
