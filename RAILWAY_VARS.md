## Railway Environment Variables — apps/api

Copy each variable name into Railway → your service → Variables.

---

### Database

DATABASE_URL=

  Get this from Neon: Project → Connection Details → select "Prisma" or "Node.js" pooled URL.
  Format: postgres://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require


### Firebase Admin SDK

FIREBASE_PROJECT_ID=

  Firebase Console → Project Settings → General → Project ID

FIREBASE_CLIENT_EMAIL=

  Firebase Console → Project Settings → Service Accounts
  → Generate new private key → copy "client_email" field

FIREBASE_PRIVATE_KEY=

  Same JSON file → copy the "private_key" value (including the -----BEGIN ... END----- lines).
  Paste it exactly as-is (with literal \n characters) — the code calls .replace(/\\n/g, "\n") automatically.
  In Railway, paste the raw multi-line value — Railway handles quotes/escaping for you.


### CORS

FRONTEND_URL=

  The deployed Vercel URL of apps/web, e.g. https://fieldsyncpro.vercel.app
  (During development: http://localhost:3000)


### Runtime

NODE_ENV=production

  Set this literally to: production


### Not needed in Railway

PORT — Railway injects this automatically. Do NOT set it manually.
