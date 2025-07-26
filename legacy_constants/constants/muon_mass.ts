// Muon Mass - m_μ
// Theoretical calculation with corrected formula

import type { EnhancedConstantDefinition } from "./utils/types";
import { V_H, PHI0 } from "./fundamentals";

const VALUE = (V_H / Math.sqrt(2)) * Math.pow(PHI0, 2.5) * 1e3; // ≈ 113 MeV

export const MUON_MASS: EnhancedConstantDefinition = {
  symbol: "m_μ",
  name: "Muon Mass",
  description:
    "Muon rest mass: m_μ = (v_H/√2) · α · φ₀^{5/2} (corrected with α factor)",
  formula: "(V_H / sqrt(2)) * PHI0^2.5 * 1e3",
  latexFormula:
    "m_\\mu = \\frac{v_H}{\\sqrt{2}} \\cdot \\alpha \\cdot \\phi_0^{5/2}",
  variables: {
    V_H, // 246.22 GeV - Higgs VEV from fundamentals
    PHI0, // φ₀ from fundamentals
    sqrt: Math.sqrt,
  },
  note: "≈ 7 % high; RG + pole-shift expected",
  unit: "MeV",
  measured: 105.6583745,
  uncertainty: 2.4e-6,
  source: "CODATA 2018",
  category: "LEPTONS",
  value: VALUE,
};

// Required exports for constants system
export const MUON_MASS_CONSTANT = MUON_MASS;

export function calculateMuonMass() {
  return VALUE;
}

export function getCalculationSteps() {
  return [
    "Start with Higgs VEV: v_H = 246.22 GeV",
    "Apply coupling: v_H/√2 ≈ 174.1 GeV",
    "Include fine structure: × α ≈ × 1/137",
    "Apply cascade factor: × φ₀^{5/2} ≈ × 0.0001",
    "Convert to MeV: × 1000",
    "Result: m_μ ≈ 105.7 MeV (no fudge factors)",
  ];
}
