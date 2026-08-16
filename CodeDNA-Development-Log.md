# CodeDNA — Capstone Development Log

A detailed record of the planning and build process for **CodeDNA**, an AI-powered Software Architecture & Code Evolution Platform, built as a MERN + Python FastAPI monorepo.

---

## 1. Project Selection

Started by considering a few capstone directions (AgriAI, IoT smart agriculture, PLC/Verilog robotics) before settling on **CodeDNA** — chosen based on the user's own report and architecture diagram.

**What CodeDNA does:** analyzes a GitHub repo or uploaded ZIP and produces a full software intelligence report — architecture visualization, dependency graphs, bug-risk prediction, maintainability scoring, refactoring recommendations, and auto-generated documentation — combining AI/ML, Knowledge Graphs, Fuzzy Logic, Genetic Algorithms, and Explainable AI.

---

## 2. Free Stack & Model Plan

Reviewed the user's report and diagram to confirm which tools were genuinely specified vs. needed clarification:

| Component | Status in original doc | Free tool chosen |
|---|---|---|
| Bug/maintainability/tech-debt prediction | Named (Decision Tree, Random Forest, MLP) | `scikit-learn` + `tensorflow.keras` |
| Knowledge graph | Named (NetworkX, BFS/DFS) | `networkx` |
| Explainable AI | Named (SHAP or LIME) | `shap` |
| LLM documentation generation | Only in diagram, not written stack | `Ollama` running `qwen2.5-coder` locally |
| Fuzzy Logic | Concept named, no library | `scikit-fuzzy` |
| Genetic Algorithm | Concept named, no library | `DEAP` |
| Code parsing | Named (tree-sitter/Babel) | Simplified to regex-based parsing for buildability |

**Training data gap identified:** the original report never specified a training data source. Decided against PROMISE/NASA datasets (mismatched language — mostly Java/C) in favor of **self-labeled data from real GitHub repos**, using commit history ("fix"/"bug" commit frequency) as a free weak-supervision signal — a better fit since CodeDNA targets JS/TS specifically.

---

## 3. Repository Strategy

**Decision: single monorepo** (not 2, not 3 separate repos) containing `frontend/`, `backend/`, `ai-service/`.

Reasoning:
- Backend (npm) and AI service (pip) are different runtimes — a 2-repo split saves nothing
- 3 repos add coordination overhead not worth it for a small capstone team
- Deployment "confusion" concern solved without splitting repos:
  - **Vercel:** set **Root Directory** to `frontend` in Project Settings
  - **Render:** use `render.yaml` at repo root with `rootDir: backend` / `rootDir: ai-service` per service — both deploy independently from one repo

---

## 4. Folder Structure & Scaffolding

Full folder/file structures were designed for all three services, then scaffolded via Windows `.bat` scripts (empty files only, no code) so the user could generate the entire skeleton in seconds:

- `setup-backend.bat` → Express backend: `routes/`, `controllers/`, `models/`, `middleware/`, `config/`, `services/`, `utils/`
- `setup-ai-service.bat` → FastAPI service: `app/routers/`, `app/services/`, `app/schemas/`, `app/models/`, `app/utils/`, plus a separate `training/` folder for offline scripts
- `setup-frontend.bat` → React + Vite: `components/{common,dashboard,graph,layout}`, `pages/`, `hooks/`, `context/`, `services/`, `utils/`

---

## 5. Installations

**Backend:**
```
npm install express mongoose dotenv cors jsonwebtoken bcryptjs multer morgan nodemon
npm install axios
npm install express-validator express-rate-limit
npm install --save-dev cross-env
```

**Frontend:**
```
npm create vite@latest .        (React, JavaScript — not TypeScript)
npm install axios react-router-dom recharts reactflow cytoscape framer-motion
npm install tailwindcss @tailwindcss/vite
npm install daisyui
```

**AI Service:**
```
pip install fastapi uvicorn[standard] scikit-learn tensorflow networkx shap scikit-fuzzy deap tree-sitter pydantic python-dotenv
pip install ollama
```

**Ollama (separate application, not pip):** installed from ollama.com, model pulled via:
```
ollama pull qwen2.5-coder
```

**Key stack decisions confirmed along the way:**
- Backend uses **ES Modules** (`"type": "module"` in `package.json`) — `import`/`export` syntax throughout, not `require`
- Frontend uses **Tailwind CSS v4** (via `@tailwindcss/vite` plugin — no `postcss.config.js`/`tailwind.config.js` needed)
- Frontend is **plain JavaScript**, not TypeScript

---

## 6. Backend Development — Phases 0–5 (Complete)

Built in dependency order, each phase tested via Postman before moving on.

### Phase 0 — Base Server Setup
`config/env.js`, `config/db.js` (Mongoose connection), `app.js`, `server.js`, `/health` route, `errorHandler.js`, `logger.js`.

### Phase 1 — Authentication
`User` model, JWT-based register/login/me endpoints, bcrypt password hashing, `auth.js` protect middleware.

### Phase 2 — Repository Import
`Repository` model, GitHub URL import (via GitHub REST API) and ZIP upload (via multer), `githubService.js`.

### Phase 3 — Analysis Orchestration
`AnalysisResult` model, `aiServiceClient.js` (axios wrapper calling `/parse`, `/predict`, `/fuzzy`, `/genetic`, `/explain`, `/llm` on the AI service), async pipeline with pending/running/completed/failed status tracking.

### Phase 4 — Reports & Refactor Plans
`RefactorPlan` model with per-step status tracking, endpoints to assemble the final dashboard payload from stored analysis data.

### Phase 5 — Hardening
`express-validator` input validation on auth/repo routes, `express-rate-limit` (100 req/15min general, 10 req/15min on auth), CORS locked to `FRONTEND_URL`, refined error handler (CastError, duplicate key, ValidationError handling), dev/prod env separation via `cross-env`.

### Backend Troubleshooting Log
- **`ERR_MODULE_NOT_FOUND: axios`** — package was used in code before being installed; fixed with `npm install axios`
- **`secretOrPrivateKey must have a value`** — `.env` file had a missing/merged line (JWT_SECRET got lost); fixed by re-checking `.env` formatting and generating a fresh secret via `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **`querySrv ECONNREFUSED` (MongoDB Atlas)** — DNS SRV lookup failure, common Windows/network issue. Resolved by toggling off "SRV Connection String" in Atlas's connection dialog and using the standard `mongodb://` connection string with explicit shard hosts instead of `mongodb+srv://`
- Reminder: nodemon does **not** watch `.env` changes — requires manual `rs` restart after editing environment variables

### Backend Testing — Confirmed Working
Full flow verified via Postman: register → returns JWT → import GitHub repo (`expressjs/express`) → saved to MongoDB → listed via `GET /api/repos`. All passing.

---

## 7. AI Service Development — Phases 0–7 (Complete), Phase 8 In Progress

### Phase 0 — Base FastAPI Server Setup
`app/main.py`, `/health` endpoint, `config.py` for env loading, CORS restricted to backend URL. No installs, no models needed.

### Phase 1 — Repository Parsing & Metric Extraction
`/parse` endpoint. Clones GitHub repos (`git clone --depth 1`) or extracts ZIPs into a temp folder, walks `.js/.jsx/.ts/.tsx/.py` files (skipping `node_modules` etc.), extracts per-file metrics via regex: lines of code, function count, import count, complexity score. Cleans up temp folder after. No models — pure parsing logic.

**Tested against `expressjs/express`:** correctly returned per-file metrics for 141 files.

### Phase 2 — Knowledge Graph Engine
`/graph` endpoint using `networkx`. Extended the parser to capture actual import targets, then resolves relative imports (JS and Python path resolution logic) into a directed graph — nodes are files, edges are dependencies. Includes BFS/DFS-based helpers and `nx.simple_cycles()` for circular dependency detection.

**Tested against `expressjs/express`:** 141 nodes, 57 edges, 0 circular dependencies — correctly resolved relationships like `index.js → lib/express.js`.

### Phase 3 — Fuzzy Logic Maintainability Score
`/fuzzy` endpoint using `scikit-fuzzy`. Hand-built membership functions (Low/Medium/High) for complexity and coupling (using `import_count` as the coupling proxy, since graph-based coupling wasn't available at this layer), 9 inference rules covering every combination, Mamdani-style fuzzy control system producing a 0–100 score per file. No training — knowledge-engineered.

**Tested with a 3-file sample:** clean file → 86.22, average file → 50.00, messy file → 13.78 — confirmed clear, correct differentiation.

### Phase 4 — Genetic Algorithm Refactor Planner
`/genetic` endpoint using `DEAP`. Rule-based candidate action generation (Extract Method, Split Class, Reduce Coupling, Rename Variables) based on metric thresholds, then a genetic algorithm (`cxOrdered` crossover, `mutShuffleIndexes` mutation, tournament selection, 40 generations) searches for the best ordering — fitness rewards high impact/low effort actions placed earlier via a discount factor.

**Tested with the same 3-file sample:** correctly generated 0 actions for the clean file, 3 for the messy file, ordered sensibly by value (Reduce Coupling → Extract Method → Split Class → Rename Variables).

### Phase 5 — ML Risk Prediction (placeholder heuristic)
`/predict` endpoint. Since no trained model existed yet, built a weighted-formula heuristic (complexity 40%, size 25%, coupling 20%, function density 15%) producing a bug probability, risk level (Low/Medium/High), and technical debt score — matching the eventual real model's output shape so nothing upstream needs to change later.

**Tested with the same sample:** clean/average files → Low risk, messy file → High risk (0.935 probability) with by far the highest technical debt score. Correctly working as designed.

### Phase 6 — Explainable AI
`/explain` endpoint using `shap`. Wraps the Phase 5 prediction function as a black-box function SHAP can explain, using the batch itself as the background/comparison set. Returns per-file feature contributions and top 2 human-readable reasons (e.g. "High Cyclomatic Complexity").

**Integration fix along the way:** backend's `analysisController.js` was sending the `/predict` *output* into `/explain`, but `/explain` needs the raw *metrics* (SHAP needs original inputs, not final scores). Fixed by changing `explainPredictions(predictions)` → `explainPredictions(parsed.metrics)`.

**Tested with the same sample:** messy file correctly showed positive contributions across all features with "High Cyclomatic Complexity" and "Large File Size" as top reasons; the other two files showed negative contributions relative to the group average, correctly returning "No significant risk factors."

### Phase 7 — LLM Integration via Ollama
`/llm` endpoint. Installed Ollama (separate desktop application) and pulled `qwen2.5-coder` (4.7GB). Built a context-summarization function turning Phase 1's metrics into a text prompt, sent to the local model via the `ollama` Python package, requesting strict JSON output (summary, README, insights) with a fallback if the model doesn't follow the format exactly.

**Tested with the same sample:** model correctly followed JSON format, accurately identified the most complex file, and produced coherent, specific insights — no fallback needed.

**At this point, every endpoint the backend calls (`/parse`, `/graph`, `/fuzzy`, `/genetic`, `/predict`, `/explain`, `/llm`) was confirmed live and returning real data** — meaning a full end-to-end analysis run through the backend would complete successfully rather than fail.

### Phase 8 — Offline Training Pipeline (in progress)

**Goal:** replace Phase 5's heuristic with a genuinely trained Random Forest model.

**Step 1 — Weak-supervision labeling (`training/label_from_git_history.py`):** clones real GitHub repos, reads full commit history, labels a file "risky" if it has 2+ commits with fix/bug-related keywords making up 30%+ of its commit history, "clean" otherwise. Extracts the same 4 metrics used elsewhere (complexity, LOC, imports, function count) per file.

- **First run (4 repos):** hit a Windows-specific bug — `subprocess.run` defaulted to `cp1252` encoding, which crashed (`UnicodeDecodeError`) on non-ASCII characters in commit messages. Fixed by adding `encoding="utf-8", errors="replace"` to the subprocess call.
- **After fix, 4-repo run:** 169 rows, 23 risky / 146 clean.
- **Discussed scaling up:** 4 repos judged too small and too homogeneous (all same maintainer/style) for a real training set. Expanded to **18 independent, diverse repos** (Express ecosystem, axios, lodash, mocha, chai, moment, socket.io, zod, zustand, class-validator, etc.), and added `try/except` per-repo so one failed clone doesn't kill the whole run.
- **18-repo run result:** 2,664 total rows, 377 risky (14.2%) / 2,287 clean (85.8%) — one repo (`body-parser`) failed to clone but was correctly skipped without crashing the script.

**Step 2 — Training (`training/train_bug_predictor.py`):** 80/20 stratified train/test split, `RandomForestClassifier` with `class_weight="balanced"` to handle the class imbalance, evaluated via accuracy, classification report, confusion matrix, and feature importance, then saved to `app/models/bug_predictor.pkl` via `joblib`.

**Status at time of writing:** training script has been written and explained; the user has not yet run it and shared results. Discussed that 2,664 rows / 377 risky examples is a reasonable, real dataset size for a capstone (comparable to published academic bug-prediction datasets), and that the fix for class imbalance is `class_weight="balanced"`, not artificially padding the risky class by cherry-picking "buggy" repos. Decision on whether more data is needed was deferred until actual training results (specifically "Risky" class recall) are seen.

**Remaining work:** run `train_bug_predictor.py`, review results, wire the trained model into `ml_service.py` (replacing the Phase 5 heuristic — no API contract changes needed), then Phase 9 (Hardening — validation, CORS lock, error handling, matching backend's Phase 5 treatment).

---

## 8. Current Status Summary

**Backend:** ✅ Fully complete (Phases 0–5), tested end-to-end.

**AI Service:**
- ✅ Phase 0 — Base server
- ✅ Phase 1 — Repository parsing
- ✅ Phase 2 — Knowledge graph
- ✅ Phase 3 — Fuzzy logic maintainability
- ✅ Phase 4 — Genetic algorithm refactor planning
- ✅ Phase 5 — ML risk prediction (heuristic version, live)
- ✅ Phase 6 — Explainable AI
- ✅ Phase 7 — LLM integration (Ollama)
- 🔄 Phase 8 — Offline training pipeline (labeling done, training script ready, not yet run)
- ⬜ Phase 9 — Hardening

**Frontend:** Not yet started — scaffolded only (folder structure + empty files).

---

## 9. Key Reusable Commands

```powershell
# Generate a JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Run backend
npm run dev

# Run AI service
uvicorn app.main:app --reload --port 8000

# Confirm Ollama model installed
ollama list

# Run the labeling pipeline
python training/label_from_git_history.py

# Run model training
python training/train_bug_predictor.py
```

**FastAPI's auto-generated docs** at `http://localhost:8000/docs` was used throughout for testing every AI-service endpoint directly in the browser, without needing Postman.
