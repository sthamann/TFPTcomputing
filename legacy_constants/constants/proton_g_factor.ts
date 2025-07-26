import type { EnhancedConstantDefinition } from "./utils/types";

// Proton g-factor μ_p/μ_N from topological fixed point theory
// Formula: (60 + 7) / (8 × 3) = 67/24
const VALUE = (60 + 7) / (8 * 3);

export const PROTON_G_FACTOR: EnhancedConstantDefinition = {
  symbol: "μ_p/μ_N",
  name: "Proton g-factor",
  description: "Proton magnetic moment in nuclear magnetons",
  formula: "(60 + 7) / (8 * 3)",
  latexFormula: "\\frac{\\mu_p}{\\mu_N} = \\frac{67}{24}",
  variables: {},
  unit: "dimensionless",
  value: VALUE,
  measured: 2.79285,
  uncertainty: 0.00003,
  source: "NIST 2022",
  category: "QCD",
  note: "67/24 → 0.04% beside data"
};

export const PROTON_G_FACTOR_CONSTANT = PROTON_G_FACTOR;
export const calculateProtonGFactor = () => VALUE;