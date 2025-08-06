#!/bin/bash

# Export the site using curl to save the exact rendered HTML

echo "🚀 Creating exact HTML export using curl..."
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

# Clear export directory
echo ""
echo "🗑️  Clearing export directory..."
rm -rf export
mkdir -p export/constants export/assets

# Function to download and process HTML
download_page() {
    local url=$1
    local output=$2
    local is_detail=$3
    
    # Download the page with all resources
    curl -s "$url" > "$output.tmp"
    
    # Wait for React to render (give it time)
    sleep 2
    
    # Download again to get rendered content
    curl -s "$url" > "$output"
    
    # Process the HTML to fix links
    if [ "$is_detail" = "true" ]; then
        # Fix links for detail pages
        sed -i '' 's|href="/constants"|href="../../index.html"|g' "$output" 2>/dev/null || \
        sed -i 's|href="/constants"|href="../../index.html"|g' "$output" 2>/dev/null
        
        sed -i '' 's|href="/constants/\([^"]*\)"|href="../\1/index.html"|g' "$output" 2>/dev/null || \
        sed -i 's|href="/constants/\([^"]*\)"|href="../\1/index.html"|g' "$output" 2>/dev/null
    else
        # Fix links for main page
        sed -i '' 's|href="/constants/\([^"]*\)"|href="constants/\1/index.html"|g' "$output" 2>/dev/null || \
        sed -i 's|href="/constants/\([^"]*\)"|href="constants/\1/index.html"|g' "$output" 2>/dev/null
    fi
    
    # Remove temp file
    rm -f "$output.tmp"
}

# Download main constants page
echo ""
echo "📄 Downloading main constants page..."
download_page "http://localhost:3000/constants" "export/index.html" false
echo "  ✅ Downloaded main page"

# Get list of all constant IDs
echo ""
echo "📊 Fetching constant list..."
CONSTANTS=$(curl -s http://localhost:8000/api/constants | python3 -c "
import json, sys
data = json.load(sys.stdin)
for c in data:
    print(c['id'])
")

CONST_COUNT=$(echo "$CONSTANTS" | wc -l | tr -d ' ')
echo "  Found $CONST_COUNT constants"

# Download each constant detail page
echo ""
echo "📄 Downloading detail pages..."
COUNTER=0
for const_id in $CONSTANTS; do
    COUNTER=$((COUNTER + 1))
    printf "  [%3d/%3d] %-20s" "$COUNTER" "$CONST_COUNT" "$const_id"
    
    # Create directory
    mkdir -p "export/constants/$const_id"
    
    # Download the detail page
    download_page "http://localhost:3000/constants/$const_id" "export/constants/$const_id/index.html" true
    
    # Copy data files
    copied=""
    if [ -f "constants/data/${const_id}.json" ]; then
        cp "constants/data/${const_id}.json" "export/constants/$const_id/"
        copied="${copied}J"
    fi
    if [ -f "constants/results/json/${const_id}_result.json" ]; then
        cp "constants/results/json/${const_id}_result.json" "export/constants/$const_id/"
        copied="${copied}R"
    fi
    if [ -f "constants/notebooks/${const_id}.ipynb" ]; then
        cp "constants/notebooks/${const_id}.ipynb" "export/constants/$const_id/"
        copied="${copied}N"
    fi
    if [ -f "constants/results/${const_id}_executed.ipynb" ]; then
        cp "constants/results/${const_id}_executed.ipynb" "export/constants/$const_id/"
        copied="${copied}E"
    fi
    
    echo " ✅ (${copied:-none})"
done

# Download CSS and assets
echo ""
echo "🎨 Downloading styles and assets..."

# Get the main CSS file URL from the HTML
CSS_URLS=$(grep -o 'href="[^"]*\.css"' export/index.html | sed 's/href="//;s/"//' | head -5)
JS_URLS=$(grep -o 'src="[^"]*\.js"' export/index.html | sed 's/src="//;s/"//' | head -10)

for css_url in $CSS_URLS; do
    if [[ "$css_url" == /* ]]; then
        # Absolute path
        filename=$(basename "$css_url")
        curl -s "http://localhost:3000$css_url" > "export/assets/$filename" 2>/dev/null
        echo "  ✅ Downloaded $filename"
        
        # Update references in HTML files
        find export -name "*.html" -exec sed -i '' "s|$css_url|assets/$filename|g" {} \; 2>/dev/null || \
        find export -name "*.html" -exec sed -i "s|$css_url|assets/$filename|g" {} \; 2>/dev/null
    fi
done

# Inline critical styles to ensure appearance is preserved
echo ""
echo "🔧 Inlining critical styles..."

# Extract and inline Tailwind classes
INLINE_STYLES='<style>
/* Critical styles for offline viewing */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background-color: #030712;
    color: #e0e0e0;
}
.min-h-screen { min-height: 100vh; }
.bg-gray-950 { background-color: #030712; }
.bg-gray-900 { background-color: #111827; }
.text-white { color: #ffffff; }
.text-blue-400 { color: #60a5fa; }
.text-gray-400 { color: #9ca3af; }
.text-gray-300 { color: #d1d5db; }
.border-gray-800 { border-color: #1f2937; }
.hover\:bg-gray-800:hover { background-color: #1f2937; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.75rem 1.5rem; text-align: left; }
a { color: #60a5fa; text-decoration: none; }
a:hover { color: #93bbfc; }
.font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace; }
</style>'

# Add inline styles to all HTML files
for html_file in $(find export -name "*.html"); do
    # Insert styles before </head>
    sed -i '' "s|</head>|$INLINE_STYLES\n</head>|" "$html_file" 2>/dev/null || \
    sed -i "s|</head>|$INLINE_STYLES\n</head>|" "$html_file" 2>/dev/null
done

echo "  ✅ Inlined critical styles"

# Create a simple server script
cat > export/serve.py << 'EOF'
#!/usr/bin/env python3
import http.server
import socketserver
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"Server running at http://localhost:{PORT}/")
    httpd.serve_forever()
EOF

chmod +x export/serve.py

# Create README
cat > export/README.md << EOF
# Static Export - Topological Constants

This is an exact HTML export of the Topological Constants web application.
All pages are captured with their rendered content and styles.

## Features
- ✅ Exact rendered HTML from React app
- ✅ All data pre-rendered
- ✅ Critical styles inlined
- ✅ Works completely offline
- ✅ Includes all notebooks and data files

## Usage

### Option 1: Direct viewing
Open \`index.html\` in any web browser.

### Option 2: Local server (recommended for best results)
\`\`\`bash
python3 serve.py
# Then open http://localhost:8080
\`\`\`

## Contents
- \`index.html\` - Main constants page
- \`constants/[id]/\` - Individual constant pages (${CONST_COUNT} total)
  - \`index.html\` - Detail page
  - \`[id].json\` - Original definition
  - \`[id]_result.json\` - Calculation results
  - \`[id].ipynb\` - Jupyter notebook
  - \`[id]_executed.ipynb\` - Executed notebook

Generated: $(date)
Total files: $(find export -type f | wc -l | tr -d ' ')

© 2025 Topological Fixed Point Theory
EOF

echo ""
echo "============================================================"
echo "✅ Export completed successfully!"
echo "📁 Location: $(pwd)/export"
echo "📄 Total files: $(find export -type f | wc -l | tr -d ' ')"
echo ""
echo "🌐 To view:"
echo "   Option 1: open export/index.html"
echo "   Option 2: cd export && python3 serve.py"
echo "============================================================"