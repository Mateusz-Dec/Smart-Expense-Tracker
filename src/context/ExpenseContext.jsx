import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import toast from "react-hot-toast";

const ExpenseContext = createContext();

const initialState = {
  transactions: [], // WSZYSTKIE transakcje (bez filtrów)
  filters: {
    category: "all",
    type: "all",
    dateRange: "all",
    search: "",
  },
};

function expenseReducer(state, action) {
  switch (action.type) {
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };

    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };

    case "EDIT_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    default:
      return state;
  }
}

// Funkcja pomocnicza do filtrowania po dacie
const filterByDateRange = (transactions, dateRange) => {
  if (dateRange === "all") return transactions;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);

    switch (dateRange) {
      case "today":
        return transactionDate >= today;

      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return transactionDate >= weekAgo;

      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return transactionDate >= monthAgo;

      case "year":
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return transactionDate >= yearAgo;

      default:
        return true;
    }
  });
};

export function ExpenseProvider({ children }) {
  const [savedTransactions, setSavedTransactions] = useLocalStorage(
    "expense-tracker-transactions",
    []
  );

  const initialStateWithStorage = {
    transactions: savedTransactions,
    filters: {
      category: "all",
      type: "all",
      dateRange: "all",
      search: "",
    },
  };

  const [state, dispatch] = useReducer(expenseReducer, initialStateWithStorage);

  useEffect(() => {
    setSavedTransactions(state.transactions);
  }, [state.transactions, setSavedTransactions]);

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now() + Math.random(),
      date: new Date().toISOString(),
    };
    dispatch({ type: "ADD_TRANSACTION", payload: newTransaction });
    toast.success("Transakcja została pomyślnie dodana!");
  };

  const deleteTransaction = (id) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: id });
  };

  const editTransaction = (updatedTransaction) => {
    dispatch({ type: "EDIT_TRANSACTION", payload: updatedTransaction });
    toast.success("Transakcja została zaktualizowana!");
  };

  const setFilters = (filters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  };

  const { transactions, filters } = state;

  // Filtrowanie transakcji - TYLKO TUTAJ filtrujemy
  let filteredTransactions = transactions.filter((transaction) => {
    if (filters.category !== "all" && transaction.category !== filters.category)
      return false;
    if (filters.type !== "all" && transaction.type !== filters.type)
      return false;
    if (filters.search?.trim()) {
      const normalizedQuery = filters.search.trim().toLowerCase();
      const matchesDescription = transaction.description
        ?.toLowerCase()
        .includes(normalizedQuery);

      const matchesCategory = transaction.category
        ?.toLowerCase()
        .includes(normalizedQuery);

      if (!matchesDescription && !matchesCategory) {
        return false;
      }
    }

    return true;
  });

  // Filtrowanie po dacie
  filteredTransactions = filterByDateRange(
    filteredTransactions,
    filters.dateRange
  );

  const summary = {
    income: filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0),
    expenses: filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0),
    balance: filteredTransactions.reduce(
      (sum, t) => (t.type === "income" ? sum + t.amount : sum - t.amount),
      0
    ),
  };

  const value = {
    transactions: filteredTransactions, // Zwracamy PRZEFILTROWANE transakcje
    allTransactions: transactions, // WSZYSTKIE transakcje (do wykresów)
    summary,
    filters,
    addTransaction,
    deleteTransaction,
    editTransaction,
    setFilters,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
}

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpense must be used within ExpenseProvider");
  }
  return context;
};
