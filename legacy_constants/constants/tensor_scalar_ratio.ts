import type { EnhancedConstantDefinition } from "./utils/types";
import { PHI0 } from "./fundamentals";

// Tensor-to-scalar ratio r from topological fixed point theory
// Formula: φ₀² ≈ 2.8 × 10⁻³
const VALUE = PHI0 ** 2;

export const TENSOR_SCALAR_RATIO: EnhancedConstantDefinition = {
  symbol: "r",
  name: "Tensor-to-Scalar Ratio",
  description: "Primordial gravitational wave to scalar perturbation ratio",
  formula: "PHI0^2",
  latexFormula: "r = \\phi_0^2",
  variables: {
    PHI0,
  },
  unit: "×10⁻³",
  value: VALUE * 1e3, // Convert to 10⁻³ units
  measured: 2.8, // Upper limit
  uncertainty: 1.4,
  source: "CMB-S4 projection",
  category: "COSMOLOGY",
  note: "φ₀² ≈ 2.8 × 10⁻³ - CMB-S4 in reach"
};

export const TENSOR_SCALAR_RATIO_CONSTANT = TENSOR_SCALAR_RATIO;
export const calculateTensorScalarRatio = () => VALUE;