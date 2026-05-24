# Setup & Configuration Guide

## ✅ Pre-Installation Checklist

- [ ] Microsoft Edge installed (latest version)
- [ ] Administrator access to your computer
- [ ] Extension files downloaded or cloned
- [ ] Folder structure intact

---

## 🚀 Installation Steps

### Step 1: Prepare the Extension Folder

```
ecommerce-optimizer-extension/
├── manifest.json
├── popup.html
├── popup.js
├── popup.css
├── background.js
├── content-script.js
├── styles/
│   └── popup.css
├── README.md
├── GUIDE.md
├── ENHANCEMENTS.md
└── .gitignore
```

### Step 2: Open Edge Extensions Page

1. Open **Microsoft Edge**
2. Click the **menu icon** (three dots) in top-right
3. Go to **Extensions** → **Manage Extensions**
4. Or paste in address bar: `edge://extensions/`

### Step 3: Enable Developer Mode

1. Look for **Developer mode** toggle at bottom-left
2. Click to **enable** (toggle should turn blue)
3. Page will refresh with new options

### Step 4: Load Unpacked Extension

1. Click **Load unpacked** button (top-left)
2. Navigate to your `ecommerce-optimizer-extension` folder
3. Click **Select Folder**
4. Extension should now appear in your list ✅

### Step 5: Verify Installation

Look for:
- ✅ Extension card with "E-Commerce Optimizer"
- ✅ Status shows "Enabled"
- ✅ Extension icon appears in toolbar
- ✅ No error messages

---

## 🔧 Configuration Options

### Option 1: Extension Icon Visibility

**To pin extension to toolbar:**
1. Click the **Extensions icon** (puzzle piece) in toolbar
2. Find "E-Commerce Optimizer"
3. Click the **pin icon** next to it
4. Extension icon now always visible

**To unpin:**
1. Click Extensions icon
2. Click the pin again to remove

### Option 2: Change Popup Size

**File:** `popup.html`

```html
<body style="width: 600px; max-height: 700px;">
```

Change dimensions:
- **Width:** 600px (minimum 400px recommended)
- **Height:** 700px (adjustable as needed)

### Option 3: Modify Default Colors

**File:** `styles/popup.css`

```css
:root {
  --primary-color: #2563eb;      /* Change this */
  --success-color: #10b981;      /* Change this */
}
```

Popular color combinations:
- **Professional Blue:** #2563eb
- **Corporate Green:** #059669
- **Modern Purple:** #7c3aed
- **Vibrant Orange:** #f97316

---

## 🎯 First Run Setup

### Initial Configuration

1. **Open the Extension**
   - Click extension icon in toolbar
   - Popup window opens (600x700px)

2. **Review Tabs**
   - **Analyzer:** Input URLs here
   - **Report:** View analysis results
   - **Preview:** Download generated templates

3. **Test with Sample URL**
   - Enter: `https://www.shopify.com`
   - Click "Analyze URLs"
   - Wait for analysis (5-10 seconds)

4. **Review Results**
   - Check "Report" tab
   - See conversion score and recommendations

5. **Generate Template**
   - Click "Optimize & Generate"
   - Choose HTML or Shopify format
   - Download file

---

## ⚙️ Troubleshooting

### Issue: Extension Won't Load

**Error:** "Couldn't load manifest"

**Solutions:**
1. Check manifest.json syntax (use JSON validator)
2. Ensure all required files exist
3. Verify folder structure is correct
4. Remove and reload extension

**Debug Steps:**
```
1. Go to edge://extensions/
2. Find E-Commerce Optimizer
3. Look for error message
4. Copy error and search online
5. Fix file and reload
```

### Issue: Popup Won't Open

**Error:** Clicking icon does nothing

**Solutions:**
1. Check popup.html syntax
2. Verify popup.js loads correctly
3. Open DevTools: `F12` → **Console**
4. Look for error messages

**To inspect:**
```
1. Right-click extension icon
2. Select "Inspect popup"
3. Check for JavaScript errors
4. Fix and reload (Ctrl+R)
```

### Issue: Analysis Fails

**Error:** "Analysis failed" message in popup

**Solutions:**
1. Check URL is valid and publicly accessible
2. Ensure website is not behind login
3. Try different website
4. Check browser console for errors

**Valid test URLs:**
- https://www.amazon.com
- https://www.ebay.com
- https://www.etsy.com
- https://www.shopify.com

### Issue: Downloaded Files Won't Open

**Error:** HTML file shows as blank/errors

**Solutions:**
1. Open in modern browser (Edge, Chrome, Firefox)
2. Check file downloaded completely
3. Right-click → Open with → Browser
4. Allow JavaScript to run

---

## 🔐 Permissions Explained

**Current manifest.json requests:**

```json
"permissions": ["storage", "activeTab"],
"host_permissions": ["https://*/*", "http://*/*"]
```

| Permission | Why Needed |
|------------|-----------|
| `storage` | Save analysis results locally |
| `activeTab` | Show extension icon when active |
| `https://*/*` | Analyze HTTPS websites |
| `http://*/*` | Analyze HTTP websites |

**What the extension does NOT:**
- ❌ Not install anything on your computer
- ❌ Not send data to external servers
- ❌ Not track your browsing
- ❌ Not modify website content
- ❌ Not require account/login

---

## 📊 Storage Usage

### Browser Storage

Extension uses **Chrome Storage API**:

```javascript
chrome.storage.local.set({ 
    currentAnalysis: analysisData 
});
```

**Storage Limits:**
- Up to 10MB per extension
- Cleared when extension uninstalled
- Manually clearable anytime

**To clear storage:**
1. Go to edge://extensions/
2. Find E-Commerce Optimizer
3. Click "Details"
4. Scroll down
5. Click "Clear data" button

---

## 🖥️ System Requirements

**Minimum:**
- Windows 10/11, macOS 10.15+, or Linux
- Microsoft Edge 90+
- 50MB free disk space
- Modern web browser for viewing output

**Recommended:**
- Windows 10/11 (latest)
- Microsoft Edge 120+
- 100MB free disk space
- 8GB RAM or more
- Stable internet connection

**Browser Compatibility:**
- ✅ Microsoft Edge (Chromium)
- ✅ Google Chrome (same engine)
- ❌ Firefox (different engine)
- ❌ Safari (different engine)

---

## 🔄 Updating the Extension

### Method 1: Manual Update

1. Delete current extension from `edge://extensions/`
2. Download latest version from GitHub
3. Load unpacked again

### Method 2: Using Git

```bash
cd ecommerce-optimizer-extension
git pull origin main
# Reload extension in Edge
```

### Check for Updates

```
GitHub Releases:
https://github.com/vapotron821-cyber/ecommerce-optimizer-extension/releases
```

---

## 🗑️ Uninstalling

### Remove Extension

1. Go to `edge://extensions/`
2. Find "E-Commerce Optimizer"
3. Click the **Remove** button
4. Click **Remove** to confirm

### Clear All Data

All data is automatically deleted when extension is removed.

To manually clear before removing:
1. Click extension details
2. Scroll down
3. Click "Clear data"
4. Then remove extension

---

## 📱 Mobile & Tablet Use

**Important:** This extension only works on **Desktop Edge**

- ❌ Edge for Android/iOS doesn't support extensions
- ❌ Mobile browsers cannot load unpacked extensions
- ✅ Use on desktop for full functionality

---

## 🚀 Advanced Configuration

### Environment Variables (Optional)

Create `.env` file (optional):
```
ANALYSIS_TIMEOUT=10000
MAX_URLS=5
DEBUG_MODE=false
```

Note: Currently not used but can be added for future versions.

### Custom Configuration File

Create `config.json` (optional):
```json
{
  "theme": "light",
  "defaultFormat": "html",
  "autoAnalyze": false,
  "urlLimit": 5
}
```

### Debug Mode

To enable logging:

**File:** `background.js`

Uncomment this line:
```javascript
console.log('Analysis complete:', analysis);
```

Then check logs:
1. Right-click extension
2. Select "Inspect background page"
3. Go to **Console** tab
4. Reload extension

---

## ✨ Best Practices

### Do:
- ✅ Use valid, accessible URLs
- ✅ Analyze 1-3 sites for best results
- ✅ Download files to local folder
- ✅ Test generated templates in browser
- ✅ Customize templates for your brand
- ✅ Keep extension updated
- ✅ Clear cache periodically

### Don't:
- ❌ Analyze same URL repeatedly
- ❌ Use blocked/private websites
- ❌ Edit manifest.json if unsure
- ❌ Share generated files without customization
- ❌ Analyze on slow connections
- ❌ Leave popup open for extended time
- ❌ Remove essential files

---

## 📞 Getting Help

### Documentation
- **README.md** - Overview & features
- **GUIDE.md** - How to use extension
- **ENHANCEMENTS.md** - Customization guide
- **SETUP.md** - This file

### Community Support
- GitHub Issues: Report bugs
- GitHub Discussions: Ask questions
- Check closed issues for solutions

### Before Reporting Issues
1. Try clearing extension cache
2. Reload extension (Ctrl+R in popup)
3. Test with different URLs
4. Check internet connection
5. Try in different browser

---

## 🎓 Learning Path

**Beginner:**
1. Install extension
2. Read GUIDE.md
3. Analyze sample websites
4. Download & view templates

**Intermediate:**
1. Customize colors in popup.css
2. Modify generated HTML
3. Test with your own websites
4. Share generated templates

**Advanced:**
1. Read ENHANCEMENTS.md
2. Add custom analysis modules
3. Create new report sections
4. Package for distribution

---

**Setup Complete! Ready to optimize e-commerce sites! 🚀**
