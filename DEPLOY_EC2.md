# Redeploy AfriRoar to AWS EC2

AfriRoar runs as **one Node process**: Express API + the built React app from `client/dist`.

Repo: https://github.com/Gideon-Dadey/AfriRoar  
Branch: `main`

Replace these placeholders with your values:

| Placeholder | Example |
|-------------|---------|
| `YOUR_KEY.pem` | Path to your EC2 `.pem` key |
| `ubuntu@YOUR_EC2_IP` | e.g. `ubuntu@54.xxx.xxx.xxx` |
| `YOUR_DOMAIN` | e.g. `afriror.com` or the public IP / Elastic IP |
| `~/AfriRoar` | App directory on the server (adjust if different) |

---

## 0. Before you redeploy (local)

1. Confirm latest code is on GitHub:

```bash
git status
git push origin main
```

2. Confirm MongoDB Atlas **Network Access** allows your EC2 IP (or `0.0.0.0/0` for simplicity).
3. Have SSH access working:

```bash
ssh -i YOUR_KEY.pem ubuntu@YOUR_EC2_IP
```

---

## 1. SSH into the instance

```bash
ssh -i YOUR_KEY.pem ubuntu@YOUR_EC2_IP
```

---

## 2. Pull latest code

```bash
cd ~/AfriRoar
git fetch origin
git checkout main
git pull origin main
```

If the repo is not cloned yet:

```bash
cd ~
git clone https://github.com/Gideon-Dadey/AfriRoar.git
cd AfriRoar
```

---

## 3. Install dependencies and build the client

Use `--include=dev` on the client so Vite/TypeScript install even when `NODE_ENV=production`.

```bash
cd ~/AfriRoar

npm install --prefix server
npm install --prefix client --include=dev
npm run build --prefix client
```

Expected result: `client/dist/` exists with `index.html` and assets.

---

## 4. Confirm production env on the server

Env file lives next to the API:

```bash
nano ~/AfriRoar/server/.env
```

Minimum production values:

```env
NODE_ENV=production
PORT=5000

MONGODB_URI=mongodb+srv://USER:PASS@CLUSTER/scholarhive?retryWrites=true&w=majority

JWT_SECRET=long-random-secret
JWT_REFRESH_SECRET=another-long-random-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

CLIENT_URL=https://YOUR_DOMAIN

GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=AfriRoar <noreply@YOUR_DOMAIN>
SUPPORT_EMAIL=support@YOUR_DOMAIN
```

Notes:

- Do **not** commit `.env`.
- `CLIENT_URL` must match the public site URL (no trailing slash).
- Optional: Stripe / Cloudinary keys when you need those features.

---

## 5. Restart the app with PM2

If PM2 is already set up:

```bash
cd ~/AfriRoar
pm2 restart afriror
# or, if the process name differs:
pm2 list
pm2 restart all
```

First-time PM2 start (only if the process does not exist yet):

```bash
cd ~/AfriRoar
pm2 start npm --name afriror -- start --prefix server
pm2 save
pm2 startup
```

Useful checks:

```bash
pm2 status
pm2 logs afriror --lines 80
curl -s http://127.0.0.1:5000/api/health
```

Health should return JSON success.

---

## 6. Nginx (if you use it as reverse proxy)

Reload after config changes (usually not needed for a normal code redeploy):

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Typical proxy target: `http://127.0.0.1:5000`

Example site block sketch:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN www.YOUR_DOMAIN;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

HTTPS (Certbot), if not already done:

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN
```

---

## 7. Security group / firewall

EC2 security group should allow:

| Port | Purpose |
|------|---------|
| 22 | SSH |
| 80 | HTTP |
| 443 | HTTPS |

App port `5000` does **not** need to be public if Nginx proxies to it.

---

## 8. Post-deploy checklist

1. Open `https://YOUR_DOMAIN/api/health` → JSON OK.
2. Open `https://YOUR_DOMAIN` → AfriRoar UI loads.
3. Hard-refresh (or reopen the PWA once) so the service worker picks up the new build.
4. Google Cloud Console → OAuth client → authorized origins / redirects include `https://YOUR_DOMAIN`.
5. Smoke-test login, scholarships, jobs, and admin content.

---

## One-liner redeploy (after SSH)

Copy-paste when the instance is already configured:

```bash
cd ~/AfriRoar \
  && git pull origin main \
  && npm install --prefix server \
  && npm install --prefix client --include=dev \
  && npm run build --prefix client \
  && pm2 restart afriror \
  && pm2 logs afriror --lines 40
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Site shows old UI | Rebuild client (`npm run build --prefix client`), restart PM2, hard-refresh / reopen PWA |
| `/api/health` fails | `pm2 logs afriror`, check `server/.env`, confirm MongoDB Atlas allows the EC2 IP |
| 502 Bad Gateway | Node not running (`pm2 status`), or Nginx pointing at wrong port |
| Build fails on client | Re-run `npm install --prefix client --include=dev` (Vite is a devDependency) |
| Google login broken | Update `CLIENT_URL` and Google OAuth origins to the live domain |
| Uploads missing after reboot | Prefer Cloudinary for durable files; local `server/uploads` is disk-bound to that instance |

---

## Optional: first-time EC2 bootstrap (if this server is new)

```bash
# Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx
sudo npm install -g pm2

# Clone + env + build + start (then configure Nginx + Certbot as above)
cd ~
git clone https://github.com/Gideon-Dadey/AfriRoar.git
cd AfriRoar
cp server/.env.example server/.env
nano server/.env
npm install --prefix server
npm install --prefix client --include=dev
npm run build --prefix client
pm2 start npm --name afriror -- start --prefix server
pm2 save
pm2 startup
```

---

## Related

- Render (previous) guide: [`DEPLOY_RENDER.md`](./DEPLOY_RENDER.md)
