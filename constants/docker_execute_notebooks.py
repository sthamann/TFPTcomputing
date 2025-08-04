#!/usr/bin/env python3
"""
Execute notebooks directly without nbconvert for Docker environment
"""
import json
import sys
from pathlib import Path
import time
import nbformat
from nbformat import v4
import subprocess

def execute_notebook_cells(notebook_path):
    """Execute a notebook by running its cells directly"""
    try:
        # Load notebook
        with open(notebook_path, 'r') as f:
            nb = nbformat.read(f, as_version=4)
        
        # Create a namespace for execution
        namespace = {
            '__name__': '__main__',
            '__file__': str(notebook_path)
        }
        
        # Execute each code cell
        for i, cell in enumerate(nb.cells):
            if cell.cell_type == 'code':
                try:
                    # Join source lines
                    code = ''.join(cell.source) if isinstance(cell.source, list) else cell.source
                    
                    # Capture stdout
                    import io
                    from contextlib import redirect_stdout
                    
                    output_buffer = io.StringIO()
                    with redirect_stdout(output_buffer):
                        # Execute the code
                        exec(code, namespace)
                    
                    # Get captured output
                    output_text = output_buffer.getvalue()
                    
                    # Add execution count
                    cell.execution_count = i + 1
                    
                    # Add output if there was any
                    if output_text:
                        output = v4.new_output(
                            output_type='stream',
                            name='stdout',
                            text=output_text
                        )
                        cell.outputs = [output]
                    else:
                        cell.outputs = []
                    
                except Exception as e:
                    import traceback
                    # Get full traceback
                    tb_lines = traceback.format_exception(type(e), e, e.__traceback__)
                    
                    # Add error output
                    error_output = v4.new_output(
                        output_type='error',
                        ename=type(e).__name__,
                        evalue=str(e),
                        traceback=tb_lines
                    )
                    cell.outputs = [error_output]
                    
                    # Return more detailed error info
                    error_msg = f"Cell {i} execution failed:\n"
                    error_msg += f"Code:\n{cell.source}\n\n"
                    error_msg += f"Error: {type(e).__name__}: {str(e)}\n"
                    error_msg += f"Traceback:\n{''.join(tb_lines)}"
                    raise Exception(error_msg)
        
        # Save executed notebook
        output_path = notebook_path.parent.parent / 'results' / f"{notebook_path.stem}_executed.ipynb"
        output_path.parent.mkdir(exist_ok=True)
        
        with open(output_path, 'w') as f:
            nbformat.write(nb, f)
        
        # Check if result file was created
        result_file = output_path.parent / f"{notebook_path.stem}_result.json"
        
        return True, str(output_path), result_file.exists()
        
    except Exception as e:
        return False, str(e), False

def test_single_notebook():
    """Test execution with a single notebook"""
    test_notebooks = ['phi_0', 'c_3', 'alpha']
    # Support both local and Docker paths
    if Path("/app/constants/notebooks").exists():
        notebook_dir = Path("/app/constants/notebooks")
    else:
        notebook_dir = Path("constants/notebooks")
    
    for nb_name in test_notebooks:
        nb_path = notebook_dir / f"{nb_name}.ipynb"
        if nb_path.exists():
            print(f"🧪 Testing execution with {nb_name} notebook...")
            success, result, has_result = execute_notebook_cells(nb_path)
            if success:
                print(f"✅ Test execution successful!")
                print(f"   Output: {result}")
                print(f"   Result file created: {has_result}")
                # Always return True to continue with batch execution
                return True
            else:
                print(f"❌ Test execution failed: {result}")
                # Try next notebook
                continue
    
    # If no test notebooks found or all failed, still continue
    print("⚠️  Test notebooks not successful, but continuing...")
    return True

def main():
    """Execute all notebooks"""
    # Support both local and Docker paths
    if Path("/app/constants/notebooks").exists():
        notebook_dir = Path("/app/constants/notebooks")
        results_dir = Path("/app/constants/results")
    else:
        notebook_dir = Path("constants/notebooks")
        results_dir = Path("constants/results")
    
    # Ensure results directory exists
    results_dir.mkdir(exist_ok=True)
    
    if not notebook_dir.exists():
        print("❌ Notebooks directory not found!")
        return 1
    
    # Test single notebook first
    if not test_single_notebook():
        print("❌ Single notebook test failed, aborting batch execution")
        return 1
    
    # Get all notebooks
    notebooks = sorted(list(notebook_dir.glob("*.ipynb")))
    total = len(notebooks)
    print(f"\n📊 Found {total} notebooks to execute")
    print("")
    
    executed = 0
    failed = 0
    result_files = 0
    error_details = []
    
    start_time = time.time()
    
    for i, nb_path in enumerate(notebooks, 1):
        const_id = nb_path.stem
        print(f"[{i:3d}/{total}] Executing {const_id}...", end=" ", flush=True)
        
        try:
            success, result, has_result = execute_notebook_cells(nb_path)
            
            if success:
                print("✅", end="")
                executed += 1
                if has_result:
                    print(" 📊", end="")
                    result_files += 1
                print()
            else:
                print("❌")
                error_details.append({
                    'notebook': const_id,
                    'error': result
                })
                failed += 1
                
        except Exception as e:
            print(f"💥 ({str(e)})")
            failed += 1
    
    elapsed = time.time() - start_time
    
    print("")
    print(f"📈 Execution Summary:")
    print(f"   ✅ Successful: {executed}")
    print(f"   ❌ Failed: {failed}")
    print(f"   📊 Total: {total}")
    print(f"   💾 Result files generated: {result_files}")
    print(f"   ⏱️  Time elapsed: {elapsed:.2f} seconds")
    
    # Show first few errors with more detail
    if error_details:
        print(f"\n🔍 Error details ({len(error_details)} total):")
        # Show first 5 errors in detail
        for i, error in enumerate(error_details[:5]):
            print(f"\n{'='*60}")
            print(f"❌ Error {i+1}/{len(error_details)}: {error['notebook']}")
            print(f"{'='*60}")
            # Show full error message, not truncated
            print(error['error'])
            print()
        
        if len(error_details) > 5:
            print(f"\n... and {len(error_details) - 5} more errors")
        
        # Save all errors to file
        error_file = results_dir / 'execution_errors.txt'
        with open(error_file, 'w') as f:
            f.write(f"Notebook Execution Errors - {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"{'='*80}\n\n")
            f.write(f"Summary: {failed} failures out of {total} notebooks\n\n")
            
            for i, error in enumerate(error_details):
                f.write(f"\n{'='*80}\n")
                f.write(f"Error {i+1}: {error['notebook']}\n")
                f.write(f"{'='*80}\n")
                f.write(error['error'])
                f.write(f"\n\n")
        
        print(f"\n📝 All error details saved to: {error_file}")
    
    return 0 if failed == 0 else 1

if __name__ == '__main__':
    sys.exit(main())