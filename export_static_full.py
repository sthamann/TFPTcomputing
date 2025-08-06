#!/usr/bin/env python3
"""
Export the constants page as a fully static website with pre-rendered data.
Captures the actual React app appearance and embeds all values directly in HTML.
"""

import os
import json
import shutil
import requests
from pathlib import Path
import time
import sys
import subprocess
from bs4 import BeautifulSoup
import base64

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
    """Check if services are running."""
    services_ok = True
    
    # Check backend
    try:
        response = requests.get(f"{BACKEND_URL}/api/constants", timeout=5)
        if response.status_code == 200:
            print(f"✅ Backend is running")
        else:
            services_ok = False
    except:
        print(f"❌ Backend is not accessible")
        services_ok = False
    
    # Check frontend
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print(f"✅ Frontend is running")
        else:
            services_ok = False
    except:
        print(f"❌ Frontend is not accessible")
        services_ok = False
    
    if not services_ok:
        print(f"\n⚠️  Please run ./start-local.sh first")
        
    return services_ok

def fetch_with_puppeteer(url, wait_selector=None, wait_time=3):
    """Fetch a fully rendered page using Puppeteer."""
    
    # Create Puppeteer script
    script = f"""
const puppeteer = require('puppeteer');

(async () => {{
    const browser = await puppeteer.launch({{
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }});
    
    const page = await browser.newPage();
    
    // Set viewport for proper rendering
    await page.setViewport({{ width: 1920, height: 1080 }});
    
    // Intercept and allow all requests
    await page.setRequestInterception(true);
    page.on('request', (request) => {{
        request.continue();
    }});
    
    // Navigate to the page
    await page.goto('{url}', {{
        waitUntil: 'networkidle0',
        timeout: 60000
    }});
    
    // Wait for specific selector if provided
    {'await page.waitForSelector("' + wait_selector + '", {timeout: 30000});' if wait_selector else ''}
    
    // Additional wait for dynamic content
    await page.waitForTimeout({wait_time * 1000});
    
    // Inject a marker so we know the page is ready
    await page.evaluate(() => {{
        window.__EXPORT_READY__ = true;
    }});
    
    // Get the full HTML
    const html = await page.content();
    
    // Also capture all stylesheets
    const styles = await page.evaluate(() => {{
        const styleSheets = [];
        for (const sheet of document.styleSheets) {{
            try {{
                const rules = Array.from(sheet.cssRules || sheet.rules || []);
                const cssText = rules.map(rule => rule.cssText).join('\\n');
                if (cssText) {{
                    styleSheets.push(cssText);
                }}
            }} catch (e) {{
                // Cross-origin stylesheets will throw
            }}
        }}
        return styleSheets.join('\\n');
    }});
    
    console.log('STYLES_START');
    console.log(styles);
    console.log('STYLES_END');
    console.log('HTML_START');
    console.log(html);
    console.log('HTML_END');
    
    await browser.close();
}})();
"""
    
    # Save and run script
    script_file = Path("puppeteer_fetch.js")
    script_file.write_text(script)
    
    try:
        result = subprocess.run(
            ["node", str(script_file)],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        output = result.stdout
        
        # Extract styles and HTML
        styles = ""
        html = ""
        
        if "STYLES_START" in output and "STYLES_END" in output:
            styles = output.split("STYLES_START")[1].split("STYLES_END")[0].strip()
        
        if "HTML_START" in output and "HTML_END" in output:
            html = output.split("HTML_START")[1].split("HTML_END")[0].strip()
        
        return html, styles
        
    except Exception as e:
        print(f"⚠️  Puppeteer error: {e}")
        return None, None
    finally:
        if script_file.exists():
            script_file.unlink()

def process_html_for_export(html, styles, base_url, is_detail=False):
    """Process HTML to make it standalone."""
    soup = BeautifulSoup(html, 'html.parser')
    
    # Remove script tags that require React
    for script in soup.find_all('script'):
        src = script.get('src', '')
        if 'vite' in src or 'react' in src or '@' in src:
            script.decompose()
    
    # Add captured styles
    if styles:
        style_tag = soup.new_tag('style')
        style_tag.string = styles
        if soup.head:
            soup.head.append(style_tag)
    
    # Process all links
    for link in soup.find_all('a'):
        href = link.get('href', '')
        
        if is_detail:
            # On detail pages
            if href == '/constants':
                link['href'] = '../../index.html'
            elif href.startswith('/constants/'):
                const_id = href.split('/')[-1]
                link['href'] = f"../{const_id}/index.html"
        else:
            # On main page
            if href.startswith('/constants/'):
                const_id = href.split('/')[-1]
                link['href'] = f"constants/{const_id}/index.html"
    
    # Inline images and icons
    for img in soup.find_all('img'):
        src = img.get('src', '')
        if src.startswith('/'):
            try:
                img_url = f"{base_url}{src}"
                response = requests.get(img_url)
                if response.status_code == 200:
                    content_type = response.headers.get('content-type', 'image/png')
                    b64_data = base64.b64encode(response.content).decode('utf-8')
                    img['src'] = f"data:{content_type};base64,{b64_data}"
            except:
                pass
    
    # Add export notice
    footer = soup.find('footer')
    if footer:
        notice = soup.new_tag('div')
        notice['style'] = 'text-align: center; padding: 10px; color: #666; font-size: 0.9em;'
        notice.string = f"Static export generated on {time.strftime('%Y-%m-%d %H:%M:%S')}"
        footer.append(notice)
    
    return str(soup)

def export_main_page():
    """Export the main constants page."""
    print("\n📄 Exporting main constants page...")
    
    # Fetch the rendered page
    print("  ⏳ Waiting for React to render...")
    html, styles = fetch_with_puppeteer(
        f"{FRONTEND_URL}/constants",
        wait_selector=".constant-card",
        wait_time=5
    )
    
    if not html:
        print("  ❌ Failed to fetch main page")
        return None
    
    print("  ✅ Page captured")
    
    # Process HTML
    html = process_html_for_export(html, styles, FRONTEND_URL, is_detail=False)
    
    # Save main page
    index_file = EXPORT_DIR / "index.html"
    index_file.write_text(html)
    print(f"  ✅ Saved to {index_file}")
    
    # Extract constant IDs from the HTML
    soup = BeautifulSoup(html, 'html.parser')
    constant_ids = []
    
    for link in soup.find_all('a'):
        href = link.get('href', '')
        if href.startswith('constants/') and href.endswith('/index.html'):
            const_id = href.split('/')[1]
            if const_id not in constant_ids:
                constant_ids.append(const_id)
    
    return constant_ids

def export_constant_detail(const_id):
    """Export a constant detail page."""
    print(f"  📄 Exporting {const_id}...")
    
    # Create directory
    const_dir = EXPORT_DIR / "constants" / const_id
    const_dir.mkdir(parents=True, exist_ok=True)
    
    # Fetch the rendered page
    html, styles = fetch_with_puppeteer(
        f"{FRONTEND_URL}/constants/{const_id}",
        wait_selector=".detail-section",
        wait_time=2
    )
    
    if not html:
        print(f"    ❌ Failed to fetch detail page")
        return
    
    # Process HTML
    html = process_html_for_export(html, styles, FRONTEND_URL, is_detail=True)
    
    # Save detail page
    detail_file = const_dir / "index.html"
    detail_file.write_text(html)
    print(f"    ✅ Saved detail page")
    
    # Copy associated files
    copy_constant_files(const_id, const_dir)

def copy_constant_files(const_id, const_dir):
    """Copy notebooks and JSON files."""
    files_copied = []
    
    # Files to copy
    files = [
        (CONSTANTS_DIR / "data" / f"{const_id}.json", f"{const_id}.json", "JSON"),
        (CONSTANTS_DIR / "results" / "json" / f"{const_id}_result.json", f"{const_id}_result.json", "Result"),
        (CONSTANTS_DIR / "notebooks" / f"{const_id}.ipynb", f"{const_id}.ipynb", "Notebook"),
        (CONSTANTS_DIR / "results" / f"{const_id}_executed.ipynb", f"{const_id}_executed.ipynb", "Executed")
    ]
    
    for src_path, dst_name, label in files:
        if src_path.exists():
            dst_path = const_dir / dst_name
            shutil.copy2(src_path, dst_path)
            files_copied.append(label)
    
    if files_copied:
        print(f"    ✅ Copied: {', '.join(files_copied)}")

def copy_static_assets():
    """Copy any static assets from the frontend."""
    print("\n🎨 Copying static assets...")
    
    assets_dir = EXPORT_DIR / "assets"
    assets_dir.mkdir(exist_ok=True)
    
    # Try to fetch and save key assets
    assets_to_fetch = [
        ("/icon.svg", "icon.svg"),
        ("/favicon.ico", "favicon.ico")
    ]
    
    for src, dst in assets_to_fetch:
        try:
            response = requests.get(f"{FRONTEND_URL}{src}")
            if response.status_code == 200:
                (assets_dir / dst).write_bytes(response.content)
                print(f"  ✅ Copied {dst}")
        except:
            pass

def check_puppeteer():
    """Check if Puppeteer is installed."""
    try:
        result = subprocess.run(
            ["node", "-e", "require('puppeteer')"],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            print("\n📦 Installing Puppeteer...")
            subprocess.run(["npm", "install", "puppeteer"], check=True)
            print("  ✅ Puppeteer installed")
        return True
    except Exception as e:
        print(f"\n❌ Node.js is required but not found: {e}")
        print("  Please install Node.js first: https://nodejs.org")
        return False

def main():
    """Main export function."""
    print("🚀 Starting full static export with React rendering...")
    print("=" * 60)
    
    # Check requirements
    if not check_puppeteer():
        sys.exit(1)
    
    if not check_services():
        sys.exit(1)
    
    # Clear export directory
    clear_export_dir()
    
    # Export main page and get constant IDs
    constant_ids = export_main_page()
    
    if not constant_ids:
        # Fallback: get IDs from API
        print("\n📊 Fetching constant list from API...")
        response = requests.get(f"{BACKEND_URL}/api/constants")
        constants = response.json()
        constant_ids = [c['id'] for c in constants]
    
    # Export detail pages
    print(f"\n📚 Exporting {len(constant_ids)} constant detail pages...")
    for i, const_id in enumerate(constant_ids, 1):
        print(f"\n[{i}/{len(constant_ids)}]")
        export_constant_detail(const_id)
        
        # Small delay to avoid overwhelming the server
        if i % 5 == 0:
            time.sleep(1)
    
    # Copy static assets
    copy_static_assets()
    
    # Create README
    readme = f"""# Static Export - Topological Constants

This is a complete static export of the Topological Constants web application.
All pages are pre-rendered with data embedded directly in the HTML.

## Contents

- `index.html` - Main constants page (fully rendered)
- `constants/[id]/` - Individual constant pages with:
  - `index.html` - Pre-rendered detail page
  - `[id].json` - Original definition
  - `[id]_result.json` - Calculation results
  - `[id].ipynb` - Jupyter notebook
  - `[id]_executed.ipynb` - Executed notebook

## Features

✅ Exact replica of the React app appearance
✅ All data pre-rendered in HTML (no JSON loading)
✅ All visualizations and styles preserved
✅ Fully offline-capable
✅ Cross-linked navigation between pages

## Viewing

Open `index.html` in any web browser. No server required.

Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}
Constants: {len(constant_ids)}

© 2025 Topological Fixed Point Theory
"""
    
    readme_file = EXPORT_DIR / "README.md"
    readme_file.write_text(readme)
    
    # Summary
    print("\n" + "=" * 60)
    print("✅ Export completed successfully!")
    print(f"📁 Location: {EXPORT_DIR.absolute()}")
    print(f"📊 Constants exported: {len(constant_ids)}")
    print(f"📄 Total files: ~{sum(1 for _ in EXPORT_DIR.rglob('*'))}")
    print(f"\n🌐 Open: {EXPORT_DIR.absolute() / 'index.html'}")
    print("=" * 60)

if __name__ == "__main__":
    main()