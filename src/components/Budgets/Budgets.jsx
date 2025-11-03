import React, { useState } from "react";
import { useExpense } from "../../context/ExpenseContext";
import {
  Target,
  Trash2,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./Budgets.module.css";

const CATEGORIES = [
  "Jedzenie",
  "Transport",
  "Rozrywka",
  "Zdrowie",
  "Zakupy",
  "Rachunki",
  "Inne",
];

function Budgets() {
  const { allTransactions, summary } = useExpense();
  const [budgets, setBudgets] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: "Jedzenie",
    amount: "",
    period: "monthly",
  });

  // Oblicz wydatki per kategoria
  const categorySpending = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, transaction) => {
      const existing = acc.find(
        (item) => item.category === transaction.category
      );
      if (existing) {
        existing.amount += transaction.amount;
      } else {
        acc.push({
          category: transaction.category,
          amount: transaction.amount,
        });
      }
      return acc;
    }, []);

  const addBudget = () => {
    if (!newBudget.amount || parseFloat(newBudget.amount) <= 0) {
      toast.error("Proszę wpisać prawidłową kwotę budżetu");
      return;
    }

    const budgetExists = budgets.find((b) => b.category === newBudget.category);
    if (budgetExists) {
      toast.error("Budżet dla tej kategorii już istnieje");
      return;
    }

    const budget = {
      id: Date.now(),
      ...newBudget,
      amount: parseFloat(newBudget.amount),
    };

    setBudgets((prev) => [...prev, budget]);
    setNewBudget({ category: "Jedzenie", amount: "", period: "monthly" });
    setIsAdding(false);
    toast.success("Budżet dodany pomyślnie!");
  };

  const deleteBudget = (id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    toast.success("Budżet usunięty");
  };

  const getBudgetProgress = (category) => {
    const budget = budgets.find((b) => b.category === category);
    if (!budget) return null;

    const spending = categorySpending.find((s) => s.category === category);
    const spent = spending ? spending.amount : 0;
    const percentage = (spent / budget.amount) * 100;
    const overBudget = spent - budget.amount;

    return {
      spent,
      budget: budget.amount,
      percentage,
      isOverBudget: spent > budget.amount,
      overBudgetAmount: overBudget > 0 ? overBudget : 0,
    };
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Target size={24} />
          <h2>Zarządzanie budżetami</h2>
        </div>
        <button onClick={() => setIsAdding(true)} className={styles.addButton}>
          <Plus size={18} />
          Dodaj budżet
        </button>
      </div>

      {/* Formularz dodawania budżetu */}
      {isAdding && (
        <div className={styles.budgetForm}>
          <h3>Nowy budżet</h3>
          <div className={styles.form}>
            <select
              value={newBudget.category}
              onChange={(e) =>
                setNewBudget((prev) => ({ ...prev, category: e.target.value }))
              }
              className={`form-select ${styles.select}`}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Kwota budżetu"
              value={newBudget.amount}
              onChange={(e) =>
                setNewBudget((prev) => ({ ...prev, amount: e.target.value }))
              }
              className={`form-control ${styles.input}`}
              min="0"
              step="0.01"
            />
            <select
              value={newBudget.period}
              onChange={(e) =>
                setNewBudget((prev) => ({ ...prev, period: e.target.value }))
              }
              className={`form-select ${styles.select}`}
            >
              <option value="monthly">Miesięczny</option>
              <option value="weekly">Tygodniowy</option>
            </select>
            <div className={styles.formActions}>
              <button onClick={addBudget} className={styles.saveButton}>
                Zapisz
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className={styles.cancelButton}
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista budżetów */}
      <div className={styles.budgetsList}>
        {budgets.length === 0 ? (
          <div className={styles.emptyState}>
            <Target size={48} />
            <p>Brak ustawionych budżetów</p>
            <span>Dodaj budżet, aby śledzić swoje wydatki</span>
          </div>
        ) : (
          budgets.map((budget) => {
            const progress = getBudgetProgress(budget.category);
            const spending = categorySpending.find(
              (s) => s.category === budget.category
            );
            const spent = spending ? spending.amount : 0;

            return (
              <div key={budget.id} className={styles.budgetItem}>
                <div className={styles.budgetHeader}>
                  <div className={styles.budgetInfo}>
                    <h4>{budget.category}</h4>
                    <span className={styles.budgetPeriod}>
                      {budget.period === "monthly"
                        ? "Miesięczny"
                        : "Tygodniowy"}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteBudget(budget.id)}
                    className={styles.deleteButton}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={styles.budgetAmounts}>
                  <div className={styles.amount}>
                    <span>Wydano:</span>
                    <strong
                      className={spent > budget.amount ? styles.overBudget : ""}
                    >
                      {new Intl.NumberFormat("pl-PL", {
                        style: "currency",
                        currency: "PLN",
                      }).format(spent)}
                    </strong>
                  </div>
                  <div className={styles.amount}>
                    <span>Budżet:</span>
                    <strong>
                      {new Intl.NumberFormat("pl-PL", {
                        style: "currency",
                        currency: "PLN",
                      }).format(budget.amount)}
                    </strong>
                  </div>
                </div>

                {/* Informacja o przekroczeniu budżetu */}
                {progress.isOverBudget && (
                  <div className={styles.overBudgetAlert}>
                    <AlertTriangle size={16} />
                    <span>
                      Przekroczono o:{" "}
                      <strong>
                        {new Intl.NumberFormat("pl-PL", {
                          style: "currency",
                          currency: "PLN",
                        }).format(progress.overBudgetAmount)}
                      </strong>
                    </span>
                  </div>
                )}

                <div className={styles.progressBar}>
                  <div
                    className={`${styles.progressFill} ${
                      spent > budget.amount ? styles.overBudget : ""
                    }`}
                    style={{
                      width: `${Math.min((spent / budget.amount) * 100, 100)}%`,
                    }}
                  ></div>
                </div>

                <div className={styles.progressText}>
                  <span>
                    {Math.min((spent / budget.amount) * 100, 100).toFixed(1)}%
                    wykorzystania
                  </span>
                  {spent > budget.amount && (
                    <span className={styles.overBudgetText}>
                      <TrendingUp size={14} />
                      Przekroczono budżet!
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Podsumowanie budżetów */}
      {budgets.length > 0 && (
        <div className={styles.budgetSummary}>
          <h4>Podsumowanie budżetów</h4>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <Target size={20} />
              <span>Aktywne budżety:</span>
              <strong>{budgets.length}</strong>
            </div>
            <div className={styles.summaryItem}>
              <TrendingDown size={20} />
              <span>W ramach budżetu:</span>
              <strong>
                {
                  budgets.filter((budget) => {
                    const spending = categorySpending.find(
                      (s) => s.category === budget.category
                    );
                    return spending ? spending.amount <= budget.amount : true;
                  }).length
                }
              </strong>
            </div>
            <div className={styles.summaryItem}>
              <TrendingUp size={20} />
              <span>Przekroczone:</span>
              <strong className={styles.overBudget}>
                {
                  budgets.filter((budget) => {
                    const spending = categorySpending.find(
                      (s) => s.category === budget.category
                    );
                    return spending ? spending.amount > budget.amount : false;
                  }).length
                }
              </strong>
            </div>
          </div>

          {/* Całkowite przekroczenie budżetów */}
          {budgets.some((budget) => {
            const spending = categorySpending.find(
              (s) => s.category === budget.category
            );
            return spending ? spending.amount > budget.amount : false;
          }) && (
            <div className={styles.totalOverBudget}>
              <AlertTriangle size={18} />
              <div>
                <strong>Łączne przekroczenie budżetów:</strong>
                <span>
                  {new Intl.NumberFormat("pl-PL", {
                    style: "currency",
                    currency: "PLN",
                  }).format(
                    budgets.reduce((total, budget) => {
                      const spending = categorySpending.find(
                        (s) => s.category === budget.category
                      );
                      const overBudget =
                        spending && spending.amount > budget.amount
                          ? spending.amount - budget.amount
                          : 0;
                      return total + overBudget;
                    }, 0)
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Budgets;
