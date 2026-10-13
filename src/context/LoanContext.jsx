import { createContext, useContext, useState, useEffect } from "react"

const LoanContext = createContext()

function loadFromStorage(key) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error(`Failed to load ${key} from storage:`, error)
    return []
  }
}

export function LoanProvider({ children }) {
  const [customers, setCustomers] = useState(() => loadFromStorage("loanapp_customers"))
  const [loans, setLoans] = useState(() => loadFromStorage("loanapp_loans"))
  const [repayments, setRepayments] = useState(() => loadFromStorage("loanapp_repayments"))
  const [transfers, setTransfers] = useState(() => loadFromStorage("loanapp_transfers"))
  const [bills, setBills] = useState(() => loadFromStorage("loanapp_bills"))

  useEffect(() => {
    localStorage.setItem("loanapp_customers", JSON.stringify(customers))
  }, [customers])

  useEffect(() => {
    localStorage.setItem("loanapp_loans", JSON.stringify(loans))
  }, [loans])

  useEffect(() => {
    localStorage.setItem("loanapp_repayments", JSON.stringify(repayments))
  }, [repayments])

  useEffect(() => {
    localStorage.setItem("loanapp_transfers", JSON.stringify(transfers))
  }, [transfers])

  useEffect(() => {
    localStorage.setItem("loanapp_bills", JSON.stringify(bills))
  }, [bills])

  return (
    <LoanContext.Provider
      value={{
        customers,
        setCustomers,
        loans,
        setLoans,
        repayments,
        setRepayments,
        transfers,
        setTransfers,
        bills,
        setBills,
      }}
    >
      {children}
    </LoanContext.Provider>
  )
}

export function useLoan() {
  return useContext(LoanContext)
}