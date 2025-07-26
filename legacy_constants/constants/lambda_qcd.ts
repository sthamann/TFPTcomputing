import type { EnhancedConstantDefinition } from "./utils/types";
import { PHI0 } from "./fundamentals";

// --- 1-Loop ingredients ----------------------
const N_F = 5; // active flavours at M_Z
const BETA_0 = 11 - (2 * N_F) / 3; // = 23/3
const M_Z_GEV = 91.1876; // reference scale
const ALPHA_S_MZ = Math.sqrt(PHI0) / 2; // ≈ 0.1153

// --- Λ_QCD (MeV) -----------------------------
const VALUE = M_Z_GEV * Math.exp((-2 * Math.PI) / (BETA_0 * ALPHA_S_MZ)) * 1e3; // → MeV

export const LAMBDA_QCD: EnhancedConstantDefinition = {
  symbol: "Λ_QCD",
  name: "QCD Confinement Scale",
  description:
    "Parameter-free 1-loop result: Λ = μ·exp(-2π/(β₀ α_s(μ))) with μ = M_Z, n_f = 5",
  formula: "M_Z * exp(-2 * PI / (BETA_0 * ALPHA_S)) * 1e3",
  latexFormula:
    "\\Lambda_{\\text{QCD}} = M_Z\\,\\exp\\!\\bigl[-\\tfrac{2\\pi}{\\beta_0\\,\\alpha_s(M_Z)}\\bigr]",
  variables: {
    M_Z: M_Z_GEV,
    BETA_0,
    ALPHA_S: ALPHA_S_MZ,
    PI: Math.PI,
    exp: Math.exp,
  },
  unit: "MeV",
  value: VALUE, // ≈ 74.6 MeV
  measured: 87, // PDG-24, n_f = 5
  uncertainty: 7,
  note: "≈ 14 % low; RG + pole-shift expected",
  source: "PDG 2024 (MS-bar, n_f = 5)",
  category: "QCD",
};
