// Cabibbo Angle – θ_c
// -----------------------------------------------------------------------------
// Topological prediction without ad-hoc masses:
//     sin θ_c  = √[ φ₀ / (1 + φ₀) ]
// Origin:
//   • φ₀ comes from 6D → 4D radion drop (topological fixed-point).
//   • In the E₈ cascade the first left-handed quark doublet sits one full step
//     (n = 1) below the strange/down singlets (n = 0).  The ratio of their
//     scales gives tan θ₁₂  ≃ √(φ₀ / (1 + φ₀)).  Expanding to first order in
//     φ₀ (≈ 0.05) reproduces the observed Cabibbo mixing with < 0.5 % error.
// Numerical inputs are therefore limited to a *single* topological parameter –
// no strange/down PDG masses required.
// -----------------------------------------------------------------------------

import type { EnhancedConstantDefinition } from "./utils/types";
import { PHI0 } from "./fundamentals";

// Helper – λ ≡ sin θ_c predicted by topology
const LAMBDA_TOPO = Math.sqrt(PHI0 / (1 + PHI0)); // ≈ 0.22469
const VALUE = Math.asin(LAMBDA_TOPO); // θ_c in radians ≈ 0.22663

export const CABIBBO_ANGLE: EnhancedConstantDefinition = {
  symbol: "θ_c",
  name: "Cabibbo Angle",
  description:
    "Quark mixing angle from topological scaling: sin θ_c = √(φ₀ / (1 + φ₀)).  No PDG masses needed.",
  formula: "asin( sqrt( PHI0 / (1 + PHI0 ) ) )",
  latexFormula:
    "\\theta_c = \\arcsin\\!\\Bigl( \\sqrt{ \\tfrac{\\phi_0}{1+\\phi_0} } \\Bigr)",
  variables: {
    PHI0,
    sqrt: Math.sqrt,
    asin: Math.asin,
  },
  unit: "radians",
  measured: 0.22736, // PDG 2024 central value
  uncertainty: 0.00061,
  source: "PDG 2024",
  category: "QUARKS",
  value: VALUE,
};
