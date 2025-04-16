#!/bin/bash

# Script to install Firebase and update dependencies

echo "Installing Firebase package..."
npm install firebase --save

echo "Firebase installation complete!"
echo "Now you can use the Firebase authentication in your application."
echo ""
echo "To enable real Firebase (instead of mock), edit these files:"
echo "1. FE/lib/firebase-config.ts - Uncomment the real Firebase implementation"
echo "2. FE/lib/api-auth.ts - Uncomment the real Firebase imports and functions"
echo ""
echo "Restart your application after making these changes." 