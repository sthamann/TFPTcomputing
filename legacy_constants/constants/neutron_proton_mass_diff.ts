import type { EnhancedConstantDefinition } from "./utils/types";
import { PHI0 } from "./fundamentals";

// Neutron-proton mass difference from topological fixed point theory
// Formula: m_e × φ₀ × 48
const M_ELECTRON_MEV = 0.51099895; // MeV
const VALUE = M_ELECTRON_MEV * PHI0 * 48;

export const NEUTRON_PROTON_MASS_DIFF: EnhancedConstantDefinition = {
  symbol: "Δm_n-p",
  name: "Neutron-Proton Mass Difference",
  description: "Mass difference between neutron and proton",
  formula: "M_ELECTRON_MEV * PHI0 * 48",
  latexFormula: "\\Delta m_{n-p} = m_e \\cdot \\phi_0 \\cdot 48",
  variables: {
    M_ELECTRON_MEV,
    PHI0,
  },
  unit: "MeV",
  value: VALUE,
  measured: 1.2933,
  uncertainty: 0.0005,
  source: "PDG 2024",
  category: "QCD",
  note: "Tests lepton-baryon coupling"
};

export const NEUTRON_PROTON_MASS_DIFF_CONSTANT = NEUTRON_PROTON_MASS_DIFF;
export const calculateNeutronProtonMassDiff = () => VALUE;