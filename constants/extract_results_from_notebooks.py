#!/usr/bin/env python3
"""
Extract results from executed notebooks and save as JSON files
"""
import json
import re
from pathlib import Path
import nbformat

def extract_results_from_notebook(notebook_path):
    """Extract calculation results from an executed notebook"""
    try:
        with open(notebook_path, 'r') as f:
            nb = nbformat.read(f, as_version=4)
        
        # Extract constant ID from filename
        constant_id = notebook_path.stem.replace('_executed', '')
        
        # Look for output cells with results
        results = {}
        
        for cell in nb.cells:
            if cell.cell_type == 'code' and hasattr(cell, 'outputs'):
                for output in cell.outputs:
                    if hasattr(output, 'text'):
                        text = output.text
                        
                        # Extract calculated value
                        calc_match = re.search(r'Calculated value:\s*([\d\.\-e]+)', text)
                        if calc_match:
                            results['calculated_value'] = float(calc_match.group(1))
                        
                        # Extract reference value
                        ref_match = re.search(r'Reference value:\s*([\d\.\-e]+)', text)
                        if ref_match:
                            results['reference_value'] = float(ref_match.group(1))
                        
                        # Extract relative error
                        err_match = re.search(r'Relative error:\s*([\d\.\-e\+]+)', text)
                        if err_match:
                            try:
                                results['relative_error'] = float(err_match.group(1))
                            except ValueError:
                                # Handle incomplete scientific notation like "0.00e"
                                err_text = err_match.group(1)
                                if err_text.endswith('e'):
                                    err_text += '+00'
                                results['relative_error'] = float(err_text)
                        
                        # Check if accuracy target met
                        if '✓ Accuracy target met!' in text:
                            results['accuracy_met'] = True
                        
                        # Extract unit if present
                        unit_match = re.search(r'With unit:\s*[\d\.\-e]+\s*(.+)', text)
                        if unit_match:
                            results['unit'] = unit_match.group(1).strip()
                        
                        # Extract formula
                        formula_match = re.search(r'Formula:\s*(.+)', text)
                        if formula_match:
                            results['formula'] = formula_match.group(1).strip()
                        
                        # Extract LaTeX formula
                        latex_match = re.search(r'LaTeX:\s*(.+)', text)
                        if latex_match:
                            results['latex'] = latex_match.group(1).strip()
        
        # Only return if we found actual results
        if 'calculated_value' in results:
            results['id'] = constant_id
            results['accuracy_met'] = results.get('accuracy_met', False)
            return results
        
        return None
        
    except Exception as e:
        print(f"Error processing {notebook_path}: {e}")
        return None

def extract_all_results():
    """Extract results from all executed notebooks"""
    # Support different working directories
    script_dir = Path(__file__).parent
    possible_dirs = [
        script_dir / 'results',  # constants/results relative to script
        Path('/app/constants/results'),
        Path('constants/results'),
        Path('results'),
        Path('.')
    ]
    
    results_dir = None
    for dir_path in possible_dirs:
        if dir_path.exists():
            results_dir = dir_path
            break
    
    if results_dir is None:
        print("❌ No results directory found!")
        return 0, 0
    
    print(f"Using results directory: {results_dir}")
    
    json_dir = results_dir / 'json'
    json_dir.mkdir(exist_ok=True, parents=True)
    
    executed_notebooks = list(results_dir.glob('*_executed.ipynb'))
    print(f"Found {len(executed_notebooks)} executed notebooks")
    if len(executed_notebooks) == 0:
        # Try with absolute path
        executed_notebooks = list(Path('.').glob('results/*_executed.ipynb'))
    
    successful_extractions = 0
    failed_extractions = []
    
    for notebook_path in executed_notebooks:
        print(f"Processing {notebook_path.name}...", end=' ')
        
        results = extract_results_from_notebook(notebook_path)
        
        if results:
            # Save to JSON file
            json_path = json_dir / f"{results['id']}_result.json"
            with open(json_path, 'w') as f:
                json.dump(results, f, indent=2)
            print(f"✓ Saved to {json_path.name}")
            successful_extractions += 1
        else:
            print("✗ No results found")
            failed_extractions.append(notebook_path.stem)
    
    print(f"\n📊 Summary:")
    print(f"   ✅ Successfully extracted: {successful_extractions}")
    print(f"   ❌ Failed: {len(failed_extractions)}")
    
    if failed_extractions:
        print(f"\nFailed notebooks:")
        for name in failed_extractions[:10]:  # Show first 10
            print(f"   - {name}")
        if len(failed_extractions) > 10:
            print(f"   ... and {len(failed_extractions) - 10} more")
    
    return successful_extractions, len(failed_extractions)

def create_summary_json():
    """Create a summary JSON file with all results"""
    # Support different working directories
    script_dir = Path(__file__).parent
    possible_dirs = [
        script_dir / 'results' / 'json',  # constants/results/json relative to script
        Path('/app/constants/results/json'),
        Path('constants/results/json'),
        Path('results/json')
    ]
    
    json_dir = None
    for dir_path in possible_dirs:
        if dir_path.exists():
            json_dir = dir_path
            break
    
    if json_dir is None:
        print("❌ No json directory found!")
        return
    
    result_files = list(json_dir.glob('*_result.json'))
    
    summary = {
        'total_constants': 70,
        'calculated_constants': len(result_files),
        'success_rate': f"{(len(result_files) / 70) * 100:.1f}%",
        'constants': {}
    }
    
    for result_file in result_files:
        with open(result_file, 'r') as f:
            data = json.load(f)
            constant_id = data['id']
            summary['constants'][constant_id] = {
                'calculated_value': data.get('calculated_value'),
                'reference_value': data.get('reference_value'),
                'relative_error': data.get('relative_error'),
                'accuracy_met': data.get('accuracy_met', False),
                'unit': data.get('unit', 'dimensionless')
            }
    
    # Save summary
    with open(json_dir / 'summary.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n📋 Created summary.json with {len(result_files)} constants")

if __name__ == "__main__":
    print("🔍 Extracting results from executed notebooks...")
    print("=" * 60)
    
    successful, failed = extract_all_results()
    
    if successful > 0:
        create_summary_json()
    
    print("\n✅ Done!")