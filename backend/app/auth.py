import os
import hashlib
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.main import CustomerModel, get_db

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-jwt-key-change-in-production-12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# -------------------------------------------------------------------
# SECURE NATIVE PASSWORD HASHING (No Passlib / No Bcrypt / No 72-byte limit)
# -------------------------------------------------------------------
def hash_password(password: str) -> str:
    if not isinstance(password, str):
        password = str(password)
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + ':' + pwd_hash.hex()


def verify_password(plain_password: str, stored_hash: str) -> bool:
    try:
        if not isinstance(plain_password, str):
            plain_password = str(plain_password)
        salt_hex, pwd_hex = stored_hash.split(':')
        salt = bytes.fromhex(salt_hex)
        pwd_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000)
        return pwd_hex == pwd_hash.hex()
    except Exception:
        return False


# -------------------------------------------------------------------
# JWT TOKEN CREATION & VALIDATION
# -------------------------------------------------------------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> CustomerModel:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        account_number: str = payload.get("sub")
        if account_number is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(CustomerModel).filter(CustomerModel.account_number == account_number).first()
    if user is None:
        raise credentials_exception
    return user