from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.listing_recommendations import recommend_listing_actions

router = APIRouter()


class ListingRecommendationRequest(BaseModel):
    listing_id: str = Field(min_length=1)
    quantity: float = Field(gt=0)
    unit: str = Field(min_length=1)
    surplus: bool = False


class ListingRecommendationResponse(BaseModel):
    listing_id: str
    actions: list[str]


@router.post("/listing-actions", response_model=ListingRecommendationResponse)
def listing_actions(payload: ListingRecommendationRequest) -> ListingRecommendationResponse:
    return ListingRecommendationResponse(
        listing_id=payload.listing_id,
        actions=recommend_listing_actions(payload.quantity, payload.unit, payload.surplus),
    )
