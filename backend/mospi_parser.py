"""
mospi_parser.py — MOSPI CPI CSV Parser
Handles the Ministry of Statistics and Programme Implementation
CPI release format. Falls back to seeded 2024 data if no CSV uploaded.
"""
from __future__ import annotations

import io
import json
import os
from pathlib import Path
from typing import Optional

import pandas as pd

# ---------------------------------------------------------------------------
# Seed data — India CPI values, Annual 2024 (Base Year 2012=100)
# Source: MOSPI CPI Press Releases 2024
# ---------------------------------------------------------------------------
SEED_DATA = {
    "food": 6.2,           # Food & Beverages
    "housing": 4.1,        # Housing
    "fuel": 2.9,           # Fuel & Light
    "govt_avg": 5.1,       # All-Groups CPI (headline)
    "source": "MOSPI CPI 2024 (seeded)",
    "period": "Annual Average 2024",
}

DATA_DIR = Path(__file__).parent / "data"
LATEST_FILE = DATA_DIR / "latest_cpi.json"


def get_latest_rates() -> dict:
    """Return the latest CPI rates — uploaded file takes priority over seed."""
    if LATEST_FILE.exists():
        with open(LATEST_FILE, "r") as f:
            return json.load(f)
    return SEED_DATA


def save_rates(rates: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(LATEST_FILE, "w") as f:
        json.dump(rates, f, indent=2)


def parse_mospi_csv(file_bytes: bytes, filename: str) -> dict:
    """
    Parse a MOSPI CPI CSV file and extract category rates.

    MOSPI releases come in two common formats:
      Format A: Wide — rows = items, columns = months
      Format B: Long — columns include 'Group', 'Inflation Rate'

    We attempt both and fall back to interactive column mapping.
    Returns a dict with keys: food, housing, fuel, govt_avg, source, period
    """
    df = pd.read_csv(io.BytesIO(file_bytes), encoding="utf-8", on_bad_lines="skip")
    df.columns = [str(c).strip().lower() for c in df.columns]

    rates = {}

    # Strategy 1: Look for known MOSPI column patterns
    group_col = _find_col(df, ["group", "item group", "commodity", "sector", "category"])
    rate_col = _find_col(df, ["inflation", "rate", "yoy", "y-o-y", "annual change", "change"])

    if group_col and rate_col:
        for _, row in df.iterrows():
            group_str = str(row[group_col]).strip().lower()
            rate_val = _parse_rate(row[rate_col])
            if rate_val is None:
                continue
            if any(k in group_str for k in ["food", "cereal", "vegetable", "pulse", "beverage"]):
                rates["food"] = rate_val
            elif any(k in group_str for k in ["housing", "rent", "dwelling"]):
                rates["housing"] = rate_val
            elif any(k in group_str for k in ["fuel", "light", "energy", "transport"]):
                rates["fuel"] = rate_val
            elif any(k in group_str for k in ["general", "all group", "headline", "cpi"]):
                rates["govt_avg"] = rate_val

    # Strategy 2: If file has a numeric row that looks like overall CPI
    if not rates:
        # Try to infer from column names that look like months
        numeric_cols = df.select_dtypes(include="number").columns.tolist()
        if numeric_cols:
            last_col = numeric_cols[-1]
            # Try to map first few rows to categories
            for i, row in df.iterrows():
                first_val = str(row.iloc[0]).strip().lower()
                rate_val = _parse_rate(row[last_col])
                if rate_val is None:
                    continue
                if "food" in first_val:
                    rates["food"] = rate_val
                elif "hous" in first_val:
                    rates["housing"] = rate_val
                elif "fuel" in first_val or "light" in first_val:
                    rates["fuel"] = rate_val
                elif "general" in first_val or "all" in first_val:
                    rates["govt_avg"] = rate_val

    # Fill any missing with seed
    seed = SEED_DATA.copy()
    result = {
        "food": rates.get("food", seed["food"]),
        "housing": rates.get("housing", seed["housing"]),
        "fuel": rates.get("fuel", seed["fuel"]),
        "govt_avg": rates.get("govt_avg", seed["govt_avg"]),
        "source": f"Uploaded: {filename}",
        "period": "Latest Upload",
    }
    return result


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _find_col(df: pd.DataFrame, candidates: list[str]) -> Optional[str]:
    for col in df.columns:
        for c in candidates:
            if c in col:
                return col
    return None


def _parse_rate(val) -> Optional[float]:
    try:
        f = float(str(val).replace("%", "").replace(",", "").strip())
        if -50 < f < 100:  # sanity check
            return f
    except (ValueError, TypeError):
        pass
    return None
