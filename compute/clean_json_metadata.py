#!/usr/bin/env python3
"""
Clean JSON metadata files to remove redundant fields and properly structure correction factors.
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, Optional, List

# Define which correction factors apply to which constants
CORRECTION_FACTORS = {
    # 4D-Loop corrections (1 - 2c₃)
    '4D-Loop': {
        'formula': '1 - 2*c_3',
        'value': 0.9204225284540524,
        'description': 'One-loop renormalization in 4 dimensions',
        'constants': ['omega_b', 'm_mu', 'm_e']
    },
    
    # KK-Geometry corrections (1 - 4c₃)
    'KK-Geometry': {
        'formula': '1 - 4*c_3',
        'value': 0.8408450569081046,
        'description': 'First Kaluza-Klein shell on S¹',
        'constants': ['m_u']
    },
    
    # VEV-Backreaction corrections
    'VEV-Backreaction-minus': {
        'formula': '1 - 2*phi_0',
        'value': 0.893658,
        'description': 'VEV backreaction with k=-2',
        'constants': ['m_b']
    },
    
    'VEV-Backreaction-plus': {
        'formula': '1 + 2*phi_0',
        'value': 1.106342,
        'description': 'VEV backreaction with k=+2',
        'constants': ['epsilon_k']
    }
}

def get_correction_factors_for_constant(constant_id: str) -> List[Dict[str, Any]]:
    """Get the correction factors that apply to a given constant."""
    factors = []
    for factor_name, factor_info in CORRECTION_FACTORS.items():
        if constant_id in factor_info['constants']:
            factors.append({
                'name': factor_name,
                'formula': factor_info['formula'],
                'description': factor_info['description']
            })
    return factors

def get_measured_value_from_sources(sources: List[Dict]) -> Optional[float]:
    """Extract the best measured/experimental value from sources."""
    # Priority: Look for PDG, Planck, or experimental sources
    experimental_sources = ['PDG', 'Planck', 'CODATA', 'Lattice', 'CMS', 'ATLAS', 'LHCb']
    
    for source in sources:
        # Check if this is an experimental source
        if any(exp in source.get('name', '') for exp in experimental_sources):
            if 'value' in source:
                return source['value']
    
    # If no experimental source found, take the first non-TFPT source
    for source in sources:
        if 'Topological Fixed Point Theory' not in source.get('name', ''):
            if 'value' in source:
                return source['value']
    
    return None

def clean_constant_json(file_path: Path) -> bool:
    """Clean a single constant JSON file."""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        modified = False
        
        # Get the constant ID
        constant_id = data.get('id', '')
        
        # Clean metadata - remove redundant fields
        if 'metadata' in data:
            metadata = data['metadata']
            fields_to_remove = ['theoretical_value', 'latex', 'calculated_value']
            
            for field in fields_to_remove:
                if field in metadata:
                    del metadata[field]
                    modified = True
            
            # Remove old single correction_factor field first
            if 'correction_factor' in metadata:
                del metadata['correction_factor']
                modified = True
            
            # Add or update correction_factors field
            correction_factors = get_correction_factors_for_constant(constant_id)
            if correction_factors:
                metadata['correction_factors'] = correction_factors
                modified = True
                
            # Ensure we don't have correction_factors for constants that don't need them
            if not correction_factors and 'correction_factors' in metadata:
                del metadata['correction_factors']
                modified = True
        
        # Remove calculated_value from root level
        if 'calculated_value' in data:
            del data['calculated_value']
            modified = True
            
        # Remove experimental_value from root level - should come from sources
        if 'experimental_value' in data:
            del data['experimental_value']
            modified = True
            
        # Remove relative_error and accuracy_met from root level
        if 'relative_error' in data:
            del data['relative_error']
            modified = True
        if 'accuracy_met' in data:
            del data['accuracy_met']
            modified = True
        
        # Add measured_value to metadata from sources
        measured_value = get_measured_value_from_sources(data.get('sources', []))
        if measured_value is not None:
            if 'metadata' not in data:
                data['metadata'] = {}
            data['metadata']['measured_value'] = measured_value
            modified = True
        
        if modified:
            # Write back the cleaned data
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Clean all constant JSON files."""
    constants_dir = Path(__file__).parent.parent / 'constants' / 'data'
    
    if not constants_dir.exists():
        print(f"Constants directory not found: {constants_dir}")
        return
    
    json_files = list(constants_dir.glob('*.json'))
    print(f"Found {len(json_files)} JSON files to process")
    
    cleaned_count = 0
    for json_file in json_files:
        print(f"Processing {json_file.name}...", end=' ')
        if clean_constant_json(json_file):
            print("✓ Cleaned")
            cleaned_count += 1
        else:
            print("- No changes needed")
    
    print(f"\n✅ Cleaned {cleaned_count} files")
    
    # Print summary of constants with correction factors
    print("\n📊 Constants with correction factors:")
    for factor_name, factor_info in CORRECTION_FACTORS.items():
        if factor_info['constants']:
            print(f"\n{factor_name} ({factor_info['formula']}):")
            print(f"  Description: {factor_info['description']}")
            print(f"  Applied to: {', '.join(factor_info['constants'])}")

if __name__ == "__main__":
    main()