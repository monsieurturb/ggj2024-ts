export const clamp = (min: number, max: number, v: number) => Math.min(Math.max(v, min), max);
export const lerp = (a: number, b: number, t: number) => (1 - t) * a + b * t;
export const ilerp = (a: number, b: number, v: number) => (v - a) / (b - a);
