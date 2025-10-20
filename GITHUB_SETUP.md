# GitHub Repository Setup Guide

This guide will help you push your SDK code to the GitHub repository `nat3labs/promptella-sdk`.

## Prerequisites

- ✅ GitHub repository created: `nat3labs/promptella-sdk`
- ✅ NPM trusted publisher configured
- ✅ GitHub account access

## Option 1: Using Git CLI (Recommended)

### Step 1: Navigate to SDK directory
```bash
cd sdk
```

### Step 2: Initialize Git repository
```bash
git init
git add .
git commit -m "Initial commit: Promptella SDK v1.0.0"
```

### Step 3: Add GitHub remote
```bash
git remote add origin https://github.com/nat3labs/promptella-sdk.git
```

### Step 4: Push to GitHub
```bash
git branch -M main
git push -u origin main
```

### Step 5: Create a release tag (optional - triggers NPM publish)
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Option 2: Using GitHub CLI (gh)

If you have GitHub CLI installed:

```bash
cd sdk
git init
git add .
git commit -m "Initial commit: Promptella SDK v1.0.0"
gh repo create nat3labs/promptella-sdk --public --source=. --remote=origin --push
```

## What Happens Next

1. **Code is on GitHub** - Your SDK code is now in the public repository
2. **Automatic Publishing** - When you push a version tag (like `v1.0.0`), GitHub Actions will:
   - Install dependencies
   - Build the package
   - Publish to NPM using OIDC (no token needed!)

## Publishing New Versions

To publish a new version to NPM:

1. Update version in `package.json`
2. Commit the change
3. Create and push a tag:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

The GitHub Action will automatically publish to NPM!

## Troubleshooting

### Authentication Required
If git asks for authentication, you have two options:

1. **Personal Access Token (Classic)**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` scope
   - Use token as password when pushing

2. **SSH Key (Recommended for frequent use)**
   - Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
   - Add to GitHub: Settings → SSH and GPG keys
   - Use SSH URL: `git@github.com:nat3labs/promptella-sdk.git`

### Repository Already Exists Error
If the remote already has commits, you may need to pull first:
```bash
git pull origin main --rebase
git push origin main
```

## Manual Upload Alternative

If git doesn't work, you can manually upload files through GitHub's web interface:
1. Go to https://github.com/nat3labs/promptella-sdk
2. Click "uploading an existing file"
3. Drag and drop all SDK files (except node_modules)
4. Commit the changes

---

**Need help?** Check the main project docs or contact support.
