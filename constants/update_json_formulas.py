#!/usr/bin/env python3
"""
Update existing JSON files with corrected formulas from the Topological Fixed Point Theory
"""

import json
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent / 'compute'))

from formulas_corrected import get_all_formulas, get_formula_for_constant
from topological_constants import TopologicalConstants

def update_constant_json(json_path, formula_info):
    """Update a single JSON file with corrected formula"""
    try:
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        # Update formula
        if 'formula' in formula_info:
            data['formula'] = formula_info['formula']
        
        # Update latex if available
        if 'latex' in formula_info:
            if 'metadata' not in data:
                data['metadata'] = {}
            data['metadata']['latex'] = formula_info['latex']
        
        # Update category
        if 'category' in formula_info:
            data['category'] = formula_info['category']
        
        # Update dependencies if specified
        if 'dependencies' in formula_info:
            data['dependencies'] = formula_info['dependencies']
        
        # Add correction factor info if applicable
        if 'correction' in formula_info:
            if 'metadata' not in data:
                data['metadata'] = {}
            data['metadata']['correction_factor'] = formula_info['correction']
        
        # Write back
        with open(json_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        return True
    except Exception as e:
        print(f"Error updating {json_path}: {e}")
        return False

def main():
    """Update all constant JSON files with corrected formulas"""
    
    # Get all formulas
    all_formulas = get_all_formulas()
    
    # Path to constants data directory
    data_dir = Path(__file__).parent / 'data'
    
    if not data_dir.exists():
        print(f"Error: Data directory {data_dir} not found")
        return 1
    
    # Statistics
    updated = 0
    skipped = 0
    errors = 0
    
    # Process each JSON file
    for json_file in data_dir.glob('*.json'):
        constant_id = json_file.stem
        
        # Find formula for this constant
        formula_info = None
        category_name = None
        
        for category, constants in all_formulas.items():
            if constant_id in constants:
                formula_info = constants[constant_id]
                category_name = category
                break
        
        if formula_info:
            print(f"Updating {constant_id} ({category_name})...")
            if update_constant_json(json_file, formula_info):
                updated += 1
            else:
                errors += 1
        else:
            print(f"Skipping {constant_id} (no updated formula)")
            skipped += 1
    
    # Also calculate and display theoretical values
    print("\n" + "="*60)
    print("THEORETICAL VALUES FROM TOPOLOGICAL FIXED POINT THEORY")
    print("="*60)
    
    calc = TopologicalConstants()
    results = calc.calculate_all()
    
    # Map between our calculation results and constant IDs
    result_mapping = {
        'alpha_G': 'alpha_g',
        'sin2_theta_w': 'sin2_theta_w',
        'm_p_GeV': 'm_p',
        'm_e_MeV': 'm_e',
        'm_mu_MeV': 'm_mu',
        'm_tau_GeV': 'm_tau',
        'm_u_MeV': 'm_u',
        'm_c_GeV': 'm_c',
        'm_b_GeV': 'm_b',
        'm_t_GeV': 'm_t',
        'theta_c_rad': 'theta_c',
        'V_cb': 'v_cb',
        'V_us_V_ud': 'v_us_v_ud',
        'V_td_V_ts': 'v_td_v_ts',
        'M_W_GeV': 'm_w',
        'm_nu_eV': 'm_nu',
        'Omega_b': 'omega_b',
        'r_tensor': 'r_tensor',
        'n_s': 'n_s',
        'eta_B': 'eta_b',
        'alpha_s_MZ': 'alpha_s',
        'Lambda_QCD_MeV': 'lambda_qcd',
        'theta_QCD': 'theta_qcd',
        'epsilon_K': 'epsilon_k'
    }
    
    print("\nCalculated values to update:")
    for calc_key, const_id in result_mapping.items():
        if calc_key in results:
            value = results[calc_key]
            json_path = data_dir / f"{const_id}.json"
            if json_path.exists():
                print(f"  {const_id}: {value:.6g}")
                # Optionally update the theoretical value in metadata
                try:
                    with open(json_path, 'r') as f:
                        data = json.load(f)
                    if 'metadata' not in data:
                        data['metadata'] = {}
                    data['metadata']['theoretical_value'] = value
                    with open(json_path, 'w') as f:
                        json.dump(data, f, indent=2)
                except Exception as e:
                    print(f"    Error updating theoretical value: {e}")
    
    print(f"\n📊 Summary:")
    print(f"   ✅ Updated: {updated}")
    print(f"   ⏭️  Skipped: {skipped}")
    print(f"   ❌ Errors: {errors}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())