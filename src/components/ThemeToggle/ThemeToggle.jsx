import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import styles from "./ThemeToggle.module.css";

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={styles.themeToggle}
      aria-label={
        isDarkMode ? "Przełącz na tryb jasny" : "Przełącz na tryb ciemny"
      }
    >
      <div className={styles.toggleTrack}>
        <div
          className={`${styles.toggleThumb} ${
            isDarkMode ? styles.dark : styles.light
          }`}
        >
          {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
        </div>
      </div>
      <span className={styles.toggleLabel}>
        {isDarkMode ? "Tryb ciemny" : "Tryb jasny"}
      </span>
    </button>
  );
}

export default ThemeToggle;
