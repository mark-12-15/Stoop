# Deployment Guide

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# AI
GOOGLE_AI_API_KEY=AIza...

# Storage
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET_NAME=stoopkeep-uploads
CLOUDFLARE_R2_PUBLIC_URL=https://...

# Payments
LEMON_SQUEEZY_API_KEY=...
LEMON_SQUEEZY_WEBHOOK_SECRET=...
LEMON_SQUEEZY_STORE_ID=...

# Admin
ADMIN_EMAILS=your-email@example.com,co-founder@example.com

# App
NEXT_PUBLIC_APP_URL=https://stoopkeep.com
NODE_ENV=production
```

---

## Deploy to Vercel

### 1. Connect GitHub Repo
- Link GitHub repository
- Auto-deploy on push to `main`
- Preview deployments for PRs

### 2. Add Environment Variables
Copy all variables from `.env.local` to Vercel dashboard

### 3. Build Settings
```
Framework: Next.js
Build Command: next build
Output Directory: .next
Install Command: npm install
```

### 4. Domain Setup
- Add custom domain: `stoopkeep.com`
- Add `www` redirect
- Enable HTTPS (automatic)

---

## Database Setup

### 1. Create Supabase Project
- Sign up at supabase.com
- Create new project
- Note: URL and API keys

### 2. Run Migrations
Execute SQL in Supabase Dashboard → SQL Editor:
```sql
-- Copy from for-review/database.md
-- Create tables: users, properties, tickets, feedback
```

### 3. Enable Row Level Security (RLS)
```sql
-- Users can only see their own data
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their properties"
  ON properties FOR SELECT
  USING (landlord_id = auth.uid());
```

### 4. Set up Storage Buckets (if using Supabase Storage)
- Create bucket: `receipts`
- Set public access policies

---

## Cloudflare R2 Setup

### 1. Create R2 Bucket
- Dashboard → R2 → Create Bucket
- Name: `stoopkeep-uploads`

### 2. Generate API Tokens
- Dashboard → R2 → Manage R2 API Tokens
- Create token with read/write permissions

### 3. Configure CORS (if needed)
```json
{
  "AllowedOrigins": ["https://stoopkeep.com"],
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedHeaders": ["*"]
}
```

---

## Lemon Squeezy Setup

### 1. Create Products
- Product: "StoopKeep Pro Monthly" - $30/month
- Product: "StoopKeep Pro Annual" - $300/year

### 2. Set up Webhook
- URL: `https://stoopkeep.com/api/webhooks/lemon-squeezy`
- Events: `order_created`, `subscription_created`, `subscription_cancelled`
- Copy webhook secret to env

---

## Google AI (Gemini) Setup

### 1. Get API Key
- Visit: https://makersuite.google.com/app/apikey
- Create API key
- Enable Gemini API

### 2. Test API
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

---

## Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Database tables created
- [ ] RLS policies enabled
- [ ] Admin email configured
- [ ] R2 bucket created
- [ ] Lemon Squeezy products created
- [ ] Gemini API key tested
- [ ] Custom domain connected
- [ ] Test tenant submission flow
- [ ] Test landlord login
- [ ] Test admin access

---

## Monitoring

### Vercel
- Analytics: Page views, web vitals
- Logs: Function logs, edge logs

### Supabase
- Database usage
- Auth users count
- API requests

### Error Tracking (Optional)
- Sentry for error monitoring
- LogRocket for session replay

---

## Backup Strategy

- Database: Supabase auto-backup (daily)
- Code: GitHub (version control)
- Environment variables: Store in password manager

---

## Scaling Considerations

- Vercel scales automatically
- Supabase free tier: 500MB database, 2GB transfer
- If exceed limits, upgrade to Supabase Pro ($25/month)
- R2 pricing: $0.015/GB storage, free egress

---

## CI/CD Pipeline

Currently using Vercel's built-in CI/CD:
1. Push to `main` → Auto deploy to production
2. Push to PR → Create preview deployment
3. Merge PR → Preview becomes production

For advanced needs, add GitHub Actions for tests.
