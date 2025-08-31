#!/bin/bash

echo "🔍 Verifying deployment structure..."

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ dist/ directory not found. Run ./build-for-deployment.sh first."
    exit 1
fi

# Check for required files
if [ -f "dist/index.html" ]; then
    echo "✅ index.html found in dist/"
else
    echo "❌ index.html not found in dist/"
    exit 1
fi

if [ -d "dist/assets" ]; then
    echo "✅ assets/ directory found in dist/"
else
    echo "❌ assets/ directory not found in dist/"
    exit 1
fi

# Check that we don't have the nested structure
if [ -d "dist/public" ]; then
    echo "⚠️  Warning: dist/public/ still exists. This should be removed for static deployment."
    echo "   Run ./build-for-deployment.sh to fix the structure."
    exit 1
else
    echo "✅ No nested dist/public/ directory (correct for static deployment)"
fi

# Count assets
ASSET_COUNT=$(find dist/assets -type f 2>/dev/null | wc -l)
echo "📁 Found $ASSET_COUNT asset files in dist/assets/"

# Display file sizes
echo ""
echo "📊 File sizes:"
du -h dist/index.html 2>/dev/null
du -h dist/assets/* 2>/dev/null | head -5

echo ""
echo "🎉 Deployment structure is valid for static deployment!"
echo "   Files are correctly placed in dist/ directory as expected by .replit configuration."