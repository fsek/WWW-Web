import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const DarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean | null>(null); // Start as null to avoid hydration mismatch

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      setIsDark(saved === "true");
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  useEffect(() => {
    if (isDark !== null) {
      if (isDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("darkMode", "true");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("darkMode", "false");
      }
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((prev) => !prev)}
      className="p-2 rounded-lg bg-primary-foreground hover:bg-gray-200 hover:dark:bg-zinc-800"
      aria-label="Toggle dark mode"
      type="button"
    >
      {isDark === null ? null : isDark ? (
        <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-300" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-300" />
      )}
    </button>
  );
};

export default DarkModeToggle;
