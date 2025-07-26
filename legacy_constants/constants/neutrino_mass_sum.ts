/**
 * Sum of light neutrino masses Σm_ν (eV units).
 * Parameter-free prediction: Σm_ν = 3 · m_ν, using the default
 * cascade seesaw result for a single generation.
 */
import type { EnhancedConstantDefinition } from "./utils/types";
import { calculateNeutrinoMass } from "./neutrino_mass";

// Single light-neutrino mass with default parameters (φ₀ canonical, n = 5, y_eff = 1)
const SINGLE_M_NU = calculateNeutrinoMass();

/** Predicted sum of neutrino masses (three degenerate eigenstates). */
export const SIGMA_NU_VALUE = 3 * SINGLE_M_NU;

export const NEUTRINO_MASS_SUM: EnhancedConstantDefinition = {
  symbol: "Σm_ν",
  name: "Sum of Neutrino Masses",
  description:
    "Total neutrino mass from the topological Type-I seesaw: Σm_ν = 3·m_ν, " +
    "with m_ν obtained from the 5-level cascade without free parameters.",
  formula: "3 * calculateNeutrinoMass()", // for runtime math.js evaluation
  latexFormula: "\\Sigma m_{\\nu} = 3\\,m_{\\nu}",
  variables: { calculateNeutrinoMass },
  unit: "eV",
  value: SIGMA_NU_VALUE, // ≈ 0.072 eV (using default φ₀)
  measured: 0.06, // Planck 2024 upper bound (95 % CL)
  uncertainty: 0.01,
  source: "Planck 2024 (+ BAO/Lyα)",
  category: "NEUTRINOS",
};
