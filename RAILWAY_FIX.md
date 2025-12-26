# Railway Deployment - Simple Fix

## The Problem
Railway is looking at the repo root, but your app is in `risk-parity-portal/` folder.

## The Solution (2 Steps)

### Step 1: Set Root Directory in Railway Dashboard

1. Go to https://railway.app
2. Open your project
3. Click on your service (the one that's failing)
4. Click **Settings** tab
5. Scroll down to **"Root Directory"**
6. Type: `risk-parity-portal`
7. Click **Save**

### Step 2: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** or **"Deploy"**
3. Wait for it to build

That's it. Railway will now look inside `risk-parity-portal/` and find your `package.json`.

## Why This Works

When you set Root Directory to `risk-parity-portal`, Railway:
- Changes its working directory to that folder
- Finds `package.json` there
- Runs `npm install` from that directory
- Runs `npm run build` from that directory
- Runs `npm run start` from that directory

No config files needed. Just set the root directory in the dashboard.

