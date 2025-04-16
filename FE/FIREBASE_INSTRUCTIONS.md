# Firebase Integration Instructions

## Overview
This project uses Firebase for authentication. Due to the module not being found error, we've temporarily implemented mock Firebase modules. Follow these instructions to properly install Firebase and enable real authentication.

## Installation Steps

1. Install Firebase package:
   ```bash
   cd FE
   npm install firebase --save
   ```

2. After installation is complete, replace the mock Firebase implementation with the real one:

   a. Replace `FE/lib/firebase-config.ts` with the contents of `FE/lib/firebase-config.real.ts`
   
   b. Replace `FE/lib/api-auth.ts` with the contents of `FE/lib/api-auth.real.ts`

3. Restart your application:
   ```bash
   npm run dev
   ```

## Alternative: Using the Installation Script

We've provided a shell script to perform the installation:

```bash
cd FE
chmod +x install-firebase.sh
./install-firebase.sh
```

This will install Firebase and provide additional instructions.

## Troubleshooting

If you encounter issues:

1. Make sure you've installed Firebase properly:
   ```bash
   npm list firebase
   ```

2. Check your package.json to ensure Firebase is listed in the dependencies.

3. Make sure you've replaced both mock implementation files with their real counterparts.

4. Clear your Next.js cache:
   ```bash
   rm -rf FE/.next
   ```

5. Restart your development server.

## Note

The temporary mock implementations ensure your application can continue to run while Firebase is being properly installed. Once Firebase is installed, you should use the real implementations for full functionality. 