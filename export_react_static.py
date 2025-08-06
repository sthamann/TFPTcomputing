#!/usr/bin/env python3
"""
Export the constants page by building a static version with all data embedded.
This version pre-renders all values directly into the HTML.
"""

import os
import json
import shutil
import requests
from pathlib import Path
import time
import sys
import re
from bs4 import BeautifulSoup

# Configuration
BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"
EXPORT_DIR = Path("export")
CONSTANTS_DIR = Path("constants")
FRONTEND_DIR = Path("frontend")

def clear_export_dir():
    """Clear the export directory."""
    if EXPORT_DIR.exists():
        print(f"🗑️  Clearing existing export directory: {EXPORT_DIR}")
        shutil.rmtree(EXPORT_DIR)
    EXPORT_DIR.mkdir(exist_ok=True)
    print(f"📁 Created fresh export directory: {EXPORT_DIR}")

def check_services():
    """Check if services are running."""
    try:
        response = requests.get(f"{BACKEND_URL}/api/constants", timeout=5)
        if response.status_code == 200:
            print(f"✅ Backend is running")
            return True
    except:
        pass
    
    print(f"❌ Backend is not accessible")
    print(f"   Please run ./start-local.sh first")
    return False

def fetch_all_data():
    """Fetch all data from the backend."""
    print("\n📊 Fetching all data from API...")
    
    # Get constants with full calculation data
    response = requests.get(f"{BACKEND_URL}/api/constants")
    constants = response.json()
    print(f"  ✅ Fetched {len(constants)} constants")
    
    # Get theory data
    theory_data = {}
    endpoints = {
        'cascade': '/api/theory/cascade/30',
        'special_scales': '/api/theory/special-scales',
        'correction_factors': '/api/theory/correction-factors',
        'rg_running': '/api/theory/rg-running/91.1876'
    }
    
    for key, endpoint in endpoints.items():
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}")
            theory_data[key] = response.json()
            print(f"  ✅ Fetched {key} data")
        except:
            theory_data[key] = None
    
    return constants, theory_data

def create_main_page_html(constants, theory_data):
    """Create the main index.html with the exact React app appearance."""
    
    # Group constants by category
    categories = {
        'fundamental_theory': [],
        'primary': [],
        'secondary': [],
        'derived': [],
        'cascade': [],
        'cosmological': []
    }
    
    for const in constants:
        cat = const.get('category', 'derived')
        if cat in categories:
            categories[cat].append(const)
        else:
            categories['derived'].append(const)
    
    # Count statistics
    total = len(constants)
    perfect = sum(1 for c in constants if abs(c.get('lastCalculation', {}).get('relative_error', 1)) <= 0.005)
    good = sum(1 for c in constants if 0.005 < abs(c.get('lastCalculation', {}).get('relative_error', 1)) <= 0.05)
    needs_work = total - perfect - good
    
    html = f"""<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Topological Constants Calculator</title>
    <link rel="icon" type="image/svg+xml" href="/icon.svg">
    <style>
        {get_complete_styles()}
    </style>
</head>
<body>
    <div id="root">
        <div class="min-h-screen bg-gray-950 text-white">
            <!-- Header -->
            <header class="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-4 py-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Topological Constants v0.8 · July 30, 2025
                            </h1>
                            <p class="text-gray-400 text-sm mt-1">
                                Precise calculations and theoretical correlations of fundamental constants
                            </p>
                        </div>
                        <div class="flex items-center gap-6 text-sm">
                            <div class="text-gray-400">
                                <span class="text-white font-semibold">α⁻¹ = 137.036</span>
                                <span class="ml-2">Fine Structure</span>
                            </div>
                            <div class="text-gray-400">
                                <span class="text-white font-semibold">{total}</span>
                                <span class="ml-2">Constants Calculated</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            <!-- Main Content -->
            <main class="max-w-7xl mx-auto px-4 py-8">
                <!-- Theory Overview -->
                <div class="mb-12">
                    <h2 class="text-xl font-semibold mb-6 text-blue-400">Topological Fixed Point Theory</h2>
                    <div class="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                        <p class="text-gray-300 mb-4">
                            All mysterious correction factors reduce to just three fundamental mechanisms
                        </p>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="bg-gray-950/50 rounded-lg p-4 border border-gray-800">
                                <h3 class="text-blue-400 font-semibold mb-2">4D-Loop</h3>
                                <p class="text-xs text-gray-500 mb-2">One-Loop Renormalization</p>
                                <div class="font-mono text-sm bg-black/50 rounded px-3 py-2">
                                    1 - 1/(4π) = 1 - 2c₃
                                </div>
                                <div class="text-cyan-400 font-mono mt-2">0.9204</div>
                            </div>
                            <div class="bg-gray-950/50 rounded-lg p-4 border border-gray-800">
                                <h3 class="text-blue-400 font-semibold mb-2">KK-Geometry</h3>
                                <p class="text-xs text-gray-500 mb-2">Kaluza-Klein Shell</p>
                                <div class="font-mono text-sm bg-black/50 rounded px-3 py-2">
                                    1 - 1/(2π) = 1 - 4c₃
                                </div>
                                <div class="text-cyan-400 font-mono mt-2">0.8410</div>
                            </div>
                            <div class="bg-gray-950/50 rounded-lg p-4 border border-gray-800">
                                <h3 class="text-blue-400 font-semibold mb-2">VEV-Backreaction</h3>
                                <p class="text-xs text-gray-500 mb-2">Radion Self-Coupling</p>
                                <div class="font-mono text-sm bg-black/50 rounded px-3 py-2">
                                    1 ± kφ₀
                                </div>
                                <div class="text-cyan-400 font-mono mt-2">k = 1, 2</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Constants List -->
                <div>
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-semibold text-blue-400">Physics Constants from Theory</h2>
                        <div class="flex gap-4 text-sm">
                            <span class="text-gray-400">
                                Total Constants: <span class="text-white font-semibold">{total}</span>
                            </span>
                            <span class="text-green-400">
                                Perfect (≤0.5%): <span class="font-semibold">{perfect}</span>
                            </span>
                            <span class="text-yellow-400">
                                Good (0.5%-5%): <span class="font-semibold">{good}</span>
                            </span>
                            <span class="text-red-400">
                                Needs Improvement (>5%): <span class="font-semibold">{needs_work}</span>
                            </span>
                        </div>
                    </div>
                    
                    <!-- Category Tabs -->
                    <div class="flex gap-2 mb-6 flex-wrap">
                        <button class="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/50">
                            All ({total})
                        </button>
                        <button class="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700">
                            Fundamental ({len(categories['fundamental_theory'])})
                        </button>
                        <button class="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700">
                            Primary ({len(categories['primary'])})
                        </button>
                        <button class="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700">
                            Secondary ({len(categories['secondary'])})
                        </button>
                        <button class="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700">
                            Derived ({len(categories['derived'])})
                        </button>
                    </div>
                    
                    <!-- Constants Table -->
                    <div class="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 overflow-hidden">
                        <table class="w-full">
                            <thead class="bg-gray-950/50 border-b border-gray-800">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Formula</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Theory Value</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Measured Value</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Deviation</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Unit</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-800">
"""
    
    # Add each constant as a table row
    for const in constants:
        calc = const.get('lastCalculation', {})
        value = calc.get('value')
        measured = calc.get('measured_value')
        error = calc.get('relative_error', 0)
        status = calc.get('status', 'unknown')
        
        # Format values
        if value is not None:
            if abs(value) < 1e-4 or abs(value) > 1e4:
                value_str = f"{value:.4e}"
            else:
                value_str = f"{value:.4f}"
        else:
            value_str = "—"
        
        if measured is not None:
            if abs(measured) < 1e-4 or abs(measured) > 1e4:
                measured_str = f"{measured:.4e}"
            else:
                measured_str = f"{measured:.4f}"
        else:
            measured_str = "—"
        
        # Deviation styling
        if error and error != 0:
            error_pct = error * 100
            if abs(error_pct) < 0.5:
                dev_class = "text-green-400"
            elif abs(error_pct) < 5:
                dev_class = "text-yellow-400"
            else:
                dev_class = "text-red-400"
            dev_str = f"{error_pct:+.2f}%"
        else:
            dev_class = "text-gray-500"
            dev_str = "—"
        
        # Formula (truncate if too long)
        formula = const.get('formula', '')
        if len(formula) > 60:
            formula = formula[:57] + "..."
        
        # Add corrections indicator
        corrections = const.get('metadata', {}).get('correction_factors', [])
        if corrections:
            formula += f' <span class="text-cyan-400 text-xs ml-2">+{len(corrections)} corr</span>'
        
        html += f"""
                                <tr class="hover:bg-gray-800/50 transition-colors">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <a href="constants/{const['id']}/index.html" class="text-blue-400 hover:text-blue-300 font-mono font-semibold">
                                            {const.get('symbol', '')}
                                        </a>
                                    </td>
                                    <td class="px-6 py-4">
                                        <a href="constants/{const['id']}/index.html" class="text-gray-300 hover:text-white">
                                            {const.get('name', '')}
                                        </a>
                                    </td>
                                    <td class="px-6 py-4">
                                        <code class="text-xs text-gray-400 font-mono">{formula}</code>
                                    </td>
                                    <td class="px-6 py-4 font-mono text-sm text-gray-300">{value_str}</td>
                                    <td class="px-6 py-4 font-mono text-sm text-gray-400">{measured_str}</td>
                                    <td class="px-6 py-4 font-mono text-sm {dev_class}">{dev_str}</td>
                                    <td class="px-6 py-4 text-xs text-gray-500">{const.get('unit', '')}</td>
                                </tr>
"""
    
    html += """
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            
            <!-- Footer -->
            <footer class="mt-20 py-8 border-t border-gray-800">
                <div class="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>Static export generated on """ + time.strftime('%Y-%m-%d %H:%M:%S') + """</p>
                    <p class="mt-2">Topological Fixed Point Theory © 2025</p>
                </div>
            </footer>
        </div>
    </div>
    
    <script>
        // Simple filter functionality
        document.addEventListener('DOMContentLoaded', function() {
            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Simple visual feedback
                    buttons.forEach(b => {
                        b.classList.remove('bg-blue-500/20', 'text-blue-400', 'border-blue-500/50');
                        b.classList.add('bg-gray-800', 'text-gray-400', 'border-gray-700');
                    });
                    this.classList.remove('bg-gray-800', 'text-gray-400', 'border-gray-700');
                    this.classList.add('bg-blue-500/20', 'text-blue-400', 'border-blue-500/50');
                });
            });
        });
    </script>
</body>
</html>"""
    
    return html

def create_detail_page_html(const):
    """Create a detail page for a constant."""
    const_id = const['id']
    calc = const.get('lastCalculation', {})
    
    # Format values
    value = calc.get('value')
    measured = calc.get('measured_value')
    
    if value is not None:
        if abs(value) < 1e-6 or abs(value) > 1e6:
            value_str = f"{value:.8e}"
        else:
            value_str = f"{value:.8f}"
    else:
        value_str = "Not calculated"
    
    if measured is not None:
        if abs(measured) < 1e-6 or abs(measured) > 1e6:
            measured_str = f"{measured:.8e}"
        else:
            measured_str = f"{measured:.8f}"
    else:
        measured_str = "—"
    
    html = f"""<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{const.get('name', const_id)} - Topological Constants</title>
    <style>
        {get_complete_styles()}
    </style>
</head>
<body>
    <div id="root">
        <div class="min-h-screen bg-gray-950 text-white">
            <!-- Header -->
            <header class="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
                <div class="max-w-7xl mx-auto px-4 py-4">
                    <nav class="mb-4">
                        <a href="../../index.html" class="text-blue-400 hover:text-blue-300">
                            ← Back to Constants
                        </a>
                    </nav>
                    <h1 class="text-3xl font-bold">
                        <span class="text-blue-400 font-mono mr-3">{const.get('symbol', '')}</span>
                        <span class="text-gray-300">{const.get('name', const_id)}</span>
                    </h1>
                    <p class="text-gray-400 mt-2">{const.get('description', '')}</p>
                </div>
            </header>
            
            <!-- Main Content -->
            <main class="max-w-7xl mx-auto px-4 py-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Main Column -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Formula -->
                        <div class="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                            <h2 class="text-lg font-semibold text-blue-400 mb-4">Formula</h2>
                            <div class="bg-black/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                {const.get('formula', 'No formula available')}
                            </div>
                        </div>
                        
                        <!-- Calculated Value -->
                        <div class="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                            <h2 class="text-lg font-semibold text-blue-400 mb-4">Calculated Value</h2>
                            <div class="text-center py-8">
                                <div class="text-5xl font-light font-mono text-cyan-400">
                                    {value_str}
                                </div>
                                <div class="text-gray-400 mt-2">
                                    {const.get('unit', 'dimensionless')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Comparison -->
                        <div class="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                            <h2 class="text-lg font-semibold text-blue-400 mb-4">Comparison with Experiment</h2>
                            <table class="w-full">
                                <thead>
                                    <tr class="border-b border-gray-800">
                                        <th class="text-left py-2 text-gray-400">Source</th>
                                        <th class="text-left py-2 text-gray-400">Value</th>
                                        <th class="text-left py-2 text-gray-400">Deviation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="border-b border-gray-800/50">
                                        <td class="py-3">Theory (TFPT)</td>
                                        <td class="py-3 font-mono">{value_str}</td>
                                        <td class="py-3">—</td>
                                    </tr>
                                    <tr>
                                        <td class="py-3">Experimental</td>
                                        <td class="py-3 font-mono">{measured_str}</td>
                                        <td class="py-3 font-mono {'text-green-400' if abs(calc.get('relative_error', 1)) < 0.01 else 'text-yellow-400' if abs(calc.get('relative_error', 1)) < 0.05 else 'text-red-400'}">{f"{calc.get('relative_error', 0)*100:+.4f}%" if calc.get('relative_error') else "—"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
"""
    
    # Add correction factors if present
    corrections = const.get('metadata', {}).get('correction_factors', [])
    if corrections:
        html += """
                        <!-- Correction Factors -->
                        <div class="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                            <h2 class="text-lg font-semibold text-blue-400 mb-4">Applied Correction Factors</h2>
                            <div class="space-y-4">
"""
        for corr in corrections:
            html += f"""
                                <div class="bg-gray-950/50 rounded-lg p-4 border border-gray-800">
                                    <h3 class="text-cyan-400 font-semibold mb-2">{corr.get('name', '')}</h3>
                                    <div class="font-mono text-sm bg-black/50 rounded px-3 py-2 mb-2">
                                        {corr.get('formula', '')}
                                    </div>
                                    <p class="text-gray-400 text-sm">{corr.get('description', '')}</p>
                                </div>
"""
        html += """
                            </div>
                        </div>
"""
    
    html += """
                    </div>
                    
                    <!-- Sidebar -->
                    <div class="space-y-6">
                        <!-- Files -->
                        <div class="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                            <h3 class="text-lg font-semibold text-blue-400 mb-4">Files</h3>
                            <div class="space-y-2">
                                <a href=""" + f'"{const_id}.json"' + """ class="block px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors">
                                    📄 Definition (JSON)
                                </a>
                                <a href=""" + f'"{const_id}_result.json"' + """ class="block px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors">
                                    📊 Results (JSON)
                                </a>
                                <a href=""" + f'"{const_id}.ipynb"' + """ class="block px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors">
                                    📓 Notebook
                                </a>
                                <a href=""" + f'"{const_id}_executed.ipynb"' + """ class="block px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors">
                                    📓 Executed Notebook
                                </a>
                            </div>
                        </div>
                        
                        <!-- Metadata -->
                        <div class="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                            <h3 class="text-lg font-semibold text-blue-400 mb-4">Metadata</h3>
                            <dl class="space-y-2 text-sm">
                                <div>
                                    <dt class="text-gray-400">Category:</dt>
                                    <dd class="text-gray-300">""" + const.get('category', 'unknown') + """</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-400">Accuracy Target:</dt>
                                    <dd class="text-gray-300">""" + f"{const.get('accuracyTarget', 0.001)*100:.1f}%" + """</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-400">Status:</dt>
                                    <dd class="text-gray-300">""" + calc.get('status', 'unknown') + """</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-400">Last Updated:</dt>
                                    <dd class="text-gray-300">""" + (calc.get('timestamp', 'Unknown')[:10] if calc.get('timestamp') else 'Unknown') + """</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </main>
            
            <!-- Footer -->
            <footer class="mt-20 py-8 border-t border-gray-800">
                <div class="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>Topological Fixed Point Theory © 2025</p>
                </div>
            </footer>
        </div>
    </div>
</body>
</html>"""
    
    return html

def get_complete_styles():
    """Get Tailwind-like styles for the export."""
    return """
        /* Reset and base styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        html { font-size: 16px; }
        html.dark { color-scheme: dark; }
        
        body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
        }
        
        /* Tailwind-like utilities */
        .min-h-screen { min-height: 100vh; }
        .max-w-7xl { max-width: 80rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .p-6 { padding: 1.5rem; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .mt-20 { margin-top: 5rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-12 { margin-bottom: 3rem; }
        .ml-2 { margin-left: 0.5rem; }
        .mr-3 { margin-right: 0.75rem; }
        .space-y-2 > * + * { margin-top: 0.5rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        
        /* Colors */
        .bg-gray-950 { background-color: rgb(3 7 18); }
        .bg-gray-900 { background-color: rgb(17 24 39); }
        .bg-gray-900\/50 { background-color: rgb(17 24 39 / 0.5); }
        .bg-gray-950\/50 { background-color: rgb(3 7 18 / 0.5); }
        .bg-gray-800 { background-color: rgb(31 41 55); }
        .bg-gray-800\/50 { background-color: rgb(31 41 55 / 0.5); }
        .bg-gray-700 { background-color: rgb(55 65 81); }
        .bg-black\/50 { background-color: rgb(0 0 0 / 0.5); }
        .bg-blue-500\/20 { background-color: rgb(59 130 246 / 0.2); }
        
        .text-white { color: rgb(255 255 255); }
        .text-gray-300 { color: rgb(209 213 219); }
        .text-gray-400 { color: rgb(156 163 175); }
        .text-gray-500 { color: rgb(107 114 128); }
        .text-blue-400 { color: rgb(96 165 250); }
        .text-blue-300 { color: rgb(147 197 253); }
        .text-cyan-400 { color: rgb(34 211 238); }
        .text-green-400 { color: rgb(74 222 128); }
        .text-yellow-400 { color: rgb(250 204 21); }
        .text-red-400 { color: rgb(248 113 113); }
        
        .border { border-width: 1px; }
        .border-t { border-top-width: 1px; }
        .border-b { border-bottom-width: 1px; }
        .border-gray-800 { border-color: rgb(31 41 55); }
        .border-gray-800\/50 { border-color: rgb(31 41 55 / 0.5); }
        .border-gray-700 { border-color: rgb(55 65 81); }
        .border-blue-500\/50 { border-color: rgb(59 130 246 / 0.5); }
        
        /* Typography */
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-5xl { font-size: 3rem; line-height: 1; }
        
        .font-light { font-weight: 300; }
        .font-medium { font-weight: 500; }
        .font-semibold { font-weight: 600; }
        .font-bold { font-weight: 700; }
        .font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace; }
        
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 0.05em; }
        
        /* Layout */
        .flex { display: flex; }
        .grid { display: grid; }
        .block { display: block; }
        .hidden { display: none; }
        
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .gap-2 { gap: 0.5rem; }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .gap-8 { gap: 2rem; }
        
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        
        .overflow-hidden { overflow: hidden; }
        .overflow-x-auto { overflow-x: auto; }
        
        .rounded { border-radius: 0.25rem; }
        .rounded-lg { border-radius: 0.5rem; }
        
        .sticky { position: sticky; }
        .top-0 { top: 0; }
        .z-50 { z-index: 50; }
        
        .backdrop-blur-sm { backdrop-filter: blur(4px); }
        
        /* Gradients */
        .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
        .from-blue-400 { --tw-gradient-from: rgb(96 165 250); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
        .to-cyan-400 { --tw-gradient-to: rgb(34 211 238); }
        .bg-clip-text { -webkit-background-clip: text; background-clip: text; }
        .text-transparent { color: transparent; }
        
        /* Transitions */
        .transition-colors { transition-property: color, background-color, border-color; transition-duration: 150ms; }
        .hover\:bg-gray-700:hover { background-color: rgb(55 65 81); }
        .hover\:bg-gray-800\/50:hover { background-color: rgb(31 41 55 / 0.5); }
        .hover\:text-white:hover { color: rgb(255 255 255); }
        .hover\:text-blue-300:hover { color: rgb(147 197 253); }
        
        /* Tables */
        table { border-collapse: collapse; }
        .w-full { width: 100%; }
        .whitespace-nowrap { white-space: nowrap; }
        .divide-y > * + * { border-top-width: 1px; }
        .divide-gray-800 > * + * { border-color: rgb(31 41 55); }
        
        th, td { text-align: left; }
        
        /* Links */
        a { text-decoration: none; color: inherit; }
        
        /* Code blocks */
        code {
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace;
            font-size: 0.875em;
        }
        
        /* Responsive */
        @media (min-width: 768px) {
            .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        
        @media (min-width: 1024px) {
            .lg\:col-span-2 { grid-column: span 2 / span 2; }
            .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgb(17 24 39); }
        ::-webkit-scrollbar-thumb { background: rgb(55 65 81); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgb(75 85 99); }
    """

def copy_constant_files(const_id, const_dir):
    """Copy notebooks and JSON files."""
    files_copied = []
    
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

def main():
    """Main export function."""
    print("🚀 Starting React-style static export...")
    print("=" * 60)
    
    # Check services
    if not check_services():
        sys.exit(1)
    
    # Clear export directory
    clear_export_dir()
    
    # Fetch all data
    constants, theory_data = fetch_all_data()
    
    # Create main page
    print("\n📄 Creating main page...")
    main_html = create_main_page_html(constants, theory_data)
    index_file = EXPORT_DIR / "index.html"
    index_file.write_text(main_html)
    print(f"  ✅ Saved {index_file}")
    
    # Create detail pages
    print(f"\n📚 Creating {len(constants)} detail pages...")
    for i, const in enumerate(constants, 1):
        if i % 10 == 1:
            print(f"\n  Processing constants {i}-{min(i+9, len(constants))}...")
        
        const_id = const['id']
        const_dir = EXPORT_DIR / "constants" / const_id
        const_dir.mkdir(parents=True, exist_ok=True)
        
        # Create detail HTML
        detail_html = create_detail_page_html(const)
        detail_file = const_dir / "index.html"
        detail_file.write_text(detail_html)
        
        # Copy files
        copy_constant_files(const_id, const_dir)
    
    # Create README
    readme = f"""# Static Export - Topological Constants

Complete static export with all data pre-rendered in HTML.
Matches the exact appearance of the React application.

## Features

✅ Exact React app appearance (dark theme)
✅ All values pre-rendered in HTML
✅ No JavaScript required for viewing data
✅ Complete formula display
✅ Correction factors shown
✅ All notebooks and JSON files included

## Contents

- `index.html` - Main page with all constants
- `constants/[id]/` - Individual constant pages
  - `index.html` - Pre-rendered detail page
  - `[id].json` - Original definition
  - `[id]_result.json` - Calculation results
  - `[id].ipynb` - Jupyter notebook
  - `[id]_executed.ipynb` - Executed notebook

Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}
Total constants: {len(constants)}

© 2025 Topological Fixed Point Theory
"""
    
    readme_file = EXPORT_DIR / "README.md"
    readme_file.write_text(readme)
    
    # Summary
    print("\n" + "=" * 60)
    print("✅ Export completed successfully!")
    print(f"📁 Location: {EXPORT_DIR.absolute()}")
    print(f"📊 Constants: {len(constants)}")
    print(f"📄 Files: ~{sum(1 for _ in EXPORT_DIR.rglob('*'))}")
    print(f"\n🌐 Open: {EXPORT_DIR.absolute() / 'index.html'}")
    print("=" * 60)

if __name__ == "__main__":
    main()