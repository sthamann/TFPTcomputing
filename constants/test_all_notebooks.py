#!/usr/bin/env python3
"""
Comprehensive test script to identify issues with notebook execution and calculations.
"""

import json
import math
from pathlib import Path
import traceback
import sys

def load_json_file(filepath):
    """Safely load a JSON file."""
    try:
        with open(filepath) as f:
            return json.load(f)
    except Exception as e:
        return None

def execute_notebook_cells(notebook_path):
    """Execute notebook cells and return the result."""
    try:
        with open(notebook_path) as f:
            nb = json.load(f)
        
        # Create namespace for execution
        namespace = {}
        
        # Execute each code cell
        for cell in nb['cells']:
            if cell['cell_type'] == 'code':
                code = ''.join(cell['source'])
                
                # Skip cells that are just comments or empty
                if not code.strip() or code.strip().startswith('#'):
                    continue
                
                try:
                    exec(code, namespace)
                except Exception as e:
                    # Return error details
                    return False, f"Cell execution error: {str(e)}", None
        
        # Extract result
        if 'result' in namespace:
            return True, None, namespace['result']
        elif 'calculated_value' in namespace:
            return True, None, namespace['calculated_value']
        else:
            # Try to find any variable that looks like a result
            for key in ['value', 'final_value', 'output']:
                if key in namespace:
                    return True, None, namespace[key]
            
            return False, "No result variable found", None
            
    except Exception as e:
        return False, f"Notebook loading error: {str(e)}", None

def compare_values(calculated, expected, tolerance=0.01):
    """Compare calculated and expected values."""
    if calculated is None or expected is None:
        return False, "Missing value"
    
    if isinstance(calculated, (int, float)) and isinstance(expected, (int, float)):
        if math.isnan(calculated) or math.isinf(calculated):
            return False, f"Invalid value: {calculated}"
        
        if expected == 0:
            if abs(calculated) < 1e-10:
                return True, "Values match (both ~0)"
            else:
                return False, f"Expected 0, got {calculated}"
        
        rel_error = abs(calculated - expected) / abs(expected)
        if rel_error <= tolerance:
            return True, f"Within tolerance ({rel_error:.2%})"
        else:
            return False, f"Outside tolerance ({rel_error:.2%})"
    
    return False, "Type mismatch"

def main():
    notebooks_dir = Path('notebooks')
    results_dir = Path('results/json')
    data_dir = Path('data')
    
    # Get all notebooks
    notebooks = sorted(notebooks_dir.glob('*.ipynb'))
    
    print(f"Testing {len(notebooks)} notebooks...\n")
    print("=" * 80)
    
    # Categories of issues
    execution_errors = []
    no_result = []
    wrong_values = []
    missing_expected = []
    successful = []
    
    for notebook_path in notebooks:
        const_id = notebook_path.stem
        
        # Load expected data
        data_file = data_dir / f'{const_id}.json'
        data = load_json_file(data_file)
        
        # Get expected value from sources
        expected_value = None
        if data and 'sources' in data and data['sources']:
            for source in data['sources']:
                if 'value' in source:
                    expected_value = source['value']
                    break
        
        # Load result file
        result_file = results_dir / f'{const_id}_result.json'
        result_data = load_json_file(result_file)
        
        # Get calculated value from result
        calculated_value = None
        if result_data:
            calculated_value = result_data.get('value')
        
        # Execute notebook to verify
        success, error, exec_value = execute_notebook_cells(notebook_path)
        
        # Categorize the issue
        if not success:
            execution_errors.append({
                'id': const_id,
                'error': error,
                'formula': data.get('formula') if data else None
            })
        elif exec_value is None and calculated_value is None:
            no_result.append({
                'id': const_id,
                'formula': data.get('formula') if data else None
            })
        elif expected_value is None:
            missing_expected.append({
                'id': const_id,
                'calculated': calculated_value or exec_value,
                'formula': data.get('formula') if data else None
            })
        else:
            # Compare values
            value_to_check = calculated_value if calculated_value is not None else exec_value
            match, reason = compare_values(value_to_check, expected_value, 
                                          tolerance=data.get('accuracyTarget', 0.01) if data else 0.01)
            
            if match:
                successful.append({
                    'id': const_id,
                    'value': value_to_check,
                    'expected': expected_value,
                    'reason': reason
                })
            else:
                wrong_values.append({
                    'id': const_id,
                    'calculated': value_to_check,
                    'expected': expected_value,
                    'reason': reason,
                    'formula': data.get('formula') if data else None
                })
    
    # Print summary
    print("\n📊 SUMMARY")
    print("=" * 80)
    print(f"Total notebooks: {len(notebooks)}")
    print(f"✅ Successful: {len(successful)}")
    print(f"❌ Execution errors: {len(execution_errors)}")
    print(f"❓ No result found: {len(no_result)}")
    print(f"⚠️  Wrong values: {len(wrong_values)}")
    print(f"📝 Missing expected values: {len(missing_expected)}")
    
    # Detailed reports
    if execution_errors:
        print("\n\n❌ EXECUTION ERRORS")
        print("=" * 80)
        for item in execution_errors:
            print(f"\n{item['id']}:")
            print(f"  Error: {item['error']}")
            if item['formula']:
                print(f"  Formula: {item['formula']}")
    
    if no_result:
        print("\n\n❓ NO RESULT FOUND")
        print("=" * 80)
        for item in no_result:
            print(f"\n{item['id']}:")
            if item['formula']:
                print(f"  Formula: {item['formula']}")
    
    if wrong_values:
        print("\n\n⚠️  WRONG VALUES")
        print("=" * 80)
        for item in wrong_values:
            print(f"\n{item['id']}:")
            print(f"  Calculated: {item['calculated']}")
            print(f"  Expected: {item['expected']}")
            print(f"  Issue: {item['reason']}")
            if item['formula']:
                print(f"  Formula: {item['formula']}")
    
    if missing_expected:
        print("\n\n📝 MISSING EXPECTED VALUES (but calculated)")
        print("=" * 80)
        for item in missing_expected[:10]:  # Limit output
            print(f"\n{item['id']}:")
            print(f"  Calculated: {item['calculated']}")
            if item['formula']:
                print(f"  Formula: {item['formula']}")
    
    # Save detailed report
    report = {
        'total': len(notebooks),
        'successful': len(successful),
        'execution_errors': execution_errors,
        'no_result': no_result,
        'wrong_values': wrong_values,
        'missing_expected': missing_expected
    }
    
    with open('notebook_test_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print("\n\n📄 Detailed report saved to notebook_test_report.json")
    
    return 0 if not (execution_errors or no_result or wrong_values) else 1

if __name__ == '__main__':
    sys.exit(main())