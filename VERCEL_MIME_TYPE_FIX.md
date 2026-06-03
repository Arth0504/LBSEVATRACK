# VERCEL BLANK PAGE FIX - MIME Type Error

## ERROR

**Symptom:** Blank white page in production
**Browser Console Error:**
```
Failed to load module script:
Expected a JavaScript module script but the server responded 
with a MIME type of "text/html".

/assets/index-Dcueym4g.js returned text/html instead of application/javascript
```

---

## ROOT CAUSE ANALYSIS

### The Bug in vercel.json

**WRONG Configuration (Caused the Issue):**
```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/" }
  ]
}
```

### What This Did:

**Request Flow:**
```
Browser → GET /assets/index-Dcueym4g.js
          ↓
Vercel Route: "/(.*)" matches "/assets/index-Dcueym4g.js"
          ↓
Redirect to: dest: "/" (index.html)
          ↓
Response: <html>...</html> with Content-Type: text/html
          ↓
Browser: ERROR - Expected JavaScript, got HTML
```

**All requests caught by the route:**
- ✅ `/` → index.html (correct)
- ❌ `/assets/index-*.js` → index.html (WRONG - should be JS file)
- ❌ `/assets/index-*.css` → index.html (WRONG - should be CSS file)
- ❌ `/am1.png` → index.html (WRONG - should be image)
- ❌ `/about` → index.html (correct for SPA routing, but wrong method)

**Result:** Static assets served as HTML → MIME type mismatch → blank page

---

## THE DIFFERENCE: routes vs rewrites

### Vercel's Behavior:

| Feature | `routes` | `rewrites` |
|---------|----------|------------|
| **Static Files** | Intercepted before checking filesystem | Check filesystem first |
| **Priority** | Routes run BEFORE static file check | Static files served FIRST |
| **Use Case** | Advanced routing, APIs, redirects | SPA fallback routing |

### Why `routes` Failed:

```
Request: /assets/index-*.js
   ↓
routes RUNS FIRST → Matches "/(.*)" → Returns index.html
   ↓
Static file NEVER CHECKED
   ↓
MIME type error
```

### Why `rewrites` Works:

```
Request: /assets/index-*.js
   ↓
Check static file FIRST → Found in dist/assets/
   ↓
Return JS file with correct MIME type
   ↓
SUCCESS ✓

Request: /about (non-existent file)
   ↓
Check static file FIRST → Not found
   ↓
rewrite kicks in → Return index.html
   ↓
React Router handles /about
   ↓
SUCCESS ✓
```

---

## THE FIX

**CORRECT Configuration:**
```json
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "installCommand": "npm install --prefix client",
  "devCommand": "cd client && npm run dev",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Key Changes:**
1. Changed `routes` → `rewrites`
2. Changed `src` → `source`
3. Changed `dest` → `destination`

---

## WHY THIS WORKS

**Vercel's Processing Order with `rewrites`:**

```
1. Check if file exists in outputDirectory (client/dist)
   - /assets/index-*.js → EXISTS → Serve JS file ✓
   - /assets/index-*.css → EXISTS → Serve CSS file ✓
   - /am1.png → EXISTS → Serve image ✓
   - /vite.svg → EXISTS → Serve SVG ✓

2. If file NOT found:
   - /about → NOT EXISTS → Apply rewrite
   - /temples → NOT EXISTS → Apply rewrite
   - /bookings → NOT EXISTS → Apply rewrite
   → All return /index.html for React Router ✓
```

**Result:** 
- Static assets served correctly with proper MIME types
- SPA routing works (non-existent routes fall back to index.html)
- React Router handles client-side navigation

---

## VERIFICATION OF BUILD OUTPUT

**Local dist/ structure:**
```
client/dist/
├── index.html              ← Entry point
├── assets/
│   ├── index-*.js          ← Must be served as JS
│   ├── index-*.css         ← Must be served as CSS
│   ├── index.es-*.js       ← Must be served as JS
│   └── *.js                ← All JS files
├── *.png                   ← Images
└── vite.svg                ← SVG
```

**Vercel Configuration:**
```json
"outputDirectory": "client/dist"
```

**What Vercel sees:**
```
/index.html              → Serve HTML
/assets/index-*.js       → Serve JS (check file first)
/assets/index-*.css      → Serve CSS (check file first)
/am1.png                 → Serve PNG (check file first)
/about                   → Not found → Rewrite to /index.html
/temples                 → Not found → Rewrite to /index.html
```

---

## ROOT DIRECTORY QUESTION

**Should Vercel Root Directory be `client`?**

**Answer: NO** (with current vercel.json)

**Current Setup (CORRECT):**
- Root Directory: `.` (project root)
- Build Command: `cd client && npm install && npm run build`
- Output Directory: `client/dist`
- Install Command: `npm install --prefix client`

**Why This Works:**
- Vercel starts at project root
- Build command navigates to client
- Output points to client/dist
- Everything relative to root

**Alternative (Also Works):**
- Root Directory: `client`
- Build Command: `npm run build` (no cd needed)
- Output Directory: `dist` (relative to client)
- Install Command: `npm install` (in client)

**Which to Use:**
- **Current setup (root + commands):** Better for monorepo structure
- **Alternative (client root):** Simpler if only deploying client

**Recommendation:** Keep current setup since it's working.

---

## FILES CHANGED

**Modified:**
- `vercel.json` - Changed `routes` to `rewrites`

**No changes needed:**
- Root Directory: Keep as current (probably `.` or empty)
- Build commands: Already correct
- Local development: Unaffected

---

## GIT COMMIT

```bash
git add vercel.json

git commit -m "Fix Vercel blank page - change routes to rewrites

Root cause: routes intercepted static asset requests and returned HTML
Fix: Use rewrites to check static files first, then fallback to index.html

Before:
- routes caught ALL requests including /assets/*.js
- Static files served as text/html → MIME type error
- Blank page with console errors

After:
- rewrites check static files first
- /assets/*.js served with correct MIME type
- SPA routing still works for non-existent routes

Changes:
- routes → rewrites
- src → source  
- dest → destination

No impact on local development"

git push origin main
```

---

## EXPECTED RESULT

**After Deployment:**

1. **Vercel Build Logs:**
   ```
   ✓ Build completed
   ✓ Static files deployed to edge
   ```

2. **Browser Network Tab:**
   ```
   GET /                          → 200 text/html
   GET /assets/index-*.js         → 200 application/javascript ✓
   GET /assets/index-*.css        → 200 text/css ✓
   GET /am1.png                   → 200 image/png ✓
   ```

3. **Browser Console:**
   ```
   No errors ✓
   React app loads ✓
   ```

4. **Site Functionality:**
   ```
   / (home)           → Works ✓
   /temples           → Works (SPA route) ✓
   /bookings          → Works (SPA route) ✓
   /gates/verify      → Works (SPA route) ✓
   Direct navigation  → Works (rewrites to index.html) ✓
   ```

---

## TROUBLESHOOTING

### If Page Still Blank:

**Check 1: Verify rewrites syntax**
```bash
cat vercel.json | grep -A 3 rewrites
```
Should show:
```json
"rewrites": [
  { "source": "/(.*)", "destination": "/index.html" }
]
```

**Check 2: Verify deployment completed**
- Vercel dashboard shows "Ready" status
- No build errors in logs

**Check 3: Hard refresh browser**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

**Check 4: Check browser console**
- Should have NO errors about MIME types
- Should have NO 404s for /assets/*

**Check 5: Check Network tab**
- `/assets/index-*.js` should show Status: 200
- Content-Type should be `application/javascript`
- Response should be JavaScript code (not HTML)

---

## VERCEL DOCUMENTATION REFERENCES

**Rewrites vs Routes:**
- Rewrites: https://vercel.com/docs/projects/project-configuration#rewrites
- Routes: https://vercel.com/docs/projects/project-configuration#routes

**Key Quote from Docs:**
> "Rewrites allow you to map an incoming request path to a different destination path. 
> **Unlike Redirects, Rewrites check if a static file exists first** before applying the rewrite rule."

This is exactly what we need for SPA routing.

---

## SUMMARY

**Problem:** `routes` intercepted ALL requests, including static assets
**Solution:** `rewrites` check static files first, then apply fallback
**Impact:** Zero impact on local dev, fixes production blank page
**Status:** Ready to commit and deploy

**Critical Change:**
```diff
- "routes": [
-   { "src": "/(.*)", "dest": "/" }
+ "rewrites": [
+   { "source": "/(.*)", "destination": "/index.html" }
```

**This is the standard pattern for Vite/React SPAs on Vercel.**
