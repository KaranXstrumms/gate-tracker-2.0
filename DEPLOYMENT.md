# Deployment Guide

## 1. Backend Deployment (Render or Railway)

Since your backend requires a persistent running process (Node.js/Express) and MongoDB connectivity, **Render** or **Railway** are the best free/low-cost options.

### Option A: Deploy on Render (Recommended)

1.  **Push your code to GitHub** (if not already done).
2.  **Sign up/Log in to [Render](https://render.com/)**.
3.  Click **"New +"** -> **"Web Service"**.
4.  Connect your GitHub repository.
5.  **Configuration**:
    - **Name**: `gate-tracker-backend` (or similar)
    - **Root Directory**: `backend` (Important! Since your server.js is in the backend folder)
    - **Environment**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
6.  **Environment Variables** (Scroll down to "Advanced"):
    - Add `MONGO_URI`: `your_mongodb_atlas_connection_string`
    - _Note: Render automatically sets the `PORT` variable._
7.  Click **Create Web Service**.
8.  Wait for the build to finish. Once live, copy the URL (e.g., `https://gate-tracker-backend.onrender.com`).

### Option B: Deploy on Railway

1.  **Sign up/Log in to [Railway](https://railway.app/)**.
2.  Click **"New Project"** -> **"Deploy from GitHub repo"**.
3.  Select your repository.
4.  **Settings**:
    - Go to **Settings** -> **Root Directory** and set it to `/backend`.
    - Go to **Variables** and add:
      - `MONGO_URI`: `your_mongodb_atlas_connection_string`
5.  Railway usually detects the start command automatically from `package.json` or `server.js`.
6.  Once deployed, copy the provided domain (Networking tab).

---

## 2. Frontend Configuration (Vercel)

Now that your backend is live, you need to tell your Vercel frontend where to find it.

1.  Go to your **Vercel Dashboard**.
2.  Select your `gate-tracker` project.
3.  Go to **Settings** -> **Environment Variables**.
4.  Add a new variable:
    - **Key**: `VITE_API_BASE_URL`
    - **Value**: `https://your-backend-url.onrender.com` (The URL you copied in Step 1, without the trailing slash)
5.  **Redeploy**:
    - Go to the **Deployments** tab.
    - Click the three dots on the latest deployment -> **Redeploy**.
    - _Note: Environment variables only take effect on a new build/deployment._

## 3. Verification

1.  Open your Vercel app URL.
2.  Go to the **Practice** page.
3.  Right-click -> **Inspect** -> **Network** tab.
4.  Refresh the page.
5.  You should see a request to `https://your-backend-url.onrender.com/api/questions` with a `200 OK` status.

## Troubleshooting

- **CORS Errors**: The backend is currently configured to allow all origins (`app.use(cors())`), so this should not be an issue.
- **404 Not Found**: Ensure you set the `Root Directory` correctly (`backend`) in Render/Railway.
- **MongoDB Connection Error**: Double-check your `MONGO_URI` in the backend service variables. Ensure "Network Access" in MongoDB Atlas allows `0.0.0.0/0` (Allow Access from Anywhere).
