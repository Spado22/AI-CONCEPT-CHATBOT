import structlog
import httpx
from typing import Dict, Any, List

log = structlog.get_logger()

class WebSearchTool:
    """
    Web Search Agent using SerpAPI (or any search API).
    Falls back to a mock result if no API key is configured.
    """

    def __init__(self, api_key: str = None):
        self.api_key = api_key
        self.base_url = "https://serpapi.com/search"

    async def search(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        log.info("web_search_started", query=query)

        if not self.api_key:
            log.warning("web_search_mock_mode", reason="No SERPAPI_KEY configured.")
            return [
                {
                    "title": f"Mock Result for: {query}",
                    "link": "https://example.com",
                    "snippet": "This is a simulated search result. Configure SERPAPI_KEY for real web search.",
                }
            ]

        try:
            params = {
                "q": query,
                "api_key": self.api_key,
                "num": num_results,
                "engine": "google",
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.base_url, params=params)
                data = response.json()

            results = []
            for item in data.get("organic_results", []):
                results.append({
                    "title": item.get("title", ""),
                    "link": item.get("link", ""),
                    "snippet": item.get("snippet", ""),
                })
            log.info("web_search_completed", num_results=len(results))
            return results

        except Exception as e:
            log.error("web_search_failed", error=str(e))
            return []
