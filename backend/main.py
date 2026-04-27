"""
main.py — Koshya FastAPI Backend
Sovereign Ledger Calculation Engine
"""
from __future__ import annotations

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

from calculations import (
    InflationRates, UserWeights, AuditData,
    compute_personal_inflation, compute_shadow_taxes, compute_adjusted_rupee,
)
from mospi_parser import get_latest_rates, save_rates, parse_mospi_csv
from ai_insights import generate_insights

# ---------------------------------------------------------------------------
# App Setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Koshya API",
    description="The Sovereign Ledger — Personal Inflation Intelligence Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response Models
# ---------------------------------------------------------------------------

class InflationRequest(BaseModel):
    food_weight: float = Field(40, ge=0, le=100)
    housing_weight: float = Field(30, ge=0, le=100)
    fuel_weight: float = Field(30, ge=0, le=100)
    monthly_salary: float = Field(50000, gt=0)
    total_monthly_spend: float = Field(40000, gt=0)
    grocery_spend: float = Field(8000, ge=0)
    rent: float = Field(15000, ge=0)


class ShadowTaxRequest(BaseModel):
    total_monthly_spend: float = Field(40000, gt=0)
    commute_type: str = Field("cab")  # metro|cab|own_vehicle|wfh
    cab_spend: float = Field(0, ge=0)
    metro_spend: float = Field(0, ge=0)
    gendered_product_spend: float = Field(0, ge=0)
    generic_equivalent_spend: float = Field(0, ge=0)


class AdjustedRupeeRequest(BaseModel):
    personal_inflation_pct: float
    hidden_cost_impact_pct: float


class InsightsRequest(BaseModel):
    # Inflation context
    monthly_salary: float = Field(50000, gt=0)
    total_monthly_spend: float = Field(40000, gt=0)
    rent: float = Field(15000, ge=0)
    grocery_spend: float = Field(8000, ge=0)
    food_inflation: float = Field(6.2)
    personal_inflation_pct: float = Field(0)
    # Metric outputs
    food_penalty_rupees: float = Field(0)
    fuel_penalty_rupees: float = Field(0)
    housing_penalty_rupees: float = Field(0)
    # Shadow tax outputs
    safety_delta_rupees: float = Field(0)
    pink_delta_rupees: float = Field(0)
    # Audit
    commute_type: str = Field("cab")
    purchasing_habit: str = Field("mix")
    late_night_transit_frequency: str = Field("1-5")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/mospi/latest")
def get_mospi_latest():
    """Return the latest parsed MOSPI CPI rates."""
    return get_latest_rates()


@app.post("/api/mospi/upload")
async def upload_mospi_csv(file: UploadFile = File(...)):
    """
    Upload a MOSPI CPI CSV file.
    The backend will parse it and store as the active CPI dataset.
    Accepts standard MOSPI release formats (wide or long CSV).
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    content = await file.read()
    try:
        rates = parse_mospi_csv(content, file.filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"CSV parsing failed: {str(e)}")

    save_rates(rates)
    return {"message": "MOSPI data updated successfully.", "rates": rates}


@app.post("/api/calculate/inflation")
def calculate_inflation(req: InflationRequest):
    """
    Compute personal inflation using weighted contribution method.
    Returns category contributions, total personal inflation, delta vs govt,
    and intuitive bucket metrics (₹ penalty, days worked).
    """
    raw_rates = get_latest_rates()
    rates = InflationRates(
        food=raw_rates["food"],
        housing=raw_rates["housing"],
        fuel=raw_rates["fuel"],
        govt_avg=raw_rates["govt_avg"],
    )
    weights = UserWeights(
        food=req.food_weight,
        housing=req.housing_weight,
        fuel=req.fuel_weight,
    )
    # Minimal audit for bucket metrics
    audit = AuditData(
        monthly_salary=req.monthly_salary,
        total_monthly_spend=req.total_monthly_spend,
        grocery_spend=req.grocery_spend,
        rent=req.rent,
        commute_type="cab",
        cab_spend=0,
        metro_spend=0,
        gendered_product_spend=0,
        generic_equivalent_spend=0,
        late_night_transit_frequency="1-5",
        purchasing_habit="mix",
    )

    result = compute_personal_inflation(rates, weights, audit)

    return {
        "govt_avg_pct": rates.govt_avg,
        "personal_inflation_pct": result.personal_inflation_pct,
        "delta_pp": result.delta_pp,
        "contributions": {
            "food_pp": result.food_contribution_pp,
            "housing_pp": result.housing_contribution_pp,
            "fuel_pp": result.fuel_contribution_pp,
        },
        "bucket_metrics": {
            "food_penalty_rupees": result.food_penalty_rupees,
            "housing_penalty_rupees": result.housing_penalty_rupees,
            "fuel_penalty_rupees": result.fuel_penalty_rupees,
            "fuel_days_worked": result.fuel_days_worked,
        },
        "rates": {
            "food": rates.food,
            "housing": rates.housing,
            "fuel": rates.fuel,
        },
    }


@app.post("/api/calculate/shadow-tax")
def calculate_shadow_tax(req: ShadowTaxRequest):
    """
    Compute Safety Tax and Pink Tax as percentage of total monthly spend.
    Returns absolute ₹ delta and budget impact %.
    """
    audit = AuditData(
        monthly_salary=0,
        total_monthly_spend=req.total_monthly_spend,
        grocery_spend=0,
        rent=0,
        commute_type=req.commute_type,
        cab_spend=req.cab_spend,
        metro_spend=req.metro_spend,
        gendered_product_spend=req.gendered_product_spend,
        generic_equivalent_spend=req.generic_equivalent_spend,
        late_night_transit_frequency="1-5",
        purchasing_habit="mix",
    )

    result = compute_shadow_taxes(audit)

    return {
        "safety_tax": {
            "delta_rupees": result.safety_delta_rupees,
            "budget_impact_pct": result.safety_impact_pct,
        },
        "pink_tax": {
            "delta_rupees": result.pink_delta_rupees,
            "budget_impact_pct": result.pink_impact_pct,
        },
        "total_hidden_cost_pct": result.total_hidden_cost_pct,
    }


@app.post("/api/calculate/adjusted-rupee")
def calculate_adjusted_rupee(req: AdjustedRupeeRequest):
    """
    Compute the Adjusted Rupee hero metric.
    Real Value = ₹100 × (1 - (personal_inflation % + hidden_cost %)/100)
    """
    result = compute_adjusted_rupee(
        req.personal_inflation_pct,
        req.hidden_cost_impact_pct,
    )
    return {
        "real_value": result.real_value,
        "evaporated": result.evaporated,
        "personal_inflation_pct": result.personal_inflation_pct,
        "hidden_cost_impact_pct": result.hidden_cost_impact_pct,
    }


@app.post("/api/insights/generate")
async def generate_sovereign_insights(req: InsightsRequest):
    """
    Generate 3 AI-powered actionable insights from the user's audit.
    Uses Gemini → OpenAI → deterministic mock (priority order).
    """
    payload = req.model_dump()
    insights = await generate_insights(payload)
    return {"insights": insights}


# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------

@app.get("/")
def health():
    return {"status": "Koshya API is running.", "version": "1.0.0"}
