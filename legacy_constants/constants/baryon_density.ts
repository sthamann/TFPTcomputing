// ======================================================================================
// src/lib/constants/baryonDensity.ts – Baryon Density Parameter Ω_b (topological)
// ======================================================================================
import type { EnhancedConstantDefinition } from "./utils/types";
import { PHI0 } from "./fundamentals";

// Theory:  Ω_b = φ₀   (direct topological scaling, no free parameters)
export const OMEGA_B_VALUE = PHI0;

export const OMEGA_B: EnhancedConstantDefinition = {
  symbol: "Ω_b",
  name: "Baryon Density Parameter",
  description:
    "Cosmic baryon density derived from topological scaling: Ω_b = φ₀ (no free parameters).",
  formula: "PHI0",
  latexFormula: "\\phi_0",
  variables: { PHI0 },
  category: "COSMOLOGY",
  unit: "", // dimensionless fraction of critical density
  value: OMEGA_B_VALUE,
  measured: 0.04897, // Planck 2018
  uncertainty: 0.0002,
  source: "Planck 2018",
};

// Convenience export
export const BARYON_DENSITY_CONSTANT = OMEGA_B;

// Calculate function
export function calculateBaryonDensity() {
  return OMEGA_B_VALUE;
}

// Calculation steps
export function getCalculationSteps() {
  return [
    "Start with fundamental parameter φ₀ = 0.053171",
    "Direct topological scaling: Ω_b = φ₀",
    "Result: Ω_b = 0.053171 (no fudge factors)"
  ];
}
