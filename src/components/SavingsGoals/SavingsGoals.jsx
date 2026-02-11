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
            .includes(goal.name.toLowerCase()),
      );

      const totalSaved = goalTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
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
      { duration: 6000 },
    );
  };

  const calculateProgress = (goal) => {
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    const remaining = goal.targetAmount - goal.currentAmount;
    const daysRemaining = Math.ceil(
      (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24),
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
    (goal) => calculateProgress(goal).isCompleted,
  ).length;

  return (
    <div
      className={styles.container}
      style={{ maxWidth: "100%", margin: "0 auto", padding: "0" }}
    >
      <div
        className={styles.header}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div
          className={styles.title}
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
        >
          <div
            style={{
              background: "var(--bg-input)",
              padding: "12px",
              borderRadius: "12px",
              color: "var(--accent-color)",
              border: "1px solid var(--border-color)",
            }}
          >
            <Target size={28} />
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.5rem",
                color: "var(--text-primary)",
              }}
            >
              Cele oszczędnościowe
            </h2>
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
              }}
            >
              Śledź postępy i realizuj marzenia
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={styles.addButton}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: isAdding
              ? "var(--expense-color)"
              : "var(--accent-color)",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "10px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 4px 6px -1px var(--shadow-color)",
          }}
        >
          {isAdding ? <Trash2 size={18} /> : <Plus size={18} />}
          {isAdding ? "Anuluj" : "Nowy cel"}
        </button>
      </div>

      {/* Podsumowanie ogólne */}
      {goals.length > 0 && (
        <div
          className={styles.summary}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2.5rem",
          }}
        >
          <div
            className={styles.summaryItem}
            style={{
              background: "var(--bg-card)",
              padding: "1.5rem",
              borderRadius: "16px",
              boxShadow: "0 4px 6px -1px var(--shadow-color)",
              border: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                background: "#dcfce7",
                padding: "12px",
                borderRadius: "50%",
                color: "#16a34a",
              }}
            >
              <TrendingUp size={24} />
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                }}
              >
                Zgromadzone
              </span>
              <strong
                style={{ fontSize: "1.25rem", color: "var(--text-primary)" }}
              >
                {new Intl.NumberFormat("pl-PL", {
                  style: "currency",
                  currency: "PLN",
                }).format(totalSaved)}
              </strong>
            </div>
          </div>
          <div
            className={styles.summaryItem}
            style={{
              background: "var(--bg-card)",
              padding: "1.5rem",
              borderRadius: "16px",
              boxShadow: "0 4px 6px -1px var(--shadow-color)",
              border: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                background: "#e0e7ff",
                padding: "12px",
                borderRadius: "50%",
                color: "#4f46e5",
              }}
            >
              <Target size={24} />
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                }}
              >
                Cel całkowity
              </span>
              <strong
                style={{ fontSize: "1.25rem", color: "var(--text-primary)" }}
              >
                {new Intl.NumberFormat("pl-PL", {
                  style: "currency",
                  currency: "PLN",
                }).format(totalTarget)}
              </strong>
            </div>
          </div>
          <div
            className={styles.summaryItem}
            style={{
              background: "var(--bg-card)",
              padding: "1.5rem",
              borderRadius: "16px",
              boxShadow: "0 4px 6px -1px var(--shadow-color)",
              border: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                background: "#fef3c7",
                padding: "12px",
                borderRadius: "50%",
                color: "#d97706",
              }}
            >
              <Award size={24} />
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                }}
              >
                Ukończone
              </span>
              <strong
                style={{ fontSize: "1.25rem", color: "var(--text-primary)" }}
              >
                {completedGoals}/{goals.length}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Formularz dodawania celu */}
      {isAdding && (
        <div
          className={styles.goalForm}
          style={{
            background: "var(--bg-card)",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 10px 15px -3px var(--shadow-color)",
            marginBottom: "2rem",
            border: "1px solid var(--border-color)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "1.5rem",
              color: "var(--text-primary)",
            }}
          >
            Dodaj nowy cel
          </h3>
          <div
            className={styles.form}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <input
              type="text"
              placeholder="Nazwa celu (np. Wakacje, Nowy laptop)"
              value={newGoal.name}
              onChange={(e) =>
                setNewGoal((prev) => ({ ...prev, name: e.target.value }))
              }
              className={`form-control ${styles.input}`}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
              }}
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
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
              }}
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
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
              }}
              min={new Date().toISOString().split("T")[0]}
            />
            <div
              className={styles.colorPicker}
              style={{ gridColumn: "1 / -1" }}
            >
              <span
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                }}
              >
                Wybierz kolor:
              </span>
              <div
                className={styles.colors}
                style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
              >
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`${styles.colorOption} ${
                      newGoal.color === color ? styles.selected : ""
                    }`}
                    style={{
                      backgroundColor: color,
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border:
                        newGoal.color === color ? "3px solid white" : "none",
                      boxShadow:
                        newGoal.color === color ? `0 0 0 2px ${color}` : "none",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                    }}
                    onClick={() => setNewGoal((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
            <div
              className={styles.formActions}
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <button
                onClick={addGoal}
                className={styles.saveButton}
                style={{
                  background: "var(--accent-color)",
                  color: "white",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Target size={18} />
                Dodaj cel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instrukcja jak działa system oszczędności */}
      <div
        className={styles.instruction}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
          color: "var(--text-primary)",
        }}
      >
        <PiggyBank size={24} />
        <div>
          <strong style={{ display: "block", marginBottom: "0.25rem" }}>
            Automatyczne oszczędzanie
          </strong>
          <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
            Dodaj transakcję jako <strong>PRZYCHÓD</strong> z opisem
            zawierającym nazwę celu, a system automatycznie doliczy ją do
            oszczędności!
          </p>
        </div>
      </div>

      {/* Lista celów */}
      <div
        className={styles.goalsList}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "2.5rem" /* Zwiększony odstęp między kartami */,
        }}
      >
        {goals.length === 0 ? (
          <div
            className={styles.emptyState}
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "4rem 2rem",
              background: "var(--bg-card)",
              borderRadius: "16px",
              border: "2px dashed var(--border-color)",
            }}
          >
            <Target size={48} />
            <p>Brak celów oszczędnościowych</p>
            <span>Dodaj pierwszy cel, aby śledzić swoje oszczędności</span>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = calculateProgress(goal);

            return (
              <div
                key={goal.id}
                className={styles.goalItem}
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 4px 6px -1px var(--shadow-color)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Card Header */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${goal.color}, ${goal.color}dd)`,
                    padding: "1.5rem",
                    color: "white",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "1.25rem",
                          fontWeight: 600,
                        }}
                      >
                        {goal.name}
                      </h4>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          opacity: 0.9,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        <Calendar size={14} />{" "}
                        {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className={styles.deleteButton}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px",
                        color: "white",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      title="Usuń cel"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div style={{ marginTop: "1.5rem" }}>
                    <span style={{ fontSize: "2rem", fontWeight: 700 }}>
                      {new Intl.NumberFormat("pl-PL", {
                        style: "currency",
                        currency: "PLN",
                        maximumFractionDigits: 0,
                      }).format(goal.currentAmount)}{" "}
                    </span>
                    <span style={{ opacity: 0.8, fontSize: "0.9rem" }}>
                      /{" "}
                      {new Intl.NumberFormat("pl-PL", {
                        style: "currency",
                        currency: "PLN",
                        maximumFractionDigits: 0,
                      }).format(goal.targetAmount)}
                    </span>
                  </div>
                </div>

                <div
                  className={styles.goalContent}
                  style={{
                    padding: "1.5rem",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    className={styles.progressSection}
                    style={{ marginBottom: "1.5rem" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        color: "#64748b",
                      }}
                    >
                      <span>Postęp</span>
                      <span>{progress.percentage.toFixed(1)}%</span>
                    </div>
                    <div
                      className={styles.progressBar}
                      style={{
                        height: "10px",
                        background:
                          "var(--bg-primary)" /* Ciemniejsze tło paska w dark mode */,
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        className={`${styles.progressFill} ${
                          progress.isCompleted ? styles.completed : ""
                        }`}
                        style={{
                          width: `${progress.percentage}%`,
                          backgroundColor: goal.color,
                          height: "100%",
                          borderRadius: "10px",
                          transition: "width 0.5s ease",
                        }}
                      ></div>
                    </div>

                    {progress.isCompleted && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          color: "var(--success-color)",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Award size={16} />
                        <span>Cel osiągnięty! Gratulacje! 🎉</span>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-color)",
                        padding: "0.75rem",
                        borderRadius: "10px",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Pozostało
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {new Intl.NumberFormat("pl-PL", {
                          style: "currency",
                          currency: "PLN",
                          maximumFractionDigits: 0,
                        }).format(progress.remaining)}
                      </span>
                    </div>
                    <div
                      style={{
                        background: "var(--bg-hover)",
                        padding: "0.75rem",
                        borderRadius: "10px",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Czas
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: progress.isOverdue
                            ? "var(--expense-color)"
                            : "var(--text-primary)",
                        }}
                      >
                        {progress.isOverdue
                          ? "Termin minął!"
                          : getDaysText(progress.daysRemaining)}
                      </span>
                    </div>
                  </div>

                  {/* Informacje o miesięcznych oszczędnościach */}
                  {!progress.isCompleted && progress.daysRemaining > 0 && (
                    <div
                      className={styles.savingsInfo}
                      style={{
                        background: "var(--bg-primary)",
                        border: "1px solid var(--warning-color)",
                        color: "var(--warning-color)",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <PiggyBank size={14} />
                      <span>
                        Odkładaj miesięcznie:{" "}
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
                    <div
                      className={styles.transactions}
                      style={{
                        marginTop: "auto",
                        borderTop: "1px solid var(--border-color)",
                        paddingTop: "1rem",
                      }}
                    >
                      <small
                        style={{
                          display: "block",
                          color: "var(--text-muted)",
                          marginBottom: "0.5rem",
                          fontSize: "0.75rem",
                        }}
                      >
                        Ostatnie wpłaty:
                      </small>
                      {goal.transactions.slice(0, 3).map((transaction) => (
                        <div
                          key={transaction.id}
                          className={styles.transaction}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.85rem",
                            marginBottom: "0.25rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <span>
                            {new Date(transaction.date).toLocaleDateString(
                              "pl-PL",
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
