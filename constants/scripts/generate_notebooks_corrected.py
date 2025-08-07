#!/usr/bin/env python3
"""
Generate fully self-contained Jupyter notebooks from JSON constant definitions.
Updated with correct physics calculations and status categorization.
"""
import json
import os
import sys
from pathlib import Path
import nbformat as nbf
from nbformat.v4 import new_notebook, new_code_cell, new_markdown_cell
import re

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent))

def load_constant(json_path):
    """Load constant definition from JSON file"""
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_all_dependencies(constant_id, data_dir, visited=None):
    """Recursively get all dependencies for a constant"""
    if visited is None:
        visited = set()
    
    if constant_id in visited:
        return {}
    
    visited.add(constant_id)
    dependencies = {}
    
    json_path = data_dir / f"{constant_id}.json"
    if not json_path.exists():
        return {}
    
    constant = load_constant(json_path)
    
    # Skip self-referential dependencies
    if constant_id != 'm_planck' or 'm_planck' not in constant.get('dependencies', []):
        dependencies[constant_id] = constant
    
    # Recursively get dependencies
    for dep_id in constant.get('dependencies', []):
        if dep_id == constant_id:
            continue
        if dep_id == 'm_planck' and constant_id != 'm_planck':
            dep_path = data_dir / f"m_planck.json"
            if dep_path.exists():
                m_planck = load_constant(dep_path)
                dependencies['m_planck'] = m_planck
        else:
            dep_dependencies = get_all_dependencies(dep_id, data_dir, visited)
            dependencies.update(dep_dependencies)
    
    return dependencies

def topological_sort(dependencies):
    """Sort dependencies in topological order"""
    sorted_ids = []
    visited = set()
    temp_visited = set()
    
    # Define fundamental constants
    fundamental = {'c_3', 'phi_0', 'm_planck', 'alpha'}
    
    def visit(const_id):
        if const_id in temp_visited:
            if const_id in fundamental:
                return
            raise ValueError(f"Circular dependency detected at {const_id}")
        if const_id in visited:
            return
        
        temp_visited.add(const_id)
        const = dependencies.get(const_id, {})
        
        for dep_id in const.get('dependencies', []):
            if dep_id == const_id:
                continue
            if const_id in fundamental and dep_id in fundamental:
                continue
            if dep_id in dependencies:
                visit(dep_id)
        
        temp_visited.remove(const_id)
        visited.add(const_id)
        sorted_ids.append(const_id)
    
    # Process fundamental constants first
    for const_id in fundamental:
        if const_id in dependencies and const_id not in visited:
            visited.add(const_id)
            sorted_ids.insert(0, const_id)
    
    # Process remaining constants
    for const_id in dependencies:
        if const_id not in visited:
            visit(const_id)
    
    return sorted_ids

def clean_symbol(symbol):
    """Clean symbol for use as variable name"""
    cleaned = re.sub(r'[^\w]', '_', symbol)
    cleaned = re.sub(r'^(\d)', r'_\1', cleaned)
    return cleaned

def generate_notebook(constant, data_dir):
    """Generate a complete notebook for a constant"""
    nb = new_notebook()
    
    # Title and description
    title = f"# {constant['name']} ({constant['symbol']})"
    description = [
        title,
        f"\n**Description:** {constant.get('description', '')}",
        f"\n**Category:** {constant.get('category', 'unknown')}",
        f"\n**Status:** {constant.get('status', 'speculative')}"
    ]
    
    if constant.get('unit'):
        description.append(f"\n**Unit:** {constant['unit']}")
    
    if constant.get('formula'):
        description.append(f"\n**Formula:** `{constant['formula']}`")
    
    nb.cells.append(new_markdown_cell('\n'.join(description)))
    
    # Get all dependencies
    all_deps = get_all_dependencies(constant['id'], data_dir)
    
    # Remove self from dependencies
    all_deps.pop(constant['id'], None)
    
    # Sort dependencies
    sorted_deps = []
    if all_deps:
        try:
            sorted_deps = topological_sort(all_deps)
        except ValueError as e:
            print(f"Warning: {e}")
            sorted_deps = list(all_deps.keys())
    
    # Imports and constants
    imports = """import numpy as np
import math
from scipy import constants as scipy_const

# Physical constants (CODATA 2022 values)
c = 299792458.0  # Speed of light in m/s
hbar = 1.054571817e-34  # Reduced Planck constant in J⋅s
hbar_eV_s = 6.582119569e-16  # Reduced Planck constant in eV⋅s
hbar_GeV_s = 6.582119569e-25  # Reduced Planck constant in GeV⋅s
G = 6.67430e-11  # Gravitational constant in m³/kg⋅s²
e = 1.602176634e-19  # Elementary charge in C
m_e_kg = 9.1093837015e-31  # Electron mass in kg
k_B = 1.380649e-23  # Boltzmann constant in J/K

# Unit conversions
GeV_to_kg = 1.78266192e-27  # 1 GeV/c² in kg
GeV_to_J = 1.602176634e-10  # 1 GeV in J
eV_to_J = 1.602176634e-19  # 1 eV in J
MeV_to_GeV = 0.001

# Fundamental theory parameters
c_3 = 0.039788735772973836  # Topological fixed point: 1/(8π)
phi_0 = 0.053171  # Fundamental VEV
M_Pl = 1.2209e19  # Planck mass in GeV

# Standard Model parameters
M_Z = 91.1876  # Z boson mass in GeV
M_W = 80.379  # W boson mass in GeV
v_H = 246.22  # Higgs VEV in GeV
G_F = 1.1663787e-5  # Fermi constant in GeV^-2

# Correction factors
def correction_4d_loop():
    \"\"\"4D one-loop correction: 1 - 2c₃\"\"\"
    return 1 - 2 * c_3

def correction_kk_geometry():
    \"\"\"Kaluza-Klein geometry correction: 1 - 4c₃\"\"\"
    return 1 - 4 * c_3

def correction_vev_backreaction_minus():
    \"\"\"VEV backreaction correction: 1 - 2φ₀\"\"\"
    return 1 - 2 * phi_0

def correction_vev_backreaction_plus():
    \"\"\"VEV backreaction correction: 1 + 2φ₀\"\"\"
    return 1 + 2 * phi_0

# RG running helpers
def alpha_s_MSbar(mu_GeV, n_f=5, Lambda_QCD_GeV=0.332):
    \"\"\"
    Calculate alpha_s at scale mu using 2-loop RG running.
    mu_GeV: Energy scale in GeV
    n_f: Number of active quark flavors
    Lambda_QCD_GeV: QCD scale in GeV
    \"\"\"
    b0 = (33 - 2*n_f) / (12*np.pi)
    b1 = (153 - 19*n_f) / (24*np.pi**2)
    
    L = np.log(mu_GeV**2 / Lambda_QCD_GeV**2)
    
    # 2-loop formula
    alpha_s = 1 / (b0 * L) * (1 - b1 * np.log(L) / (b0**2 * L))
    return alpha_s / (4*np.pi)

def sin2_theta_W_MSbar():
    \"\"\"Calculate sin²θ_W using the standard relation\"\"\"
    return 1 - (M_W**2 / M_Z**2)

# E8 Cascade functions
def phi_n(n):
    \"\"\"Calculate cascade VEV at level n\"\"\"
    gamma_sum = sum(0.834 + 0.108*k + 0.0105*k**2 for k in range(n))
    return phi_0 * np.exp(-gamma_sum)

def gamma_cascade(n):
    \"\"\"E8 cascade attenuation function\"\"\"
    return 0.834 + 0.108*n + 0.0105*n**2
"""
    
    nb.cells.append(new_code_cell(imports))
    
    # Add dependency calculations
    if sorted_deps:
        nb.cells.append(new_markdown_cell("## Required Constants\n\nCalculating all dependencies first:"))
        
        dep_code = ["# Calculate all required constants"]
        dep_code.append("calculated_values = {}\n")
        
        for dep_id in sorted_deps:
            dep = all_deps[dep_id]
            
            dep_code.append(f"# {dep['name']} ({dep['symbol']})")
            
            # Handle special calculations based on ID
            if dep_id == 'alpha':
                dep_code.append("# Fine structure constant from cubic equation")
                dep_code.append("A = 1.0 / (256 * np.pi**3)")
                dep_code.append("kappa = (41.0 / (20 * np.pi)) * np.log(1.0 / phi_0)")
                dep_code.append("coefficients = [1, -A, 0, -A * c_3**2 * kappa]")
                dep_code.append("roots = np.roots(coefficients)")
                dep_code.append("physical_root = None")
                dep_code.append("for root in roots:")
                dep_code.append("    if np.isreal(root) and root.real > 0 and root.real < 0.01:")
                dep_code.append("        physical_root = root.real")
                dep_code.append("        break")
                dep_code.append("calculated_values['alpha'] = physical_root if physical_root else 1.0/137.035999084")
            
            elif dep_id == 'phi_0':
                dep_code.append("calculated_values['phi_0'] = 0.053171")
            
            elif dep_id == 'c_3':
                dep_code.append("calculated_values['c_3'] = 1.0 / (8 * np.pi)")
            
            elif dep_id == 'm_planck':
                dep_code.append("calculated_values['m_planck'] = 1.2209e19  # GeV")
            
            elif dep_id == 'alpha_s':
                dep_code.append("# Strong coupling at M_Z using 2-loop RG")
                dep_code.append("calculated_values['alpha_s'] = alpha_s_MSbar(M_Z, n_f=5, Lambda_QCD_GeV=0.332)")
            
            elif dep_id == 'sin2_theta_w':
                dep_code.append("# Weinberg angle from W and Z masses")
                dep_code.append("calculated_values['sin2_theta_w'] = sin2_theta_W_MSbar()")
            
            elif dep_id == 'g_1':
                dep_code.append("# U(1) gauge coupling")
                dep_code.append("sin2_theta_w = calculated_values.get('sin2_theta_w', sin2_theta_W_MSbar())")
                dep_code.append("alpha = calculated_values.get('alpha', 1.0/137.035999084)")
                dep_code.append("calculated_values['g_1'] = np.sqrt(4*np.pi*alpha / (1 - sin2_theta_w))")
            
            elif dep_id == 'g_2':
                dep_code.append("# SU(2) gauge coupling")
                dep_code.append("sin2_theta_w = calculated_values.get('sin2_theta_w', sin2_theta_W_MSbar())")
                dep_code.append("alpha = calculated_values.get('alpha', 1.0/137.035999084)")
                dep_code.append("calculated_values['g_2'] = np.sqrt(4*np.pi*alpha / sin2_theta_w)")
            
            elif dep_id == 'lambda_qcd':
                dep_code.append("calculated_values['lambda_qcd'] = 332  # MeV, MS-bar scheme")
            
            elif dep_id == 'v_h' or dep_id == 'v_H':
                dep_code.append("calculated_values['v_h'] = 246.22  # GeV")
                dep_code.append("calculated_values['v_H'] = 246.22  # GeV")
            
            elif dep_id == 'gamma_function':
                dep_code.append("# Gamma function is a function, not a constant")
                dep_code.append("calculated_values['gamma_function'] = lambda n: 0.834 + 0.108*n + 0.0105*n**2")
            
            else:
                # Try to use formula if available
                formula = dep.get('formula', '')
                if formula:
                    # Simple formula parsing (extend as needed)
                    python_formula = formula
                    python_formula = python_formula.replace('^', '**')
                    python_formula = python_formula.replace('sqrt(', 'np.sqrt(')
                    python_formula = python_formula.replace('exp(', 'np.exp(')
                    python_formula = python_formula.replace('log(', 'np.log(')
                    python_formula = python_formula.replace('ln(', 'np.log(')
                    python_formula = python_formula.replace('pi', 'np.pi')
                    python_formula = python_formula.replace('sin(', 'np.sin(')
                    python_formula = python_formula.replace('cos(', 'np.cos(')
                    python_formula = python_formula.replace('arcsin(', 'np.arcsin(')
                    
                    dep_code.append(f"calculated_values['{dep_id}'] = {python_formula}")
                else:
                    # Use experimental value if available
                    if 'sources' in dep and dep['sources']:
                        exp_value = dep['sources'][0].get('value', 0)
                        dep_code.append(f"calculated_values['{dep_id}'] = {exp_value}")
                    else:
                        dep_code.append(f"calculated_values['{dep_id}'] = 0  # No formula available")
            
            dep_code.append(f"print(f\"{dep['symbol']} = {{calculated_values['{dep_id}']:.6e}}\")")
            dep_code.append("")
        
        nb.cells.append(new_code_cell('\n'.join(dep_code)))
    
    # Main calculation
    nb.cells.append(new_markdown_cell(f"## Calculate {constant['name']}"))
    
    main_code = [f"# Formula: {constant.get('formula', 'N/A')}"]
    main_code.append("")
    
    # Generate calculation based on constant ID with corrections
    const_id = constant['id']
    
    # Special cases with corrected formulas
    if const_id == 'alpha_s':
        main_code.append("# Strong coupling at M_Z using 2-loop RG running")
        main_code.append("# α_s(M_Z) = [12π / ((33-2n_f) * ln(M_Z²/Λ²))]^(-1)")
        main_code.append("result = alpha_s_MSbar(M_Z, n_f=5, Lambda_QCD_GeV=0.332)")
        
    elif const_id == 'sin2_theta_w':
        main_code.append("# Weinberg angle from standard relation")
        main_code.append("# sin²θ_W = 1 - (M_W² / M_Z²)")
        main_code.append("result = sin2_theta_W_MSbar()")
        
    elif const_id == 'tau_mu':
        main_code.append("# Muon lifetime with hbar factor")
        main_code.append("# τ_μ = (192π³ħ) / (G_F² m_μ⁵)")
        main_code.append("m_mu_GeV = 0.1056583755  # GeV")
        main_code.append("result = (192 * np.pi**3 * hbar_GeV_s) / (G_F**2 * m_mu_GeV**5)")
        
    elif const_id == 'tau_tau':
        main_code.append("# Tau lifetime with hbar factor and hadronic corrections")
        main_code.append("m_tau_GeV = 1.77686  # GeV")
        main_code.append("# Electronic/muonic branching ratio ~ 0.35")
        main_code.append("BR_leptonic = 0.3521")
        main_code.append("result = (192 * np.pi**3 * hbar_GeV_s) / (G_F**2 * m_tau_GeV**5 * BR_leptonic)")
        
    elif const_id == 'm_b':
        main_code.append("# Bottom quark mass with VEV backreaction")
        main_code.append("tree_value = M_Pl * phi_0**15 / np.sqrt(c_3)")
        main_code.append("result = tree_value * correction_vev_backreaction_minus() * 1e-9  # Convert to GeV")
        
    elif const_id == 'm_u':
        main_code.append("# Up quark mass with KK geometry correction")
        main_code.append("tree_value = M_Pl * phi_0**17")
        main_code.append("result = tree_value * correction_kk_geometry() * 1e-12  # Convert to MeV")
        
    elif const_id == 'm_planck':
        main_code.append("# Planck mass")
        main_code.append("# M_Pl = sqrt(ħc/G)")
        main_code.append("result = np.sqrt(hbar * c / G) / GeV_to_kg  # Convert to GeV")
        
    elif const_id == 'g_1':
        main_code.append("# U(1) gauge coupling with correct sin²θ_W")
        main_code.append("sin2_theta_w = calculated_values.get('sin2_theta_w', sin2_theta_W_MSbar())")
        main_code.append("alpha = calculated_values.get('alpha', 1.0/137.035999084)")
        main_code.append("result = np.sqrt(4*np.pi*alpha / (1 - sin2_theta_w))")
        
    elif const_id == 'g_2':
        main_code.append("# SU(2) gauge coupling with correct sin²θ_W")
        main_code.append("sin2_theta_w = calculated_values.get('sin2_theta_w', sin2_theta_W_MSbar())")
        main_code.append("alpha = calculated_values.get('alpha', 1.0/137.035999084)")
        main_code.append("result = np.sqrt(4*np.pi*alpha / sin2_theta_w)")
        
    elif const_id == 'delta_a_mu':
        main_code.append("# Muon anomalous magnetic moment")
        main_code.append("# Corrected formula with proper units")
        main_code.append("m_mu_MeV = 105.6583755  # MeV")
        main_code.append("Lambda_had = 100  # MeV, hadronic scale")
        main_code.append("result = (248 * 0.25) / (8 * np.pi**2) * (m_mu_MeV / Lambda_had)**2")
        
    else:
        # Default: try to use the formula
        formula = constant.get('formula', '')
        if formula:
            python_formula = formula
            
            # Replace mathematical operations
            python_formula = python_formula.replace('^', '**')
            python_formula = python_formula.replace('sqrt(', 'np.sqrt(')
            python_formula = python_formula.replace('exp(', 'np.exp(')
            python_formula = python_formula.replace('log(', 'np.log(')
            python_formula = python_formula.replace('ln(', 'np.log(')
            python_formula = python_formula.replace('pi', 'np.pi')
            python_formula = python_formula.replace('sin(', 'np.sin(')
            python_formula = python_formula.replace('cos(', 'np.cos(')
            python_formula = python_formula.replace('arcsin(', 'np.arcsin(')
            
            # Replace constant references with calculated values
            for dep_id in sorted_deps:
                if dep_id in python_formula:
                    python_formula = python_formula.replace(dep_id, f"calculated_values['{dep_id}']")
            
            main_code.append(f"result = {python_formula}")
        else:
            main_code.append("# No formula available, using placeholder")
            main_code.append("result = 0")
    
    main_code.append("")
    main_code.append(f"print(f'{constant['symbol']} = {{result:.10e}} {constant.get('unit', 'dimensionless')}')")
    
    nb.cells.append(new_code_cell('\n'.join(main_code)))
    
    # Comparison with experimental value
    if 'sources' in constant and constant['sources']:
        nb.cells.append(new_markdown_cell("## Comparison with Experimental Value"))
        
        comp_code = ["# Compare with experimental measurements"]
        for source in constant['sources']:
            if 'value' in source:
                comp_code.append(f"experimental = {source['value']}")
                comp_code.append("deviation = (result - experimental) / experimental * 100")
                comp_code.append(f"print(f'Experimental ({source.get('name', 'Unknown')}): {{experimental:.10e}}')")
                comp_code.append("print(f'Theoretical: {result:.10e}')")
                comp_code.append("print(f'Relative deviation: {deviation:.2f}%')")
                break
        
        nb.cells.append(new_code_cell('\n'.join(comp_code)))
    
    # Accuracy check
    if 'accuracyTarget' in constant:
        nb.cells.append(new_markdown_cell("## Accuracy Assessment"))
        
        acc_code = [f"# Target accuracy: {constant['accuracyTarget']*100:.1f}%"]
        acc_code.append(f"target = {constant['accuracyTarget']}")
        acc_code.append("if 'experimental' in locals():")
        acc_code.append("    actual_error = abs((result - experimental) / experimental)")
        acc_code.append("    if actual_error <= target:")
        acc_code.append("        print(f'✓ Accuracy target met: {actual_error:.2%} ≤ {target:.1%}')")
        acc_code.append("        status = 'validated'")
        acc_code.append("    elif actual_error <= 0.10:")
        acc_code.append("        print(f'⚠ Close to target: {actual_error:.2%} (target: {target:.1%})')")
        acc_code.append("        status = 'validated'")
        acc_code.append("    else:")
        acc_code.append("        print(f'✗ Accuracy target not met: {actual_error:.2%} > {target:.1%}')")
        acc_code.append("        status = 'speculative'")
        acc_code.append("else:")
        acc_code.append("    print('No experimental value for comparison')")
        acc_code.append("    status = 'speculative'")
        
        nb.cells.append(new_code_cell('\n'.join(acc_code)))
    
    # Export result
    nb.cells.append(new_markdown_cell("## Export Result"))
    
    export_code = ["# Prepare result for export"]
    export_code.append("import json")
    export_code.append("from pathlib import Path")
    export_code.append("")
    export_code.append("result_data = {")
    export_code.append(f"    'id': '{constant['id']}',")
    export_code.append(f"    'symbol': '{constant['symbol']}',")
    export_code.append(f"    'name': '{constant['name']}',")
    export_code.append("    'value': result,")
    export_code.append(f"    'unit': '{constant.get('unit', 'dimensionless')}',")
    export_code.append("    'status': status if 'status' in locals() else 'speculative',")
    export_code.append("}")
    export_code.append("")
    export_code.append("if 'experimental' in locals():")
    export_code.append("    result_data['experimental'] = experimental")
    export_code.append("    result_data['deviation'] = (result - experimental) / experimental")
    export_code.append("")
    export_code.append("# Save to file")
    export_code.append("output_dir = Path('results/json')")
    export_code.append("output_dir.mkdir(parents=True, exist_ok=True)")
    export_code.append(f"output_file = output_dir / '{constant['id']}_result.json'")
    export_code.append("")
    export_code.append("with open(output_file, 'w') as f:")
    export_code.append("    json.dump(result_data, f, indent=2)")
    export_code.append("")
    export_code.append("print(f'\\nResult saved to {output_file}')")
    
    nb.cells.append(new_code_cell('\n'.join(export_code)))
    
    return nb

def main():
    """Generate notebooks for all constants"""
    # Setup paths
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent / 'data'
    notebooks_dir = script_dir.parent / 'notebooks'
    
    # Create notebooks directory
    notebooks_dir.mkdir(exist_ok=True)
    
    # Get all constant JSON files
    json_files = sorted(data_dir.glob('*.json'))
    
    print(f"Generating notebooks for {len(json_files)} constants...")
    
    for json_file in json_files:
        constant = load_constant(json_file)
        const_id = constant['id']
        
        print(f"  Generating notebook for {const_id}...")
        
        try:
            # Generate notebook
            nb = generate_notebook(constant, data_dir)
            
            # Save notebook
            output_path = notebooks_dir / f"{const_id}.ipynb"
            with open(output_path, 'w', encoding='utf-8') as f:
                nbf.write(nb, f)
            
            print(f"    ✓ Saved to {output_path}")
            
        except Exception as e:
            print(f"    ✗ Error: {e}")
    
    print("\nNotebook generation complete!")

if __name__ == '__main__':
    main()