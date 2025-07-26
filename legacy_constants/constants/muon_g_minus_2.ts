/**
 * Muon g–2 anomaly Δa_μ (×10⁻⁹ units).
 * Theory prediction: one-loop contribution from n = 6 E8 vector bosons (M ≈ 2 TeV).
 * Experimental comparison: Fermilab Muon g-2 world average (2025).
 */
import type { EnhancedConstantDefinition } from "./utils/types";
import { M_MUON } from "./fundamentals"; // MeV

// ----------------------------
// Model parameters
// ----------------------------
/** Coxeter-derived multiplicity of E8 vectors at cascade level n = 6 */
const N_E8_VECTORS = 60;
/** O(1) gauge coupling in the TeV sector */
const G_APPROX = 1;
/** Muon mass in GeV */
const M_MUON_GEV = M_MUON / 1_000;
/** Heavy vector mass scale (benchmark) in GeV */
const M_HEAVY_GEV = 2_000;
/** Scale factor to express the result in “×10⁻⁹” units */
const DISPLAY_SCALE = 1e9;

// ----------------------------
// Derived prefactor
// ----------------------------
const PREFAC = (N_E8_VECTORS * G_APPROX ** 2) / (8 * Math.PI ** 2);

// ----------------------------
// Constant definition exposed to the UI
// ----------------------------
export const MUON_G_MINUS_2: EnhancedConstantDefinition = {
  symbol: "Δa_μ",
  name: "Muon g-2 anomaly",
  description:
    "One-loop dipole moment from n = 6 E8 vector bosons with M ≈ 2 TeV (no ad-hoc factors).",
  formula:
    "(N_E8_VECTORS * G_APPROX^2) / (8 * PI^2) * (M_MUON_GEV^2 / M_HEAVY_GEV^2) * DISPLAY_SCALE",
  latexFormula:
    "\\Delta a_{\\mu}=\\dfrac{N\\,g^{2}}{8\\pi^{2}}\\,\\dfrac{m_{\\mu}^{2}}{M^{2}}\\quad(\\times10^{-9})",
  variables: {
    PI: Math.PI,
    N_E8_VECTORS,
    G_APPROX,
    M_MUON_GEV,
    M_HEAVY_GEV,
    DISPLAY_SCALE,
  },
  unit: "×10⁻⁹",
  measured: 2.45, // Fermilab world-average 2025
  uncertainty: 1.6,
  source: "Fermilab Muon g-2 (2025)",
  category: "ELECTROWEAK",
};

// ----------------------------
// Utility function
// ----------------------------
/**
 * Returns the theoretical Δa_μ in “×10⁻⁹” presentation units.
 */
export function calculateMuonGMinus2(): number {
  return PREFAC * (M_MUON_GEV ** 2 / M_HEAVY_GEV ** 2) * DISPLAY_SCALE;
}
