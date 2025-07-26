import { PHYSICS_CONSTANTS, DERIVED_CONSTANTS } from './physics/constants';

// Experimental values for comparison
const EXPERIMENTAL_VALUES = {
  alpha: { value: 7.2973525693e-3, error: 1.1e-12 },
  alphaInv: { value: 137.035999139, error: 3.1e-9 },
  mp: { value: 938.272088, error: 0.000017 }, // MeV
  alphaG: { value: 5.906e-39, error: 0.003e-39 },
  vusOverVud: { value: 0.2307, error: 0.0005 },
  alphaPeV: { value: 0.006, error: 0.001 },
  alphaC3: { value: 0.0398, error: 0.0001 },
  Tnu: { value: 1.945, error: 0.001 },
  tensorScalarRatio: { value: 0.06, error: 0.02 },
  weinbergAngle: { value: 0.23121, error: 0.00004 },
  alphaS_MZ: { value: 0.1179, error: 0.0010 },
  alphaS_PeV: { value: 0.006, error: 0.001 },
  msOverMd: { value: 20.2, error: 1.5 },
  muQuarkMass: { value: 2.2, error: 0.5 }, // MeV
  baryonDensity: { value: 0.04897, error: 0.00020 },
  axionMass: { value: 10, error: 5 }, // μeV
  protonLifetime: { value: 1.67e34, error: 0.13e34 }, // years
  electronMass: { value: 0.5109989461, error: 0.0000000031 }, // MeV
  ckmRatioCorrected: { value: 0.2307, error: 0.0005 },
  // New constants from task list
  muonMass: { value: 105.6583745, error: 0.0000024 }, // MeV
  tauLifetime: { value: 290.3, error: 0.5 }, // fs
  lightNeutrinoMass: { value: 0.024, error: 0.012 }, // eV
  runningLambda: { value: 0.013, error: 0.005 }, // at M_Pl
  sin2ThetaW_10TeV: { value: 0.231, error: 0.001 }, // at 10 TeV
  etaRatio: { value: 6.12e-10, error: 0.04e-10 } // baryon-to-photon ratio
};

export interface PhysicsOutput {
  // Core parameters
  phi0: number;            // VEV scale parameter
  c3: number;              // Topological fixed point
  
  // Primary observables
  mp: number;              // Proton mass (GeV)
  alphaG: number;          // Gravitational coupling
  vusOverVud: number;      // CKM ratio
  alphaPeV: number;        // PeV scale alpha
  alphaC3: number;         // Topological alpha
  Tnu: number;             // Neutrino temperature (K)
  alpha: number;           // Fine structure constant
  alphaInv: number;        // Inverse fine structure
  tensorScalarRatio: number; // r parameter
  selfConsistent: boolean; // Whether parameters are self-consistent
  deviation: { [key: string]: number }; // Deviations from measured values
  
  // Additional observables from the comprehensive list
  weinbergAngle: number;   // sin²θ_W
  alphaS_MZ: number;       // Strong coupling at M_Z
  alphaS_PeV: number;      // Strong coupling at PeV scale
  msOverMd: number;        // Strange/down mass ratio
  muQuarkMass: number;     // Up quark mass (MeV)
  baryonDensity: number;   // Ω_b
  axionMass: number;       // Axion mass (μeV)
  protonLifetime: number;  // Proton lifetime (years)
  electronMass: number;    // Electron mass (MeV)
  ckmRatioCorrected: number; // V_us/V_ud with RG and E8 corrections
  
  // New constants from task list
  muonMass: number;        // Muon mass (MeV)
  tauLifetime: number;     // Tau lifetime (fs)
  lightNeutrinoMass: number; // Light neutrino mass (eV)
  runningLambda: number;   // Running λ(M_Pl)
  sin2ThetaW_10TeV: number; // sin²θ_W at 10 TeV
  etaRatio: number;        // Baryon-to-photon ratio
}

export class PhysicsCalculator {
  private c3: number;
  private phi0: number;
  private Mpl: number;

  constructor(c3?: number, phi0?: number) {
    this.c3 = c3 ?? PHYSICS_CONSTANTS.c3;
    this.phi0 = phi0 ?? PHYSICS_CONSTANTS.phi0;
    this.Mpl = PHYSICS_CONSTANTS.M_Pl;
  }

  // Calculate all derived quantities
  calculate(): PhysicsOutput {
    // Use derived constants from the new physics constants file
    const alpha = DERIVED_CONSTANTS.alpha_calc;
    const alphaInv = 1 / alpha;
    
    // Primary calculations from the specification
    const mp = this.Mpl * Math.pow(this.phi0, 15) / 1e9; // Convert to MeV
    const alphaG = Math.pow(this.phi0, 30);
    
    // Updated Cabibbo angle with RG corrections (Task 2)
    const vusOverVud = DERIVED_CONSTANTS.sin_theta_C;
    const ckmRatioCorrected = vusOverVud; // Same calculation with corrections
    
    // Calculate from theory instead of static values
    const alphaPeV = Math.sqrt(this.phi0) / 2; // α_s from topological theory
    const alphaC3 = this.c3;
    const Tnu = Math.pow(4/11, 1/3) * 2.725; // T_ν = (4/11)^(1/3) × T_CMB from theory
    const tensorScalarRatio = Math.pow(this.phi0, 8); // r parameter from 8-step cascade
    
    // Updated electron mass calculation (Task 1)
    const electronMass = DERIVED_CONSTANTS.m_e_theory;
    
    // New constants from task list (Task 6)
    const muonMass = DERIVED_CONSTANTS.m_mu_theory;
    const tauLifetime = DERIVED_CONSTANTS.tau_tau_theory;
    const lightNeutrinoMass = DERIVED_CONSTANTS.m_nu_theory;
    const runningLambda = Math.pow(this.phi0, 12) * 0.5; // Running λ(M_Pl) from theory
    
    // Weinberg angle evolution to 10 TeV
    const sin2ThetaW_10TeV = Math.sqrt(this.phi0); // Should match √φ₀ within 1%
    const weinbergAngle = PHYSICS_CONSTANTS.sin2_theta_W;
    
    // Strong coupling values
    const alphaS_MZ = PHYSICS_CONSTANTS.alpha_s_MZ;
    const alphaS_PeV = Math.sqrt(this.phi0) / 2; // Strong coupling at PeV scale from theory
    
    // Quark sector
    const msOverMd = PHYSICS_CONSTANTS.m_s / PHYSICS_CONSTANTS.m_d;
    const muQuarkMass = PHYSICS_CONSTANTS.m_u * 1000; // Convert to MeV
    
    // Updated baryon density (Task 4)
    const baryonDensity = DERIVED_CONSTANTS.Omega_b_theory;
    
    // Axion and proton lifetime from theory
    const axionMass = this.Mpl * Math.pow(this.phi0, 24) * 1e12; // μeV from 24-step cascade
    const protonLifetime = 1 / (Math.pow(this.phi0, 20) * this.Mpl * 1e-25); // years from theory
    
    // Baryon-to-photon ratio (Task 8)
    const etaRatio = DERIVED_CONSTANTS.eta_theory;
    
    // Self-consistency check
    const selfConsistent = this.checkSelfConsistency();
    
    // Calculate deviations
    const result = {
      phi0: this.phi0,
      c3: this.c3,
      mp,
      alphaG,
      vusOverVud,
      alphaPeV,
      alphaC3,
      Tnu,
      alpha,
      alphaInv,
      tensorScalarRatio,
      selfConsistent,
      weinbergAngle,
      alphaS_MZ,
      alphaS_PeV,
      msOverMd,
      muQuarkMass,
      baryonDensity,
      axionMass,
      protonLifetime,
      electronMass,
      ckmRatioCorrected,
      muonMass,
      tauLifetime,
      lightNeutrinoMass,
      runningLambda,
      sin2ThetaW_10TeV,
      etaRatio,
      deviation: {} as { [key: string]: number }
    };
    
    result.deviation = this.calculateDeviations(result);
    
    return result;
  }

  private calculateAlphaFromCubic(): number {
    // Use the derived constant calculation
    return DERIVED_CONSTANTS.alpha_calc;
  }

  private solveCubic(a: number, b: number, c: number, d: number): number {
    // Cubic equation solver (keeping original implementation)
    const f = c/a;
    const g = d/a;
    const h = b/a;
    
    const i = g/2;
    const j = (h**2)/9 - f/3;
    const k = (h**3)/27 - (h*f)/6 + g/2;
    
    const discriminant = k**2 - j**3;
    
    if (discriminant > 0) {
      const l = Math.sqrt(discriminant);
      const m = Math.cbrt(-k + l);
      const n = Math.cbrt(-k - l);
      return m + n - h/3;
    } else {
      const l = Math.sqrt(-discriminant);
      const m = Math.sqrt(j);
      const theta = Math.atan2(l, -k);
      const root1 = 2 * m * Math.cos(theta/3) - h/3;
      const root2 = 2 * m * Math.cos((theta + 2*Math.PI)/3) - h/3;
      const root3 = 2 * m * Math.cos((theta + 4*Math.PI)/3) - h/3;
      
      return Math.max(root1, root2, root3);
    }
  }

  private checkSelfConsistency(): boolean {
    // Check if parameters are topologically consistent
    const tolerance = 0.01;
    const expectedC3 = 1/(8*Math.PI);
    const expectedPhi0Range = [0.05, 0.06];
    
    return Math.abs(this.c3 - expectedC3) < tolerance && 
           this.phi0 >= expectedPhi0Range[0] && 
           this.phi0 <= expectedPhi0Range[1];
  }

  private calculateDeviation(calculated: number, experimental: { value: number; error: number }): number {
    return Math.abs(calculated - experimental.value) / experimental.error;
  }

  private calculateSigma(calculated: number, experimental: { value: number; error: number }): number {
    return (calculated - experimental.value) / experimental.error;
  }

  private calculateDeviations(calculated: any): { [key: string]: number } {
    const deviations: { [key: string]: number } = {};
    
    // Map calculated values to experimental comparisons
    const comparisons = [
      { key: 'alpha', calc: calculated.alpha, exp: EXPERIMENTAL_VALUES.alpha },
      { key: 'alphaInv', calc: calculated.alphaInv, exp: EXPERIMENTAL_VALUES.alphaInv },
      { key: 'mp', calc: calculated.mp, exp: EXPERIMENTAL_VALUES.mp },
      { key: 'vusOverVud', calc: calculated.vusOverVud, exp: EXPERIMENTAL_VALUES.vusOverVud },
      { key: 'electronMass', calc: calculated.electronMass, exp: EXPERIMENTAL_VALUES.electronMass },
      { key: 'muonMass', calc: calculated.muonMass, exp: EXPERIMENTAL_VALUES.muonMass },
      { key: 'tauLifetime', calc: calculated.tauLifetime, exp: EXPERIMENTAL_VALUES.tauLifetime },
      { key: 'baryonDensity', calc: calculated.baryonDensity, exp: EXPERIMENTAL_VALUES.baryonDensity },
      { key: 'etaRatio', calc: calculated.etaRatio, exp: EXPERIMENTAL_VALUES.etaRatio }
    ];
    
    for (const comp of comparisons) {
      deviations[comp.key] = this.calculateSigma(comp.calc, comp.exp);
    }
    
    return deviations;
  }

  static calculateGamma(n: number): number {
    if (n === 0) return 1;
    if (n === 1) return 1;
    if (n < 0) return NaN;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  static calculateVEVScale(n: number, r0: number = 1, phi0?: number): number {
    const actualPhi0 = phi0 ?? PHYSICS_CONSTANTS.phi0;
    return r0 * Math.pow(actualPhi0, n);
  }

  updateParameters(phi0?: number, c3?: number): PhysicsOutput {
    if (phi0 !== undefined) this.phi0 = phi0;
    if (c3 !== undefined) this.c3 = c3;
    return this.calculate();
  }
}

export const physicsCalculator = new PhysicsCalculator();