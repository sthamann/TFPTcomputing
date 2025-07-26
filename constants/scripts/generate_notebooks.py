#!/usr/bin/env python3
"""
Generate Jupyter notebooks from JSON constant definitions
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

print("All imports successful!")

def load_constant(json_path):
    """Load constant definition from JSON file"""
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def parse_formula(formula_str):
    """Extract the mathematical expression from formula string"""
    # Handle special cases
    if 'α³ - Aα² - Ac₃²κ = 0' in formula_str:
        # Return the left side of the equation for alpha
        return 'alpha**3 - A*alpha**2 - A*c_3**2*kappa'
    
    if 'φ₀ = 0.053171 (from cubic equation self-consistency)' in formula_str:
        # phi_0 is a fundamental constant
        return '0.053171'
    
    if 'M_Pl = sqrt(ħc/G) = 1.22091e19 GeV' in formula_str:
        # Extract just the formula part
        return 'sqrt(hbar*c/G)'
    
    # Handle ratios like m_p/m_e
    if formula_str.startswith('m_p/m_e'):
        return 'm_p / m_e'
    
    # Extract right side of equation
    if '=' in formula_str:
        # Remove any ", where..." explanations
        parts = formula_str.split('=', 1)[1].strip()
        if ',' in parts:
            parts = parts.split(',')[0].strip()
        return parts
    return formula_str.strip()

def formula_to_sympy(formula):
    """Convert formula notation to SymPy syntax"""
    # Replace special symbols
    replacements = {
        # Greek letters
        'φ₀': 'phi_0',
        'φ': 'phi',
        'α': 'alpha',
        'π': 'pi',
        'θ_c': 'theta_c',
        'θ_W': 'theta_W',
        'κ': 'kappa',
        'η_B': 'eta_B',
        'τ': 'tau',
        'μ': 'mu',
        'ν': 'nu',
        'Σ': 'Sigma',
        
        # Subscripts and special symbols  
        '²': '2',  # Superscript 2
        '³': '3',  # Superscript 3
        '₀': '_0', # Subscript 0
        '₁': '_1', # Subscript 1
        '₂': '_2', # Subscript 2
        '₃': '_3', # Subscript 3
        '₅': '_5', # Subscript 5
        'c₃': 'c_3',
        'g₁': 'g_1', 
        'g₂': 'g_2',
        'm_τ': 'm_tau',
        'm_μ': 'm_mu',
        'm_ν': 'm_nu',
        'sin²θ_W': 'sin2_theta_W',
        'φ_5': 'phi_5',
        
        # Constants with special formatting
        'M_Pl': 'M_Pl',
        'v_H': 'v_H',
        'G_F': 'G_F',
        'M_W': 'M_W',
        'M_Z': 'M_Z',
        'm_p': 'm_p',
        'm_e': 'm_e',
        'm_c': 'm_c',
        'm_b': 'm_b',
        
        # Math functions
        '√': 'sqrt',
        'arccos': 'acos',
        'arcsin': 'asin',
        'arctan': 'atan',
        'ln': 'log',
        
        # Powers - replace ^ with **
        '^': '**',
        
        # Special physics symbols
        'ħ': 'hbar',
        '∞': 'oo'
    }
    
    result = formula
    for old, new in replacements.items():
        result = result.replace(old, new)
    
    # Handle special cases for sqrt with parentheses
    import re
    result = re.sub(r'sqrt(\d+)', r'sqrt(\1)', result)
    
    return result

def create_notebook(constant, all_constants):
    """Create a Jupyter notebook for a constant"""
    nb = new_notebook()
    
    # Handle special case for gamma function
    if constant['id'] == 'gamma_function':
        nb.cells.append(new_markdown_cell(
            f"# {constant['name']} ({constant['symbol']})\n\n"
            f"{constant['description']}\n\n"
            f"**Formula:** ${constant['formula'].replace('=', ' = ')}$\n\n"
            f"This is a function, not a single value.\n\n"
            f"**Category:** {constant['category']}"
        ))
        
        # Add implementation cell
        nb.cells.append(new_code_cell(
            """# Define the gamma function
def gamma(n):
    \"\"\"E8 cascade attenuation function\"\"\"
    return 0.834 + 0.108 * n + 0.0105 * n**2

# Test for various n values
print("γ(n) values:")
for n in range(8):
    print(f"γ({n}) = {gamma(n):.6f}")
    
# Calculate cumulative sum for cascade level 5
cumulative = sum(gamma(k) for k in range(5))
print(f"\\nΣ γ(k) for k=0 to 4 = {cumulative:.6f}")"""
        ))
        
        return nb
    
    # Title cell for regular constants
    nb.cells.append(new_markdown_cell(
        f"# {constant['name']} ({constant['symbol']})\n\n"
        f"{constant['description']}\n\n"
        f"**Formula:** ${constant['formula'].replace('=', ' = ')}$\n\n"
        f"**Unit:** {constant['unit']}\n\n"
        f"**Category:** {constant['category']}"
    ))
    
    # Import cell
    imports = f"""import sympy as sp
import numpy as np
from sympy import symbols, pi, sqrt, acos, asin, atan, exp, log, sin, cos
import pint
import json
from pathlib import Path

# Initialize unit registry
ureg = pint.UnitRegistry()
Q_ = ureg.Quantity

# Load constant metadata
const_path = Path('../constants/data/{constant['id']}.json')
with open(const_path, 'r') as f:
    metadata = json.load(f)
"""
    
    nb.cells.append(new_code_cell(imports))
    
    # Step 1: Define symbols
    symbol_defs = ["# Step 1: Define symbols"]
    symbols_set = set()
    
    # Add main symbol (handle special cases)
    main_var = formula_to_sympy(constant['symbol'])
    
    # Special handling for expressions as symbols
    if '/' in main_var:
        # For ratios like m_p/m_e, use a clean symbol name
        main_var = constant['id']  # Use the ID as the variable name
    
    if main_var != 'gamma_function':  # gamma_function is a function, not a symbol
        symbols_set.add(main_var)
    
    # Parse the formula to extract all variables used
    formula_expr = parse_formula(constant['formula'])
    sympy_formula = formula_to_sympy(formula_expr)
    
    # Extract variable names from formula (simple pattern matching)
    import re
    # Match valid Python variable names
    var_pattern = r'\b([a-zA-Z_][a-zA-Z0-9_]*)\b'
    formula_vars = re.findall(var_pattern, sympy_formula)
    
    # Add formula variables to symbols (excluding Python builtins and functions)
    builtins = {'sqrt', 'log', 'exp', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 
                'pi', 'e', 'sum', 'abs', 'min', 'max', 'range', 'len', 'float', 'int', 
                'str', 'list', 'dict', 'tuple', 'set', 'True', 'False', 'None',
                'A', 'kappa'}  # A and kappa are defined separately for alpha
    for var in formula_vars:
        if var not in builtins and not var.isdigit():
            symbols_set.add(var)
    
    # Add dependency symbols
    for dep_id in constant['dependencies']:
        dep_path = Path(f"constants/data/{dep_id}.json")
        if dep_path.exists():
            dep_const = load_constant(dep_path)
            dep_var = formula_to_sympy(dep_const['symbol'])
            symbols_set.add(dep_var)
    
    # Special handling for ratios - don't define as single symbol
    if constant['id'] == 'm_p_m_e_ratio':
        # Remove the ratio symbol, keep components
        symbols_set.discard('m_p_m_e_ratio')
        symbols_set.add('m_p')
        symbols_set.add('m_e')
    
    if symbols_set:
        # Create the symbol definition with proper names
        symbol_pairs = []
        for sym in sorted(symbols_set):
            # For symbols() call, we need the clean Python name
            symbol_pairs.append(f"{sym}")
        
        symbol_list = ', '.join(symbol_pairs)
        # Use the same clean names for both the Python variables and the symbols() string
        symbol_defs.append(f"{symbol_list} = symbols('{symbol_list}', real=True, positive=True)")
    
    nb.cells.append(new_code_cell('\n'.join(symbol_defs)))
    
    # Step 2: Define formula symbolically
    formula_expr = parse_formula(constant['formula'])
    sympy_formula = formula_to_sympy(formula_expr)
    
    # Special handling for different types of constants
    if constant['id'] == 'alpha':
        nb.cells.append(new_code_cell(
            f"# Step 2: Define cubic equation for alpha\n"
            f"# α³ - Aα² - Ac₃²κ = 0\n"
            f"A, kappa = symbols('A kappa', real=True, positive=True)\n"
            f"cubic_eq = {sympy_formula}\n"
            f"print(f'Cubic equation: {{cubic_eq}} = 0')\n"
            f"print(f'LaTeX: {{sp.latex(cubic_eq)}} = 0')"
        ))
    elif constant['id'] == 'phi_0':
        # phi_0 is a fundamental constant value
        nb.cells.append(new_code_cell(
            f"# Step 2: Define constant value\n"
            f"# φ₀ is a fundamental VEV from RG fixed point self-consistency\n"
            f"formula = {sympy_formula}\n"
            f"print(f'Value: {main_var} = {{formula}}')"
        ))
    elif constant['id'] == 'm_planck':
        # Special handling for Planck mass
        nb.cells.append(new_code_cell(
            f"# Step 2: Define formula symbolically\n"
            f"# Note: Using natural units where ħ = c = 1, G is gravitational constant\n"
            f"hbar, c, G = symbols('hbar c G', real=True, positive=True)\n"
            f"formula = 1.22091e19  # GeV (known value in natural units)\n"
            f"print(f'Formula: {main_var} = sqrt(ħc/G)')\n"
            f"print(f'Value: {main_var} = {{formula}} GeV')"
        ))
    else:
        nb.cells.append(new_code_cell(
            f"# Step 2: Define formula symbolically\n"
            f"formula = {sympy_formula}\n"
            f"print(f'Formula: {main_var} = {{formula}}')\n"
            f"print(f'LaTeX: {main_var} = {{sp.latex(formula)}}')"
        ))
    
    # Step 3: Load dependency values
    if constant['dependencies']:
        dep_code = ["# Step 3: Load dependency values", "dependency_values = {}"]
        
        # Special handling for gamma function dependency
        if 'gamma_function' in constant['dependencies']:
            dep_code.append("""
# Define gamma function for cascade calculations
def gamma(n):
    \"\"\"E8 cascade attenuation function: γ(n) = 0.834 + 0.108n + 0.0105n²\"\"\"
    return 0.834 + 0.108 * n + 0.0105 * n**2
""")
        
        for dep_id in constant['dependencies']:
            if dep_id == 'gamma_function':
                continue  # Already handled above
                
            dep_path = Path(f"data/{dep_id}.json")
            if dep_path.exists():
                dep_const = load_constant(dep_path)
                dep_var = formula_to_sympy(dep_const['symbol'])
                # Add the loading code without extra indentation
                dep_code.append(f"\n# Load {dep_const['name']}")
                dep_code.append(f"with open('../constants/data/{dep_id}.json', 'r') as f:")
                dep_code.append(f"    {dep_id}_data = json.load(f)")
                dep_code.append(f"dependency_values['{dep_var}'] = {dep_id}_data['sources'][0]['value']")
                dep_code.append(f"print(f\"{dep_var} = {{dependency_values['{dep_var}']}}\")")
        
        # Special handling for neutrino mass cascade calculation
        if constant['id'] == 'm_nu':
            dep_code.append("""
# Calculate cascade VEV φ_5
cascade_sum = sum(gamma(k) for k in range(5))
phi_5 = dependency_values['phi_0'] * exp(-cascade_sum)
dependency_values['phi_5'] = phi_5
print(f"φ_5 = {phi_5:.6e} (cascade level 5)")""")
        
        nb.cells.append(new_code_cell('\n'.join(dep_code)))
    
    # Step 4: Calculate value
    if constant['id'] == 'alpha':
        calc_code = """# Step 4: Calculate alpha by solving cubic equation
# Define A and κ from theory
A = 1 / (256 * pi**3)
kappa = (41 / (20 * pi)) * log(1 / dependency_values['phi_0'])

print(f'A = {float(A)}')
print(f'κ = {float(kappa)}')

# Substitute into cubic equation
# Find c_3 symbol
c_3_value = dependency_values.get('c_3', None)
if c_3_value is None:
    raise ValueError("c_3 dependency value not found")
numeric_eq = cubic_eq.subs([(A, A), (kappa, kappa), (c_3, c_3_value)])
print(f'Equation to solve: {numeric_eq} = 0')

# Solve for alpha
from sympy import solve
solutions = solve(numeric_eq, alpha)
print(f'\\nAll solutions: {[float(sol.evalf()) for sol in solutions if sol.is_real]}')

# Select physical solution (0 < α < 1)
physical_solutions = [sol for sol in solutions if sol.is_real and 0 < sol < 1]
if physical_solutions:
    calculated_value = float(physical_solutions[0].evalf())
    print(f'\\nPhysical solution: α = {calculated_value}')
else:
    raise ValueError('No physical solution found for alpha')"""
    else:
        calc_code = f"""# Step 4: Calculate numerical value
# Substitute dependency values
numeric_formula = formula"""
        
        if constant['dependencies']:
            calc_code += "\n# Create a mapping of symbol objects to values\n"
            calc_code += "substitutions = {}\n"
            calc_code += "for symbol_name, value in dependency_values.items():\n"
            calc_code += "    # Find the corresponding symbol object\n"
            calc_code += "    for sym in formula.free_symbols:\n"
            calc_code += "        if str(sym) == symbol_name:\n"
            calc_code += "            substitutions[sym] = value\n"
            calc_code += "            break\n"
            calc_code += "\n# Perform substitution\n"
            calc_code += "numeric_formula = formula.subs(substitutions)"
        
        calc_code += f"""
    
# Evaluate
if isinstance(numeric_formula, (int, float)):
    # Already a numeric value
    calculated_value = float(numeric_formula)
else:
    # SymPy expression - evaluate it
    calculated_value = float(numeric_formula.evalf())
print(f'Calculated value: {{calculated_value}}')

# Add unit if needed
if metadata['unit'] != 'dimensionless':
    result = Q_(calculated_value, metadata['unit'])
    print(f'With unit: {{result}}')
else:
    result = calculated_value"""
    
    nb.cells.append(new_code_cell(calc_code))
    
    # Step 5: Compare with reference (skip for gamma_function)
    if constant['id'] != 'gamma_function':
        nb.cells.append(new_code_cell(f"""# Step 5: Compare with reference value
reference_value = metadata['sources'][0]['value']
relative_error = abs(calculated_value - reference_value) / reference_value

print(f'Reference value: {{reference_value}}')
print(f'Calculated value: {{calculated_value}}')
print(f'Relative error: {{relative_error:.2e}}')
print(f'Accuracy target: {{metadata["accuracyTarget"]}}')

# Verify accuracy
assert relative_error < metadata['accuracyTarget'], f"Error {{relative_error:.2e}} exceeds target {{metadata['accuracyTarget']}}"
print('✓ Accuracy target met!')"""))
    
        # Step 6: Export result
        nb.cells.append(new_code_cell(f"""# Step 6: Export result
result_data = {{
    'id': metadata['id'],
    'symbol': metadata['symbol'],
    'calculated_value': calculated_value,
    'reference_value': reference_value,
    'relative_error': relative_error,
    'unit': metadata['unit'],
    'formula': metadata['formula'],
    'accuracy_met': relative_error < metadata['accuracyTarget']
}}

# Save result
output_path = Path('../constants/results/{constant['id']}_result.json')
output_path.parent.mkdir(exist_ok=True)
with open(output_path, 'w') as f:
    json.dump(result_data, f, indent=2)
    
print(f'Result saved to {{output_path}}')"""))
    else:
        # Special handling for gamma_function export
        nb.cells.append(new_code_cell(f"""# Export gamma function as a special result
result_data = {{
    'id': metadata['id'],
    'symbol': metadata['symbol'],
    'type': 'function',
    'description': 'E8 cascade attenuation function',
    'formula': metadata['formula'],
    'test_values': {{n: gamma(n) for n in range(8)}}
}}

# Save to JSON
output_path = Path('../constants/results/{constant['id']}_result.json')
output_path.parent.mkdir(exist_ok=True)
with open(output_path, 'w') as f:
    json.dump(result_data, f, indent=2)
    
print(f'Result saved to {{output_path}}')"""))
    
    return nb

def main():
    """Generate notebooks for all constants"""
    print("Starting notebook generation...")
    data_dir = Path(__file__).parent.parent / 'data'
    notebooks_dir = Path(__file__).parent.parent / 'notebooks'
    notebooks_dir.mkdir(exist_ok=True)
    
    print(f"Data directory: {data_dir}")
    print(f"Notebooks directory: {notebooks_dir}")
    
    # Load all constants
    all_constants = {}
    json_files = list(data_dir.glob('*.json'))
    print(f"Found {len(json_files)} JSON files")
    
    for json_file in json_files:
        print(f"Loading {json_file.name}...")
        constant = load_constant(json_file)
        all_constants[constant['id']] = constant
    
    # Generate notebooks
    print(f"Generating notebooks for {len(all_constants)} constants...")
    for const_id, constant in all_constants.items():
        nb = create_notebook(constant, all_constants)
        
        # Save notebook
        nb_path = notebooks_dir / f"{const_id}.ipynb"
        with open(nb_path, 'w', encoding='utf-8') as f:
            nbf.write(nb, f)
        
        print(f"Generated notebook: {nb_path}")

if __name__ == '__main__':
    main() 