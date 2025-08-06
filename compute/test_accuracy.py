#!/usr/bin/env python3
"""
Test and validate the accuracy of Topological Fixed Point Theory calculations
"""

import math
from topological_constants import TopologicalConstants
from rg_running import RGRunning
from typing import Dict, Tuple

# Experimental values (PDG 2024 / latest measurements)
EXPERIMENTAL_VALUES = {
    # Fundamental
    'alpha': 1/137.035999084,
    'alpha_G': 5.906e-39,
    'sin2_theta_W': 0.23121,  # At M_Z
    
    # Masses (GeV unless noted)
    'm_p': 0.938272088,  # Proton mass in GeV
    'm_e': 0.00051099895,  # Electron mass in GeV
    'm_mu': 0.1056583755,  # Muon mass in GeV
    'm_tau': 1.77686,  # Tau mass in GeV
    'm_u': 0.00216e-3,  # Up quark in GeV (2.16 MeV)
    'm_c': 1.27,  # Charm quark
    'm_b': 4.18,  # Bottom quark
    'm_t': 172.76,  # Top quark
    'm_w': 80.377,  # W boson
    'm_z': 91.1876,  # Z boson
    
    # CKM elements
    'theta_c': 0.22747,  # Cabibbo angle in radians
    'V_cb': 0.0409,
    'V_us_V_ud': 0.2313,
    'V_td_V_ts': 0.054,
    'm_s_m_d_ratio': 20.2,
    
    # Strong interaction
    'alpha_s': 0.1181,  # At M_Z
    'lambda_qcd': 0.217,  # QCD scale in GeV
    'theta_qcd': 1e-10,  # Strong CP angle (upper limit)
    
    # Cosmology
    'omega_b': 0.04897,
    'r_tensor': 0.003,  # Tensor-to-scalar ratio (upper limit)
    'n_s': 0.9649,  # Scalar spectral index
    'eta_b': 6.12e-10,  # Baryon asymmetry
    
    # CP violation
    'epsilon_k': 2.228e-3,
    
    # Neutrino
    'm_nu': 0.06e-9,  # Sum of neutrino masses in GeV (0.06 eV)
    
    # Electroweak
    'g_f': 1.1663787e-5,  # Fermi constant in GeV^-2
    'v_h': 246.22,  # Higgs VEV in GeV
}

def calculate_relative_error(theoretical: float, experimental: float) -> float:
    """Calculate relative error in percent"""
    if experimental == 0:
        return float('inf')
    return abs((theoretical - experimental) / experimental) * 100

def test_accuracy():
    """Test the accuracy of all theoretical predictions"""
    tc = TopologicalConstants()
    
    print("="*80)
    print("TOPOLOGICAL FIXED POINT THEORY - ACCURACY TEST")
    print("="*80)
    print(f"\nFundamental Inputs:")
    print(f"  c₃ = 1/(8π) = {tc.c3:.8f}")
    print(f"  φ₀ = {tc.phi0}")
    print(f"  M_Pl = {tc.M_Pl:.4e} GeV")
    
    results = {}
    
    # Test each constant
    test_cases = [
        ('alpha_G', tc.alpha_G(), EXPERIMENTAL_VALUES['alpha_G'], 'dimensionless'),
        ('sin²θ_W', tc.sin2_theta_W(), EXPERIMENTAL_VALUES['sin2_theta_W'], 'dimensionless'),
        ('m_p', tc.m_p_GeV(), EXPERIMENTAL_VALUES['m_p'], 'GeV'),
        ('m_e', tc.m_e_MeV()/1000, EXPERIMENTAL_VALUES['m_e'], 'GeV'),
        ('m_μ', tc.m_mu_MeV()/1000, EXPERIMENTAL_VALUES['m_mu'], 'GeV'),
        ('m_τ', tc.m_tau_GeV(), EXPERIMENTAL_VALUES['m_tau'], 'GeV'),
        ('m_u', tc.m_u_MeV()/1000, EXPERIMENTAL_VALUES['m_u'], 'GeV'),
        ('m_c', tc.m_c_GeV(), EXPERIMENTAL_VALUES['m_c'], 'GeV'),
        ('m_b', tc.m_b_GeV(), EXPERIMENTAL_VALUES['m_b'], 'GeV'),
        ('m_t', tc.m_t_GeV(), EXPERIMENTAL_VALUES['m_t'], 'GeV'),
        ('m_w', tc.M_W_GeV(), EXPERIMENTAL_VALUES['m_w'], 'GeV'),
        ('θ_c', tc.theta_c_rad(), EXPERIMENTAL_VALUES['theta_c'], 'rad'),
        ('V_cb', tc.V_cb(), EXPERIMENTAL_VALUES['V_cb'], 'dimensionless'),
        ('|V_us/V_ud|', tc.V_us_V_ud(), EXPERIMENTAL_VALUES['V_us_V_ud'], 'dimensionless'),
        ('|V_td/V_ts|', tc.V_td_V_ts(), EXPERIMENTAL_VALUES['V_td_V_ts'], 'dimensionless'),
        ('m_s/m_d', tc.m_s_m_d_ratio(), EXPERIMENTAL_VALUES['m_s_m_d_ratio'], 'dimensionless'),
        ('α_s', tc.alpha_s_MZ(), EXPERIMENTAL_VALUES['alpha_s'], 'dimensionless'),
        ('Ω_b', tc.Omega_b(), EXPERIMENTAL_VALUES['omega_b'], 'dimensionless'),
        ('r', tc.r_tensor(), EXPERIMENTAL_VALUES['r_tensor'], 'dimensionless'),
        ('n_s', tc.n_s(), EXPERIMENTAL_VALUES['n_s'], 'dimensionless'),
        ('η_B', tc.eta_B(), EXPERIMENTAL_VALUES['eta_b'], 'dimensionless'),
        ('ε_K', tc.epsilon_K(), EXPERIMENTAL_VALUES['epsilon_k'], 'dimensionless'),
    ]
    
    print("\n" + "="*80)
    print(f"{'Constant':<15} {'Theory':<12} {'Experiment':<12} {'Error %':<10} {'Status'}")
    print("="*80)
    
    perfect_count = 0
    good_count = 0
    poor_count = 0
    
    for name, theory, exp, unit in test_cases:
        error = calculate_relative_error(theory, exp)
        
        if error < 0.5:
            status = "✅ PERFECT"
            perfect_count += 1
        elif error < 5:
            status = "✓ Good"
            good_count += 1
        else:
            status = "⚠️  Needs work"
            poor_count += 1
        
        print(f"{name:<15} {theory:<12.4e} {exp:<12.4e} {error:<10.2f} {status}")
        
        results[name] = {
            'theoretical': theory,
            'experimental': exp,
            'error_percent': error,
            'unit': unit
        }
    
    print("\n" + "="*80)
    print("SUMMARY:")
    print(f"  ✅ Perfect (< 0.5% error): {perfect_count}")
    print(f"  ✓ Good (0.5-5% error): {good_count}")
    print(f"  ⚠️  Needs improvement (> 5% error): {poor_count}")
    print(f"  Total tested: {len(test_cases)}")
    print("="*80)
    
    # Test RG running at special scales
    if HAS_RG := True:
        print("\n" + "="*80)
        print("RG RUNNING TESTS")
        print("="*80)
        
        rg = RGRunning()
        
        # Test at M_Z
        couplings_mz = rg.get_couplings_at_scale(91.1876)
        print(f"\nAt M_Z = 91.19 GeV:")
        print(f"  α_s = {couplings_mz['alpha_s']:.4f} (exp: {EXPERIMENTAL_VALUES['alpha_s']:.4f})")
        print(f"  sin²θ_W = {couplings_mz['sin2_theta_W']:.4f} (exp: {EXPERIMENTAL_VALUES['sin2_theta_W']:.4f})")
        
        # Find special scales
        special = rg.find_special_scales()
        print(f"\nSpecial Scales:")
        print(f"  M_GUT = {special['M_GUT']:.2e} GeV")
        print(f"  g_GUT = {special['g_GUT']:.4f}")
        
        # Test matching with φ₀ and c₃
        if tc.find_phi0_matching_scale():
            print(f"  Scale where α_s = φ₀: {tc.find_phi0_matching_scale():.2e} GeV")
        if tc.find_c3_matching_scale():
            print(f"  Scale where α_s = c₃: {tc.find_c3_matching_scale():.2e} GeV")
    
    return results

def test_cascade_structure():
    """Test the E8 cascade structure"""
    tc = TopologicalConstants()
    
    print("\n" + "="*80)
    print("E8 CASCADE STRUCTURE TEST")
    print("="*80)
    
    print(f"\n{'n':<5} {'γ(n)':<10} {'φₙ':<12} {'Energy (GeV)':<12}")
    print("-"*40)
    
    for n in range(8):
        gamma_n = tc.gamma(n)
        phi_n = tc.phi_n(n)
        energy = phi_n * tc.M_Pl
        print(f"{n:<5} {gamma_n:<10.4f} {phi_n:<12.4e} {energy:<12.2e}")
    
    # Test specific cascade predictions
    print("\n" + "="*80)
    print("CASCADE PREDICTIONS:")
    print("="*80)
    
    predictions = [
        ('Axion scale (φ₄)', tc.phi_n(4) * tc.M_Pl, 1e15, 'GeV'),
        ('Seesaw scale (φ₅)', tc.phi_n(5) * tc.M_Pl, 1e14, 'GeV'),
        ('Proton decay (φ₃)', tc.phi_n(3) * tc.M_Pl, 1e16, 'GeV'),
    ]
    
    for name, theory, expected_order, unit in predictions:
        order_ratio = theory / expected_order
        print(f"{name:<20}: {theory:.2e} {unit} (expected O({expected_order:.0e}))")
        if 0.1 < order_ratio < 10:
            print(f"  ✓ Correct order of magnitude")
        else:
            print(f"  ⚠️  Off by factor {order_ratio:.1f}")

def test_correction_factors():
    """Test the universal correction factors"""
    tc = TopologicalConstants()
    
    print("\n" + "="*80)
    print("CORRECTION FACTORS TEST")
    print("="*80)
    
    test_value = 1.0
    
    print(f"\n4D-Loop: 1 - 2c₃ = {tc.loop_4D(test_value):.6f}")
    print(f"KK-Geometry: 1 - 4c₃ = {tc.KK_geometry(test_value):.6f}")
    print(f"VEV-Backreaction (k=1): 1 + φ₀ = {tc.VEV_backreaction(test_value, k=1):.6f}")
    print(f"VEV-Backreaction (k=2): 1 + 2φ₀ = {tc.VEV_backreaction(test_value, k=2):.6f}")
    print(f"VEV-Backreaction (k=-2): 1 - 2φ₀ = {tc.VEV_backreaction(test_value, k=-2):.6f}")
    
    # Test specific applications
    print("\n" + "="*80)
    print("CORRECTION APPLICATIONS:")
    print("="*80)
    
    applications = [
        ('Ω_b', tc.phi0, tc.loop_4D(tc.phi0), EXPERIMENTAL_VALUES['omega_b']),
        ('m_μ tree', tc.v_H/math.sqrt(2) * tc.phi0**2.5 / 1000, 
         tc.loop_4D(tc.v_H/math.sqrt(2) * tc.phi0**2.5) / 1000, 
         EXPERIMENTAL_VALUES['m_mu']),
    ]
    
    for name, tree, corrected, exp in applications:
        error_tree = calculate_relative_error(tree, exp)
        error_corrected = calculate_relative_error(corrected, exp)
        
        print(f"\n{name}:")
        print(f"  Tree-level: {tree:.4e} (error: {error_tree:.1f}%)")
        print(f"  Corrected:  {corrected:.4e} (error: {error_corrected:.1f}%)")
        print(f"  Experiment: {exp:.4e}")
        
        if error_corrected < error_tree:
            print(f"  ✓ Correction improves agreement by {error_tree - error_corrected:.1f}%")
        else:
            print(f"  ⚠️  Correction worsens agreement")

if __name__ == "__main__":
    # Run all tests
    results = test_accuracy()
    test_cascade_structure()
    test_correction_factors()
    
    print("\n" + "="*80)
    print("ALL TESTS COMPLETED")
    print("="*80)