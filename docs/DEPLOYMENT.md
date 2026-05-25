# Deployment Guide

This guide will help you deploy EidCard to Vercel for production.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- MongoDB Atlas cluster (free tier works)
- All environment variables ready

## Step 1: Push to GitHub

```bash
cd eid-card-saas
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/eid-card-saas.git
git push -u origin main
```

## Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Log in with your GitHub account
3. Click "New Project"
4. Import your `eid-card-saas` repository
5. Click "Deploy"

## Step 3: Configure Environment Variables

In Vercel dashboard, go to Settings → Environment Variables and add:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eid-card-saas
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
BKASH_API_URL=https://tokenized.bka.sh/v1.2.0
BKASH_USERNAME=your-bkash-username
BKASH_PASSWORD=your-bkash-password
BKASH_APP_KEY=your-bkash-app-key
BKASH_APP_SECRET=your-bkash-app-secret
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Step 4: Generate NEXTAUTH_SECRET

```bash
# On Linux/Mac
openssl rand -base64 32

# Or use online generator: https://generate-secret.vercel.app/32
```

## Step 5: Configure MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist IP `0.0.0.0/0` (for Vercel access)
4. Get connection string from "Connect" → "Connect your application"
5. Replace `<password>` with your database user password

## Step 6: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`

## Step 7: Configure Resend (Email)

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Verify your domain or use their test endpoint

## Step 8: Configure bKash (Payment)

1. Contact bKash for merchant account
2. Get API credentials
3. Note: bKash sandbox available for testing

## Step 9: Update NEXTAUTH_URL

After deployment, update:
- `NEXTAUTH_URL` to your Vercel domain
- Google OAuth redirect URI
- `NEXT_PUBLIC_APP_URL`

## Step 10: Rebuild Prisma Client

Add to your `package.json`:

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

Vercel automatically runs this after installing dependencies.

## Custom Domain (Optional)

1. In Vercel dashboard → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`

## Troubleshooting

### Build Failures

```bash
# Run locally first
npm run build
```

### Database Connection Issues

- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure database user has correct permissions

### Authentication Issues

- Verify `NEXTAUTH_URL` matches exactly (including https://)
- Check Google OAuth redirect URIs
- Ensure `NEXTAUTH_SECRET` is set

### API Route Errors

- Check environment variables are set in Vercel
- Verify all required env vars are present
- Check Vercel function logs for errors

## Useful Vercel Commands

```bash
# View logs
vercel logs your-project

# Pull environment variables
vercel env pull .env.local

# Deploy to production
vercel --prod
```

## Performance Optimization

- Enable Vercel Analytics
- Use Vercel Image Optimization for images
- Configure caching headers in `next.config.js`
- Enable gzip compression (automatic on Vercel)

## Security Checklist

- [ ] All environment variables set in Vercel
- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Google OAuth redirect URIs correct
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] No sensitive data in client-side code

## Monitoring

- Enable Vercel Analytics for traffic insights
- Set up MongoDB Atlas monitoring alerts
- Configure Resend usage alerts
- Monitor bKash transaction logs

## Support

For issues, open a GitHub issue or contact support.
