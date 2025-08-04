#!/bin/bash

# Generate comprehensive constants.md export
# This script creates a markdown file with all constant information

set -e

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Generating constants.md export...${NC}"

# Output file
OUTPUT_FILE="constants.md"

# Constants that appear on homepage (from fixpoint-theory.com)
HOMEPAGE_CONSTANTS=(
    "α"
    "α_G"
    "m_p/m_e"
    "m_e"
    "m_μ"
    "m_τ"
    "τ_μ"
    "τ_τ"
    "m_p"
    "m_c"
    "m_b"
    "m_u"
    "θ_c"
    "m_s/m_d"
    "V_us/V_ud"
    "V_cb"
    "V_td/V_ts"
    "ε_K"
    "M_W"
    "M_Z"
    "v_H"
    "G_F"
    "sin²θ_W"
    "ρ"
    "Δa_μ"
    "α_s"
    "Λ_QCD"
    "μ_p/μ_N"
    "f_π/Λ_QCD"
    "Δm_n-p"
    "Σm_ν"
    "Ω_b"
    "T_γ0"
    "T_ν"
    "η_B"
    "r"
)

# Working constants (based on previous test results)
WORKING_CONSTANTS=(
    "phi_0"
    "c_3"
    "alpha"
    "gamma_function"
    "gamma_i"
    "m_p_m_e_ratio"
    "phi"
)

# Function to check if array contains value
contains() {
    local value="$1"
    shift
    local array=("$@")
    for item in "${array[@]}"; do
        if [[ "$item" == "$value" ]]; then
            return 0
        fi
    done
    return 1
}

# Function to process a single constant
process_constant() {
    local json_file="$1"
    local const_id=$(basename "$json_file" .json)
    
    echo -e "${YELLOW}Processing $const_id...${NC}"
    
    # Read JSON data
    local json_content=$(cat "$json_file")
    
    # Extract fields from JSON using python
    local name=$(echo "$json_content" | python3 -c "import json, sys; data=json.load(sys.stdin); print(data.get('name', 'Unknown'))")
    local symbol=$(echo "$json_content" | python3 -c "import json, sys; data=json.load(sys.stdin); print(data.get('symbol', 'Unknown'))")
    local category=$(echo "$json_content" | python3 -c "import json, sys; data=json.load(sys.stdin); print(data.get('category', 'Unknown'))")
    local dependencies=$(echo "$json_content" | python3 -c "import json, sys; data=json.load(sys.stdin); deps=data.get('dependencies', []); print(', '.join(deps) if deps else 'None')")
    
    # Check if constant calculates
    local calculates="No"
    if contains "$const_id" "${WORKING_CONSTANTS[@]}"; then
        calculates="Yes"
    fi
    
    # Check if has results
    local has_results="No"
    if [[ -f "results/${const_id}_result.json" ]]; then
        has_results="Yes"
    fi
    
    # Check if on homepage
    local on_homepage="No"
    if contains "$symbol" "${HOMEPAGE_CONSTANTS[@]}"; then
        on_homepage="Yes"
    fi
    
    # Write to output
    {
        echo "## $name ($symbol)"
        echo ""
        echo "**Category:** $category"
        echo "**Filename:** $json_file"
        echo "**Dependencies:** $dependencies"
        echo "**Calculates:** $calculates"
        echo "**Has Results:** $has_results"
        echo "**On Homepage:** $on_homepage"
        echo ""
        echo "### JSON Definition"
        echo '```json'
        echo "$json_content" | python3 -m json.tool
        echo '```'
        echo ""
        
        # Include notebook source if it exists
        if [[ -f "notebooks/${const_id}.ipynb" ]]; then
            echo "### Notebook Source"
            echo ""
            
            # Extract code cells from notebook using Python helper
            python3 extract_notebook.py "notebooks/${const_id}.ipynb"
        else
            echo "### Notebook Source"
            echo "*No notebook generated for this constant*"
            echo ""
        fi
        
        echo "---"
        echo ""
    } >> "$OUTPUT_FILE.tmp"
    
    return 0
}

# Initialize output file
cat > "$OUTPUT_FILE.tmp" << EOF
# Complete Constants Export

Generated: $(date '+%Y-%m-%d %H:%M:%S')

This document contains all constant definitions, their JSON data, and generated notebook source code.

## Table of Contents

1. [Constants on Homepage](#constants-on-homepage)
2. [Other Constants](#other-constants)

---

EOF

# First section: Constants on homepage
echo "# Constants on Homepage" >> "$OUTPUT_FILE.tmp"
echo "" >> "$OUTPUT_FILE.tmp"
echo "These constants appear on https://fixpoint-theory.com/constants" >> "$OUTPUT_FILE.tmp"
echo "" >> "$OUTPUT_FILE.tmp"

# Process all JSON files and separate by homepage presence
homepage_files=()
other_files=()

for json_file in data/*.json; do
    if [[ -f "$json_file" ]]; then
        # Get symbol to check if on homepage
        symbol=$(cat "$json_file" | python3 -c "import json, sys; data=json.load(sys.stdin); print(data.get('symbol', ''))")
        
        if contains "$symbol" "${HOMEPAGE_CONSTANTS[@]}"; then
            homepage_files+=("$json_file")
        else
            other_files+=("$json_file")
        fi
    fi
done

# Process homepage constants
echo -e "${BLUE}Processing constants on homepage...${NC}"
for json_file in "${homepage_files[@]}"; do
    process_constant "$json_file"
done

# Second section: Other constants
echo "# Other Constants" >> "$OUTPUT_FILE.tmp"
echo "" >> "$OUTPUT_FILE.tmp"
echo "These constants do not appear on the homepage" >> "$OUTPUT_FILE.tmp"
echo "" >> "$OUTPUT_FILE.tmp"

echo -e "${BLUE}Processing other constants...${NC}"
for json_file in "${other_files[@]}"; do
    process_constant "$json_file"
done

# Move temp file to final location
mv "$OUTPUT_FILE.tmp" "$OUTPUT_FILE"

# Summary
total_constants=$(ls data/*.json 2>/dev/null | wc -l)
homepage_count=${#homepage_files[@]}
other_count=${#other_files[@]}

echo -e "${GREEN}✅ Export complete!${NC}"
echo -e "   Output file: ${BLUE}$OUTPUT_FILE${NC}"
echo -e "   Total constants: $total_constants"
echo -e "   On homepage: $homepage_count"
echo -e "   Other: $other_count"
echo ""
echo -e "File size: $(du -h "$OUTPUT_FILE" | cut -f1)"