// Cosmic Neutrino Background Temperature - T_ν0
// Single source of truth for CNB temperature calculations

import type { ConstantDefinition } from './alpha';

// Constants
const T_PLANCK_K = 1.4168e32; // Planck temperature in Kelvin

export function calculateCNBTemperature(phi0: number): number {
  // T_ν = T_Pl · φ₀²⁵ (25th cascade step = dark energy entry)
  return T_PLANCK_K * (phi0 ** 25);
}

export function getCalculationSteps(phi0: number, c3: number): string[] {
  const result = calculateCNBTemperature(phi0);
  
  return [
    '// Cosmic Neutrino Background temperature from cascade',
    `const T_Pl = ${T_PLANCK_K.toExponential(4)} K; // Planck temperature`,
    `phi0 = ${phi0.toFixed(8)}`,
    '',
    '// Theory: T_ν = T_Pl · φ₀²⁵',
    '// 25th cascade step marks dark energy entry point',
    '',
    '// Step 1: Calculate φ₀²⁵',
    `φ₀²⁵ = ${phi0.toFixed(8)}²⁵ = ${(phi0 ** 25).toExponential(6)}`,
    '',
    '// Step 2: Multiply by Planck temperature',
    `T_ν = ${T_PLANCK_K.toExponential(4)} × ${(phi0 ** 25).toExponential(6)}`,
    `T_ν = ${result.toFixed(3)} K`,
    '',
    '// ΛCDM prediction: 1.95 K',
    `// Theory accuracy: ${(((result - 1.95) / 1.95) * 100).toFixed(1)}%`
  ];
}

export const CNB_TEMPERATURE_CONSTANT: ConstantDefinition = {
  symbol: 'T_ν',
  name: 'CNB Temperature',
  description: 'Cosmic Neutrino Background temperature from 25th cascade step',
  formula: 'T_PLANCK_K * (PHI0^25)',
  variables: {
    T_PLANCK_K: 1.4168e32,
    PHI0: 0.053171,
  },
  unit: 'K',
  measured: 1.95,
  uncertainty: undefined,
  source: 'ΛCDM prediction',
  category: 'COSMOLOGY'
};