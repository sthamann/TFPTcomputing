#!/usr/bin/env python3
"""
Test a notebook by executing its cells
"""
import json
import sys
from pathlib import Path

def test_notebook(notebook_path):
    """Test a notebook by executing its cells"""
    print(f"\nTesting notebook: {notebook_path}")
    
    # Load the notebook
    with open(notebook_path, 'r') as f:
        nb = json.load(f)
    
    # Create a namespace for execution
    namespace = {}
    
    # Execute each code cell
    for i, cell in enumerate(nb['cells']):
        if cell['cell_type'] == 'code':
            try:
                code = ''.join(cell['source'])
                print(f"\nExecuting cell {i}...")
                exec(code, namespace)
                print("✓ Cell executed successfully")
            except Exception as e:
                print(f"✗ Error in cell {i}: {str(e)}")
                return False
    
    # Check if result was calculated
    if 'calculated_value' in namespace:
        print(f"\n✓ Successfully calculated value: {namespace['calculated_value']}")
        return True
    else:
        print("\n✗ No calculated value found")
        return False

def main():
    """Test sample notebooks"""
    notebooks_dir = Path(__file__).parent / 'notebooks'
    
    # Test a few key notebooks
    test_notebooks = ['alpha.ipynb', 'alpha_g.ipynb', 'delta_m_n_p.ipynb', 'phi_0.ipynb', 'c_3.ipynb']
    
    results = {}
    for nb_name in test_notebooks:
        nb_path = notebooks_dir / nb_name
        if nb_path.exists():
            results[nb_name] = test_notebook(nb_path)
        else:
            print(f"Notebook {nb_name} not found")
            results[nb_name] = False
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary:")
    for nb_name, success in results.items():
        status = "✓ PASSED" if success else "✗ FAILED"
        print(f"  {nb_name}: {status}")
    
    # Return success if all tests passed
    return all(results.values())

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)