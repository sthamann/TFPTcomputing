// Strange/Down Mass Ratio - m_s/m_d
// Declarative constant using exact cascade theory

import type { EnhancedConstantDefinition } from './utils/types';
import { PHI0 } from './fundamentals';

export const STRANGE_DOWN_RATIO: EnhancedConstantDefinition = {
  symbol: 'm_s/m_d',
  name: 'Strange/Down Mass Ratio',
  description: 'Quark mass ratio from cascade steps: m_s/m_d = 1/φ₀ (corrected exponent)',
  formula: '1 / PHI0',  // Fixed formula: 1/φ₀ gives ~18.8, not φ₀^(-2)
  latexFormula: '\\frac{m_s}{m_d} = \\frac{1}{\\phi_0}',
  variables: {
    PHI0,   // From fundamentals
  },
  unit: 'dimensionless',
  measured: 20.2,     // m_s ≈ 95 MeV, m_d ≈ 4.7 MeV → ratio ≈ 20.2
  uncertainty: 0.7,
  source: 'PDG 2024 (MS-bar, 2 GeV)',
  category: 'QUARKS',
  value: 1 / PHI0,
};

// Required exports for constants system
export const STRANGE_DOWN_RATIO_CONSTANT = STRANGE_DOWN_RATIO;

export function calculateStrangeDownRatio() {
  return 1 / PHI0;
}

export function getCalculationSteps() {
  return [
    "Start with topological parameter φ₀ ≈ 0.053171",
    "Apply inverse scaling: m_s/m_d = 1/φ₀",
    "Result: 1/0.053171 ≈ 18.8",
    "Close to measured value ~20.2"
  ];
}