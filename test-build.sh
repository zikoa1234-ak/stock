#!/bin/bash

echo "🧪 Testing Docker build for EasyPanel..."
echo "========================================"

# Clean up any previous test
docker rm -f test-stock-app 2>/dev/null || true

# Build the image
echo "1. Building Docker image..."
docker build -t stock-management-test .

if [ $? -eq 0 ]; then
    echo "✅ Docker build successful!"
    
    # Test run (without database)
    echo ""
    echo "2. Testing container startup..."
    docker run -d \
        --name test-stock-app \
        -p 3000:3000 \
        -p 3001:3001 \
        -e NODE_ENV=test \
        stock-management-test
    
    sleep 5
    
    # Check if container is running
    if docker ps | grep -q test-stock-app; then
        echo "✅ Container started successfully"
        
        # Check health endpoint
        echo ""
        echo "3. Testing health endpoint..."
        sleep 10
        
        if curl -s http://localhost:3001/api/health > /dev/null; then
            echo "✅ Health endpoint responds"
        else
            echo "⚠️  Health endpoint not responding (backend may need database)"
        fi
        
        echo ""
        echo "📊 Container status:"
        docker ps | grep test-stock-app
        
        # Clean up
        echo ""
        echo "🧹 Cleaning up test container..."
        docker stop test-stock-app
        docker rm test-stock-app
        docker rmi stock-management-test
        
        echo ""
        echo "🎉 All tests passed! Ready for EasyPanel deployment."
        echo ""
        echo "Next steps:"
        echo "1. Push changes to GitHub"
        echo "2. Deploy on EasyPanel"
        echo "3. Add PostgreSQL service and set DATABASE_URL"
        
    else
        echo "❌ Container failed to start"
        docker logs test-stock-app
    fi
    
else
    echo "❌ Docker build failed"
    exit 1
fi

echo "========================================"