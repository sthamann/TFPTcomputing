// Gravitational Coupling - α_G
// Declarative constant using your exact dimensional reduction theory

import type { EnhancedConstantDefinition } from './utils/types';

export const GRAVITATIONAL_COUPLING: EnhancedConstantDefinition = {
  symbol: 'α_G',
  name: 'Gravitational Coupling',
  description: 'Gravitational fine structure constant: α_G = G m_p² / (ħc)',
  formula: 'G_NEWTON * M_PROTON^2 / (HBAR * C_LIGHT)',  // Standard definition
  latexFormula: '\\alpha_G = \\frac{G m_p^2}{\\hbar c}',
  variables: {
    G_NEWTON: 6.67430e-11,    // Gravitational constant in m³/kg/s²
    M_PROTON: 1.67262192e-27, // Proton mass in kg
    HBAR: 1.054571817e-34,    // Reduced Planck constant in J·s
    C_LIGHT: 299792458,       // Speed of light in m/s
  },
  unit: 'dimensionless',
  measured: 5.9e-39,  // Extremely small coupling
  uncertainty: 1e-40,
  source: 'CODATA 2018',
  category: 'FUNDAMENTAL'
};