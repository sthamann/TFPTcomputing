// Z Boson Mass - M_Z
// Declarative constant using your exact electroweak theory

import type { EnhancedConstantDefinition } from './utils/types';

export const Z_BOSON_MASS: EnhancedConstantDefinition = {
  symbol: 'M_Z',
  name: 'Z Boson Mass',
  description: 'Z boson mass from electroweak theory: M_Z = v_H / 2 · √(g₁²+g₂²)',
  formula: 'V_H * sqrt(G1_COUPLING^2 + G2_COUPLING^2) / 2',  // Your exact formula
  latexFormula: 'M_Z = \\frac{v_H}{2} \\sqrt{g_1^2 + g_2^2}',
  variables: {
    G1_COUPLING: 0.3583,  // U(1)_Y coupling constant at EW scale
    G2_COUPLING: 0.6536,  // SU(2)_L coupling constant at EW scale
    V_H: 246.21965,       // GeV - Higgs VEV
    sqrt: Math.sqrt,
  },
  unit: 'GeV',
  measured: 91.1876,
  uncertainty: 0.0021,
  source: 'PDG 2024',
  category: 'GAUGE_BOSONS'
};