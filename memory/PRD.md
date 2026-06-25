# IMEX AI — Import/Export Cost Intelligence Platform

## Problem Statement
Premium SaaS platform for Australia–India and global import/export trade. Helps traders
model landed costs, compare import vs local sourcing, project profit/ROI, scan live trade
opportunities, and get AI advisory — all in a luxury glassmorphic gold design system.

## Tech Stack
- Frontend: React 19 + CRA/CRACO, TailwindCSS, framer-motion, recharts, lucide-react
- Backend: FastAPI + Motor (MongoDB)
- AI: Claude Sonnet 4.6 via Emergent LLM key (emergentintegrations), SSE streaming
- Design: dark luxury theme, Fraunces (display) + Manrope (body), amber/gold accents
  (#c8a96e, #eab308), glassmorphism tokens (.glass / .glass-card / .glass-gold), hover lift + inner glow

## Architecture
- `/` Landing (cinematic golden-hour cargo-ship hero + glass card + features)
- AppShell (sidebar + outlet) wraps the workspace routes:
  - `/dashboard` Overview — stats, volume chart, top opportunities
  - `/calculator` Landed Cost Engine
  - `/import-vs-local` Import vs Local comparison
  - `/profit-mode` Profit / margin / ROI model
  - `/opportunities` Opportunity Scanner (search/filter)
  - `/assistant` AI Trade Assistant (streaming chat, persistent history)
- Backend endpoints (all under /api): dashboard/stats, opportunities,
  calculator/landed-cost, calculator/import-vs-local, calculator/profit-mode,
  assistant/chat (SSE), assistant/history/{session_id}
- MongoDB: `opportunities` (auto-seeded, 10 docs), `chat_messages`

## Status — Implemented (2026-06-25)
- Full from-scratch build of all 7 pages with unified luxury glassmorphism design system
- All 5 calculators/data endpoints working; AI Assistant streaming + history persistence
- Backend pytest 10/10; frontend e2e 100% (iteration_1 + iteration_2)
- Fixed AIAssistant SSE race condition (history-seed guard + defensive reducers)
- `yarn build` compiles clean (250.6 kB gz js, 11.31 kB gz css)

## Backlog / Next Action Items
- P1: Auth (JWT or Google) to gate the workspace + per-user saved scenarios
- P1: Persist calculator results & let users save/export reports (PDF/CSV)
- P2: Real duty/HS-code + FX data integration (currently seeded/estimated)
- P2: Migrate FastAPI on_event -> lifespan handlers
- P2: Mobile sidebar / responsive nav drawer (sidebar currently lg+ only)
- P3: Mid-stream chat checkpointing so partial replies persist on disconnect
