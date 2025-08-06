// New constant grouping based on Topological Fixed Point Theory structure

export const constantGroups = {
  // Fundamental Theory Constants (only true inputs)
  fundamental_theory: {
    name: 'Fundamental Theory Constants',
    description: 'The only three true input parameters of the theory',
    color: 'from-purple-600 to-purple-400',
    icon: '🎯',
    constants: ['c_3', 'phi_0', 'm_planck']
  },
  
  // Cascade Structure
  cascade: {
    name: 'E₈ Cascade Structure',
    description: 'Hierarchical VEVs from gamma attenuation function',
    color: 'from-indigo-600 to-indigo-400',
    icon: '🌀',
    constants: ['gamma_function', 'phi_3', 'phi_4', 'phi_5']
  },
  
  // Primary Predictions (direct from c₃ and φ₀)
  primary: {
    name: 'Primary Predictions',
    description: 'Direct predictions from fundamental parameters without corrections',
    color: 'from-blue-600 to-blue-400',
    icon: '⚡',
    constants: [
      'alpha_g', 'sin2_theta_w', 'm_p', 'theta_c', 'v_cb', 
      'v_us_v_ud', 'v_td_v_ts', 'm_s_m_d_ratio', 'r_tensor', 
      'eta_b', 'theta_qcd'
    ]
  },
  
  // Secondary Predictions (with correction factors)
  secondary: {
    name: 'Secondary Predictions',
    description: 'Predictions with loop corrections and backreaction',
    color: 'from-green-600 to-green-400',
    icon: '🔄',
    constants: [
      'omega_b', 'm_mu', 'm_u', 'm_b', 'epsilon_k', 'm_e', 
      'm_tau', 'm_c', 'm_w', 'm_z', 'alpha_s', 'g_f', 
      'v_h', 'n_s', 'm_t', 'y_t', 'y_e'
    ]
  },
  
  // Derived Constants
  derived: {
    name: 'Derived Constants',
    description: 'Constants calculated from other constants',
    color: 'from-yellow-600 to-yellow-400',
    icon: '📐',
    constants: [
      'alpha', 'lambda_qcd', 'delta_m_n_p', 'mu_p', 'mu_p_mu_n',
      'rho_parameter', 'g_1', 'g_2', 'delta_a_mu'
    ]
  },
  
  // New Physics Predictions
  new_physics: {
    name: 'New Physics Predictions',
    description: 'Testable predictions for future experiments',
    color: 'from-red-600 to-red-400',
    icon: '🔮',
    constants: [
      'f_a', 'm_axion', 'tau_proton', 'lambda_qg', 'lambda_star',
      'e_knee', 'q_pl', 't_gamma_0', 't_nu'
    ]
  },
  
  // Cosmological Parameters
  cosmology: {
    name: 'Cosmological Parameters',
    description: 'Parameters relevant for cosmology and early universe',
    color: 'from-pink-600 to-pink-400',
    icon: '🌌',
    constants: [
      'omega_b', 'r_tensor', 'n_s', 'eta_b', 'w_de', 
      'rho_lambda', 'tau_reio', 'tau_star', 'f_b', 'sigma_m_nu'
    ]
  },
  
  // Neutrino Physics
  neutrino: {
    name: 'Neutrino Physics',
    description: 'Neutrino masses and mixing',
    color: 'from-gray-600 to-gray-400',
    icon: '👻',
    constants: ['m_nu', 'sigma_m_nu', 'delta_nu_t']
  },
  
  // CP Violation
  cp_violation: {
    name: 'CP Violation',
    description: 'Parameters related to CP violation',
    color: 'from-orange-600 to-orange-400',
    icon: '🔀',
    constants: ['epsilon_k', 'theta_qcd', 'delta_gamma']
  }
}

// Correction factors
export const correctionFactors = {
  '4D-Loop': {
    formula: '1 - 2c₃',
    value: 0.920423,
    description: 'One-loop renormalization in 4D',
    applies_to: ['omega_b', 'm_mu', 'm_e']
  },
  'KK-Geometry': {
    formula: '1 - 4c₃',
    value: 0.840845,
    description: 'First Kaluza-Klein shell on S¹',
    applies_to: ['m_u']
  },
  'VEV-Backreaction': {
    formula: '1 ± kφ₀',
    description: 'VEV backreaction or radion self-coupling',
    applies_to: ['m_b', 'epsilon_k']
  }
}

// Group order for display
export const groupOrder = [
  'fundamental_theory',
  'cascade',
  'primary',
  'secondary',
  'derived',
  'new_physics',
  'cosmology',
  'neutrino',
  'cp_violation'
]

// Helper function to get group for a constant
export function getConstantGroup(constantId) {
  for (const [groupKey, group] of Object.entries(constantGroups)) {
    if (group.constants.includes(constantId)) {
      return groupKey
    }
  }
  return 'unknown'
}

// Helper function to get correction factor for a constant
export function getCorrectionFactor(constantId) {
  for (const [factorName, factor] of Object.entries(correctionFactors)) {
    if (factor.applies_to.includes(constantId)) {
      return { name: factorName, ...factor }
    }
  }
  return null
}

// Special scales in RG flow
export const specialScales = {
  M_Z: {
    value: 91.1876,
    unit: 'GeV',
    description: 'Z boson mass scale'
  },
  M_GUT: {
    value: 1.22e14,
    unit: 'GeV',
    description: 'Grand unification scale'
  },
  M_Pl: {
    value: 1.2209e19,
    unit: 'GeV',
    description: 'Planck scale'
  },
  alpha_s_equals_phi0: {
    value: null, // To be calculated
    unit: 'GeV',
    description: 'Scale where α_s = φ₀'
  },
  alpha_s_equals_c3: {
    value: null, // To be calculated
    unit: 'GeV',
    description: 'Scale where α_s = c₃'
  }
}

export default constantGroups