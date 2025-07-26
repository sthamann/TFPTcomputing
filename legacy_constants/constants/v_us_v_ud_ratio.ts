import type { EnhancedConstantDefinition } from "./utils/types";
import { PHI0 } from "./fundamentals";

// V_us / V_ud ratio from topological fixed point theory
// Formula: √φ₀ ≈ 0.2306
const VALUE = Math.sqrt(PHI0);

export const V_US_V_UD_RATIO: EnhancedConstantDefinition = {
  symbol: "V_us/V_ud",
  name: "CKM Matrix Element Ratio",
  description: "Ratio of CKM matrix elements V_us/V_ud from topological scaling",
  formula: "sqrt(PHI0)",
  latexFormula: "\\frac{V_{us}}{V_{ud}} = \\sqrt{\\phi_0}",
  variables: {
    PHI0,
    sqrt: Math.sqrt,
  },
  unit: "dimensionless",
  value: VALUE,
  measured: 0.2313,
  uncertainty: 0.0013,
  source: "PDG 2024",
  category: "QUARKS",
  note: "Clean √φ₀ hit with 0.19% deviation"
};

export const V_US_V_UD_RATIO_CONSTANT = V_US_V_UD_RATIO;
export const calculateVUsVUdRatio = () => VALUE;