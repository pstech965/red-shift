# Don't Touch Run ⚡ — Cyber Arcade Runner

> Fast-paced neon cyber survival game built with React 19, Vite, Web Audio API, and CSS animations.

---

## 🎮 How to Play
* **Objective**: Dodge falling red hazard debris and collect glowing green energy cores to earn score.
* **Survival Escalation**: Hazard falling speed and spawn frequencies scale every 10 seconds survived.
* **Controls**:
  * **Desktop**: `WASD` or `Arrow Keys` to move • `P` to Pause • `M` to Mute Audio • `Space` / `Enter` to Restart
  * **Mobile / Tablet**: Touch the on-screen tactile D-Pad or drag your finger directly across the game arena.

---

## 🚀 Deployment to GitHub Pages

This project is pre-configured for automated zero-config deployment to GitHub Pages via **GitHub Actions** (`.github/workflows/deploy.yml`) and relative asset paths (`base: './'`).

### Quick Setup Steps:
1. **Create a new repository on GitHub**:
   - Go to [GitHub New Repository](https://github.com/new).
   - Name your repository (e.g., `dont-touch-run` or `neon-hazard`).
   - Do **NOT** initialize with README (this project already has one).

2. **Link and push your local code**:
   ```bash
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click **Settings** → **Pages** (in the left sidebar).
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.

4. **Live Link**:
   - GitHub Actions will automatically run the build and publish your game to:
   - `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`

---

## 🛠️ Local Development
```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```
