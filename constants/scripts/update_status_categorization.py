#!/usr/bin/env python3
"""
Update all constant JSON files with status categorization based on accuracy.
Status levels:
- core: Fundamental topological constants (c₃, φ₀, α)
- validated: |Δ| ≤ 10% from experimental value
- speculative: |Δ| > 10% or no experimental comparison
"""

import json
from pathlib import Path
import math

def calculate_deviation(calculated, experimental):
    """Calculate relative deviation between values."""
    if experimental == 0:
        return float('inf') if calculated != 0 else 0
    return abs((calculated - experimental) / experimental)

def determine_status(constant_data, result_data=None):
    """Determine status based on accuracy criteria."""
    const_id = constant_data['id']
    
    # Core topological constants
    if const_id in ['c_3', 'phi_0', 'alpha']:
        return 'core'
    
    # Check if we have experimental values to compare
    if 'sources' not in constant_data or not constant_data['sources']:
        return 'speculative'
    
    # Get experimental value
    experimental = None
    for source in constant_data['sources']:
        if 'value' in source:
            experimental = source['value']
            break
    
    if experimental is None:
        return 'speculative'
    
    # Get calculated value from result if available
    calculated = None
    if result_data and 'value' in result_data:
        calculated = result_data['value']
    
    if calculated is None:
        return 'speculative'
    
    # Calculate deviation
    try:
        deviation = calculate_deviation(calculated, experimental)
        
        # Validated if within 10% (0.10)
        if deviation <= 0.10:
            return 'validated'
        else:
            return 'speculative'
    except:
        return 'speculative'

def categorize_constant(constant_data):
    """Assign proper category based on physics domain."""
    const_id = constant_data['id']
    
    # Category mapping
    categories = {
        'fundamental_topology': ['c_3', 'phi_0', 'alpha'],
        'gauge': ['alpha_s', 'sin2_theta_w', 'g_1', 'g_2', 'theta_qcd', 'beta_x'],
        'flavour': ['m_e', 'm_mu', 'm_tau', 'm_u', 'm_d', 'm_s', 'm_c', 'm_b', 'm_t',
                   'v_us_v_ud', 'v_cb', 'v_td_v_ts', 'theta_c', 'y_e', 'y_t'],
        'electroweak': ['v_h', 'v_H', 'm_w', 'm_z', 'rho_parameter', 'g_f'],
        'scale_hierarchy': ['lambda_qcd', 'lambda_qg', 'e_knee', 'm_planck', 'lambda_star'],
        'cosmology': ['rho_lambda', 'w_de', 'omega_b', 'n_s', 'r_tensor', 'tau_reio',
                     'alpha_d', 'f_b', 'eta_b', 't_gamma_0', 't_nu'],
        'anomalies': ['delta_a_mu', 'a_p', 'delta_gamma', 'delta_nu_t'],
        'lifetimes': ['tau_mu', 'tau_tau', 'tau_star'],
        'derived': ['epsilon_k', 'c_4', 'z_0', 'gamma_function', 'm_nu', 'sigma_m_nu',
                   'm_s_m_d_ratio', 'mu_p', 'mu_p_mu_n', 'delta_m_n_p', 'm_p',
                   'f_pi_lambda_qcd']
    }
    
    # Find category for constant
    for category, constants in categories.items():
        if const_id in constants:
            return category
    
    # Default category
    return constant_data.get('category', 'derived')

def update_constant_file(json_path, results_dir):
    """Update a single constant JSON file with status and category."""
    # Load constant data
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    const_id = data['id']
    
    # Try to load result data
    result_data = None
    result_path = results_dir / 'json' / f'{const_id}_result.json'
    if result_path.exists():
        try:
            with open(result_path, 'r') as f:
                result_data = json.load(f)
        except:
            pass
    
    # Determine status
    status = determine_status(data, result_data)
    
    # Update category
    category = categorize_constant(data)
    
    # Update data
    data['status'] = status
    data['category'] = category
    
    # Save updated file
    with open(json_path, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    return const_id, status, category

def main():
    """Update all constant files."""
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent / 'data'
    results_dir = script_dir.parent / 'results'
    
    # Get all JSON files
    json_files = sorted(data_dir.glob('*.json'))
    
    print(f"Updating {len(json_files)} constant files with status categorization...")
    print("=" * 60)
    
    # Track statistics
    stats = {
        'core': [],
        'validated': [],
        'speculative': []
    }
    
    category_stats = {}
    
    for json_path in json_files:
        const_id, status, category = update_constant_file(json_path, results_dir)
        
        # Update statistics
        stats[status].append(const_id)
        
        if category not in category_stats:
            category_stats[category] = []
        category_stats[category].append(const_id)
        
        print(f"  {const_id:20s} → status: {status:12s} category: {category}")
    
    # Print summary
    print("\n" + "=" * 60)
    print("STATUS SUMMARY:")
    print(f"  Core:        {len(stats['core']):3d} constants")
    print(f"  Validated:   {len(stats['validated']):3d} constants")
    print(f"  Speculative: {len(stats['speculative']):3d} constants")
    
    print("\nCATEGORY SUMMARY:")
    for category, constants in sorted(category_stats.items()):
        print(f"  {category:20s}: {len(constants):3d} constants")
    
    print("\nCORE CONSTANTS:")
    for const_id in stats['core']:
        print(f"  - {const_id}")
    
    print("\nVALIDATED CONSTANTS (|Δ| ≤ 10%):")
    for const_id in sorted(stats['validated']):
        print(f"  - {const_id}")
    
    if len(stats['speculative']) > 0:
        print(f"\nSPECULATIVE CONSTANTS ({len(stats['speculative'])} total, showing first 20):")
        for const_id in sorted(stats['speculative'])[:20]:
            print(f"  - {const_id}")
    
    # Save summary report
    report = {
        'total': len(json_files),
        'status_counts': {
            'core': len(stats['core']),
            'validated': len(stats['validated']),
            'speculative': len(stats['speculative'])
        },
        'status_lists': stats,
        'category_counts': {cat: len(consts) for cat, consts in category_stats.items()},
        'category_lists': category_stats
    }
    
    report_path = script_dir.parent / 'status_categorization_report.json'
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\nDetailed report saved to: {report_path}")

if __name__ == '__main__':
    main()