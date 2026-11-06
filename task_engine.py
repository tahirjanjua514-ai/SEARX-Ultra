"""
Multi-Thread Task Engine for SEARX AI ULTRA PRO
Maintains priority queues, hardware resource governor (psutil), and worker pools.
"""

import asyncio
import logging
import psutil
from typing import Dict, Any, Optional

logger = logging.getLogger("TaskEngine")

class TaskEngine:
    def __init__(self, db_manager, rpa_engine, max_concurrency: int = 4):
        self.db = db_manager
        self.rpa = rpa_engine
        self.max_concurrency = max_concurrency
        self.running_tasks: Dict[str, asyncio.Task] = {}
        self.is_paused = False
        self.is_stopped = False

    def check_hardware_headroom(self, cpu_limit_pct: float = 85.0, mem_limit_mb: float = 3000.0) -> bool:
        """Resource safety guard preventing out-of-memory or CPU throttling."""
        cpu = psutil.cpu_percent(interval=None)
        mem = psutil.virtual_memory()
        available_mb = mem.available / (1024 * 1024)
        
        if cpu > cpu_limit_pct:
            logger.warning(f"CPU threshold exceeded: {cpu}% > {cpu_limit_pct}%")
            return False
        if available_mb < mem_limit_mb:
            logger.warning(f"Memory threshold exceeded: {available_mb}MB available < {mem_limit_mb}MB required")
            return False
        return True

    async def run_worker(self):
        """Asynchronous worker pulling from task_queue table."""
        logger.info("Task worker started.")
        while not self.is_stopped:
            if self.is_paused:
                await asyncio.sleep(1)
                continue

            if not self.check_hardware_headroom():
                await asyncio.sleep(3)
                continue

            # Fetch highest priority task
            with self.db.get_connection() as conn:
                cur = conn.execute(
                    "SELECT * FROM task_queue WHERE status = 'queued' ORDER BY CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END, created_at ASC LIMIT 1"
                )
                task = cur.fetchone()

            if not task:
                await asyncio.sleep(1)
                continue

            task_dict = dict(task)
            logger.info(f"Picked up task {task_dict['id']} for profile {task_dict['profile_id']}")
            await asyncio.sleep(1)
