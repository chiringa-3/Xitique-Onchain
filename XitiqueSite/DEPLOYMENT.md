# Deployment Guide

## Issue Fixed
The deployment was failing because the static deployment configuration in `.replit` was looking for files in `dist/` but the build process was outputting files to `dist/public/`.

## Solution
Since core configuration files cannot be modified, a custom build script was created to restructure the files after build.

## For Static Deployment

### Method 1: Use the Custom Build Script (Recommended)
```bash
./build-for-deployment.sh
```

This script:
1. Runs the normal build process (`npm run build`)
2. Copies static files from `dist/public/` to `dist/`
3. Removes the `dist/public/` directory
4. Results in the correct structure for static deployment

### Method 2: Manual Process
```bash
# Build normally
npm run build

# Restructure for deployment
cp -r dist/public/* dist/
rm -rf dist/public
```

## File Structure After Deployment Build
```
dist/
├── index.html          # Main HTML file (required by static deployment)
├── assets/
│   ├── *.css           # Compiled CSS
│   ├── *.js            # Compiled JavaScript
│   └── *.webp          # Static assets
└── index.js            # Server file (not used in static deployment)
```

## Deployment Configuration
The `.replit` file is configured for static deployment:
- `deploymentTarget = "static"`
- `publicDir = "dist"`
- `build = ["npm", "run", "build"]`

## Alternative: Autoscale Deployment
For a full-stack application with Express server, consider changing to Autoscale deployment instead of Static deployment. This would:
- Use the Express server to serve the application
- Allow for backend API functionality
- Handle the existing file structure without modification

To switch to Autoscale deployment, the `.replit` configuration would need to be updated (requires manual change in the Replit interface):
```toml
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "start"]
```