from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import NewsletterSubscriber
from app.schemas import NewsletterSubscribeIn

router = APIRouter(prefix="/api/v1/newsletter", tags=["newsletter"])


@router.post("/subscribe")
async def subscribe(body: NewsletterSubscribeIn, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(NewsletterSubscriber).where(NewsletterSubscriber.email == body.email)
    )
    sub = existing.scalar_one_or_none()
    if sub:
        if sub.is_active:
            return {"ok": True, "message": "Already subscribed"}
        sub.is_active = True
    else:
        db.add(NewsletterSubscriber(email=body.email))
    return {"ok": True, "message": "Subscribed successfully"}
