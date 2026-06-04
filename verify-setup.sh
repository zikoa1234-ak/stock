#!/bin/bash

echo "🔍 Verifying EasyPanel Deployment Setup..."
echo "=========================================="

# Check required files
echo "1. Checking required files..."
required_files=("Dockerfile" "start.sh" "docker-compose.prod.yml" "DEPLOYMENT.md")
missing_files=()

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        missing_files+=("$file")
    fi
done

echo ""
echo "2. Checking directory structure..."
echo "   Backend directory: $(if [ -d "backend" ]; then echo "✅ exists"; else echo "❌ missing"; fi)"
echo "   Frontend directory: $(if [ -d "frontend" ]; then echo "✅ exists"; else echo "❌ missing"; fi)"

echo ""
echo "3. Checking Dockerfile content..."
if [ -f "Dockerfile" ]; then
    echo "   ✅ Dockerfile found"
    echo "   First 5 lines:"
    head -5 Dockerfile
else
    echo "   ❌ Dockerfile not found"
fi

echo ""
echo "4. Checking start.sh permissions..."
if [ -f "start.sh" ]; then
    chmod +x start.sh
    echo "   ✅ start.sh made executable"
else
    echo "   ❌ start.sh not found"
fi

echo ""
echo "=========================================="

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ All checks passed! Ready for EasyPanel deployment."
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub: git add . && git commit -m 'Ready for EasyPanel' && git push"
    echo "2. In EasyPanel: Create project from GitHub repository"
    echo "3. Add environment variables (see DEPLOYMENT.md)"
    echo "4. Deploy!"
else
    echo "❌ Missing files: ${missing_files[*]}"
    echo "Please create the missing files before deploying."
fi