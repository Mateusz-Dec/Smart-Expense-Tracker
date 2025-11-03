import React, { useState } from "react";
import { useExpense } from "../../context/ExpenseContext";
import toast from "react-hot-toast";
import styles from "./ExpenseForm.module.css";

const EXPENSE_CATEGORIES = [
  "Jedzenie",
  "Transport",
  "Rozrywka",
  "Zdrowie",
  "Zakupy",
  "Rachunki",
  "Inne",
];
const INCOME_CATEGORIES = ["Praca", "Inwestycje", "Prezent", "Zwrot", "Inne"];

function ExpenseForm() {
  const { addTransaction } = useExpense();

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense",
    category: "Jedzenie",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error("Proszę wpisać opis transakcji");
      return;
    }

    if (formData.description.trim().length > 50) {
      toast.error("Opis nie może przekraczać 50 znaków");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Proszę wpisać prawidłową kwotę większą niż 0");
      return;
    }

    if (parseFloat(formData.amount) > 1000000) {
      toast.error("Kwota nie może przekraczać 1,000,000 PLN");
      return;
    }

    const transaction = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date().toISOString(),
    };

    addTransaction(transaction);

    // Reset form
    setFormData({
      description: "",
      amount: "",
      type: "expense",
      category: "Jedzenie",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const currentCategories =
    formData.type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className={styles.formContainer}>
      <h2>Dodaj transakcję</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Typ transakcji:</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="type"
                value="expense"
                checked={formData.type === "expense"}
                onChange={handleChange}
              />
              <span className={`${styles.radioText} ${styles.expense}`}>
                Wydatek
              </span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="type"
                value="income"
                checked={formData.type === "income"}
                onChange={handleChange}
              />
              <span className={`${styles.radioText} ${styles.income}`}>
                Przychód
              </span>
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Opis:</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Np. Zakupy spożywcze"
            className={`form-control ${styles.input}`}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="amount">Kwota (PLN):</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`form-control ${styles.input}`}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category">Kategoria:</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`form-select ${styles.select}`}
          >
            {currentCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className={styles.submitButton}>
          Dodaj transakcję
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;
