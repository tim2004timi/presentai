from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth import get_current_user
from src.crud import user as user_crud
from src.database import get_db
from src.models.user import User
from src.schemas.user import UserInDB, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserInDB,
    summary="Получить информацию о текущем пользователе",
)
async def read_current_user(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_payload = UserInDB.model_validate(current_user).model_dump()
    return user_payload


@router.put(
    "/me",
    response_model=UserInDB,
    summary="Обновить информацию о текущем пользователе",
)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    update_data = user_update.model_dump(exclude_unset=True)
    if not update_data:
        return UserInDB.model_validate(current_user)

    if "login" in update_data and update_data["login"] != current_user.login:
        existing_user = await user_crud.get_user_by_login(db, update_data["login"])
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this login already exists",
            )

    for field, value in update_data.items():
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)
    return UserInDB.model_validate(current_user)

@router.get("/{user_id}", 
    response_model=UserInDB,
    summary="Получить пользователя по ID",
    description="Получает информацию о пользователе по ID")
async def get_user_by_id(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Получить пользователя по ID (только для админов или себя)"""
    user = await user_crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.get("", 
    response_model=List[UserInDB],
    summary="Получить список пользователей",
    description="Получает список всех пользователей")
async def get_users(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: AsyncSession = Depends(get_db)
):
    """Получить список пользователей"""

    users = await user_crud.get_users(db, skip=skip, limit=limit)
    return users

