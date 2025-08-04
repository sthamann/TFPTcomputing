#!/usr/bin/env python3
"""Extract notebook content for markdown export"""
import json
import sys

if len(sys.argv) != 2:
    print("Usage: extract_notebook.py <notebook_file>")
    sys.exit(1)

notebook_file = sys.argv[1]

try:
    with open(notebook_file, 'r') as f:
        notebook = json.load(f)
    
    cell_num = 0
    for cell in notebook.get('cells', []):
        if cell['cell_type'] == 'markdown':
            print(f"#### Markdown Cell {cell_num}")
            print('```markdown')
            print(''.join(cell['source']))
            print('```')
            print()
        elif cell['cell_type'] == 'code':
            print(f"#### Code Cell {cell_num}")
            print('```python')
            print(''.join(cell['source']))
            print('```')
            print()
        cell_num += 1
except Exception as e:
    print(f"Error reading notebook: {e}")