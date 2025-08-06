#!/usr/bin/env python3
"""
Analyze dependencies between constants and create a fixing order.
"""

import json
from pathlib import Path
from collections import defaultdict, deque

def load_constants_data():
    """Load all constant definitions."""
    data_dir = Path('data')
    constants = {}
    
    for json_file in data_dir.glob('*.json'):
        with open(json_file) as f:
            data = json.load(f)
            const_id = data['id']
            constants[const_id] = {
                'dependencies': data.get('dependencies', []),
                'formula': data.get('formula', ''),
                'expected': None,
                'category': data.get('category', 'unknown')
            }
            
            # Get expected value
            if 'sources' in data and data['sources']:
                for source in data['sources']:
                    if 'value' in source:
                        constants[const_id]['expected'] = source['value']
                        break
    
    return constants

def analyze_dependencies(constants):
    """Analyze dependency structure."""
    
    # Find constants with no dependencies (roots)
    roots = []
    for const_id, data in constants.items():
        if not data['dependencies']:
            roots.append(const_id)
    
    # Build reverse dependency map (who depends on me)
    dependents = defaultdict(list)
    for const_id, data in constants.items():
        for dep in data['dependencies']:
            if dep in constants:  # Only if dependency exists
                dependents[dep].append(const_id)
    
    # Calculate dependency levels using BFS
    levels = {}
    queue = deque([(root, 0) for root in roots])
    visited = set()
    
    while queue:
        const_id, level = queue.popleft()
        
        if const_id in visited:
            continue
        visited.add(const_id)
        
        if const_id not in levels or level < levels[const_id]:
            levels[const_id] = level
        
        # Add dependents to queue
        for dependent in dependents[const_id]:
            if dependent not in visited:
                # Check if all dependencies of dependent have been visited
                deps_ready = all(dep in visited or dep not in constants 
                                for dep in constants[dependent]['dependencies'])
                if deps_ready:
                    queue.append((dependent, level + 1))
    
    return roots, dependents, levels

def get_error_report():
    """Get current error status from result files."""
    results_dir = Path('results/json')
    errors = {}
    
    for result_file in results_dir.glob('*_result.json'):
        const_id = result_file.stem.replace('_result', '')
        
        try:
            with open(result_file) as f:
                result = json.load(f)
            
            if 'value' in result:
                errors[const_id] = result['value']
        except:
            errors[const_id] = None
    
    return errors

def main():
    constants = load_constants_data()
    roots, dependents, levels = analyze_dependencies(constants)
    errors = get_error_report()
    
    print("=" * 80)
    print("DEPENDENCY ANALYSIS FOR CONSTANT FIXING")
    print("=" * 80)
    
    # Group constants by level
    by_level = defaultdict(list)
    for const_id, level in levels.items():
        by_level[level].append(const_id)
    
    # Also include constants not in levels (isolated or circular deps)
    orphans = []
    for const_id in constants:
        if const_id not in levels:
            orphans.append(const_id)
    
    print(f"\nTotal constants: {len(constants)}")
    print(f"Root constants (no dependencies): {len(roots)}")
    print(f"Orphan/circular constants: {len(orphans)}")
    
    # Check which constants have errors
    data_dir = Path('data')
    results_dir = Path('results/json')
    
    critical_errors = []
    moderate_errors = []
    minor_errors = []
    
    for const_id in constants:
        result_file = results_dir / f'{const_id}_result.json'
        data_file = data_dir / f'{const_id}.json'
        
        if result_file.exists() and data_file.exists():
            with open(result_file) as f:
                result = json.load(f)
            with open(data_file) as f:
                data = json.load(f)
            
            expected = None
            if 'sources' in data and data['sources']:
                for source in data['sources']:
                    if 'value' in source:
                        expected = source['value']
                        break
            
            if expected and 'value' in result:
                calc = result['value']
                if isinstance(calc, (int, float)) and isinstance(expected, (int, float)):
                    if expected != 0:
                        rel_error = abs(calc - expected) / abs(expected)
                        
                        if rel_error > 1.0:  # >100% error
                            critical_errors.append((const_id, rel_error))
                        elif rel_error > 0.1:  # >10% error
                            moderate_errors.append((const_id, rel_error))
                        elif rel_error > 0.01:  # >1% error
                            minor_errors.append((const_id, rel_error))
    
    print(f"\nError Summary:")
    print(f"  Critical (>100% error): {len(critical_errors)}")
    print(f"  Moderate (10-100% error): {len(moderate_errors)}")
    print(f"  Minor (1-10% error): {len(minor_errors)}")
    
    print("\n" + "=" * 80)
    print("RECOMMENDED FIXING ORDER")
    print("=" * 80)
    
    # Sort each level by error magnitude
    for level in sorted(by_level.keys()):
        level_constants = by_level[level]
        
        # Get errors for this level
        level_with_errors = []
        for const_id in level_constants:
            error_val = None
            for cid, err in critical_errors + moderate_errors + minor_errors:
                if cid == const_id:
                    error_val = err
                    break
            level_with_errors.append((const_id, error_val))
        
        # Sort by error (highest first)
        level_with_errors.sort(key=lambda x: x[1] if x[1] else 0, reverse=True)
        
        print(f"\n📍 Level {level} ({len(level_constants)} constants):")
        print("-" * 40)
        
        for const_id, error_val in level_with_errors[:10]:  # Show top 10
            deps = constants[const_id]['dependencies']
            deps_str = f" <- {', '.join(deps)}" if deps else " (no dependencies)"
            
            error_str = ""
            if error_val:
                if error_val > 1.0:
                    error_str = f" 🔴 {error_val:.0%} error"
                elif error_val > 0.1:
                    error_str = f" 🟡 {error_val:.0%} error"
                else:
                    error_str = f" 🟢 {error_val:.1%} error"
            
            print(f"  {const_id}{deps_str}{error_str}")
    
    if orphans:
        print(f"\n⚠️ Orphan/Circular Dependencies:")
        for const_id in orphans:
            deps = constants[const_id]['dependencies']
            print(f"  {const_id} <- {', '.join(deps)}")
    
    # Identify critical constants to fix first
    print("\n" + "=" * 80)
    print("🚨 PRIORITY FIXES (Critical errors in early levels)")
    print("=" * 80)
    
    priority_fixes = []
    
    # Check each level for critical errors
    for level in range(min(3, max(by_level.keys()) + 1)):  # First 3 levels
        if level in by_level:
            for const_id in by_level[level]:
                for cid, err in critical_errors:
                    if cid == const_id:
                        priority_fixes.append((const_id, level, err))
                        break
    
    priority_fixes.sort(key=lambda x: (x[1], -x[2]))  # Sort by level, then error
    
    for const_id, level, error in priority_fixes[:15]:
        formula = constants[const_id]['formula']
        print(f"\n{const_id} (Level {level}, {error:.0%} error):")
        print(f"  Formula: {formula[:100]}...")
        print(f"  Dependencies: {', '.join(constants[const_id]['dependencies']) or 'none'}")

if __name__ == '__main__':
    main()