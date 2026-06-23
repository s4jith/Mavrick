from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import os
from ..core.schemas import UserRegister, UserLogin, Token, UserResponse
from ..core.auth import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from ..core.db import users_collection
from bson import ObjectId

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    
    # Return string ID
    user["id"] = str(user["_id"])
    return user


@router.post("/register", response_model=UserResponse)
async def register(user_req: UserRegister):
    existing_user = await users_collection.find_one({"email": user_req.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_req.password)
    user_dict = {
        "email": user_req.email,
        "name": user_req.name,
        "hashed_password": hashed_password
    }
    
    result = await users_collection.insert_one(user_dict)
    
    return {
        "id": str(result.inserted_id),
        "email": user_dict["email"],
        "name": user_dict["name"]
    }


@router.post("/login", response_model=Token)
async def login(user_req: UserLogin):
    user = await users_collection.find_one({"email": user_req.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(user_req.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"]
    }
