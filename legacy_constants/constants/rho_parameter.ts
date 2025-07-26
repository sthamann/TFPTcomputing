// ρ Parameter 
// Declarative constant using your exact electroweak theory

import type { EnhancedConstantDefinition } from './utils/types';

export const RHO_PARAMETER: EnhancedConstantDefinition = {
  symbol: 'ρ',
  name: 'ρ Parameter',
  description: 'Electroweak precision parameter: ρ = M_W² / (M_Z² cos²θ_W)',
  formula: '(M_W^2) / (M_Z^2 * (1 - sqrt(PHI0)))',  // Using sin²θ_W = √φ₀
  latexFormula: '\\rho = \\frac{M_W^2}{M_Z^2 \\cos^2\\theta_W}',
  variables: {
    M_W: 80.377,      // W boson mass in GeV
    M_Z: 91.1876,     // Z boson mass in GeV
    PHI0: 0.053171,   // Your φ₀ from cubic equation (sin²θ_W = √φ₀)
    sqrt: Math.sqrt,
  },
  unit: 'dimensionless',
  measured: 1.00037,
  uncertainty: 0.00023,
  source: 'PDG 2024',
  category: 'ELECTROWEAK'
};