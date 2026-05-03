"""
=============================================================================
  AI-CONCEPT-CHATBOT — Agentic Layer Package
=============================================================================
This package implements a production-grade AI Agent architecture including:

  - observability.py   → Trace IDs, structured logging, duration metrics
  - evaluation.py      → Response quality & safety scoring
  - reflection.py      → Self-correcting retry loops
  - react_planner.py   → ReAct (Reason + Act) planning framework
  - hitl.py            → Human-in-the-Loop approval gates
  - memory.py          → Short-term and long-term agent memory
  - web_search.py      → Autonomous web search tool (SerpAPI)
  - multi_agent.py     → Parallel multi-agent coordinator
=============================================================================
"""

from .observability import AgentObserver
from .evaluation import AgentEvaluator
from .reflection import AgentReflector
from .react_planner import ReActPlanner
from .hitl import HumanInTheLoop
from .memory import AgentMemory, get_agent_memory
from .web_search import WebSearchTool
from .multi_agent import MultiAgentCoordinator, AgentTask

__all__ = [
    "AgentObserver",
    "AgentEvaluator",
    "AgentReflector",
    "ReActPlanner",
    "HumanInTheLoop",
    "AgentMemory",
    "get_agent_memory",
    "WebSearchTool",
    "MultiAgentCoordinator",
    "AgentTask",
]
