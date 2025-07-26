// Strong Coupling - α_s
// Declarative constant using your exact topological theory

import type { EnhancedConstantDefinition } from './utils/types';

export const STRONG_COUPLING: EnhancedConstantDefinition = {
  symbol: 'α_s',
  name: 'Strong Coupling Constant',
  description: 'Strong coupling at M_Z from topology: α_s(M_Z) = √φ₀ / 2',
  formula: 'sqrt(PHI0) / 2',  // Your exact topological scaling
  latexFormula: '\\alpha_s(M_Z) = \\frac{\\sqrt{\\phi_0}}{2}',
  variables: {
    PHI0: 0.053171,   // Your φ₀ from cubic equation
    sqrt: Math.sqrt,
  },
  unit: 'dimensionless',
  measured: 0.1181,
  uncertainty: 0.0011,
  source: 'PDG 2024 (at M_Z)',
  category: 'QCD'
};