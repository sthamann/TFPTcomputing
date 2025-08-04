# Constants Calculation Progress Report

Generated: 2025-08-04 10:05:26

## Summary
- Total constants: 70
- Successfully calculating: 7 (10.0%)
- Failed: 63 (90.0%)

## Constants Status

| Filename | Name | Symbol | Category | Dependencies | Calculates? | Has Result? | Homepage |
|----------|------|--------|----------|--------------|-------------|-------------|----------|
| a_p.json | Pioneer anomalous acceleration | a_P | cosmology | c_tfp, phi_0, c_3 | ❌ No | ✗  ✗ |
| alpha.json | Fine-Structure Constant | α | fundamental | phi_0, c_3 | ✅ Yes | ✗  ✓ |
| alpha_d.json | Dark-electric fine structure | α_D | dark_sector | beta_x, alpha | ❌ No | ✗  ✗ |
| alpha_g.json | Gravitational Coupling | α_G | fundamental | phi_0 | ❌ No | ✗  ✓ |
| alpha_s.json | Strong Coupling Constant | α_s | strong | phi_0 | ❌ No | ✗  ✓ |
| beta_x.json | Dark-photon coupling | β_X | dark_sector | phi_0, c_3 | ❌ No | ✗  ✗ |
| c_3.json | Topological Fixed Point | c₃ | fundamental | None | ✅ Yes | ✗  ✗ |
| c_4.json | Secondary fixed point | c₄ | fundamental | c_3, phi_0 | ❌ No | ✗  ✗ |
| c_tfp.json | Speed of light derived | c_TFP | fundamental | lambda_star, tau_star, m_planck, phi_0 | ❌ No | ✗  ✗ |
| chi_d.json | Photon–mirror-photon mixing | χ_D | dark_sector | phi_0, c_3 | ❌ No | ✗  ✗ |
| delta_a_mu.json | Muon g-2 anomaly | Δa_μ | anomaly | None | ❌ No | ✗  ✓ |
| delta_gamma.json | Photon drift index | δ_γ | cosmology | phi_0, c_3, alpha | ❌ No | ✗  ✗ |
| delta_m_n_p.json | Neutron-Proton Mass Difference | Δm_n-p | nuclear | phi_0, m_e | ❌ No | ✗  ✓ |
| delta_nu_t.json | Neutrino-top split | Δ_νt | neutrino | beta_x, y_t | ❌ No | ✗  ✗ |
| e_knee.json | Cosmic-ray knee energy | E_knee | cosmology | m_planck, phi_0 | ❌ No | ✗  ✗ |
| epsilon_k.json | Indirect CP Violation Parameter | ε_K | cp_violation | phi_0 | ❌ No | ✗  ✓ |
| eta_b.json | Baryon Asymmetry | η_B | cosmology | c_3 | ❌ No | ✗  ✓ |
| f_b.json | Cosmic baryon fraction | f_b | cosmology | eta_b, c_3 | ❌ No | ✗  ✗ |
| f_pi_lambda_qcd.json | Pion Decay Constant to QCD Scale Ratio | f_π/Λ_QCD | strong | None | ❌ No | ✗  ✓ |
| g_1.json | U(1) Gauge Coupling | g₁ | derived | alpha, sin2_theta_w | ❌ No | ✗  ✗ |
| g_2.json | SU(2) Gauge Coupling | g₂ | derived | alpha, sin2_theta_w | ❌ No | ✗  ✗ |
| g_f.json | Fermi Constant | G_F | weak | v_h | ❌ No | ✗  ✓ |
| gamma_function.json | E8 Cascade Attenuation Function | γ(n) | fundamental | None | ✅ Yes | ✗  ✗ |
| gamma_i.json | Immirzi parameter (LQG) | γ_I | quantum_gravity | c_3, phi_0 | ✅ Yes | ✗  ✗ |
| lambda_d.json | Shadow-sector 4-fermion coupling | λ_D | dark_sector | c_4, phi_0 | ❌ No | ✗  ✗ |
| lambda_qcd.json | QCD Confinement Scale | Λ_QCD | strong | m_z | ❌ No | ✗  ✓ |
| lambda_qg.json | Quantum-gravity tread-point | Λ_QG | quantum_gravity | c_3, phi_0, m_planck | ❌ No | ✗  ✗ |
| lambda_star.json | Cascade-horizon length | λ★ | quantum_gravity | phi_0 | ❌ No | ✗  ✗ |
| m_b.json | Bottom Quark Mass | m_b | quark | phi_0, m_planck, c_3 | ❌ No | ✗  ✓ |
| m_c.json | Charm Quark Mass | m_c | quark | phi_0, m_planck, c_3 | ❌ No | ✗  ✓ |
| m_e.json | Electron Mass | m_e | lepton | v_h, alpha, phi_0 | ❌ No | ✗  ✓ |
| m_fa.json | Fuzzy-axion mass | m_FA | dark_matter | m_planck, phi_0 | ❌ No | ✗  ✗ |
| m_mu.json | Muon Mass | m_μ | lepton | v_h, phi_0 | ❌ No | ✗  ✓ |
| m_nu.json | Light Neutrino Mass | m_ν | derived | v_h, phi_0, m_planck, gamma_function | ❌ No | ✗  ✗ |
| m_p.json | Proton Mass | m_p | baryon | phi_0, m_planck | ❌ No | ✗  ✓ |
| m_p_m_e_ratio.json | Proton/Electron Mass Ratio | m_p/m_e | fundamental | m_p, m_e | ✅ Yes | ✗  ✓ |
| m_planck.json | Planck Mass | M_Pl | fundamental | None | ❌ No | ✗  ✗ |
| m_s_m_d_ratio.json | Strange/Down Mass Ratio | m_s/m_d | quark | phi_0 | ❌ No | ✗  ✓ |
| m_tau.json | Tau Mass | m_τ | lepton | v_h, phi_0 | ❌ No | ✗  ✓ |
| m_u.json | Up Quark Mass | m_u | quark | phi_0, g_f, m_planck | ❌ No | ✗  ✓ |
| m_w.json | W Boson Mass | M_W | gauge_boson | v_h, g_2 | ❌ No | ✗  ✓ |
| m_z.json | Z Boson Mass | M_Z | gauge_boson | g_1, v_h, g_2 | ❌ No | ✗  ✓ |
| mu_p.json | Proton magnetic moment | μ_p | nuclear | phi_0, q_pl, m_p, c_tfp | ❌ No | ✗  ✗ |
| mu_p_mu_n.json | Proton g-factor | μ_p/μ_N | nuclear | None | ❌ No | ✗  ✓ |
| n_s.json | Scalar spectral index | n_s | cosmology | phi_0, c_3 | ❌ No | ✗  ✗ |
| omega_b.json | Baryon Density Parameter | Ω_b | cosmology | phi_0 | ❌ No | ✗  ✓ |
| phi.json | Golden Ratio | φ | fundamental | None | ✅ Yes | ✗  ✗ |
| phi_0.json | Fundamental VEV | φ₀ | fundamental | None | ✅ Yes | ✗  ✗ |
| q_pl.json | Planck charge (cascade) | q_Pl | fundamental | c_tfp | ❌ No | ✗  ✗ |
| r_tensor.json | Tensor-to-Scalar Ratio | r | cosmology | phi_0 | ❌ No | ✗  ✓ |
| rho_lambda.json | Vacuum energy density | ρ_Λ | cosmology | m_planck, phi_0 | ❌ No | ✗  ✗ |
| rho_parameter.json | ρ Parameter | ρ | electroweak | m_w, phi_0, m_z | ❌ No | ✗  ✓ |
| sigma_m_nu.json | Sum of Neutrino Masses | Σm_ν | neutrino | None | ❌ No | ✗  ✓ |
| sin2_theta_w.json | Weinberg Angle | sin²θ_W | electroweak | phi_0 | ❌ No | ✗  ✓ |
| t_gamma_0.json | CMB Temperature | T_γ0 | cosmology | phi_0 | ❌ No | ✗  ✓ |
| t_nu.json | CNB Temperature | T_ν | cosmology | phi_0 | ❌ No | ✗  ✓ |
| tau_mu.json | Muon Lifetime | τ_μ | lepton | g_f | ❌ No | ✗  ✓ |
| tau_reio.json | Optical depth to re-ionisation | τ_reio | cosmology | c_3, phi_0 | ❌ No | ✗  ✗ |
| tau_star.json | Planck-kink time | τ★ | quantum_gravity | phi_0, c_3, m_planck | ❌ No | ✗  ✗ |
| tau_tau.json | Tau Lifetime | τ_τ | lepton | g_f | ❌ No | ✗  ✓ |
| theta_c.json | Cabibbo Angle | θ_c | mixing | phi_0 | ❌ No | ✗  ✓ |
| theta_qcd.json | Strong-CP angle | θ̅_QCD | qcd | c_3, phi_0 | ❌ No | ✗  ✗ |
| v_cb.json | CKM Matrix Element V_cb | V_cb | mixing | phi_0 | ❌ No | ✗  ✓ |
| v_h.json | Higgs Vacuum Expectation Value | v_H | higgs | phi_0, m_planck, c_3 | ❌ No | ✗  ✓ |
| v_td_v_ts.json | CKM Matrix Element Ratio | V_td/V_ts | mixing | phi_0 | ❌ No | ✗  ✓ |
| v_us_v_ud.json | CKM Matrix Element Ratio | V_us/V_ud | mixing | phi_0 | ❌ No | ✗  ✓ |
| w_de.json | Dark-energy EoS | w_DE | cosmology | phi_0 | ❌ No | ✗  ✗ |
| y_e.json | Electron Yukawa | y_e | yukawa | alpha, phi_0 | ❌ No | ✗  ✗ |
| y_t.json | Top Yukawa | y_t | yukawa | c_3, phi_0 | ❌ No | ✗  ✗ |
| z_0.json | Vacuum impedance | Z₀ | electromagnetic | q_pl, alpha | ❌ No | ✗  ✗ |

## Category Breakdown

| Category | Total | Working | Success Rate |
|----------|-------|---------|-------------|
| anomaly | 1 | 0 | 0.0% |
| baryon | 1 | 0 | 0.0% |
| cosmology | 13 | 0 | 0.0% |
| cp_violation | 1 | 0 | 0.0% |
| dark_matter | 1 | 0 | 0.0% |
| dark_sector | 4 | 0 | 0.0% |
| derived | 3 | 0 | 0.0% |
| electromagnetic | 1 | 0 | 0.0% |
| electroweak | 2 | 0 | 0.0% |
| fundamental | 11 | 6 | 54.5% |
| gauge_boson | 2 | 0 | 0.0% |
| higgs | 1 | 0 | 0.0% |
| lepton | 5 | 0 | 0.0% |
| mixing | 4 | 0 | 0.0% |
| neutrino | 2 | 0 | 0.0% |
| nuclear | 3 | 0 | 0.0% |
| qcd | 1 | 0 | 0.0% |
| quantum_gravity | 4 | 1 | 25.0% |
| quark | 4 | 0 | 0.0% |
| strong | 3 | 0 | 0.0% |
| weak | 1 | 0 | 0.0% |
| yukawa | 2 | 0 | 0.0% |

## Working Constants Details

### Fine-Structure Constant (α)
- **ID**: `alpha`
- **Formula**: solveCubic(1, -A, 0, -A c₃² κ)
- **Dependencies**: phi_0, c_3
- **Status**: Successfully calculates ✅

### Topological Fixed Point (c₃)
- **ID**: `c_3`
- **Formula**: c₃ = 1 / (8 * π)
- **Dependencies**: None
- **Status**: Successfully calculates ✅

### E8 Cascade Attenuation Function (γ(n))
- **ID**: `gamma_function`
- **Formula**: γ(n) = 0.834 + 0.108 * n + 0.0105 * n^2
- **Dependencies**: None
- **Status**: Successfully calculates ✅

### Immirzi parameter (LQG) (γ_I)
- **ID**: `gamma_i`
- **Formula**: γ_I = π c₃/φ₀
- **Dependencies**: c_3, phi_0
- **Status**: Successfully calculates ✅

### Proton/Electron Mass Ratio (m_p/m_e)
- **ID**: `m_p_m_e_ratio`
- **Formula**: m_p / m_e
- **Dependencies**: m_p, m_e
- **Status**: Successfully calculates ✅

### Golden Ratio (φ)
- **ID**: `phi`
- **Formula**: φ = (1 + √5) / 2
- **Dependencies**: None
- **Status**: Successfully calculates ✅

### Fundamental VEV (φ₀)
- **ID**: `phi_0`
- **Formula**: φ₀ = 0.053171 (from cubic equation self-consistency)
- **Dependencies**: None
- **Status**: Successfully calculates ✅


## Failed Constants (Need Fixing)

| Constant | Symbol | Issue Type | Dependencies |
|----------|--------|------------|-------------|
| Pioneer anomalous acceleration | a_P | Complex dependencies | c_tfp, phi_0, c_3 |
| Dark-electric fine structure | α_D | Failed dependency | beta_x, alpha |
| Gravitational Coupling | α_G | Unknown | phi_0 |
| Strong Coupling Constant | α_s | Unknown | phi_0 |
| Dark-photon coupling | β_X | Unknown | phi_0, c_3 |
| Secondary fixed point | c₄ | Unknown | c_3, phi_0 |
| Speed of light derived | c_TFP | Complex dependencies | lambda_star, tau_star, m_planck, phi_0 |
| Photon–mirror-photon mixing | χ_D | Unknown | phi_0, c_3 |
| Muon g-2 anomaly | Δa_μ | Formula parsing | None |
| Photon drift index | δ_γ | Complex dependencies | phi_0, c_3, alpha |
| Neutron-Proton Mass Difference | Δm_n-p | Failed dependency | phi_0, m_e |
| Neutrino-top split | Δ_νt | Failed dependency | beta_x, y_t |
| Cosmic-ray knee energy | E_knee | Failed dependency | m_planck, phi_0 |
| Indirect CP Violation Parameter | ε_K | Unknown | phi_0 |
| Baryon Asymmetry | η_B | Unknown | c_3 |
| Cosmic baryon fraction | f_b | Failed dependency | eta_b, c_3 |
| Pion Decay Constant to QCD Scale Ratio | f_π/Λ_QCD | Unknown | None |
| U(1) Gauge Coupling | g₁ | Failed dependency | alpha, sin2_theta_w |
| SU(2) Gauge Coupling | g₂ | Failed dependency | alpha, sin2_theta_w |
| Fermi Constant | G_F | Failed dependency | v_h |
| Shadow-sector 4-fermion coupling | λ_D | Failed dependency | c_4, phi_0 |
| QCD Confinement Scale | Λ_QCD | Failed dependency | m_z |
| Quantum-gravity tread-point | Λ_QG | Complex dependencies | c_3, phi_0, m_planck |
| Cascade-horizon length | λ★ | Unknown | phi_0 |
| Bottom Quark Mass | m_b | Complex dependencies | phi_0, m_planck, c_3 |
| Charm Quark Mass | m_c | Complex dependencies | phi_0, m_planck, c_3 |
| Electron Mass | m_e | Complex dependencies | v_h, alpha, phi_0 |
| Fuzzy-axion mass | m_FA | Failed dependency | m_planck, phi_0 |
| Muon Mass | m_μ | Failed dependency | v_h, phi_0 |
| Light Neutrino Mass | m_ν | Complex dependencies | v_h, phi_0, m_planck, gamma_function |
| Proton Mass | m_p | Failed dependency | phi_0, m_planck |
| Planck Mass | M_Pl | Unknown | None |
| Strange/Down Mass Ratio | m_s/m_d | Unknown | phi_0 |
| Tau Mass | m_τ | Failed dependency | v_h, phi_0 |
| Up Quark Mass | m_u | Complex dependencies | phi_0, g_f, m_planck |
| W Boson Mass | M_W | Failed dependency | v_h, g_2 |
| Z Boson Mass | M_Z | Complex dependencies | g_1, v_h, g_2 |
| Proton magnetic moment | μ_p | Complex dependencies | phi_0, q_pl, m_p, c_tfp |
| Proton g-factor | μ_p/μ_N | Formula parsing | None |
| Scalar spectral index | n_s | Formula parsing | phi_0, c_3 |
| Baryon Density Parameter | Ω_b | Unknown | phi_0 |
| Planck charge (cascade) | q_Pl | Failed dependency | c_tfp |
| Tensor-to-Scalar Ratio | r | Unknown | phi_0 |
| Vacuum energy density | ρ_Λ | Failed dependency | m_planck, phi_0 |
| ρ Parameter | ρ | Complex dependencies | m_w, phi_0, m_z |
| Sum of Neutrino Masses | Σm_ν | Unknown | None |
| Weinberg Angle | sin²θ_W | Unknown | phi_0 |
| CMB Temperature | T_γ0 | Unknown | phi_0 |
| CNB Temperature | T_ν | Unknown | phi_0 |
| Muon Lifetime | τ_μ | Failed dependency | g_f |
| Optical depth to re-ionisation | τ_reio | Unknown | c_3, phi_0 |
| Planck-kink time | τ★ | Complex dependencies | phi_0, c_3, m_planck |
| Tau Lifetime | τ_τ | Failed dependency | g_f |
| Cabibbo Angle | θ_c | Unknown | phi_0 |
| Strong-CP angle | θ̅_QCD | Unknown | c_3, phi_0 |
| CKM Matrix Element V_cb | V_cb | Unknown | phi_0 |
| Higgs Vacuum Expectation Value | v_H | Complex dependencies | phi_0, m_planck, c_3 |
| CKM Matrix Element Ratio | V_td/V_ts | Unknown | phi_0 |
| CKM Matrix Element Ratio | V_us/V_ud | Unknown | phi_0 |
| Dark-energy EoS | w_DE | Unknown | phi_0 |
| Electron Yukawa | y_e | Unknown | alpha, phi_0 |
| Top Yukawa | y_t | Unknown | c_3, phi_0 |
| Vacuum impedance | Z₀ | Failed dependency | q_pl, alpha |
