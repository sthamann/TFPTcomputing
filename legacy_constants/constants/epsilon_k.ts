import type { EnhancedConstantDefinition } from "./utils/types";
import { PHI0 } from "./fundamentals";

// ε_K indirect CP violation from topological fixed point theory
// Formula: φ₀² / √2
const VALUE = (PHI0 ** 2) / Math.sqrt(2);

export const EPSILON_K: EnhancedConstantDefinition = {
  symbol: "ε_K",
  name: "Indirect CP Violation Parameter",
  description: "Indirect CP violation parameter in kaon system",
  formula: "PHI0^2 / sqrt(2)",
  latexFormula: "\\varepsilon_K = \\frac{\\phi_0^2}{\\sqrt{2}}",
  variables: {
    PHI0,
    sqrt: Math.sqrt,
  },
  unit: "×10⁻³",
  value: VALUE * 1e3, // Convert to 10⁻³ units
  measured: 2.228,
  uncertainty: 0.011,
  source: "PDG 2024",
  category: "QUARKS",
  note: "Well measured, testing ground for theory"
};

export const EPSILON_K_CONSTANT = EPSILON_K;
export const calculateEpsilonK = () => VALUE;