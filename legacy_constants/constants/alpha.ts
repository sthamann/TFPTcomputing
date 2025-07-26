// src/lib/constants/alpha.ts – Fine‑Structure Constant (self‑consistent)
// ----------------------------------------------------------------------------------
//  • Only two inputs:   φ₀  and   c₃ = 1/(8π).
//  • κ is fixed by Standard‑Model running: κ = (b₁/2π) ln(1/φ₀),   b₁ = 41 / 10.
//  • α is the *physical* real root 0 < α < 1 of the cubic
//        x³ − A x² − A c₃² κ = 0.
//
//  Now imports all fundamentals from single source of truth.
// ----------------------------------------------------------------------------------

import type { EnhancedConstantDefinition } from "./utils/types";
import { C3, PHI0, KAPPA, solveCubic } from "./fundamentals";

// Theory constants (pure numbers)
const A = Math.pow(C3, 2) / (4 * Math.PI); // Relation visible: A = c₃²/(4π)

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
  value: solveCubic(1, -A, 0, -A * C3 * C3 * KAPPA),
};

// Convenience numeric export
export const ALPHA_VALUE = solveCubic(1, -A, 0, -A * C3 * C3 * KAPPA);

// Required exports for constants system
export const ALPHA_CONSTANT = ALPHA;

export function calculateAlpha() {
  return ALPHA_VALUE;
}

export function getCalculationSteps() {
  return [
    "Start with topological parameter φ₀ ≈ 0.053171",
    "Calculate κ = (41/10)/(2π) × ln(1/φ₀) ≈ 1.914",
    "Set A = c₃²/(4π) where c₃ = 1/(8π)",
    "Solve cubic: x³ - Ax² - Ac₃²κ = 0",
    "Result: α ≈ 1/137.036"
  ];
}

// Re-export fundamentals for backward compatibility
export { C3, PHI0, KAPPA };