import React from "react";
import { ExpenseProvider } from "./context/ExpenseContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import ExpenseForm from "./components/ExpenseForm/ExpenseForm.jsx";
import ExpenseSummary from "./components/ExpenseSummary/ExpenseSummary.jsx";
import ExpenseList from "./components/ExpenseList/ExpenseList.jsx";
import ExpenseCharts from "./components/Charts/ExpenseCharts.jsx";
import Filters from "./components/Filters/Filters.jsx";
import Budgets from "./components/Budgets/Budgets.jsx";
import SavingsGoals from "./components/SavingsGoals/SavingsGoals.jsx";
import RecurringPayments from "./components/RecurringPayments/RecurringPayments.jsx";
import ExportData from "./components/ExportData/ExportData.jsx";
import ThemeToggle from "./components/ThemeToggle/ThemeToggle.jsx";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <ExpenseProvider>
        <div className="app">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "0 8px 32px var(--shadow-color)",
                border: "1px solid var(--border-color)",
              },
              success: {
                style: {
                  background: "var(--success-color)",
                  color: "white",
                },
                iconTheme: {
                  primary: "white",
                  secondary: "var(--success-color)",
                },
              },
              error: {
                style: {
                  background: "var(--expense-color)",
                  color: "white",
                },
                iconTheme: {
                  primary: "white",
                  secondary: "var(--expense-color)",
                },
              },
            }}
          />

          <header className="app-header">
            <div className="header-content">
              <div>
                <h1>💸 Smart Expense Tracker</h1>
                <p>Inteligentne zarządzanie Twoimi finansami</p>
              </div>
              <ThemeToggle />
            </div>
          </header>

          {/* SEKCJA BUDŻETÓW */}
          <div className="budgets-main-section">
            <Budgets />
          </div>

          {/* SEKCJA CELÓW OSZCZĘDNOŚCIOWYCH */}
          <div className="savings-goals-section">
            <SavingsGoals />
          </div>

          {/* SEKCJA CYKLICZNYCH PŁATNOŚCI */}
          <div className="recurring-payments-section">
            <RecurringPayments />
          </div>

          {/* SEKCJA EKSPORTU DANYCH */}
          <div className="export-data-section">
            <ExportData />
          </div>

          <div className="app-container">
            <div className="top-section">
              <div className="form-container">
                <ExpenseForm />
              </div>
              <div className="list-container">
                <Filters />
                <ExpenseList />
              </div>
            </div>

            <div className="charts-section">
              <ExpenseCharts />
            </div>

            <div className="summary-section">
              <ExpenseSummary />
            </div>
          </div>
        </div>
      </ExpenseProvider>
    </ThemeProvider>
  );
}

export default App;
