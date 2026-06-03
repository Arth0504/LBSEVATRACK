# VERCEL DEPLOYMENT FIX - QUICK GUIDE

## ROOT CAUSE
Vercel tried to build from root directory but vite is in `client/` subdirectory.

**Error:** `vite: command not found`

---

## FIX APPLIED

**File Changed:** `vercel.json`

**What Changed:**
- Added `buildCommand` to build from client directory
- Added `outputDirectory` pointing to client/dist
- Added `installCommand` to install client dependencies

---

## COMMIT & DEPLOY

```bash
# Stage the fix
git add vercel.json

# Commit
git commit -m "Fix Vercel deployment - configure client subdirectory build

- Set buildCommand to run from client directory
- Point outputDirectory to client/dist
- Configure installCommand for client dependencies

Fixes: vite command not found error (exit code 127)"

# Push to trigger Vercel deployment
git push origin main
```

---

## MONITOR DEPLOYMENT

1. Go to: https://vercel.com/[your-project]/deployments
2. Watch new deployment appear
3. Click to view logs

**Expected Success:**
```
✓ Installing dependencies...
✓ added 283 packages  ← Should see this (not 39)

✓ Running build command...
✓ vite build
✓ 2418 modules transformed

✓ Deployment completed
```

---

## IF IT STILL FAILS

Use Vercel Dashboard method instead:

1. Go to: Vercel Dashboard → Settings → General
2. Find: **Build & Development Settings**
3. Set **Root Directory:** `client`
4. Save
5. Redeploy manually

---

## VERIFY DEPLOYMENT

After deployment succeeds:
- [ ] Site loads at your-project.vercel.app
- [ ] No console errors
- [ ] React app renders
- [ ] Routing works

---

**Local development unchanged** - still works with:
```bash
cd client
npm run dev
```

---

See `VERCEL_DEPLOYMENT_FIX.md` for detailed troubleshooting.
