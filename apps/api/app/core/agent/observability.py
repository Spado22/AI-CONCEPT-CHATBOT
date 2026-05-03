import structlog
import uuid
import time
from typing import Dict, Any

log = structlog.get_logger()

class AgentObserver:
    @staticmethod
    def start_trace(operation_name: str) -> Dict[str, Any]:
        trace_id = str(uuid.uuid4())
        log.info("agent_trace_started", trace_id=trace_id, operation=operation_name)
        return {
            "trace_id": trace_id,
            "operation": operation_name,
            "start_time": time.time(),
            "metrics": {}
        }

    @staticmethod
    def end_trace(trace: Dict[str, Any], status: str, result_metadata: Dict[str, Any] = None):
        duration = time.time() - trace["start_time"]
        log.info(
            "agent_trace_completed",
            trace_id=trace["trace_id"],
            operation=trace["operation"],
            duration_sec=duration,
            status=status,
            metadata=result_metadata or {}
        )
