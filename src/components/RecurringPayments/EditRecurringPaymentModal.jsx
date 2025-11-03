import React, { useState, useEffect } from "react";
import { Calendar, Repeat, Save, X } from "lucide-react";
import styles from "./EditRecurringPaymentModal.module.css";

const CATEGORIES = [
  "Rachunki",
  "Subskrypcje",
  "Kredyt",
  "Czynsz",
  "Transport",
  "Inne",
];

const frequencies = [
  { value: "daily", label: "Codziennie" },
  { value: "weekly", label: "Tygodniowo" },
  { value: "monthly", label: "Miesięcznie" },
  { value: "quarterly", label: "Kwartalnie" },
  { value: "yearly", label: "Rocznie" },
];

function EditRecurringPaymentModal({ isOpen, onClose, payment, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "Rachunki",
    frequency: "monthly",
    nextDate: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  // Wypełnij formularz danymi płatności gdy modal się otwiera
  useEffect(() => {
    if (payment && isOpen) {
      setFormData({
        name: payment.name,
        amount: payment.amount.toString(),
        category: payment.category,
        frequency: payment.frequency,
        nextDate: payment.nextDate,
        isActive: payment.isActive,
      });
      setErrors({});
    }
  }, [payment, isOpen]);
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nazwa jest wymagana";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Kwota musi być większa niż 0";
    }

    if (!formData.nextDate) {
      newErrors.nextDate = "Data jest wymagana";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updatedPayment = {
      ...payment,
      ...formData,
      amount: parseFloat(formData.amount),
    };

    onSave(updatedPayment);
    handleClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

  if (!isOpen || !payment) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.titleContainer}>
            <Repeat size={24} />
            <h3>Edytuj cykliczną płatność</h3>
          </div>
          <button onClick={handleClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nazwa płatności:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Np. Czynsz, Netflix, Abonament"
              className={`form-control ${styles.input} ${
                errors.name ? styles.error : ""
              }`}
            />
            {errors.name && (
              <span className={styles.errorText}>{errors.name}</span>
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

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="category">Kategoria:</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              className={`form-select ${styles.select}`}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="frequency">Częstotliwość:</label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
              className={`form-select ${styles.select}`}
              >
                {frequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="nextDate">Następna płatność:</label>
            <input
              type="date"
              id="nextDate"
              name="nextDate"
              value={formData.nextDate}
              onChange={handleChange}
              className={`form-control ${styles.input} ${
                errors.nextDate ? styles.error : ""
              }`}
            />
            {errors.nextDate && (
              <span className={styles.errorText}>{errors.nextDate}</span>
            )}
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Aktywna płatność</span>
            </label>
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

export default EditRecurringPaymentModal;
