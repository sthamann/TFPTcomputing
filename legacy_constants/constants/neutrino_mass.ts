/**
 * Light Neutrino Mass m_ν (eV units).
 * Prediction from the topological fixed-point cascade Type-I seesaw.
 *
 * – API notes –
 *   • calculateNeutrinoMass() accepts either
 *       – a single φ₀ number (legacy) OR
 *       – an option bag { phi0?, phi5?, level?, yEff? }.
 *   • Sensible defaults ensure a value is always returned.
 */
import type { ConstantDefinition } from "./alpha";

/* ---------- Physical constants ---------- */
const V_H_EV = 246.22e9; // Higgs VEV  (246.22 GeV → 2.4622×10¹¹ eV)
const M_PL_EV = 1.22091e28; // Planck mass (1.22091×10¹⁹ GeV → eV)

const DEFAULT_PHI0 = 0.053171; // canonical φ₀ from fixed-point solution
const DEFAULT_LEVEL = 5; // default cascade depth n

/* ---------- Types ---------- */
export interface NeutrinoMassOptions {
  /** Initial cascade VEV φ₀ (dimensionless). */
  phi0?: number;
  /** Pre-computed cascade VEV φ_n. If supplied, φ₀ is ignored. */
  phi5?: number;
  /** Cascade depth n (default 5). */
  level?: number;
  /** Effective Yukawa coupling y_eff (default 1 ⇒ upper bound). */
  yEff?: number;
}

/* ---------- γ-function from E8 nilpotents (approx.) ---------- */
function gamma(n: number): number {
  // Polynomial fit for cascade attenuation
  return 0.834 + 0.108 * n + 0.0105 * n * n;
}

/* ---------- Cascade helper ---------- */
/** Returns φ_n from the initial φ₀ and depth n. */
export function phiLevel(phi0: number, n: number): number {
  let sum = 0;
  for (let k = 0; k < n; k++) sum += gamma(k);
  return phi0 * Math.exp(-sum);
}

/* ---------- Heavy Majorana mass ---------- */
export function majoranaMass({
  phi0,
  phi5,
  level = DEFAULT_LEVEL,
}: Partial<NeutrinoMassOptions> = {}): number {
  const phi = phi5 ?? phiLevel(phi0 ?? DEFAULT_PHI0, level);
  return phi * M_PL_EV;
}

/* ---------- Light neutrino mass (seesaw) ---------- */
export function calculateNeutrinoMass(phi0: number): number;
export function calculateNeutrinoMass(
  opts?: Partial<NeutrinoMassOptions>,
): number;
export function calculateNeutrinoMass(
  arg?: number | Partial<NeutrinoMassOptions>,
): number {
  const opts: Partial<NeutrinoMassOptions> =
    typeof arg === "number" ? { phi0: arg } : (arg ?? {});

  const { phi0, phi5, level = DEFAULT_LEVEL, yEff = 1 } = opts;
  const phi = phi5 ?? phiLevel(phi0 ?? DEFAULT_PHI0, level);
  const mR = phi * M_PL_EV; // heavy Majorana mass
  return (yEff * V_H_EV ** 2) / mR;
}

/* ---------- Human-readable steps ---------- */
export function getCalculationSteps(
  arg?: number | Partial<NeutrinoMassOptions>,
): string[] {
  const opts: Partial<NeutrinoMassOptions> =
    typeof arg === "number" ? { phi0: arg } : (arg ?? {});

  const { phi0, phi5, level = DEFAULT_LEVEL, yEff = 1 } = opts;
  const effectivePhi0 = phi0 ?? DEFAULT_PHI0;
  const phi = phi5 ?? phiLevel(effectivePhi0, level);
  const mR = phi * M_PL_EV;
  const mNu = (yEff * V_H_EV ** 2) / mR;

  return [
    "// Light neutrino mass via topological Type-I seesaw",
    `φ₀ = ${effectivePhi0.toPrecision(8)}`,
    "",
    `// Step 1: cascade VEV at level n = ${level}`,
    `φ_${level} = φ₀ · exp(−Σ γ(k)) = ${phi.toExponential(6)}`,
    "",
    "// Step 2: heavy RH-neutrino mass",
    `M_R = φ_${level} · M_Pl = ${mR.toExponential(3)} eV`,
    "",
    `// Step 3: seesaw m_ν = y_eff · v_H² / M_R  (y_eff = ${yEff})`,
    `m_ν = (${V_H_EV.toExponential(3)})² / ${mR.toExponential(3)}`,
    `    = ${mNu.toExponential(3)} eV`,
  ];
}

/* ---------- Metadata ---------- */
export const NEUTRINO_MASS_CONSTANT: ConstantDefinition = {
  symbol: "m_ν",
  name: "Light Neutrino Mass",
  description:
    "Lightest neutrino eigenstate mass from n-level cascade seesaw (M_R = φ_n · M_Pl).",
  formula: "m_ν = y_eff · v_H^2 / (φ_n · M_Pl)",
  category: "LEPTONS",
  unit: "eV",
  measured: 0, // experimental best fit (consistent with m_β < 0.8 eV @ 90 % CL)
  uncertainty: 0.8,
  source: "KATRIN / Project 8 upper bound",
};

/* ---------- Sanity check (CLI) ---------- */
if (import.meta?.main) {
  const mNuTh = calculateNeutrinoMass();
  console.log(`m_ν(th) ≈ ${mNuTh.toExponential(3)} eV`);
}
