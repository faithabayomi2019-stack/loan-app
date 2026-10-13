import os
import uuid
import random
from typing import Optional
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, desc
from sqlalchemy.orm import sessionmaker, declarative_base, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database.db")
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class CustomerModel(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    account_number = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class LoanModel(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String, index=True, nullable=False)
    principal = Column(Float, nullable=False)
    tenure_months = Column(Integer, nullable=False)
    reason = Column(String, nullable=True)
    interest_rate = Column(Float, default=0.05)
    total_repayment = Column(Float, nullable=False)
    remaining_balance = Column(Float, nullable=False)
    status = Column(String, default="PENDING")
    applied_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)


class TransactionModel(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String, unique=True, index=True, nullable=False)
    sender_account = Column(String, index=True, nullable=False)
    recipient_account = Column(String, index=True, nullable=True)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # DEBIT, CREDIT, AIRTIME, BILL
    narration = Column(String, nullable=True)
    status = Column(String, default="SUCCESSFUL")
    created_at = Column(DateTime, default=datetime.utcnow)


class RepaymentTransactionModel(Base):
    __tablename__ = "repayment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String, unique=True, index=True, nullable=False)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    account_number = Column(String, index=True, nullable=False)
    amount_deducted = Column(Float, nullable=False)
    status = Column(String, default="SUCCESSFUL")
    narration = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)

from app.auth import get_current_user, create_access_token, hash_password, verify_password


def generate_unique_account_number(db: Session) -> str:
    while True:
        acc_num = f"30{random.randint(10000000, 99999999)}"
        existing = db.query(CustomerModel).filter(CustomerModel.account_number == acc_num).first()
        if not existing:
            return acc_num


# Pydantic Schemas
class UserRegisterRequest(BaseModel):
    full_name: Optional[str] = "User"
    email: Optional[str] = ""
    password: Optional[str] = ""


class UserLoginRequest(BaseModel):
    email: Optional[str] = ""
    password: Optional[str] = ""


class LoanApplicationRequest(BaseModel):
    amount: Optional[float] = 1000.0
    tenure_months: Optional[int] = 12
    reason: Optional[str] = "Personal Loan"


class LoanApprovalRequest(BaseModel):
    loan_id: Optional[int] = 1


class TransferRequest(BaseModel):
    bank_code: Optional[str] = "000000"
    recipient_account: Optional[str] = ""
    amount: Optional[float] = 0.0
    narration: Optional[str] = "Transfer"


class AirtimeRequest(BaseModel):
    network: Optional[str] = "MTN"
    phone_number: Optional[str] = ""
    amount: Optional[float] = 0.0


class BillPaymentRequest(BaseModel):
    biller_type: Optional[str] = "ELECTRICITY"
    provider: Optional[str] = ""
    customer_id: Optional[str] = ""
    amount: Optional[float] = 0.0


class ManualRepaymentRequest(BaseModel):
    loan_id: Optional[int] = 1
    amount: Optional[float] = 0.0


app = FastAPI(title="Loan & Banking API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    if not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    existing = db.query(CustomerModel).filter(CustomerModel.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    acc_num = generate_unique_account_number(db)
    new_user = CustomerModel(
        full_name=payload.full_name or "User",
        email=payload.email,
        account_number=acc_num,
        hashed_password=hash_password(payload.password),
        balance=10000.0
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.account_number})
    return {
        "message": "User registered successfully",
        "access_token": token,
        "token_type": "bearer",
        "account_number": new_user.account_number,
        "full_name": new_user.full_name,
        "balance": new_user.balance
    }


@app.post("/auth/login")
def login_user(payload: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(CustomerModel).filter(CustomerModel.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": user.account_number})
    return {
        "access_token": token,
        "token_type": "bearer",
        "account_number": user.account_number,
        "full_name": user.full_name,
        "balance": user.balance
    }


@app.get("/users/me")
@app.get("/auth/me")
def get_user_profile(current_user: CustomerModel = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "account_number": current_user.account_number,
        "balance": current_user.balance,
        "created_at": current_user.created_at
    }


# -------------------------------------------------------------------
# TRANSACTION HISTORY (Mapped to multiple common frontend paths)
# -------------------------------------------------------------------
@app.get("/transactions/history")
@app.get("/transactions")
@app.get("/history")
def get_transaction_history(
    current_user: CustomerModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    txs = db.query(TransactionModel).filter(
        (TransactionModel.sender_account == current_user.account_number) | 
        (TransactionModel.recipient_account == current_user.account_number)
    ).order_by(desc(TransactionModel.created_at)).all()
    
    return txs


# -------------------------------------------------------------------
# AIRTIME (Mapped to multiple common frontend paths)
# -------------------------------------------------------------------
@app.post("/transactions/airtime")
@app.post("/airtime")
def purchase_airtime(
    payload: AirtimeRequest,
    current_user: CustomerModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.balance < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance.")

    current_user.balance -= payload.amount
    tx_ref = f"AIR-{uuid.uuid4().hex[:8].upper()}"
    
    tx = TransactionModel(
        reference=tx_ref,
        sender_account=current_user.account_number,
        recipient_account=payload.phone_number,
        amount=payload.amount,
        type="AIRTIME",
        narration=f"Airtime purchase ({payload.network}) for {payload.phone_number}",
        status="SUCCESSFUL"
    )
    db.add(tx)
    db.commit()

    return {
        "message": "Airtime purchased successfully!",
        "reference": tx_ref,
        "new_balance": current_user.balance
    }


# -------------------------------------------------------------------
# BILLS PAYMENT (Mapped to multiple common frontend paths)
# -------------------------------------------------------------------
@app.post("/transactions/bills")
@app.post("/bills")
@app.post("/bill")
def pay_bill(
    payload: BillPaymentRequest,
    current_user: CustomerModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.balance < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance.")

    current_user.balance -= payload.amount
    tx_ref = f"BIL-{uuid.uuid4().hex[:8].upper()}"
    
    tx = TransactionModel(
        reference=tx_ref,
        sender_account=current_user.account_number,
        recipient_account=payload.customer_id,
        amount=payload.amount,
        type="BILL",
        narration=f"Bill payment ({payload.biller_type} - {payload.provider}) for {payload.customer_id}",
        status="SUCCESSFUL"
    )
    db.add(tx)
    db.commit()

    return {
        "message": "Bill payment successful!",
        "reference": tx_ref,
        "new_balance": current_user.balance
    }


@app.post("/loans/apply", status_code=status.HTTP_201_CREATED)
def apply_for_loan(
    payload: LoanApplicationRequest,
    current_user: CustomerModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing_loan = db.query(LoanModel).filter(
        LoanModel.account_number == current_user.account_number,
        LoanModel.status.in_(["PENDING", "APPROVED", "ACTIVE"])
    ).first()

    if existing_loan:
        raise HTTPException(status_code=400, detail="Active/pending loan already exists.")

    monthly_rate = 0.05
    total_interest = payload.amount * monthly_rate * payload.tenure_months
    total_repayment = payload.amount + total_interest

    new_loan = LoanModel(
        account_number=current_user.account_number,
        principal=payload.amount,
        tenure_months=payload.tenure_months,
        reason=payload.reason,
        interest_rate=monthly_rate,
        total_repayment=total_repayment,
        remaining_balance=total_repayment,
        status="PENDING"
    )

    db.add(new_loan)
    db.commit()
    db.refresh(new_loan)

    return {
        "message": "Loan application submitted!",
        "loan_id": new_loan.id,
        "total_repayment": new_loan.total_repayment,
        "status": new_loan.status
    }


@app.get("/loans/my-active-loan")
def get_my_active_loan(
    current_user: CustomerModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(LoanModel).filter(
        LoanModel.account_number == current_user.account_number,
        LoanModel.status.in_(["APPROVED", "ACTIVE", "PENDING"])
    ).first()

    if not loan:
        raise HTTPException(status_code=404, detail="No active or pending loan found.")
    return loan


@app.post("/loans/approve")
def approve_loan(
    payload: LoanApprovalRequest,
    current_user: CustomerModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(LoanModel).filter(LoanModel.id == payload.loan_id).first()
    if not loan or loan.status != "PENDING":
        raise HTTPException(status_code=400, detail="Invalid loan or not pending.")

    borrower = db.query(CustomerModel).filter(CustomerModel.account_number == loan.account_number).first()
    if not borrower:
        raise HTTPException(status_code=404, detail="Borrower not found.")

    loan.status = "APPROVED"
    loan.approved_at = datetime.utcnow()
    borrower.balance += loan.principal

    db.commit()
    return {"message": "Loan approved & funds disbursed!", "new_balance": borrower.balance}


@app.get("/banks")
def get_supported_banks():
    return [
        {"name": "Internal Wallet", "code": "000000"},
        {"name": "Access Bank", "code": "044"},
        {"name": "First Bank", "code": "011"},
        {"name": "GTBank", "code": "058"},
        {"name": "Kuda Bank", "code": "50211"},
        {"name": "OPay", "code": "999992"},
        {"name": "Palmpay", "code": "999991"}
    ]


@app.post("/transactions/transfer")
@app.post("/transfer")
def process_transfer(
    payload: TransferRequest,
    current_user: CustomerModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.balance < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance.")

    current_user.balance -= payload.amount
    recipient = db.query(CustomerModel).filter(CustomerModel.account_number == payload.recipient_account).first()
    if recipient:
        recipient.balance += payload.amount

    tx_ref = f"TRF-{uuid.uuid4().hex[:8].upper()}"
    transfer_tx = TransactionModel(
        reference=tx_ref,
        sender_account=current_user.account_number,
        recipient_account=payload.recipient_account,
        amount=payload.amount,
        type="DEBIT",
        narration=payload.narration,
        status="SUCCESSFUL"
    )

    db.add(transfer_tx)
    db.commit()
    return {"message": "Transfer successful!", "reference": tx_ref, "new_balance": current_user.balance}


@app.post("/repayments/pay")
def repay_loan(
    payload: ManualRepaymentRequest,
    current_user: CustomerModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(LoanModel).filter(
        LoanModel.id == payload.loan_id,
        LoanModel.account_number == current_user.account_number
    ).first()

    if not loan or loan.status not in ["APPROVED", "ACTIVE"]:
        raise HTTPException(status_code=400, detail="No active loan found.")

    if current_user.balance < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance.")

    current_user.balance -= payload.amount
    loan.remaining_balance -= payload.amount
    if loan.remaining_balance <= 0:
        loan.remaining_balance = 0.0
        loan.status = "PAID"

    tx_ref = f"REP-{uuid.uuid4().hex[:8].upper()}"
    db.add(RepaymentTransactionModel(
        reference=tx_ref,
        loan_id=loan.id,
        account_number=current_user.account_number,
        amount_deducted=payload.amount,
        status="SUCCESSFUL",
        narration=f"Repayment for Loan #{loan.id}"
    ))
    db.commit()

    return {"message": "Repayment successful!", "remaining_balance": loan.remaining_balance, "new_wallet_balance": current_user.balance}