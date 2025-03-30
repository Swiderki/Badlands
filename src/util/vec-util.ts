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

  export function lerp(v1: Vec2D, v2: Vec2D, t: number): Vec2D {
    return {
      x: v1.x + (v2.x - v1.x) * t,
      y: v1.y + (v2.y - v1.y) * t,
    };
  }

  export function angleBetween(v1: Vec2D, v2: Vec2D): number {
    return Math.atan2(v2.y - v1.y, v2.x - v1.x);
  }

  export function equals(v1: Vec2D, v2: Vec2D): boolean {
    return v1.x === v2.x && v1.y === v2.y;
  }

  export function perpendicular(v: Vec2D): Vec2D {
    return { x: -v.y, y: v.x };
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
    return Math.atan2(v.y, v.x) * (180 / Math.PI);
  }

  export function generateVectorFromAngle(magnitude: number, angle: number): Vec2D {
    const radianAngle = (angle * Math.PI) / 180;
    return {
      x: magnitude * Math.cos(radianAngle),
      y: magnitude * Math.sin(radianAngle),
    };
  }

  export function maxLength(v: Vec2D, maxLength: number): Vec2D {
    let vector = v;
    if (length(v) > maxLength) {
      vector = generateVectorFromAngle(maxLength, angle(v));
    }
    return vector;
  }

  export function round(v: Vec2D) : Vec2D{
    return {x: Math.round(v.x), y: Math.round(v.y)} as Vec2D;
  }

  //* Returns distance between lineVec treated as line and pointVec treated as point
  export function distanceToLine(lineVec: Vec2D, pointVec: Vec2D): number {
    const cross = Math.abs(lineVec.x * pointVec.y - lineVec.y * pointVec.x);
    const lineLength = Math.sqrt(lineVec.x ** 2 + lineVec.y ** 2);
  
    return cross / lineLength;
  }

  export function cosineSimilarity(a: Vec2D, b: Vec2D): number {
    const dotProduct = a.x * b.x + a.y * b.y;
    const magnitudeA = Math.sqrt(a.x ** 2 + a.y ** 2);
    const magnitudeB = Math.sqrt(b.x ** 2 + b.y ** 2);
  
    if (magnitudeA === 0 || magnitudeB === 0) {
      throw new Error("Cannot calculate cosine similarity with zero-length vector.");
    }
  
    return dotProduct / (magnitudeA * magnitudeB);
  }
  export function subtractFromLength(v: Vec2D, amount: number): Vec2D {
    const len = length(v);
    if (len === 0) return v;

    const newLength = Math.max(0, len - amount);
    return scale(normalize(v), newLength);
  }

  export function degreeBetweenVectors(a: Vec2D, b: Vec2D): number {
    const dotProduct = a.x * b.x + a.y * b.y;
    const magA = Math.sqrt(a.x ** 2 + a.y ** 2);
    const magB = Math.sqrt(b.x ** 2 + b.y ** 2);
  
    if (magA === 0 || magB === 0) {
      throw new Error("Cannot compute angle with zero-length vector");
    }
  
    let cosTheta = dotProduct / (magA * magB);
  
    // Clamp cosTheta to avoid floating-point errors outside of valid range
    cosTheta = Math.max(-1, Math.min(1, cosTheta));
  
    const angleRad = Math.acos(cosTheta);
    const angleDeg = angleRad * (180 / Math.PI);
    return angleDeg;
  }
}
