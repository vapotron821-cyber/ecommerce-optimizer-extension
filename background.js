// E-Commerce Optimizer - Service Worker
// Handles analysis coordination and template generation

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeUrls') {
        analyzeUrls(request.urls, request.options)
            .then(result => sendResponse({ success: true, analysis: result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    } else if (request.action === 'generateOptimized') {
        generateOptimizedSite(request.analysis, request.format)
            .then(result => sendResponse({ success: true, output: result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

async function analyzeUrls(urls, options) {
    const analysisResults = {
        urlsAnalyzed: urls.length,
        websites: [],
        overallScore: 0,
        bestPractices: [],
        recommendations: [],
        totalPatterns: 0
    };
    
    const websiteAnalyses = [];
    
    for (const url of urls) {
        try {
            console.log(`Analyzing: ${url}`);
            const siteAnalysis = await analyzeSingleWebsite(url, options);
            websiteAnalyses.push(siteAnalysis);
            analysisResults.websites.push(siteAnalysis);
        } catch (error) {
            console.error(`Failed to analyze ${url}:`, error);
            analysisResults.websites.push({
                url,
                error: error.message,
                conversionScore: 0
            });
        }
    }
    
    // Calculate overall metrics
    if (websiteAnalyses.length > 0) {
        const scores = websiteAnalyses
            .filter(w => w.conversionScore)
            .map(w => w.conversionScore);
        analysisResults.overallScore = scores.length > 0 
            ? scores.reduce((a, b) => a + b) / scores.length 
            : 0;
    }
    
    // Extract best practices
    analysisResults.bestPractices = extractBestPractices(websiteAnalyses);
    analysisResults.totalPatterns = websiteAnalyses.reduce(
        (sum, w) => sum + (w.patternsDetected || 0),
        0
    );
    
    // Generate recommendations
    analysisResults.recommendations = generateRecommendations(websiteAnalyses);
    
    return analysisResults;
}

async function analyzeSingleWebsite(url, options) {
    try {
        const response = await fetch(url, { method: 'GET' });
        const html = await response.text();
        
        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const analysis = {
            url,
            domain: new URL(url).hostname,
            conversionScore: 0,
            designScore: 0,
            strengths: [],
            weaknesses: [],
            patternsDetected: 0,
            structure: {}
        };
        
        let patternCount = 0;
        let conversionPoints = 0;
        let maxPoints = 0;
        
        // Analyze Homepage Structure
        if (options.homepage) {
            const homeAnalysis = analyzeHomepageStructure(doc);
            Object.assign(analysis.structure, { homepage: homeAnalysis.structure });
            analysis.strengths.push(...homeAnalysis.strengths);
            analysis.weaknesses.push(...homeAnalysis.weaknesses);
            conversionPoints += homeAnalysis.score;
            maxPoints += 100;
            patternCount += homeAnalysis.patterns;
        }
        
        // Analyze Conversion Elements
        if (options.conversion) {
            const convAnalysis = analyzeConversionElements(doc);
            Object.assign(analysis.structure, { conversion: convAnalysis.structure });
            analysis.strengths.push(...convAnalysis.strengths);
            analysis.weaknesses.push(...convAnalysis.weaknesses);
            conversionPoints += convAnalysis.score;
            maxPoints += 100;
            patternCount += convAnalysis.patterns;
        }
        
        // Analyze Product Pages
        if (options.product) {
            const prodAnalysis = analyzeProductStructure(doc);
            Object.assign(analysis.structure, { product: prodAnalysis.structure });
            analysis.strengths.push(...prodAnalysis.strengths);
            analysis.weaknesses.push(...prodAnalysis.weaknesses);
            conversionPoints += prodAnalysis.score;
            maxPoints += 100;
            patternCount += prodAnalysis.patterns;
        }
        
        // Analyze Design Patterns
        if (options.design) {
            const designAnalysis = analyzeDesignPatterns(doc);
            Object.assign(analysis.structure, { design: designAnalysis.structure });
            analysis.strengths.push(...designAnalysis.strengths);
            analysis.weaknesses.push(...designAnalysis.weaknesses);
            conversionPoints += designAnalysis.score;
            maxPoints += 100;
            patternCount += designAnalysis.patterns;
        }
        
        // Analyze Navigation
        if (options.navigation) {
            const navAnalysis = analyzeNavigation(doc);
            Object.assign(analysis.structure, { navigation: navAnalysis.structure });
            analysis.strengths.push(...navAnalysis.strengths);
            analysis.weaknesses.push(...navAnalysis.weaknesses);
            conversionPoints += navAnalysis.score;
            maxPoints += 100;
            patternCount += navAnalysis.patterns;
        }
        
        analysis.conversionScore = maxPoints > 0 ? (conversionPoints / maxPoints) * 100 : 0;
        analysis.designScore = analysis.conversionScore * 0.8;
        analysis.patternsDetected = patternCount;
        
        return analysis;
    } catch (error) {
        console.error(`Error analyzing ${url}:`, error);
        throw error;
    }
}

function analyzeHomepageStructure(doc) {
    const result = {
        structure: {},
        strengths: [],
        weaknesses: [],
        score: 0,
        patterns: 0
    };
    
    // Check for hero section
    const heroSelectors = ['[class*="hero"]', 'header main', '.banner', '[class*="banner"]', '.jumbotron'];
    const hasHero = heroSelectors.some(sel => doc.querySelector(sel));
    if (hasHero) {
        result.strengths.push('✓ Strong hero section with prominent call-to-action');
        result.score += 20;
        result.patterns++;
    } else {
        result.weaknesses.push('⚠ No prominent hero section detected');
    }
    
    // Check for product grid
    const gridSelectors = ['[class*="grid"]', '[class*="products"]', '.product-list', '[class*="collection"]'];
    const hasGrid = gridSelectors.some(sel => doc.querySelectorAll(sel).length > 0);
    if (hasGrid) {
        result.strengths.push('✓ Well-organized product grid layout');
        result.score += 20;
        result.patterns++;
    } else {
        result.weaknesses.push('⚠ Product display could be more organized');
    }
    
    // Check for navigation bar
    const navElements = doc.querySelectorAll('nav, header');
    if (navElements.length > 0) {
        result.strengths.push('✓ Clear navigation structure');
        result.score += 15;
        result.patterns++;
    }
    
    // Check for footer
    const footer = doc.querySelector('footer');
    if (footer) {
        result.strengths.push('✓ Comprehensive footer with links and info');
        result.score += 15;
        result.patterns++;
    }
    
    result.structure.hasHero = hasHero;
    result.structure.hasProductGrid = hasGrid;
    result.structure.hasNavigation = navElements.length > 0;
    result.structure.hasFooter = !!footer;
    
    return result;
}

function analyzeConversionElements(doc) {
    const result = {
        structure: {},
        strengths: [],
        weaknesses: [],
        score: 0,
        patterns: 0
    };
    
    // Check for CTA buttons
    const ctaSelectors = ['[class*="cta"]', '[class*="btn-primary"]', '.add-to-cart', '[class*="action"]'];
    const ctaCount = ctaSelectors.reduce((count, sel) => count + doc.querySelectorAll(sel).length, 0);
    if (ctaCount > 0) {
        result.strengths.push(`✓ ${ctaCount} conversion-focused CTAs detected`);
        result.score += 20;
        result.patterns++;
    } else {
        result.weaknesses.push('⚠ Limited clear call-to-action buttons');
    }
    
    // Check for urgency triggers
    const urgencyText = doc.body.textContent.toLowerCase();
    const urgencyKeywords = ['limited', 'offer', 'sale', 'discount', 'hurry', 'ends', 'exclusive'];
    const urgencyCount = urgencyKeywords.filter(k => urgencyText.includes(k)).length;
    if (urgencyCount > 0) {
        result.strengths.push('✓ Urgency triggers present');
        result.score += 15;
        result.patterns++;
    } else {
        result.weaknesses.push('⚠ Consider adding urgency elements');
    }
    
    // Check for trust badges
    const trustSelectors = ['[class*="trust"]', '[class*="badge"]', '[class*="certified"]', '[class*="secure"]'];
    const trustCount = trustSelectors.reduce((count, sel) => count + doc.querySelectorAll(sel).length, 0);
    if (trustCount > 0) {
        result.strengths.push('✓ Trust badges and security indicators present');
        result.score += 20;
        result.patterns++;
    } else {
        result.weaknesses.push('⚠ Add trust badges for credibility');
    }
    
    // Check for reviews/ratings
    const reviewSelectors = ['[class*="review"]', '[class*="rating"]', '.stars', '[class*="testimonial"]'];
    const reviewCount = reviewSelectors.reduce((count, sel) => count + doc.querySelectorAll(sel).length, 0);
    if (reviewCount > 0) {
        result.strengths.push('✓ Customer reviews/ratings displayed');
        result.score += 20;
        result.patterns++;
    } else {
        result.weaknesses.push('⚠ Add customer reviews for social proof');
    }
    
    result.structure.ctaCount = ctaCount;
    result.structure.hasUrgency = urgencyCount > 0;
    result.structure.trustBadgeCount = trustCount;
    result.structure.reviewCount = reviewCount;
    
    return result;
}

function analyzeProductStructure(doc) {
    const result = {
        structure: {},
        strengths: [],
        weaknesses: [],
        score: 0,
        patterns: 0
    };
    
    // Check for product images
    const images = doc.querySelectorAll('img');
    if (images.length > 5) {
        result.strengths.push(`✓ Good visual presentation with ${images.length} product images`);
        result.score += 20;
        result.patterns++;
    } else {
        result.weaknesses.push('⚠ Add more product images for better engagement');
    }
    
    // Check for pricing display
    const priceSelectors = ['[class*="price"]', '[class*="cost"]', '$', '€', '£'];
    const hasPrice = priceSelectors.some(sel => {
        if (sel.startsWith('[')) return !!doc.querySelector(sel);
        return doc.body.textContent.includes(sel);
    });
    if (hasPrice) {
        result.strengths.push('✓ Clear pricing information');
        result.score += 20;
        result.patterns++;
    }
    
    // Check for product description
    const descSelectors = ['[class*="description"]', '[class*="details"]'];
    const hasDesc = descSelectors.some(sel => doc.querySelector(sel));
    if (hasDesc) {
        result.strengths.push('✓ Detailed product descriptions');
        result.score += 20;
        result.patterns++;
    }
    
    // Check for add to cart functionality
    const addToCartSelectors = ['.add-to-cart', '[class*="cart"]', '[class*="buy"]'];
    const hasAddToCart = addToCartSelectors.some(sel => doc.querySelector(sel));
    if (hasAddToCart) {
        result.strengths.push('✓ Prominent add-to-cart functionality');
        result.score += 20;
        result.patterns++;
    }
    
    result.structure.imageCount = images.length;
    result.structure.hasPrice = hasPrice;
    result.structure.hasDescription = hasDesc;
    result.structure.hasAddToCart = hasAddToCart;
    
    return result;
}

function analyzeDesignPatterns(doc) {
    const result = {
        structure: {},
        strengths: [],
        weaknesses: [],
        score: 0,
        patterns: 0
    };
    
    // Check for color consistency
    const styles = doc.querySelectorAll('[style]');
    if (styles.length > 5) {
        result.strengths.push('✓ Consistent design styling applied');
        result.score += 15;
        result.patterns++;
    }
    
    // Check for mobile responsiveness
    const viewport = doc.querySelector('meta[name="viewport"]');
    if (viewport) {
        result.strengths.push('✓ Mobile-responsive design');
        result.score += 25;
        result.patterns++;
    } else {
        result.weaknesses.push('⚠ Mobile responsiveness not detected');
    }
    
    // Check for whitespace and spacing
    const cssLinks = doc.querySelectorAll('link[rel="stylesheet"]');
    if (cssLinks.length > 0) {
        result.strengths.push('✓ External stylesheets for organized design');
        result.score += 15;
        result.patterns++;
    }
    
    // Check for typography
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length > 3) {
        result.strengths.push('✓ Clear typographic hierarchy');
        result.score += 20;
        result.patterns++;
    } else {
        result.weaknesses.push('⚠ Improve typographic hierarchy');
    }
    
    result.structure.hasMobileResponsive = !!viewport;
    result.structure.stylesheetCount = cssLinks.length;
    result.structure.headingCount = headings.length;
    
    return result;
}

function analyzeNavigation(doc) {
    const result = {
        structure: {},
        strengths: [],
        weaknesses: [],
        score: 0,
        patterns: 0
    };
    
    // Check for navigation menu
    const navMenus = doc.querySelectorAll('nav, [role="navigation"]');
    if (navMenus.length > 0) {
        result.strengths.push('✓ Dedicated navigation menu');
        result.score += 20;
        result.patterns++;
    }
    
    // Check for links
    const links = doc.querySelectorAll('a');
    if (links.length > 10) {
        result.strengths.push(`✓ Good internal linking (${links.length} links)`);
        result.score += 15;
        result.patterns++;
    }
    
    // Check for search functionality
    const searchSelectors = ['[class*="search"]', 'input[type="search"]', '[role="search"]'];
    const hasSearch = searchSelectors.some(sel => doc.querySelector(sel));
    if (hasSearch) {
        result.strengths.push('✓ Search functionality available');
        result.score += 20;
        result.patterns++;
    } else {
        result.weaknesses.push('⚠ Add search functionality for better UX');
    }
    
    // Check for breadcrumbs
    const breadcrumbs = doc.querySelector('[class*="breadcrumb"]');
    if (breadcrumbs) {
        result.strengths.push('✓ Breadcrumb navigation for clarity');
        result.score += 20;
        result.patterns++;
    }
    
    result.structure.navMenuCount = navMenus.length;
    result.structure.linkCount = links.length;
    result.structure.hasSearch = hasSearch;
    result.structure.hasBreadcrumbs = !!breadcrumbs;
    
    return result;
}

function extractBestPractices(analyses) {
    const practices = [];
    const practiceMap = {};
    
    analyses.forEach(analysis => {
        if (analysis.strengths) {
            analysis.strengths.forEach(strength => {
                practiceMap[strength] = (practiceMap[strength] || 0) + 1;
            });
        }
    });
    
    // Get practices that appear multiple times
    Object.entries(practiceMap)
        .filter(([_, count]) => count >= Math.ceil(analyses.length / 2))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([practice]) => practices.push(practice));
    
    return practices.length > 0 ? practices : ['Professional design', 'Clear call-to-action', 'Mobile-optimized layout'];
}

function generateRecommendations(analyses) {
    const recommendations = [];
    const weaknessMap = {};
    
    analyses.forEach(analysis => {
        if (analysis.weaknesses) {
            analysis.weaknesses.forEach(weakness => {
                weaknessMap[weakness] = (weaknessMap[weakness] || 0) + 1;
            });
        }
    });
    
    // Get recommendations based on common weaknesses
    Object.entries(weaknessMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([weakness]) => recommendations.push(weakness));
    
    // Add general recommendations
    if (recommendations.length < 3) {
        recommendations.push(
            '💡 Implement A/B testing on CTAs',
            '💡 Add live chat support for customers',
            '💡 Optimize checkout process',
            '💡 Implement email marketing integration'
        );
    }
    
    return recommendations.slice(0, 5);
}

async function generateOptimizedSite(analysis, format) {
    if (format === 'html') {
        return generateOptimizedHTML(analysis);
    } else if (format === 'shopify') {
        return generateShopifyTemplate(analysis);
    }
    throw new Error('Unknown format');
}

function generateOptimizedHTML(analysis) {
    const bestPractices = analysis.bestPractices || [];
    const recommendations = analysis.recommendations || [];
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Optimized E-Commerce Store - Generated by E-Commerce Optimizer</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        /* Header & Navigation */
        header { background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
        nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; }
        nav .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        nav ul { list-style: none; display: flex; gap: 2rem; }
        nav a { text-decoration: none; color: #333; transition: color 0.3s; }
        nav a:hover { color: #2563eb; }
        nav .search { padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; }
        nav .cart { cursor: pointer; font-size: 20px; }
        
        /* Hero Section */
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 80px 20px;
            text-align: center;
            margin-bottom: 60px;
        }
        .hero h1 { font-size: 48px; margin-bottom: 20px; }
        .hero p { font-size: 20px; margin-bottom: 30px; opacity: 0.9; }
        .hero .cta { background: white; color: #667eea; padding: 15px 40px; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.3s; }
        .hero .cta:hover { transform: scale(1.05); }
        
        /* Trust Badges */
        .trust-badges {
            display: flex;
            justify-content: center;
            gap: 40px;
            padding: 30px 0;
            background: #f9fafb;
            margin: 40px 0;
            flex-wrap: wrap;
        }
        .badge { text-align: center; }
        .badge-icon { font-size: 32px; margin-bottom: 10px; }
        .badge-text { font-size: 14px; color: #666; }
        
        /* Product Grid */
        .products-section { padding: 60px 0; }
        .section-title { font-size: 36px; margin-bottom: 40px; text-align: center; }
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px;
            margin-bottom: 60px;
        }
        .product-card {
            border: 1px solid #eee;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .product-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .product-image { width: 100%; height: 250px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 48px; }
        .product-info { padding: 20px; }
        .product-name { font-size: 16px; font-weight: bold; margin-bottom: 8px; }
        .product-price { color: #2563eb; font-size: 20px; font-weight: bold; margin-bottom: 15px; }
        .product-rating { color: #f59e0b; margin-bottom: 15px; }
        .add-to-cart { width: 100%; padding: 12px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; transition: background 0.3s; }
        .add-to-cart:hover { background: #1d4ed8; }
        
        /* Reviews Section */
        .reviews-section { background: #f9fafb; padding: 60px 0; margin: 60px 0; }
        .review { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .review-author { font-weight: bold; margin-bottom: 5px; }
        .review-rating { color: #f59e0b; margin-bottom: 10px; }
        .review-text { color: #666; font-size: 14px; }
        
        /* Footer */
        footer {
            background: #1f2937;
            color: white;
            padding: 40px 0;
            margin-top: 60px;
        }
        footer .footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px; }
        footer h3 { margin-bottom: 15px; }
        footer a { color: #ccc; text-decoration: none; display: block; margin-bottom: 8px; transition: color 0.3s; }
        footer a:hover { color: white; }
        footer .footer-bottom { text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #444; }
        
        /* Responsive */
        @media (max-width: 768px) {
            nav ul { gap: 1rem; }
            .hero h1 { font-size: 32px; }
            .products-grid { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
            .trust-badges { gap: 20px; }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header>
        <nav class="container">
            <div class="logo">🛍️ OptimalStore</div>
            <ul>
                <li><a href="#\">Home</a></li>
                <li><a href="#\">Products</a></li>
                <li><a href="#\">About</a></li>
                <li><a href="#\">Contact</a></li>
            </ul>
            <div style="display: flex; gap: 15px;">
                <input type="text" class="search" placeholder="Search products...">
                <div class="cart">🛒 (0)</div>
            </div>
        </nav>
    </header>
    
    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <h1>Discover Premium Products</h1>
            <p>Handpicked selection for the modern lifestyle</p>
            <button class="cta">Shop Now</button>
        </div>
    </section>
    
    <!-- Trust Badges -->
    <section class="container">
        <div class="trust-badges">
            <div class="badge">
                <div class="badge-icon">🚚</div>
                <div class="badge-text">Free Shipping Over $50</div>
            </div>
            <div class="badge">
                <div class="badge-icon">🔒</div>
                <div class="badge-text">Secure Checkout</div>
            </div>
            <div class="badge">
                <div class="badge-icon">↩️</div>
                <div class="badge-text">30-Day Returns</div>
            </div>
            <div class="badge">
                <div class="badge-icon">💬</div>
                <div class="badge-text">24/7 Support</div>
            </div>
        </div>
    </section>
    
    <!-- Products Section -->
    <section class="products-section">
        <div class="container">
            <h2 class="section-title">Featured Products</h2>
            <div class="products-grid">
                ${Array(6).fill(0).map((_, i) => \`
                <div class="product-card">
                    <div class="product-image">📦</div>
                    <div class="product-info">
                        <div class="product-name">Product \${i + 1}</div>
                        <div class="product-rating">⭐⭐⭐⭐⭐ (128 reviews)</div>
                        <div class="product-price">$\${(29.99 + i * 10).toFixed(2)}</div>
                        <button class="add-to-cart">Add to Cart</button>
                    </div>
                </div>
                \`).join('')}
            </div>
        </div>
    </section>
    
    <!-- Reviews Section -->
    <section class="reviews-section">
        <div class="container">
            <h2 class="section-title">Customer Reviews</h2>
            <div style="max-width: 600px; margin: 0 auto;">
                <div class="review">
                    <div class="review-author">Sarah M.</div>
                    <div class="review-rating">⭐⭐⭐⭐⭐</div>
                    <div class="review-text">"Excellent quality and fast shipping. Will definitely order again!"</div>
                </div>
                <div class="review">
                    <div class="review-author">John D.</div>
                    <div class="review-rating">⭐⭐⭐⭐⭐</div>
                    <div class="review-text">"Great customer service and amazing products. Highly recommended!"</div>
                </div>
                <div class="review">
                    <div class="review-author">Emma L.</div>
                    <div class="review-rating">⭐⭐⭐⭐⭐</div>
                    <div class="review-text">"Best purchase I've made. Quality exceeded my expectations."</div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-content">
                <div>
                    <h3>About Us</h3>
                    <a href="#\">Our Story</a>
                    <a href="#\">Careers</a>
                    <a href="#\">Press</a>
                </div>
                <div>
                    <h3>Support</h3>
                    <a href="#\">Contact Us</a>
                    <a href="#\">FAQ</a>
                    <a href="#\">Shipping Info</a>
                </div>
                <div>
                    <h3>Legal</h3>
                    <a href="#\">Privacy Policy</a>
                    <a href="#\">Terms of Service</a>
                    <a href="#\">Cookie Policy</a>
                </div>
                <div>
                    <h3>Follow Us</h3>
                    <a href="#\">Facebook</a>
                    <a href="#\">Instagram</a>
                    <a href="#\">Twitter</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 OptimalStore. All rights reserved. | Generated by E-Commerce Optimizer</p>
            </div>
        </div>
    </footer>
</body>
</html>\`;
}

function generateShopifyTemplate(analysis) {
    return \`{%- comment -%}
  E-Commerce Optimizer - Shopify Liquid Template
  Generated: \${new Date().toISOString()}
{%- endcomment -%}

{% section 'header' %}
  <header class="header">
    <nav>
      <div class="logo">{{ shop.name }}</div>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/collections">Products</a></li>
        <li><a href="/pages/about">About</a></li>
        <li><a href="/pages/contact">Contact</a></li>
      </ul>
      <div class="header-right">
        <input type="text" placeholder="Search products..." class="search-input">
        <a href="/cart">Cart ({{ cart.item_count }})</a>
      </div>
    </nav>
  </header>
{% endsection %}

{% section 'hero' %}
  <section class="hero">
    <div class="hero-content">
      <h1>{{ section.settings.title }}</h1>
      <p>{{ section.settings.subtitle }}</p>
      <a href="{{ section.settings.button_link }}" class="cta-button">{{ section.settings.button_text }}</a>
    </div>
  </section>
  
  {% schema %}
  {
    "name": "Hero Section",
    "settings": [
      {
        "type": "text",
        "id": "title",
        "label": "Title",
        "default": "Discover Premium Products"
      },
      {
        "type": "text",
        "id": "subtitle",
        "label": "Subtitle",
        "default": "Handpicked selection for the modern lifestyle"
      },
      {
        "type": "url",
        "id": "button_link",
        "label": "Button Link"
      },
      {
        "type": "text",
        "id": "button_text",
        "label": "Button Text",
        "default": "Shop Now"
      }
    ]
  }
  {% endschema %}
{% endsection %}

{% section 'featured-products' %}
  <section class="featured-products">
    <h2>{{ section.settings.title }}</h2>
    <div class="products-grid">
      {% for product in collections.featured.products limit: 6 %}
        <div class="product-card">
          <img src="{{ product.featured_image }}" alt="{{ product.title }}">
          <h3>{{ product.title }}</h3>
          <p class="price">{{ product.price | money }}</p>
          <a href="{{ product.url }}" class="btn">View Product</a>
        </div>
      {% endfor %}
    </div>
  </section>
  
  {% schema %}
  {
    "name": "Featured Products",
    "settings": [
      {
        "type": "text",
        "id": "title",
        "label": "Section Title",
        "default": "Featured Products"
      }
    ]
  }
  {% endschema %}
{% endsection %}\`;
}
