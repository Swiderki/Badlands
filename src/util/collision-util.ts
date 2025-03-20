import { Vec2D } from "@/types/physics";

export function getCarCorners(position: Vec2D, width: number, height: number, angle: number): Vec2D[] {
  const radianAngle = (angle * Math.PI) / 180;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const cosA = Math.cos(radianAngle);
  const sinA = Math.sin(radianAngle);

  //* Center the position of the car
  //* So here we have a problem with out center point of the car
  //* We need to add some offset to the position of the car
  //* That's why we have +30 and +15
  //* It's probably worth investigating why we need this offset
  const cx = position.x + halfHeight + 30;
  const cy = position.y + halfWidth + 15;
  return [
    {
      //* Front Left
      x: cx + (-halfWidth * cosA - -halfHeight * sinA),
      y: cy + (-halfWidth * sinA + -halfHeight * cosA),
    },
    {
      //* Front Right
      x: cx + (halfWidth * cosA - -halfHeight * sinA),
      y: cy + (halfWidth * sinA + -halfHeight * cosA),
    },
    {
      //* Rear Left
      x: cx + (-halfWidth * cosA - halfHeight * sinA),
      y: cy + (-halfWidth * sinA + halfHeight * cosA),
    },
    {
      //* Rear Right
      x: cx + (halfWidth * cosA - halfHeight * sinA),
      y: cy + (halfWidth * sinA + halfHeight * cosA),
    },
  ];
}

export function rayCast(from: Vec2D, to: Vec2D, corners: Vec2D[]): boolean {
  for (let i = 0; i < corners.length; i++) {
    const p1 = corners[i];
    const p2 = corners[(i + 1) % corners.length];
    if (doIntersect(from, to, p1, p2)) {
      return true;
    }
  }
  return false;
}

function doIntersect(from: Vec2D, to: Vec2D, p1: Vec2D, p2: Vec2D): boolean {
  function orientation(p: Vec2D, q: Vec2D, r: Vec2D): number {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) return 0; // Collinear
    return val > 0 ? 1 : 2; // Clockwise or Counterclockwise
  }

  function onSegment(p: Vec2D, q: Vec2D, r: Vec2D): boolean {
    return (
      q.x <= Math.max(p.x, r.x) &&
      q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) &&
      q.y >= Math.min(p.y, r.y)
    );
  }

  const o1 = orientation(from, to, p1);
  const o2 = orientation(from, to, p2);
  const o3 = orientation(p1, p2, from);
  const o4 = orientation(p1, p2, to);

  // General case
  if (o1 !== o2 && o3 !== o4) {
    return true;
  }

  // Special cases
  if (o1 === 0 && onSegment(from, p1, to)) return true;
  if (o2 === 0 && onSegment(from, p2, to)) return true;
  if (o3 === 0 && onSegment(p1, from, p2)) return true;
  if (o4 === 0 && onSegment(p1, to, p2)) return true;

  return false;
}
