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
    # Extract right side of equation
    if '=' in formula_str:
        return formula_str.split('=', 1)[1].strip()
    return formula_str.strip()

def formula_to_sympy(formula):
    """Convert formula notation to SymPy syntax"""
    # Replace special symbols
    replacements = {
        'φ₀': 'phi_0',
        'φ': 'phi',
        'α': 'alpha',
        'π': 'pi',
        '√': 'sqrt',
        'arccos': 'acos',
        'arcsin': 'asin',
        'arctan': 'atan'
    }
    
    result = formula
    for old, new in replacements.items():
        result = result.replace(old, new)
    
    return result

def create_notebook(constant, all_constants):
    """Create a Jupyter notebook for a constant"""
    nb = new_notebook()
    
    # Title cell
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
const_path = Path('../data/{constant['id']}.json')
with open(const_path, 'r') as f:
    metadata = json.load(f)
"""
    
    nb.cells.append(new_code_cell(imports))
    
    # Step 1: Define symbols
    symbol_defs = ["# Step 1: Define symbols"]
    symbols_set = set()
    
    # Add main symbol
    main_var = formula_to_sympy(constant['symbol'])
    symbols_set.add(main_var)
    
    # Add dependency symbols
    for dep_id in constant['dependencies']:
        dep_path = Path(f"constants/data/{dep_id}.json")
        if dep_path.exists():
            dep_const = load_constant(dep_path)
            dep_var = formula_to_sympy(dep_const['symbol'])
            symbols_set.add(dep_var)
    
    if symbols_set:
        symbol_list = ', '.join(sorted(symbols_set))
        symbol_defs.append(f"{symbol_list} = symbols('{symbol_list}', real=True, positive=True)")
    
    nb.cells.append(new_code_cell('\n'.join(symbol_defs)))
    
    # Step 2: Define formula symbolically
    formula_expr = parse_formula(constant['formula'])
    sympy_formula = formula_to_sympy(formula_expr)
    
    nb.cells.append(new_code_cell(
        f"# Step 2: Define formula symbolically\n"
        f"formula = {sympy_formula}\n"
        f"print(f'Formula: {main_var} = {{formula}}')\n"
        f"print(f'LaTeX: {main_var} = {{sp.latex(formula)}}')"
    ))
    
    # Step 3: Load dependency values
    if constant['dependencies']:
        dep_code = ["# Step 3: Load dependency values", "dependency_values = {}"]
        
        for dep_id in constant['dependencies']:
            dep_path = Path(f"constants/data/{dep_id}.json")
            if dep_path.exists():
                dep_const = load_constant(dep_path)
                dep_var = formula_to_sympy(dep_const['symbol'])
                dep_code.append(f"""
# Load {dep_const['name']}
with open('../data/{dep_id}.json', 'r') as f:
    {dep_id}_data = json.load(f)
dependency_values['{dep_var}'] = {dep_id}_data['sources'][0]['value']
print(f"{dep_var} = {{dependency_values['{dep_var}']}}")""")
        
        nb.cells.append(new_code_cell('\n'.join(dep_code)))
    
    # Step 4: Calculate value
    calc_code = f"""# Step 4: Calculate numerical value
# Substitute dependency values
numeric_formula = formula"""
    
    if constant['dependencies']:
        calc_code += "\nfor symbol, value in dependency_values.items():\n"
        calc_code += "    numeric_formula = numeric_formula.subs(symbol, value)"
    
    calc_code += f"""
    
# Evaluate
calculated_value = float(numeric_formula.evalf())
print(f'Calculated value: {{calculated_value}}')

# Add unit if needed
if metadata['unit'] != 'dimensionless':
    result = Q_(calculated_value, metadata['unit'])
    print(f'With unit: {{result}}')
else:
    result = calculated_value"""
    
    nb.cells.append(new_code_cell(calc_code))
    
    # Step 5: Compare with reference
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
output_path = Path('../results/{constant['id']}_result.json')
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