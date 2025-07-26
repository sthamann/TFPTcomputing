// Muon Lifetime - τ_μ
// Declarative constant using your exact weak decay theory

import type { EnhancedConstantDefinition } from './utils/types';
import { G_F, M_MUON } from './fundamentals';

const HBAR = 6.582119569e-25; // ħ in GeV·s
const M_MU = M_MUON / 1000; // Convert MeV to GeV
const VALUE = HBAR / ((Math.pow(G_F, 2) * Math.pow(M_MU, 5)) / (192 * Math.pow(Math.PI, 3))) * 1e6;

export const MUON_LIFETIME: EnhancedConstantDefinition = {
  symbol: 'τ_μ',
  name: 'Muon Lifetime',
  description: 'Muon decay lifetime from Fermi theory: τ_μ = ħ / (G_F² m_μ⁵ / 192π³)',
  formula: 'HBAR / ((G_F^2 * M_MU^5) / (192 * PI^3)) * 1e6',  // Convert to μs
  latexFormula: '\\tau_\\mu = \\frac{\\hbar}{\\frac{G_F^2 m_\\mu^5}{192\\pi^3}}',
  variables: {
    HBAR,      // ħ in GeV·s
    G_F,       // From fundamentals
    M_MU,      // From fundamentals, converted to GeV
    PI: Math.PI,
  },
  unit: 'μs',
  measured: 2.1969811,
  uncertainty: 2.2e-6,
  source: 'PDG 2024',
  category: 'LEPTONS',
  value: VALUE,
};

// Required exports for constants system
export const MUON_LIFETIME_CONSTANT = MUON_LIFETIME;

export function calculateMuonLifetime() {
  return VALUE;
}

export function getCalculationSteps() {
  return [
    "Use Fermi constant G_F = 1.166 × 10⁻⁵ GeV⁻²",
    "Use muon mass m_μ = 105.66 MeV = 0.106 GeV",
    "Apply V-A formula: Γ = G_F² m_μ⁵/(192π³)",
    "Calculate τ = ħ/Γ ≈ 2.20 μs",
    "Pure Standard Model - no adjustable parameters"
  ];
}