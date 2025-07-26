#!/usr/bin/env python3
"""
Comprehensive test script for all constants calculations
Tests each constant's notebook execution and reports failures
"""

import json
import os
import sys
import subprocess
from pathlib import Path
import traceback

class ConstantTester:
    def __init__(self):
        self.results = {
            'passed': [],
            'failed': [],
            'missing_notebook': [],
            'missing_data': []
        }
        
    def test_constant(self, const_id):
        """Test a single constant calculation"""
        data_file = f"constants/data/{const_id}.json"
        notebook_file = f"constants/notebooks/{const_id}.ipynb"
        output_file = f"compute/results/{const_id}_test.ipynb"
        
        # Check if data file exists
        if not os.path.exists(data_file):
            self.results['missing_data'].append(const_id)
            return False
            
        # Check if notebook exists
        if not os.path.exists(notebook_file):
            self.results['missing_notebook'].append(const_id)
            return False
            
        # Create output directory if needed
        os.makedirs("compute/results", exist_ok=True)
        
        # Try to execute the notebook
        try:
            # Use subprocess to run papermill
            cmd = [
                sys.executable, "-m", "papermill",
                notebook_file,
                output_file,
                "--kernel", "python3",
                "--cwd", "constants/notebooks"
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30  # 30 second timeout per notebook
            )
            
            if result.returncode == 0:
                self.results['passed'].append(const_id)
                # Clean up successful test output
                if os.path.exists(output_file):
                    os.remove(output_file)
                return True
            else:
                error_info = {
                    'id': const_id,
                    'error': result.stderr,
                    'stdout': result.stdout
                }
                self.results['failed'].append(error_info)
                return False
                
        except subprocess.TimeoutExpired:
            error_info = {
                'id': const_id,
                'error': 'Timeout: Notebook execution took too long'
            }
            self.results['failed'].append(error_info)
            return False
        except Exception as e:
            error_info = {
                'id': const_id,
                'error': f"Exception: {str(e)}\n{traceback.format_exc()}"
            }
            self.results['failed'].append(error_info)
            return False
    
    def get_all_constants(self):
        """Get list of all constants from data directory"""
        constants = []
        data_dir = "constants/data"
        
        if os.path.exists(data_dir):
            for file in os.listdir(data_dir):
                if file.endswith('.json'):
                    const_id = file[:-5]  # Remove .json extension
                    constants.append(const_id)
        
        return sorted(constants)
    
    def run_tests(self):
        """Run tests for all constants"""
        constants = self.get_all_constants()
        total = len(constants)
        
        print(f"Testing {total} constants...\n")
        
        for i, const_id in enumerate(constants, 1):
            # Load constant info for display
            try:
                with open(f"constants/data/{const_id}.json", 'r') as f:
                    data = json.load(f)
                    symbol = data.get('symbol', const_id)
            except:
                symbol = const_id
            
            print(f"[{i}/{total}] Testing {symbol} ({const_id})... ", end='', flush=True)
            
            if self.test_constant(const_id):
                print("✓ PASSED")
            else:
                print("✗ FAILED")
        
        self.print_summary()
        self.save_failure_report()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        
        total = (len(self.results['passed']) + 
                len(self.results['failed']) + 
                len(self.results['missing_notebook']) +
                len(self.results['missing_data']))
        
        print(f"Total constants: {total}")
        print(f"✓ Passed: {len(self.results['passed'])}")
        print(f"✗ Failed: {len(self.results['failed'])}")
        print(f"📄 Missing notebook: {len(self.results['missing_notebook'])}")
        print(f"❌ Missing data: {len(self.results['missing_data'])}")
        
        # List failures by category
        if self.results['failed']:
            print("\n" + "-"*60)
            print("FAILED CALCULATIONS:")
            for fail in self.results['failed']:
                print(f"\n• {fail['id']}:")
                # Extract key error message
                error_lines = fail['error'].split('\n')
                for line in error_lines:
                    if 'ValueError' in line or 'Exception' in line or 'Error' in line:
                        print(f"  {line.strip()}")
                        break
        
        if self.results['missing_notebook']:
            print("\n" + "-"*60)
            print("MISSING NOTEBOOKS:")
            for const_id in self.results['missing_notebook']:
                print(f"• {const_id}")
        
        if self.results['missing_data']:
            print("\n" + "-"*60)
            print("MISSING DATA FILES:")
            for const_id in self.results['missing_data']:
                print(f"• {const_id}")
    
    def save_failure_report(self):
        """Save detailed failure report"""
        report_file = "constant_test_report.json"
        
        # Prepare report data
        report = {
            'summary': {
                'total': len(self.get_all_constants()),
                'passed': len(self.results['passed']),
                'failed': len(self.results['failed']),
                'missing_notebook': len(self.results['missing_notebook']),
                'missing_data': len(self.results['missing_data'])
            },
            'passed': self.results['passed'],
            'failed': self.results['failed'],
            'missing_notebook': self.results['missing_notebook'],
            'missing_data': self.results['missing_data']
        }
        
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📊 Detailed report saved to: {report_file}")
        
        # Create a simple fix list
        fix_list_file = "constants_to_fix.txt"
        with open(fix_list_file, 'w') as f:
            f.write("Constants that need fixing:\n")
            f.write("="*40 + "\n\n")
            
            if self.results['failed']:
                f.write("FAILED CALCULATIONS:\n")
                for fail in self.results['failed']:
                    f.write(f"- {fail['id']}\n")
                f.write("\n")
            
            if self.results['missing_notebook']:
                f.write("MISSING NOTEBOOKS:\n")
                for const_id in self.results['missing_notebook']:
                    f.write(f"- {const_id}\n")
                f.write("\n")
        
        print(f"📝 Fix list saved to: {fix_list_file}")


def main():
    """Main function"""
    print("🧪 Constant Calculation Test Suite")
    print("="*60)
    
    # Check if papermill is installed
    try:
        import papermill
    except ImportError:
        print("❌ Error: papermill not installed!")
        print("Please run: pip install papermill")
        sys.exit(1)
    
    # Run tests
    tester = ConstantTester()
    tester.run_tests()
    
    # Return exit code based on failures
    if tester.results['failed'] or tester.results['missing_notebook']:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main() 