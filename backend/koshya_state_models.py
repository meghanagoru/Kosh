"""Pydantic models mirroring frontend KoshyaStore (TypeScript types)."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class AuditFormData(BaseModel):
    monthly_salary: float
    total_monthly_spend: float
    grocery_spend: float
    rent: float
    commute_type: Literal["metro", "cab", "own_vehicle", "wfh"]
    cab_spend: float
    metro_spend: float
    purchasing_habit: Literal["generic", "branded", "mix"]
    gendered_products: Literal["yes", "no", "mixed"]
    gendered_product_spend: float
    generic_equivalent_spend: float
    late_night_transit_frequency: Literal["never", "1-5", "5-15", "15+"]


class Contributions(BaseModel):
    food_pp: float
    housing_pp: float
    fuel_pp: float


class BucketMetrics(BaseModel):
    food_penalty_rupees: float
    housing_penalty_rupees: float
    fuel_penalty_rupees: float
    fuel_days_worked: float


class InflationRatesPayload(BaseModel):
    food: float
    housing: float
    fuel: float


class InflationResult(BaseModel):
    govt_avg_pct: float
    personal_inflation_pct: float
    delta_pp: float
    contributions: Contributions
    bucket_metrics: BucketMetrics
    rates: InflationRatesPayload


class SafetyTaxBlock(BaseModel):
    delta_rupees: float
    budget_impact_pct: float


class ShadowTaxResult(BaseModel):
    safety_tax: SafetyTaxBlock
    pink_tax: SafetyTaxBlock
    total_hidden_cost_pct: float


class Insight(BaseModel):
    title: str
    body: str
    recovery_rupees: float


class KoshyaStorePayload(BaseModel):
    model_config = ConfigDict(extra="ignore")

    audit: AuditFormData
    inflationResult: InflationResult | None = None
    shadowTax: ShadowTaxResult | None = None
    insights: list[Insight] = Field(default_factory=list)
    hasSubmittedAudit: bool = False
