# StudentGear — Fullstack (frontend + backend)

This repository contains a small StudentGear demo app (static frontend + minimal Express backend) intended for local development and simple deployment.

What I prepared for you
- `frontend/` — existing static frontend (HTML, JS, CSS)
- `backend/` — small Express dev server with demo endpoints
- `.gitignore` — ignores node_modules, .env, and common files
- `.github/workflows/deploy-frontend.yml` — optional action to deploy the `frontend` folder to GitHub Pages

Goals I can complete for you
- Wire frontend and backend (done locally) so login and cart use the API.
- Prepare repo and instructions so you can push to GitHub and enable Pages for frontend hosting.
- Recommend and provide steps to host the backend on Render (or similar).

How to push this repo to GitHub (Windows cmd)
1. Create a new GitHub repository from github.com -> New repository (do not initialize with README).
2. Run these commands locally in your project root (replace USER and REPO):

```cmd
cd /d D:\project
git init
git add -A
git commit -m "Initial StudentGear project"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git push -u origin main
```

Notes: if you prefer SSH use the SSH remote url instead.

Deploy frontend to GitHub Pages (automatic with workflow)
- This repo contains a GitHub Actions workflow that deploys contents of the `frontend` folder to GitHub Pages (gh-pages branch) on each push to `main`.
- After pushing to GitHub, enable Pages in repository settings (or let the workflow create `gh-pages` branch automatically).

Host backend (recommended options)
- GitHub Pages only hosts static sites. For the backend choose a PaaS:
  - Render (recommended free tier): quick `git push` to a Render service and set `node backend/server.js` as start command.
  - Railway / Fly / Heroku: similar quick-deploy from GitHub.

Quick Render steps (summary):
1. Create an account at https://render.com
2. Create a new Web Service and connect your GitHub repo
3. Set build command: `npm install`
4. Set start command: `node backend/server.js` (Render will set `PORT` env var; the demo server uses 3000 by default)
5. Add any environment variables (none needed for demo)

Security & production notes
- This demo uses in-memory storage and a non-production auth endpoint; do not use as-is in production.
- Add a real database and proper authentication before exposing any user data.

If you want, I can:
- Create the git commits in the workspace for you to review (I cannot push to your GitHub) or
- Walk you through creating the remote and pushing (I provide exact commands), or
- Help deploy the backend to Render and configure a domain.

Which of these should I do next?
- "Init local git" — I will run `git init` and create an initial commit inside the workspace (you still must push to your GitHub remote).
- "Create GH Action and finalize" — I added a workflow; I can customize it or add backend CI.
- "Deploy backend to Render" — I can prepare a `render.yaml` or detailed steps for deployment.
