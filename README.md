# ⵔⵉⴽⵓ — Tarifit RHQ Corpus

A full-stack web app for collecting, classifying, and exploring Tarifit Berber rhetorical questions (RHQs).

## Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Image Generation**: Hugging Face FLUX.1-schnell (free)

## Setup

### Backend
```bash
cd backend
npm install
node server.js
```
Runs at http://localhost:3001

**Set your Hugging Face token** in `backend/routes/admin.js` line 12:
```js
const HF_TOKEN = "your_hf_token_here";
```

### Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Runs at http://localhost:5173

## Admin
- URL: http://localhost:5173/admin/login
- Username: `admin`
- Password: `rhq2024`

## Admin Workflow
1. **Pending** → review submission, edit fields if needed → **Approve**
2. **Needs illustration** → click **🎨 Generate** → preview image → **Regenerate** if needed → **Publish**
3. **Approved** → visible on public cards, can regenerate illustration anytime

## Features
- Swipeable card carousel with Function + Act filters
- Public submission form (Tarifit text required, rest optional)
- Admin dashboard: review, edit, approve, generate illustration, publish
- Batch select + permanent delete
- CSV import + export for ML training
- Images saved as files (no base64 URI issues)

## Azure Deployment
1. `cd frontend && npm run build`
2. Add to `backend/server.js`: `app.use(express.static(path.join(__dirname, '../frontend/dist')))`
3. Deploy backend to Azure App Service (Node.js runtime)
4. Set `ANTHROPIC_API_KEY` or `HF_TOKEN` in App Service environment variables
