// Fermi Constant - G_F  
// Declarative constant using your exact weak coupling theory

import type { EnhancedConstantDefinition } from './utils/types';

export const FERMI_CONSTANT: EnhancedConstantDefinition = {
  symbol: 'G_F',
  name: 'Fermi Constant',
  description: 'Fermi constant from weak coupling: G_F = 1 / (√2 · v_H²)',
  formula: '1 / (sqrt(2) * V_H^2)',  // Your exact formula
  latexFormula: 'G_F = \\frac{1}{\\sqrt{2} v_H^2}',
  variables: {
    V_H: 246.21965,   // GeV - Higgs VEV
    sqrt: Math.sqrt,
  },
  unit: 'GeV^-2',
  measured: 1.1663787e-5,
  uncertainty: 6e-12,
  source: 'PDG 2024',
  category: 'WEAK_FORCE'
};