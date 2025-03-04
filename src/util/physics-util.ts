import { Vec2D } from "@/types/physics";
import { Vector } from "./vec-util";
export namespace PhysicsUtils {
  export function normalizeAngle(angle: number) {
    let normalizedAngle = angle % 360;
    if (normalizedAngle < 0) {
      normalizedAngle += 360;
    }
    return normalizedAngle;
  }
  export function normalizeForceToAngle(v: Vec2D, angle: number, ratio: number) {
    let vector = Vector.scale(v, 1 - ratio);
    let secondVector = Vector.generateVectorFromAngle(Vector.length(v) * ratio, angle);
    vector = Vector.add(vector, secondVector);
    return vector;
  }

  export function linearRegression(samples: Vec2D[]): [number, number] {
      //* This function performs a linear regression
      //* (finds best fitting line throught give list of Vec2D type points)

      //* It returns the slope and the y-intercept (in y=ax+b form; it returns a and b)

      const n = samples.length;
      if (n < 2) {
          throw new Error("You need to pass at least two different points inside of the linearRegression list parameter.");
      }
  
      let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0;
      for (const sample of samples) {
          sumX += sample.x;
          sumY += sample.y;
          sumXX += sample.x ** 2;
          sumXY += sample.x * sample.y;
      }
  
      const denominator = (n * sumXX - sumX ** 2);
      if (denominator === 0) {
        //! here we handle the case of a vertical line
        //! make this if statement return something that will tell you that the line is vertical, 
        //! so you can handle it in the calling function in a proper way
          throw new Error("The fitting line is vertical.");
      }
  
      const a = (n * sumXY - sumX * sumY) / denominator;
      const b = (sumY - a * sumX) / n;
  
      return [a, b];
  }
}
