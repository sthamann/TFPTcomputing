// -------------------------------------------------------------------------------------------------
// src/lib/constants/cmbTemperature.ts – CMB photon temperature T_γ0
// -------------------------------------------------------------------------------------------------
//  • 25‑step thermal φ‑cascade ⇒ factor φ₀²⁵
//  • e⁺e⁻‑Reheating elevates photons vs. neutrinos by (11/4)^{1/3}
//    → no free tweak: purely SM entropy conservation.

import type { EnhancedConstantDefinition } from "./utils/types";
import { PHI0 } from "./alpha";

export const T_PLANCK = 1.4168e32; // Planck temperature [K]
const REHEAT_FACTOR = Math.pow(11 / 4, 1 / 3); // (11/4)^{1/3} ≈ 1.401

export const T_GAMMA0_VALUE = T_PLANCK * Math.pow(PHI0, 25) * REHEAT_FACTOR;

export const CMB_TEMPERATURE: EnhancedConstantDefinition = {
  symbol: "T_γ0",
  name: "CMB Temperature",
  description:
    "Cosmic microwave background temperature: T_γ0 = T_Pl · φ₀²⁵ · (11/4)^{1/3} – 25‑step topological thermal cascade plus e⁺e⁻ reheating.",
  formula: "T_PLANCK * PHI0^25 * REHEAT_FACTOR",
  latexFormula:
    "T_{\\gamma0} = T_{\\text{Pl}}\\,\\phi_0^{25}\\left(\\tfrac{11}{4}\\right)^{1/3}",
  variables: {
    T_PLANCK,
    PHI0,
    REHEAT_FACTOR,
  },
  unit: "K",
  measured: 2.7255,
  uncertainty: 0.0006,
  source: "COBE/WMAP/Planck",
  category: "COSMOLOGY",
  value: T_GAMMA0_VALUE,
};

// Required exports for the constants system
export const CMB_TEMPERATURE_CONSTANT = CMB_TEMPERATURE;

export function calculateCmbTemperature() {
  return T_GAMMA0_VALUE;
}

export function getCalculationSteps() {
  return [
    "Start with Planck temperature T_Pl = 1.417 × 10³² K",
    "Apply 25-step topological thermal cascade: φ₀²⁵ with φ₀ = 0.053171",
    "Apply e⁺e⁻ reheating factor: (11/4)^(1/3) ≈ 1.401", 
    "Result: T_γ0 = T_Pl × φ₀²⁵ × 1.401 ≈ 2.73 K"
  ];
}
