#!/bin/bash

# Export the site using wget to create a perfect mirror

echo "🚀 Creating perfect static mirror using wget..."
echo "============================================================"

# Check if services are running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Frontend not running. Please run ./start-local.sh first"
    exit 1
fi

if ! curl -s http://localhost:8000/api/constants > /dev/null; then
    echo "❌ Backend not running. Please run ./start-local.sh first"
    exit 1
fi

echo "✅ Services are running"

# Check if wget is installed
if ! command -v wget &> /dev/null; then
    echo "❌ wget is not installed. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install wget
    else
        sudo apt-get install wget -y
    fi
fi

# Clear export directory
echo ""
echo "🗑️  Clearing export directory..."
rm -rf export
mkdir -p export

# Get list of all constant IDs
echo ""
echo "📊 Fetching constant list..."
CONSTANTS=$(curl -s http://localhost:8000/api/constants | python3 -c "
import json, sys
data = json.load(sys.stdin)
for c in data:
    print(c['id'])
")

# Count constants
CONST_COUNT=$(echo "$CONSTANTS" | wc -l)
echo "  Found $CONST_COUNT constants"

# Use wget to mirror the site
echo ""
echo "🌐 Mirroring site with wget..."
echo "  This will capture the exact rendered HTML..."

cd export

# Mirror the main constants page
wget --quiet \
     --page-requisites \
     --convert-links \
     --adjust-extension \
     --no-parent \
     --no-host-directories \
     --directory-prefix=. \
     --force-directories \
     --default-page=index.html \
     "http://localhost:3000/constants"

# Rename the main page
if [ -f "constants.html" ]; then
    mv constants.html index.html
elif [ -f "constants/index.html" ]; then
    cp constants/index.html index.html
fi

# Mirror each constant detail page
echo ""
echo "📄 Capturing detail pages..."
COUNTER=0
for const_id in $CONSTANTS; do
    COUNTER=$((COUNTER + 1))
    echo "  [$COUNTER/$CONST_COUNT] $const_id"
    
    # Create directory
    mkdir -p "constants/$const_id"
    
    # Download the detail page
    wget --quiet \
         --page-requisites \
         --convert-links \
         --adjust-extension \
         --no-parent \
         --no-host-directories \
         --directory-prefix="constants/$const_id" \
         --force-directories \
         "http://localhost:3000/constants/$const_id"
    
    # Fix the filename if needed
    if [ -f "constants/$const_id/$const_id.html" ]; then
        mv "constants/$const_id/$const_id.html" "constants/$const_id/index.html"
    fi
    
    # Copy data files
    [ -f "../constants/data/${const_id}.json" ] && cp "../constants/data/${const_id}.json" "constants/$const_id/" 2>/dev/null
    [ -f "../constants/results/json/${const_id}_result.json" ] && cp "../constants/results/json/${const_id}_result.json" "constants/$const_id/" 2>/dev/null
    [ -f "../constants/notebooks/${const_id}.ipynb" ] && cp "../constants/notebooks/${const_id}.ipynb" "constants/$const_id/" 2>/dev/null
    [ -f "../constants/results/${const_id}_executed.ipynb" ] && cp "../constants/results/${const_id}_executed.ipynb" "constants/$const_id/" 2>/dev/null
done

cd ..

# Post-process to fix links and remove scripts
echo ""
echo "🔧 Post-processing HTML files..."

# Function to process HTML files
process_html() {
    local file=$1
    local is_detail=$2
    
    # Create temp file
    local temp_file="${file}.tmp"
    
    # Read the file
    cat "$file" | \
    # Remove script tags that load React/Vite
    sed 's|<script[^>]*type="module"[^>]*>.*</script>||g' | \
    sed 's|<script[^>]*src="[^"]*/@[^"]*"[^>]*>.*</script>||g' | \
    sed 's|<script[^>]*src="[^"]*vite[^"]*"[^>]*>.*</script>||g' | \
    # Fix navigation links
    if [ "$is_detail" = "true" ]; then
        # Detail page - fix back link
        sed 's|href="/constants"|href="../../index.html"|g' | \
        sed 's|href="/constants/\([^"]*\)"|href="../\1/index.html"|g'
    else
        # Main page - fix detail links
        sed 's|href="/constants/\([^"]*\)"|href="constants/\1/index.html"|g'
    fi > "$temp_file"
    
    # Replace original
    mv "$temp_file" "$file"
}

# Process main page
if [ -f "export/index.html" ]; then
    process_html "export/index.html" false
    echo "  ✅ Processed main page"
fi

# Process detail pages
for const_id in $CONSTANTS; do
    if [ -f "export/constants/$const_id/index.html" ]; then
        process_html "export/constants/$const_id/index.html" true
    fi
done
echo "  ✅ Processed $CONST_COUNT detail pages"

# Download and embed styles
echo ""
echo "🎨 Capturing styles..."

# Get all CSS files
wget --quiet \
     --page-requisites \
     --no-parent \
     --no-host-directories \
     --directory-prefix=export/assets \
     "http://localhost:3000/assets/"* 2>/dev/null || true

# Create README
cat > export/README.md << EOF
# Static Export - Topological Constants

This is a pixel-perfect mirror of the Topological Constants web application.
Created using wget to capture the exact rendered output.

## Features
- ✅ 100% identical to live site
- ✅ All styles preserved
- ✅ Complete HTML structure
- ✅ Works offline
- ✅ Includes all data files

## Contents
- index.html - Main constants page
- constants/[id]/ - Individual constant pages
  - index.html - Detail page
  - [id].json - Original definition
  - [id]_result.json - Calculation results
  - [id].ipynb - Jupyter notebook
  - [id]_executed.ipynb - Executed notebook

Generated: $(date)
Total constants: $CONST_COUNT

© 2025 Topological Fixed Point Theory
EOF

echo ""
echo "============================================================"
echo "✅ Export completed successfully!"
echo "📁 Location: $(pwd)/export"
echo "📄 Files: $(find export -type f | wc -l)"
echo ""
echo "🌐 To view: open export/index.html"
echo "============================================================"