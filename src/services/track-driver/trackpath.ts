class TrackPath {
  private path: Path2D;
  private sampledPoints: { x: number; y: number }[] = [];

  constructor() {
    this.path = new Path2D();
    this.generatePath();
    this.samplePath(); // Store points along the path for progress calculation
  }

  private generatePath() {
    this.path.moveTo(100, 100); // Start point
    this.path.bezierCurveTo(200, 150, 300, 200, 400, 250); // Bézier curve
  }

  private samplePath(resolution: number = 100) {
    this.sampledPoints = [];
    for (let t = 0; t <= 1; t += 1 / resolution) {
      const point = this.getBezierPoint(
        t,
        { x: 100, y: 100 }, // P0
        { x: 200, y: 150 }, // P1
        { x: 300, y: 200 }, // P2
        { x: 400, y: 250 } // P3
      );
      this.sampledPoints.push(point);
    }
  }

  //* Beings honest i have no idea how these one works
  //* I just the formula copied from the internet
  //* If this part malfunctions, its your problem from now on
  private getBezierPoint(
    t: number,
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number }
  ) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    return {
      x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
      y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
    };
  }

  public getClosestProgress(playerPos: { x: number; y: number }): number {
    let minDist = Infinity;
    let closestIndex = 0;

    this.sampledPoints.forEach((point, index) => {
      const dist = Math.hypot(playerPos.x - point.x, playerPos.y - point.y);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = index;
      }
    });

    return (closestIndex / (this.sampledPoints.length - 1)) * 100;
  }
}
