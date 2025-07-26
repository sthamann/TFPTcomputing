// Proton/Electron Mass Ratio - m_p/m_e
// Direct ratio calculation using CODATA values

import type { EnhancedConstantDefinition } from './utils/types';
import { M_PROTON, M_ELECTRON } from './fundamentals';

const VALUE = (M_PROTON * 1e3) / M_ELECTRON; // Convert MeV to MeV for ratio

export const PROTON_ELECTRON_RATIO: EnhancedConstantDefinition = {
  symbol: 'm_p/m_e',
  name: 'Proton/Electron Mass Ratio',
  description: 'Direct mass ratio: m_p/m_e using CODATA values',
  formula: 'm_p / m_e',  // Direct ratio
  latexFormula: '\\frac{m_p}{m_e}',
  variables: {
    m_p: M_PROTON,    // 938.272 MeV
    m_e: M_ELECTRON,  // 0.511 MeV
  },
  unit: 'dimensionless',
  measured: 1836.15267343,
  uncertainty: 1.1e-7,
  source: 'CODATA 2018',
  category: 'FUNDAMENTAL',
  value: VALUE,
};

// Required exports for constants system
export const PROTON_ELECTRON_RATIO_CONSTANT = PROTON_ELECTRON_RATIO;

export function calculateProtonElectronRatio() {
  return VALUE;
}

export function getCalculationSteps() {
  return [
    "Use CODATA proton mass: m_p = 938.272 MeV",
    "Use CODATA electron mass: m_e = 0.511 MeV", 
    "Calculate ratio: m_p/m_e = 938.272/0.511",
    "Result: ≈ 1836.15"
  ];
}