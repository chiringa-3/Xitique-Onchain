#!/bin/bash

# Build script that creates the correct structure for static deployment
echo "Building application for deployment..."

# Run the normal build process
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo "Restructuring files for static deployment..."

# Copy static files from dist/public to dist root
cp -r dist/public/* dist/

# Remove the now empty public directory  
rm -rf dist/public

echo "Build completed! Static files are now in dist/ ready for deployment."
echo "Files in dist/:"
ls -la dist/