// Mapping of constant IDs to their respective groups
export const constantGroups = {
  'Fundamental Constants': ['alpha', 'alpha_g', 'm_p_m_e_ratio', 'c_3', 'phi_0', 'phi', 'm_planck', 'gamma_function'],
  'Lepton Properties': ['m_e', 'm_mu', 'm_tau', 'tau_mu', 'tau_tau', 'y_e'],
  'Quark Masses': ['m_p', 'm_c', 'm_b', 'm_u', 'theta_c', 'm_s_m_d_ratio', 'v_us_v_ud', 'v_cb', 'v_td_v_ts', 'epsilon_k', 'y_t'],
  'Gauge Boson Masses': ['m_w', 'm_z'],
  'Higgs Sector': ['v_h'],
  'Weak Interactions': ['g_f', 'g_1', 'g_2'],
  'Electroweak Parameters': ['sin2_theta_w', 'rho_parameter', 'delta_a_mu'],
  'Strong Interactions': ['alpha_s', 'lambda_qcd', 'mu_p', 'f_pi_lambda_qcd', 'delta_m_n_p', 'mu_p_mu_n', 'theta_qcd', 'a_p'],
  'Neutrino Physics': ['sigma_m_nu', 'm_nu', 'delta_nu_t'],
  'Cosmological Parameters': ['omega_b', 't_gamma_0', 't_nu', 'eta_b', 'r_tensor', 'n_s', 'tau_reio', 'w_de', 'rho_lambda'],
  'Other Physics': ['alpha_d', 'f_b', 'gamma_i', 'z_0', 'c_tfp', 'chi_d', 'lambda_star', 'q_pl', 'e_knee', 'm_fa', 'delta_gamma', 'lambda_d', 'tau_star', 'lambda_qg', 'c_4', 'beta_x']
};

// Get group for a constant ID
export const getConstantGroup = (constantId) => {
  for (const [group, ids] of Object.entries(constantGroups)) {
    if (ids.includes(constantId)) {
      return group;
    }
  }
  return 'Other';
};

// All group names in order
export const groupOrder = [
  'Fundamental Constants',
  'Lepton Properties',
  'Quark Masses',
  'Gauge Boson Masses',
  'Higgs Sector',
  'Weak Interactions',
  'Electroweak Parameters',
  'Strong Interactions',
  'Neutrino Physics',
  'Cosmological Parameters',
  'Other Physics',
  'Other'
];