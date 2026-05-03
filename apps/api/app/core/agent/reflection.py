import structlog
from typing import Dict, Any, Callable, Awaitable
from app.core.agent.evaluation import AgentEvaluator

log = structlog.get_logger()

class AgentReflector:
    @staticmethod
    async def self_correcting_execute(
        prompt: str,
        execute_fn: Callable[[str], Awaitable[str]],
        max_retries: int = 2
    ) -> str:
        current_prompt = prompt
        
        for attempt in range(max_retries + 1):
            log.info("agent_execution_attempt", attempt=attempt + 1)
            response = await execute_fn(current_prompt)
            
            if not response:
                log.warning("agent_returned_empty_response")
                response = "Error: empty response"

            evaluation = AgentEvaluator.evaluate_response(current_prompt, response)
            
            if evaluation["passed"]:
                log.info("agent_execution_successful")
                return response
            
            if attempt < max_retries:
                log.warning("agent_self_correcting", issues=evaluation["issues"])
                correction_instruction = f"\n\nSystem Note: Previous attempt failed due to: {', '.join(evaluation['issues'])}. Please correct this and try again."
                current_prompt += correction_instruction
            else:
                log.error("agent_execution_failed_after_retries")
                return f"[AGENT FAILURE]: Unable to generate a satisfactory response after {max_retries} retries. Issues: {evaluation['issues']}"
