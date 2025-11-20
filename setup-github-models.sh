#!/bin/bash

# GitHub Models Setup Script
# Helps configure GitHub token for AI features

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     AOT Asset Management - GitHub Models Setup              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "   Please run this script from the project root directory"
    exit 1
fi

echo "This script will help you configure GitHub Models for unlimited AI features."
echo ""
echo "📝 Steps:"
echo "  1. Get your GitHub token from: https://github.com/settings/tokens"
echo "  2. Generate new token (classic) with 'repo' and 'read:user' scopes"
echo "  3. Copy the token (starts with ghp_)"
echo ""

# Ask if user wants to continue
read -p "Do you have a GitHub token ready? (y/n): " ready

if [[ ! $ready =~ ^[Yy]$ ]]; then
    echo ""
    echo "Please visit: https://github.com/settings/tokens"
    echo "Then run this script again."
    exit 0
fi

echo ""
read -p "Enter your GitHub token: " github_token

# Validate token format
if [[ ! $github_token =~ ^ghp_ ]]; then
    echo ""
    echo "⚠️  Warning: Token doesn't start with 'ghp_'"
    echo "   Are you sure this is a GitHub Personal Access Token?"
    read -p "Continue anyway? (y/n): " continue_anyway
    
    if [[ ! $continue_anyway =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Update .env file
echo ""
echo "📝 Updating .env file..."

# Check if VITE_GITHUB_TOKEN already exists
if grep -q "VITE_GITHUB_TOKEN=" .env; then
    # Update existing line
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|VITE_GITHUB_TOKEN=.*|VITE_GITHUB_TOKEN=$github_token|" .env
    else
        # Linux
        sed -i "s|VITE_GITHUB_TOKEN=.*|VITE_GITHUB_TOKEN=$github_token|" .env
    fi
    echo "✅ Updated existing VITE_GITHUB_TOKEN"
else
    # Add new line
    echo "VITE_GITHUB_TOKEN=$github_token" >> .env
    echo "✅ Added VITE_GITHUB_TOKEN to .env"
fi

# Set AI provider to github
if grep -q "VITE_AI_PROVIDER=" .env; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|VITE_AI_PROVIDER=.*|VITE_AI_PROVIDER=github|" .env
    else
        sed -i "s|VITE_AI_PROVIDER=.*|VITE_AI_PROVIDER=github|" .env
    fi
else
    echo "VITE_AI_PROVIDER=github" >> .env
fi

echo "✅ Set AI provider to GitHub Models"
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Configuration Complete!                                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Restart your frontend development server:"
echo "     npm run dev"
echo ""
echo "  2. Test AI features:"
echo "     - Dashboard AI insights"
echo "     - Ask AOT page"
echo "     - AI Assist buttons"
echo ""
echo "  3. Check browser console for: '🤖 Using GitHub Models API'"
echo ""
echo "📚 For more info, see: GITHUB_MODELS_SETUP.md"
echo ""
