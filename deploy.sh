#!/bin/bash

# Process Jinn - Vercel Deployment Script
# This script prepares and deploys your app to Vercel

echo "🚀 Process Jinn - Vercel Deployment"
echo "=================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found. Please create it with your VITE_GEMINI_API_KEY"
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment complete!"
echo "📊 Check your Vercel dashboard for analytics and settings"
