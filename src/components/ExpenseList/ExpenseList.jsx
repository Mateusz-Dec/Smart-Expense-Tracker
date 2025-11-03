import React, { useState } from "react";
import { useExpense } from "../../context/ExpenseContext";
import { Trash2, TrendingUp, TrendingDown, Edit3 } from "lucide-react";
import toast from "react-hot-toast";
import EditTransactionModal from "../EditTransactionModal/EditTransactionModal";
import styles from "./ExpenseList.module.css";

function ExpenseList() {
  const { transactions, deleteTransaction } = useExpense();
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = (id, description) => {
    deleteTransaction(id);
    toast.success(`Usunięto transakcję: ${description}`);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount, type) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  if (transactions.length === 0) {
    return (
      <div className={styles.container}>
        <h2>Historia transakcji</h2>
        <div className={styles.emptyState}>
          <p>Brak transakcji</p>
          <span>Dodaj pierwszą transakcję używając formularza</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <h2>Historia transakcji ({transactions.length})</h2>

        <div className={styles.transactionsList}>
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`${styles.transactionItem} ${
                transaction.type === "income" ? styles.income : styles.expense
              }`}
            >
              <div className={styles.transactionIcon}>
                {transaction.type === "income" ? (
                  <TrendingUp size={20} />
                ) : (
                  <TrendingDown size={20} />
                )}
              </div>

              <div className={styles.transactionInfo}>
                <div className={styles.transactionDescription}>
                  {transaction.description}
                </div>
                <div className={styles.transactionMeta}>
                  <span className={styles.category}>
                    {transaction.category}
                  </span>
                  <span className={styles.date}>
                    {formatDate(transaction.date)}
                  </span>
                </div>
              </div>

              <div className={styles.transactionAmount}>
                {formatAmount(transaction.amount, transaction.type)}
              </div>

              <div className={styles.transactionActions}>
                <button
                  onClick={() => handleEdit(transaction)}
                  className={styles.editButton}
                  title="Edytuj transakcję"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() =>
                    handleDelete(transaction.id, transaction.description)
                  }
                  className={styles.deleteButton}
                  title="Usuń transakcję"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        transaction={editingTransaction}
      />
    </>
  );
}

export default ExpenseList;
