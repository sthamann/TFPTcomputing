// ======================================================================================
// src/lib/constants/fundamentals.ts – Single Source of Truth for All Physical Constants
// ======================================================================================
// All fundamental parameters and derived constants in one place.
// Other files import from here instead of duplicating values.

import { PI, sqrt, log } from "mathjs";

// ---------------------------------------------------------------------------
// Fundamental topological parameters (single source of truth)
// ---------------------------------------------------------------------------
export const C3 = 1 / (8 * Math.PI); // c₃ ≈ 0.039789
export const M_Z = 91.1876; // Z-Masse [GeV]
export const ALPHA_S_MZ = 0.1181; // α_s(M_Z) 1-loop MS-bar
// Theory constants (pure numbers)
const A = Math.pow(C3, 2) / (4 * Math.PI); // Relation visible: A = c₃²/(4π)
const B1 = 41 / 10; // U(1)_Y one‑loop coefficient

// ---------------------------------------------------------------------------
// Cubic solver – *single real root* (Cardano, numerically stable)
// ---------------------------------------------------------------------------
export function solveCubic(a: number, b: number, c: number, d: number): number {
  // Solve ax³ + bx² + cx + d = 0, return the physical root 0 < x < 1

  // Normalize to x³ + px + q = 0 form
  const p = (3 * a * c - Math.pow(b, 2)) / (3 * Math.pow(a, 2));
  const q =
    (2 * Math.pow(b, 3) - 9 * a * b * c + 27 * Math.pow(a, 2) * d) /
    (27 * Math.pow(a, 3));

  // Discriminant
  const discriminant = Math.pow(q / 2, 2) + Math.pow(p / 3, 3);

  if (discriminant >= 0) {
    // One real root
    const sqrt_disc = Math.sqrt(discriminant);
    const u = Math.cbrt(-q / 2 + sqrt_disc);
    const v = Math.cbrt(-q / 2 - sqrt_disc);
    const x = u + v - b / (3 * a);
    return x;
  } else {
    // Three real roots - use trigonometric solution
    const rho = Math.sqrt(-Math.pow(p / 3, 3));
    const theta = Math.acos(-q / (2 * rho));

    // Three roots
    const x1 = 2 * Math.cbrt(rho) * Math.cos(theta / 3) - b / (3 * a);
    const x2 =
      2 * Math.cbrt(rho) * Math.cos((theta + 2 * Math.PI) / 3) - b / (3 * a);
    const x3 =
      2 * Math.cbrt(rho) * Math.cos((theta + 4 * Math.PI) / 3) - b / (3 * a);

    // Return the physical root 0 < x < 1
    const roots = [x1, x2, x3].filter((x) => x > 0 && x < 1);
    return roots[0] || x1; // fallback to first root if none in range
  }
}

// Self-consistent solution: φ₀ = 0.053171 from topological fixed point
export const PHI0 = 0.053171;

// κ from the self‑consistency condition
export const KAPPA = (B1 / (2 * Math.PI)) * Math.log(1 / PHI0);

// ---------------------------------------------------------------------------
// Standard Model reference values (CODATA 2022)
// ---------------------------------------------------------------------------
export const ALPHA_VALUE = 1 / 137.035999084; // Fine structure constant
export const M_PLANCK = 1.22091e19; // Planck mass in GeV
export const V_H = 246.21965; // Higgs VEV in GeV
export const G_F = 1.1663787e-5; // Fermi constant in GeV⁻²
export const M_ELECTRON = 0.5109989461; // Electron mass in MeV
export const M_PROTON = 938.272081; // Proton mass in MeV
export const M_MUON = 105.6583745; // Muon mass in MeV
export const M_TAU = 1776.86; // Tau mass in MeV

// Physics constants
export const HBAR_C = 0.19732697; // ħc in GeV·fm
export const T_PLANCK = 1.4168e32; // Planck temperature in K

// ───────────────────────────────────────────────────────
// Basic QCD β-function (no circular dependency)
// ───────────────────────────────────────────────────────

// Simple 1-Loop Beta function for QCD
export function alphaStrong(
  muGeV: number,
  nF: number,
  lambdaGeV: number,
): number {
  const beta0 = 11 - (2 * nF) / 3;
  return (2 * Math.PI) / (beta0 * Math.log(muGeV / lambdaGeV));
}
