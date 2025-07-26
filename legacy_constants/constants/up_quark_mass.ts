/**
 * Up‑quark running mass m_u(μ = 2 GeV) in MeV.
 * Pure theory: Planck‑bare φ₀¹⁷ anchor + 1‑loop QCD running.
 */
import type { EnhancedConstantDefinition } from "./utils/types";
import { M_PLANCK, PHI0, alphaStrong } from "./fundamentals";

/* ---------- One‑loop QCD parameters ---------- */
const GAMMA0 = 8; // mass anomalous dimension γ_m^(0)

interface Step {
  muHi: number;
  muLo: number;
  nF: number;
}
/** Thresholds: M_Pl → m_t → m_b → 2 GeV */
const STEPS: Step[] = [
  { muHi: M_PLANCK, muLo: 173, nF: 6 },
  { muHi: 173, muLo: 4.7, nF: 5 },
  { muHi: 4.7, muLo: 2.0, nF: 4 },
];

/* ---------- Planck‑bare mass (GeV) ---------- */
const BARE_GEV = M_PLANCK * PHI0 ** 17;

/* ---------- RG running factor ---------- */
function runDown(m0: number): number {
  let m = m0;
  for (const { muHi, muLo, nF } of STEPS) {
    const beta0 = 11 - (2 * nF) / 3;
    const aHi = alphaStrong(muHi, nF);
    const aLo = alphaStrong(muLo, nF);
    m *= (aLo / aHi) ** (-GAMMA0 / beta0);
  }
  return m;
}

const RG_FACTOR = runDown(1); // dimensionless

/* Final MS‑bar mass @2 GeV → MeV */
const VALUE_MEV = BARE_GEV * RG_FACTOR * 1_000;

/* ---------- Constant definition ---------- */
export const UP_QUARK_MASS: EnhancedConstantDefinition = {
  symbol: "m_u",
  name: "Up Quark Mass",
  description:
    "17‑step φ₀ cascade bare mass with 1‑loop QCD running across t and b thresholds (no free parameters).",
  formula: "M_PLANCK_GEV * pow(PHI0, 17) * RG_FACTOR * 1000", // math.js runtime
  latexFormula:
    "m_u = M_{\\text{Pl}}\\,\\phi_0^{17}\\prod_i left(\\tfrac{\\alpha_s^-}{\\alpha_s^+}\right)^{-\\gamma_0/\\beta_0}\\;[\\text{GeV→MeV}]",
  variables: {
    M_PLANCK_GEV: M_PLANCK,
    PHI0,
    RG_FACTOR,
    pow: Math.pow,
  },
  unit: "MeV",
  value: VALUE_MEV,
  measured: 2.16,
  uncertainty: 0.11,
  source: "PDG 2024 (overline{MS}, 2 GeV)",
  category: "QUARKS",
};

/* ---------- Helper ---------- */
export const calculateUpQuarkMass = (): number => VALUE_MEV;
export const UP_QUARK_MASS_CONST = UP_QUARK_MASS;
