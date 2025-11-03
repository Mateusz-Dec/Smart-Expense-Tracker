import React from "react";
import { useExpense } from "../../context/ExpenseContext";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import styles from "./ExpenseSummary.module.css";

function ExpenseSummary() {
  const { summary } = useExpense();

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  return (
    <div className={styles.container}>
      <h2>Podsumowanie finansowe</h2>

      <div className={styles.cards}>
        {/* Bilans */}
        <div className={`${styles.card} ${styles.balance}`}>
          <div className={styles.cardIcon}>
            <Wallet size={24} />
          </div>
          <div className={styles.cardContent}>
            <h3>Bilans</h3>
            <p
              className={`${styles.amount} ${
                summary.balance > 0
                  ? styles.positive
                  : summary.balance < 0
                  ? styles.negative
                  : styles.neutral
              }`}
            >
              {formatAmount(summary.balance)}
            </p>
          </div>
        </div>

        {/* Przychody */}
        <div className={`${styles.card} ${styles.income}`}>
          <div className={styles.cardIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.cardContent}>
            <h3>Przychody</h3>
            <p className={styles.amount}>{formatAmount(summary.income)}</p>
          </div>
        </div>

        {/* Wydatki */}
        <div className={`${styles.card} ${styles.expense}`}>
          <div className={styles.cardIcon}>
            <TrendingDown size={24} />
          </div>
          <div className={styles.cardContent}>
            <h3>Wydatki</h3>
            <p className={styles.amount}>{formatAmount(summary.expenses)}</p>
          </div>
        </div>
      </div>

      {/* Procentowy udział wydatków w przychodach */}
      {summary.income > 0 && (
        <div className={styles.ratio}>
          <div className={styles.ratioLabel}>
            <span>Wydatki/Przychody:</span>
            <span>
              {((summary.expenses / summary.income) * 100).toFixed(1)}%
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${Math.min(
                  (summary.expenses / summary.income) * 100,
                  100
                )}%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseSummary;
