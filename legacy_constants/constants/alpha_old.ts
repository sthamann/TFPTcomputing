// src/lib/constants/alpha.ts – Fine‑Structure Constant (self‑contained)
// ----------------------------------------------------------------------------------
//  • Only two inputs:   φ0  and   c3 = 1/(8π).
//  • κ is fixed by Standard‑Model running: κ = (b1/2π) ln(1/φ0),   b1 = 41 / 10.
//  • α is the *physical* real root 0 < α < 1 of the cubic
//        x³ − A x² − A c3² κ = 0.
//
//  math.js integration: we expose the helper function `solveCubic` in the constant’s
//  variable map, so the declarative engine can call it during `evaluate()`.
// ----------------------------------------------------------------------------------

import type { EnhancedConstantDefinition } from "./utils/types";
import { PI, sqrt, log } from "mathjs";

// ---------------------------------------------------------------------------
// Fundamental parameters (single source of truth)
// ---------------------------------------------------------------------------
export const C3 = 1 / (8 * Math.PI); // c₃  ≈ 0.039 789
export const PHI0 = 0.053171; // φ₀  from topological fixed point

// Theory constants (pure numbers)
const A = 1 / (256 * Math.PI ** 3);
const B1 = 41 / 10; // U(1)_Y one‑loop coefficient

// κ from the self‑consistency condition
export const KAPPA = (B1 / (2 * Math.PI)) * Math.log(1 / PHI0);

// ---------------------------------------------------------------------------
// Cubic solver – *single real root* (Cardano, numerically stable)
// ---------------------------------------------------------------------------
function solveCubic(a: number, b: number, c: number, d: number): number {
  // Solve  a x³ + b x² + c x + d = 0  and return the relevant real root.
  const p = (3 * a * c - b * b) / (3 * a * a);
  const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
  const Δ = (q * q) / 4 + (p * p * p) / 27;

  if (Δ >= 0) {
    // One real root
    const u = Math.cbrt(-q / 2 + Math.sqrt(Δ));
    const v = Math.cbrt(-q / 2 - Math.sqrt(Δ));
    return u + v - b / (3 * a);
  }

  // Three real roots – choose the one in (0, 1)
  const r = Math.sqrt((-p * p * p) / 27);
  const φ = Math.acos(-q / (2 * r));
  const root = 2 * Math.cbrt(r);
  const candidateRoots = [
    root * Math.cos(φ / 3),
    root * Math.cos((φ + 2 * Math.PI) / 3),
    root * Math.cos((φ + 4 * Math.PI) / 3),
  ].map((x) => x - b / (3 * a));

  // Pick the positive root below 1 (only one fits for α)
  return candidateRoots.find((x) => x > 0 && x < 1)!;
}

// ---------------------------------------------------------------------------
// Declarative constant object – math.js evaluates the *formula* at runtime
// ---------------------------------------------------------------------------
export const ALPHA: EnhancedConstantDefinition = {
  symbol: "α",
  name: "Fine‑Structure Constant",
  description:
    "Derived via the cubic RG fixed‑point equation x³ − A x² − A c₃² κ = 0 with κ = (b₁/2π) ln(1/φ₀). No free parameters.",
  formula: "solveCubic(1, -A, 0, -A * c3^2 * κ)",
  latexFormula: "x^{3} - A x^{2} - A c_{3}^{2} \\kappa = 0",
  variables: {
    A,
    c3: C3,
    κ: KAPPA,
    solveCubic, // ← exposes the helper to math.js
  },
  category: "FUNDAMENTAL",
  unit: "dimensionless",
  measured: 1 / 137.035999084, // CODATA‑22
  uncertainty: 1.1e-12,
  source: "CODATA 2022",
};

// Convenience numeric export
export const ALPHA_VALUE = solveCubic(1, -A, 0, -A * C3 * C3 * KAPPA);
