#!/bin/bash

# Export the frontend as a static build with all data pre-rendered

echo "🚀 Creating static frontend export with pre-rendered data..."
echo "============================================================"

# Check if services are running
if ! curl -s http://localhost:8000/api/constants > /dev/null; then
    echo "❌ Backend not running. Please run ./start-local.sh first"
    exit 1
fi

echo "✅ Backend is running"

# Clear export directory
rm -rf export
mkdir -p export

# Step 1: Fetch all data and save it
echo ""
echo "📊 Fetching all data from backend..."
mkdir -p export/data

# Get all constants data
curl -s http://localhost:8000/api/constants > export/data/constants.json
echo "  ✅ Fetched constants data"

# Get theory data
curl -s http://localhost:8000/api/theory/cascade/30 > export/data/cascade.json
curl -s http://localhost:8000/api/theory/special-scales > export/data/special-scales.json
curl -s http://localhost:8000/api/theory/correction-factors > export/data/correction-factors.json
curl -s http://localhost:8000/api/theory/rg-running/91.1876 > export/data/rg-running.json
echo "  ✅ Fetched theory data"

# Step 2: Create a modified frontend that uses the pre-fetched data
echo ""
echo "🔧 Creating static frontend build..."

# Copy frontend to temp directory
cp -r frontend export/frontend-static

# Create a static data provider
cat > export/frontend-static/src/lib/staticData.js << 'EOF'
// Static data provider for export
import constantsData from '../../../data/constants.json';
import cascadeData from '../../../data/cascade.json';
import specialScalesData from '../../../data/special-scales.json';
import correctionFactorsData from '../../../data/correction-factors.json';
import rgRunningData from '../../../data/rg-running.json';

export const staticApi = {
    getConstants: async () => constantsData,
    getConstant: async (id) => constantsData.find(c => c.id === id),
    getCascade: async () => cascadeData,
    getSpecialScales: async () => specialScalesData,
    getCorrectionFactors: async () => correctionFactorsData,
    getRGRunning: async () => rgRunningData
};
EOF

# Modify the API to use static data
cat > export/frontend-static/src/lib/api-static.js << 'EOF'
// Static API for export
import { staticApi } from './staticData';

const api = {
    getConstants: staticApi.getConstants,
    getConstant: staticApi.getConstant,
    calculateConstant: async (id) => {
        const constant = await staticApi.getConstant(id);
        return constant?.lastCalculation || {};
    }
};

export const theoryApi = {
    getCascadeLevels: staticApi.getCascade,
    getSpecialScales: staticApi.getSpecialScales,
    getRGRunning: staticApi.getRGRunning,
    getCorrectionFactors: staticApi.getCorrectionFactors
};

export default api;
EOF

# Update imports to use static API
echo ""
echo "📝 Updating imports for static build..."

# Replace API imports in all components
find export/frontend-static/src -name "*.jsx" -o -name "*.js" | while read file; do
    # Skip the static files we just created
    if [[ "$file" == *"staticData.js"* ]] || [[ "$file" == *"api-static.js"* ]]; then
        continue
    fi
    
    # Replace api imports
    sed -i '' "s|from '../lib/api'|from '../lib/api-static'|g" "$file" 2>/dev/null || true
    sed -i '' "s|from './api'|from './api-static'|g" "$file" 2>/dev/null || true
    sed -i '' "s|from '../../lib/api'|from '../../lib/api-static'|g" "$file" 2>/dev/null || true
done

# Build the static frontend
echo ""
echo "🏗️  Building static frontend..."
cd export/frontend-static

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "  📦 Installing dependencies..."
    npm install --silent
fi

# Build for production with static export
echo "  🔨 Building production bundle..."
npm run build --silent

# Move build output to export root
cd ../..
mv export/frontend-static/dist/* export/
rm -rf export/frontend-static

# Copy constant files
echo ""
echo "📂 Copying constant files..."
for constant_file in constants/data/*.json; do
    constant_id=$(basename "$constant_file" .json)
    mkdir -p "export/constants/$constant_id"
    
    # Copy files if they exist
    [ -f "constants/data/${constant_id}.json" ] && cp "constants/data/${constant_id}.json" "export/constants/$constant_id/"
    [ -f "constants/results/json/${constant_id}_result.json" ] && cp "constants/results/json/${constant_id}_result.json" "export/constants/$constant_id/"
    [ -f "constants/notebooks/${constant_id}.ipynb" ] && cp "constants/notebooks/${constant_id}.ipynb" "export/constants/$constant_id/"
    [ -f "constants/results/${constant_id}_executed.ipynb" ] && cp "constants/results/${constant_id}_executed.ipynb" "export/constants/$constant_id/"
done

echo "  ✅ Copied files for $(ls constants/data/*.json | wc -l) constants"

# Create README
cat > export/README.md << EOF
# Static Export - Topological Constants

This is a production build of the frontend with all data pre-rendered.

## Features
- ✅ Exact React app (production build)
- ✅ All data embedded in the build
- ✅ Optimized and minified
- ✅ Works completely offline
- ✅ Includes all notebooks and data files

## Usage
Open index.html in any web browser.

Generated: $(date)

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