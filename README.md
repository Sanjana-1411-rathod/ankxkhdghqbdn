# 👗 ANKAN Garments AI Store Manager — React Edition

Rebuilt from Streamlit → **React + FastAPI** for scalability.

```
ankan-garments-react/
├── frontend/          ← React (Vite) app
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Sidebar.jsx        # Upload, settings, actions
│   │   │   ├── HeroBanner.jsx     # Top banner
│   │   │   ├── MetricsRow.jsx     # 4 stat cards
│   │   │   ├── ChatPanel.jsx      # Main chat UI
│   │   │   └── QuickActions.jsx   # Quick insight buttons
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/           ← FastAPI Python server
│   ├── main.py        # REST API (replaces Streamlit)
│   ├── src/
│   │   ├── llm.py               # Groq LLM handler
│   │   ├── document_processor.py # CSV/Excel/PDF parser
│   │   └── vector_store.py       # FAISS vector index
│   ├── data/          # Put your CSV/Excel files here
│   └── requirements.txt
│
├── firebase.json      # Firebase Hosting config
└── README.md
```

---

## 🚀 Running Locally

### 1. Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API runs at: http://localhost:8000

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
App runs at: http://localhost:5173

---

## 🔥 Deploy to Firebase

### Frontend
```bash
cd frontend
npm run build          # builds to frontend/dist/

npm install -g firebase-tools
firebase login
firebase init           # choose Hosting, use existing firebase.json
firebase deploy
```

### Backend (choose one)
| Option | Command |
|--------|---------|
| **Railway** | `railway up` in /backend |
| **Render** | Connect GitHub repo → Web Service → `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Google Cloud Run** | `gcloud run deploy` |
| **VPS/DigitalOcean** | `uvicorn main:app --host 0.0.0.0 --port 8000` |

After deploying backend, update `vite.config.js` proxy target to your backend URL,
OR set `VITE_API_URL` env variable and use it instead of `/api`.

---

## ⚙️ Environment Variables

### Backend
```
GROQ_API_KEY=gsk_...    # Your Groq API key
```

### Frontend (optional)
```
VITE_API_URL=https://your-backend.railway.app
```

---

## 💬 Why React Instead of Streamlit?

| Feature | Streamlit | React + FastAPI |
|---------|-----------|-----------------|
| Scalability | ❌ Single process | ✅ Horizontal scaling |
| Concurrent users | ❌ Limited | ✅ Unlimited |
| Custom UI | ❌ Limited | ✅ Full control |
| Deploy options | ❌ Streamlit Cloud only | ✅ Firebase, Vercel, Railway, etc. |
| API separation | ❌ Coupled | ✅ Independent frontend/backend |
| Mobile friendly | ❌ Poor | ✅ Fully responsive |
