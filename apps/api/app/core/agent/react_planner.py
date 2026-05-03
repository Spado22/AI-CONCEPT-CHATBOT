import structlog
import json
from typing import List, Dict, Any, Awaitable, Callable

log = structlog.get_logger()

class ReActPlanner:
    @staticmethod
    async def plan_and_execute(
        goal: str,
        llm_processor: Callable[[str, str], Awaitable[str]]
    ) -> str:
        log.info("react_planning_started", goal=goal)
        
        system_prompt = """You are an Agent Planner using the ReAct (Reasoning and Acting) framework.
Break down the given goal into a JSON array of actionable steps.
Format: {"plan": ["step 1", "step 2"]}"""

        plan_str = await llm_processor(system_prompt, goal)
        
        try:
            if isinstance(plan_str, dict):
                plan_data = plan_str
            else:
                plan_data = json.loads(plan_str)
            plan = plan_data.get("plan", [goal])
        except Exception:
            plan = [goal] # fallback
            
        log.info("react_plan_generated", plan=plan)
        
        results = []
        for step in plan:
            log.info("react_step_execution", step=step)
            step_prompt = "Execute the following step concisely."
            step_result = await llm_processor(step_prompt, step)
            results.append(f"Step: {step}\nResult: {step_result}\n")
            
        return "\n".join(results)
