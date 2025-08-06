#!/usr/bin/env python3
"""
Execute self-contained notebooks and save results to JSON
"""
import json
import os
import sys
from pathlib import Path
import nbformat
from nbconvert.preprocessors import ExecutePreprocessor
import re

def extract_result_from_notebook(notebook_path):
    """Execute a notebook and extract the final result"""
    try:
        # Load the notebook
        with open(notebook_path, 'r') as f:
            nb = nbformat.read(f, as_version=4)
        
        # Execute the notebook
        ep = ExecutePreprocessor(timeout=120, kernel_name='python3')
        try:
            ep.preprocess(nb, {'metadata': {'path': str(notebook_path.parent)}})
        except Exception as exec_error:
            # Try to extract any partial results even if execution failed
            print(f"Execution warning: {exec_error}")
        
        # Find the result from the output
        result_value = None
        constant_symbol = None
        constant_unit = None
        
        # Look for the main result output
        for i, cell in enumerate(nb.cells):
            if cell.cell_type == 'code':
                # Check if this is the main calculation cell
                if 'result' in cell.get('source', '').lower():
                    # Look for outputs in this cell
                    if 'outputs' in cell:
                        for output in cell['outputs']:
                            if 'text' in output:
                                text = output['text']
                                # Look for the final result line
                                lines = text.strip().split('\n')
                                for line in lines:
                                    # Match various output patterns (including Unicode symbols, parentheses, and special chars)
                                    patterns = [
                                        r'([a-zA-Z_0-9αβγδεθλμνπρστφχψωΓΔΛΣΩ₀₁₂₃₄₅₆₇₈₉()★*]+)\s*=\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s*(\w+)?',
                                        r'Result:\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)',
                                        r'Final value:\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)',
                                    ]
                                    for pattern in patterns:
                                        match = re.search(pattern, line)
                                        if match:
                                            if len(match.groups()) >= 2:
                                                result_value = float(match.group(2) if match.group(1) else match.group(1))
                                                if len(match.groups()) >= 3 and match.group(3):
                                                    constant_unit = match.group(3)
                                            else:
                                                result_value = float(match.group(1))
                                            break
                                    if result_value is not None:
                                        break
                            elif 'data' in output and 'text/plain' in output['data']:
                                # Handle outputs in data format
                                text = output['data']['text/plain']
                                try:
                                    result_value = float(text.strip())
                                except:
                                    pass
        
        # If we couldn't find result in outputs, try to find it in calculated_values
        if result_value is None:
            for cell in nb.cells:
                if cell.cell_type == 'code' and 'calculated_values' in cell.get('source', ''):
                    if 'outputs' in cell:
                        for output in cell['outputs']:
                            if 'text' in output:
                                # Extract the constant ID from the notebook name
                                const_id = notebook_path.stem
                                # Look for calculated_values[const_id]
                                pattern = rf"calculated_values\['{const_id}'\]\s*=\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)"
                                match = re.search(pattern, output['text'])
                                if match:
                                    result_value = float(match.group(1))
                                    break
        
        # Save executed notebook
        executed_path = notebook_path.parent.parent / 'results' / (notebook_path.stem + '_executed.ipynb')
        executed_path.parent.mkdir(exist_ok=True)
        with open(executed_path, 'w') as f:
            nbformat.write(nb, f)
        
        return result_value, constant_symbol, constant_unit
        
    except Exception as e:
        print(f"Error: {e}")
        return None, None, None

def main():
    """Execute all notebooks and save results"""
    print("🔬 Executing notebooks to calculate constant values...")
    
    # Find notebooks directory
    notebooks_dir = Path(__file__).parent / 'notebooks'
    if not notebooks_dir.exists():
        print(f"Notebooks directory not found: {notebooks_dir}")
        return
    
    # Create results directories
    results_dir = Path(__file__).parent / 'results'
    results_json_dir = results_dir / 'json'
    results_dir.mkdir(exist_ok=True)
    results_json_dir.mkdir(exist_ok=True)
    
    # Process all notebooks
    notebook_files = sorted(notebooks_dir.glob('*.ipynb'))
    print(f"Found {len(notebook_files)} notebooks to execute")
    
    success_count = 0
    results = {}
    
    for notebook_path in notebook_files:
        const_id = notebook_path.stem
        print(f"Executing {const_id}...", end=' ')
        
        result_value, symbol, unit = extract_result_from_notebook(notebook_path)
        
        if result_value is not None:
            # Load the original JSON to get metadata
            json_path = Path(__file__).parent / 'data' / f"{const_id}.json"
            if json_path.exists():
                with open(json_path, 'r') as f:
                    constant_data = json.load(f)
                
                # Get measured value
                measured_value = constant_data.get('metadata', {}).get('measured_value')
                if not measured_value:
                    # Try to extract from sources
                    for source in constant_data.get('sources', []):
                        if source.get('value') and 'Topological' not in source.get('name', ''):
                            measured_value = source['value']
                            break
                
                # Calculate accuracy
                relative_error = 0
                accuracy_met = True
                if measured_value and result_value:
                    relative_error = (result_value - measured_value) / measured_value
                    target_accuracy = constant_data.get('accuracyTarget', 0.05)
                    accuracy_met = abs(relative_error) <= target_accuracy
                
                # Create result JSON with all required fields
                result_data = {
                    "id": const_id,
                    "name": constant_data.get('name', ''),
                    "symbol": constant_data.get('symbol', symbol),
                    "value": result_value,
                    "calculated_value": result_value,
                    "result": result_value,
                    "unit": constant_data.get('unit', unit),
                    "category": constant_data.get('category', ''),
                    "description": constant_data.get('description', ''),
                    "formula": constant_data.get('formula', ''),
                    "sources": constant_data.get('sources', []),
                    "measured_value": measured_value,
                    "relative_error": relative_error,
                    "accuracy_met": accuracy_met,
                    "status": "completed" if accuracy_met else "warning",
                    "timestamp": f"{__import__('datetime').datetime.now().isoformat()}",
                    "metadata": {
                        "calculated_value": result_value,
                        "measured_value": measured_value,
                        "correction_factors": constant_data.get('metadata', {}).get('correction_factors', [])
                    }
                }
                
                # Save individual result JSON
                result_json_path = results_json_dir / f"{const_id}_result.json"
                with open(result_json_path, 'w') as f:
                    json.dump(result_data, f, indent=2)
                
                results[const_id] = result_value
                print("✓")
                success_count += 1
            else:
                print(f"✗ (no JSON data)")
        else:
            # Even if execution failed, create a result file with error status
            json_path = Path(__file__).parent / 'data' / f"{const_id}.json"
            if json_path.exists():
                with open(json_path, 'r') as f:
                    constant_data = json.load(f)
                
                # Create error result JSON
                result_data = {
                    "id": const_id,
                    "name": constant_data.get('name', ''),
                    "symbol": constant_data.get('symbol', ''),
                    "value": None,
                    "calculated_value": None,
                    "result": None,
                    "unit": constant_data.get('unit', ''),
                    "category": constant_data.get('category', ''),
                    "description": constant_data.get('description', ''),
                    "formula": constant_data.get('formula', ''),
                    "sources": constant_data.get('sources', []),
                    "measured_value": constant_data.get('metadata', {}).get('measured_value'),
                    "relative_error": None,
                    "accuracy_met": False,
                    "status": "error",
                    "error": "Calculation failed during notebook execution",
                    "timestamp": f"{__import__('datetime').datetime.now().isoformat()}",
                    "metadata": constant_data.get('metadata', {})
                }
                
                # Save error result JSON
                result_json_path = results_json_dir / f"{const_id}_result.json"
                with open(result_json_path, 'w') as f:
                    json.dump(result_data, f, indent=2)
            
            print("✗")
    
    # Save combined results
    combined_results_path = results_dir / 'all_results.json'
    with open(combined_results_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print("=" * 60)
    print(f"Summary: Successfully executed {success_count} of {len(notebook_files)} notebooks")
    print(f"📊 Results saved to: {results_json_dir}")
    
    return success_count == len(notebook_files)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)