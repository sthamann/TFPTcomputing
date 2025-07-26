// W Boson Mass - M_W
// Declarative constant using your exact electroweak theory

import type { EnhancedConstantDefinition } from './utils/types';

export const W_BOSON_MASS: EnhancedConstantDefinition = {
  symbol: 'M_W',
  name: 'W Boson Mass',
  description: 'W boson mass from electroweak theory: M_W = g₂ · v_H / 2',
  formula: 'G2_COUPLING * V_H / 2',  // Your exact formula
  latexFormula: 'M_W = \\frac{g_2 v_H}{2}',
  variables: {
    G2_COUPLING: 0.6536,  // SU(2)_L coupling constant at EW scale
    V_H: 246.21965,       // GeV - Higgs VEV
  },
  unit: 'GeV',
  measured: 80.379,
  uncertainty: 0.012,
  source: 'PDG 2024',
  category: 'GAUGE_BOSONS'
};