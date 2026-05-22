// Tab switching
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        e.target.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Analyze button
const analyzeBtn = document.getElementById('analyze-btn');
const urlsInput = document.getElementById('urls-input');
const statusMessage = document.getElementById('analysis-status');
const optimizeBtn = document.getElementById('optimize-btn');
const previewFormat = document.getElementById('preview-format');

function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message show ${type}`;
    setTimeout(() => {
        statusMessage.classList.remove('show');
    }, 5000);
}

analyzeBtn.addEventListener('click', async () => {
    const urls = urlsInput.value
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0 && isValidUrl(url));
    
    if (urls.length === 0) {
        showStatus('Please enter at least one valid URL', 'error');
        return;
    }
    
    if (urls.length > 5) {
        showStatus('Maximum 5 URLs allowed for analysis', 'error');
        return;
    }
    
    analyzeBtn.disabled = true;
    const spinner = analyzeBtn.querySelector('.spinner');
    const btnText = analyzeBtn.querySelector('.btn-text');
    spinner.style.display = 'inline-block';
    btnText.textContent = 'Analyzing...';
    
    showStatus('Starting analysis...', 'info');
    
    try {
        // Send analysis request to background worker
        const response = await chrome.runtime.sendMessage({
            action: 'analyzeUrls',
            urls: urls,
            options: {
                homepage: document.getElementById('analyze-homepage').checked,
                conversion: document.getElementById('analyze-conversion').checked,
                product: document.getElementById('analyze-product').checked,
                design: document.getElementById('analyze-design').checked,
                navigation: document.getElementById('analyze-navigation').checked
            }
        });
        
        if (response.success) {
            showStatus('Analysis complete!', 'success');
            displayReport(response.analysis);
            
            // Show optimize button
            optimizeBtn.style.display = 'flex';
            previewFormat.style.display = 'block';
            
            // Auto-switch to report tab
            document.querySelector('[data-tab="report"]').click();
        } else {
            showStatus(`Error: ${response.error}`, 'error');
        }
    } catch (error) {
        showStatus(`Analysis failed: ${error.message}`, 'error');
        console.error('Analysis error:', error);
    } finally {
        analyzeBtn.disabled = false;
        spinner.style.display = 'none';
        btnText.textContent = 'Analyze URLs';
    }
});

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function displayReport(analysis) {
    const reportContainer = document.getElementById('report-container');
    let html = '<div class="report-container">';
    
    // Overall Strengths
    html += `
        <div class="report-section">
            <h3>📊 Overall Analysis Summary</h3>
            <ul>
                <li>URLs Analyzed: ${analysis.urlsAnalyzed || analysis.urls?.length || 0}</li>
                <li>Average Conversion Score: ${analysis.overallScore?.toFixed(1) || 'N/A'}%</li>
                <li>Total Patterns Detected: ${analysis.totalPatterns || 0}</li>
            </ul>
        </div>
    `;
    
    // Best Practices Found
    if (analysis.bestPractices && analysis.bestPractices.length > 0) {
        html += `
            <div class="report-section">
                <h3>✅ Best Performing Patterns</h3>
                <ul>
                    ${analysis.bestPractices.map(p => `<li>${p}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Website Breakdown
    if (analysis.websites && analysis.websites.length > 0) {
        analysis.websites.forEach((site, idx) => {
            html += `
                <div class="report-section">
                    <h3>🌐 Website ${idx + 1}: ${new URL(site.url).hostname}</h3>
                    <ul>
                        <li><strong>Conversion Score:</strong> ${site.conversionScore?.toFixed(1) || 'N/A'}%</li>
                        <li><strong>Design Quality:</strong> ${site.designScore?.toFixed(1) || 'N/A'}%</li>
                        ${site.strengths?.map(s => `<li>${s}</li>`).join('') || ''}\n                        ${site.weaknesses?.map(w => `<li class="weakness">${w}</li>`).join('') || ''}\n                    </ul>\n                </div>\n            `;\n        });\n    }\n    \n    // Recommendations\n    if (analysis.recommendations && analysis.recommendations.length > 0) {\n        html += `\n            <div class=\"report-section\">\n                <h3>💡 Recommended Improvements</h3>\n                <ul>\n                    ${analysis.recommendations.map(r => `<li>${r}</li>`).join('')}\n                </ul>\n            </div>\n        `;\n    }\n    \n    html += '</div>';\n    reportContainer.innerHTML = html;\n    \n    // Store analysis for optimization\n    chrome.storage.local.set({ currentAnalysis: analysis });\n}\n\n// Optimize button\noptimizeBtn.addEventListener('click', async () => {\n    optimizeBtn.disabled = true;\n    const originalText = optimizeBtn.textContent;\n    optimizeBtn.textContent = '🔄 Generating...';\n    \n    try {\n        const { currentAnalysis } = await chrome.storage.local.get('currentAnalysis');\n        \n        if (!currentAnalysis) {\n            showStatus('No analysis data found. Please run analysis first.', 'error');\n            return;\n        }\n        \n        const format = previewFormat.value || 'html';\n        \n        const response = await chrome.runtime.sendMessage({\n            action: 'generateOptimized',\n            analysis: currentAnalysis,\n            format: format\n        });\n        \n        if (response.success) {\n            displayPreview(response.output, format);\n            document.querySelector('[data-tab=\"preview\"]').click();\n            showStatus('Optimization complete!', 'success');\n        } else {\n            showStatus(`Generation failed: ${response.error}`, 'error');\n        }\n    } catch (error) {\n        showStatus(`Error: ${error.message}`, 'error');\n        console.error('Optimization error:', error);\n    } finally {\n        optimizeBtn.disabled = false;\n        optimizeBtn.textContent = originalText;\n    }\n});\n\nfunction displayPreview(output, format) {\n    const previewContainer = document.getElementById('preview-container');\n    const content = document.createElement('div');\n    content.className = 'preview-content';\n    \n    if (format === 'html') {\n        content.innerHTML = `\n            <div style=\"padding: 10px; background: #f3f4f6; border-radius: 4px; margin-bottom: 10px;\">\n                <strong>📄 HTML Preview</strong>\n                <p style=\"font-size: 11px; color: #6b7280; margin-top: 5px;\">Right-click to download or copy</p>\n            </div>\n            <pre style=\"background: #1f2937; color: #e5e7eb; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 10px;\">${escapeHtml(output.substring(0, 500))}...</pre>\n            <button class=\"btn btn-primary\" style=\"margin-top: 10px;\" onclick=\"downloadFile('optimized.html', '${escapeForJS(output)}', 'text/html')\">⬇️ Download HTML</button>\n        `;\n    } else if (format === 'shopify') {\n        content.innerHTML = `\n            <div style=\"padding: 10px; background: #f3f4f6; border-radius: 4px; margin-bottom: 10px;\">\n                <strong>🛒 Shopify Liquid Preview</strong>\n                <p style=\"font-size: 11px; color: #6b7280; margin-top: 5px;\">Shopify-ready template structure</p>\n            </div>\n            <pre style=\"background: #1f2937; color: #e5e7eb; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 10px;\">${escapeHtml(output.substring(0, 500))}...</pre>\n            <button class=\"btn btn-primary\" style=\"margin-top: 10px;\" onclick=\"downloadFile('template.liquid', '${escapeForJS(output)}', 'text/plain')\">⬇️ Download Liquid</button>\n        `;\n    }\n    \n    previewContainer.innerHTML = content.innerHTML;\n}\n\nfunction escapeHtml(text) {\n    const map = {\n        '&': '&amp;',\n        '<': '&lt;',\n        '>': '&gt;',\n        '\"': '&quot;',\n        \"'\": '&#039;'\n    };\n    return text.replace(/[&<>\"']/g, m => map[m]);\n}\n\nfunction escapeForJS(text) {\n    return text.replace(/\\\\/g, '\\\\\\\\').replace(/'/g, \"\\\\'\")\n        .replace(/\\n/g, '\\\\n')\n        .replace(/\\r/g, '\\\\r');\n}\n\n// Make download function global\nwindow.downloadFile = function(filename, content, mimeType) {\n    const blob = new Blob([content], { type: mimeType });\n    const url = URL.createObjectURL(blob);\n    const a = document.createElement('a');\n    a.href = url;\n    a.download = filename;\n    document.body.appendChild(a);\n    a.click();\n    document.body.removeChild(a);\n    URL.revokeObjectURL(url);\n};
