# Vercel Deployment Fix

## ROOT CAUSE ANALYSIS

### Error
```
sh: line 1: vite: command not found
Error: Command "vite build" exited with 127
```

### Why This Happened

**Project Structure:**
```
sevatrack/                    ← Vercel was building here (WRONG)
├── package.json             ← Only has puppeteer-core
├── vercel.json              ← No build config
└── client/                   ← Should build here (CORRECT)
    ├── package.json         ← Has vite in devDependencies
    └── dist/                ← Build output directory
```

**Vercel's Default Behavior:**
1. Builds from repository root by default
2. Runs `npm install` at root → installs only `puppeteer-core`
3. Tries to run `vite build` → vite not found (it's in client/node_modules)
4. **Result:** Deployment fails

**Log Evidence:**
```
added 39 packages, removed 283 packages
```
This shows Vercel installed root dependencies (39 = puppeteer), not client dependencies (283+)

---

## SOLUTION

### Fix 1: Update vercel.json

**File:** `vercel.json`

**Before:**
```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/" }
  ]
}
```

**After:**
```json
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "installCommand": "npm install --prefix client",
  "devCommand": "cd client && npm run dev",
  "framework": null,
  "routes": [
    { "src": "/(.*)", "dest": "/" }
  ]
}
```

**Explanation:**
- `buildCommand`: Navigate to client, install deps, run build
- `outputDirectory`: Point Vercel to client/dist for static files
- `installCommand`: Install dependencies in client directory
- `framework`: null (override auto-detection)
- `routes`: Keep existing SPA routing

---

## ALTERNATIVE SOLUTION (If vercel.json doesn't work)

### Option A: Set Root Directory in Vercel Dashboard

**Vercel Dashboard Settings:**

1. Go to: https://vercel.com/[your-username]/[project-name]/settings

2. Navigate to: **Settings** → **General** → **Build & Development Settings**

3. Configure:
   ```
   Root Directory: client
   
   Build Command: npm run build
   (or leave default if auto-detected)
   
   Output Directory: dist
   (or leave default)
   
   Install Command: npm install
   (or leave default)
   ```

4. **Save** changes

5. **Redeploy** from deployments page

**When to use:**
- If vercel.json method fails
- If you want UI-based configuration
- If multiple team members deploy

---

### Option B: Move Client to Root (NOT RECOMMENDED)

**Why not recommended:**
- Breaks existing project structure
- Requires updating all paths
- Server directory becomes orphaned
- More work, less flexible

---

## VERIFICATION STEPS

### Step 1: Commit Changes

```bash
git add vercel.json
git commit -m "Fix Vercel deployment - configure client subdirectory build

- Set buildCommand to run from client directory
- Point outputDirectory to client/dist
- Configure installCommand for client dependencies
- Add framework: null to prevent auto-detection issues

Fixes: vite command not found error"

git push origin main
```

### Step 2: Check Vercel Dashboard

1. Go to: https://vercel.com/[your-project]
2. Navigate to: **Deployments**
3. Wait for new deployment to trigger automatically
4. Click on the running deployment

### Step 3: Monitor Build Logs

**Expected Success Logs:**
```
[npm install] Installing dependencies...
[npm install] npm install --prefix client
[npm install] added 283 packages  ← Should be 283+, not 39

[build] Running build command...
[build] cd client && npm install && npm run build

[build] > client@0.0.0 build
[build] > vite build

[build] rolldown-vite v7.2.5 building client environment for production...
[build] ✓ 2418 modules transformed.
[build] dist/index.html                    0.65 kB
[build] dist/assets/index-*.css          81.24 kB
[build] dist/assets/index-*.js        1,758.46 kB
[build] ✓ built in 2.01s

[deployment] Deployment completed successfully
```

### Step 4: Test Deployed Site

1. Click deployment URL: `https://your-project.vercel.app`
2. Verify:
   - [ ] Site loads correctly
   - [ ] No console errors
   - [ ] API calls work (if backend deployed)
   - [ ] Routing works
   - [ ] QR scanner loads

---

## TROUBLESHOOTING

### Issue 1: Build Still Fails with "vite not found"

**Cause:** vercel.json not applied correctly

**Fix:** Use Vercel Dashboard method (Option A above)

---

### Issue 2: "Cannot find module 'rolldown-vite'"

**Cause:** Custom vite override not resolving

**Fix:** Add to client/package.json:
```json
"resolutions": {
  "vite": "npm:rolldown-vite@7.2.5"
}
```

Or switch to standard vite:
```json
"devDependencies": {
  "vite": "^5.0.0"
}
```

---

### Issue 3: Build Succeeds but Site Shows 404

**Cause:** Output directory mismatch

**Fix:** Verify `vercel.json`:
```json
"outputDirectory": "client/dist"
```

Not: `"outputDirectory": "dist"`

---

### Issue 4: Environment Variables Not Working

**Cause:** .env not loaded

**Fix:** Add environment variables in Vercel Dashboard:
1. Settings → Environment Variables
2. Add each variable from `client/.env`
3. Ensure they start with `VITE_` prefix
4. Redeploy

---

## VERCEL DASHBOARD SETTINGS (Quick Reference)

### If Using vercel.json (RECOMMENDED)

**Settings → General → Build & Development Settings:**

| Setting | Value |
|---------|-------|
| Framework Preset | Other |
| Root Directory | `.` (leave as root) |
| Build Command | (use vercel.json) |
| Output Directory | (use vercel.json) |
| Install Command | (use vercel.json) |

**Just upload vercel.json and let it handle everything.**

---

### If Using Dashboard Config (ALTERNATIVE)

**Settings → General → Build & Development Settings:**

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Root Directory | `client` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

---

## FINAL DEPLOYMENT STEPS

### Method 1: Automatic (Recommended)

1. Commit vercel.json changes:
   ```bash
   git add vercel.json
   git commit -m "Fix Vercel deployment config"
   git push origin main
   ```

2. Vercel auto-deploys on push
3. Monitor deployment: https://vercel.com/[project]/deployments
4. Verify live site works

---

### Method 2: Manual Dashboard Config

1. Keep vercel.json as-is (or remove build commands)
2. Go to Vercel Dashboard → Settings
3. Set Root Directory: `client`
4. Save changes
5. Deployments → Click "..." → Redeploy
6. Verify live site works

---

## FILES CHANGED

**Modified:**
- `vercel.json` - Added build configuration for client subdirectory

**No changes needed:**
- `client/package.json` - Already correct
- Root `package.json` - Keep as-is (for puppeteer if needed)
- Local development - Still works with `cd client && npm run dev`

---

## VERIFICATION CHECKLIST

After deployment succeeds:

- [ ] Build logs show 283+ packages installed (not 39)
- [ ] Build logs show "vite build" command succeeding
- [ ] Deployment status: "Ready" (green)
- [ ] Site URL loads without errors
- [ ] React app renders correctly
- [ ] Browser console has no errors
- [ ] Navigation/routing works
- [ ] API calls succeed (if backend connected)
- [ ] QR scanner functionality works

---

## EXPECTED BUILD TIME

**Before Fix:** Failed immediately (~10 seconds)
**After Fix:** ~2-3 minutes (full build)

**Build Breakdown:**
- Install dependencies: ~60-90s
- Build with Vite: ~2-3s
- Deploy to edge: ~10-20s
- Total: ~2-3 minutes

---

## ENVIRONMENT VARIABLES

If using environment variables, add them in Vercel Dashboard:

**Required Format:**
```
VITE_API_BASE_URL=https://your-backend.com/api
VITE_ANOTHER_VAR=value
```

**Steps:**
1. Vercel Dashboard → Settings → Environment Variables
2. Add each variable
3. Select: Production, Preview, Development (all)
4. Save
5. Redeploy for changes to take effect

---

## SUMMARY

**Problem:** Vercel built from root, couldn't find vite
**Solution:** Configure vercel.json to build from client/ subdirectory
**Impact:** Zero impact on local development
**Status:** Ready to deploy

**Next Step:** Commit vercel.json and push to trigger deployment
