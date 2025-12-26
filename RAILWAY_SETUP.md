# Railway Setup Instructions

## ⚠️ IMPORTANT: Root Directory Configuration

Railway is currently failing because it's looking at the repository root, but the application is in the `risk-parity-portal/` subdirectory.

## Solution: Set Root Directory in Railway Dashboard

You **MUST** configure the root directory in Railway's dashboard:

### Steps:

1. **Go to your Railway project dashboard**
   - Navigate to your project on [railway.app](https://railway.app)

2. **Open Service Settings**
   - Click on your service
   - Go to **Settings** tab
   - Scroll to **"Root Directory"** section

3. **Set Root Directory**
   - Enter: `risk-parity-portal`
   - Click **Save**

4. **Redeploy**
   - Railway will automatically detect the Node.js project
   - It will find `package.json` in the `risk-parity-portal/` directory
   - Build should succeed

## Alternative: Use Railway CLI

If you prefer using the CLI:

```bash
railway service
# Select your service
railway variables set RAILWAY_ROOT_DIRECTORY=risk-parity-portal
```

## Why This Happens

Railway's Railpack builder looks for:
- `package.json` (Node.js detection)
- `railway.json` (configuration)
- Other language-specific files

When Railway analyzes the repo root, it sees:
- PDFs, Word docs, Python scripts
- A `risk-parity-portal/` folder (but doesn't automatically look inside)

Railway needs to be told to use `risk-parity-portal` as the working directory.

## Verification

After setting the root directory, Railway should:
1. ✅ Detect Node.js project
2. ✅ Find `package.json` in `risk-parity-portal/`
3. ✅ Run `npm install`
4. ✅ Run `npm run build`
5. ✅ Run `npm run start`

## Still Having Issues?

If Railway still can't detect the project after setting the root directory:

1. Check that `risk-parity-portal/package.json` exists
2. Verify the root directory path is exactly `risk-parity-portal` (no trailing slash)
3. Check Railway logs for more detailed error messages
4. Ensure your Railway project is connected to the correct GitHub repository

