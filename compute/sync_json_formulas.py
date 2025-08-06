#!/usr/bin/env python3
"""
Synchronize JSON formulas with topological_constants.py calculations.
This ensures the notebook-based system produces the same results as the Python module.
"""

import json
import math
from pathlib import Path
from topological_constants import TopologicalConstants

def update_json_formulas():
    """Update JSON files with correct formulas that match topological_constants.py"""
    
    tc = TopologicalConstants()
    data_dir = Path(__file__).parent.parent / 'constants' / 'data'
    
    # Define formula mappings based on topological_constants.py
    formula_updates = {
        # Baryon Asymmetry
        'eta_b': {
            'formula': '4 * c_3^7',
            'dependencies': ['c_3'],
            'notes': 'Baryon asymmetry from topological structure'
        },
        
        # Proton Mass
        'm_p': {
            'formula': 'M_Pl * phi_0^15',
            'dependencies': ['m_planck', 'phi_0'],
            'notes': 'Proton mass from cascade level 15'
        },
        
        # Weinberg Angle - needs special handling with RG corrections
        'sin2_theta_w': {
            'formula': 'phi_0 * 1.155',  # Empirical correction factor from topological_constants.py
            'dependencies': ['phi_0'],
            'notes': 'Weinberg angle at M_Z with RG corrections (factor 1.155)'
        },
        
        # CKM Matrix Element V_cb
        'v_cb': {
            'formula': '(3/4) * phi_0',
            'dependencies': ['phi_0'],
            'notes': 'CKM matrix element from flavor structure'
        },
        
        # Bottom Quark Mass
        'm_b': {
            'formula': 'M_Pl * phi_0^15 / sqrt(c_3) * (1 - 2*phi_0)',
            'dependencies': ['m_planck', 'phi_0', 'c_3'],
            'notes': 'Bottom quark mass with VEV backreaction'
        },
        
        # Charm Quark Mass
        'm_c': {
            'formula': 'M_Pl * phi_0^16 / c_3',
            'dependencies': ['m_planck', 'phi_0', 'c_3'],
            'notes': 'Charm quark mass from cascade level 16'
        },
        
        # Up Quark Mass
        'm_u': {
            'formula': 'M_Pl * phi_0^17 * (1 - 4*c_3) * 1e3',
            'dependencies': ['m_planck', 'phi_0', 'c_3'],
            'notes': 'Up quark mass with KK-geometry correction, result in MeV'
        },
        
        # W Boson Mass
        'm_w': {
            'formula': 'M_Z * sqrt(1 - sin2_theta_w)',
            'dependencies': ['m_z', 'sin2_theta_w'],
            'notes': 'W boson mass from electroweak relation'
        },
        
        # Z Boson Mass (experimental input)
        'm_z': {
            'formula': '91.1876',
            'dependencies': [],
            'notes': 'Z boson mass - experimental input value'
        },
        
        # Scalar Spectral Index
        'n_s': {
            'formula': '1 - phi_0 - 1.5*phi_0*c_3',
            'dependencies': ['phi_0', 'c_3'],
            'notes': 'CMB scalar spectral index with c_3 correction'
        },
        
        # Electron Yukawa
        'y_e': {
            'formula': '0.000511 * sqrt(2) / 246.22',
            'dependencies': [],
            'notes': 'Electron Yukawa from mass relation: m_e * sqrt(2) / v_H'
        },
        
        # Top Yukawa
        'y_t': {
            'formula': '0.935',
            'dependencies': [],
            'notes': 'Top Yukawa at M_Z scale - experimental value'
        },
        
        # Additional constants that need updates
        'g_1': {
            'formula': 'sqrt(5/3 * 4*pi*alpha / (1 - sin2_theta_w))',
            'dependencies': ['alpha', 'sin2_theta_w'],
            'notes': 'U(1) gauge coupling at M_Z'
        },
        
        'g_2': {
            'formula': 'sqrt(4*pi*alpha / sin2_theta_w)',
            'dependencies': ['alpha', 'sin2_theta_w'],
            'notes': 'SU(2) gauge coupling at M_Z'
        },
        
        'lambda_qcd': {
            'formula': 'M_Z * exp(-2*pi / (41/10 * alpha_s))',
            'dependencies': ['m_z', 'alpha_s'],
            'notes': 'QCD confinement scale'
        },
        
        'rho_parameter': {
            'formula': 'M_W^2 / (M_Z^2 * (1 - sin2_theta_w))',
            'dependencies': ['m_w', 'm_z', 'sin2_theta_w'],
            'notes': 'Electroweak rho parameter'
        },
        
        'e_knee': {
            'formula': 'M_Pl * phi_0^20',
            'dependencies': ['m_planck', 'phi_0'],
            'notes': 'Cosmic ray knee energy'
        },
        
        'lambda_star': {
            'formula': '(hbar * G) / phi_0^2',
            'dependencies': ['phi_0'],
            'notes': 'Cascade-horizon length, using hbar*G = 2.612e-70 m³'
        },
        
        't_gamma_0': {
            'formula': '1.416784e32 * phi_0^25 * 1e-16',
            'dependencies': ['phi_0'],
            'notes': 'CMB temperature from Planck temperature'
        },
        
        'f_b': {
            'formula': 'eta_b / (eta_b + 5*c_3^7)',
            'dependencies': ['eta_b', 'c_3'],
            'notes': 'Cosmic baryon fraction'
        },
        
        'rho_lambda': {
            'formula': 'M_Pl^4 * phi_0^97',
            'dependencies': ['m_planck', 'phi_0'],
            'notes': 'Vacuum energy density'
        },
        
        'sigma_m_nu': {
            'formula': '3 * m_nu',
            'dependencies': ['m_nu'],
            'notes': 'Sum of neutrino masses'
        },
        
        'tau_reio': {
            'formula': '2 * c_3 * phi_0^5',
            'dependencies': ['c_3', 'phi_0'],
            'notes': 'Optical depth to reionization'
        },
        
        'tau_star': {
            'formula': 'phi_0^3 * hbar / (4*pi*c_3*M_Pl)',
            'dependencies': ['phi_0', 'c_3', 'm_planck'],
            'notes': 'Planck-kink time'
        },
        
        'delta_nu_t': {
            'formula': 'beta_x * y_t^2',
            'dependencies': ['beta_x', 'y_t'],
            'notes': 'Neutrino-top split'
        },
        
        'm_nu': {
            'formula': 'Y^2 * v_h^2 / (phi_5 * M_Pl)',
            'dependencies': ['v_h', 'phi_0', 'm_planck', 'gamma_function'],
            'notes': 'Light neutrino mass with cascade phi_5'
        },
        
        'delta_gamma': {
            'formula': '(phi_0^6 / c_3) * alpha',
            'dependencies': ['phi_0', 'c_3', 'alpha'],
            'notes': 'Photon drift index'
        }
    }
    
    print("="*80)
    print("SYNCHRONIZING JSON FORMULAS WITH TOPOLOGICAL_CONSTANTS.PY")
    print("="*80)
    
    updated_count = 0
    
    for const_id, updates in formula_updates.items():
        json_file = data_dir / f"{const_id}.json"
        
        if not json_file.exists():
            print(f"⚠️  {const_id}.json not found, skipping")
            continue
        
        try:
            # Load existing JSON
            with open(json_file, 'r') as f:
                data = json.load(f)
            
            # Update formula and dependencies
            old_formula = data.get('formula', '')
            data['formula'] = updates['formula']
            
            if 'dependencies' in updates:
                data['dependencies'] = updates['dependencies']
            
            if 'notes' in updates and 'metadata' in data:
                data['metadata']['notes'] = updates['notes']
            
            # Calculate the value using topological_constants.py for verification
            try:
                # Get the calculated value from topological_constants
                if const_id == 'eta_b':
                    calc_value = tc.eta_B()
                elif const_id == 'm_p':
                    calc_value = tc.m_p_MeV()
                elif const_id == 'sin2_theta_w':
                    calc_value = tc.sin2_theta_W_MZ()
                elif const_id == 'v_cb':
                    calc_value = tc.V_cb()
                elif const_id == 'm_b':
                    calc_value = tc.m_b_GeV()
                elif const_id == 'm_c':
                    calc_value = tc.m_c_GeV()
                elif const_id == 'm_u':
                    calc_value = tc.m_u_MeV()
                elif const_id == 'm_w':
                    calc_value = tc.M_W_GeV()
                elif const_id == 'm_z':
                    calc_value = tc.M_Z
                elif const_id == 'n_s':
                    calc_value = tc.n_s()
                elif const_id == 'y_e':
                    calc_value = tc.y_e()
                elif const_id == 'y_t':
                    calc_value = tc.y_t()
                elif const_id == 'g_1':
                    calc_value = tc.g1_at_MZ() if hasattr(tc, 'g1_at_MZ') else None
                elif const_id == 'g_2':
                    calc_value = tc.g2_at_MZ() if hasattr(tc, 'g2_at_MZ') else None
                elif const_id == 'lambda_qcd':
                    calc_value = tc.Lambda_QCD() if hasattr(tc, 'Lambda_QCD') else None
                elif const_id == 'rho_parameter':
                    calc_value = tc.rho_parameter() if hasattr(tc, 'rho_parameter') else None
                else:
                    calc_value = None
                
                if calc_value is not None:
                    data['calculated_value'] = float(calc_value)
                    
                    # Update experimental value if available
                    if 'sources' in data and len(data['sources']) > 0:
                        exp_value = data['sources'][0].get('value')
                        if exp_value:
                            rel_error = abs(calc_value - exp_value) / exp_value if exp_value != 0 else 0
                            data['relative_error'] = float(rel_error)
                            data['accuracy_met'] = bool(rel_error < 0.01)  # 1% threshold
                    
                    print(f"✅ {const_id}: Updated formula and verified value = {calc_value:.6e}")
                else:
                    print(f"✓ {const_id}: Updated formula (no verification available)")
                    
            except Exception as e:
                print(f"✓ {const_id}: Updated formula (verification failed: {e})")
            
            # Write back updated JSON
            with open(json_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            updated_count += 1
            
            if old_formula != updates['formula']:
                print(f"   Old: {old_formula[:60]}...")
                print(f"   New: {updates['formula'][:60]}...")
            
        except Exception as e:
            print(f"❌ Error updating {const_id}: {e}")
    
    print("\n" + "="*80)
    print(f"SUMMARY: Updated {updated_count} JSON files")
    print("="*80)
    print("\nNext steps:")
    print("1. Run: python constants/scripts/generate_notebooks.py")
    print("2. Run: python constants/docker_execute_notebooks.py")
    print("3. Refresh the frontend to see updated values")
    
    return updated_count

def verify_with_topological_constants():
    """Compare notebook results with topological_constants.py calculations"""
    
    tc = TopologicalConstants()
    results_dir = Path(__file__).parent.parent / 'constants' / 'results' / 'json'
    
    print("\n" + "="*80)
    print("VERIFICATION: Comparing Notebook Results with TopologicalConstants")
    print("="*80)
    
    comparisons = {
        'eta_b': tc.eta_B(),
        'm_p': tc.m_p_MeV(),
        'sin2_theta_w': tc.sin2_theta_W_MZ(),
        'v_cb': tc.V_cb(),
        'm_b': tc.m_b_GeV(),
        'm_c': tc.m_c_GeV(),
        'm_u': tc.m_u_MeV(),
        'm_w': tc.M_W_GeV(),
        'm_z': tc.M_Z,
        'n_s': tc.n_s(),
        'y_e': tc.y_e(),
        'y_t': tc.y_t()
    }
    
    for const_id, python_value in comparisons.items():
        result_file = results_dir / f"{const_id}_result.json"
        
        if result_file.exists():
            with open(result_file, 'r') as f:
                result = json.load(f)
            
            notebook_value = result.get('calculated_value')
            if notebook_value is not None:
                diff = abs(notebook_value - python_value)
                rel_diff = diff / python_value if python_value != 0 else diff
                
                if rel_diff < 1e-6:
                    print(f"✅ {const_id}: MATCH (diff < 1e-6)")
                else:
                    print(f"⚠️  {const_id}: MISMATCH")
                    print(f"   Notebook: {notebook_value:.6e}")
                    print(f"   Python:   {python_value:.6e}")
                    print(f"   Rel Diff: {rel_diff:.2e}")
            else:
                print(f"❌ {const_id}: No notebook result found")
        else:
            print(f"❌ {const_id}: Result file not found")

if __name__ == "__main__":
    # Update JSON formulas
    updated = update_json_formulas()
    
    # Optionally verify results (only if result files exist)
    # verify_with_topological_constants()