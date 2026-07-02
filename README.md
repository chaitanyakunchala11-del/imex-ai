# IMEX AI — Import/Export Cost Intelligence Platform

A premium SaaS platform for Australia–India and global import/export trade. Model landed
costs, compare import vs local sourcing, project profit/ROI, scan live trade opportunities,
and get AI trade advisory — all wrapped in a luxury glassmorphic gold design system.

## Tech Stack
- **Frontend**: React 19 (CRA + CRACO), TailwindCSS, framer-motion, recharts, lucide-react
- **Backend**: FastAPI + Motor (async MongoDB)
- **AI**: Claude Sonnet 4.6 via the `emergentintegrations` library (SSE streaming)
- **Database**: MongoDB
- **Fonts**: Fraunces (display) + Manrope (body); accents `#c8a96e` and `#eab308`

## Project Structure
```
/
├── backend/
│   ├── server.py            # FastAPI app + all /api routes
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.js           # Router + AppShell layout
│   │   ├── index.css        # Design system (glassmorphism, gold tokens, fonts)
│   │   ├── pages/           # Landing, Dashboard, LandedCost, ImportVsLocal,
│   │   │                    #   ProfitMode, OpportunityScanner, AIAssistant
│   │   ├── components/      # GlassCard, PageHeader, Field, layout/Sidebar
│   │   ├── lib/api.js       # axios + streaming fetch helpers
│   │   └── constants/testIds/  # data-testid registry
│   ├── package.json
│   ├── tailwind.config.js
│   ├── craco.config.js
│   └── .env.example
├── memory/PRD.md
└── README.md
```

## Prerequisites
- Node.js 18+ and Yarn
- Python 3.11+
- A running MongoDB instance (local or Atlas)
- An LLM key for the AI Assistant (Emergent universal key, or your own Anthropic key)

## Setup

### 1. Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# emergentintegrations comes from a custom index:
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
cp .env.example .env      # then edit values (MONGO_URL, DB_NAME, EMERGENT_LLM_KEY)

# run
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Frontend
```bash
cd frontend
yarn install
cp .env.example .env      # set REACT_APP_BACKEND_URL to your backend URL
yarn start                # dev server on :3000
# or
yarn build                # production build in /build
```

## Notes
- All backend routes are prefixed with `/api`.
- On first startup the backend auto-seeds 10 trade opportunities into MongoDB.
- Opportunity data is seeded and FX/duty/freight rates are **estimates** (category + route
  based), not a live data feed — swap in a real duty/HS-code + FX API for production.
- The AI Assistant uses `claude-sonnet-4-6`; change the model in `server.py`
  (`chat.with_model(...)`) if desired.
- No authentication is included yet.

## Key API Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| GET  | `/api/dashboard/stats` | Dashboard stats + top opportunities |
| GET  | `/api/opportunities` | All trade opportunities |
| POST | `/api/calculator/landed-cost` | Landed cost + duty + freight + margin |
| POST | `/api/calculator/import-vs-local` | Import vs local comparison |
| POST | `/api/calculator/profit-mode` | Profit / margin / ROI |
| POST | `/api/assistant/chat` | AI assistant (SSE stream) |
| GET  | `/api/assistant/history/{session_id}` | Chat history |

## License
Proprietary — © IMEX AI.
