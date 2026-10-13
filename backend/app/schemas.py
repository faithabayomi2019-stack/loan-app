from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class CustomerCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: EmailStr
    address: Optional[str] = None
    occupation: Optional[str] = None


class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class LoanApprovalRequest(BaseModel):
    loan_id: int


class ManualRepaymentRequest(BaseModel):
    loan_id: int
    amount: float = Field(..., gt=0)