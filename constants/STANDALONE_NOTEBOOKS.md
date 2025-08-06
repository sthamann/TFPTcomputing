# Self-Contained Notebooks for Physics Constants

## Overview

The system now generates **completely self-contained Jupyter notebooks** for each physics constant by default. These notebooks can be downloaded and run anywhere (Google Colab, local Jupyter, etc.) without requiring any external files or dependencies beyond standard Python libraries.

## System Integration

The self-contained notebook generator is now the **default system** used by the application:
- Integrated into `start-local.sh` for automatic generation and execution
- Maintains the existing folder structure (`constants/notebooks/`, `constants/results/`)
- Uses standard naming conventions (no `_standalone` suffix)
- Fully replaces the old notebook generation system

## Features

### 🎯 **Fully Self-Contained**
- All required constants are calculated within the notebook
- No external JSON files needed
- No custom modules to import
- Only requires NumPy and SciPy (standard in most Python environments)

### 📊 **Complete Dependency Resolution**
- Automatically includes all dependent constants
- Calculates dependencies in the correct order (topological sort)
- Handles circular dependencies intelligently

### 🔧 **Embedded Correction Factors**
- Correction factors are baked into the notebook
- Shows both tree-level and corrected values
- Explains what each correction does

### 📈 **Transparent Calculations**
- Step-by-step calculation process
- Shows intermediate values
- Compares with experimental data
- Checks accuracy targets

## Usage

### Generate All Notebooks
```bash
cd constants
python scripts/generate_self_contained_notebooks.py
```

### Output Location
All self-contained notebooks are saved in:
```
constants/notebooks_standalone/
```

### File Naming
Each notebook is named: `{constant_id}_standalone.ipynb`

Examples:
- `alpha_standalone.ipynb` - Fine structure constant
- `m_b_standalone.ipynb` - Bottom quark mass
- `sin2_theta_w_standalone.ipynb` - Weinberg angle

## Notebook Structure

Each self-contained notebook contains:

1. **Header Section**
   - Constant name and symbol
   - Description
   - Category and units

2. **Imports and Setup**
   - Standard Python imports (numpy, scipy)
   - Physical constants (CODATA values)
   - Theory parameters (c₃, φ₀, M_Pl)
   - Correction factor functions
   - Helper functions (cascade, RG running)

3. **Dependency Calculations**
   - All required constants calculated first
   - Values stored for use in main calculation

4. **Main Calculation**
   - Formula shown clearly
   - Tree-level calculation
   - Correction factors applied (if any)
   - Final result displayed

5. **Experimental Comparison**
   - Comparison with measured values
   - Relative deviation calculated
   - Accuracy check against target

6. **Summary**
   - Lists applied corrections
   - Shows number of dependencies
   - Confirms notebook is self-contained

## Example: Bottom Quark Mass

The `m_b_standalone.ipynb` notebook:

1. **Sets up** all physical constants and theory parameters
2. **Calculates dependencies**: c₃, φ₀, M_Pl
3. **Applies formula**: M_Pl × φ₀¹⁵ / √c₃ × (1 - 2φ₀)
4. **Applies correction**: VEV backreaction (1 - 2φ₀)
5. **Compares** with experimental value: 4.18 GeV
6. **Checks accuracy**: Confirms < 2% deviation

## Benefits

### For Researchers
- Download and run any constant calculation independently
- No need to set up the entire framework
- Perfect for verification and peer review
- Easy to share specific calculations

### For Education
- Students can run calculations on Google Colab
- No installation required
- Clear, step-by-step process
- Self-documenting with explanations

### For Reproducibility
- Every calculation is completely reproducible
- No hidden dependencies
- All parameters explicitly defined
- Version-independent (uses standard Python)

## Technical Details

### Handled Special Cases
- **Circular dependencies**: Fundamental constants (c₃, φ₀, M_Pl, α) are handled specially
- **Self-references**: Automatically detected and skipped
- **Complex formulas**: Properly parsed and converted to Python
- **Correction factors**: Automatically detected from metadata and applied

### Supported Features
- ✅ All 62 physics constants
- ✅ Correction factors (4D-Loop, KK-Geometry, VEV-Backreaction)
- ✅ Cascade calculations (φₙ)
- ✅ RG running (simplified)
- ✅ Experimental comparisons
- ✅ Accuracy checks

## Future Enhancements

Potential improvements:
- Add visualization of results
- Include uncertainty propagation
- Generate LaTeX output
- Create combined notebooks for related constants
- Add more detailed physics explanations

## Conclusion

These self-contained notebooks make the Topological Fixed Point Theory calculations:
- **Accessible** - Run anywhere with Python
- **Transparent** - Every step is visible
- **Reproducible** - No external dependencies
- **Educational** - Clear explanations included
- **Shareable** - Single file contains everything

Perfect for sharing individual calculations, educational purposes, or independent verification of the theory's predictions.