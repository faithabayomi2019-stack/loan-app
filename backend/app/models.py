from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class CustomerModel(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    account_number = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    loans = relationship("LoanModel", back_populates="customer")


class LoanModel(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String, ForeignKey("customers.account_number"), nullable=False)
    principal = Column(Float, nullable=False)
    remaining_balance = Column(Float, nullable=False)
    interest_rate = Column(Float, default=0.05)
    status = Column(String, default="PENDING")  # PENDING, ACTIVE, PAID, DEFAULTED
    disbursed_at = Column(DateTime, nullable=True)
    next_payment_due = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("CustomerModel", back_populates="loans")
    repayments = relationship("RepaymentTransactionModel", back_populates="loan")


class TransactionModel(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String, unique=True, index=True, nullable=False)
    sender_account = Column(String, nullable=False)
    recipient_account = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # LOAN_DISBURSEMENT, WALLET_TOPUP, REPAYMENT
    narration = Column(String, nullable=True)
    status = Column(String, default="SUCCESSFUL")
    created_at = Column(DateTime, default=datetime.utcnow)


class RepaymentTransactionModel(Base):
    __tablename__ = "repayment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String, unique=True, index=True, nullable=False)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    account_number = Column(String, nullable=False)
    amount_deducted = Column(Float, nullable=False)
    status = Column(String, default="SUCCESSFUL")
    narration = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    loan = relationship("LoanModel", back_populates="repayments")