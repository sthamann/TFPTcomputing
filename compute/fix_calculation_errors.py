#!/usr/bin/env python3
"""
Fix calculation errors by updating JSON files with correct formulas and values
"""

import json
import math
from pathlib import Path
from topological_constants import TopologicalConstants

def fix_all_constants():
    """Update all constant JSON files with correct formulas and calculated values"""
    
    tc = TopologicalConstants()
    data_dir = Path(__file__).parent.parent / 'constants' / 'data'
    
    if not data_dir.exists():
        print(f"Error: Data directory {data_dir} does not exist")
        return
    
    # Define correct mappings between JSON IDs and calculation methods
    constant_mappings = {
        # Fundamental Theory Constants
        'c_3': {
            'formula': '1/(8*pi)',
            'value': tc.c3,
            'unit': 'dimensionless'
        },
        'phi_0': {
            'formula': '0.053171',
            'value': tc.phi0,
            'unit': 'dimensionless'
        },
        'm_planck': {
            'formula': '1.2209e19',
            'value': tc.M_Pl,
            'unit': 'GeV'
        },
        
        # Primary Predictions
        'alpha_g': {
            'formula': 'phi_0^30',
            'value': tc.alpha_G(),
            'unit': 'dimensionless'
        },
        'sin2_theta_w': {
            'formula': 'phi_0',
            'value': tc.sin2_theta_W(),
            'unit': 'dimensionless'
        },
        'm_p': {
            'formula': 'M_Pl * phi_0^15',
            'value': tc.m_p_MeV(),
            'unit': 'MeV'
        },
        'theta_c': {
            'formula': 'arcsin(phi_0/(1+phi_0))',
            'value': tc.theta_c_rad(),
            'unit': 'radians'
        },
        'v_cb': {
            'formula': '(3/4)*phi_0',
            'value': tc.V_cb(),
            'unit': 'dimensionless'
        },
        'v_us_v_ud': {
            'formula': 'sqrt(phi_0)',
            'value': tc.V_us_V_ud(),
            'unit': 'dimensionless'
        },
        'v_td_v_ts': {
            'formula': 'phi_0',
            'value': tc.V_td_V_ts(),
            'unit': 'dimensionless'
        },
        'm_s_m_d_ratio': {
            'formula': '1/phi_0',
            'value': tc.m_s_m_d_ratio(),
            'unit': 'dimensionless'
        },
        'r_tensor': {
            'formula': 'phi_0^2',
            'value': tc.r_tensor(),
            'unit': 'dimensionless'
        },
        'eta_b': {
            'formula': '4*c_3^7',
            'value': tc.eta_B(),
            'unit': 'dimensionless'
        },
        'theta_qcd': {
            'formula': 'c_3*phi_0^7',
            'value': tc.theta_QCD(),
            'unit': 'dimensionless'
        },
        
        # Secondary Predictions (with corrections)
        'omega_b': {
            'formula': 'phi_0*(1-2*c_3)',
            'value': tc.Omega_b(),
            'unit': 'dimensionless'
        },
        'm_e': {
            'formula': '(v_H/sqrt(2))*alpha*phi_0^5*(1-phi_0)*1e6',
            'value': tc.m_e_MeV(),
            'unit': 'MeV'
        },
        'm_mu': {
            'formula': '(v_H/sqrt(2))*phi_0^2.5*(1-2*c_3)*1e3',
            'value': tc.m_mu_MeV(),
            'unit': 'MeV'
        },
        'm_tau': {
            'formula': '(v_H/sqrt(2))*(5/6)*phi_0^1.5',
            'value': tc.m_tau_GeV(),
            'unit': 'GeV'
        },
        'm_u': {
            'formula': 'M_Pl*phi_0^17*(1-4*c_3)*1e3',
            'value': tc.m_u_MeV(),
            'unit': 'MeV'
        },
        'm_c': {
            'formula': 'M_Pl*phi_0^16/c_3',
            'value': tc.m_c_GeV(),
            'unit': 'GeV'
        },
        'm_b': {
            'formula': 'M_Pl*phi_0^15/sqrt(c_3)*(1-2*phi_0)',
            'value': tc.m_b_GeV(),
            'unit': 'GeV'
        },
        'm_t': {
            'formula': 'y_t*v_H/sqrt(2)',
            'value': tc.m_t_GeV(),
            'unit': 'GeV'
        },
        'm_w': {
            'formula': 'M_Z*sqrt(1-sin2_theta_W)',
            'value': tc.M_W_GeV(),
            'unit': 'GeV'
        },
        'm_z': {
            'formula': '91.1876',
            'value': tc.M_Z,
            'unit': 'GeV'
        },
        'alpha_s': {
            'formula': 'phi_0/2',
            'value': tc.alpha_s_MZ(),
            'unit': 'dimensionless'
        },
        'epsilon_k': {
            'formula': 'phi_0^2/2*(1+2*phi_0)',
            'value': tc.epsilon_K(),
            'unit': 'dimensionless'
        },
        'g_f': {
            'formula': '1/(sqrt(2)*v_H^2)',
            'value': tc.G_F(),
            'unit': 'GeV^-2'
        },
        'v_h': {
            'formula': 'c_3*M_Pl*phi_0^12',
            'value': tc.v_H_calc(),
            'unit': 'GeV'
        },
        'n_s': {
            'formula': '1-phi_0-1.5*phi_0*c_3',
            'value': tc.n_s(),
            'unit': 'dimensionless'
        },
        'y_t': {
            'formula': 'sqrt(2)*c_3*phi_0^(-3)',
            'value': tc.y_t(),
            'unit': 'dimensionless'
        },
        'y_e': {
            'formula': 'alpha*phi_0^5',
            'value': tc.y_e(),
            'unit': 'dimensionless'
        },
        
        # Derived Constants
        'alpha': {
            'formula': '1/137.035999084',
            'value': tc.alpha_exp,
            'unit': 'dimensionless'
        },
        'lambda_qcd': {
            'formula': 'M_Z*exp(-2*pi/(b_Y*alpha_s))',
            'value': tc.Lambda_QCD(),
            'unit': 'MeV'
        },
        'delta_m_n_p': {
            'formula': 'm_e*phi_0*48',
            'value': tc.m_e_MeV() * tc.phi0 * 48,
            'unit': 'MeV'
        },
        'mu_p': {
            'formula': '67/24',
            'value': 67/24,
            'unit': 'mu_N'
        },
        'mu_p_mu_n': {
            'formula': '67/24',
            'value': 67/24,
            'unit': 'dimensionless'
        },
        'rho_parameter': {
            'formula': 'M_W^2/(M_Z^2*(1-phi_0))',
            'value': tc.rho_parameter(),
            'unit': 'dimensionless'
        },
        
        # New Physics
        'f_a': {
            'formula': 'phi_4*M_Pl',
            'value': tc.f_a_GeV(),
            'unit': 'GeV'
        },
        'm_fa': {
            'formula': 'f_pi*m_pi/f_a',
            'value': tc.m_axion_ueV(),
            'unit': 'ueV'
        },
        'tau_star': {
            'formula': 'phi_0^3*hbar/(4*pi*c_3*M_Pl)',
            'value': tc.tau_star(),
            'unit': 's'
        },
        'lambda_qg': {
            'formula': '2*pi*c_3*phi_0*M_Pl',
            'value': tc.Lambda_QG(),
            'unit': 'GeV'
        },
        'lambda_star': {
            'formula': '(hbar*G)/phi_0^2',
            'value': tc.lambda_star(),
            'unit': 'm'
        },
        'e_knee': {
            'formula': 'M_Pl*phi_0^20',
            'value': tc.E_knee(),
            'unit': 'PeV'
        },
        't_gamma_0': {
            'formula': '1.416784e32*phi_0^25*1e-16',
            'value': tc.T_gamma(),
            'unit': 'K'
        },
        't_nu': {
            'formula': '1.416784e32*phi_0^25',
            'value': tc.T_nu(),
            'unit': 'K'
        },
        
        # Cosmology
        'f_b': {
            'formula': 'eta_B/(eta_B+5*c_3^7)',
            'value': tc.f_b(),
            'unit': 'dimensionless'
        },
        'rho_lambda': {
            'formula': 'M_Pl^4*phi_0^97',
            'value': tc.rho_Lambda(),
            'unit': 'GeV^4'
        },
        'sigma_m_nu': {
            'formula': '3*m_nu',
            'value': tc.Sigma_m_nu(),
            'unit': 'eV'
        },
        'tau_reio': {
            'formula': '2*c_3*phi_0^5',
            'value': tc.tau_reio(),
            'unit': 'dimensionless'
        },
        'w_de': {
            'formula': '-1+phi_0^2/6',
            'value': tc.w_DE(),
            'unit': 'dimensionless'
        },
        
        # Neutrino
        'm_nu': {
            'formula': 'Y^2*v_H^2/(phi_5*M_Pl)',
            'value': tc.m_nu_eV(),
            'unit': 'eV'
        },
        'delta_nu_t': {
            'formula': 'beta_X*y_t^2',
            'value': tc.Delta_nu_t(),
            'unit': 'eV^2'
        },
        
        # CP Violation
        'delta_gamma': {
            'formula': '(phi_0^6/c_3)*alpha',
            'value': tc.delta_gamma(),
            'unit': 'dimensionless'
        },
        
        # Gamma function
        'gamma_function': {
            'formula': 'gamma(n) = 0.834 + 0.108*n + 0.0105*n^2',
            'value': 0,  # This is a function, not a constant
            'unit': 'dimensionless'
        }
    }
    
    updated_count = 0
    error_count = 0
    skipped_count = 0
    
    # Process each JSON file
    for json_file in data_dir.glob('*.json'):
        try:
            with open(json_file, 'r') as f:
                data = json.load(f)
            
            constant_id = data.get('id')
            
            if constant_id in constant_mappings:
                mapping = constant_mappings[constant_id]
                
                # Update the data
                old_value = data.get('calculated_value')
                new_value = mapping['value']
                
                data['formula'] = mapping['formula']
                data['calculated_value'] = new_value
                data['unit'] = mapping['unit']
                
                # Calculate relative error if experimental value exists
                if 'experimental_value' in data and data['experimental_value']:
                    exp_value = data['experimental_value']
                    if exp_value != 0:
                        relative_error = abs((new_value - exp_value) / exp_value)
                        data['relative_error'] = relative_error
                        data['accuracy_met'] = relative_error < data.get('target_accuracy', 0.01)
                    else:
                        data['relative_error'] = None
                        data['accuracy_met'] = False
                
                # Write back
                with open(json_file, 'w') as f:
                    json.dump(data, f, indent=2)
                
                print(f"✅ Updated {constant_id}: {old_value} → {new_value:.6e}")
                updated_count += 1
            else:
                print(f"⏭️  Skipped {constant_id} (no mapping defined)")
                skipped_count += 1
                
        except Exception as e:
            print(f"❌ Error processing {json_file.name}: {e}")
            error_count += 1
    
    print(f"\n📊 Summary:")
    print(f"   ✅ Updated: {updated_count}")
    print(f"   ⏭️  Skipped: {skipped_count}")
    print(f"   ❌ Errors: {error_count}")
    
    return updated_count, skipped_count, error_count

def create_missing_methods():
    """Add any missing methods to TopologicalConstants class"""
    
    tc = TopologicalConstants()
    
    # Check which methods are missing and add them
    missing_methods = []
    
    # List of expected methods
    expected_methods = [
        'alpha_G', 'sin2_theta_W', 'm_p_GeV', 'm_p_MeV', 'm_e_MeV', 'm_mu_MeV',
        'm_tau_GeV', 'm_u_MeV', 'm_c_GeV', 'm_b_GeV', 'm_t_GeV', 'M_W_GeV',
        'theta_c_rad', 'V_cb', 'V_us_V_ud', 'V_td_V_ts', 'm_s_m_d_ratio',
        'alpha_s_MZ', 'Omega_b', 'r_tensor', 'n_s', 'eta_B', 'epsilon_K',
        'G_F', 'v_H_calc', 'y_t', 'y_e', 'Lambda_QCD', 'rho_parameter',
        'f_a_GeV', 'm_axion_ueV', 'tau_star', 'Lambda_QG', 'lambda_star',
        'E_knee', 'T_gamma', 'T_nu', 'f_b', 'rho_Lambda', 'Sigma_m_nu',
        'tau_reio', 'w_DE', 'm_nu_eV', 'Delta_nu_t', 'delta_gamma', 'theta_QCD'
    ]
    
    for method in expected_methods:
        if not hasattr(tc, method):
            missing_methods.append(method)
    
    if missing_methods:
        print(f"\n⚠️  Missing methods in TopologicalConstants:")
        for method in missing_methods:
            print(f"   - {method}")
        print("\nThese need to be added to topological_constants.py")
    else:
        print("\n✅ All expected methods are present in TopologicalConstants")
    
    return missing_methods

if __name__ == "__main__":
    print("="*60)
    print("FIXING CALCULATION ERRORS IN CONSTANTS")
    print("="*60)
    
    # First check for missing methods
    missing = create_missing_methods()
    
    if missing:
        print("\n⚠️  Please add the missing methods before running the fix")
        print("Would you like to continue anyway? Some constants will fail.")
        response = input("Continue? (y/n): ")
        if response.lower() != 'y':
            exit(1)
    
    # Fix all constants
    updated, skipped, errors = fix_all_constants()
    
    print("\n" + "="*60)
    print("CALCULATION ERRORS FIXED")
    print("="*60)
    print(f"Successfully updated {updated} constants")
    
    if errors > 0:
        print(f"⚠️  {errors} constants had errors and need manual review")