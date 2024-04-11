import Errors from '../utils/errors'
import { Matrix } from './Matrix'
import type { Box } from './Box'
import type { Point, PointLike } from './Point'
import type { Vector } from './Vector'

export type AnyShape = Shape<unknown>

const ORIGIN_POINT: PointLike = {
  x: NaN,
  y: NaN,
}
ORIGIN_POINT.x = 0
ORIGIN_POINT.y = 0

export enum ShapeTag {
  // Edge shapes
  Segment,
  Arc,
  Bezier,
  Quadratic,

  // Non-edge shapes
  Box,
  Circle,
  Path,
  Ray,
  Line,
  Multiline,
  Point,
  Polygon,
  Vector,
}
export const MAX_EDGE_SHAPE_TAG = ShapeTag.Quadratic

/**
 * Base class representing shape
 * Implement common methods of affine transformations
 */
export abstract class Shape<T = unknown> {
  abstract get tag(): ShapeTag

  abstract get name(): string

  abstract get box(): Box

  abstract get center(): Point

  abstract clone(): Shape

  /**
   * Data field for rendering engines, can be used to store cached data.
   * e.g. Path2D when rendering to the canvas
   */
  _data: any

  constructor() {}

  /**
   * Returns new shape translated by given vector.
   * Translation vector may be also defined by a pair of numbers.
   */
  translate(v: Vector): T
  translate(p: { x: number; y: number }): T
  translate(x: number, y: number): T
  translate(a: unknown, b?: unknown): T {
    return this.transform(Matrix.IDENTITY.translate(a as any, b as any))
  }

  /**
   * Returns new shape rotated by given angle around given center point.
   * If center point is omitted, rotates around zero point (0,0).
   * Positive value of angle defines rotation in counterclockwise direction,
   * negative angle defines rotation in clockwise direction
   * @param angle - angle in radians
   * @param [center=(0,0)] center
   */
  rotate(angle: number, center: PointLike = ORIGIN_POINT): T {
    return this.transform(Matrix.IDENTITY.rotate(angle, center.x, center.y))
  }

  /**
   * Return new shape with coordinates multiplied by scaling factor
   */
  scale(s: number): T
  scale(sx: number, sy: number): T
  scale(a: unknown, b?: unknown): T {
    return this.transform(Matrix.IDENTITY.scale(a as number, (b ?? a) as number))
  }

  transform(_a: unknown): T {
    throw Errors.CANNOT_INVOKE_ABSTRACT_METHOD
  }

  abstract contains(other: Shape<unknown>): boolean

  /**
   * This method returns an object that defines how data will be
   * serialized when called JSON.stringify() method
   */
  toJSON(): { name: string } & Record<string, any> {
    return Object.assign({}, this, { name: this.name })
  }
}
