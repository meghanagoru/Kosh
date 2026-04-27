"""
calculations.py — Koshya Calculation Engine
All financial math lives here. Pure functions, no I/O.
"""
from __future__ import annotations
from dataclasses import dataclass


# ---------------------------------------------------------------------------
# Data Structures
# ---------------------------------------------------------------------------

@dataclass
class InflationRates:
    food: float        # e.g. 6.2  (percent)
    housing: float     # e.g. 4.1
    fuel: float        # e.g. 2.9
    govt_avg: float    # e.g. 5.1  (official headline CPI)


@dataclass
class UserWeights:
    food: float        # 0–100, user slider value
    housing: float
    fuel: float


@dataclass
class AuditData:
    monthly_salary: float
    total_monthly_spend: float
    grocery_spend: float
    rent: float
    commute_type: str            # "metro" | "cab" | "own_vehicle" | "wfh"
    cab_spend: float
    metro_spend: float
    gendered_product_spend: float   # actual spend on gendered products
    generic_equivalent_spend: float # estimated generic alternative
    late_night_transit_frequency: str  # "never"|"1-5"|"5-15"|"15+"
    purchasing_habit: str         # "generic"|"branded"|"mix"


@dataclass
class InflationResult:
    food_contribution_pp: float
    housing_contribution_pp: float
    fuel_contribution_pp: float
    personal_inflation_pct: float
    delta_pp: float               # personal - govt avg
    food_penalty_rupees: float
    housing_penalty_rupees: float
    fuel_penalty_rupees: float
    fuel_days_worked: float


@dataclass
class ShadowTaxResult:
    safety_delta_rupees: float
    safety_impact_pct: float
    pink_delta_rupees: float
    pink_impact_pct: float
    total_hidden_cost_pct: float


@dataclass
class AdjustedRupeeResult:
    real_value: float     # e.g. 87.3
    evaporated: float     # e.g. 12.7
    personal_inflation_pct: float
    hidden_cost_impact_pct: float


# ---------------------------------------------------------------------------
# A. Personal Inflation Rate (Weighted Contribution Method)
# ---------------------------------------------------------------------------

def compute_personal_inflation(
    rates: InflationRates,
    weights: UserWeights,
    audit: AuditData,
) -> InflationResult:
    """
    Correct method: weighted contribution in percentage points.
    Category Contribution (pp) = (normalized_weight) * category_inflation_rate
    """
    total_weight = weights.food + weights.housing + weights.fuel
    if total_weight == 0:
        total_weight = 1  # guard against zero division

    norm_food = weights.food / total_weight
    norm_housing = weights.housing / total_weight
    norm_fuel = weights.fuel / total_weight

    food_pp = norm_food * rates.food
    housing_pp = norm_housing * rates.housing
    fuel_pp = norm_fuel * rates.fuel

    personal_inflation = food_pp + housing_pp + fuel_pp
    delta_pp = personal_inflation - rates.govt_avg

    # --- Intuitive bucket metrics ---
    # Food: Rupee penalty
    food_penalty = audit.grocery_spend * (rates.food / 100)

    # Housing: Rupee penalty
    housing_penalty = audit.rent * (rates.housing / 100)

    # Fuel: Days of work
    daily_wage = audit.monthly_salary / 22  # ~22 working days
    fuel_penalty_rupees = audit.total_monthly_spend * norm_fuel * (rates.fuel / 100)
    fuel_days = (fuel_penalty_rupees / daily_wage) if daily_wage > 0 else 0

    return InflationResult(
        food_contribution_pp=round(food_pp, 2),
        housing_contribution_pp=round(housing_pp, 2),
        fuel_contribution_pp=round(fuel_pp, 2),
        personal_inflation_pct=round(personal_inflation, 2),
        delta_pp=round(delta_pp, 2),
        food_penalty_rupees=round(food_penalty, 2),
        housing_penalty_rupees=round(housing_penalty, 2),
        fuel_penalty_rupees=round(fuel_penalty_rupees, 2),
        fuel_days_worked=round(fuel_days, 2),
    )


# ---------------------------------------------------------------------------
# B. Shadow Taxes (Hidden Costs) — As % of Total Budget
# ---------------------------------------------------------------------------

def compute_shadow_taxes(audit: AuditData) -> ShadowTaxResult:
    """
    CORRECT approach: delta as percentage of TOTAL monthly spend.
    NOT item-to-item ratio.
    """
    total = audit.total_monthly_spend
    if total <= 0:
        total = 1

    # Safety Tax (late-night / private cab premium)
    metro_equivalent = audit.metro_spend if audit.commute_type == "metro" else (
        audit.metro_spend if audit.metro_spend > 0 else audit.cab_spend * 0.2
    )
    safety_delta = max(0.0, audit.cab_spend - metro_equivalent)
    safety_impact_pct = (safety_delta / total) * 100

    # Pink Tax
    pink_delta = max(0.0, audit.gendered_product_spend - audit.generic_equivalent_spend)
    pink_impact_pct = (pink_delta / total) * 100

    total_hidden_cost_pct = safety_impact_pct + pink_impact_pct

    return ShadowTaxResult(
        safety_delta_rupees=round(safety_delta, 2),
        safety_impact_pct=round(safety_impact_pct, 2),
        pink_delta_rupees=round(pink_delta, 2),
        pink_impact_pct=round(pink_impact_pct, 2),
        total_hidden_cost_pct=round(total_hidden_cost_pct, 2),
    )


# ---------------------------------------------------------------------------
# C. The Adjusted Rupee Hero Metric
# ---------------------------------------------------------------------------

def compute_adjusted_rupee(
    personal_inflation_pct: float,
    hidden_cost_impact_pct: float,
) -> AdjustedRupeeResult:
    """
    Real Value = ₹100 × (1 − (personal_inflation % + hidden_cost %)/100)
    """
    total_erosion_pct = personal_inflation_pct + hidden_cost_impact_pct
    real_value = 100 * (1 - total_erosion_pct / 100)
    real_value = max(0.0, min(100.0, real_value))  # clamp 0–100
    evaporated = 100.0 - real_value

    return AdjustedRupeeResult(
        real_value=round(real_value, 2),
        evaporated=round(evaporated, 2),
        personal_inflation_pct=round(personal_inflation_pct, 2),
        hidden_cost_impact_pct=round(hidden_cost_impact_pct, 2),
    )
