// Physics Constants - Single Source of Truth
// All values in SI units unless otherwise specified

export const PHYSICS_CONSTANTS = {
  // Fundamental constants
  c: 299792458,                    // m/s - speed of light
  hbar: 1.054571817e-34,          // J⋅s - reduced Planck constant
  e: 1.602176634e-19,             // C - elementary charge
  me: 9.1093837015e-31,           // kg - electron mass
  mp: 1.67262192369e-27,          // kg - proton mass
  
  // Standard Model parameters
  alpha_EM: 1/137.035999139,       // fine structure constant
  sin2_theta_W: 0.23121,          // weak mixing angle
  G_F: 1.1663787e-5,              // GeV^-2 - Fermi constant
  
  // Higgs and EW sector
  v_H: 246.22,                    // GeV - Higgs VEV
  m_W: 80.379,                    // GeV - W boson mass
  m_Z: 91.1876,                   // GeV - Z boson mass
  m_h: 125.25,                    // GeV - Higgs mass
  
  // Quark masses (GeV)
  m_u: 2.2e-3,                    // up quark
  m_d: 4.7e-3,                    // down quark
  m_s: 0.095,                     // strange quark
  m_c: 1.275,                     // charm quark
  m_b: 4.18,                      // bottom quark
  m_t: 173.0,                     // top quark
  
  // Lepton masses (GeV)
  m_e: 0.5109989461e-3,           // electron
  m_mu: 0.1056583745,             // muon
  m_tau: 1.77686,                 // tau
  
  // Neutrino sector
  Delta_m2_21: 7.53e-5,           // eV^2 - solar neutrino mass difference
  Delta_m2_32: 2.453e-3,          // eV^2 - atmospheric neutrino mass difference
  
  // CKM matrix elements
  V_ud: 0.97434,
  V_us: 0.22506,
  V_ub: 0.00357,
  V_cd: 0.22492,
  V_cs: 0.97351,
  V_cb: 0.0411,
  
  // Cosmological parameters
  Omega_b: 0.04897,               // baryon density
  Omega_c: 0.2640,                // cold dark matter density
  Omega_Lambda: 0.6870,           // dark energy density
  h_0: 0.6766,                    // Hubble parameter
  eta_b: 6.12e-10,                // baryon-to-photon ratio
  T_CMB: 2.7255,                  // K - CMB temperature
  
  // Strong coupling
  alpha_s_MZ: 0.1179,             // strong coupling at M_Z
  
  // Gravitational
  M_Pl: 1.220910e19,              // GeV - Planck mass
  G_N: 6.67430e-11,               // m^3 kg^-1 s^-2 - Newton's constant
  
  // Topological parameters (theory)
  c3: 1/(8*Math.PI),              // = 0.039788735... topological fixed point
  phi0: 0.053171,                 // VEV scale parameter
  
  // RG evolution parameters
  mu_high: 1e4,                   // GeV - high energy scale
  mu_low: 2.0,                    // GeV - low energy scale
  
  // BSM mass scales (from theory)
  M_Sigma: 1.1e3,                 // GeV - EW triplet mass
  M_N: 1.4e15,                    // GeV - right-handed neutrino mass
  M_Phi: 1.9e16,                  // GeV - PQ scalar mass
  
  // Gauge coupling beta function coefficients (2-loop SM)
  b1_SM: 41/10,                   // U(1)_Y (GUT normalized)
  b2_SM: -19/6,                   // SU(2)_L
  b3_SM: -7,                      // SU(3)_c
  
  // Hypercharge beta function coefficient
  b_Y: 41/10,                     // for κ calculation (Standard Model normalization)
  
  // Mathematical constants
  PI: Math.PI,
  E: Math.E,
  SQRT2: Math.sqrt(2),
  
  // Unit conversions
  GEV_TO_KG: 1.782662e-27,        // GeV to kg
  GEV_TO_EV: 1e9,                 // GeV to eV
  MEV_TO_GEV: 1e-3,               // MeV to GeV
  KEV_TO_GEV: 1e-6,               // keV to GeV
  EV_TO_GEV: 1e-9,                // eV to GeV
  
  // Time units
  SECONDS_PER_YEAR: 31557600,     // seconds in a year
  FS_TO_S: 1e-15,                 // femtoseconds to seconds
} as const;

// Derived constants
export const DERIVED_CONSTANTS = {
  // Calculate alpha from topology - correct formula α = φ₀²/(8π)
  get alpha_calc(): number {
    const { phi0, PI } = PHYSICS_CONSTANTS;
    return phi0**2 / (8 * PI);
  },
  
  // Electron mass from theory
  get m_e_theory(): number {
    const { v_H, alpha_EM, phi0 } = PHYSICS_CONSTANTS;
    return (v_H / Math.sqrt(2)) * alpha_EM * phi0**5 * 1000; // in MeV
  },
  
  // Corrected Cabibbo angle
  get sin_theta_C(): number {
    const { phi0, PI } = PHYSICS_CONSTANTS;
    const { mu_high, mu_low } = PHYSICS_CONSTANTS;
    
    // RG correction: δ_RG = (3g₂² + g₁² - 6y_t²)/(32π²) * ln(μ_high/μ_low)
    const g1 = 0.357;
    const g2 = 0.652;
    const y_t = 0.95;
    const delta_RG = (3*g2**2 + g1**2 - 6*y_t**2)/(32*PI**2) * Math.log(mu_high/mu_low);
    
    return Math.sqrt(phi0) * (1 + delta_RG) * (1 - phi0/2);
  },
  
  // Muon mass from theory
  get m_mu_theory(): number {
    const { v_H, phi0 } = PHYSICS_CONSTANTS;
    return (v_H / Math.sqrt(2)) * phi0 * 1000; // in MeV
  },
  
  // Tau lifetime from theory
  get tau_tau_theory(): number {
    const { PI, G_F, m_tau } = PHYSICS_CONSTANTS;
    const delta_QED = 0.02; // QED correction
    return (192 * PI**3) / (G_F**2 * (m_tau * 1000)**5 * (1 + delta_QED)) * 1e15; // in fs
  },
  
  // Light neutrino mass
  get m_nu_theory(): number {
    const { v_H, phi0, M_Pl } = PHYSICS_CONSTANTS;
    return (v_H**2) / (phi0**5 * M_Pl) * 1e9; // in eV
  },
  
  // Baryon density with entropy correction
  get Omega_b_theory(): number {
    const { phi0, eta_b } = PHYSICS_CONSTANTS;
    const Delta_s = Math.log(eta_b * 1e10 / 6.1);
    return phi0 * Math.exp(-Delta_s);
  },
  
  // Baryon-to-photon ratio from theory
  get eta_theory(): number {
    const { c3 } = PHYSICS_CONSTANTS;
    return c3**7;
  },
} as const;

export type PhysicsConstant = keyof typeof PHYSICS_CONSTANTS;
export type DerivedConstant = keyof typeof DERIVED_CONSTANTS;