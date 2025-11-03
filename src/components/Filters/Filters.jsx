import React from "react";
import { useExpense } from "../../context/ExpenseContext";
import { Filter, X } from "lucide-react";
import styles from "./Filters.module.css";

const EXPENSE_CATEGORIES = [
  "Wszystkie",
  "Jedzenie",
  "Transport",
  "Rozrywka",
  "Zdrowie",
  "Zakupy",
  "Rachunki",
  "Inne",
];
const INCOME_CATEGORIES = [
  "Wszystkie",
  "Praca",
  "Inwestycje",
  "Prezent",
  "Zwrot",
  "Inne",
];

function Filters() {
  const { filters, setFilters, transactions } = useExpense();

  const handleFilterChange = (filterType, value) => {
    setFilters({ [filterType]: value });
  };

  const clearFilters = () => {
    setFilters({
      category: "all",
      type: "all",
      dateRange: "all",
      search: "",
    });
  };

  const getFilteredCount = () => {
    return transactions.length;
  };

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.type !== "all" ||
    filters.dateRange !== "all" ||
    (filters.search && filters.search.trim() !== "");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Filter size={20} />
          <h3>Filtry i sortowanie</h3>
        </div>
        {hasActiveFilters && (
          <button onClick={clearFilters} className={styles.clearButton}>
            <X size={16} />
            Wyczyść filtry
          </button>
        )}
      </div>

      <div className={styles.filtersGrid}>
        {/* Wyszukiwanie */}
        <div className={styles.filterGroup}>
          <label>Wyszukaj:</label>
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className={`form-control ${styles.searchInput}`}
            placeholder="Szukaj po opisie lub kategorii"
          />
        </div>

        {/* Filtrowanie po typie */}
        <div className={styles.filterGroup}>
          <label>Typ transakcji:</label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className={`form-select ${styles.select}`}
          >
            <option value="all">Wszystkie typy</option>
            <option value="income">Tylko przychody</option>
            <option value="expense">Tylko wydatki</option>
          </select>
        </div>

        {/* Filtrowanie po kategorii */}
        <div className={styles.filterGroup}>
          <label>Kategoria:</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className={`form-select ${styles.select}`}
          >
            <option value="all">Wszystkie kategorie</option>
            {filters.type === "income" || filters.type === "all"
              ? INCOME_CATEGORIES.filter((cat) => cat !== "Wszystkie").map(
                  (category) => (
                    <option key={`income-${category}`} value={category}>
                      📈 {category}
                    </option>
                  )
                )
              : null}
            {filters.type === "expense" || filters.type === "all"
              ? EXPENSE_CATEGORIES.filter((cat) => cat !== "Wszystkie").map(
                  (category) => (
                    <option key={`expense-${category}`} value={category}>
                      📉 {category}
                    </option>
                  )
                )
              : null}
          </select>
        </div>

        {/* Filtrowanie po czasie */}
        <div className={styles.filterGroup}>
          <label>Okres czasu:</label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange("dateRange", e.target.value)}
            className={`form-select ${styles.select}`}
          >
            <option value="all">Cały okres</option>
            <option value="today">Dzisiaj</option>
            <option value="week">Ostatni tydzień</option>
            <option value="month">Ostatni miesiąc</option>
            <option value="year">Ostatni rok</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className={styles.activeFilters}>
          <span>Aktywne filtry: </span>
          {filters.type !== "all" && (
            <span className={styles.filterTag}>
              Typ: {filters.type === "income" ? "Przychody" : "Wydatki"}
            </span>
          )}
          {filters.category !== "all" && (
            <span className={styles.filterTag}>
              Kategoria: {filters.category}
            </span>
          )}
          {filters.search && filters.search.trim() !== "" && (
            <span className={styles.filterTag}>
              Szukaj: {filters.search.trim()}
            </span>
          )}
          {filters.dateRange !== "all" && (
            <span className={styles.filterTag}>
              Okres:{" "}
              {filters.dateRange === "today"
                ? "Dzisiaj"
                : filters.dateRange === "week"
                ? "Ostatni tydzień"
                : filters.dateRange === "month"
                ? "Ostatni miesiąc"
                : "Ostatni rok"}
            </span>
          )}
          <span className={styles.resultsCount}>
            Znaleziono: {getFilteredCount()} transakcji
          </span>
        </div>
      )}
    </div>
  );
}

export default Filters;
