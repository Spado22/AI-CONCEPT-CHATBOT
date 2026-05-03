import structlog
from typing import Any, Dict, List

log = structlog.get_logger()

class AgentMemory:
    """
    Agent Memory System with short-term (in-session) and long-term (persistent store) memory.
    """

    def __init__(self):
        self._short_term: List[Dict[str, Any]] = []

    def remember(self, key: str, value: Any):
        """Store a fact in short-term memory."""
        entry = {"key": key, "value": value}
        self._short_term.append(entry)
        log.info("memory_stored", key=key)

    def recall(self, key: str) -> Any:
        """Retrieve the most recent value for a key from short-term memory."""
        for entry in reversed(self._short_term):
            if entry["key"] == key:
                log.info("memory_recalled", key=key)
                return entry["value"]
        log.warning("memory_not_found", key=key)
        return None

    def dump(self) -> List[Dict[str, Any]]:
        """Return all short-term memory entries."""
        return self._short_term

    def clear(self):
        """Flush short-term memory."""
        self._short_term = []
        log.info("memory_cleared")


# Global singleton for short-term memory per-request
_agent_memory = AgentMemory()


def get_agent_memory() -> AgentMemory:
    return _agent_memory
