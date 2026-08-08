import { ForceVector, Vector2D } from '../types';

export const degToRad = (deg: number): number => (deg * Math.PI) / 180;
export const radToDeg = (rad: number): number => (rad * 180) / Math.PI;

/**
 * Normalizes an angle in degrees to [0, 360)
 */
export const normalizeAngle = (deg: number): number => {
  let a = deg % 360;
  if (a < 0) a += 360;
  return a;
};

/**
 * Convert polar coordinates (magnitude, angle in degrees) to Cartesian (x, y)
 */
export const polarToCartesian = (magnitude: number, angleDeg: number): Vector2D => {
  const rad = degToRad(angleDeg);
  return {
    x: magnitude * Math.cos(rad),
    y: magnitude * Math.sin(rad), // SVG y goes down normally, but we treat standard Math plane +y up
  };
};

/**
 * Convert Cartesian (x, y) to polar (magnitude, angle in degrees)
 */
export const cartesianToPolar = (x: number, y: number): { magnitude: number; angleDeg: number } => {
  const magnitude = Math.sqrt(x * x + y * y);
  let angleRad = Math.atan2(y, x);
  let angleDeg = radToDeg(angleRad);
  if (angleDeg < 0) angleDeg += 360;
  return { magnitude, angleDeg };
};

/**
 * Calculate resultant vector (sum of force vectors)
 */
export const calculateNetForce = (forces: ForceVector[]): {
  netX: number;
  netY: number;
  netMagnitude: number;
  netAngleDeg: number;
} => {
  let netX = 0;
  let netY = 0;

  forces.forEach((f) => {
    const rad = degToRad(f.angleDeg);
    netX += f.magnitude * Math.cos(rad);
    netY += f.magnitude * Math.sin(rad);
  });

  const netMagnitude = Math.sqrt(netX * netX + netY * netY);
  let netAngleDeg = radToDeg(Math.atan2(netY, netX));
  if (netAngleDeg < 0) netAngleDeg += 360;

  return { netX, netY, netMagnitude, netAngleDeg };
};

/**
 * Calculate resultant magnitude for 2 vectors given angle alpha between them
 * F_hl = sqrt(F1^2 + F2^2 + 2 * F1 * F2 * cos(alpha))
 */
export const calculateParallelogramResultant = (
  f1: number,
  f2: number,
  alphaDeg: number
): { magnitude: number; angleRelF1Deg: number } => {
  const alphaRad = degToRad(alphaDeg);
  const fResultSq = f1 * f1 + f2 * f2 + 2 * f1 * f2 * Math.cos(alphaRad);
  const magnitude = Math.sqrt(Math.max(0, fResultSq));

  // Angle relative to F1
  let angleRelF1Deg = 0;
  if (magnitude > 1e-6) {
    // sin(theta) = F2 * sin(alpha) / F_hl
    const sinTheta = (f2 * Math.sin(alphaRad)) / magnitude;
    const cosTheta = (f1 + f2 * Math.cos(alphaRad)) / magnitude;
    angleRelF1Deg = radToDeg(Math.atan2(sinTheta, cosTheta));
    if (angleRelF1Deg < 0) angleRelF1Deg += 360;
  }

  return { magnitude, angleRelF1Deg };
};

/**
 * Format numbers according to user decimal precision choice
 */
export const formatVal = (val: number, precision: number = 1): string => {
  if (isNaN(val)) return '0';
  return val.toFixed(precision);
};
