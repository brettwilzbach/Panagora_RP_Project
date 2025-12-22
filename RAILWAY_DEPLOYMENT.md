# Railway Deployment Guide

This guide will help you deploy the PanAgora Risk Parity Discovery Portal to Railway.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. GitHub repository connected to Railway
3. Node.js 18+ (Railway will use the version specified in your project)

## Quick Start

### Option 1: Deploy via Railway Dashboard (Recommended)

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `Panagora_RP_Project` repository
   - Select the `risk-parity-portal` directory as the root

2. **Configure Build Settings**
   - Railway will auto-detect the Vite project
   - Build Command: `npm run build` (already configured)
   - Start Command: `npm run start` (already configured)
   - Root Directory: `risk-parity-portal`

3. **Deploy**
   - Railway will automatically:
     - Install dependencies (`npm install`)
     - Build the application (`npm run build`)
     - Start the server (`npm run start`)
   - Your app will be live at a Railway-provided URL

4. **Custom Domain (Optional)**
   - Go to your project settings
   - Click "Domains"
   - Add your custom domain
   - Configure DNS as instructed

### Option 2: Deploy via Railway CLI

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd risk-parity-portal
   railway init
   ```

4. **Deploy**
   ```bash
   railway up
   ```

## Configuration Files

### `railway.json`
The project includes a `railway.json` configuration file that specifies:
- **Build Command**: `npm run build` - Builds the Vite application
- **Start Command**: `npm run start` - Serves the built static files

### `package.json` Scripts
The following scripts are configured:
- `npm run dev` - Development server (local only)
- `npm run build` - Production build
- `npm run start` - Production server (uses `vite preview` or `serve`)
- `npm run preview` - Preview production build locally

## Environment Variables

Currently, no environment variables are required. If you need to add any in the future:

1. Go to your Railway project dashboard
2. Navigate to "Variables"
3. Add your environment variables
4. Redeploy the application

## Build Process

Railway will:
1. **Detect** the Node.js project
2. **Install** dependencies from `package.json`
3. **Build** the application using `npm run build`
   - This runs TypeScript compilation (`tsc -b`)
   - Then builds with Vite (`vite build`)
   - Output goes to `dist/` directory
4. **Start** the server using `npm run start`
   - Serves the static files from `dist/`

## Troubleshooting

### Build Fails

**Issue**: Build command fails
- **Solution**: Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs in Railway dashboard

### Application Not Loading

**Issue**: Blank page or 404 errors
- **Solution**: 
  - Verify the root directory is set to `risk-parity-portal`
  - Check that `dist/` folder is being generated
  - Ensure `index.html` is in the root of `risk-parity-portal`

### Port Issues

**Issue**: Port binding errors
- **Solution**: Railway automatically assigns a port via `PORT` environment variable
- The `serve` package (if used) will automatically use `process.env.PORT`

### Static Assets Not Loading

**Issue**: Images or assets return 404
- **Solution**: 
  - Ensure assets are in the `public/` directory
  - Check that Vite is configured correctly
  - Verify asset paths in your components

## Production Optimizations

The build process includes:
- TypeScript type checking
- Vite optimizations (minification, tree-shaking)
- Code splitting
- Asset optimization

## Monitoring

Railway provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, and network usage
- **Deployments**: History of all deployments
- **Health Checks**: Automatic health monitoring

## Continuous Deployment

Railway automatically deploys when you push to your main branch:
1. Push changes to GitHub
2. Railway detects the push
3. Automatically builds and deploys
4. Your changes go live

To disable auto-deploy:
- Go to project settings
- Navigate to "Deployments"
- Toggle "Auto Deploy" off

## Custom Domain Setup

1. **Add Domain in Railway**
   - Go to project settings → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `riskparity.panagora.com`)

2. **Configure DNS**
   - Add a CNAME record pointing to Railway's provided domain
   - Or add an A record with Railway's IP address
   - Wait for DNS propagation (can take up to 48 hours)

3. **SSL Certificate**
   - Railway automatically provisions SSL certificates via Let's Encrypt
   - HTTPS is enabled by default

## Cost Considerations

Railway offers:
- **Free Tier**: $5 credit per month
- **Pay-as-you-go**: Only pay for what you use
- **Static sites**: Very low cost (often free tier is sufficient)

## Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Project Issues**: Open an issue in the GitHub repository

## Next Steps

After deployment:
1. Test all functionality on the live site
2. Set up a custom domain (optional)
3. Configure monitoring and alerts
4. Set up CI/CD if needed
5. Review and optimize performance

---

**Note**: This is a static site deployment. For server-side features, you would need to add a backend service to your Railway project.

