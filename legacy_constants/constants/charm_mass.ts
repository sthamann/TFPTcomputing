// Charm Quark Mass - m_c
// Declarative constant using your exact 16-step cascade theory

import type { EnhancedConstantDefinition } from './utils/types';

export const CHARM_MASS: EnhancedConstantDefinition = {
  symbol: 'm_c',
  name: 'Charm Quark Mass',
  description: 'Charm MS‑bar mass from 16‑step cascade: m_c = M_Pl · φ₀¹⁶ / c₃',
  formula: '(M_PLANCK_GEV * PHI0^16) / C3',  // Your exact formula
  latexFormula: 'm_c = \\frac{M_{\\text{Pl}} \\cdot \\phi_0^{16}}{c_3}',
  variables: {
    M_PLANCK_GEV: 1.22091e19,  // Planck mass in GeV
    PHI0: 0.053171,            // Your φ₀ from cubic equation
    C3: 1 / (8 * Math.PI),     // Your c₃ = 1/(8π)
  },
  unit: 'GeV',
  measured: 1.27,
  uncertainty: 0.02,
  source: 'PDG 2024 (MS‑bar, 2 GeV)',
  category: 'QUARKS'
};