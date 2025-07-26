// Proton Mass - m_p
// Declarative constant using your exact confinement scale theory

import type { EnhancedConstantDefinition } from './utils/types';

export const PROTON_MASS: EnhancedConstantDefinition = {
  symbol: 'm_p',
  name: 'Proton Mass',
  description: 'Proton rest mass from QCD confinement: m_p = M_Pl × φ₀¹⁵',
  formula: 'M_PLANCK_GEV * PHI0^15 * 1000',  // Your exact formula, GeV → MeV
  latexFormula: 'm_p = M_{\\text{Pl}} \\cdot \\phi_0^{15}',
  variables: {
    M_PLANCK_GEV: 1.22091e19,  // Planck mass in GeV
    PHI0: 0.053171,            // Your φ₀ from cubic equation
  },
  unit: 'MeV',
  measured: 938.2720813,
  uncertainty: 0.0000058,
  source: 'CODATA 2018',
  category: 'QUARKS'
};