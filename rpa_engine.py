"""
RPA Workflow Engine for SEARX AI ULTRA PRO
Executes workflow steps sequentially with DOM inspection, error recovery, and data extraction.
"""

import asyncio
import logging
from typing import Dict, Any, List

logger = logging.getLogger("RpaEngine")

class RpaEngine:
    def __init__(self, browser_mgr, db_mgr):
        self.browser_mgr = browser_mgr
        self.db = db_mgr

    async def execute_step(self, page, step: Dict[str, Any], context_vars: Dict[str, Any]) -> Dict[str, Any]:
        action = step["action"]
        selector = step.get("selector")
        value = step.get("value")
        timeout = step.get("timeout_ms", 10000)
        
        result = {"success": True, "action": action, "output": None}
        
        try:
            if action == "open_url":
                target_url = value or context_vars.get("target_url")
                await page.goto(target_url, timeout=timeout, wait_until="domcontentloaded")
                result["output"] = f"Navigated to {target_url}"

            elif action == "click_element":
                await page.click(selector, timeout=timeout)
                result["output"] = f"Clicked {selector}"

            elif action == "scroll_page":
                delta_y = step.get("scroll_delta_y", 500)
                await page.mouse.wheel(0, delta_y)
                result["output"] = f"Scrolled deltaY {delta_y}"

            elif action == "wait_element":
                await page.wait_for_selector(selector, timeout=timeout)
                result["output"] = f"Element {selector} present"

            elif action == "wait_duration":
                duration_ms = step.get("wait_duration_ms", 2000)
                await asyncio.sleep(duration_ms / 1000.0)
                result["output"] = f"Waited {duration_ms}ms"

            elif action == "fill_input":
                await page.fill(selector, value, timeout=timeout)
                result["output"] = f"Filled {selector}"

            elif action == "select_dropdown":
                await page.select_option(selector, value, timeout=timeout)
                result["output"] = f"Selected {value} in {selector}"

            elif action == "submit_form":
                await page.evaluate(f"document.querySelector('{selector}').submit()")
                result["output"] = f"Submitted form {selector}"

            elif action == "navigate_back":
                await page.go_back(timeout=timeout)
                result["output"] = "Navigated back"

            elif action == "navigate_forward":
                await page.go_forward(timeout=timeout)
                result["output"] = "Navigated forward"

            elif action == "take_screenshot":
                path = f"/tmp/screenshot_{step['id']}.png"
                await page.screenshot(path=path)
                result["output"] = path

            elif action == "extract_title":
                title = await page.title()
                var_name = step.get("target_variable", "page_title")
                context_vars[var_name] = title
                result["output"] = title

            elif action == "extract_text":
                text = await page.inner_text(selector, timeout=timeout)
                var_name = step.get("target_variable", "extracted_text")
                context_vars[var_name] = text
                result["output"] = text

            elif action == "save_result":
                result["output"] = "Saved variables to execution result"

            elif action == "conditional":
                cond_var = step.get("condition_variable")
                cond_op = step.get("condition_operator", "equals")
                cond_val = step.get("condition_value")
                actual_val = str(context_vars.get(cond_var, ""))
                
                passed = False
                if cond_op == "equals":
                    passed = (actual_val == cond_val)
                elif cond_op == "contains":
                    passed = (cond_val in actual_val)
                elif cond_op == "exists":
                    passed = bool(actual_val)
                result["output"] = f"Condition {cond_var} {cond_op} {cond_val} => {passed}"
                result["condition_met"] = passed

            elif action == "repeat_action":
                result["output"] = f"Repeat loop count: {step.get('repeat_count', 1)}"

            elif action == "stop_workflow":
                result["stop_requested"] = True
                result["output"] = "Workflow stopped by user step directive"

            else:
                result["success"] = False
                result["error"] = f"Unknown action: {action}"

        except Exception as e:
            result["success"] = False
            result["error"] = str(e)
            if not step.get("optional", False):
                raise
        
        return result
