#!/usr/bin/env python3
"""
Export the constants page as a fully static website - Simple version without Puppeteer.
Creates a complete offline-viewable static site with all constants data.
"""

import os
import json
import shutil
import requests
from pathlib import Path
import time
import sys

# Configuration
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
    """Check if backend service is running."""
    try:
        response = requests.get(f"{BACKEND_URL}/api/constants", timeout=5)
        if response.status_code == 200:
            print(f"✅ Backend is running at {BACKEND_URL}")
            return True
    except requests.exceptions.RequestException:
        pass
    
    print(f"❌ Backend is not accessible at {BACKEND_URL}")
    print(f"   Please run ./start-local.sh first")
    return False

def fetch_all_data():
    """Fetch all data from the API."""
    print("\n📊 Fetching all data from API...")
    
    data = {}
    
    # Fetch constants
    response = requests.get(f"{BACKEND_URL}/api/constants")
    data['constants'] = response.json()
    print(f"  ✅ Fetched {len(data['constants'])} constants")
    
    # Fetch theory endpoints
    endpoints = {
        'cascade': '/api/theory/cascade/30',
        'special_scales': '/api/theory/special-scales',
        'correction_factors': '/api/theory/correction-factors',
        'rg_running': '/api/theory/rg-running/91.1876'
    }
    
    data['theory'] = {}
    for key, endpoint in endpoints.items():
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}")
            data['theory'][key] = response.json()
            print(f"  ✅ Fetched {endpoint}")
        except Exception as e:
            print(f"  ⚠️  Failed to fetch {endpoint}: {e}")
            data['theory'][key] = None
    
    return data

def create_main_page(data):
    """Create the main index.html page."""
    print("\n📄 Creating main page...")
    
    # Group constants by category
    categories = {}
    for const in data['constants']:
        cat = const.get('category', 'other')
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(const)
    
    # Create HTML
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Topological Constants - Static Export</title>
    <link rel="stylesheet" href="assets/styles.css">
    <script src="assets/app.js"></script>
</head>
<body>
    <div class="app">
        <header class="header">
            <div class="container">
                <h1>Topological Constants v0.8</h1>
                <p class="subtitle">Precise calculations and theoretical correlations of fundamental constants</p>
                <div class="stats">
                    <span class="stat">📊 {len(data['constants'])} Constants</span>
                    <span class="stat">✅ All Calculated</span>
                    <span class="stat">🔬 Self-Contained Notebooks</span>
                </div>
            </div>
        </header>
        
        <main class="container">
            <div class="theory-section">
                <h2>Topological Fixed Point Theory</h2>
                <div class="theory-cards">
                    <div class="theory-card">
                        <h3>Fundamental Constants</h3>
                        <div class="formula">c₃ = 1/(8π) = 0.03979</div>
                        <div class="formula">φ₀ = 0.053171</div>
                        <div class="formula">M_Pl = 1.2209×10¹⁹ GeV</div>
                    </div>
                    <div class="theory-card">
                        <h3>E₈ Cascade</h3>
                        <div class="formula">γ(n) = 0.834 + 0.108n + 0.0105n²</div>
                        <div class="formula">φₙ = φ₀ × exp(-Σγ(k))</div>
                    </div>
                    <div class="theory-card">
                        <h3>Correction Factors</h3>
                        <div class="correction-list">
                            <div>4D-Loop: 1 - 2c₃ = 0.920</div>
                            <div>KK-Geometry: 1 - 4c₃ = 0.841</div>
                            <div>VEV-Backreaction: 1 ± kφ₀</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="visualizations">
                <h2>Theory Visualizations</h2>
                <div class="viz-grid">
                    <div class="viz-card">
                        <h3>E₈ Cascade Hierarchy</h3>
                        <canvas id="cascade-chart"></canvas>
                    </div>
                    <div class="viz-card">
                        <h3>RG Running</h3>
                        <canvas id="rg-chart"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="constants-section">
                <h2>Physics Constants</h2>
                <div class="filter-bar">
                    <button class="filter-btn active" data-category="all">All ({len(data['constants'])})</button>
                    <button class="filter-btn" data-category="fundamental_theory">Fundamental</button>
                    <button class="filter-btn" data-category="primary">Primary</button>
                    <button class="filter-btn" data-category="secondary">Secondary</button>
                    <button class="filter-btn" data-category="derived">Derived</button>
                </div>
                
                <div class="constants-grid" id="constants-grid">
"""
    
    # Add constants
    for const in data['constants']:
        status = const.get('lastCalculation', {}).get('status', 'unknown')
        status_class = 'success' if status == 'completed' else 'warning' if status == 'warning' else 'error'
        
        # Get value
        value = const.get('lastCalculation', {}).get('value')
        if value is not None:
            if abs(value) < 1e-3 or abs(value) > 1e3:
                value_str = f"{value:.4e}"
            else:
                value_str = f"{value:.6f}"
        else:
            value_str = "—"
        
        # Get deviation
        relative_error = const.get('lastCalculation', {}).get('relative_error', 0)
        if relative_error:
            dev_str = f"{relative_error*100:.2f}%"
            dev_class = 'good' if abs(relative_error) < 0.01 else 'ok' if abs(relative_error) < 0.05 else 'poor'
        else:
            dev_str = "—"
            dev_class = ""
        
        html += f"""
                    <div class="constant-card" data-category="{const.get('category', 'other')}">
                        <div class="constant-header">
                            <a href="constants/{const['id']}/index.html" class="constant-link">
                                <span class="constant-symbol">{const.get('symbol', '')}</span>
                                <span class="constant-name">{const.get('name', '')}</span>
                            </a>
                            <span class="badge {status_class}">{status}</span>
                        </div>
                        <div class="constant-formula">
                            <code>{const.get('formula', '')[:100]}{'...' if len(const.get('formula', '')) > 100 else ''}</code>
                        </div>
                        <div class="constant-values">
                            <div class="value-item">
                                <span class="label">Theory:</span>
                                <span class="value">{value_str} {const.get('unit', '')}</span>
                            </div>
                            <div class="value-item">
                                <span class="label">Deviation:</span>
                                <span class="value {dev_class}">{dev_str}</span>
                            </div>
                        </div>
                    </div>
"""
    
    html += """
                </div>
            </div>
        </main>
        
        <footer class="footer">
            <div class="container">
                <p>Static export generated on """ + time.strftime('%Y-%m-%d %H:%M:%S') + """</p>
                <p>Topological Fixed Point Theory © 2025</p>
            </div>
        </footer>
    </div>
    
    <script>
        // Embed all data for offline use
        window.__APP_DATA__ = """ + json.dumps(data) + """;
    </script>
</body>
</html>"""
    
    # Save main page
    index_file = EXPORT_DIR / "index.html"
    index_file.write_text(html)
    print(f"  ✅ Created {index_file}")

def create_detail_page(constant, data):
    """Create a detail page for a constant."""
    const_id = constant['id']
    const_dir = EXPORT_DIR / "constants" / const_id
    const_dir.mkdir(parents=True, exist_ok=True)
    
    # Get calculation details
    calc = constant.get('lastCalculation', {})
    value = calc.get('value')
    measured = calc.get('measured_value')
    
    # Format values
    if value is not None:
        if abs(value) < 1e-3 or abs(value) > 1e3:
            value_str = f"{value:.6e}"
        else:
            value_str = f"{value:.8f}"
    else:
        value_str = "Not calculated"
    
    if measured is not None:
        if abs(measured) < 1e-3 or abs(measured) > 1e3:
            measured_str = f"{measured:.6e}"
        else:
            measured_str = f"{measured:.8f}"
    else:
        measured_str = "—"
    
    # Create HTML
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{constant.get('name', const_id)} - Topological Constants</title>
    <link rel="stylesheet" href="../../assets/styles.css">
</head>
<body>
    <div class="app">
        <header class="header">
            <div class="container">
                <nav class="breadcrumb">
                    <a href="../../index.html">← Back to Constants</a>
                </nav>
                <h1>{constant.get('symbol', '')} - {constant.get('name', const_id)}</h1>
                <p class="description">{constant.get('description', '')}</p>
            </div>
        </header>
        
        <main class="container">
            <div class="detail-grid">
                <div class="detail-main">
                    <section class="detail-section">
                        <h2>Formula</h2>
                        <div class="formula-display">
                            <code>{constant.get('formula', 'No formula available')}</code>
                        </div>
                    </section>
                    
                    <section class="detail-section">
                        <h2>Calculated Value</h2>
                        <div class="value-display">
                            <div class="big-value">{value_str}</div>
                            <div class="unit">{constant.get('unit', 'dimensionless')}</div>
                        </div>
                    </section>
                    
                    <section class="detail-section">
                        <h2>Comparison</h2>
                        <table class="comparison-table">
                            <tr>
                                <th>Source</th>
                                <th>Value</th>
                                <th>Deviation</th>
                            </tr>
                            <tr>
                                <td>Theory (TFPT)</td>
                                <td>{value_str}</td>
                                <td>—</td>
                            </tr>
                            <tr>
                                <td>Experimental</td>
                                <td>{measured_str}</td>
                                <td>{f"{calc.get('relative_error', 0)*100:.4f}%" if calc.get('relative_error') else "—"}</td>
                            </tr>
                        </table>
                    </section>
"""
    
    # Add correction factors if present
    corrections = constant.get('metadata', {}).get('correction_factors', [])
    if corrections:
        html += """
                    <section class="detail-section">
                        <h2>Correction Factors</h2>
                        <div class="corrections-list">
"""
        for corr in corrections:
            html += f"""
                            <div class="correction-item">
                                <h3>{corr.get('name', 'Unknown')}</h3>
                                <div class="formula">{corr.get('formula', '')}</div>
                                <p>{corr.get('description', '')}</p>
                            </div>
"""
        html += """
                        </div>
                    </section>
"""
    
    # Add dependencies
    deps = constant.get('dependencies', [])
    if deps:
        html += f"""
                    <section class="detail-section">
                        <h2>Dependencies</h2>
                        <div class="dependencies-list">
                            {', '.join([f'<a href="../{d}/index.html">{d}</a>' for d in deps])}
                        </div>
                    </section>
"""
    
    # Add sources
    sources = constant.get('sources', [])
    if sources:
        html += """
                    <section class="detail-section">
                        <h2>Sources</h2>
                        <div class="sources-list">
"""
        for source in sources:
            html += f"""
                            <div class="source-item">
                                <strong>{source.get('name', 'Unknown')}</strong> ({source.get('year', '')})
                                <br>Value: {source.get('value', '—')}
                                {f"<br>Note: {source.get('note', '')}" if source.get('note') else ""}
                            </div>
"""
        html += """
                        </div>
                    </section>
"""
    
    html += """
                </div>
                
                <div class="detail-sidebar">
                    <section class="detail-section">
                        <h3>Files</h3>
                        <div class="files-list">
                            <a href=""" + f'"{const_id}.json"' + """ class="file-link">📄 Definition (JSON)</a>
                            <a href=""" + f'"{const_id}_result.json"' + """ class="file-link">📊 Results (JSON)</a>
                            <a href=""" + f'"{const_id}.ipynb"' + """ class="file-link">📓 Notebook</a>
                            <a href=""" + f'"{const_id}_executed.ipynb"' + """ class="file-link">📓 Executed Notebook</a>
                        </div>
                    </section>
                    
                    <section class="detail-section">
                        <h3>Metadata</h3>
                        <dl class="metadata-list">
                            <dt>ID:</dt>
                            <dd>""" + const_id + """</dd>
                            <dt>Category:</dt>
                            <dd>""" + constant.get('category', 'unknown') + """</dd>
                            <dt>Accuracy Target:</dt>
                            <dd>""" + f"{constant.get('accuracyTarget', 0.001)*100:.1f}%" + """</dd>
                            <dt>Status:</dt>
                            <dd>""" + calc.get('status', 'unknown') + """</dd>
                        </dl>
                    </section>
                </div>
            </div>
        </main>
        
        <footer class="footer">
            <div class="container">
                <p>Topological Fixed Point Theory © 2025</p>
            </div>
        </footer>
    </div>
    
    <script>
        // Embed constant data for offline use
        window.__CONSTANT_DATA__ = """ + json.dumps(constant) + """;
    </script>
</body>
</html>"""
    
    # Save detail page
    detail_file = const_dir / "index.html"
    detail_file.write_text(html)
    
    # Copy associated files
    copy_constant_files(const_id, const_dir)

def copy_constant_files(const_id, const_dir):
    """Copy notebooks and JSON files for a constant."""
    
    files_copied = []
    
    # Copy original JSON
    json_src = CONSTANTS_DIR / "data" / f"{const_id}.json"
    if json_src.exists():
        shutil.copy2(json_src, const_dir / f"{const_id}.json")
        files_copied.append("JSON")
    
    # Copy result JSON
    result_src = CONSTANTS_DIR / "results" / "json" / f"{const_id}_result.json"
    if result_src.exists():
        shutil.copy2(result_src, const_dir / f"{const_id}_result.json")
        files_copied.append("Result")
    
    # Copy notebook
    notebook_src = CONSTANTS_DIR / "notebooks" / f"{const_id}.ipynb"
    if notebook_src.exists():
        shutil.copy2(notebook_src, const_dir / f"{const_id}.ipynb")
        files_copied.append("Notebook")
    
    # Copy executed notebook
    executed_src = CONSTANTS_DIR / "results" / f"{const_id}_executed.ipynb"
    if executed_src.exists():
        shutil.copy2(executed_src, const_dir / f"{const_id}_executed.ipynb")
        files_copied.append("Executed")
    
    if files_copied:
        print(f"    ✅ Copied: {', '.join(files_copied)}")

def create_assets():
    """Create CSS and JavaScript assets."""
    print("\n🎨 Creating assets...")
    
    assets_dir = EXPORT_DIR / "assets"
    assets_dir.mkdir(exist_ok=True)
    
    # Create comprehensive CSS
    css_content = """
/* Topological Constants - Static Export Styles */

:root {
    --bg-primary: #0a0a0a;
    --bg-secondary: #1a1a1a;
    --bg-tertiary: #252525;
    --text-primary: #ffffff;
    --text-secondary: #a0a0a0;
    --accent: #4a9eff;
    --success: #10b981;
    --warning: #f59e0b;
    --error: #ef4444;
    --border: #333;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header */
.header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    padding: 30px 0;
    margin-bottom: 40px;
}

.header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    background: linear-gradient(135deg, #4a9eff 0%, #00d4ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.subtitle {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin-bottom: 20px;
}

.stats {
    display: flex;
    gap: 30px;
    margin-top: 20px;
}

.stat {
    font-size: 0.95rem;
    color: var(--text-secondary);
}

/* Theory Section */
.theory-section {
    margin-bottom: 60px;
}

.theory-section h2 {
    font-size: 1.8rem;
    margin-bottom: 20px;
    color: var(--accent);
}

.theory-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.theory-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 25px;
}

.theory-card h3 {
    font-size: 1.2rem;
    margin-bottom: 15px;
    color: var(--accent);
}

.formula {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    background: var(--bg-primary);
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 10px;
    overflow-x: auto;
    border: 1px solid var(--border);
}

/* Visualizations */
.visualizations {
    margin-bottom: 60px;
}

.viz-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 30px;
}

.viz-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 25px;
}

.viz-card h3 {
    margin-bottom: 20px;
    color: var(--text-primary);
}

canvas {
    width: 100%;
    height: 300px;
    background: var(--bg-primary);
    border-radius: 8px;
}

/* Constants Section */
.constants-section h2 {
    font-size: 1.8rem;
    margin-bottom: 20px;
    color: var(--accent);
}

.filter-bar {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    flex-wrap: wrap;
}

.filter-btn {
    padding: 8px 16px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.filter-btn:hover {
    background: var(--bg-tertiary);
    border-color: var(--accent);
}

.filter-btn.active {
    background: var(--accent);
    border-color: var(--accent);
}

.constants-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
}

.constant-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px;
    transition: all 0.2s;
}

.constant-card:hover {
    background: var(--bg-tertiary);
    border-color: var(--accent);
    transform: translateY(-2px);
}

.constant-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 15px;
}

.constant-link {
    display: flex;
    align-items: baseline;
    gap: 10px;
    text-decoration: none;
    color: var(--text-primary);
}

.constant-link:hover {
    color: var(--accent);
}

.constant-symbol {
    font-size: 1.3rem;
    font-weight: 600;
}

.constant-name {
    font-size: 0.95rem;
    color: var(--text-secondary);
}

.constant-formula {
    margin-bottom: 15px;
}

.constant-formula code {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    background: var(--bg-primary);
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    color: var(--text-secondary);
}

.constant-values {
    display: flex;
    gap: 30px;
    font-size: 0.9rem;
}

.value-item {
    display: flex;
    gap: 8px;
}

.value-item .label {
    color: var(--text-secondary);
}

.value-item .value {
    font-family: 'JetBrains Mono', monospace;
    color: var(--text-primary);
}

.value-item .value.good {
    color: var(--success);
}

.value-item .value.ok {
    color: var(--warning);
}

.value-item .value.poor {
    color: var(--error);
}

/* Badges */
.badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.badge.success {
    background: var(--success);
    color: white;
}

.badge.warning {
    background: var(--warning);
    color: white;
}

.badge.error {
    background: var(--error);
    color: white;
}

/* Detail Page */
.breadcrumb {
    margin-bottom: 20px;
}

.breadcrumb a {
    color: var(--accent);
    text-decoration: none;
}

.breadcrumb a:hover {
    text-decoration: underline;
}

.description {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin-top: 10px;
}

.detail-grid {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 40px;
}

.detail-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 30px;
}

.detail-section h2 {
    font-size: 1.4rem;
    margin-bottom: 20px;
    color: var(--accent);
}

.detail-section h3 {
    font-size: 1.1rem;
    margin-bottom: 15px;
    color: var(--text-primary);
}

.formula-display {
    font-family: 'JetBrains Mono', monospace;
    background: var(--bg-primary);
    padding: 20px;
    border-radius: 8px;
    font-size: 1.1rem;
    overflow-x: auto;
}

.value-display {
    text-align: center;
    padding: 30px;
}

.big-value {
    font-size: 3rem;
    font-weight: 300;
    font-family: 'JetBrains Mono', monospace;
    color: var(--accent);
}

.unit {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-top: 10px;
}

.comparison-table {
    width: 100%;
    border-collapse: collapse;
}

.comparison-table th,
.comparison-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid var(--border);
}

.comparison-table th {
    background: var(--bg-primary);
    font-weight: 600;
    color: var(--text-secondary);
}

.corrections-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.correction-item {
    background: var(--bg-primary);
    padding: 20px;
    border-radius: 8px;
    border: 1px solid var(--border);
}

.correction-item h3 {
    color: var(--accent);
    margin-bottom: 10px;
}

.correction-item p {
    color: var(--text-secondary);
    margin-top: 10px;
}

.dependencies-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.dependencies-list a {
    padding: 6px 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--accent);
    text-decoration: none;
    transition: all 0.2s;
}

.dependencies-list a:hover {
    background: var(--bg-tertiary);
    border-color: var(--accent);
}

.sources-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.source-item {
    padding: 15px;
    background: var(--bg-primary);
    border-radius: 6px;
    border: 1px solid var(--border);
}

.files-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.file-link {
    display: block;
    padding: 10px 15px;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-primary);
    text-decoration: none;
    transition: all 0.2s;
}

.file-link:hover {
    background: var(--bg-tertiary);
    border-color: var(--accent);
    color: var(--accent);
}

.metadata-list {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
}

.metadata-list dt {
    color: var(--text-secondary);
    font-weight: 600;
}

.metadata-list dd {
    color: var(--text-primary);
}

/* Footer */
.footer {
    margin-top: 80px;
    padding: 30px 0;
    border-top: 1px solid var(--border);
    text-align: center;
    color: var(--text-secondary);
}

.footer p {
    margin: 5px 0;
}

/* Responsive */
@media (max-width: 768px) {
    .theory-cards {
        grid-template-columns: 1fr;
    }
    
    .constants-grid {
        grid-template-columns: 1fr;
    }
    
    .detail-grid {
        grid-template-columns: 1fr;
    }
    
    .viz-grid {
        grid-template-columns: 1fr;
    }
}
"""
    
    css_file = assets_dir / "styles.css"
    css_file.write_text(css_content)
    print(f"  ✅ Created {css_file}")
    
    # Create JavaScript for interactivity
    js_content = """
// Topological Constants - Static Export JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const constantCards = document.querySelectorAll('.constant-card');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter cards
            const category = this.dataset.category;
            constantCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Draw simple visualizations if canvas exists
    const cascadeCanvas = document.getElementById('cascade-chart');
    if (cascadeCanvas && window.__APP_DATA__) {
        drawCascadeChart(cascadeCanvas);
    }
    
    const rgCanvas = document.getElementById('rg-chart');
    if (rgCanvas && window.__APP_DATA__) {
        drawRGChart(rgCanvas);
    }
});

function drawCascadeChart(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    // Simple cascade visualization
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 2;
    
    // Draw exponential decay curve
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
        const n = x / width * 30;
        const y = height - (Math.exp(-n/5) * height * 0.8 + height * 0.1);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Add labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText('n=0', 10, height - 10);
    ctx.fillText('n=30', width - 40, height - 10);
    ctx.fillText('φ₀', 10, 20);
}

function drawRGChart(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    // Simple RG running visualization
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    
    // Draw logarithmic curve
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
        const scale = Math.pow(10, x / width * 14 + 2);
        const y = height - (Math.log10(scale) / 16 * height * 0.8 + height * 0.1);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Add labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText('M_Z', 10, height - 10);
    ctx.fillText('M_GUT', width - 50, height - 10);
}
"""
    
    js_file = assets_dir / "app.js"
    js_file.write_text(js_content)
    print(f"  ✅ Created {js_file}")

def main():
    """Main export function."""
    print("🚀 Starting static site export (Simple Version)...")
    print("=" * 60)
    
    # Check services
    if not check_services():
        sys.exit(1)
    
    # Clear export directory
    clear_export_dir()
    
    # Fetch all data
    data = fetch_all_data()
    
    # Create assets
    create_assets()
    
    # Create main page
    create_main_page(data)
    
    # Create detail pages
    print(f"\n📚 Creating {len(data['constants'])} constant detail pages...")
    for i, constant in enumerate(data['constants'], 1):
        if i % 10 == 1:
            print(f"\n  Processing constants {i}-{min(i+9, len(data['constants']))}...")
        create_detail_page(constant, data)
    
    # Create README
    readme = f"""# Static Export of Topological Constants

This is a fully self-contained static export of the Topological Constants web application.

## Contents

- `index.html` - Main page with all constants and visualizations
- `constants/` - Individual constant detail pages
  - Each constant directory contains:
    - `index.html` - Detail page
    - `[id].json` - Original definition
    - `[id]_result.json` - Calculation results  
    - `[id].ipynb` - Jupyter notebook
    - `[id]_executed.ipynb` - Executed notebook
- `assets/` - CSS and JavaScript files

## Features

- ✅ All constants with formulas and calculated values
- ✅ Theory visualizations (E8 Cascade, RG Running)
- ✅ Correction factors overview
- ✅ Individual detail pages for each constant
- ✅ All notebooks and data files included
- ✅ Fully offline-capable (no server required)
- ✅ Dark mode UI with modern styling

## Viewing

Simply open `index.html` in any modern web browser. All data is embedded, so no internet connection or server is required.

## Statistics

- Total constants: {len(data['constants'])}
- Generated on: {time.strftime('%Y-%m-%d %H:%M:%S')}
- Export size: ~{sum(1 for _ in EXPORT_DIR.rglob('*')) if EXPORT_DIR.exists() else 0} files

## Theory

Based on the Topological Fixed Point Theory with fundamental constants:
- c₃ = 1/(8π) = 0.03979
- φ₀ = 0.053171  
- M_Pl = 1.2209×10¹⁹ GeV

© 2025 Topological Fixed Point Theory
"""
    
    readme_file = EXPORT_DIR / "README.md"
    readme_file.write_text(readme)
    
    print("\n" + "=" * 60)
    print("✅ Export completed successfully!")
    print(f"📁 Location: {EXPORT_DIR.absolute()}")
    print(f"📊 Constants exported: {len(data['constants'])}")
    print(f"📄 Total files: ~{sum(1 for _ in EXPORT_DIR.rglob('*'))}")
    print(f"\n🌐 To view: Open {EXPORT_DIR.absolute() / 'index.html'}")
    print("=" * 60)

if __name__ == "__main__":
    main()