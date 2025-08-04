#!/usr/bin/env python3
"""
Extract JSON constant definitions from constants.md and save them as individual JSON files
"""
import json
import re
import os
from pathlib import Path

def extract_json_blocks_from_markdown(markdown_file):
    """Extract all JSON code blocks from markdown file"""
    with open(markdown_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all JSON code blocks
    json_pattern = r'```json\s*\n(.*?)\n```'
    matches = re.findall(json_pattern, content, re.DOTALL)
    
    json_blocks = []
    for match in matches:
        try:
            # Parse JSON to validate it
            data = json.loads(match)
            json_blocks.append(data)
        except json.JSONDecodeError as e:
            print(f"Warning: Invalid JSON block found: {e}")
            continue
    
    return json_blocks

def save_constants_to_files(json_blocks, output_dir):
    """Save each constant definition to its own JSON file"""
    # Create output directory if it doesn't exist
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    saved_files = []
    for block in json_blocks:
        if 'id' in block:
            # This is a constant definition
            filename = f"{block['id']}.json"
            filepath = os.path.join(output_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(block, f, indent=2, ensure_ascii=False)
            
            saved_files.append(filename)
            print(f"Saved: {filename}")
    
    return saved_files

def main():
    """Main function"""
    # Paths
    script_dir = Path(__file__).parent
    markdown_file = script_dir / 'constants.md'
    output_dir = script_dir / 'data'
    
    if not markdown_file.exists():
        print(f"Error: {markdown_file} not found!")
        return
    
    print(f"Extracting JSON blocks from {markdown_file}")
    json_blocks = extract_json_blocks_from_markdown(markdown_file)
    print(f"Found {len(json_blocks)} JSON blocks")
    
    print(f"\nSaving constants to {output_dir}")
    saved_files = save_constants_to_files(json_blocks, output_dir)
    print(f"\nSuccessfully saved {len(saved_files)} constant definitions")

if __name__ == "__main__":
    main()