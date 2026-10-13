from datetime import datetime
from sqlalchemy.orm import Session
from datetime import datetime
from sqlalchemy.orm import Session
from models import CustomerModel, LoanModel, RepaymentTransactionModel, TransactionModel

def process_daily_loan_repayments(db: Session):
    """
    Automated daily task to deduct scheduled repayments from customer wallet balances.
    """
    today = datetime.utcnow()
    
    # Query active loans that are due for payment today or past due
    active_loans = db.query(LoanModel).filter(
        LoanModel.status == "ACTIVE",
        LoanModel.remaining_balance > 0,
        LoanModel.next_payment_due <= today
    ).all()

    for loan in active_loans:
        customer = db.query(CustomerModel).filter(
            CustomerModel.account_number == loan.account_number
        ).first()

        if not customer:
            continue

        # Calculate deduction (monthly payment or remaining balance if smaller)
        repayment_amount = min(loan.principal * 0.1, loan.remaining_balance)

        if customer.balance >= repayment_amount:
            try:
                customer.balance -= repayment_amount
                loan.remaining_balance -= repayment_amount

                if loan.remaining_balance <= 0:
                    loan.remaining_balance = 0.0
                    loan.status = "PAID"

                # Log repayment transaction
                repayment = RepaymentTransactionModel(
                    reference=f"AUTO-PAY-{loan.id}-{int(today.timestamp())}",
                    loan_id=loan.id,
                    account_number=customer.account_number,
                    amount_deducted=repayment_amount,
                    status="SUCCESSFUL",
                    narration=f"Automated Daily Repayment for Loan #{loan.id}"
                )

                db.add(repayment)
                db.commit()
            except Exception as e:
                db.rollback()
                print(f"Error processing daily repayment for loan #{loan.id}: {str(e)}")