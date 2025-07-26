// Bottom Quark Mass – parameter-free cascade (15½ steps)

import type { EnhancedConstantDefinition } from "./utils/types";
import { M_PLANCK, PHI0, C3 } from "./fundamentals";

const VALUE = (M_PLANCK * Math.pow(PHI0, 15)) / Math.sqrt(C3); // GeV

export const BOTTOM_MASS: EnhancedConstantDefinition = {
  symbol: "m_b",
  name: "Bottom Quark Mass",
  description:
    "Bottom MS-bar mass from 15-step cascade with half gauge mixing: " +
    "m_b = M_Pl · φ₀¹⁵ / √c₃",
  formula: "M_PLANCK_GEV * PHI0^15 / sqrt(C3)",
  latexFormula: "m_b = \\dfrac{M_{\\text{Pl}}\\,\\phi_0^{15}}{\\sqrt{c_3}}",
  variables: { M_PLANCK_GEV: M_PLANCK, PHI0, C3, sqrt: Math.sqrt },
  unit: "GeV",
  value: VALUE, // ≈ 4.70 GeV
  measured: 4.18,
  uncertainty: 0.03,
  note: "≈ 12 % high; RG + pole-shift expected",
  source: "PDG 2024 (MS-bar, 5 GeV)",
  category: "QUARKS",
};

// Convenience export
export const BOTTOM_MASS_CONSTANT = BOTTOM_MASS;
export const calculateBottomMass = () => VALUE;

export const getCalculationSteps = () => [
  "φ₀¹⁵ = " + (PHI0 ** 15).toExponential(6),
  "√c₃  = " + Math.sqrt(C3).toPrecision(4),
  "m_b  = M_Pl × φ₀¹⁵ / √c₃ ≈ " + VALUE.toFixed(3) + " GeV",
];
