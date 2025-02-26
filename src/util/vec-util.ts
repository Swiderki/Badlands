import { Vec2D } from "@/types/physics";

export namespace Vector {
  export function normalize(v: Vec2D): Vec2D {
    const length = Math.sqrt(v.x * v.x + v.y * v.y);
    return { x: v.x / length, y: v.y / length };
  }

  export function scale(v: Vec2D, scalar: number): Vec2D {
    return { x: Math.floor(v.x * 1000 * scalar) / 1000, y: Math.floor(v.y * 1000 * scalar) / 1000 };
  }

  export function add(v1: Vec2D, v2: Vec2D): Vec2D {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
  }

  export function subtract(v1: Vec2D, v2: Vec2D): Vec2D {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
  }

  export function dot(v1: Vec2D, v2: Vec2D): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  export function length(v: Vec2D): number {
    return Math.sqrt(v.x ** 2 + v.y ** 2);
  }

  export function distance(v1: Vec2D, v2: Vec2D): number {
    return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
  }

  export function angle(v: Vec2D): number {
    return Math.atan2(v.y, v.x) * (180 / Math.PI); // pytanie czy ta funkcja jest dobrze zoptymalizowana, jak nie to trzeba to inaczej jakoś zrobić
  }
}
