// File modification dates for constants - manually maintained
// Format: YYYY-MM-DD based on last significant edit to calculation logic

export const CONSTANT_FILE_DATES: Record<string, string> = {
  // Core constants - initial implementation
  'α': '2025-07-08',
  'mₑ': '2025-07-08', 
  'mμ': '2025-07-08',
  'mτ': '2025-07-08',
  'mₚ': '2025-07-08',
  'mᶜ': '2025-07-08',
  'mᵇ': '2025-07-08',
  'mᵤ': '2025-07-09',
  'mᵈ': '2025-07-08',
  'mₛ': '2025-07-08',
  
  // Gauge bosons - initial batch
  'Mᵂ': '2025-07-08',
  'Mᶻ': '2025-07-08',
  'v': '2025-07-08',
  'Gₓ': '2025-07-08',
  'ρ': '2025-07-08',
  
  // Lifetimes - second wave
  'τμ': '2025-07-09',
  'ττ': '2025-07-09',
  'τₙ': '2025-07-10',
  
  // QCD - major revision
  'ΛQCD': '2025-07-11',
  'mₚ/mₑ': '2025-07-08',
  'αₛ': '2025-07-12',
  
  // Mixing angles and CKM - latest additions
  'sin²θᵂ': '2025-07-15',
  'θᶜ': '2025-07-16',
  'Vuₛ/Vuᵈ': '2025-07-17',
  'Vcᵇ': '2025-07-17',
  'Vtᵈ/Vtₛ': '2025-07-17',
  'εₖ': '2025-07-18',
  
  // Neutrinos - recent work
  'Σmᵥ': '2025-07-14',
  'θ₁₂': '2025-07-19',
  'θ₁₃': '2025-07-19',
  'θ₂₃': '2025-07-19',
  
  // Cosmology - newest implementations
  'T₀': '2025-07-13',
  'Ωᵇh²': '2025-07-14',
  'Ωᶜh²': '2025-07-20',
  'r': '2025-07-21',
  'η': '2025-07-21',
  
  // Anomalous magnetic moments - very recent
  'Δaμ': '2025-07-22',
  'gₚ': '2025-07-22',
  'fπ/ΛQCD': '2025-07-22',
  'Δmₙₚ': '2025-07-23'
};

export function getConstantLastUpdate(symbol: string): string {
  // Use the symbol directly as key (since we map by symbol now)
  return CONSTANT_FILE_DATES[symbol] || '2025-07-08';
}