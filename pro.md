CODEDNA — PROJECT WORKFLOW & TECHNICAL OVERVIEW
================================================

WHAT CODEDNA DOES
------------------
CodeDNA is an AI-powered Software Architecture & Code Evolution Platform.
A user submits a GitHub repository or uploads a ZIP file, and the system
analyzes it end-to-end: extracts code metrics, builds a dependency graph,
predicts bug-prone/risky files, scores maintainability, generates an
optimized refactoring plan, explains its own predictions, and
auto-generates documentation — all shown on an interactive dashboard.


TECH STACK
----------

Frontend:
- React (Vite build tool)
- JavaScript (no TypeScript)
- Tailwind CSS v4
- DaisyUI (component styling on top of Tailwind)
- React Router (page navigation)
- Axios (API calls)
- Recharts (charts)
- React Flow (architecture graph visualization)
- Cytoscape.js (dependency graph visualization)
- Framer Motion (animation)

Backend:
- Node.js + Express 5
- ES Modules ("type": "module" — import/export syntax)
- MongoDB Atlas + Mongoose (database)
- JWT (jsonwebtoken) + bcryptjs (authentication)
- Multer (ZIP file uploads)
- Morgan (request logging)
- express-validator (input validation)
- express-rate-limit (rate limiting)
- cross-env (cross-platform env variables)

AI Service:
- Python + FastAPI + Uvicorn
- scikit-learn (Random Forest — trained ML model)
- NetworkX (knowledge graph + graph algorithms)
- SHAP (explainable AI)
- scikit-fuzzy (fuzzy logic maintainability scoring)
- DEAP (genetic algorithm for refactor planning)
- Ollama running Qwen2.5-Coder (local LLM for documentation generation)
- slowapi (rate limiting)
- joblib, pandas, numpy (model persistence + data handling)
- pydantic (request/response validation)


ARCHITECTURE — HOW THE THREE SERVICES CONNECT
-----------------------------------------------
Frontend (React)  --->  Backend (Express, port 5000)  --->  AI Service (FastAPI, port 8000)
     |                          |                                    |
  User Interface          Auth, DB, Orchestration          AI / ML / Soft Computing engine
  (dashboard, forms)       (MongoDB Atlas)                  (parsing, graphs, ML, LLM)

The frontend never talks to the AI service directly — the backend is the
only orchestrator. This keeps auth, rate limiting, and data storage
centralized in one place.


END-TO-END WORKFLOW
--------------------
1. User registers/logs in (backend issues a JWT)
2. User submits a GitHub URL or uploads a ZIP (backend saves repo metadata to MongoDB)
3. User clicks "Analyze" — backend creates an AnalysisResult record with
   status "pending", then runs an async pipeline that calls the AI
   service in this order:

     a. POST /parse    — clone/extract repo, extract per-file code metrics
     b. POST /predict   — trained ML model scores bug risk per file
     c. POST /fuzzy     — fuzzy logic computes maintainability score per file
     d. POST /genetic   — genetic algorithm generates an optimized refactor plan
     e. POST /explain    — SHAP explains why each file was scored risky
     f. POST /llm        — local LLM generates a summary, README, and insights

4. Each AI service response is stored back into the AnalysisResult
   document in MongoDB; status flips to "completed" (or "failed" with
   an error message if any step breaks)
5. Frontend fetches the final report from the backend and renders it as
   an interactive dashboard — dependency graph, risk list, maintainability
   score, refactor plan, and AI-generated documentation


BACKEND ENDPOINTS (Express, port 5000)
----------------------------------------
GET    /health
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                          (protected)
POST   /api/repos/github                     (protected — import via GitHub URL)
POST   /api/repos/upload                     (protected — import via ZIP)
GET    /api/repos                            (protected — list user's repos)
GET    /api/repos/:id                        (protected)
POST   /api/analysis/:repoId/start           (protected — kicks off the AI pipeline)
GET    /api/analysis/:id                     (protected — check analysis status/result)
GET    /api/analysis/repo/:repoId            (protected — all analyses for a repo)
GET    /api/reports/:analysisId              (protected — full assembled report)
POST   /api/reports/:analysisId/refactor-plan (protected — materialize GA output into tracked steps)
PATCH  /api/reports/refactor-plan/:planId/step/:stepId  (protected — mark a refactor step done)


AI SERVICE ENDPOINTS (FastAPI, port 8000)
--------------------------------------------
GET    /health
POST   /parse     — clones/extracts a repo, returns per-file metrics
                     (lines of code, function count, import count, complexity)
POST   /graph     — builds a dependency graph from parsed metrics using
                     NetworkX, detects circular dependencies
POST   /fuzzy     — computes a 0-100 maintainability score per file using
                     hand-written fuzzy logic rules (no training involved)
POST   /genetic   — runs a genetic algorithm (DEAP) to find the optimal
                     order of refactoring actions (Extract Method, Split
                     Class, Reduce Coupling, Rename Variables)
POST   /predict   — predicts bug probability and risk level (Low/Medium/
                     High) per file using a TRAINED Random Forest model
POST   /explain   — uses SHAP to explain each file's risk prediction with
                     human-readable reasons (e.g. "High Cyclomatic Complexity")
POST   /llm       — generates a project summary, README, and insights using
                     a local LLM (Ollama + Qwen2.5-Coder)


MODELS / AI TECHNIQUES USED — ENDPOINT BY ENDPOINT
------------------------------------------------------
/parse    -> No model. Static regex-based code parsing.
/graph    -> No model. Pure graph algorithms (NetworkX: BFS/DFS/cycle detection).
/fuzzy    -> No trained model. Hand-engineered Fuzzy Logic rules (scikit-fuzzy) —
             Low/Medium/High membership functions for complexity and coupling,
             9 inference rules, Mamdani-style fuzzy control system.
/genetic  -> No trained model. Genetic Algorithm (DEAP) — searches refactor-
             action orderings using crossover, mutation, and tournament
             selection across 40 generations.
/predict  -> TRAINED MODEL: Random Forest Classifier (scikit-learn).
             Trained on 2,664 real code files collected from 17 public
             GitHub repositories (Express, axios, lodash, mocha, chai,
             moment, socket.io, zod, zustand, and others).
             Labels were generated via weak supervision: a file is
             labeled "risky" if 2+ of its commits contain fix/bug-related
             keywords making up 30%+ of its commit history.
             Result: 76.4% accuracy, 73% recall on the risky class
             (class_weight="balanced" used to handle the natural
             85/15 clean/risky imbalance in real-world code).
/explain  -> SHAP (SHapley Additive exPlanations) — explains the trained
             Random Forest's predictions per file, no separate training.
/llm      -> Ollama running Qwen2.5-Coder locally (free, open-source,
             ~4.7GB model). Used via prompting only — NOT fine-tuned.
             Given a text summary of the repo's metrics and asked to
             generate structured JSON (summary, README, insights).


TRAINING PIPELINE (offline, not part of the live API)
---------------------------------------------------------
ai-service/training/label_from_git_history.py
   -> clones real repos, reads commit history, labels files risky/clean,
      saves training_data.csv

ai-service/training/train_bug_predictor.py
   -> loads the CSV, splits 80/20 train/test, trains the Random Forest
      with class_weight="balanced", evaluates it, saves the trained
      model to app/models/bug_predictor.pkl

ai-service/app/services/ml_service.py
   -> loads bug_predictor.pkl once at startup, uses it to serve real-time
      predictions via the /predict endpoint


CURRENT STATUS
---------------
Backend:     Fully complete (auth, repo import, analysis orchestration,
             reports, hardening) — tested end-to-end.
AI Service:  Fully complete — all 7 AI/ML endpoints live and tested with
             real trained model + real LLM, plus rate limiting and proper
             error handling.
Frontend:    Not yet built — folder structure scaffolded only.
Deployment:  Currently runs locally only (localhost URLs). Deployment
             plan: Vercel (frontend, Root Directory = frontend/) + Render
             (backend + ai-service, via render.yaml with rootDir per
             service). Ollama/LLM hosting still needs a decision at
             deployment time since local LLMs don't run on free hosting tiers.