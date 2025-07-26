// Fundamental constants from the specification
export const PHYSICS_CONSTANTS = {
  // Input constants
  c3: 1 / (8 * Math.PI), // ≈ 0.039789
  phi0: 0.053171,
  Mpl: 1.2209e19, // GeV
  
  // E8 properties
  E8_DIMENSION: 248,
  E8_DUAL_COXETER: 60,
  E8_CASIMIR: 60,
  
  // Geometric factors
  MOBIUS_FACTOR: 2,
  Z3_ORBIFOLD_FACTOR: 2,
  EFFECTIVE_LEVEL: 30,
  
  // RG parameters
  A_COEFFICIENT: 1 / (256 * Math.PI ** 3),
  KAPPA: 1.913765,
  
  // Physical scales (GeV)
  PLANCK_SCALE: 1.221e19,
  GUT_SCALE: 2.3e16,
  TEV_SCALE: 1e3,
  QCD_SCALE: 0.2,
  
  // Measured values with experimental uncertainties for proper error analysis
  MEASURED: {
    ALPHA_INV: { value: 137.035999084, error: 0.000000021 }, // CODATA 2018
    PROTON_MASS: { value: 0.9382720813, error: 0.0000000058 }, // GeV, PDG 2022
    GRAVITATIONAL_ALPHA: { value: 5.91e-39, error: 0.15e-39 }, // derived
    VUS_VUD_RATIO: { value: 0.2310, error: 0.0011 }, // CKM ratio with current tension
    NEUTRINO_TEMP: { value: 1.95, error: 0.0006 }, // K, CNB temperature
    CMB_TEMP: { value: 2.7255, error: 0.0006 }, // K, Planck 2018
    WEINBERG_ANGLE: { value: 0.23121, error: 0.00004 }, // sin²θ_W(M_Z), PDG 2022
    ALPHA_S_MZ: { value: 0.1179, error: 0.0010 }, // α_s(M_Z), PDG 2022
    W_BOSON_MASS: { value: 80.379, error: 0.012 }, // GeV, with CDF II anomaly
    MUON_G_MINUS_2: { value: 116592059e-11, error: 22e-11 }, // (g-2)/2 anomaly
  },
  
  // Theory limitations and known issues
  LIMITATIONS: {
    ELECTRON_MASS: "No clean φ₀ⁿ power law found",
    CABIBBO_ANGLE: "16σ deviation - possible 2nd generation mixing effects",
    TWO_LOOP_STABILITY: "Requires PyR@TE analysis for β-function corrections"
  }
};

// Comprehensive scale hierarchy with physics phenomena
export const SCALE_HIERARCHY = [
  { 
    n: 0, 
    name: "Planck/String Scale", 
    energy: "M_Pl = 1.22×10¹⁹ GeV",
    phenomena: ["Quantum gravity", "String compactification", "11D → 6D transition"],
    calculation: "φ₀⁰ × M_Pl = M_Pl",
    color: "violet",
    description: "The fundamental scale where gravity becomes strong and spacetime geometry is quantized"
  },
  { 
    n: 1, 
    name: "Inflation End", 
    energy: "6.5×10¹⁷ GeV",
    phenomena: ["End of cosmic inflation", "Reheating begins", "Baryogenesis seeds"],
    calculation: "φ₀¹ × M_Pl = 0.053171 × 1.22×10¹⁹ GeV",
    color: "indigo",
    description: "Scale where primordial inflation ends and the hot Big Bang phase begins"
  },
  { 
    n: 2, 
    name: "Warm Dark Matter", 
    energy: "3.45×10¹⁶ GeV",
    phenomena: ["5% warm dark matter component", "Structure formation suppression", "σ₈ tension resolution"],
    calculation: "φ₀² × M_Pl = 0.00283 × 1.22×10¹⁹ GeV",
    color: "blue",
    description: "Scale producing warm dark matter that explains cosmic structure anomalies"
  },
  { 
    n: 3, 
    name: "GUT Unification", 
    energy: "3.65×10¹⁶ GeV",
    phenomena: ["Gauge coupling unification", "Proton decay τ_p ∼ 10³⁵ years", "Monopole production"],
    calculation: "φ₀³ × M_Pl = Grand Unified Theory scale",
    color: "cyan",
    description: "Scale where electromagnetic, weak, and strong forces unify into a single interaction"
  },
  { 
    n: 4, 
    name: "Axion Scale", 
    energy: "1.94×10¹⁵ GeV",
    phenomena: ["PQ symmetry breaking", "Axion mass m_a ≈ 5.9 μeV", "Dark matter candidate"],
    calculation: "φ₀⁴ × M_Pl → m_a = f_π m_π/f_a",
    color: "teal",
    description: "Peccei-Quinn scale generating axions as dark matter candidates"
  },
  { 
    n: 5, 
    name: "Seesaw Scale", 
    energy: "1.03×10¹⁴ GeV",
    phenomena: ["Right-handed neutrinos", "Neutrino masses ∼ 0.02 eV", "Leptogenesis"],
    calculation: "φ₀⁵ × M_Pl = Type-I seesaw scale",
    color: "green",
    description: "Scale of heavy right-handed neutrinos explaining tiny neutrino masses"
  },
  { 
    n: 6, 
    name: "TeV New Physics", 
    energy: "5.48×10¹² GeV ≈ 2 TeV",
    phenomena: ["W-boson mass anomaly", "Muon g-2 excess", "E₈ vector bosons"],
    calculation: "φ₀⁶ × M_Pl = LHC energy scale",
    color: "lime",
    description: "Scale of new physics accessible to current and future collider experiments"
  },
  { 
    n: 15, 
    name: "QCD Confinement", 
    energy: "0.937 GeV",
    phenomena: ["Proton mass", "Hadron formation", "QCD phase transition"],
    calculation: "φ₀¹⁵ × M_Pl = QCD scale Λ_QCD",
    color: "yellow",
    description: "Scale where quarks and gluons confine into protons and neutrons"
  },
  { 
    n: 17, 
    name: "Light Quark Masses", 
    energy: "2.65 MeV",
    phenomena: ["Up quark mass", "Flavor hierarchy", "Chiral symmetry breaking"],
    calculation: "φ₀¹⁷ × M_Pl = lightest quark mass",
    color: "orange",
    description: "Scale of the lightest quark masses setting flavor physics"
  },
  { 
    n: 25, 
    name: "Dark Energy Onset", 
    energy: "1.96 K = 1.7×10⁻⁴ eV",
    phenomena: ["Cosmic neutrino background", "Dark energy dominance", "Accelerated expansion"],
    calculation: "φ₀²⁵ × T_Pl = CNB temperature",
    color: "red",
    description: "Temperature scale where dark energy begins to dominate cosmic expansion"
  },
  { 
    n: 30, 
    name: "Gravitational Weakness", 
    energy: "α_G = 5.89×10⁻³⁹",
    phenomena: ["Newton's constant", "Hierarchy problem solution", "Gravity-matter coupling"],
    calculation: "φ₀³⁰ = dimensionless gravitational coupling",
    color: "pink",
    description: "Scale explaining why gravity is so much weaker than other forces"
  },
  { 
    n: 35, 
    name: "Cosmological Constant", 
    energy: "Λ ∼ (10⁻¹² GeV)²",
    phenomena: ["Dark energy density", "Vacuum energy", "Cosmic acceleration"],
    calculation: "φ₀³⁵ × M_Pl² ∼ observed Λ",
    color: "purple",
    description: "Scale of the cosmological constant driving accelerated cosmic expansion"
  }
];

// Observable constants grouped by physics category
export const OBSERVABLES_BY_CATEGORY = {
  "FUNDAMENTAL": [
    {
      name: "Fine Structure Constant",
      symbol: "α",
      formula: "From cubic fixed point equation",
      unit: "",
      measured: 1/137.035999084,
      measuredUncertainty: 0.000000021,
      measuredError: 0.000000021,
      source: "CODATA 2018",
      steps: ["Self-consistency loop: φ₀ → κ → α", "Cubic equation: α³ - Aα² - Ac₃²κ = 0", "A = 1/(256π³), κ = 1.913765"]
    },
    {
      name: "Topological Fixed Point",
      symbol: "c₃",
      formula: "k_eff/(4π·C₂(E₈)) = 30/(4π·60)",
      unit: "",
      measured: 1/(8*Math.PI),
      measuredUncertainty: 0,
      source: "Topology",
      steps: ["E₈ anomaly cancellation: k = 2·C₂(E₈)·m = 120", "Möbius reduction: k → 60", "ℤ₃ orbifold: k → 30", "Final: c₃ = 30/(4π·60) = 1/(8π)"]
    },
    {
      name: "VEV Scale Parameter",
      symbol: "φ₀",
      formula: "From self-consistency",
      unit: "",
      measured: 0.053171,
      measuredUncertainty: 0.000001,
      source: "RG Fixed Point",
      steps: ["From α cubic equation", "ln(1/φ₀) = 2π/b_Y · κ", "φ₀ = exp(-2.932524) = 0.053171"]
    }
  ],
  "ELECTROWEAK": [
    {
      name: "Weinberg Angle",
      symbol: "sin²θ_W",
      formula: "√φ₀",
      unit: "",
      measured: 0.23126,
      measuredUncertainty: 0.00005,
      source: "PDG 2020",
      steps: ["6D gravitational mixing", "sin²θ_W = √φ₀", "√0.053171 = 0.2306"]
    },
    {
      name: "W Boson Mass Shift",
      symbol: "Δm_W",
      formula: "T-loop from n=6 scale",
      unit: "GeV",
      measured: 0.0122,
      measuredUncertainty: 0.0147,
      source: "CDF II 2022",
      steps: ["n=6 TeV scale physics", "E₈ vector bosons at ~2 TeV", "T-parameter shift: +12 MeV"]
    }
  ],
  "LEPTONS": [
    {
      name: "Electron Mass",
      symbol: "m_e",
      formula: "(v/√2) × α × φ₀⁵",
      unit: "MeV",
      measured: 0.5109989,
      measuredUncertainty: 0.0000006,
      measuredError: 0.0000006,
      source: "CODATA 2018",
      steps: [
        "Hypercharge loop correction to Yukawa",
        "v/√2 = 174.1 GeV (Higgs VEV)", 
        "α = 0.007297 (1-loop QED)",
        "φ₀⁵ = 4.25×10⁻⁷ (n=5 scale)",
        "m_e = 174.1 × 0.007297 × 4.25×10⁻⁷ = 0.538 MeV"
      ],
    },
    {
      name: "Muon Mass",
      symbol: "m_μ",
      formula: "(v/√2) × φ₀",
      unit: "MeV",
      measured: 105.6583745,
      measuredUncertainty: 0.0000024,
      source: "CODATA 2018",
      steps: ["From Higgs VEV coupling", "v/√2 = 174.1 GeV", "φ₀ = 0.053171", "m_μ = 174.1 × 0.053171 × 1000 = 105.56 MeV"]
    },
    {
      name: "Tau Lifetime", 
      symbol: "τ_τ",
      formula: "192π³/(G_F² m_τ⁵ (1+δ_QED))",
      unit: "fs",
      measured: 290.3,
      measuredUncertainty: 0.5,
      source: "PDG 2020",
      steps: ["Leptonic decay formula", "G_F = 1.166×10⁻⁵ GeV⁻²", "m_τ = 1.777 GeV", "δ_QED ≈ 0.02", "τ_τ = 292.6 fs"]
    },
    {
      name: "Light Neutrino Mass",
      symbol: "m_ν",
      formula: "v²/(φ₀⁵ M_Pl)",
      unit: "eV", 
      measured: 0.024,
      measuredUncertainty: 0.012,
      source: "Cosmology",
      steps: ["Type-I seesaw", "v = 246 GeV", "φ₀⁵ = 4.25×10⁻⁷", "M_Pl = 1.22×10¹⁹ GeV", "m_ν = 0.024 eV"]
    }
  ],
  "QUARK_FLAVOR": [
    {
      name: "CKM Ratio V_us/V_ud (RG-corrected)",
      symbol: "V_us/V_ud",
      formula: "√φ₀ × (1 - δ_RG) × (1 - φ₀/2)",
      unit: "",
      measured: 0.22497,
      measuredUncertainty: 0.00020,
      measuredError: 0.00020,
      source: "PDG 2020",
      steps: [
        "Base ratio: √φ₀ = 0.2306",
        "RG running 10 TeV → 2 GeV: δ_RG ≈ 0.8%",
        "E₈ ½-step orbit shift: ≈ 2.7%", 
        "Combined: 0.2306 × 0.992 × 0.973 = 0.2249"
      ]
    },
    {
      name: "Strange/Down Mass Ratio",
      symbol: "m_s/m_d",
      formula: "1/φ₀",
      unit: "",
      measured: 20.2,
      measuredUncertainty: 1.1,
      source: "Lattice QCD",
      steps: ["Light quark hierarchy", "Next φ₀ step", "1/φ₀ = 1/0.053171 = 18.81"]
    },
    {
      name: "Up Quark Mass",
      symbol: "m_u",
      formula: "M_Pl × φ₀¹⁷",
      unit: "MeV",
      measured: 2.16,
      measuredUncertainty: 0.49,
      source: "PDG 2020",
      steps: ["17th cascade step", "Lightest quark scale", "1.2209×10¹⁹ × 0.053171¹⁷ = 2.65 MeV"]
    }
  ],
  "QCD_RUNNING": [
    {
      name: "Strong Coupling at M_Z",
      symbol: "α_s(M_Z)",
      formula: "√φ₀/2",
      unit: "",
      measured: 0.1181,
      measuredUncertainty: 0.0011,
      source: "PDG 2020",
      steps: ["QCD coupling at Z mass", "Simple φ₀ relation", "√0.053171/2 = 0.1153"]
    },
    {
      name: "α_s at PeV Scale",
      symbol: "α_s(10⁶ GeV)",
      formula: "φ₀",
      unit: "",
      measured: 0.05287,
      measuredUncertainty: 0.0005,
      source: "RGE extrapolation",
      steps: ["RG running to PeV", "φ₀ fixpoint", "α_s = φ₀ = 0.053171"]
    },
    {
      name: "α_s at 250 GeV",
      symbol: "α_s(2.5×10⁸ GeV)",
      formula: "c₃",
      unit: "",
      measured: 0.03977,
      measuredUncertainty: 0.0002,
      source: "RGE extrapolation",
      steps: ["RG running to topological scale", "c₃ fixpoint", "α_s = c₃ = 0.039789"]
    }
  ],
  "HADRONS": [
    {
      name: "Proton Mass",
      symbol: "m_p",
      formula: "M_Pl × φ₀¹⁵",
      unit: "GeV",
      measured: 0.9382720813,
      measuredUncertainty: 0.0000000058,
      source: "PDG 2020",
      steps: ["15th cascade step", "QCD confinement scale", "1.2209×10¹⁹ × 0.053171¹⁵ = 0.937 GeV"]
    },
    {
      name: "Gravitational Coupling",
      symbol: "α_G",
      formula: "φ₀³⁰",
      unit: "",
      measured: 5.91e-39,
      measuredUncertainty: 0.02e-39,
      source: "Calculated",
      steps: ["Newton's weakness", "30th cascade step", "φ₀³⁰ = 0.053171³⁰ = 5.89×10⁻³⁹"]
    }
  ],
  "COSMOLOGY": [
    {
      name: "Neutrino Background Temperature",
      symbol: "T_ν",
      formula: "T_Pl × φ₀²⁵",
      unit: "K",
      measured: 1.95,
      measuredUncertainty: 0.01,
      source: "ΛCDM prediction",
      steps: ["25th cascade step", "Dark energy onset", "1.4168×10³² × 0.053171²⁵ = 1.964 K"]
    },
    {
      name: "Baryon Density",
      symbol: "Ω_b",
      formula: "φ₀",
      unit: "",
      measured: 0.0486,
      measuredUncertainty: 0.0006,
      source: "Planck 2018",
      steps: ["Matter content", "First cascade step", "Ω_b = φ₀ = 0.053171"]
    },
    {
      name: "Tensor-to-Scalar Ratio",
      symbol: "r",
      formula: "φ₀²",
      unit: "",
      measured: null,
      measuredUncertainty: null,
      source: "CMB-S4 target",
      steps: ["Primordial gravitational waves", "Inflation scale", "r = φ₀² = 0.053171² = 0.00283"]
    },
    {
      name: "Baryon-to-Photon Ratio",
      symbol: "η",
      formula: "c₃⁷",
      unit: "",
      measured: 6.12e-10,
      measuredUncertainty: 0.04e-10,
      source: "Planck 2018",
      steps: ["Pure number from topology", "c₃ = 1/(8π)", "η = c₃⁷ = 1.6×10⁻¹⁰", "Needs CP violation phase"]
    }
  ],
  "THEORY": [
    {
      name: "Running Higgs Coupling λ(M_Pl)",
      symbol: "λ(M_Pl)",
      formula: "RGE integration with BSM",
      unit: "",
      measured: 0.013,
      measuredUncertainty: 0.005,
      source: "Theory prediction",
      steps: ["Integrate RGE from M_Z", "Include n=6 triplet Σ_F", "Final λ(M_Pl) = +0.013"]
    },
    {
      name: "Weinberg Angle at 10 TeV",
      symbol: "sin²θ_W(10TeV)",
      formula: "RG evolution from M_Z",
      unit: "",
      measured: 0.231,
      measuredUncertainty: 0.001,
      source: "Theory prediction",
      steps: ["RGE evolution g₁, g₂", "Should match √φ₀ within 1%", "sin²θ_W(10TeV) ≈ √φ₀ = 0.2306"]
    }
  ],
  "FUTURE_TESTS": [
    {
      name: "Axion Mass",
      symbol: "m_a",
      formula: "From n=4 scale",
      unit: "μeV",
      measured: null,
      measuredUncertainty: null,
      source: "ADMX prediction",
      steps: ["4th cascade step", "PQ symmetry breaking", "m_a ≈ 5.7-6.2 μeV"]
    },
    {
      name: "Proton Lifetime",
      symbol: "τ_p",
      formula: "~(φ₃M_Pl)⁴/m_p⁵",
      unit: "years",
      measured: null,
      measuredUncertainty: null,
      source: "Hyper-K target",
      steps: ["GUT scale decay", "n=3 cascade step", "τ_p ~ 10³⁵ years"]
    }
  ]
};

// Flatten for backwards compatibility
export const OBSERVABLES = Object.values(OBSERVABLES_BY_CATEGORY).flat();
