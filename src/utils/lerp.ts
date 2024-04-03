export function lerp(a: number, b: number, f: number) {
  return a * f + b * (1 - f)
}
