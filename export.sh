#!/bin/bash

# Export the constants page as a static website
# This script handles the complete export process

echo "================================================="
echo "    Topological Constants - Static Export       "
echo "================================================="
echo ""

# Check if services are running
if ! curl -s http://localhost:8000/api/constants > /dev/null 2>&1 || ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Services not running. Starting them now..."
    ./start-local.sh
    echo ""
    echo "Waiting for services to be ready..."
    sleep 15
fi

# Run the export (using Puppeteer for exact HTML capture)
echo "📦 Starting export process..."
node export_puppeteer_node.js

# Check if export was successful
if [ -f "export/index.html" ]; then
    echo ""
    echo "🎉 Export successful!"
    echo ""
    
    # Count files
    FILE_COUNT=$(find export -type f | wc -l | tr -d ' ')
    DIR_COUNT=$(find export -type d | wc -l | tr -d ' ')
    SIZE=$(du -sh export | cut -f1)
    
    echo "📊 Export Statistics:"
    echo "  • Files: $FILE_COUNT"
    echo "  • Directories: $DIR_COUNT"
    echo "  • Total size: $SIZE"
    echo ""
    
    # Try to open in browser
    if command -v open > /dev/null 2>&1; then
        echo "🌐 Opening in browser..."
        open export/index.html
    elif command -v xdg-open > /dev/null 2>&1; then
        echo "🌐 Opening in browser..."
        xdg-open export/index.html
    else
        echo "🌐 To view the export, open:"
        echo "   $(pwd)/export/index.html"
    fi
else
    echo "❌ Export failed. Please check the error messages above."
    exit 1
fi

echo ""
echo "================================================="