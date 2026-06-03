# VERCEL BLANK PAGE FIX - QUICK REFERENCE

## ERROR
Blank white page with console error:
```
Expected JavaScript module but got MIME type "text/html"
/assets/index-*.js returned text/html
```

---

## ROOT CAUSE

**BAD:**
```json
"routes": [
  { "src": "/(.*)", "dest": "/" }
]
```
→ Intercepted ALL requests including `/assets/*.js`
→ Returned `index.html` for JavaScript files
→ MIME type mismatch

---

## FIX

**GOOD:**
```json
"rewrites": [
  { "source": "/(.*)", "destination": "/index.html" }
]
```
→ Checks static files FIRST
→ Serves `/assets/*.js` as JavaScript
→ Falls back to `index.html` only for non-existent routes

---

## WHAT CHANGED

| Before | After |
|--------|-------|
| `routes` | `rewrites` |
| `src` | `source` |
| `dest` | `destination` |

**Why:** `rewrites` check filesystem before applying rule. `routes` don't.

---

## VERCEL ROOT DIRECTORY

**Answer: NO, leave as-is** (empty or `.`)

Current config handles it via:
```json
"buildCommand": "cd client && npm install && npm run build",
"outputDirectory": "client/dist"
```

This works correctly - don't change Root Directory.

---

## COMMIT

```bash
git add vercel.json VERCEL_MIME_TYPE_FIX.md

git commit -m "Fix Vercel blank page - change routes to rewrites

Root cause: routes intercepted static assets, served as HTML
Fix: rewrites check static files first, then fallback

Changes: routes→rewrites, src→source, dest→destination
Result: /assets/*.js served with correct MIME type"

git push origin main
```

---

## VERIFICATION

After deployment:

**Browser Network Tab:**
- `/assets/index-*.js` → `200` with `application/javascript` ✓
- `/assets/index-*.css` → `200` with `text/css` ✓

**Browser Console:**
- No MIME type errors ✓
- React app loads ✓

**Site:**
- Home page works ✓
- Navigation works ✓
- Direct URL access works ✓

---

## WHY THIS HAPPENED

**Vercel Processing Order:**

With `routes`:
```
Request /assets/*.js → routes catches it → returns index.html → ERROR
```

With `rewrites`:
```
Request /assets/*.js → check file exists → serve JS file → SUCCESS
Request /about → file not found → rewrite to index.html → SUCCESS
```

---

**See full details:** `VERCEL_MIME_TYPE_FIX.md`
