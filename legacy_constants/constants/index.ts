// Dynamic Constants Registry
// This file automatically imports all constant definitions and generates the physics table

import {
  ALPHA_CONSTANT,
  calculateAlpha,
  getCalculationSteps as getAlphaSteps,
} from "./alpha";
import {
  ELECTRON_MASS_CONSTANT,
  calculateElectronMass,
  getCalculationSteps as getElectronSteps,
} from "./electron_mass";
import {
  CABIBBO_ANGLE_CONSTANT,
  calculateCabibboAngle,
  getCalculationSteps as getCabibboSteps,
} from "./cabibbo_angle";
import {
  PROTON_MASS_CONSTANT,
  calculateProtonMass,
  getCalculationSteps as getProtonSteps,
} from "./proton_mass";
import {
  MUON_MASS_CONSTANT,
  calculateMuonMass,
  getCalculationSteps as getMuonSteps,
} from "./muon_mass";
import {
  TAU_LIFETIME_CONSTANT,
  calculateTauLifetime,
  getCalculationSteps as getTauSteps,
} from "./tau_lifetime";
import {
  NEUTRINO_MASS_CONSTANT,
  calculateNeutrinoMass,
  getCalculationSteps as getNeutrinoSteps,
} from "./neutrino_mass";
import {
  BARYON_DENSITY_CONSTANT,
  calculateBaryonDensity,
  getCalculationSteps as getBaryonSteps,
} from "./baryon_density";
import {
  WEINBERG_ANGLE_CONSTANT,
  calculateWeinbergAngle,
  getCalculationSteps as getWeinbergSteps,
} from "./weinberg_angle";
import {
  CNB_TEMPERATURE_CONSTANT,
  calculateCNBTemperature,
  getCalculationSteps as getCNBSteps,
} from "./cnb_temperature";
import {
  GRAVITATIONAL_COUPLING_CONSTANT,
  calculateGravitationalCoupling,
  getCalculationSteps as getGravitationalSteps,
} from "./gravitational_coupling";
import {
  STRONG_COUPLING_CONSTANT,
  calculateStrongCoupling,
  getCalculationSteps as getStrongSteps,
} from "./strong_coupling";
import {
  UP_QUARK_MASS_CONSTANT,
  calculateUpQuarkMass,
  getCalculationSteps as getUpQuarkSteps,
} from "./up_quark_mass";
import {
  STRANGE_DOWN_RATIO_CONSTANT,
  calculateStrangeDownRatio,
  getCalculationSteps as getStrangeDownSteps,
} from "./strange_down_ratio";
import {
  HIGGS_VEV_CONSTANT,
  calculateHiggsVEV,
  getCalculationSteps as getHiggsSteps,
} from "./higgs_vev";
import {
  W_BOSON_MASS_CONSTANT,
  calculateWBosonMass,
  getCalculationSteps as getWBosonSteps,
} from "./w_boson_mass";
import {
  Z_BOSON_MASS_CONSTANT,
  calculateZBosonMass,
  getCalculationSteps as getZBosonSteps,
} from "./z_boson_mass";
import {
  FERMI_CONSTANT,
  calculateFermiConstant,
  getCalculationSteps as getFermiSteps,
} from "./fermi_constant";
import {
  RHO_PARAMETER_CONSTANT,
  calculateRhoParameter,
  getCalculationSteps as getRhoSteps,
} from "./rho_parameter";
import {
  TAU_MASS_CONSTANT,
  calculateTauMass,
  getCalculationSteps as getTauMassSteps,
} from "./tau_mass";
import {
  MUON_LIFETIME_CONSTANT,
  calculateMuonLifetime,
  getCalculationSteps as getMuonLifetimeSteps,
} from "./muon_lifetime";
import {
  CHARM_MASS_CONSTANT,
  calculateCharmMass,
  getCalculationSteps as getCharmSteps,
} from "./charm_mass";
import {
  BOTTOM_MASS_CONSTANT,
  calculateBottomMass,
  getCalculationSteps as getBottomSteps,
} from "./bottom_mass";
import {
  PROTON_ELECTRON_RATIO_CONSTANT,
  calculateProtonElectronRatio,
  getCalculationSteps as getProtonElectronSteps,
} from "./proton_electron_mass_ratio";
import {
  LAMBDA_QCD_CONSTANT,
  calculateLambdaQCD,
  getCalculationSteps as getLambdaQCDSteps,
} from "./lambda_qcd";
import {
  NEUTRINO_MASS_SUM_CONSTANT,
  calculateNeutrinoMassSum,
  getCalculationSteps as getNeutrinoMassSumSteps,
} from "./neutrino_mass_sum";
import {
  CMB_TEMPERATURE_CONSTANT,
  calculateCMBTemperature,
  getCalculationSteps as getCMBSteps,
} from "./cmb_temperature";

export interface PhysicsConstant {
  definition: any;
  calculate: (phi0: number, c3: number) => number;
  getSteps: (phi0: number, c3: number) => string[];
}

// Registry of all physics constants
export const PHYSICS_CONSTANTS_REGISTRY: Record<string, PhysicsConstant> = {
  α: {
    definition: ALPHA_CONSTANT,
    calculate: calculateAlpha,
    getSteps: getAlphaSteps,
  },
  m_e: {
    definition: ELECTRON_MASS_CONSTANT,
    calculate: (phi0: number, c3: number) => calculateElectronMass(phi0),
    getSteps: getElectronSteps,
  },
  m_μ: {
    definition: MUON_MASS_CONSTANT,
    calculate: calculateMuonMass,
    getSteps: getMuonSteps,
  },
  τ_τ: {
    definition: TAU_LIFETIME_CONSTANT,
    calculate: (phi0: number, c3: number) => calculateTauLifetime(),
    getSteps: getTauSteps,
  },
  m_ν: {
    definition: NEUTRINO_MASS_CONSTANT,
    calculate: (phi0: number, c3: number) => calculateNeutrinoMass(phi0),
    getSteps: getNeutrinoSteps,
  },
  "V_us/V_ud": {
    definition: CABIBBO_ANGLE_CONSTANT,
    calculate: calculateCabibboAngle,
    getSteps: getCabibboSteps,
  },
  v_H: {
    definition: HIGGS_VEV_CONSTANT,
    calculate: (phi0: number, c3: number) => calculateHiggsVEV(phi0,c3,12),
    getSteps: getHiggsSteps,
  },
  m_p: {
    definition: PROTON_MASS_CONSTANT,
    calculate: calculateProtonMass,
    getSteps: getProtonSteps,
  },
  Ω_b: {
    definition: BARYON_DENSITY_CONSTANT,
    calculate: calculateBaryonDensity,
    getSteps: getBaryonSteps,
  },
  "sin²θ_W": {
    definition: WEINBERG_ANGLE_CONSTANT,
    calculate: (phi0: number, c3: number) => calculateWeinbergAngle(phi0),
    getSteps: getWeinbergSteps,
  },
  T_ν0: {
    definition: CNB_TEMPERATURE_CONSTANT,
    calculate: (phi0: number, c3: number) => calculateCNBTemperature(phi0),
    getSteps: getCNBSteps,
  },
  α_G: {
    definition: GRAVITATIONAL_COUPLING_CONSTANT,
    calculate: (phi0: number, c3: number) =>
      calculateGravitationalCoupling(phi0),
    getSteps: getGravitationalSteps,
  },
  "α_s(M_Z)": {
    definition: STRONG_COUPLING_CONSTANT,
    calculate: (phi0: number, c3: number) => calculateStrongCoupling(phi0),
    getSteps: getStrongSteps,
  },
  m_u: {
    definition: UP_QUARK_MASS_CONSTANT,
    calculate: (phi0: number, c3: number) => calculateUpQuarkMass(phi0),
    getSteps: getUpQuarkSteps,
  },
  "m_s/m_d": {
    definition: STRANGE_DOWN_RATIO_CONSTANT,
    calculate: (phi0: number, c3: number) => calculateStrangeDownRatio(phi0),
    getSteps: getStrangeDownSteps,
  },
  M_W: {
    definition: W_BOSON_MASS_CONSTANT,
    calculate: calculateWBosonMass,
    getSteps: getWBosonSteps,
  },
  M_Z: {
    definition: Z_BOSON_MASS_CONSTANT,
    calculate: calculateZBosonMass,
    getSteps: getZBosonSteps,
  },
  G_F: {
    definition: FERMI_CONSTANT,
    calculate: calculateFermiConstant,
    getSteps: getFermiSteps,
  },
  ρ: {
    definition: RHO_PARAMETER_CONSTANT,
    calculate: calculateRhoParameter,
    getSteps: getRhoSteps,
  },
  m_τ: {
    definition: TAU_MASS_CONSTANT,
    calculate: calculateTauMass,
    getSteps: getTauMassSteps,
  },
  τ_μ: {
    definition: MUON_LIFETIME_CONSTANT,
    calculate: calculateMuonLifetime,
    getSteps: getMuonLifetimeSteps,
  },
  m_c: {
    definition: CHARM_MASS_CONSTANT,
    calculate: calculateCharmMass,
    getSteps: getCharmSteps,
  },
  m_b: {
    definition: BOTTOM_MASS_CONSTANT,
    calculate: calculateBottomMass,
    getSteps: getBottomSteps,
  },
  "m_p/m_e": {
    definition: PROTON_ELECTRON_RATIO_CONSTANT,
    calculate: calculateProtonElectronRatio,
    getSteps: getProtonElectronSteps,
  },
  Λ_QCD: {
    definition: LAMBDA_QCD_CONSTANT,
    calculate: calculateLambdaQCD,
    getSteps: getLambdaQCDSteps,
  },
  "Σm_ν": {
    definition: NEUTRINO_MASS_SUM_CONSTANT,
    calculate: calculateNeutrinoMassSum,
    getSteps: getNeutrinoMassSumSteps,
  },
  T_γ0: {
    definition: CMB_TEMPERATURE_CONSTANT,
    calculate: calculateCMBTemperature,
    getSteps: getCMBSteps,
  },
};

// Group constants by category
export function getConstantsByCategory() {
  const categories: Record<string, any[]> = {};

  Object.values(PHYSICS_CONSTANTS_REGISTRY).forEach(({ definition }) => {
    if (!categories[definition.category]) {
      categories[definition.category] = [];
    }
    categories[definition.category].push(definition);
  });

  return categories;
}

// Calculate all constants for given parameters
export function calculateAllConstants(phi0: number, c3: number) {
  const results: Record<string, number> = {};

  Object.entries(PHYSICS_CONSTANTS_REGISTRY).forEach(([symbol, constant]) => {
    results[symbol] = constant.calculate(phi0, c3);
  });

  return results;
}

// Get calculation steps for any constant
export function getCalculationSteps(
  symbol: string,
  phi0: number,
  c3: number,
): string[] {
  const constant = PHYSICS_CONSTANTS_REGISTRY[symbol];
  if (!constant) {
    return [`// No calculation steps available for ${symbol}`];
  }

  return constant.getSteps(phi0, c3);
}

// Format value for display
export function formatConstantValue(
  value: number,
  symbol: string,
  unit?: string,
): string {
  if (value === undefined || value === null || isNaN(value)) return "N/A";

  if (symbol === "α") return `1/${(1 / value).toFixed(3)}`;
  if (symbol === "α_G") return value.toExponential(2);
  if (symbol === "T_ν" || symbol === "T_ν0" || symbol === "T_γ0") return value.toFixed(2);
  if (symbol === "τ_p" || symbol === "τ_μ") return value.toExponential(0);
  if (symbol === "G_F") return value.toExponential(4);
  if (symbol === "Λ_QCD") return (value * 1000).toFixed(0); // Convert GeV to MeV
  if (symbol === "Σm_ν") return value.toFixed(3);
  if (unit === "μeV") return value.toFixed(1);
  if (unit === "μs") return value.toFixed(2);
  if (unit === "GeV⁻²") return value.toExponential(4);
  if (value < 0.01) return value.toExponential(3);

  return value.toFixed(4);
}

// Calculate deviation from measured value
export function calculateDeviation(
  calculated: number,
  measured: number | null,
): number | null {
  if (measured === null || measured === undefined || calculated === undefined)
    return null;
  return ((calculated - measured) / measured) * 100;
}
