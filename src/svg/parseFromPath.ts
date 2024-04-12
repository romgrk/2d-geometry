import { Arc } from '../classes/Arc'
import { Quadratic } from '../classes/Quadratic'
import { Bezier } from '../classes/Bezier'
import { Point } from '../classes/Point'
import { Vector } from '../classes/Vector'
import { Segment } from '../classes/Segment'
import { Path } from '../classes/Path'
import { TAU } from '../utils/constants'

const c = (s: string) => s.charCodeAt(0)

const CHAR = {
  SPACE: c(' '),
  ENTER: c('\n'),
  TAB: c('\t'),

  DOT: c('.'),
  COMMA: c(','),
  MINUS: c('-'),

  _0: c('0'),
  _9: c('9'),

  M: c('M'),
  m: c('m'),

  L: c('L'),
  l: c('l'),
  H: c('H'),
  h: c('H'),
  V: c('V'),
  v: c('v'),
  Z: c('Z'),
  z: c('z'),

  A: c('A'),
  a: c('a'),

  Q: c('Q'),
  q: c('q'),
  S: c('S'),
  s: c('s'),

  C: c('C'),
  c: c('c'),
  T: c('T'),
  t: c('t'),
}

type Options = {
  split?: boolean
}

export function parsePath(description: string, options: Options = {}) {
  const allParts = [[]]
  let parts = allParts[allParts.length - 1]
  let current = new Point()
  let anchor = current
  let lastBezier = undefined as undefined | Bezier
  let lastQuadratic = undefined as undefined | Quadratic

  let offset = 0
  const length = description.length

  const skipSeparator = () => {
    while (offset < length) {
      const code = description.charCodeAt(offset)
      if (code == CHAR.SPACE || code == CHAR.ENTER || code == CHAR.TAB || code == CHAR.COMMA) {
        offset += 1
      } else {
        break
      }
    }
  }

  const number = () => {
    skipSeparator()

    const start = offset

    while (offset < length) {
      const code = description.charCodeAt(offset)
      const isValid = (code >= CHAR._0 && code <= CHAR._9) || code === CHAR.DOT || code === CHAR.MINUS
      if (isValid) {
        offset += 1
      } else {
        break
      }
    }

    const end = offset
    const result = parseFloat(description.slice(start, end))

    return result
  }

  while (offset < length) {
    skipSeparator()
    let code = description.charCodeAt(offset)
    offset += 1
    switch (code) {
      case CHAR.M: {
        current.x = number()
        current.y = number()
        anchor = current
        break
      }
      case CHAR.m: {
        current.x += number()
        current.y += number()
        anchor = current
        break
      }

      /* LINE COMMANDS */

      case CHAR.L: {
        const end = new Point(number(), number())
        parts.push(new Segment(current.clone(), end))
        current = end
        break
      }
      case CHAR.l: {
        const end = new Point(current.x + number(), current.y + number())
        parts.push(new Segment(current.clone(), end))
        current = end
        break
      }
      case CHAR.H: {
        const end = new Point(number(), current.y)
        parts.push(new Segment(current.clone(), end))
        current = end
        break
      }
      case CHAR.h: {
        const end = new Point(current.x + number(), current.y)
        parts.push(new Segment(current.clone(), end))
        current = end
        break
      }
      case CHAR.V: {
        const end = new Point(current.x, number())
        parts.push(new Segment(current.clone(), end))
        current = end
        break
      }
      case CHAR.v: {
        const end = new Point(current.x, current.y + number())
        parts.push(new Segment(current.clone(), end))
        current = end
        break
      }
      case CHAR.v: {
        const end = new Point(current.x, current.y + number())
        parts.push(new Segment(current.clone(), end))
        current = end
        break
      }
      case CHAR.Z:
      case CHAR.z: {
        const end = anchor.clone()
        parts.push(new Segment(current.clone(), end))
        if (options.split !== false) {
          allParts.push([])
          parts = allParts[allParts.length - 1]
        }
        current = end
        break
      }

      /* CURVE COMMANDS */

      /* Arc */
      case CHAR.A:
      case CHAR.a: {
        // https://www.nan.fyi/svg-paths/arcs
        const rx = number()
        const ry = number()
        const rotation = (number() / 360) * TAU
        if (rx !== ry || rotation !== 0) throw new Error('unimplemented')
        const large = Boolean(number())
        const sweep = Boolean(number())
        const x = number() + (code === CHAR.a ? current.x : 0)
        const y = number() + (code === CHAR.a ? current.y : 0)
        const end = new Point(x, y)
        if (rx === 0 || ry === 0 || current.equalTo(end)) {
          parts.push(new Segment(current.clone(), end))
          break
        }
        const r = rx

        // https://math.stackexchange.com/a/1781546
        const line = new Segment(current, end)
        const midpoint = line.pointAtLength(line.length / 2)
        const a = line.length / 2
        const b = Math.sqrt(r ** 2 - a ** 2)
        const v = new Vector(current, midpoint)
        const n = v.rotate90CCW().normalize()
        const center = midpoint.translate(n.multiply(sweep ? -b : b))

        const startAngle = new Vector(center, current).slope
        const endAngle = new Vector(center, end).slope

        parts.push(new Arc(
          center,
          r,
          startAngle,
          endAngle,
          sweep ? !large : large,
        ))
        current = end
        break
      }

      /* Quadratic */
      case CHAR.Q: {
        const control1 = new Point(number(), number())
        const end = new Point(number(), number())
        parts.push((lastQuadratic = new Quadratic(current.clone(), control1, end)))
        current = end
        break
      }
      case CHAR.q: {
        const control1 = new Point(current.x + number(), current.y + number())
        const end = new Point(current.x + number(), current.y + number())
        parts.push((lastQuadratic = new Quadratic(current.clone(), control1, end)))
        current = end
        break
      }
      case CHAR.T: {
        const control1 = lastQuadratic.end.translate(new Vector(lastQuadratic.control1, lastQuadratic.end))
        const end = new Point(number(), number())
        parts.push((lastQuadratic = new Quadratic(current.clone(), control1, end)))
        current = end
        break
      }
      case CHAR.t: {
        const control1 = lastQuadratic.end.translate(new Vector(lastQuadratic.control1, lastQuadratic.end))
        const end = new Point(current.x + number(), current.y + number())
        parts.push((lastQuadratic = new Quadratic(current.clone(), control1, end)))
        current = end
        break
      }

      /* Bezier */
      case CHAR.C: {
        const control1 = new Point(number(), number())
        const control2 = new Point(number(), number())
        const end = new Point(number(), number())
        parts.push((lastBezier = new Bezier(current.clone(), control1, control2, end)))
        current = end
        break
      }
      case CHAR.c: {
        const control1 = new Point(current.x + number(), current.y + number())
        const control2 = new Point(current.x + number(), current.y + number())
        const end = new Point(current.x + number(), current.y + number())
        parts.push((lastBezier = new Bezier(current.clone(), control1, control2, end)))
        current = end
        break
      }
      case CHAR.S: {
        const control1 = lastBezier.end.translate(new Vector(lastBezier.control1, lastBezier.end))
        const control2 = new Point(number(), number())
        const end = new Point(number(), number())
        parts.push((lastBezier = new Bezier(current.clone(), control1, control2, end)))
        current = end
        break
      }
      case CHAR.s: {
        const control1 = lastBezier.end.translate(new Vector(lastBezier.control1, lastBezier.end))
        const control2 = new Point(current.x + number(), current.y + number())
        const end = new Point(current.x + number(), current.y + number())
        parts.push((lastBezier = new Bezier(current.clone(), control1, control2, end)))
        current = end
        break
      }

      default: {
        throw new Error('unimplemented: ' + String.fromCodePoint(code))
      }
    }
    skipSeparator()
  }

  return allParts.map((parts) => new Path(parts))
}
