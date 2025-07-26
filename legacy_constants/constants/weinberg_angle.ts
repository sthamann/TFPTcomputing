// Weinberg Angle - sin²θ_W
// Declarative constant using your exact topological theory

import type { EnhancedConstantDefinition } from './utils/types';

export const WEINBERG_ANGLE: EnhancedConstantDefinition = {
  symbol: 'sin²θ_W',
  name: 'Weinberg Angle',
  description: 'Electroweak mixing angle from topology: sin²θ_W = √φ₀',
  formula: 'sqrt(PHI0)',  // Your exact formula from 6D gravitational mixing
  latexFormula: '\\sin^2\\theta_W = \\sqrt{\\phi_0}',
  variables: {
    PHI0: 0.053171,   // Your φ₀ from cubic equation
    sqrt: Math.sqrt,
  },
  unit: 'dimensionless',
  measured: 0.23126,
  uncertainty: 0.00005,
  source: 'PDG 2024 (at M_Z)',
  category: 'ELECTROWEAK'
};