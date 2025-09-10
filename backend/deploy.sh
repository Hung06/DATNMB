#!/bin/bash

# 🚀 Vercel Deployment Script
echo "🚀 Starting Vercel Deployment..."
echo "================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    if [ $? -eq 0 ]; then
        echo "✅ Vercel CLI installed successfully"
    else
        echo "❌ Failed to install Vercel CLI"
        echo "Please install manually: npm install -g vercel"
        exit 1
    fi
else
    echo "✅ Vercel CLI is installed"
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel"
    echo "🔐 Please login to Vercel: vercel login"
    exit 1
else
    echo "✅ Logged in to Vercel"
fi

# Set environment variables
echo "🔧 Setting environment variables..."
vercel env add SUPABASE_URL <<< "https://vfzuiolxvcrfgerxpavo.supabase.co"
vercel env add SUPABASE_ANON_KEY <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmenVpb2x4dmNyZmdlcnhwYXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzcwNzgsImV4cCI6MjA3MDc1MzA3OH0.0C3Amzcn-07Hn2-QfUG6CrwwSCQ_jiQiNAbbrCrUqGA"
vercel env add SUPABASE_SERVICE_ROLE_KEY <<< "your-supabase-service-role-key"
vercel env add NODE_ENV <<< "production"

echo "✅ Environment variables set"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "📱 Your API is now live!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update ESP32 with the new backend URL"
    echo "2. Update Python LPR with the new backend URL"
    echo "3. Update Frontend with the new API URL"
    echo "4. Test all endpoints with the deployed backend"
else
    echo "❌ Deployment failed"
    exit 1
fi
