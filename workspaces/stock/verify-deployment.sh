#!/bin/bash

echo "🔍 Verifying EasyPanel Deployment Files..."
echo "=========================================="

echo "1. Checking required files..."
files=("Dockerfile" "package.json" "server.js" "public/index.html" ".dockerignore")
all_good=true

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING"
        all_good=false
    fi
done

echo ""
echo "2. Testing Docker build..."
docker build -t stock-test . > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Docker build successful"
else
    echo "❌ Docker build failed"
    all_good=false
fi

echo ""
echo "3. Checking package.json..."
if node -e "const pkg = require('./package.json'); console.log('   Name:', pkg.name); console.log('   Version:', pkg.version);" > /dev/null 2>&1; then
    echo "✅ package.json is valid"
else
    echo "❌ package.json has errors"
    all_good=false
fi

echo ""
echo "=========================================="

if [ "$all_good" = true ]; then
    echo "🎉 ALL CHECKS PASSED!"
    echo ""
    echo "Ready to deploy on EasyPanel:"
    echo "1. Push to GitHub: git add . && git commit -m 'EasyPanel deployment' && git push"
    echo "2. In EasyPanel: Create project from GitHub"
    echo "3. Set port to 3000"
    echo "4. Deploy!"
else
    echo "⚠️  Some checks failed. Please fix before deploying."
fi

echo "=========================================="