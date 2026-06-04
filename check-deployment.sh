#!/bin/bash
echo "🔍 Checking EasyPanel Deployment Setup..."
echo "========================================"

echo "1. Required files:"
[ -f "Dockerfile" ] && echo "✅ Dockerfile" || echo "❌ Dockerfile missing"
[ -f "package.json" ] && echo "✅ package.json" || echo "❌ package.json missing"
[ -f ".dockerignore" ] && echo "✅ .dockerignore" || echo "❌ .dockerignore missing"

echo ""
echo "2. Dockerfile content (first 10 lines):"
head -10 Dockerfile

echo ""
echo "3. Package.json validation:"
node -e "try { const pkg = require('./package.json'); console.log('✅ package.json valid'); console.log('   Name:', pkg.name); console.log('   Version:', pkg.version); } catch(e) { console.log('❌ package.json error:', e.message); }"

echo ""
echo "========================================"
echo "📋 Files in directory:"
ls -la | grep -v "^total"

echo ""
echo "🚀 Ready for EasyPanel deployment!"
echo "1. git add ."
echo "2. git commit -m 'Ready for EasyPanel'"
echo "3. git push"
echo "4. Deploy on EasyPanel"
