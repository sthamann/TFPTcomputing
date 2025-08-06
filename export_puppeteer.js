#!/usr/bin/env node

/**
 * Export the React app as static HTML using Puppeteer
 * This captures the EXACT rendered output including all styles and computed layouts
 */

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:8000';
const EXPORT_DIR = path.join(__dirname, 'export');

// Ensure required packages are installed
async function checkDependencies() {
    const deps = ['puppeteer', 'fs-extra', 'axios'];
    for (const dep of deps) {
        try {
            require.resolve(dep);
        } catch (e) {
            console.log(`📦 Installing ${dep}...`);
            require('child_process').execSync(`npm install ${dep}`, { stdio: 'inherit' });
        }
    }
}

async function clearExportDir() {
    console.log('🗑️  Clearing export directory...');
    await fs.remove(EXPORT_DIR);
    await fs.ensureDir(EXPORT_DIR);
    await fs.ensureDir(path.join(EXPORT_DIR, 'constants'));
    await fs.ensureDir(path.join(EXPORT_DIR, 'assets'));
}

async function checkServices() {
    try {
        await axios.get(`${BACKEND_URL}/api/constants`);
        console.log('✅ Backend is running');
        await axios.get(FRONTEND_URL);
        console.log('✅ Frontend is running');
        return true;
    } catch (e) {
        console.error('❌ Services not running. Please run ./start-local.sh first');
        return false;
    }
}

async function capturePageAsStaticHTML(browser, url, outputPath, isDetailPage = false) {
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate and wait for full render
    console.log(`  ⏳ Loading ${url}...`);
    await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 60000 
    });
    
    // Wait for React to fully render
    await page.waitForTimeout(3000);
    
    // Wait for specific elements to ensure page is ready
    try {
        if (isDetailPage) {
            await page.waitForSelector('.bg-gray-900', { timeout: 10000 });
        } else {
            await page.waitForSelector('table', { timeout: 10000 });
        }
    } catch (e) {
        console.log('  ⚠️  Some elements may not have loaded');
    }
    
    // Extract all styles and inline them
    const { html, inlineStyles } = await page.evaluate(() => {
        // Get all stylesheets
        const styles = [];
        
        // Extract from <style> tags
        document.querySelectorAll('style').forEach(style => {
            styles.push(style.innerHTML);
        });
        
        // Extract from stylesheets
        for (const sheet of document.styleSheets) {
            try {
                const rules = Array.from(sheet.cssRules || sheet.rules || []);
                styles.push(rules.map(rule => rule.cssText).join('\n'));
            } catch (e) {
                // Cross-origin stylesheets will throw
            }
        }
        
        // Get computed styles for all elements (this captures everything)
        const allElements = document.querySelectorAll('*');
        const computedStyles = new Map();
        
        allElements.forEach((el, index) => {
            const computed = window.getComputedStyle(el);
            const important = [];
            
            // Get all computed properties
            for (let i = 0; i < computed.length; i++) {
                const prop = computed[i];
                const value = computed.getPropertyValue(prop);
                if (value && value !== 'initial' && value !== 'inherit') {
                    important.push(`${prop}: ${value}`);
                }
            }
            
            if (important.length > 0) {
                // Add a unique class to this element
                const className = `static-export-${index}`;
                el.classList.add(className);
                computedStyles.set(className, important.join('; '));
            }
        });
        
        // Build inline styles
        let inlineStyles = styles.join('\n');
        
        // Add computed styles
        computedStyles.forEach((style, className) => {
            inlineStyles += `\n.${className} { ${style} }`;
        });
        
        return {
            html: document.documentElement.outerHTML,
            inlineStyles
        };
    });
    
    // Process the HTML to make it fully static
    let processedHtml = html;
    
    // Remove all script tags
    processedHtml = processedHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove React/Next.js specific attributes
    processedHtml = processedHtml.replace(/data-reactroot="[^"]*"/g, '');
    processedHtml = processedHtml.replace(/data-react[^=]*="[^"]*"/g, '');
    
    // Fix links for static export
    if (isDetailPage) {
        // Detail pages need to go back to main
        processedHtml = processedHtml.replace(/href="\/constants"/g, 'href="../../index.html"');
        processedHtml = processedHtml.replace(/href="\/constants\/([^"]+)"/g, 'href="../$1/index.html"');
    } else {
        // Main page links to details
        processedHtml = processedHtml.replace(/href="\/constants\/([^"]+)"/g, 'href="constants/$1/index.html"');
    }
    
    // Inject all styles inline
    const styleTag = `<style>${inlineStyles}</style>`;
    processedHtml = processedHtml.replace('</head>', `${styleTag}\n</head>`);
    
    // Add export notice
    const exportNotice = `
    <!-- Static export generated on ${new Date().toISOString()} -->
    <!-- This is a pixel-perfect static copy of the React app -->
    `;
    processedHtml = processedHtml.replace('<head>', `<head>\n${exportNotice}`);
    
    // Save the HTML
    await fs.writeFile(outputPath, processedHtml);
    console.log(`  ✅ Saved ${path.basename(outputPath)}`);
    
    await page.close();
}

async function copyConstantFiles(constantId) {
    const srcDir = path.join(__dirname, 'constants');
    const destDir = path.join(EXPORT_DIR, 'constants', constantId);
    
    const files = [
        { src: `data/${constantId}.json`, dest: `${constantId}.json` },
        { src: `results/json/${constantId}_result.json`, dest: `${constantId}_result.json` },
        { src: `notebooks/${constantId}.ipynb`, dest: `${constantId}.ipynb` },
        { src: `results/${constantId}_executed.ipynb`, dest: `${constantId}_executed.ipynb` }
    ];
    
    for (const file of files) {
        const srcPath = path.join(srcDir, file.src);
        const destPath = path.join(destDir, file.dest);
        
        if (await fs.pathExists(srcPath)) {
            await fs.copy(srcPath, destPath);
        }
    }
}

async function main() {
    console.log('🚀 Starting Puppeteer-based static export...');
    console.log('=' .repeat(60));
    
    // Check dependencies
    await checkDependencies();
    
    // Check services
    if (!await checkServices()) {
        process.exit(1);
    }
    
    // Clear export directory
    await clearExportDir();
    
    // Launch Puppeteer
    console.log('\n🌐 Launching headless browser...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        // Capture main constants page
        console.log('\n📄 Capturing main constants page...');
        await capturePageAsStaticHTML(
            browser,
            `${FRONTEND_URL}/constants`,
            path.join(EXPORT_DIR, 'index.html'),
            false
        );
        
        // Get list of constants from API
        console.log('\n📊 Fetching constants list...');
        const response = await axios.get(`${BACKEND_URL}/api/constants`);
        const constants = response.data;
        console.log(`  Found ${constants.length} constants`);
        
        // Capture each constant detail page
        console.log(`\n📚 Capturing ${constants.length} detail pages...`);
        for (let i = 0; i < constants.length; i++) {
            const constant = constants[i];
            const progress = `[${i + 1}/${constants.length}]`;
            
            console.log(`\n${progress} ${constant.id}`);
            
            // Create directory
            const constDir = path.join(EXPORT_DIR, 'constants', constant.id);
            await fs.ensureDir(constDir);
            
            // Capture the page
            await capturePageAsStaticHTML(
                browser,
                `${FRONTEND_URL}/constants/${constant.id}`,
                path.join(constDir, 'index.html'),
                true
            );
            
            // Copy associated files
            await copyConstantFiles(constant.id);
            console.log(`  ✅ Copied data files`);
            
            // Small delay to avoid overwhelming the server
            if ((i + 1) % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // Copy any static assets
        console.log('\n🎨 Copying static assets...');
        
        // Try to download key assets
        const assets = [
            { url: '/icon.svg', file: 'icon.svg' },
            { url: '/favicon.ico', file: 'favicon.ico' }
        ];
        
        for (const asset of assets) {
            try {
                const response = await axios.get(`${FRONTEND_URL}${asset.url}`, {
                    responseType: 'arraybuffer'
                });
                await fs.writeFile(
                    path.join(EXPORT_DIR, 'assets', asset.file),
                    response.data
                );
                console.log(`  ✅ Copied ${asset.file}`);
            } catch (e) {
                // Asset might not exist
            }
        }
        
    } finally {
        await browser.close();
    }
    
    // Create README
    const readme = `# Static Export - Topological Constants

This is a pixel-perfect static export of the Topological Constants React application.
All pages are captured exactly as they appear in the browser, with all styles preserved.

## Features

✅ 100% identical to the React app
✅ All styles and layouts preserved
✅ Complete data pre-rendered
✅ Works completely offline
✅ No JavaScript required

## Contents

- \`index.html\` - Main constants page
- \`constants/[id]/\` - Individual constant pages
  - \`index.html\` - Detail page
  - \`[id].json\` - Original definition
  - \`[id]_result.json\` - Calculation results
  - \`[id].ipynb\` - Jupyter notebook
  - \`[id]_executed.ipynb\` - Executed notebook

Generated: ${new Date().toISOString()}
Total constants: ${constants.length}

© 2025 Topological Fixed Point Theory
`;
    
    await fs.writeFile(path.join(EXPORT_DIR, 'README.md'), readme);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Export completed successfully!');
    console.log(`📁 Location: ${path.resolve(EXPORT_DIR)}`);
    
    // Count files
    const fileCount = await countFiles(EXPORT_DIR);
    console.log(`📄 Total files: ${fileCount}`);
    
    console.log(`\n🌐 Open: ${path.resolve(EXPORT_DIR, 'index.html')}`);
    console.log('='.repeat(60));
}

async function countFiles(dir) {
    let count = 0;
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
        if (item.isDirectory()) {
            count += await countFiles(path.join(dir, item.name));
        } else {
            count++;
        }
    }
    
    return count;
}

// Run the export
main().catch(console.error);