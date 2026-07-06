from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import security
from app.config import get_settings
from app.core.helpers import (
    create_session,
    get_current_user,
    hash_password,
    require_user,
    verify_password,
)
from app.database import get_db
from app.models import Account, User
from app.schemas import AuthOut, LoginIn, RegisterIn

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=AuthOut)
async def register(body: RegisterIn, db: AsyncSession = Depends(get_db)):
    settings = get_settings()
    if settings.app_env == "production":
        raise HTTPException(status_code=403, detail="Registration is disabled in production")

    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(name=body.name, email=body.email, role="customer")
    db.add(user)
    await db.flush()

    db.add(
        Account(
            user_id=user.id,
            type="email",
            provider="credentials",
            provider_account_id=body.email,
            access_token=hash_password(body.password),
        )
    )
    token = await create_session(db, user.id)
    return AuthOut(
        session_token=token,
        user={"id": str(user.id), "name": user.name, "email": user.email, "role": user.role},
    )


@router.post("/login", response_model=AuthOut)
async def login(body: LoginIn, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    acc_result = await db.execute(
        select(Account).where(
            Account.user_id == user.id,
            Account.provider == "credentials",
        )
    )
    account = acc_result.scalar_one_or_none()
    if not account or not account.access_token or not verify_password(body.password, account.access_token):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = await create_session(db, user.id)
    return AuthOut(
        session_token=token,
        user={"id": str(user.id), "name": user.name, "email": user.email, "role": user.role},
    )


@router.get("/me")
async def me(user: User = Depends(require_user)):
    return {"id": str(user.id), "name": user.name, "email": user.email, "role": user.role}


@router.post("/logout")
async def logout(
    creds: HTTPAuthorizationCredentials | None = Depends(security),
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models import Session as UserSession

    token = creds.credentials if creds else None
    if token:
        await db.execute(
            UserSession.__table__.delete().where(UserSession.session_token == token)
        )
    return {"ok": True}
