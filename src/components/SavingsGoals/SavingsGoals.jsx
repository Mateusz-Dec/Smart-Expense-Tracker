import React, { useState, useEffect } from "react";
import { useExpense } from "../../context/ExpenseContext";
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  Clock,
  Award,
  Trash2,
  PiggyBank,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./SavingsGoals.module.css";

function SavingsGoals() {
  const { allTransactions } = useExpense();
  const [goals, setGoals] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
    color: "#667eea",
    category: "Oszczędności", // Nowe pole - kategoria dla transakcji
  });

  const colors = [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#f5576c",
    "#4facfe",
    "#00f2fe",
    "#43e97b",
    "#38f9d7",
  ];

  // AUTOMATYCZNE LICZENIE OSZCZĘDNOŚCI z transakcji
  useEffect(() => {
    const updatedGoals = goals.map((goal) => {
      // Znajdź wszystkie transakcje związane z tym celem (przychody oznaczone jako oszczędności)
      const goalTransactions = allTransactions.filter(
        (transaction) =>
          transaction.type === "income" &&
          transaction.description
            .toLowerCase()
            .includes(goal.name.toLowerCase())
      );

      const totalSaved = goalTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );

      return {
        ...goal,
        currentAmount: totalSaved,
        transactions: goalTransactions,
      };
    });

    setGoals(updatedGoals);
  }, [allTransactions]); // Uruchamia się gdy zmienią się transakcje

  const addGoal = () => {
    if (!newGoal.name.trim()) {
      toast.error("Proszę wpisać nazwę celu");
      return;
    }

    if (!newGoal.targetAmount || parseFloat(newGoal.targetAmount) <= 0) {
      toast.error("Proszę wpisać prawidłową kwotę celu");
      return;
    }

    if (!newGoal.deadline) {
      toast.error("Proszę wybrać datę celu");
      return;
    }

    const goal = {
      id: Date.now(),
      ...newGoal,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0, // Zaczynamy od zera
      createdAt: new Date().toISOString(),
      transactions: [],
    };

    setGoals((prev) => [...prev, goal]);
    setNewGoal({
      name: "",
      targetAmount: "",
      deadline: "",
      color: "#667eea",
      category: "Oszczędności",
    });
    setIsAdding(false);
    toast.success("Cel oszczędnościowy dodany! 🎯");
  };

  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
    toast.success("Cel usunięty");
  };

  // FUNKCJA DO DODAWania OSZCZĘDNOŚCI JAKO TRANSAKCJI
  const addSavingsTransaction = (goal, amount) => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Proszę wpisać prawidłową kwotę");
      return;
    }

    // Tutaj potrzebujemy dostępu do funkcji addTransaction z Context
    // Musimy to zrobić inaczej - pokażę użytkownikowi instrukcję
    const transactionExample = {
      description: `Oszczędności: ${goal.name}`,
      amount: parseFloat(amount),
      type: "income",
      category: "Oszczędności",
    };

    toast.success(
      <div>
        <strong>Dodaj transakcję oszczędności:</strong>
        <br />
        Opis: <strong>Oszczędności: {goal.name}</strong>
        <br />
        Kwota: <strong>{amount} zł</strong>
        <br />
        Typ: <strong>Przychód</strong>
        <br />
        Kategoria: <strong>Oszczędności</strong>
      </div>,
      { duration: 6000 }
    );
  };

  const calculateProgress = (goal) => {
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    const remaining = goal.targetAmount - goal.currentAmount;
    const daysRemaining = Math.ceil(
      (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)
    );

    return {
      percentage: Math.min(percentage, 100),
      remaining,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      isCompleted: percentage >= 100,
      isOverdue: daysRemaining < 0 && percentage < 100,
      monthlySavingsNeeded: remaining / Math.max(daysRemaining / 30, 1), // Miesięczna kwota do odłożenia
    };
  };

  const getDaysText = (days) => {
    if (days === 0) return "Dzisiaj";
    if (days === 1) return "1 dzień";
    if (days < 5) return `${days} dni`;
    if (days < 30) return `${days} dni`;
    const months = Math.ceil(days / 30);
    return months === 1 ? "1 miesiąc" : `${months} miesięcy`;
  };

  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const completedGoals = goals.filter(
    (goal) => calculateProgress(goal).isCompleted
  ).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Target size={24} />
          <h2>Cele oszczędnościowe</h2>
        </div>
        <button onClick={() => setIsAdding(true)} className={styles.addButton}>
          <Plus size={18} />
          Nowy cel
        </button>
      </div>

      {/* Instrukcja jak działa system oszczędności */}
      <div className={styles.instruction}>
        <PiggyBank size={20} />
        <div>
          <strong>Jak to działa?</strong>
          <p>
            Dodaj transakcję jako <strong>PRZYCHÓD</strong> z opisem
            zawierającym nazwę celu, a system automatycznie doliczy ją do
            oszczędności!
          </p>
        </div>
      </div>

      {/* Formularz dodawania celu */}
      {isAdding && (
        <div className={styles.goalForm}>
          <h3>Dodaj nowy cel</h3>
          <div className={styles.form}>
            <input
              type="text"
              placeholder="Nazwa celu (np. Wakacje, Nowy laptop)"
              value={newGoal.name}
              onChange={(e) =>
                setNewGoal((prev) => ({ ...prev, name: e.target.value }))
              }
              className={`form-control ${styles.input}`}
            />
            <input
              type="number"
              placeholder="Docelowa kwota"
              value={newGoal.targetAmount}
              onChange={(e) =>
                setNewGoal((prev) => ({
                  ...prev,
                  targetAmount: e.target.value,
                }))
              }
              className={`form-control ${styles.input}`}
              min="0"
              step="0.01"
            />
            <input
              type="date"
              value={newGoal.deadline}
              onChange={(e) =>
                setNewGoal((prev) => ({ ...prev, deadline: e.target.value }))
              }
              className={`form-control ${styles.input}`}
              min={new Date().toISOString().split("T")[0]}
            />
            <div className={styles.colorPicker}>
              <span>Kolor:</span>
              <div className={styles.colors}>
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`${styles.colorOption} ${
                      newGoal.color === color ? styles.selected : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewGoal((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
            <div className={styles.formActions}>
              <button onClick={addGoal} className={styles.saveButton}>
                <Target size={18} />
                Dodaj cel
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

      {/* Podsumowanie ogólne */}
      {goals.length > 0 && (
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <TrendingUp size={20} />
            <span>Oszczędzone:</span>
            <strong>
              {new Intl.NumberFormat("pl-PL", {
                style: "currency",
                currency: "PLN",
              }).format(totalSaved)}
            </strong>
          </div>
          <div className={styles.summaryItem}>
            <Target size={20} />
            <span>Cel:</span>
            <strong>
              {new Intl.NumberFormat("pl-PL", {
                style: "currency",
                currency: "PLN",
              }).format(totalTarget)}
            </strong>
          </div>
          <div className={styles.summaryItem}>
            <Award size={20} />
            <span>Ukończone:</span>
            <strong>
              {completedGoals}/{goals.length}
            </strong>
          </div>
        </div>
      )}

      {/* Lista celów */}
      <div className={styles.goalsList}>
        {goals.length === 0 ? (
          <div className={styles.emptyState}>
            <Target size={48} />
            <p>Brak celów oszczędnościowych</p>
            <span>Dodaj pierwszy cel, aby śledzić swoje oszczędności</span>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = calculateProgress(goal);

            return (
              <div key={goal.id} className={styles.goalItem}>
                <div
                  className={styles.goalColor}
                  style={{ backgroundColor: goal.color }}
                ></div>

                <div className={styles.goalContent}>
                  <div className={styles.goalHeader}>
                    <div className={styles.goalInfo}>
                      <h4>{goal.name}</h4>
                      <div className={styles.goalMeta}>
                        <span className={styles.amount}>
                          {new Intl.NumberFormat("pl-PL", {
                            style: "currency",
                            currency: "PLN",
                          }).format(goal.currentAmount)}{" "}
                          /{" "}
                          {new Intl.NumberFormat("pl-PL", {
                            style: "currency",
                            currency: "PLN",
                          }).format(goal.targetAmount)}
                        </span>
                        <span
                          className={`${styles.deadline} ${
                            progress.isOverdue ? styles.overdue : ""
                          }`}
                        >
                          <Calendar size={14} />
                          {progress.isOverdue
                            ? "Termin minął!"
                            : `Do celu: ${getDaysText(progress.daysRemaining)}`}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className={styles.deleteButton}
                      title="Usuń cel"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className={styles.progressSection}>
                    <div className={styles.progressBar}>
                      <div
                        className={`${styles.progressFill} ${
                          progress.isCompleted ? styles.completed : ""
                        }`}
                        style={{
                          width: `${progress.percentage}%`,
                          backgroundColor: goal.color,
                        }}
                      ></div>
                    </div>
                    <div className={styles.progressText}>
                      <span>{progress.percentage.toFixed(1)}%</span>
                      {!progress.isCompleted && (
                        <span className={styles.remaining}>
                          <Clock size={14} />
                          Pozostało:{" "}
                          {new Intl.NumberFormat("pl-PL", {
                            style: "currency",
                            currency: "PLN",
                          }).format(progress.remaining)}
                        </span>
                      )}
                      {progress.isCompleted && (
                        <span className={styles.completedText}>
                          <Award size={14} />
                          Cel osiągnięty! 🎉
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Informacje o miesięcznych oszczędnościach */}
                  {!progress.isCompleted && progress.daysRemaining > 0 && (
                    <div className={styles.savingsInfo}>
                      <PiggyBank size={14} />
                      <span>
                        Aby osiągnąć cel, odkładaj miesięcznie:{" "}
                        <strong>
                          {new Intl.NumberFormat("pl-PL", {
                            style: "currency",
                            currency: "PLN",
                          }).format(progress.monthlySavingsNeeded)}
                        </strong>
                      </span>
                    </div>
                  )}

                  {/* Historia transakcji dla tego celu */}
                  {goal.transactions && goal.transactions.length > 0 && (
                    <div className={styles.transactions}>
                      <small>Ostatnie wpłaty:</small>
                      {goal.transactions.slice(0, 3).map((transaction) => (
                        <div
                          key={transaction.id}
                          className={styles.transaction}
                        >
                          <span>
                            {new Date(transaction.date).toLocaleDateString(
                              "pl-PL"
                            )}
                          </span>
                          <span>
                            +
                            {new Intl.NumberFormat("pl-PL", {
                              style: "currency",
                              currency: "PLN",
                            }).format(transaction.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default SavingsGoals;
