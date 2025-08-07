#!/usr/bin/env python3
"""
Execute all generated notebooks and check for errors.
"""
import json
import os
import sys
from pathlib import Path
import subprocess
import nbformat
from nbconvert.preprocessors import ExecutePreprocessor

def execute_notebook(notebook_path):
    """Execute a single notebook and return success status."""
    try:
        with open(notebook_path, 'r') as f:
            nb = nbformat.read(f, as_version=4)
        
        # Create executor
        ep = ExecutePreprocessor(timeout=60, kernel_name='python3')
        
        # Execute notebook
        ep.preprocess(nb, {'metadata': {'path': str(notebook_path.parent)}})
        
        # Save executed notebook
        executed_path = notebook_path.parent / f"{notebook_path.stem}_executed.ipynb"
        with open(executed_path, 'w') as f:
            nbformat.write(nb, f)
        
        return True, "Success"
    except Exception as e:
        return False, str(e)

def main():
    notebooks_dir = Path(__file__).parent.parent / 'notebooks'
    
    if not notebooks_dir.exists():
        print(f"Notebooks directory not found: {notebooks_dir}")
        return 1
    
    # Get all notebooks
    notebooks = sorted(notebooks_dir.glob('*.ipynb'))
    notebooks = [nb for nb in notebooks if not nb.stem.endswith('_executed')]
    
    print(f"Found {len(notebooks)} notebooks to execute")
    
    results = {}
    failed_count = 0
    
    for notebook in notebooks:
        constant_id = notebook.stem
        print(f"Executing {constant_id}... ", end='', flush=True)
        
        success, message = execute_notebook(notebook)
        
        if success:
            print("✓")
            results[constant_id] = {"status": "success"}
        else:
            print("✗")
            print(f"  Error: {message[:200]}...")
            results[constant_id] = {"status": "failed", "error": message}
            failed_count += 1
    
    # Save results
    results_file = Path(__file__).parent.parent / 'execution_results.json'
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"Summary: Successfully executed {len(notebooks) - failed_count} of {len(notebooks)} notebooks")
    
    if failed_count > 0:
        print(f"\nFailed notebooks:")
        for constant_id, result in results.items():
            if result['status'] == 'failed':
                print(f"  - {constant_id}")
    
    print(f"Results saved to: {results_file}")
    
    return 0 if failed_count == 0 else 1

if __name__ == '__main__':
    sys.exit(main())
