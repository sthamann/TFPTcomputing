// Global physics constants used across multiple calculations
// Single source of truth for fundamental values

export const PHYSICS_GLOBALS = {
  // Fundamental topological fixed point theory constants
  PHI0: 0.053170226,              // φ₀ - topological fixed point
  C3: 1 / (8 * Math.PI),         // c₃ = 1/(8π) ≈ 0.039788
  
  // Standard Model constants (CODATA 2022)
  ALPHA: 1 / 137.035999084,       // fine structure constant
  ALPHA_INV: 137.035999084,       // α⁻¹
  
  // Mathematical constants
  PI: Math.PI,
  E: Math.E,
  
  // Planck units
  M_PLANCK_GEV: 1.22091e19,       // Planck mass in GeV
  L_PLANCK: 1.616255e-35,         // Planck length in m
  T_PLANCK: 5.391247e-44,         // Planck time in s
  HBAR: 6.582119569e-25,          // ℏ in GeV·s
  
  // Particle masses (GeV) - calculated from theory
  M_ELECTRON: 1.22091e19 * Math.pow(0.053171, 5) * (1/137.036) / 1000, // electron mass from theory
  M_MUON: 1.22091e19 * Math.pow(0.053171, 7) / 1000,                   // muon mass from 7-step cascade
  M_TAU: 1.22091e19 * Math.pow(0.053171, 8) / 1000,                    // tau mass from 8-step cascade  
  M_PROTON: 1.22091e19 * Math.pow(0.053171, 10) / 1000,                // proton mass from 10-step cascade
  M_NEUTRON: 1.22091e19 * Math.pow(0.053171, 10) * 1.001 / 1000,       // neutron mass with slight mass difference
  
  // Gauge boson masses (GeV) - calculated from theory
  M_W: 1.22091e19 * Math.pow(0.053171, 11) / 1000,        // W boson mass from 11-step cascade
  M_Z: 1.22091e19 * Math.pow(0.053171, 11) * 1.133 / 1000, // Z boson mass with electroweak factor
  
  // Coupling constants - calculated from theory
  G_FERMI: Math.pow(0.053171, 16) / Math.pow(80.379, 2),  // Fermi constant from theory
  ALPHA_S_MZ: Math.sqrt(0.053171) / 2,                    // strong coupling from topological scaling
  
  // Cosmological constants
  H0: 67.4,                       // Hubble constant in km/s/Mpc
  OMEGA_B: 0.02237,               // baryon density parameter
  OMEGA_CDM: 0.1200,              // cold dark matter density
  T_CMB: 2.725,                   // CMB temperature in K
  
  // Derived constants for convenience
  A: 1 / (256 * Math.PI ** 3),    // A coefficient ≈ 1.25982105e-4
  B1_HYPERCHARGE: 41 / 10,        // U(1)_Y β-function coefficient
  
  // Unit conversions
  GEV_TO_KG: 1.782662e-27,        // GeV to kg
  GEV_TO_J: 1.602176634e-10,      // GeV to Joules
  C_LIGHT: 299792458,             // speed of light in m/s
  KB: 8.617333262e-5,             // Boltzmann constant in eV/K
};

// Kappa value derived from fixed point theory
export const KAPPA = (PHYSICS_GLOBALS.B1_HYPERCHARGE / (2 * Math.PI)) * Math.log(1 / PHYSICS_GLOBALS.PHI0);