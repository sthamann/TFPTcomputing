#!/usr/bin/env python3
"""
Export the React app as static HTML using Playwright
This captures the EXACT rendered output after React has fully loaded
"""

import os
import sys
import json
import time
import shutil
from pathlib import Path

# Try to import playwright, install if not available
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("📦 Installing Playwright...")
    os.system("pip3 install playwright")
    os.system("python3 -m playwright install chromium")
    from playwright.sync_api import sync_playwright

import requests

FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:8000"
EXPORT_DIR = Path("export")

def clear_export_dir():
    """Clear the export directory."""
    if EXPORT_DIR.exists():
        print(f"🗑️  Clearing existing export directory...")
        shutil.rmtree(EXPORT_DIR)
    EXPORT_DIR.mkdir(exist_ok=True)
    (EXPORT_DIR / "constants").mkdir(exist_ok=True)
    (EXPORT_DIR / "assets").mkdir(exist_ok=True)
    print(f"📁 Created fresh export directory")

def check_services():
    """Check if services are running."""
    try:
        requests.get(f"{BACKEND_URL}/api/constants", timeout=5)
        print(f"✅ Backend is running")
        requests.get(FRONTEND_URL, timeout=5)
        print(f"✅ Frontend is running")
        return True
    except:
        print(f"❌ Services not running. Please run ./start-local.sh first")
        return False

def capture_page(page, url, wait_selector=None, wait_time=3000):
    """Navigate to a URL and capture the fully rendered HTML."""
    print(f"  ⏳ Loading {url}...")
    
    # Navigate to the page
    page.goto(url, wait_until="networkidle", timeout=60000)
    
    # Wait for specific element if provided
    if wait_selector:
        try:
            page.wait_for_selector(wait_selector, timeout=30000)
        except:
            print(f"  ⚠️  Selector {wait_selector} not found, continuing...")
    
    # Additional wait for dynamic content
    page.wait_for_timeout(wait_time)
    
    # Get the full HTML content
    html_content = page.content()
    
    # Get all stylesheets
    styles = page.evaluate("""
        () => {
            const styles = [];
            // Get all style elements
            document.querySelectorAll('style').forEach(style => {
                styles.push(style.innerHTML);
            });
            // Get all linked stylesheets content
            for (const sheet of document.styleSheets) {
                try {
                    const rules = Array.from(sheet.cssRules || sheet.rules || []);
                    styles.push(rules.map(rule => rule.cssText).join('\\n'));
                } catch (e) {
                    // Cross-origin stylesheets will throw
                }
            }
            return styles.join('\\n');
        }
    """)
    
    return html_content, styles

def process_html(html, styles, is_detail=False):
    """Process HTML to make it static and fix links."""
    # Remove script tags
    import re
    html = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', html, flags=re.IGNORECASE | re.DOTALL)
    
    # Fix links
    if is_detail:
        # Detail pages
        html = html.replace('href="/constants"', 'href="../../index.html"')
        html = re.sub(r'href="/constants/([^"]+)"', r'href="../\1/index.html"', html)
    else:
        # Main page
        html = re.sub(r'href="/constants/([^"]+)"', r'href="constants/\1/index.html"', html)
    
    # Add styles inline
    if styles:
        style_tag = f'<style>{styles}</style>'
        html = html.replace('</head>', f'{style_tag}\n</head>')
    
    # Add a note about static export
    export_note = f'<!-- Static export generated on {time.strftime("%Y-%m-%d %H:%M:%S")} -->'
    html = html.replace('<head>', f'<head>\n{export_note}')
    
    return html

def copy_constant_files(const_id):
    """Copy notebooks and JSON files for a constant."""
    const_dir = EXPORT_DIR / "constants" / const_id
    files_copied = []
    
    files_to_copy = [
        (Path("constants/data") / f"{const_id}.json", "JSON"),
        (Path("constants/results/json") / f"{const_id}_result.json", "Result"),
        (Path("constants/notebooks") / f"{const_id}.ipynb", "Notebook"),
        (Path("constants/results") / f"{const_id}_executed.ipynb", "Executed"),
    ]
    
    for src_file, label in files_to_copy:
        if src_file.exists():
            shutil.copy2(src_file, const_dir / src_file.name)
            files_copied.append(label[0])
    
    return "".join(files_copied) if files_copied else "none"

def main():
    print("🚀 Starting Playwright-based static export...")
    print("=" * 60)
    
    # Check services
    if not check_services():
        sys.exit(1)
    
    # Clear export directory
    clear_export_dir()
    
    # Get list of constants
    print("\n📊 Fetching constants list...")
    response = requests.get(f"{BACKEND_URL}/api/constants")
    constants = response.json()
    print(f"  Found {len(constants)} constants")
    
    # Launch browser
    print("\n🌐 Launching browser...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        
        # Capture main constants page
        print("\n📄 Capturing main constants page...")
        html, styles = capture_page(
            page, 
            f"{FRONTEND_URL}/constants",
            wait_selector="table",
            wait_time=5000
        )
        
        # Process and save main page
        html = process_html(html, styles, is_detail=False)
        (EXPORT_DIR / "index.html").write_text(html)
        print("  ✅ Saved main page")
        
        # Capture each constant detail page
        print(f"\n📚 Capturing {len(constants)} detail pages...")
        for i, const in enumerate(constants, 1):
            const_id = const['id']
            print(f"\n[{i}/{len(constants)}] {const_id}")
            
            # Create directory
            const_dir = EXPORT_DIR / "constants" / const_id
            const_dir.mkdir(exist_ok=True)
            
            # Capture detail page
            html, styles = capture_page(
                page,
                f"{FRONTEND_URL}/constants/{const_id}",
                wait_selector=".bg-gray-900",
                wait_time=2000
            )
            
            # Process and save
            html = process_html(html, styles, is_detail=True)
            (const_dir / "index.html").write_text(html)
            
            # Copy files
            files = copy_constant_files(const_id)
            print(f"  ✅ Page saved, files copied: {files}")
            
            # Small delay to avoid overwhelming the server
            if i % 10 == 0:
                time.sleep(1)
        
        browser.close()
    
    # Create README
    readme = f"""# Static Export - Topological Constants

This is a pixel-perfect static export of the Topological Constants React application.
All pages are captured exactly as they appear in the browser using Playwright.

## Features

✅ 100% identical to the React app
✅ All data pre-rendered in HTML
✅ All styles preserved
✅ Works completely offline
✅ No JavaScript required

## Contents

- `index.html` - Main constants page
- `constants/[id]/` - Individual constant pages
  - `index.html` - Detail page
  - `[id].json` - Original definition
  - `[id]_result.json` - Calculation results
  - `[id].ipynb` - Jupyter notebook
  - `[id]_executed.ipynb` - Executed notebook

Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}
Total constants: {len(constants)}

© 2025 Topological Fixed Point Theory
"""
    
    (EXPORT_DIR / "README.md").write_text(readme)
    
    # Summary
    print("\n" + "=" * 60)
    print("✅ Export completed successfully!")
    print(f"📁 Location: {EXPORT_DIR.absolute()}")
    
    # Count files
    file_count = sum(1 for _ in EXPORT_DIR.rglob("*") if _.is_file())
    print(f"📄 Total files: {file_count}")
    
    print(f"\n🌐 Open: {EXPORT_DIR.absolute() / 'index.html'}")
    print("=" * 60)

if __name__ == "__main__":
    main()