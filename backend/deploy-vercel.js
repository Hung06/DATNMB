#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel Deployment Script');
console.log('============================');

// Check if Vercel CLI is installed
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    console.log('✅ Vercel CLI is installed');
    return true;
  } catch (error) {
    console.log('❌ Vercel CLI not found');
    console.log('📦 Installing Vercel CLI...');
    try {
      execSync('npm install -g vercel', { stdio: 'inherit' });
      console.log('✅ Vercel CLI installed successfully');
      return true;
    } catch (installError) {
      console.log('❌ Failed to install Vercel CLI');
      console.log('Please install manually: npm install -g vercel');
      return false;
    }
  }
}

// Check if user is logged in to Vercel
function checkVercelLogin() {
  try {
    execSync('vercel whoami', { stdio: 'ignore' });
    console.log('✅ Logged in to Vercel');
    return true;
  } catch (error) {
    console.log('❌ Not logged in to Vercel');
    console.log('🔐 Please login to Vercel: vercel login');
    return false;
  }
}

// Set environment variables
function setEnvironmentVariables() {
  console.log('🔧 Setting environment variables...');
  
  const envVars = [
    'SUPABASE_URL=https://vfzuiolxvcrfgerxpavo.supabase.co',
    'SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmenVpb2x4dmNyZmdlcnhwYXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzcwNzgsImV4cCI6MjA3MDc1MzA3OH0.0C3Amzcn-07Hn2-QfUG6CrwwSCQ_jiQiNAbbrCrUqGA',
    'SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key',
    'NODE_ENV=production'
  ];
  
  envVars.forEach(envVar => {
    try {
      const [key, value] = envVar.split('=');
      execSync(`vercel env add ${key}`, { 
        stdio: 'pipe',
        input: value
      });
      console.log(`✅ Set ${key}`);
    } catch (error) {
      console.log(`⚠️  ${key} might already exist`);
    }
  });
}

// Deploy to Vercel
function deployToVercel() {
  console.log('🚀 Deploying to Vercel...');
  
  try {
    const output = execSync('vercel --prod', { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log('✅ Deployment successful!');
    console.log('📱 Your API is now live at:');
    console.log(output);
    
    return output;
  } catch (error) {
    console.log('❌ Deployment failed');
    console.log(error.message);
    return null;
  }
}

// Test deployed API
function testDeployedAPI(url) {
  console.log('🧪 Testing deployed API...');
  
  try {
    const axios = require('axios');
    axios.get(`${url}/api/health`)
      .then(response => {
        console.log('✅ API is responding');
        console.log('Response:', response.data);
      })
      .catch(error => {
        console.log('❌ API test failed');
        console.log(error.message);
      });
  } catch (error) {
    console.log('⚠️  Could not test API (axios not available)');
  }
}

// Main deployment function
async function main() {
  console.log('Starting deployment process...\n');
  
  // Step 1: Check Vercel CLI
  if (!checkVercelCLI()) {
    process.exit(1);
  }
  
  // Step 2: Check login
  if (!checkVercelLogin()) {
    process.exit(1);
  }
  
  // Step 3: Set environment variables
  setEnvironmentVariables();
  
  // Step 4: Deploy
  const deploymentUrl = deployToVercel();
  
  if (deploymentUrl) {
    // Step 5: Test deployed API
    testDeployedAPI(deploymentUrl);
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('📋 Next steps:');
    console.log('1. Update frontend with the new API URL');
    console.log('2. Update ESP32 with the new backend URL');
    console.log('3. Test all endpoints with the deployed backend');
  } else {
    console.log('\n❌ Deployment failed');
    process.exit(1);
  }
}

// Run deployment
if (require.main === module) {
  main().catch(error => {
    console.error('Deployment error:', error);
    process.exit(1);
  });
}

module.exports = { main };
