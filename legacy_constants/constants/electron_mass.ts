// Electron Mass - m_e
// Declarative constant using your exact Yukawa coupling theory

import type { EnhancedConstantDefinition } from "./utils/types";

export const ELECTRON_MASS: EnhancedConstantDefinition = {
  symbol: "m_e",
  name: "Electron Mass",
  description:
    "Electron rest mass from Yukawa coupling: m_e = (v_H/√2) × α × φ₀⁵",
  formula: "(V_H / sqrt(2)) * ALPHA_EM * PHI0^5 * 1000000", // Your exact formula, GeV → MeV
  latexFormula: "m_e = \\frac{v_H}{\\sqrt{2}} \\cdot \\alpha \\cdot \\phi_0^5",
  variables: {
    V_H: 246.22, // GeV - Higgs VEV
    ALPHA_EM: 1 / 137.036, // Fine structure constant
    PHI0: 0.053171, // Your φ₀ from cubic equation
    sqrt: Math.sqrt,
  },
  unit: "MeV",
  measured: 0.5109989461,
  uncertainty: 3.1e-9,
  note: "≈ 5.66 % high; RG + pole-shift expected",
  source: "CODATA 2018",
  category: "LEPTONS",
};
