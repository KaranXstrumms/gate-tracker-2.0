# Deployment Guide

## 1. Backend Deployment (Render or Railway)

Since your backend requires a persistent running process (Node.js/Express) and MongoDB connectivity, **Render** or **Railway** are the best free/low-cost options.

### Option A: Deploy on Render (Recommended)

1.  **Push your code to GitHub** (if not already done).
2.  **Sign up/Log in to [Render](https://render.com/)**.
3.  Click **"New +"** -> **"Web Service"**.
4.  Connect your GitHub repository.
5.  **Configuration**:
    - **Name**: `gate-tracker-backend`
    - **Root Directory**: `backend`
    - **Environment**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
6.  **Environment Variables** (Scroll down to "Advanced"):
    - Add `MONGO_URI`: `your_mongodb_atlas_connection_string`
7.  Click **Create Web Service**.
8.  Wait for the build to finish. Once live, copy the URL (e.g., `https://gate-tracker-backend.onrender.com`).

---

    - **Output Directory**: `dist` (Default)
    - **Install Command**: `npm install` (Default)

3.  **Environment Variables**:
    - Add:
      - **Key**: `VITE_API_BASE_URL`
      - **Value**: `https://your-backend-url.onrender.com` (from Backend deployment)

4.  **Redeploy**:
    - Go to **Deployments**.
    - Click the three dots -> **Redeploy**.

## 3. Verification

1.  Open your Vercel app URL.
2.  Go to the **Practice** page.
3.  Refresh. It should load questions from the backend.

---

## Troubleshooting

- **Build Failures**: Ensure `Root Directory` is set to `frontend`.
- **404 Not Found**: Ensure the backend URL is correct and has no trailing slash.
