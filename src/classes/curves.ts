/*
 * curves.ts
 * This code is copied from [PixiJS](https://github.com/pixijs/pixijs/tree/main)
 *
 * The MIT License
 *
 * Copyright (c) 2013-2023 Mathew Groves, Chad Engler
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { Box } from './Box'

/**
 * @private
 */
export const utils = {
  adaptive: true,
  maxLength: 10,
  minSegments: 8,
  maxSegments: 2048,

  epsilon: 0.0001,

  _segmentsCount(length: number, defaultSegments = 20) {
    if (!this.adaptive || !length || isNaN(length)) {
      return defaultSegments
    }

    let result = Math.ceil(length / this.maxLength)

    if (result < this.minSegments) {
      result = this.minSegments
    } else if (result > this.maxSegments) {
      result = this.maxSegments
    }

    return result
  },
}

export function findIndexFromLUT(lut: number[], length: number) {
  let lower = 0
  let upper = lut.length / 4
  let current = lower + Math.floor((upper - lower) / 2)
  while (true) {
    const len = lut[current * 4 + 3]

    if (length > len) {
      lower = current
    } else {
      upper = current
    }
    const index = lower + Math.floor((upper - lower) / 2)
    if (index === current) {
      break
    }
    current = index
  }

  return current
}

export function boxFromLUT(lut: number[]) {
  let xMin = lut[0]
  let xMax = lut[0]

  let yMin = lut[1]
  let yMax = lut[1]

  for (let i = 0; i < lut.length; i += 4) {
    const x = lut[i + 0]
    const y = lut[i + 1]

    if (x > xMax) {
      xMax = x
    }
    if (x < xMin) {
      xMin = x
    }
    if (y > yMax) {
      yMax = y
    }
    if (y < yMin) {
      yMin = y
    }
  }
  return new Box(xMin, yMin, xMax, yMax)
}

/**
 * Utilities for quadratic curves.
 * @private
 */
export const quadratic = {
  /**
   * Calculate length of quadratic curve
   * @see {@link http://www.malczak.linuxpl.com/blog/quadratic-bezier-curve-length/}
   * for the detailed explanation of math behind this.
   * @private
   * @param fromX - x-coordinate of curve start point
   * @param fromY - y-coordinate of curve start point
   * @param cpX - x-coordinate of curve control point
   * @param cpY - y-coordinate of curve control point
   * @param toX - x-coordinate of curve end point
   * @param toY - y-coordinate of curve end point
   * @returns - Length of quadratic curve
   */
  curveLength(fromX: number, fromY: number, cpX: number, cpY: number, toX: number, toY: number): number {
    const ax = fromX - 2.0 * cpX + toX
    const ay = fromY - 2.0 * cpY + toY
    const bx = 2.0 * cpX - 2.0 * fromX
    const by = 2.0 * cpY - 2.0 * fromY
    const a = 4.0 * (ax * ax + ay * ay)
    const b = 4.0 * (ax * bx + ay * by)
    const c = bx * bx + by * by

    const s = 2.0 * Math.sqrt(a + b + c)
    const a2 = Math.sqrt(a)
    const a32 = 2.0 * a * a2
    const c2 = 2.0 * Math.sqrt(c)
    const ba = b / a2

    return (
      (a32 * s + a2 * b * (s - c2) + (4.0 * c * a - b * b) * Math.log((2.0 * a2 + ba + s) / (ba + c2))) / (4.0 * a32)
    )
  },

  /**
   * Calculate the points for a quadratic bezier curve and then draws it.
   * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
   * @private
   * @param cpX - Control point x
   * @param cpY - Control point y
   * @param toX - Destination point x
   * @param toY - Destination point y
   */
  generateLUT(fromX: number, fromY: number, cpX: number, cpY: number, toX: number, toY: number): number[] {
    const lut = [] as number[] // [x, y, t, len, ...]

    const n = utils._segmentsCount(quadratic.curveLength(fromX, fromY, cpX, cpY, toX, toY))

    let t = 0
    let xa = 0
    let ya = 0

    let previousX = fromX
    let previousY = fromY
    let totalLength = 0

    lut.push(fromX, fromY, t, totalLength)

    for (let i = 1; i <= n; ++i) {
      const t = i / n

      xa = fromX + (cpX - fromX) * t
      ya = fromY + (cpY - fromY) * t

      const x = xa + (cpX + (toX - cpX) * t - xa) * t
      const y = ya + (cpY + (toY - cpY) * t - ya) * t

      const dx = x - previousX
      const dy = y - previousY

      totalLength += Math.sqrt(dx * dx + dy * dy)

      lut.push(x, y, t, totalLength)

      previousX = x
      previousY = y
    }

    return lut
  },
}

/**
 * Utilities for bezier curves
 * @private
 */
export const bezier = {
  /**
   * Calculate length of bezier curve.
   * Analytical solution is impossible, since it involves an integral that does not integrate in general.
   * Therefore numerical solution is used.
   * @private
   * @param fromX - Starting point x
   * @param fromY - Starting point y
   * @param cpX - Control point x
   * @param cpY - Control point y
   * @param cpX2 - Second Control point x
   * @param cpY2 - Second Control point y
   * @param toX - Destination point x
   * @param toY - Destination point y
   * @returns - Length of bezier curve
   */
  curveLength(
    fromX: number,
    fromY: number,
    cpX: number,
    cpY: number,
    cpX2: number,
    cpY2: number,
    toX: number,
    toY: number,
  ): number {
    const n = 10
    let result = 0.0
    let t = 0.0
    let t2 = 0.0
    let t3 = 0.0
    let nt = 0.0
    let nt2 = 0.0
    let nt3 = 0.0
    let x = 0.0
    let y = 0.0
    let dx = 0.0
    let dy = 0.0
    let prevX = fromX
    let prevY = fromY

    for (let i = 1; i <= n; ++i) {
      t = i / n
      t2 = t * t
      t3 = t2 * t
      nt = 1.0 - t
      nt2 = nt * nt
      nt3 = nt2 * nt

      x = nt3 * fromX + 3.0 * nt2 * t * cpX + 3.0 * nt * t2 * cpX2 + t3 * toX
      y = nt3 * fromY + 3.0 * nt2 * t * cpY + 3 * nt * t2 * cpY2 + t3 * toY
      dx = prevX - x
      dy = prevY - y
      prevX = x
      prevY = y

      result += Math.sqrt(dx * dx + dy * dy)
    }

    return result
  },

  /**
   * Calculate the curve LUT
   *
   * @ignore
   * @param toX - Source point x
   * @param toY - Source point y
   * @param cpX - Control point x
   * @param cpY - Control point y
   * @param cpX2 - Second Control point x
   * @param cpY2 - Second Control point y
   * @param toX - Destination point x
   * @param toY - Destination point y
   */
  generateLUT(
    fromX: number,
    fromY: number,
    cpX: number,
    cpY: number,
    cpX2: number,
    cpY2: number,
    toX: number,
    toY: number,
  ) {
    const lut = [] as number[] // [x, y, t, len, ...]

    const n = utils._segmentsCount(bezier.curveLength(fromX, fromY, cpX, cpY, cpX2, cpY2, toX, toY))

    let dt = 0
    let dt2 = 0
    let dt3 = 0
    let t2 = 0
    let t3 = 0

    let previousX = fromX
    let previousY = fromY
    let totalLength = 0

    lut.push(fromX, fromY, dt, totalLength)

    for (let i = 1, t = 0; i <= n; ++i) {
      t = i / n

      dt = 1 - t
      dt2 = dt * dt
      dt3 = dt2 * dt

      t2 = t * t
      t3 = t2 * t

      const x = dt3 * fromX + 3 * dt2 * t * cpX + 3 * dt * t2 * cpX2 + t3 * toX
      const y = dt3 * fromY + 3 * dt2 * t * cpY + 3 * dt * t2 * cpY2 + t3 * toY

      const dx = x - previousX
      const dy = y - previousY

      totalLength += Math.sqrt(dx * dx + dy * dy)

      lut.push(x, y, t, totalLength)

      previousX = x
      previousY = y
    }

    return lut
  },
}
