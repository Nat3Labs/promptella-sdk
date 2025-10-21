#!/bin/bash

# Promptella SDK - GitHub Repository Setup Script
# This script initializes git and pushes the SDK to GitHub

set -e

echo "🚀 Promptella SDK - GitHub Setup"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the SDK directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the sdk/ directory."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Error: git is not installed. Please install git first."
    exit 1
fi

echo -e "${BLUE}📦 Repository: nat3labs/promptella-sdk${NC}"
echo ""

# Step 1: Initialize git if needed
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Step 1: Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✅ Git initialized${NC}"
else
    echo -e "${GREEN}✅ Git already initialized${NC}"
fi

echo ""

# Step 2: Add all files
echo -e "${YELLOW}Step 2: Adding files to git...${NC}"
git add .
echo -e "${GREEN}✅ Files added${NC}"

echo ""

# Step 3: Create initial commit
echo -e "${YELLOW}Step 3: Creating initial commit...${NC}"
if git rev-parse HEAD >/dev/null 2>&1; then
    git commit -m "Update: Promptella SDK" || echo "No changes to commit"
else
    git commit -m "Initial commit: Promptella SDK v1.0.0"
fi
echo -e "${GREEN}✅ Commit created${NC}"

echo ""

# Step 4: Set up remote
echo -e "${YELLOW}Step 4: Setting up GitHub remote...${NC}"
if git remote | grep -q "^origin$"; then
    echo "Remote 'origin' already exists. Updating URL..."
    git remote set-url origin https://github.com/nat3labs/promptella-sdk.git
else
    git remote add origin https://github.com/nat3labs/promptella-sdk.git
fi
echo -e "${GREEN}✅ Remote configured${NC}"

echo ""

# Step 5: Push to GitHub
echo -e "${YELLOW}Step 5: Pushing to GitHub...${NC}"
echo "This may require authentication (use GitHub Personal Access Token as password)"
echo ""

git branch -M main

if git push -u origin main; then
    echo ""
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
    echo ""
    echo "🎉 Your SDK is now on GitHub: https://github.com/nat3labs/promptella-sdk"
    echo ""
    echo "📌 Next steps:"
    echo "   1. Visit https://github.com/nat3labs/promptella-sdk to verify"
    echo "   2. To publish to NPM, create and push a version tag:"
    echo "      git tag v1.0.0"
    echo "      git push origin v1.0.0"
    echo ""
else
    echo ""
    echo -e "${YELLOW}⚠️  Push failed. This might be due to:${NC}"
    echo "   1. Authentication required (use GitHub Personal Access Token)"
    echo "   2. Repository already has commits (try: git pull origin main --rebase)"
    echo "   3. SSH key not configured"
    echo ""
    echo "See GITHUB_SETUP.md for detailed troubleshooting steps."
    exit 1
fi
