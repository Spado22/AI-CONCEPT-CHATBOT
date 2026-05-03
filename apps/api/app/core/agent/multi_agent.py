import structlog
import asyncio
from typing import List, Dict, Any, Callable, Awaitable

log = structlog.get_logger()

class AgentTask:
    def __init__(self, task_id: str, description: str):
        self.task_id = task_id
        self.description = description
        self.status = "pending"
        self.result = None


class MultiAgentCoordinator:
    """
    Runs multiple agent tasks in parallel, each represented as an async coroutine.
    Inspired by supervisor-worker architecture used in enterprise AI pipelines.
    """

    def __init__(self):
        self.tasks: List[AgentTask] = []

    def add_task(self, task: AgentTask):
        self.tasks.append(task)
        log.info("multi_agent_task_added", task_id=task.task_id, description=task.description)

    async def run_all(
        self,
        executor: Callable[[str, str], Awaitable[str]]
    ) -> List[Dict[str, Any]]:
        log.info("multi_agent_starting", total_tasks=len(self.tasks))

        async def run_task(task: AgentTask):
            task.status = "running"
            try:
                task.result = await executor("You are a capable sub-agent.", task.description)
                task.status = "completed"
            except Exception as e:
                task.status = "failed"
                task.result = str(e)
            log.info("multi_agent_task_done", task_id=task.task_id, status=task.status)
            return task

        completed = await asyncio.gather(*[run_task(t) for t in self.tasks])

        return [
            {"task_id": t.task_id, "description": t.description, "status": t.status, "result": t.result}
            for t in completed
        ]
