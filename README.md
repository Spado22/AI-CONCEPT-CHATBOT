# 🤖 AI-CONCEPT-CHATBOT
### Production-Grade Agentic AI Platform for South African Digital Services

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai&logoColor=white)](https://openai.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🧬 Project Overview

The **AI Concept Chatbot** is not a simple chatbot — it is a **full-stack, production-grade Agentic AI Platform** built to serve three distinct South African digital use-cases:

| Module | Name | Purpose |
|:---|:---|:---|
| 🏛️ **MuniFix** | Civic Issue Reporter | Converts citizen complaints into formal, constitutionally-referenced municipal reports |
| 🛒 **SpazaAI** | SME TaxMate | SARS Turnover Tax advisor for informal traders |
| 🗺️ **QueueLess** | Gov Services Concierge | Step-by-step DHA / SASSA / Home Affairs navigation guides |

Every module is powered by a shared **AI Orchestrator** (`core/ai_orchestrator.py`) that routes queries to GPT-4o with domain-specific system prompts, enabling the same underlying model to serve radically different expert roles without a single fine-tuning step.

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Web / WhatsApp)                      │
└──────────────────────────┬───────────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼───────────────────────────────────────────┐
│                     FastAPI Application Server                       │
│  ┌────────────────┐  ┌──────────────────┐  ┌──────────────────────┐ │
│  │  /munifix      │  │  /spaza-ai       │  │  /queueless          │ │
│  │  Civic Reports │  │  Tax Advice      │  │  Gov Concierge       │ │
│  └───────┬────────┘  └────────┬─────────┘  └─────────┬────────────┘ │
│          └────────────────────▼────────────────────────┘             │
│                    ┌──────────────────────┐                          │
│                    │  AI Orchestrator     │                          │
│                    │  (ai_orchestrator.py)│                          │
│                    └──────────┬───────────┘                          │
└───────────────────────────────┼──────────────────────────────────────┘
                                │
          ┌─────────────────────▼─────────────────────┐
          │           Agentic Layer                   │
          │  Observability → Evaluation → Reflection  │
          │  ReAct Planner → HITL → Memory            │
          │  Web Search → Multi-Agent Coordinator     │
          └─────────────────────┬─────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │      OpenAI API       │
                    │  (GPT-4o / Embeddings)│
                    └───────────────────────┘
```

---

## 🧠 Agentic Layer — Core Components

The `apps/api/app/core/agent/` package implements a production-grade **8-pattern Agentic Stack**. These are not experimental abstractions — they mirror the agent frameworks used in enterprise AI systems like Microsoft AutoGen and LangGraph.

### 1. `observability.py` — Trace, Log & Metrics
Every action the agent takes is wrapped in a unique **TraceID** (UUID-based). This enables you to reconstruct the exact sequence of decisions, tool calls, and LLM responses for a given request — critical for debugging and auditing in production.

```python
trace = AgentObserver.start_trace("complaint_report_generation")
# ... your agent logic here ...
AgentObserver.end_trace(trace, status="success", result_metadata={"chars": 1280})
```

### 2. `evaluation.py` — Response Quality & Safety Scoring
After each LLM response is generated, the `AgentEvaluator` automatically scores it against **quality** and **safety** dimensions. Responses that fail the threshold trigger the self-correction loop rather than being returned to the user.

| Dimension | Check | Deduction |
|:---|:---|:---|
| Quality | Response length < 10 chars | -50 pts |
| Quality | Agent expresses uncertainty | -30 pts |
| Safety | Unsafe keywords detected (`hack`, `exploit`) | -100 pts (instant fail) |

### 3. `reflection.py` — Self-Correcting Retry Loops
Implements **ReAct-style self-correction**. When an evaluation fails, the agent does not simply raise an error. It appends a correction instruction to its original prompt and retries up to `max_retries` times, each time noting the specific failure reason.

```python
result = await AgentReflector.self_correcting_execute(
    prompt="Generate a formal municipal report for: pothole on main road",
    execute_fn=ai_orchestrator.process,
    max_retries=2
)
```

### 4. `react_planner.py` — ReAct Planning Framework
The **ReAct (Reasoning + Acting)** framework is a hallmark of modern agentic systems. When given a complex goal, the planner calls the LLM to decompose it into a JSON array of sub-steps, then executes each step sequentially, accumulating a full trace of intermediate results.

### 5. `hitl.py` — Human-in-the-Loop Approval Gates
For high-risk agent actions (e.g., submitting a formal legal complaint, triggering bulk database operations), the system pauses and routes the decision to a **human approval gate**. In a deployed environment, this sends a notification to an admin dashboard and waits for a webhook callback.

```python
approved = HumanInTheLoop.require_approval({
    "action": "submit_formal_complaint",
    "target": "City of Tshwane",
    "risk_level": "high"
})
```

### 6. `memory.py` — Short-Term Agent Memory
Implements an in-session memory store (a typed Python list) that the agent can use to remember context across multiple turns without depending on the LLM's context window. Key-value based `remember` / `recall` interface.

### 7. `web_search.py` — Autonomous Web Research Tool
The Web Search Agent connects to **SerpAPI** (or your configured search provider) to autonomously retrieve real-time information from the web. Falls back to a mock mode when no API key is configured, making local development seamless.

### 8. `multi_agent.py` — Parallel Multi-Agent Coordinator
Orchestrates multiple agent tasks concurrently using **`asyncio.gather`** — the Python equivalent of goroutine parallelism. A supervisor agent decomposes a goal and dispatches sub-tasks to specialized executor agents, aggregating results.

---

## 📁 Repository Structure

```text
AI-CONCEPT-CHATBOT/
│
├── apps/
│   ├── api/                        # Python FastAPI Backend
│   │   ├── app/
│   │   │   ├── api/                # Route handlers (munifix, spaza, queueless)
│   │   │   ├── core/
│   │   │   │   ├── agent/          # 🧠 Full Agentic Stack (8 modules)
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── observability.py
│   │   │   │   │   ├── evaluation.py
│   │   │   │   │   ├── reflection.py
│   │   │   │   │   ├── react_planner.py
│   │   │   │   │   ├── hitl.py
│   │   │   │   │   ├── memory.py
│   │   │   │   │   ├── web_search.py
│   │   │   │   │   └── multi_agent.py
│   │   │   │   ├── ai_orchestrator.py  # Central AI Brain
│   │   │   │   ├── config.py
│   │   │   │   ├── database.py
│   │   │   │   ├── rbac.py
│   │   │   │   └── security.py
│   │   │   ├── models/             # SQLAlchemy ORM models
│   │   │   ├── repositories/       # DB access layer
│   │   │   ├── schemas.py          # Pydantic request/response schemas
│   │   │   └── main.py             # Application entry point
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   └── web/                        # Frontend Application
│
├── infra/                          # Infrastructure as Code
├── docker-compose.yml              # Full stack orchestration
├── .env.example                    # Environment variable template
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Before running this project, ensure you have the following installed and configured:

| Dependency | Version | Purpose |
|:---|:---|:---|
| Docker | 24.x+ | Container orchestration |
| Docker Compose | v2.x+ | Multi-service management |
| Python | 3.11+ | Backend runtime |
| Node.js | 20 LTS | Frontend development |
| OpenAI API Key | — | LLM & Embedding access |

### Installation

**1. Clone the repository:**
```bash
git clone https://github.com/Raphasha27/AI-CONCEPT-CHATBOT.git
cd AI-CONCEPT-CHATBOT
```

**2. Configure environment variables:**
```bash
cp .env.example .env
```

Open `.env` and fill in your credentials. The minimum required configuration is:
```env
OPENAI_API_KEY="sk-..."
DATABASE_URL="postgresql+asyncpg://user:password@db:5432/chatbot_db"
SECRET_KEY="your-secret-key-here"
```

**3. Start all services with Docker:**
```bash
docker-compose up -d
```

This will spin up:
- `api` — FastAPI backend on port `8000`
- `db` — PostgreSQL database on port `5432`
- `web` — Frontend on port `3000`

**4. Run database migrations:**
```bash
docker-compose exec api alembic upgrade head
```

**5. Verify the API is live:**
```bash
curl http://localhost:8000/health
# Expected: {"status": "ok", "version": "1.0.0"}
```

---

## 🔌 API Endpoints

### MuniFix — Civic Complaints

```http
POST /api/v1/munifix/report
Content-Type: application/json

{
  "category": "infrastructure",
  "description": "Large pothole on Jan Smuts Avenue blocking traffic",
  "location": "Sandton, Johannesburg",
  "urgency": "high"
}
```

**Response:** A formally structured municipal report citing the South African Constitution, Section 152 (Objects of Local Government), and the Municipal Systems Act.

### SpazaAI — Tax Advice

```http
POST /api/v1/spaza/tax-advice
Content-Type: application/json

{
  "annual_turnover": 850000,
  "business_type": "spaza_shop",
  "province": "Gauteng"
}
```

**Response:** Structured JSON with `tips`, `warnings`, and a plain-language bracket explanation targeting the SARS Turnover Tax regime.

### QueueLess — Government Services

```http
POST /api/v1/queueless/guide
Content-Type: application/json

{
  "service": "smart_id_application",
  "has_existing_id": false,
  "province": "Western Cape"
}
```

**Response:** A step-by-step checklist specifying required documents (originals vs. copies), office locations, and estimated processing times.

---

## 🔒 Security Architecture

The platform implements multiple layers of security to protect agent interactions:

1.  **JWT Authentication:** All API routes are protected by bearer token authentication. Tokens are signed with `HS256` and expire after the configured `ACCESS_TOKEN_EXPIRE_MINUTES`.
2.  **Role-Based Access Control (RBAC):** Defined in `core/rbac.py`. Roles include `user`, `agent`, and `admin`, each with distinct permission sets.
3.  **Agent Authorization Gates:** The agentic layer's `hitl.py` intercepts high-risk agent actions before execution, requiring explicit approval.
4.  **Input Sanitization:** All user inputs are validated via Pydantic schemas before reaching the AI orchestrator, preventing prompt injection vectors.
5.  **Structured Audit Logging:** The `observability.py` module logs every agent action with a TraceID to `structlog`, enabling full post-mortem analysis of any incident.

---

## 🧪 Testing

```bash
# Run the full test suite
docker-compose exec api pytest tests/ -v

# Run a specific test module
docker-compose exec api pytest tests/test_orchestrator.py -v

# Run the stress test to benchmark throughput
docker-compose exec api python sizweos_stress_test.py
```

---

## 🔧 Troubleshooting

### Issue: Agent returns empty or very short responses
**Cause:** The OpenAI API key may be invalid or rate-limited.
**Fix:** Verify your key in `.env` and check your [OpenAI usage dashboard](https://platform.openai.com/usage).

### Issue: Database connection refused
**Cause:** The `db` container may not be ready before the `api` container starts.
**Fix:**
```bash
docker-compose restart api
# Or add a healthcheck dependency in docker-compose.yml
```

### Issue: `AgentEvaluator` marks responses as failed even when they look correct
**Cause:** The safety keyword list in `evaluation.py` may be triggering on legitimate content.
**Fix:** Review and adjust the `unsafe_keywords` list in `evaluation.py` for your specific domain.

---

## 🗺️ Roadmap

- [ ] Add WhatsApp Business API integration for direct citizen messaging
- [ ] Implement long-term PostgreSQL-backed memory for persistent agent state
- [ ] Add a React dashboard for real-time agent trace visualization
- [ ] Deploy to Vercel (frontend) + Railway (backend) for zero-cost production hosting
- [ ] Integrate Wazuh for real-time SIEM monitoring of agent activity

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Please follow these steps:

1.  Fork the repository.
2.  Create a feature branch: `git checkout -b feat/your-feature`
3.  Commit your changes: `git commit -m 'feat: add new capability'`
4.  Push to the branch: `git push origin feat/your-feature`
5.  Open a Pull Request.

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

*Developed as part of the **Future AGI** ecosystem by **Koketso Raphasha (Raphasha27)**.*
*Part of the Kirov Dynamics Technology portfolio.*
