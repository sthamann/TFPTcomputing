#!/usr/bin/env python3
"""
Execute all notebooks to calculate constant values
"""
import json
import subprocess
import os
import sys
from pathlib import Path
import time

def execute_notebook(notebook_path, output_dir):
    """Execute a single notebook and save the result"""
    notebook_name = notebook_path.stem
    output_path = output_dir / f"{notebook_name}_executed.ipynb"
    
    cmd = [
        'jupyter', 'nbconvert',
        '--to', 'notebook',
        '--execute',
        '--output', str(output_path),
        '--output-dir', str(output_dir),
        str(notebook_path)
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            return True, "Success"
        else:
            return False, f"Error: {result.stderr}"
    except subprocess.TimeoutExpired:
        return False, "Timeout after 60 seconds"
    except Exception as e:
        return False, str(e)

def main():
    """Execute all notebooks in the notebooks directory"""
    # Setup paths
    script_dir = Path(__file__).parent
    notebooks_dir = script_dir / 'notebooks'
    results_dir = script_dir / 'results'
    results_dir.mkdir(exist_ok=True)
    
    print("🔬 Executing notebooks to calculate constant values...")
    print(f"Notebooks directory: {notebooks_dir}")
    print(f"Results directory: {results_dir}")
    
    # Find all notebooks
    notebooks = sorted(notebooks_dir.glob('*.ipynb'))
    total = len(notebooks)
    print(f"\nFound {total} notebooks to execute")
    
    # Track results
    successful = []
    failed = []
    
    # Test with phi_0 first
    test_notebook = notebooks_dir / 'phi_0.ipynb'
    if test_notebook.exists():
        print("\n🧪 Testing execution with phi_0 notebook...")
        success, msg = execute_notebook(test_notebook, results_dir)
        if not success:
            print(f"❌ Test execution failed: {msg}")
            print("Aborting batch execution")
            return 1
        else:
            print("✅ Test execution successful!")
    
    # Execute all notebooks
    print(f"\n📊 Executing all {total} notebooks...")
    start_time = time.time()
    
    for i, notebook_path in enumerate(notebooks, 1):
        notebook_name = notebook_path.stem
        print(f"\r[{i}/{total}] Executing {notebook_name}...", end='', flush=True)
        
        success, msg = execute_notebook(notebook_path, results_dir)
        
        if success:
            successful.append(notebook_name)
        else:
            failed.append((notebook_name, msg))
            print(f"\r[{i}/{total}] ❌ Failed: {notebook_name} - {msg}")
    
    elapsed = time.time() - start_time
    
    # Summary
    print(f"\n\n{'='*60}")
    print(f"Execution Summary:")
    print(f"Total notebooks: {total}")
    print(f"Successful: {len(successful)} ✅")
    print(f"Failed: {len(failed)} ❌")
    print(f"Time elapsed: {elapsed:.2f} seconds")
    
    if failed:
        print(f"\nFailed notebooks:")
        for name, error in failed:
            print(f"  - {name}: {error[:100]}...")
    
    # Save summary
    summary = {
        'total': total,
        'successful': len(successful),
        'failed': len(failed),
        'failed_notebooks': [{'name': n, 'error': e} for n, e in failed],
        'execution_time': elapsed
    }
    
    with open(results_dir / 'execution_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\nExecution summary saved to: {results_dir / 'execution_summary.json'}")
    
    # Return appropriate exit code
    return 0 if len(failed) == 0 else 1

if __name__ == '__main__':
    sys.exit(main())