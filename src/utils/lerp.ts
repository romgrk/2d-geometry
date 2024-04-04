export function lerp(a: number, b: number, f: number) {
  return a * (1 - f) + b * f
}
