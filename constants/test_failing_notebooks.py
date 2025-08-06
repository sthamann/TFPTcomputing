#!/usr/bin/env python3
"""Test failing notebooks to identify specific errors."""

import json
import nbformat
from nbconvert.preprocessors import ExecutePreprocessor
from pathlib import Path
import traceback

# List of notebooks that are failing based on the output
failing_notebooks = [
    'c_3', 'c_4', 'delta_a_mu', 'delta_gamma', 'g_1', 'g_2', 
    'gamma_function', 'lambda_star', 'm_mu', 'm_nu', 'm_tau', 
    'phi_0', 'rho_lambda', 'rho_parameter', 'sigma_m_nu', 't_nu',
    'tau_mu', 'tau_star', 'tau_tau', 'z_0'
]

def test_notebook(name):
    """Test a single notebook and return error details."""
    notebook_path = Path(f'notebooks/{name}.ipynb')
    
    if not notebook_path.exists():
        return f"Notebook {name}.ipynb does not exist"
    
    try:
        with open(notebook_path, 'r') as f:
            nb = nbformat.read(f, as_version=4)
        
        # Try to execute
        ep = ExecutePreprocessor(timeout=30, kernel_name='python3')
        ep.preprocess(nb, {'metadata': {'path': 'notebooks'}})
        
        return f"✓ {name} executed successfully"
        
    except Exception as e:
        # Get the specific error
        error_msg = str(e)
        
        # Try to extract the specific error from the traceback
        if "NameError" in error_msg:
            # Extract the undefined name
            import re
            match = re.search(r"name '(\w+)' is not defined", error_msg)
            if match:
                return f"✗ {name}: NameError - '{match.group(1)}' is not defined"
        elif "TypeError" in error_msg:
            return f"✗ {name}: TypeError - {error_msg.split('TypeError:')[-1].strip()[:100]}"
        elif "ZeroDivisionError" in error_msg:
            return f"✗ {name}: ZeroDivisionError"
        elif "KeyError" in error_msg:
            match = re.search(r"KeyError: '(\w+)'", error_msg)
            if match:
                return f"✗ {name}: KeyError - '{match.group(1)}'"
        
        return f"✗ {name}: {error_msg[:150]}"

# Test each failing notebook
print("Testing failing notebooks:")
print("=" * 60)

errors_by_type = {}

for notebook in failing_notebooks:
    result = test_notebook(notebook)
    print(result)
    
    # Categorize errors
    if "NameError" in result:
        error_type = result.split("'")[1] if "'" in result else "undefined"
        if error_type not in errors_by_type:
            errors_by_type[error_type] = []
        errors_by_type[error_type].append(notebook)

print("\n" + "=" * 60)
print("Summary of undefined variables:")
for var, notebooks in errors_by_type.items():
    print(f"  {var}: {', '.join(notebooks)}")