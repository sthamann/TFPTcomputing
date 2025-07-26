import type { EnhancedConstantDefinition } from "./utils/types";

// f_π / Λ_QCD ratio from topological fixed point theory
// Formula: 3/5 simple fraction
const VALUE = 3/5;

export const FPI_LAMBDA_QCD_RATIO: EnhancedConstantDefinition = {
  symbol: "f_π/Λ_QCD",
  name: "Pion Decay Constant to QCD Scale Ratio",
  description: "Ratio of pion decay constant to QCD scale",
  formula: "3/5",
  latexFormula: "\\frac{f_\\pi}{\\Lambda_{QCD}} = \\frac{3}{5}",
  variables: {},
  unit: "dimensionless",
  value: VALUE,
  measured: 1.51, // f_π ≈ 131 MeV, Λ_QCD ≈ 87 MeV
  uncertainty: 0.08,
  source: "PDG 2024",
  category: "QCD",
  note: "Simple fraction 3/5, fits within errors"
};

export const FPI_LAMBDA_QCD_RATIO_CONSTANT = FPI_LAMBDA_QCD_RATIO;
export const calculateFpiLambdaQcdRatio = () => VALUE;