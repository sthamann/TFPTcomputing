// Declarative constant definitions registry
// Imports all individual constant files as single source of truth

import { ALPHA } from './alpha';
import { ELECTRON_MASS } from './electron_mass';
import { MUON_MASS } from './muon_mass';
import { PROTON_MASS } from './proton_mass';
import { CABIBBO_ANGLE } from './cabibbo_angle';
import { TAU_LIFETIME } from './tau_lifetime';
import { WEINBERG_ANGLE } from './weinberg_angle';
import { BARYON_DENSITY_CONSTANT } from './baryon_density';
import { CNB_TEMPERATURE_CONSTANT } from './cnb_temperature';
import type { ConstantDefinition, EnhancedConstantDefinition } from './utils/types';

// Import ALL individual constants from dedicated files
import { TAU_MASS } from './tau_mass';
import { CHARM_MASS } from './charm_mass';
import { W_BOSON_MASS } from './w_boson_mass';
import { Z_BOSON_MASS } from './z_boson_mass';
import { FERMI_CONSTANT } from './fermi_constant';
import { HIGGS_VEV } from './higgs_vev';
import { MUON_LIFETIME } from './muon_lifetime';
import { NEUTRINO_MASS_SUM } from './neutrino_mass_sum';
import { BOTTOM_MASS } from './bottom_mass';
import { UP_QUARK_MASS } from './up_quark_mass';
import { RHO_PARAMETER } from './rho_parameter';
import { LAMBDA_QCD } from './lambda_qcd';
import { PROTON_ELECTRON_RATIO } from './proton_electron_mass_ratio';
import { CMB_TEMPERATURE } from './cmb_temperature';
import { STRONG_COUPLING } from './strong_coupling';
import { GRAVITATIONAL_COUPLING } from './gravitational_coupling';
import { STRANGE_DOWN_RATIO } from './strange_down_ratio';

// Import new constants
import { V_US_V_UD_RATIO } from './v_us_v_ud_ratio';
import { V_CB } from './v_cb';
import { V_TD_V_TS_RATIO } from './v_td_v_ts_ratio';
import { EPSILON_K } from './epsilon_k';
import { PROTON_G_FACTOR } from './proton_g_factor';
import { FPI_LAMBDA_QCD_RATIO } from './fpi_lambda_qcd_ratio';
import { NEUTRON_PROTON_MASS_DIFF } from './neutron_proton_mass_diff';
import { MUON_G_MINUS_2 } from './muon_g_minus_2';
import { BARYON_ASYMMETRY } from './baryon_asymmetry';
import { TENSOR_SCALAR_RATIO } from './tensor_scalar_ratio';

// Helper function to convert enhanced constant to regular constant format
function convertToRegularConstant(enhanced: EnhancedConstantDefinition): ConstantDefinition {
  return {
    symbol: enhanced.symbol,
    name: enhanced.name,
    description: enhanced.description,
    formula: enhanced.formula,
    variables: enhanced.variables,
    unit: enhanced.unit,
    measured: enhanced.measured,
    uncertainty: enhanced.uncertainty,
    source: enhanced.source,
    category: enhanced.category,
    note: enhanced.note  // Preserve the note property
  };
}

// Export ALL constants as a registry - all from individual files as single source of truth
export const DECLARATIVE_CONSTANTS: Record<string, ConstantDefinition> = {
  // Fundamental constants
  α: convertToRegularConstant(ALPHA),
  G_F: convertToRegularConstant(FERMI_CONSTANT),
  α_G: convertToRegularConstant(GRAVITATIONAL_COUPLING),
  
  // Lepton masses and lifetimes
  m_e: convertToRegularConstant(ELECTRON_MASS),
  m_μ: convertToRegularConstant(MUON_MASS),
  m_τ: convertToRegularConstant(TAU_MASS),
  τ_μ: convertToRegularConstant(MUON_LIFETIME),
  τ_τ: convertToRegularConstant(TAU_LIFETIME),
  
  // Quark masses and mixing
  m_p: convertToRegularConstant(PROTON_MASS),
  m_c: convertToRegularConstant(CHARM_MASS),
  m_b: convertToRegularConstant(BOTTOM_MASS),
  m_u: convertToRegularConstant(UP_QUARK_MASS),
  θ_c: convertToRegularConstant(CABIBBO_ANGLE),
  'm_p/m_e': convertToRegularConstant(PROTON_ELECTRON_RATIO),
  'm_s/m_d': convertToRegularConstant(STRANGE_DOWN_RATIO),
  'V_us/V_ud': convertToRegularConstant(V_US_V_UD_RATIO),
  'V_cb': convertToRegularConstant(V_CB),
  'V_td/V_ts': convertToRegularConstant(V_TD_V_TS_RATIO),
  'ε_K': convertToRegularConstant(EPSILON_K),
  
  // Gauge bosons and electroweak
  M_W: convertToRegularConstant(W_BOSON_MASS),
  M_Z: convertToRegularConstant(Z_BOSON_MASS),
  'sin²θ_W': convertToRegularConstant(WEINBERG_ANGLE),
  ρ: convertToRegularConstant(RHO_PARAMETER),
  'Δa_μ': convertToRegularConstant(MUON_G_MINUS_2),
  
  // Higgs and strong force
  v_H: convertToRegularConstant(HIGGS_VEV),
  α_s: convertToRegularConstant(STRONG_COUPLING),
  Λ_QCD: convertToRegularConstant(LAMBDA_QCD),
  'μ_p/μ_N': convertToRegularConstant(PROTON_G_FACTOR),
  'f_π/Λ_QCD': convertToRegularConstant(FPI_LAMBDA_QCD_RATIO),
  'Δm_n-p': convertToRegularConstant(NEUTRON_PROTON_MASS_DIFF),
  
  // Neutrinos and cosmology
  'Σm_ν': convertToRegularConstant(NEUTRINO_MASS_SUM),
  Ω_b: BARYON_DENSITY_CONSTANT,
  T_CMB: convertToRegularConstant(CMB_TEMPERATURE),
  'T_ν': CNB_TEMPERATURE_CONSTANT,
  'η_B': convertToRegularConstant(BARYON_ASYMMETRY),
  'r': convertToRegularConstant(TENSOR_SCALAR_RATIO),
};