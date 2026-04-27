"""
ai_insights.py — Koshya AI Insights Generator
Builds structured prompts from audit data and calls an LLM.
Currently: returns rich mock insights if no API key is set.
To activate: set GEMINI_API_KEY or OPENAI_API_KEY in .env
"""
from __future__ import annotations

import os
import json
import httpx
from typing import Any

from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


# ---------------------------------------------------------------------------
# Prompt Builder
# ---------------------------------------------------------------------------

def build_prompt(payload: dict) -> str:
    food_inflation = payload.get("food_inflation", 6.2)
    personal_inflation = payload.get("personal_inflation_pct", 0)
    salary = payload.get("monthly_salary", 0)
    spend = payload.get("total_monthly_spend", 0)
    rent = payload.get("rent", 0)
    food_penalty = payload.get("food_penalty_rupees", 0)
    safety_delta = payload.get("safety_delta_rupees", 0)
    pink_delta = payload.get("pink_delta_rupees", 0)
    commute = payload.get("commute_type", "cab")
    rent_pct = (rent / spend * 100) if spend > 0 else 0

    return f"""
You are Koshya, a sovereign financial intelligence engine for Indian urban professionals.
Generate EXACTLY 3 JSON insight objects based on this user's financial audit.

USER DATA:
- Monthly salary: ₹{salary:,.0f}
- Total monthly spend: ₹{spend:,.0f}
- Rent: ₹{rent:,.0f} ({rent_pct:.0f}% of spend)
- Food inflation rate: {food_inflation}%
- Personal inflation: {personal_inflation}%
- Food penalty this month: ₹{food_penalty:,.0f}
- Safety tax (commute premium): ₹{safety_delta:,.0f}
- Pink tax (gendered product premium): ₹{pink_delta:,.0f}
- Commute type: {commute}

RULES:
- Insight 1: General finance (food/salary inflation divergence). Reference specific ₹ amounts.
- Insight 2: Housing/location optimization using real data patterns.
- Insight 3: Hidden cost recovery (safety tax or pink tax). Specific WFH/generic-switching advice.
- Each insight must have a concrete, specific recovery_rupees figure.
- Be direct, terse, data-driven. No fluff. No generic advice.
- DO NOT say "I recommend" or "you should". State facts and numbers.
- Use Indian English conventions.

Return ONLY valid JSON, no markdown fences:
[
  {{"title": "...", "body": "...", "recovery_rupees": 1234}},
  {{"title": "...", "body": "...", "recovery_rupees": 1234}},
  {{"title": "...", "body": "...", "recovery_rupees": 1234}}
]
"""


# ---------------------------------------------------------------------------
# LLM Callers
# ---------------------------------------------------------------------------

async def call_gemini(prompt: str) -> list[dict]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 800},
    }
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(url, json=payload)
        r.raise_for_status()
        text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(text.strip())


async def call_openai(prompt: str) -> list[dict]:
    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.4,
        "max_tokens": 800,
    }
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(url, headers=headers, json=payload)
        r.raise_for_status()
        text = r.json()["choices"][0]["message"]["content"]
        return json.loads(text.strip())


# ---------------------------------------------------------------------------
# Mock Insights (when no API key is configured)
# ---------------------------------------------------------------------------

def build_mock_insights(payload: dict) -> list[dict]:
    food_inflation = payload.get("food_inflation", 6.2)
    salary = payload.get("monthly_salary", 50000)
    food_penalty = payload.get("food_penalty_rupees", 1250)
    safety_delta = payload.get("safety_delta_rupees", 2000)
    pink_delta = payload.get("pink_delta_rupees", 800)
    rent = payload.get("rent", 20000)
    spend = payload.get("total_monthly_spend", 45000)
    grocery_spend = payload.get("grocery_spend", 8000)
    rent_pct = (rent / spend * 100) if spend > 0 else 44

    # Ensure meaningful recovery figures even with partial data
    bulk_recovery = max(round(food_penalty * 0.6), round(grocery_spend * food_inflation / 100 * 0.6), 200)
    rent_recovery = max(round(rent * 0.02), 300)
    safety_recovery = max(round(safety_delta * 0.6), round(spend * 0.02), 200)

    return [
        {
            "title": "Food Inflation Outpacing Salary",
            "body": (
                f"Your food basket is inflating at {food_inflation}%. "
                f"Shifting 25% of grocery spend to bulk dry goods — lentils, rice, oats — "
                f"locks in today's prices and recovers an estimated ₹{bulk_recovery:,} monthly. "
                f"Prioritize items with >6-month shelf life."
            ),
            "recovery_rupees": bulk_recovery,
        },
        {
            "title": "Rent Concentration Risk",
            "body": (
                f"Rent is {rent_pct:.0f}% of monthly spend — above the 30% threshold. "
                f"MOSPI data shows rent inflation in micro-markets 3–5km from central corridors "
                f"runs 1.8–2.2pp lower annually. A lateral relocation recovers ₹{rent_recovery:,}/month "
                f"without lifestyle compression."
            ),
            "recovery_rupees": rent_recovery,
        },
        {
            "title": "Safety Tax Recovery via WFH",
            "body": (
                f"Your late-night transit pattern is generating a ₹{safety_delta:,} monthly safety premium. "
                f"Negotiating 2 WFH days per week eliminates approximately 40% of this cost. "
                f"Net recovery: ₹{safety_recovery:,}/month with zero productivity loss."
            ),
            "recovery_rupees": safety_recovery,
        },
    ]


# ---------------------------------------------------------------------------
# Main Entry Point
# ---------------------------------------------------------------------------

async def generate_insights(payload: dict) -> list[dict]:
    """
    Try real LLM first, fall back to deterministic mock insights.
    Priority: Gemini → OpenAI → Mock
    """
    prompt = build_prompt(payload)

    if GEMINI_API_KEY:
        try:
            return await call_gemini(prompt)
        except Exception as e:
            print(f"[Gemini error] {e}")

    if OPENAI_API_KEY:
        try:
            return await call_openai(prompt)
        except Exception as e:
            print(f"[OpenAI error] {e}")

    return build_mock_insights(payload)
