# Quick Start: Push SDK to GitHub

## What's Ready

✅ GitHub repository created: `nat3labs/promptella-sdk`  
✅ NPM trusted publisher configured  
✅ SDK code complete with documentation  
✅ GitHub Actions workflow configured  
✅ MIT License  
✅ .gitignore (Node template)  

## Push to GitHub (Choose One Method)

### Method 1: Automated Script (Easiest)

```bash
cd sdk
./setup-github.sh
```

This script will:
1. Initialize git repository
2. Add all files
3. Create initial commit
4. Configure GitHub remote
5. Push to GitHub

### Method 2: Manual Commands

```bash
cd sdk
git init
git add .
git commit -m "Initial commit: Promptella SDK v1.0.0"
git remote add origin https://github.com/nat3labs/promptella-sdk.git
git branch -M main
git push -u origin main
```

## Authentication

You'll need to authenticate when pushing. Use one of:

1. **Personal Access Token** (recommended for one-time setup)
   - GitHub Settings → Developer settings → Personal access tokens (classic)
   - Generate token with `repo` scope
   - Use as password when git prompts

2. **SSH Key** (recommended for frequent use)
   - Generate: `ssh-keygen -t ed25519`
   - Add to GitHub: Settings → SSH and GPG keys
   - Use SSH remote: `git@github.com:nat3labs/promptella-sdk.git`

## Publish to NPM

Once code is on GitHub, to publish to NPM:

```bash
# Update version in package.json (e.g., 1.0.1)
npm version patch  # or minor, or major

# Push the version tag
git push origin v1.0.1
```

GitHub Actions will automatically:
- Install dependencies
- Build the SDK
- Publish to NPM with provenance
- No manual token needed! (OIDC handles it)

## Verify Setup

After pushing:
1. Visit https://github.com/nat3labs/promptella-sdk
2. Check that all files are there
3. Create first release tag to trigger NPM publish

## Files Created for GitHub

- `.github/workflows/publish.yml` - Automated NPM publishing
- `GITHUB_SETUP.md` - Detailed setup instructions
- `setup-github.sh` - Automated setup script
- All SDK source code and documentation

## Need Help?

See `GITHUB_SETUP.md` for detailed troubleshooting and alternative methods.
