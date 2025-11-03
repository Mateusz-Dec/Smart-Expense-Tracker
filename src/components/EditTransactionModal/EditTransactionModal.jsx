import React, { useState, useEffect } from "react";
import { useExpense } from "../../context/ExpenseContext";
import { X, Save, Edit3 } from "lucide-react";
import styles from "./EditTransactionModal.module.css";

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

function EditTransactionModal({ isOpen, onClose, transaction }) {
  const { editTransaction } = useExpense();

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense",
    category: "Jedzenie",
  });

  const [errors, setErrors] = useState({});

  // Blokada scrolla gdy modal jest otwarty
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Obsługa klawisza ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Wypełnij formularz danymi transakcji gdy modal się otwiera
  useEffect(() => {
    if (transaction && isOpen) {
      setFormData({
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: transaction.category,
      });
      setErrors({});
    }
  }, [transaction, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "Opis jest wymagany";
    } else if (formData.description.trim().length > 50) {
      newErrors.description = "Opis nie może przekraczać 50 znaków";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Kwota musi być większa niż 0";
    } else if (parseFloat(formData.amount) > 1000000) {
      newErrors.amount = "Kwota nie może przekraczać 1,000,000 PLN";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updatedTransaction = {
      ...transaction,
      ...formData,
      amount: parseFloat(formData.amount),
    };

    editTransaction(updatedTransaction);
    handleClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Usuń błąd dla tego pola gdy użytkownik zaczyna pisać
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !transaction) return null;

  const currentCategories =
    formData.type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.titleContainer}>
            <Edit3 size={24} />
            <h3>Edytuj transakcję</h3>
          </div>
          <button onClick={handleClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

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
              className={`form-control ${styles.input} ${
                errors.description ? styles.error : ""
              }`}
            />
            {errors.description && (
              <span className={styles.errorText}>{errors.description}</span>
            )}
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
              className={`form-control ${styles.input} ${
                errors.amount ? styles.error : ""
              }`}
            />
            {errors.amount && (
              <span className={styles.errorText}>{errors.amount}</span>
            )}
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

          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
            >
              Anuluj
            </button>
            <button type="submit" className={styles.saveButton}>
              <Save size={18} />
              Zapisz zmiany
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTransactionModal;
