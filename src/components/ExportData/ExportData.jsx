import React, { useState } from "react";
import { registerRoboto } from "../../utils/fonts/Roboto-Light-normal";
import { useExpense } from "../../context/ExpenseContext";
import { Download, FileText, Sheet, Archive, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./ExportData.module.css";

// Import bibliotek PDF
let jsPDF;

if (typeof window !== "undefined") {
  import("jspdf").then((module) => {
    jsPDF = module.default;
  });
}

// Funkcja do ustawienia czcionki z polskimi znakami
const setupPDFWithPolishFont = () => {
  if (!jsPDF) return null;
  const pdf = new jsPDF("p", "mm", "a4");
  registerRoboto(pdf);
  pdf.setFont("Roboto", "normal");
  return pdf;
};

function ExportData() {
  const { allTransactions, summary } = useExpense();
  const [exportType, setExportType] = useState("pdf");
  const [dateRange, setDateRange] = useState("all");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const dateRanges = [
    { value: "all", label: "Cały okres" },
    { value: "month", label: "Ostatni miesiąc" },
    { value: "quarter", label: "Ostatni kwartał" },
    { value: "year", label: "Ostatni rok" },
  ];

  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate = new Date(0);

    switch (dateRange) {
      case "month":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        break;
      case "quarter":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate()
        );
        break;
      case "year":
        startDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        );
        break;
      case "all":
      default:
        return allTransactions;
    }

    return allTransactions.filter(
      (transaction) => new Date(transaction.date) >= startDate
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  const exportToCSV = () => {
    const transactions = getFilteredTransactions();

    if (transactions.length === 0) {
      toast.error("Brak danych do eksportu w wybranym okresie");
      return;
    }

    const headers = ["Data", "Opis", "Kategoria", "Typ", "Kwota (PLN)"];

    const csvData = transactions.map((transaction) => [
      new Date(transaction.date).toLocaleDateString("pl-PL"),
      `"${transaction.description.replace(/"/g, '""')}"`,
      `"${transaction.category}"`,
      transaction.type === "income" ? "Przychód" : "Wydatek",
      transaction.amount.toFixed(2).replace(".", ","),
    ]);

    const csvContent = [
      headers.join(";"),
      ...csvData.map((row) => row.join(";")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `wydatki_${new Date().toISOString().split("T")[0]}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Dane wyeksportowane do CSV! 📊");
  };

  const exportToJSON = () => {
    const transactions = getFilteredTransactions();

    if (transactions.length === 0) {
      toast.error("Brak danych do eksportu w wybranym okresie");
      return;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      dateRange,
      summary: {
        totalTransactions: transactions.length,
        totalIncome: transactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: transactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0),
        balance: summary.balance,
      },
      transactions: transactions,
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `wydatki_backup_${new Date().toISOString().split("T")[0]}.json`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Backup danych utworzony! 💾");
  };

  const generatePDF = async () => {
    if (!jsPDF) {
      toast.error("Biblioteka PDF nie jest załadowana. Spróbuj ponownie.");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const transactions = getFilteredTransactions();

      if (transactions.length === 0) {
        toast.error("Brak danych do eksportu w wybranym okresie");
        return;
      }

      // Tworzenie PDF z czcionką obsługującą polskie znaki
      let pdf = setupPDFWithPolishFont();
      if (!pdf) {
        toast.error("Nie udało się utworzyć PDF");
        return;
      }

      let yPosition = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;

      // Nagłówek z polskimi znakami
      pdf.setFontSize(20);
      pdf.setTextColor(44, 62, 80);
      pdf.text("Raport Finansowy - Smart Expense Tracker", margin, yPosition);
      yPosition += 10;

      // Data wygenerowania z polskimi znakami
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        `Wygenerowano: ${new Date().toLocaleDateString(
          "pl-PL"
        )} ${new Date().toLocaleTimeString("pl-PL")}`,
        margin,
        yPosition
      );
      yPosition += 15;

      // Podsumowanie z polskimi znakami
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text("Podsumowanie:", margin, yPosition);
      yPosition += 8;

      const summaryData = getExportSummary();
      pdf.setFontSize(10);

      pdf.text(
        `Liczba transakcji: ${summaryData.totalTransactions}`,
        margin + 5,
        yPosition
      );
      yPosition += 5;

      pdf.setTextColor(5, 150, 105);
      pdf.text(
        `Przychody: ${formatCurrency(summaryData.totalIncome)}`,
        margin + 5,
        yPosition
      );
      yPosition += 5;

      pdf.setTextColor(220, 38, 38);
      pdf.text(
        `Wydatki: ${formatCurrency(summaryData.totalExpenses)}`,
        margin + 5,
        yPosition
      );
      yPosition += 5;

      pdf.setTextColor(
        summaryData.balance >= 0 ? 5 : 220,
        summaryData.balance >= 0 ? 150 : 38,
        summaryData.balance >= 0 ? 105 : 38
      );
      pdf.text(
        `Bilans: ${formatCurrency(summaryData.balance)}`,
        margin + 5,
        yPosition
      );
      yPosition += 15;

      // Tabela transakcji z polskimi znakami
      if (transactions.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(44, 62, 80);
        pdf.text("Transakcje:", margin, yPosition);
        yPosition += 10;

        // Nagłówki tabeli z polskimi znakami
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F");
        pdf.setFontSize(8);
        pdf.setTextColor(55, 65, 81);

        pdf.text("Data", margin + 2, yPosition + 5);
        pdf.text("Opis", margin + 25, yPosition + 5);
        pdf.text("Kategoria", margin + 90, yPosition + 5);
        pdf.text("Typ", margin + 120, yPosition + 5);
        pdf.text("Kwota", margin + 145, yPosition + 5);

        yPosition += 10;

        // Wiersze z transakcjami z polskimi znakami
        pdf.setFontSize(7);
        transactions.forEach((transaction, index) => {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
            // Ustaw czcionkę na nowej stronie
            pdf.setFont("helvetica");
          }

          const bgColor = index % 2 === 0 ? [255, 255, 255] : [249, 250, 251];
          pdf.setFillColor(...bgColor);
          pdf.rect(margin, yPosition, pageWidth - 2 * margin, 6, "F");

          pdf.setTextColor(55, 65, 81);

          // Data
          pdf.text(
            new Date(transaction.date).toLocaleDateString("pl-PL"),
            margin + 2,
            yPosition + 4
          );

          // Opis - skrócony jeśli za długi
          const description =
            transaction.description.length > 30
              ? transaction.description.substring(0, 27) + "..."
              : transaction.description;
          pdf.text(description, margin + 25, yPosition + 4);

          // Kategoria
          pdf.text(transaction.category, margin + 90, yPosition + 4);

          // Typ
          const typeText =
            transaction.type === "income" ? "Przychód" : "Wydatek";
          pdf.text(typeText, margin + 120, yPosition + 4);

          // Kwota z polskim zł
          pdf.setTextColor(
            transaction.type === "income" ? 5 : 220,
            transaction.type === "income" ? 150 : 38,
            transaction.type === "income" ? 105 : 38
          );
          pdf.text(
            formatCurrency(transaction.amount),
            margin + 145,
            yPosition + 4
          );

          yPosition += 7;
        });
      }

      // Stopka z polskimi znakami
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Strona ${i} z ${pageCount}`, pageWidth / 2, 290, {
          align: "center",
        });
      }

      // Zapisz PDF
      pdf.save(
        `raport_finansowy_${new Date().toISOString().split("T")[0]}.pdf`
      );
      toast.success("Raport PDF z polskimi znakami wygenerowany! 📄");
    } catch (error) {
      console.error("Błąd generowania PDF:", error);
      toast.error("Błąd podczas generowania PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleExport = () => {
    switch (exportType) {
      case "csv":
        exportToCSV();
        break;
      case "json":
        exportToJSON();
        break;
      case "pdf":
        generatePDF();
        break;
      default:
        toast.error("Wybierz typ eksportu");
    }
  };

  const getExportSummary = () => {
    const transactions = getFilteredTransactions();
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalTransactions: transactions.length,
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    };
  };

  const summaryData = getExportSummary();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Download size={24} />
          <h2>Eksport danych</h2>
        </div>
      </div>

      {/* Podsumowanie danych */}
      <div className={styles.summary}>
        <h3>Podsumowanie eksportu</h3>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span>Transakcje:</span>
            <strong>{summaryData.totalTransactions}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Przychody:</span>
            <strong className={styles.income}>
              {formatCurrency(summaryData.totalIncome)}
            </strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Wydatki:</span>
            <strong className={styles.expense}>
              {formatCurrency(summaryData.totalExpenses)}
            </strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Bilans:</span>
            <strong
              className={
                summaryData.balance >= 0 ? styles.income : styles.expense
              }
            >
              {formatCurrency(summaryData.balance)}
            </strong>
          </div>
        </div>
      </div>

      {/* Opcje eksportu */}
      <div className={styles.exportOptions}>
        <div className={styles.optionGroup}>
          <label>
            <Calendar size={18} />
            Zakres dat:
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={`form-select ${styles.select}`}
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.optionGroup}>
          <label>
            <FileText size={18} />
            Format eksportu:
          </label>
          <div className={styles.formatOptions}>
            <label className={styles.formatOption}>
              <input
                type="radio"
                value="pdf"
                checked={exportType === "pdf"}
                onChange={(e) => setExportType(e.target.value)}
              />
              <div className={styles.formatCard}>
                <FileText size={24} />
                <span>PDF</span>
              </div>
            </label>

            <label className={styles.formatOption}>
              <input
                type="radio"
                value="csv"
                checked={exportType === "csv"}
                onChange={(e) => setExportType(e.target.value)}
              />
              <div className={styles.formatCard}>
                <Sheet size={24} />
                <span>CSV</span>
              </div>
            </label>

            <label className={styles.formatOption}>
              <input
                type="radio"
                value="json"
                checked={exportType === "json"}
                onChange={(e) => setExportType(e.target.value)}
              />
              <div className={styles.formatCard}>
                <Archive size={24} />
                <span>JSON</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Przycisk eksportu */}
      <div className={styles.exportAction}>
        <button
          onClick={handleExport}
          className={styles.exportButton}
          disabled={isGeneratingPDF}
        >
          <Download size={20} />
          {isGeneratingPDF
            ? "Generowanie PDF..."
            : exportType === "pdf"
            ? "Wygeneruj raport PDF"
            : exportType === "csv"
            ? "Eksportuj do CSV"
            : "Utwórz backup JSON"}
        </button>
      </div>

      {/* Przykładowy podgląd dla CSV */}
      {exportType === "csv" && summaryData.totalTransactions > 0 && (
        <div className={styles.preview}>
          <h4>Podgląd danych CSV (pierwsze 5 transakcji):</h4>
          <div className={styles.previewTable}>
            <div className={styles.previewHeader}>
              <span>Data</span>
              <span>Opis</span>
              <span>Kategoria</span>
              <span>Typ</span>
              <span>Kwota</span>
            </div>
            {getFilteredTransactions()
              .slice(0, 5)
              .map((transaction, index) => (
                <div key={index} className={styles.previewRow}>
                  <span>
                    {new Date(transaction.date).toLocaleDateString("pl-PL")}
                  </span>
                  <span>{transaction.description}</span>
                  <span>{transaction.category}</span>
                  <span
                    className={
                      transaction.type === "income"
                        ? styles.income
                        : styles.expense
                    }
                  >
                    {transaction.type === "income" ? "Przychód" : "Wydatek"}
                  </span>
                  <span
                    className={
                      transaction.type === "income"
                        ? styles.income
                        : styles.expense
                    }
                  >
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExportData;
