#!/usr/bin/env python3
"""
Export the constants page as a fully static website with all visualizations and detail pages.
"""

import os
import json
import shutil
import requests
from pathlib import Path
from bs4 import BeautifulSoup
import time
import subprocess
import sys

# Configuration
FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:8000"
EXPORT_DIR = Path("export")
CONSTANTS_DIR = Path("constants")

def clear_export_dir():
    """Clear the export directory."""
    if EXPORT_DIR.exists():
        print(f"🗑️  Clearing existing export directory: {EXPORT_DIR}")
        shutil.rmtree(EXPORT_DIR)
    EXPORT_DIR.mkdir(exist_ok=True)
    print(f"📁 Created fresh export directory: {EXPORT_DIR}")

def check_services():
    """Check if all required services are running."""
    services = {
        "Frontend": FRONTEND_URL,
        "Backend": f"{BACKEND_URL}/api/constants"
    }
    
    for name, url in services.items():
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {name} is running at {url}")
            else:
                print(f"⚠️  {name} returned status {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {name} is not accessible at {url}")
            print(f"   Please run ./start-local.sh first")
            return False
    return True

def fetch_page_with_js(url, wait_time=3):
    """Fetch a page after JavaScript has rendered using Puppeteer."""
    script = f"""
    const puppeteer = require('puppeteer');
    
    (async () => {{
        const browser = await puppeteer.launch({{headless: true}});
        const page = await browser.newPage();
        
        // Set viewport for proper rendering
        await page.setViewport({{ width: 1920, height: 1080 }});
        
        // Navigate and wait for content
        await page.goto('{url}', {{ waitUntil: 'networkidle0', timeout: 30000 }});
        
        // Wait additional time for dynamic content
        await page.waitForTimeout({wait_time * 1000});
        
        // Get the full HTML after rendering
        const html = await page.content();
        console.log(html);
        
        await browser.close();
    }})();
    """
    
    # Save script temporarily
    script_file = Path("fetch_page.js")
    script_file.write_text(script)
    
    try:
        # Run puppeteer to get rendered HTML
        result = subprocess.run(
            ["node", str(script_file)],
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.stdout
    except subprocess.TimeoutExpired:
        print(f"⚠️  Timeout fetching {url}")
        return None
    except Exception as e:
        print(f"⚠️  Error fetching {url}: {e}")
        return None
    finally:
        # Clean up script file
        if script_file.exists():
            script_file.unlink()

def inline_styles_and_scripts(html, base_url):
    """Inline all CSS and JavaScript from the page."""
    soup = BeautifulSoup(html, 'html.parser')
    
    # Inline CSS files
    for link in soup.find_all('link', rel='stylesheet'):
        href = link.get('href')
        if href:
            if href.startswith('http'):
                css_url = href
            elif href.startswith('/'):
                css_url = f"{base_url}{href}"
            else:
                css_url = f"{base_url}/{href}"
            
            try:
                css_response = requests.get(css_url)
                if css_response.status_code == 200:
                    style_tag = soup.new_tag('style')
                    style_tag.string = css_response.text
                    link.replace_with(style_tag)
                    print(f"  ✅ Inlined CSS: {href}")
            except Exception as e:
                print(f"  ⚠️  Failed to inline CSS {href}: {e}")
    
    # Inline JavaScript modules
    for script in soup.find_all('script', type='module'):
        src = script.get('src')
        if src and src.startswith('/'):
            js_url = f"{base_url}{src}"
            try:
                js_response = requests.get(js_url)
                if js_response.status_code == 200:
                    # For modules, we need to keep them as modules but inline
                    script['src'] = None
                    script.string = js_response.text
                    print(f"  ✅ Inlined JS module: {src}")
            except Exception as e:
                print(f"  ⚠️  Failed to inline JS {src}: {e}")
    
    return str(soup)

def export_main_page():
    """Export the main constants page with all visualizations."""
    print("\n📄 Exporting main constants page...")
    
    # Use Puppeteer to get fully rendered page
    html = fetch_page_with_js(f"{FRONTEND_URL}/constants", wait_time=5)
    
    if not html:
        # Fallback to simple request
        response = requests.get(f"{FRONTEND_URL}/constants")
        html = response.text
    
    # Parse and modify HTML
    soup = BeautifulSoup(html, 'html.parser')
    
    # Inline all API data
    print("  📊 Fetching and inlining API data...")
    
    # Fetch constants data
    constants_response = requests.get(f"{BACKEND_URL}/api/constants")
    constants_data = constants_response.json()
    
    # Fetch theory API data
    api_endpoints = [
        "/api/theory/cascade/30",
        "/api/theory/special-scales", 
        "/api/theory/correction-factors",
        "/api/theory/rg-running/91.1876"
    ]
    
    theory_data = {}
    for endpoint in api_endpoints:
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}")
            theory_data[endpoint] = response.json()
            print(f"  ✅ Fetched {endpoint}")
        except Exception as e:
            print(f"  ⚠️  Failed to fetch {endpoint}: {e}")
    
    # Inject data as JavaScript
    data_script = soup.new_tag('script')
    data_script.string = f"""
    // Injected API data for offline use
    window.__STATIC_DATA__ = {{
        constants: {json.dumps(constants_data)},
        theory: {json.dumps(theory_data)}
    }};
    
    // Override fetch to use static data
    window.__originalFetch = window.fetch;
    window.fetch = function(url, options) {{
        // Check if this is an API call we have data for
        if (url.includes('/api/constants') && !url.includes('/api/constants/')) {{
            return Promise.resolve({{
                ok: true,
                json: () => Promise.resolve(window.__STATIC_DATA__.constants)
            }});
        }}
        
        // Check for theory endpoints
        for (const [endpoint, data] of Object.entries(window.__STATIC_DATA__.theory)) {{
            if (url.includes(endpoint)) {{
                return Promise.resolve({{
                    ok: true,
                    json: () => Promise.resolve(data)
                }});
            }}
        }}
        
        // For individual constant details, extract ID and return data
        const constantMatch = url.match(/\\/api\\/constants\\/([^/]+)$/);
        if (constantMatch) {{
            const id = constantMatch[1];
            const constant = window.__STATIC_DATA__.constants.find(c => c.id === id);
            if (constant) {{
                return Promise.resolve({{
                    ok: true,
                    json: () => Promise.resolve(constant)
                }});
            }}
        }}
        
        // Fallback to original fetch
        return window.__originalFetch(url, options);
    }};
    """
    soup.head.append(data_script)
    
    # Update links to detail pages
    for link in soup.find_all('a'):
        href = link.get('href')
        if href and href.startswith('/constants/'):
            const_id = href.split('/')[-1]
            link['href'] = f"constants/{const_id}/index.html"
    
    # Inline styles
    html = inline_styles_and_scripts(str(soup), FRONTEND_URL)
    
    # Save main page
    index_file = EXPORT_DIR / "index.html"
    index_file.write_text(html)
    print(f"  ✅ Saved main page to {index_file}")
    
    return constants_data

def export_constant_detail(constant):
    """Export a single constant detail page with associated files."""
    const_id = constant['id']
    print(f"\n  📄 Exporting {const_id}...")
    
    # Create directory for this constant
    const_dir = EXPORT_DIR / "constants" / const_id
    const_dir.mkdir(parents=True, exist_ok=True)
    
    # Fetch detail page
    detail_url = f"{FRONTEND_URL}/constants/{const_id}"
    html = fetch_page_with_js(detail_url, wait_time=2)
    
    if not html:
        response = requests.get(detail_url)
        html = response.text
    
    # Parse and modify HTML
    soup = BeautifulSoup(html, 'html.parser')
    
    # Inject constant data
    data_script = soup.new_tag('script')
    data_script.string = f"""
    // Injected constant data for offline use
    window.__CONSTANT_DATA__ = {json.dumps(constant)};
    
    // Override fetch for this constant
    window.__originalFetch = window.fetch || fetch;
    window.fetch = function(url, options) {{
        if (url.includes('/api/constants/{const_id}')) {{
            return Promise.resolve({{
                ok: true,
                json: () => Promise.resolve(window.__CONSTANT_DATA__)
            }});
        }}
        return window.__originalFetch(url, options);
    }};
    """
    soup.head.append(data_script)
    
    # Update navigation links
    for link in soup.find_all('a'):
        href = link.get('href')
        if href == '/constants':
            link['href'] = '../../index.html'
        elif href and href.startswith('/constants/'):
            other_id = href.split('/')[-1]
            link['href'] = f"../{other_id}/index.html"
    
    # Inline styles
    html = inline_styles_and_scripts(str(soup), FRONTEND_URL)
    
    # Save detail page
    detail_file = const_dir / "index.html"
    detail_file.write_text(html)
    print(f"    ✅ Saved detail page")
    
    # Copy associated files
    copy_constant_files(const_id, const_dir)

def copy_constant_files(const_id, const_dir):
    """Copy notebooks and JSON files for a constant."""
    
    # Copy original JSON
    json_src = CONSTANTS_DIR / "data" / f"{const_id}.json"
    if json_src.exists():
        json_dst = const_dir / f"{const_id}.json"
        shutil.copy2(json_src, json_dst)
        print(f"    ✅ Copied JSON definition")
    
    # Copy result JSON
    result_src = CONSTANTS_DIR / "results" / "json" / f"{const_id}_result.json"
    if result_src.exists():
        result_dst = const_dir / f"{const_id}_result.json"
        shutil.copy2(result_src, result_dst)
        print(f"    ✅ Copied result JSON")
    
    # Copy notebook
    notebook_src = CONSTANTS_DIR / "notebooks" / f"{const_id}.ipynb"
    if notebook_src.exists():
        notebook_dst = const_dir / f"{const_id}.ipynb"
        shutil.copy2(notebook_src, notebook_dst)
        print(f"    ✅ Copied notebook")
    
    # Copy executed notebook
    executed_src = CONSTANTS_DIR / "results" / f"{const_id}_executed.ipynb"
    if executed_src.exists():
        executed_dst = const_dir / f"{const_id}_executed.ipynb"
        shutil.copy2(executed_src, executed_dst)
        print(f"    ✅ Copied executed notebook")

def create_static_assets():
    """Create static CSS and JS files for offline use."""
    print("\n🎨 Creating static assets...")
    
    # Create a simple CSS file with essential styles
    css_content = """
    /* Static export styles */
    body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 0;
        background: #0a0a0a;
        color: #ffffff;
    }
    
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .constant-card {
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        transition: all 0.2s;
    }
    
    .constant-card:hover {
        background: #222;
        border-color: #4a9eff;
    }
    
    a {
        color: #4a9eff;
        text-decoration: none;
    }
    
    a:hover {
        text-decoration: underline;
    }
    
    .formula {
        font-family: 'JetBrains Mono', 'Courier New', monospace;
        background: #0d0d0d;
        padding: 8px 12px;
        border-radius: 4px;
        overflow-x: auto;
    }
    
    .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
    }
    
    .badge.success {
        background: #10b981;
        color: white;
    }
    
    .badge.warning {
        background: #f59e0b;
        color: white;
    }
    
    .badge.error {
        background: #ef4444;
        color: white;
    }
    """
    
    assets_dir = EXPORT_DIR / "assets"
    assets_dir.mkdir(exist_ok=True)
    
    css_file = assets_dir / "styles.css"
    css_file.write_text(css_content)
    print(f"  ✅ Created {css_file}")

def check_puppeteer():
    """Check if Puppeteer is installed."""
    try:
        result = subprocess.run(
            ["node", "-e", "require('puppeteer')"],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            print("\n⚠️  Puppeteer is not installed.")
            print("  Installing Puppeteer...")
            subprocess.run(["npm", "install", "puppeteer"], check=True)
            print("  ✅ Puppeteer installed")
        return True
    except Exception as e:
        print(f"\n❌ Node.js or npm not found: {e}")
        print("  Please install Node.js first")
        return False

def main():
    """Main export function."""
    print("🚀 Starting static site export...")
    
    # Check if Puppeteer is available
    if not check_puppeteer():
        print("\n⚠️  Continuing without Puppeteer (pages may not be fully rendered)")
    
    # Check if services are running
    if not check_services():
        print("\n❌ Please start the services first with: ./start-local.sh")
        sys.exit(1)
    
    # Clear and create export directory
    clear_export_dir()
    
    # Export main page and get constants data
    constants_data = export_main_page()
    
    # Export each constant detail page
    print(f"\n📚 Exporting {len(constants_data)} constant detail pages...")
    for i, constant in enumerate(constants_data, 1):
        print(f"\n[{i}/{len(constants_data)}] Processing {constant['id']}...")
        export_constant_detail(constant)
    
    # Create static assets
    create_static_assets()
    
    # Create a simple README
    readme_content = f"""# Static Export of Topological Constants

This is a static export of the Topological Constants web application.

## Contents

- `index.html` - Main constants page with all visualizations
- `constants/` - Individual constant detail pages
  - Each constant has:
    - `index.html` - Detail page
    - `[id].json` - Original definition
    - `[id]_result.json` - Calculation results
    - `[id].ipynb` - Jupyter notebook
    - `[id]_executed.ipynb` - Executed notebook with outputs

## Viewing

Simply open `index.html` in a web browser. All data is embedded, so no server is required.

Generated on: {time.strftime('%Y-%m-%d %H:%M:%S')}
Total constants: {len(constants_data)}
"""
    
    readme_file = EXPORT_DIR / "README.md"
    readme_file.write_text(readme_content)
    
    print("\n" + "=" * 60)
    print("✅ Export completed successfully!")
    print(f"📁 Files exported to: {EXPORT_DIR.absolute()}")
    print(f"📊 Total constants exported: {len(constants_data)}")
    print(f"\n🌐 To view: Open {EXPORT_DIR.absolute() / 'index.html'} in a browser")
    print("=" * 60)

if __name__ == "__main__":
    main()