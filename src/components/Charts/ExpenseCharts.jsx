import React from "react";
import { useExpense } from "../../context/ExpenseContext";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import styles from "./ExpenseCharts.module.css";

// Kolory dla wykresów
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
];

function ExpenseCharts() {
  const { allTransactions } = useExpense();

  // Przygotowanie danych dla wykresu kategorii wydatków
  const expenseData = allTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((acc, transaction) => {
      const existing = acc.find((item) => item.name === transaction.category);
      if (existing) {
        existing.value += transaction.amount;
      } else {
        acc.push({
          name: transaction.category,
          value: transaction.amount,
          formattedValue: new Intl.NumberFormat("pl-PL", {
            style: "currency",
            currency: "PLN",
          }).format(transaction.amount),
        });
      }
      return acc;
    }, []);

  // Przygotowanie danych dla wykresu kategorii przychodów
  const incomeData = allTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((acc, transaction) => {
      const existing = acc.find((item) => item.name === transaction.category);
      if (existing) {
        existing.value += transaction.amount;
      } else {
        acc.push({
          name: transaction.category,
          value: transaction.amount,
          formattedValue: new Intl.NumberFormat("pl-PL", {
            style: "currency",
            currency: "PLN",
          }).format(transaction.amount),
        });
      }
      return acc;
    }, []);

  // Przygotowanie danych dla wykresu miesięcznego
  const monthlyData = allTransactions
    .reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

      const existing = acc.find((item) => item.month === monthYear);
      if (existing) {
        if (transaction.type === "income") {
          existing.income += transaction.amount;
        } else {
          existing.expenses += transaction.amount;
        }
      } else {
        acc.push({
          month: monthYear,
          income: transaction.type === "income" ? transaction.amount : 0,
          expenses: transaction.type === "expense" ? transaction.amount : 0,
        });
      }
      return acc;
    }, [])
    .slice(-6); // Ostatnie 6 miesięcy

  // Custom Tooltip dla wykresów
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className={styles.tooltipItem}
              style={{ color: entry.color }}
            >
              {entry.name}:{" "}
              {new Intl.NumberFormat("pl-PL", {
                style: "currency",
                currency: "PLN",
              }).format(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Label dla wykresu kołowego
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }) => {
    if (percent < 0.05) return null; // Nie pokazuj małych procentów

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (allTransactions.length === 0) {
    return (
      <div className={styles.container}>
        <h2>Wizualizacja danych</h2>
        <div className={styles.emptyState}>
          <BarChart3 size={64} />
          <p>Brak danych do wyświetlenia</p>
          <span>Dodaj transakcje, aby zobaczyć wykresy</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Wizualizacja danych</h2>

      <div className={styles.chartsGrid}>
        {/* Wykres słupkowy miesięczny - PEŁNA SZEROKOŚĆ */}
        {monthlyData.length > 0 && (
          <div className={styles.fullWidthChart}>
            <div className={styles.chartHeader}>
              <BarChart3 size={24} />
              <h3>Przychody vs Wydatki (ostatnie 6 miesięcy)</h3>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("pl-PL", {
                        style: "currency",
                        currency: "PLN",
                      }).format(value)
                    }
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar
                    dataKey="income"
                    name="Przychody"
                    fill="#00C49F"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Wydatki"
                    fill="#FF8042"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Wykresy kołowe - OBOK SIEBIE */}
        <div className={styles.pieChartsRow}>
          {/* Wykres kołowy wydatków */}
          {expenseData.length > 0 && (
            <div className={styles.pieChart}>
              <div className={styles.chartHeader}>
                <PieChartIcon size={20} />
                <h3>Struktura wydatków</h3>
              </div>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        new Intl.NumberFormat("pl-PL", {
                          style: "currency",
                          currency: "PLN",
                        }).format(value),
                        "Kwota",
                      ]}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{
                        paddingLeft: "20px",
                        fontSize: "12px",
                      }}
                      formatter={(value, entry, index) => (
                        <span style={{ color: "#374151", fontSize: "12px" }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Wykres kołowy przychodów */}
          {incomeData.length > 0 && (
            <div className={styles.pieChart}>
              <div className={styles.chartHeader}>
                <PieChartIcon size={20} />
                <h3>Struktura przychodów</h3>
              </div>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={incomeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        new Intl.NumberFormat("pl-PL", {
                          style: "currency",
                          currency: "PLN",
                        }).format(value),
                        "Kwota",
                      ]}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{
                        paddingLeft: "20px",
                        fontSize: "12px",
                      }}
                      formatter={(value, entry, index) => (
                        <span style={{ color: "#374151", fontSize: "12px" }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpenseCharts;
