# Deploy AfriRoar to Render (MVP)

AfriRoar deploys as **one Web Service**: Express API + built React app.

## Before you start

1. **MongoDB Atlas** (required)  
   Local `mongodb://localhost...` will not work on Render.  
   Create a free cluster → Database Access user → Network Access `0.0.0.0/0` → copy the connection string.

2. **GitHub**  
   Repo: https://github.com/Gideon-Dadey/AfriRoar (must include latest `main` with `render.yaml`).

## Deploy with Blueprint

1. Open [https://dashboard.render.com](https://dashboard.render.com) and sign in (GitHub).
2. **New** → **Blueprint**.
3. Select the **AfriRoar** repo (branch `main`).
4. Render reads `render.yaml` and creates the `afriror` web service.
5. Fill required env vars when prompted:
   - `MONGODB_URI` — Atlas URI  
   - `EMAIL_USER` / `EMAIL_PASS` — Gmail + app password (for verify / contact)  
   - `GOOGLE_CLIENT_ID` — same as your local Google Web client ID  
   - `CLIENT_URL` — leave blank first deploy (auto uses `RENDER_EXTERNAL_URL`), then set to `https://YOUR-SERVICE.onrender.com`

**Build Command** (paste exactly if creating the service manually):

```bash
npm install --prefix server && npm install --prefix client --include=dev && npm run build --prefix client
```

**Start Command:**

```bash
npm start --prefix server
```

`--include=dev` matters: with `NODE_ENV=production`, npm skips Vite/TypeScript unless you force devDependencies.

## After deploy

1. Open `https://YOUR-SERVICE.onrender.com/api/health` — should return JSON success.
2. Open `https://YOUR-SERVICE.onrender.com` — AfriRoar UI.
3. **Google Cloud Console** → your OAuth client → add:
   - Authorized JavaScript origins: `https://YOUR-SERVICE.onrender.com`
   - Authorized redirect URIs: `https://YOUR-SERVICE.onrender.com` (if required)
4. Set `CLIENT_URL=https://YOUR-SERVICE.onrender.com` in Render env → **Manual Deploy**.

## Notes

- Free web services **spin down** after idle time; the first request can take ~30–60s.
- Uploaded files on disk are **ephemeral** on Render; use Cloudinary for durable avatars/docs later.
- Never commit real `.env` secrets; set them only in the Render dashboard.
