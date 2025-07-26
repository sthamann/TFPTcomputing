#!/usr/bin/env python3
"""
Validate calculated constants against experimental values
"""
import json
import math
from pathlib import Path

def load_constant(constant_id):
    """Load constant data from JSON"""
    path = Path(f"constants/data/{constant_id}.json")
    with open(path, 'r') as f:
        return json.load(f)

def calculate_value(constant_id):
    """Calculate constant value based on formula"""
    const = load_constant(constant_id)
    
    # Simple calculations for fundamental constants
    if constant_id == "phi":
        return (1 + math.sqrt(5)) / 2
    elif constant_id == "phi_0":
        # φ₀ is the topological VEV from the cubic equation
        # This is a fundamental parameter, not calculated here
        return 0.053171
    elif constant_id == "c_3":
        return 1 / (8 * math.pi)
    elif constant_id == "sin2_theta_w":
        phi_0 = calculate_value("phi_0")
        return math.sqrt(phi_0)
    elif constant_id == "alpha_s":
        phi_0 = calculate_value("phi_0")
        return math.sqrt(phi_0) / 2
    elif constant_id == "eta_b":
        c_3 = calculate_value("c_3")
        return 4 * c_3**7
    else:
        return None

def main():
    """Validate key constants"""
    print("Validating Topological Constants")
    print("=" * 50)
    
    # Test cases
    test_constants = [
        ("phi", "Golden Ratio"),
        ("phi_0", "Golden Angle"),
        ("c_3", "Topological Fixed Point"),
        ("sin2_theta_w", "Weinberg Angle"),
        ("alpha_s", "Strong Coupling"),
        ("eta_b", "Baryon Asymmetry")
    ]
    
    for const_id, name in test_constants:
        try:
            const_data = load_constant(const_id)
            calculated = calculate_value(const_id)
            if calculated is None:
                continue
                
            experimental = const_data['sources'][0]['value']
            error = abs((calculated - experimental) / experimental) * 100
            
            print(f"\n{name} ({const_data['symbol']}):")
            print(f"  Calculated: {calculated:.10e}")
            print(f"  Experimental: {experimental:.10e}")
            print(f"  Relative Error: {error:.2f}%")
            
            # Check against accuracy target
            target = const_data['accuracyTarget'] * 100  # Convert to percentage
            if error <= target:
                print(f"  ✅ Within target accuracy ({target}%)")
            else:
                print(f"  ⚠️  Exceeds target accuracy ({target}%)")
                
        except Exception as e:
            print(f"\n❌ Error validating {const_id}: {e}")
    
    print("\n" + "=" * 50)
    print("Note: Full calculations with dependencies require the compute service")

if __name__ == "__main__":
    main() 