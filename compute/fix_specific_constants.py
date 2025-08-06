#!/usr/bin/env python3
"""
Fix specific calculation errors for critical constants:
- Baryon Asymmetry (η_B)
- Proton Mass (m_p)
- Weinberg Angle (sin²θ_W)
- CKM Matrix Element V_cb
- Bottom Quark Mass (m_b)
- Charm Quark Mass (m_c)
"""

import json
import math
from pathlib import Path
from topological_constants import TopologicalConstants

def analyze_and_fix_constants():
    """Analyze and fix specific constants with calculation errors"""
    
    tc = TopologicalConstants()
    data_dir = Path(__file__).parent.parent / 'constants' / 'data'
    
    # Define the constants to fix with their correct formulas and calculations
    constants_to_fix = {
        'eta_b': {
            'name': 'Baryon Asymmetry',
            'formula': '4 * c_3^7',
            'calculated_value': tc.eta_B(),
            'experimental_value': 6.12e-10,
            'unit': 'dimensionless',
            'category': 'primary',
            'notes': 'Pure topological prediction from c₃'
        },
        'm_p': {
            'name': 'Proton Mass',
            'formula': 'M_Pl * phi_0^15',
            'calculated_value': tc.m_p_MeV(),
            'experimental_value': 938.272,
            'unit': 'MeV',
            'category': 'primary',
            'notes': 'Direct 15-step ladder prediction'
        },
        'sin2_theta_w': {
            'name': 'Weinberg Angle',
            'formula': 'phi_0 + RG_corrections',
            'calculated_value': tc.sin2_theta_W_MZ(),  # Use M_Z value with RG
            'experimental_value': 0.23121,
            'unit': 'dimensionless',
            'category': 'primary',
            'notes': 'With RG running from high scale to M_Z'
        },
        'v_cb': {
            'name': 'CKM Matrix Element V_cb',
            'formula': '(3/4) * phi_0',
            'calculated_value': tc.V_cb(),
            'experimental_value': 0.0409,
            'unit': 'dimensionless',
            'category': 'primary',
            'notes': 'Geometric factor times φ₀'
        },
        'm_b': {
            'name': 'Bottom Quark Mass',
            'formula': 'M_Pl * phi_0^15 / sqrt(c_3) * (1 - 2*phi_0)',
            'calculated_value': tc.m_b_GeV(),
            'experimental_value': 4.18,
            'unit': 'GeV',
            'category': 'secondary',
            'notes': 'With VEV backreaction correction'
        },
        'm_c': {
            'name': 'Charm Quark Mass',
            'formula': 'M_Pl * phi_0^16 / c_3',
            'calculated_value': tc.m_c_GeV(),
            'experimental_value': 1.27,
            'unit': 'GeV',
            'category': 'secondary',
            'notes': 'Includes c₃ suppression'
        }
    }
    
    print("="*80)
    print("ANALYZING AND FIXING SPECIFIC CONSTANTS")
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
            accuracy_met = relative_error < 1.0  # 1% threshold for these critical constants
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
        
        # Update JSON file
        json_file = data_dir / f"{const_id}.json"
        if json_file.exists():
            try:
                with open(json_file, 'r') as f:
                    data = json.load(f)
                
                # Update values (ensure JSON serializable)
                data['formula'] = const_data['formula']
                data['calculated_value'] = float(theory_value)
                data['experimental_value'] = float(exp_value)
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

def suggest_improvements(results):
    """Suggest improvements for constants with large errors"""
    
    print("\n" + "="*80)
    print("SUGGESTED IMPROVEMENTS")
    print("="*80)
    
    improvements = {
        'sin2_theta_w': {
            'issue': 'Tree-level value φ₀ = 0.0532 vs experimental 0.2312 at M_Z',
            'solution': 'Apply RG running from high scale to M_Z',
            'formula': 'sin²θ_W(M_Z) = sin²θ_W(M_GUT) + RG corrections',
            'expected': 'With proper RG evolution, should match within 1%'
        }
    }
    
    for const_id, improvement in improvements.items():
        if const_id in results and results[const_id]['error_percent'] > 5:
            print(f"\n📌 {const_id}:")
            print(f"  Issue:    {improvement['issue']}")
            print(f"  Solution: {improvement['solution']}")
            print(f"  Formula:  {improvement['formula']}")
            print(f"  Expected: {improvement['expected']}")

def check_rg_correction():
    """Check if RG running can fix the Weinberg angle"""
    
    print("\n" + "="*80)
    print("RG RUNNING CORRECTION FOR WEINBERG ANGLE")
    print("="*80)
    
    tc = TopologicalConstants()
    
    # Tree-level value
    sin2_theta_w_tree = tc.sin2_theta_W()
    print(f"\nTree-level (high scale): sin²θ_W = φ₀ = {sin2_theta_w_tree:.6f}")
    
    # Check if RG running is available
    if tc.rg:
        # Get value at M_Z
        sin2_theta_w_mz = tc.sin2_theta_W_at_scale(tc.M_Z)
        print(f"At M_Z with RG:         sin²θ_W = {sin2_theta_w_mz:.6f}")
        print(f"Experimental at M_Z:     sin²θ_W = 0.23121")
        
        error = abs((sin2_theta_w_mz - 0.23121) / 0.23121) * 100
        print(f"Error with RG:           {error:.2f}%")
        
        if error < 5:
            print("✅ RG running significantly improves agreement!")
        else:
            print("⚠️  RG running helps but additional corrections needed")
    else:
        print("⚠️  RG running module not available")
        print("    The tree-level value needs RG evolution to match experiment")

if __name__ == "__main__":
    # Fix the specific constants
    results = analyze_and_fix_constants()
    
    # Suggest improvements for large errors
    suggest_improvements(results)
    
    # Check RG corrections
    check_rg_correction()
    
    print("\n" + "="*80)
    print("FIXES COMPLETED")
    print("="*80)