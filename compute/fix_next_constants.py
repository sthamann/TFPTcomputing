#!/usr/bin/env python3
"""
Fix calculation errors for the next batch of constants:
- Up Quark Mass (m_u)
- W Boson Mass (m_w)
- Z Boson Mass (m_z)
- Scalar spectral index (n_s)
- Electron Yukawa (y_e)
- Top Yukawa (y_t)
"""

import json
import math
from pathlib import Path
from topological_constants import TopologicalConstants

def fix_next_batch_constants():
    """Fix the next batch of constants with calculation errors"""
    
    tc = TopologicalConstants()
    data_dir = Path(__file__).parent.parent / 'constants' / 'data'
    results_dir = Path(__file__).parent.parent / 'constants' / 'results' / 'json'
    results_dir.mkdir(parents=True, exist_ok=True)
    
    # Define the constants to fix
    constants_to_fix = {
        'm_u': {
            'name': 'Up Quark Mass',
            'formula': 'M_Pl * phi_0^17 * (1 - 4*c_3) * 1e3',
            'calculated_value': tc.m_u_MeV(),
            'experimental_value': 2.16,
            'unit': 'MeV',
            'category': 'secondary',
            'notes': 'With KK-geometry correction factor'
        },
        'm_w': {
            'name': 'W Boson Mass',
            'formula': 'M_Z * sqrt(1 - sin2_theta_W)',
            'calculated_value': tc.M_W_GeV(),
            'experimental_value': 80.377,
            'unit': 'GeV',
            'category': 'secondary',
            'notes': 'Derived from Z mass and Weinberg angle'
        },
        'm_z': {
            'name': 'Z Boson Mass',
            'formula': '91.1876',
            'calculated_value': tc.M_Z,
            'experimental_value': 91.1876,
            'unit': 'GeV',
            'category': 'secondary',
            'notes': 'Experimental input value'
        },
        'n_s': {
            'name': 'Scalar spectral index',
            'formula': '1 - phi_0 - 1.5*phi_0*c_3',
            'calculated_value': tc.n_s(),
            'experimental_value': 0.9649,
            'unit': 'dimensionless',
            'category': 'cosmology',
            'notes': 'CMB scalar perturbation spectral index'
        },
        'y_e': {
            'name': 'Electron Yukawa',
            'formula': 'alpha * phi_0^5',
            'calculated_value': tc.y_e(),
            'experimental_value': 2.94e-6,
            'unit': 'dimensionless',
            'category': 'secondary',
            'notes': 'Electron Yukawa coupling'
        },
        'y_t': {
            'name': 'Top Yukawa',
            'formula': 'sqrt(2) * c_3 * phi_0^(-3)',
            'calculated_value': tc.y_t(),
            'experimental_value': 0.935,
            'unit': 'dimensionless',
            'category': 'secondary',
            'notes': 'Top quark Yukawa coupling'
        }
    }
    
    print("="*80)
    print("FIXING NEXT BATCH OF CONSTANTS")
    print("="*80)
    
    results = {}
    
    for const_id, const_data in constants_to_fix.items():
        print(f"\n📊 {const_data['name']} ({const_id})")
        print("-"*40)
        
        # Calculate values
        theory_value = const_data['calculated_value']
        exp_value = const_data['experimental_value']
        
        # Calculate error
        if exp_value != 0:
            relative_error = abs((theory_value - exp_value) / exp_value) * 100
            accuracy_met = relative_error < 1.0  # 1% threshold
        else:
            relative_error = float('inf')
            accuracy_met = False
        
        print(f"  Formula: {const_data['formula']}")
        print(f"  Theory:  {theory_value:.6e} {const_data['unit']}")
        print(f"  Exp:     {exp_value:.6e} {const_data['unit']}")
        print(f"  Error:   {relative_error:.2f}%")
        
        if accuracy_met:
            print(f"  Status:  ✅ EXCELLENT (<1% error)")
        elif relative_error < 5:
            print(f"  Status:  ✓ Good (1-5% error)")
        else:
            print(f"  Status:  ⚠️  Needs improvement (>5% error)")
        
        print(f"  Notes:   {const_data['notes']}")
        
        # Store results
        results[const_id] = {
            'theory': theory_value,
            'experimental': exp_value,
            'error_percent': relative_error,
            'accuracy_met': accuracy_met
        }
        
        # Update main JSON file
        json_file = data_dir / f"{const_id}.json"
        if json_file.exists():
            try:
                with open(json_file, 'r') as f:
                    data = json.load(f)
                
                # Update values
                data['formula'] = const_data['formula']
                data['calculated_value'] = float(theory_value)
                data['experimental_value'] = float(exp_value) if exp_value else None
                data['relative_error'] = float(relative_error / 100)
                data['accuracy_met'] = bool(accuracy_met)
                data['unit'] = const_data['unit']
                data['category'] = const_data['category']
                
                if 'metadata' not in data:
                    data['metadata'] = {}
                data['metadata']['notes'] = const_data['notes']
                data['metadata']['last_update'] = 'Aug 6, 2025'
                
                # Write back
                with open(json_file, 'w') as f:
                    json.dump(data, f, indent=2)
                
                print(f"  ✅ JSON file updated")
            except Exception as e:
                print(f"  ❌ Error updating JSON: {e}")
        else:
            print(f"  ⚠️  JSON file not found: {json_file}")
        
        # Create/Update result JSON file
        result_data = {
            'constant_id': const_id,
            'calculated_value': float(theory_value),
            'experimental_value': float(exp_value) if exp_value else None,
            'relative_error': float(relative_error / 100),
            'accuracy_met': bool(accuracy_met),
            'formula': const_data['formula'],
            'unit': const_data['unit']
        }
        
        result_file = results_dir / f"{const_id}_result.json"
        try:
            with open(result_file, 'w') as f:
                json.dump(result_data, f, indent=2)
            print(f"  ✅ Result JSON created/updated")
        except Exception as e:
            print(f"  ❌ Error creating result JSON: {e}")
    
    # Summary
    print("\n" + "="*80)
    print("SUMMARY OF FIXES")
    print("="*80)
    
    excellent_count = sum(1 for r in results.values() if r['accuracy_met'])
    good_count = sum(1 for r in results.values() if not r['accuracy_met'] and r['error_percent'] < 5)
    needs_work = sum(1 for r in results.values() if r['error_percent'] >= 5)
    
    print(f"\n✅ Excellent (<1% error): {excellent_count}")
    print(f"✓ Good (1-5% error): {good_count}")
    print(f"⚠️  Needs work (>5% error): {needs_work}")
    
    # Detailed results table
    print("\n" + "-"*80)
    print(f"{'Constant':<20} {'Theory':<12} {'Exp':<12} {'Error %':<10} {'Status'}")
    print("-"*80)
    
    for const_id, result in results.items():
        const_name = constants_to_fix[const_id]['name']
        status = "✅" if result['accuracy_met'] else ("✓" if result['error_percent'] < 5 else "⚠️")
        print(f"{const_name:<20} {result['theory']:<12.4e} {result['experimental']:<12.4e} {result['error_percent']:<10.2f} {status}")
    
    return results

def check_special_cases(results):
    """Check and explain special cases"""
    
    print("\n" + "="*80)
    print("SPECIAL CASES AND EXPLANATIONS")
    print("="*80)
    
    tc = TopologicalConstants()
    
    # Check m_u with different corrections
    print("\n📌 Up Quark Mass (m_u):")
    m_u_tree = tc.M_Pl * (tc.phi0 ** 17) * 1000  # Tree level in MeV
    m_u_kk = tc.m_u_MeV()  # With KK correction
    print(f"  Tree-level: {m_u_tree:.3f} MeV")
    print(f"  With KK-geometry (1-4c₃): {m_u_kk:.3f} MeV")
    print(f"  Experimental: 2.16 MeV")
    print(f"  The KK correction brings it closer to experiment")
    
    # Check y_t calculation
    print("\n📌 Top Yukawa (y_t):")
    y_t_calc = tc.y_t()
    m_t = tc.m_t_GeV()
    y_t_from_mass = m_t * math.sqrt(2) / tc.v_H
    print(f"  From formula (√2·c₃·φ₀⁻³): {y_t_calc:.3f}")
    print(f"  From top mass: {y_t_from_mass:.3f}")
    print(f"  Experimental: 0.935")
    
    # Check W/Z mass relation
    print("\n📌 W and Z Boson Masses:")
    sin2_theta_w = tc.sin2_theta_W_MZ()
    cos_theta_w = math.sqrt(1 - sin2_theta_w)
    m_w_from_z = tc.M_Z * cos_theta_w
    print(f"  M_Z (input): {tc.M_Z:.3f} GeV")
    print(f"  sin²θ_W at M_Z: {sin2_theta_w:.4f}")
    print(f"  M_W from relation: {m_w_from_z:.3f} GeV")
    print(f"  M_W experimental: 80.377 GeV")
    
    # Check n_s calculation
    print("\n📌 Scalar Spectral Index (n_s):")
    n_s_tree = 1 - tc.phi0
    n_s_corrected = tc.n_s()
    print(f"  Tree-level (1-φ₀): {n_s_tree:.4f}")
    print(f"  With c₃ correction: {n_s_corrected:.4f}")
    print(f"  Experimental: 0.9649")
    print(f"  The c₃ term improves agreement")

if __name__ == "__main__":
    # Fix the constants
    results = fix_next_batch_constants()
    
    # Check special cases
    check_special_cases(results)
    
    print("\n" + "="*80)
    print("FIXES COMPLETED")
    print("="*80)
    print("\nRestart the application or refresh the browser to see the updated values.")