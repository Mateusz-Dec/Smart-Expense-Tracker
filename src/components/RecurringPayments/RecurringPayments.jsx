import React, { useState } from "react";
import { useExpense } from "../../context/ExpenseContext";
import {
  Plus,
  Repeat,
  Trash2,
  CreditCard,
  Calendar,
  Bell,
  Edit3,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./RecurringPayments.module.css";
import EditRecurringPaymentModal from "./EditRecurringPaymentModal";
import { EXPENSE_CATEGORIES as CATEGORIES } from "../../utils/constants";

function RecurringPayments() {
  const { addTransaction } = useExpense();
  const [payments, setPayments] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    name: "",
    amount: "",
    category: "Rachunki",
    frequency: "monthly",
    nextDate: "",
    isActive: true,
  });

  const frequencies = [
    { value: "daily", label: "Codziennie" },
    { value: "weekly", label: "Tygodniowo" },
    { value: "monthly", label: "Miesięcznie" },
    { value: "quarterly", label: "Kwartalnie" },
    { value: "yearly", label: "Rocznie" },
  ];

  const addPayment = () => {
    if (!newPayment.name.trim()) {
      toast.error("Proszę wpisać nazwę płatności");
      return;
    }

    if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) {
      toast.error("Proszę wpisać prawidłową kwotę");
      return;
    }

    if (!newPayment.nextDate) {
      toast.error("Proszę wybrać datę kolejnej płatności");
      return;
    }

    const payment = {
      id: Date.now(),
      ...newPayment,
      amount: parseFloat(newPayment.amount),
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [...prev, payment]);
    setNewPayment({
      name: "",
      amount: "",
      category: "Rachunki",
      frequency: "monthly",
      nextDate: "",
      isActive: true,
    });
    setIsAdding(false);
    toast.success("Cykliczna płatność dodana! 🔄");
  };

  const deletePayment = (id) => {
    setPayments((prev) => prev.filter((payment) => payment.id !== id));
    toast.success("Płatność usunięta");
  };

  const togglePayment = (id) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === id
          ? { ...payment, isActive: !payment.isActive }
          : payment,
      ),
    );
  };

  const editPayment = (payment) => {
    setEditingPayment(payment);
    setIsEditModalOpen(true);
  };

  const handleSavePayment = (updatedPayment) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === updatedPayment.id ? updatedPayment : payment,
      ),
    );
    toast.success("Płatność zaktualizowana! ✏️");
  };

  const addAsTransaction = (payment) => {
    const transaction = {
      description: payment.name,
      amount: payment.amount,
      type: "expense",
      category: payment.category,
      date: new Date().toISOString(),
    };

    addTransaction(transaction);

    // Aktualizuj datę kolejnej płatności
    const nextDate = calculateNextDate(payment.nextDate, payment.frequency);
    setPayments((prev) =>
      prev.map((p) => (p.id === payment.id ? { ...p, nextDate } : p)),
    );

    toast.success(`Dodano płatność: ${payment.name}`);
  };

  const calculateNextDate = (currentDate, frequency) => {
    const date = new Date(currentDate);

    switch (frequency) {
      case "daily":
        date.setDate(date.getDate() + 1);
        break;
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        break;
    }

    return date.toISOString().split("T")[0];
  };

  const getDaysUntil = (dateString) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Dzisiaj";
    if (diffDays === 1) return "Jutro";
    if (diffDays < 0) return "Termin minął";
    return `Za ${diffDays} dni`;
  };

  const getUpcomingPayments = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return payments
      .filter((payment) => payment.isActive)
      .filter((payment) => {
        const paymentDate = new Date(payment.nextDate);
        return paymentDate <= nextWeek && paymentDate >= today;
      })
      .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate));
  };

  const totalMonthly = payments
    .filter((payment) => payment.isActive && payment.frequency === "monthly")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const upcomingPayments = getUpcomingPayments();

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Repeat size={24} />
            <h2>Cykliczne płatności</h2>
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
            {isAdding ? "Anuluj" : "Nowa płatność"}
          </button>
        </div>

        {/* Szybkie statystyki */}
        {payments.length > 0 && (
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <CreditCard size={20} />
              <div>
                <span>Aktywne płatności</span>
                <strong>{payments.filter((p) => p.isActive).length}</strong>
              </div>
            </div>
            <div className={styles.statItem}>
              <Calendar size={20} />
              <div>
                <span>Miesięczny koszt</span>
                <strong>
                  {new Intl.NumberFormat("pl-PL", {
                    style: "currency",
                    currency: "PLN",
                  }).format(totalMonthly)}
                </strong>
              </div>
            </div>
            <div className={styles.statItem}>
              <Bell size={20} />
              <div>
                <span>Nadchodzące</span>
                <strong>{upcomingPayments.length}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Nadchodzące płatności */}
        {upcomingPayments.length > 0 && (
          <div className={styles.upcomingSection}>
            <h3>🛎️ Nadchodzące płatności</h3>
            <div className={styles.upcomingList}>
              {upcomingPayments.map((payment) => (
                <div key={payment.id} className={styles.upcomingItem}>
                  <div className={styles.upcomingInfo}>
                    <span className={styles.paymentName}>{payment.name}</span>
                    <span className={styles.paymentAmount}>
                      {new Intl.NumberFormat("pl-PL", {
                        style: "currency",
                        currency: "PLN",
                      }).format(payment.amount)}
                    </span>
                  </div>
                  <div className={styles.upcomingMeta}>
                    <span className={styles.dueDate}>
                      {new Date(payment.nextDate).toLocaleDateString("pl-PL")} •{" "}
                      {getDaysUntil(payment.nextDate)}
                    </span>
                    <button
                      onClick={() => addAsTransaction(payment)}
                      className={styles.payNowButton}
                    >
                      Zapłać teraz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formularz dodawania płatności */}
        {isAdding && (
          <div className={styles.paymentForm}>
            <h3>Dodaj cykliczną płatność</h3>
            <div className={styles.form}>
              <input
                type="text"
                placeholder="Nazwa płatności (np. Czynsz, Netflix, Abonament)"
                value={newPayment.name}
                onChange={(e) =>
                  setNewPayment((prev) => ({ ...prev, name: e.target.value }))
                }
                className={`form-control ${styles.input}`}
              />
              <input
                type="number"
                placeholder="Kwota"
                value={newPayment.amount}
                onChange={(e) =>
                  setNewPayment((prev) => ({ ...prev, amount: e.target.value }))
                }
                className={`form-control ${styles.input}`}
                min="0"
                step="0.01"
              />
              <select
                value={newPayment.category}
                onChange={(e) =>
                  setNewPayment((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className={`form-select ${styles.select}`}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={newPayment.frequency}
                onChange={(e) =>
                  setNewPayment((prev) => ({
                    ...prev,
                    frequency: e.target.value,
                  }))
                }
                className={`form-select ${styles.select}`}
              >
                {frequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={newPayment.nextDate}
                onChange={(e) =>
                  setNewPayment((prev) => ({
                    ...prev,
                    nextDate: e.target.value,
                  }))
                }
                className={`form-control ${styles.input}`}
                min={new Date().toISOString().split("T")[0]}
              />
              <div className={styles.formActions}>
                <button onClick={addPayment} className={styles.saveButton}>
                  <Repeat size={18} />
                  Dodaj płatność
                </button>
              </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista wszystkich płatności */}
        <div className={styles.paymentsList}>
          {payments.length === 0 ? (
            <div className={styles.emptyState}>
              <Repeat size={48} />
              <p>Brak cyklicznych płatności</p>
              <span>Dodaj stałe płatności, aby śledzić swoje zobowiązania</span>
            </div>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className={`${styles.paymentItem} ${
                  !payment.isActive ? styles.inactive : ""
                }`}
              >
                <div className={styles.paymentHeader}>
                  <div className={styles.paymentInfo}>
                    <h4>{payment.name}</h4>
                    <div className={styles.paymentMeta}>
                      <span className={styles.amount}>
                        {new Intl.NumberFormat("pl-PL", {
                          style: "currency",
                          currency: "PLN",
                        }).format(payment.amount)}
                      </span>
                      <span className={styles.frequency}>
                        {
                          frequencies.find((f) => f.value === payment.frequency)
                            ?.label
                        }
                      </span>
                      <span className={styles.category}>
                        {payment.category}
                      </span>
                    </div>
                  </div>
                  <div className={styles.paymentActions}>
                    <button
                      onClick={() => editPayment(payment)}
                      className={styles.editButton}
                      title="Edytuj"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => togglePayment(payment.id)}
                      className={`${styles.toggleButton} ${
                        payment.isActive ? styles.active : ""
                      }`}
                      title={payment.isActive ? "Wyłącz" : "Włącz"}
                    >
                      {payment.isActive ? "✅" : "❌"}
                    </button>
                    <button
                      onClick={() => addAsTransaction(payment)}
                      className={styles.payButton}
                      title="Dodaj jako transakcję"
                    >
                      💳
                    </button>
                    <button
                      onClick={() => deletePayment(payment.id)}
                      className={styles.deleteButton}
                      title="Usuń"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className={styles.paymentFooter}>
                  <span className={styles.nextPayment}>
                    <Calendar size={14} />
                    Następna płatność:{" "}
                    {new Date(payment.nextDate).toLocaleDateString(
                      "pl-PL",
                    )} • {getDaysUntil(payment.nextDate)}
                  </span>
                  {!payment.isActive && (
                    <span className={styles.inactiveLabel}>Nieaktywna</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <EditRecurringPaymentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        payment={editingPayment}
        onSave={handleSavePayment}
      />
    </>
  );
}

export default RecurringPayments;
