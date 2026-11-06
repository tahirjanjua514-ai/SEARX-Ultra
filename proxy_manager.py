"""
Proxy Management Engine for SEARX AI ULTRA PRO
Supports HTTP, HTTPS, SOCKS5 with authentication, latency benchmarking, and public provider adapters.
"""

import time
import requests
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("ProxyManager")

class ProxyManager:
    def __init__(self, db_manager):
        self.db = db_manager

    def get_proxy(self, proxy_id: str) -> Optional[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.execute("SELECT * FROM proxies WHERE id = ?", (proxy_id,))
            row = cur.fetchone()
            return dict(row) if row else None

    def test_proxy_connectivity(self, proxy: Dict[str, Any], test_url: str = "https://httpbin.org/ip", timeout: int = 8) -> Dict[str, Any]:
        """Performs actual connectivity and latency test."""
        protocol = proxy["protocol"].lower()
        host = proxy["host"]
        port = proxy["port"]
        username = proxy.get("username")
        password = proxy.get("password")

        auth_str = f"{username}:{password}@" if username and password else ""
        proxy_url = f"{protocol}://{auth_str}{host}:{port}"
        proxies = {"http": proxy_url, "https": proxy_url}

        start_time = time.time()
        try:
            resp = requests.get(test_url, proxies=proxies, timeout=timeout)
            latency = int((time.time() - start_time) * 1000)
            if resp.status_code == 200:
                return {"status": "active", "latency_ms": latency, "ip_detected": resp.json().get("origin")}
            else:
                return {"status": "failed", "latency_ms": latency, "error": f"HTTP {resp.status_code}"}
        except Exception as e:
            latency = int((time.time() - start_time) * 1000)
            return {"status": "failed", "latency_ms": latency, "error": str(e)}

    def fetch_public_proxies(self, provider_url: str = "https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=5000&country=all&ssl=all&anonymity=all") -> List[Dict[str, Any]]:
        """Imports and validates proxies from public endpoints."""
        records = []
        try:
            resp = requests.get(provider_url, timeout=10)
            if resp.status_code == 200:
                lines = resp.text.strip().splitlines()
                for line in lines[:50]:
                    parts = line.strip().split(":")
                    if len(parts) == 2:
                        records.append({
                            "host": parts[0],
                            "port": int(parts[1]),
                            "protocol": "http",
                            "group": "Public Source"
                        })
        except Exception as e:
            logger.error(f"Failed to fetch public proxies: {e}")
        return records
