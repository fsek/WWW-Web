import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const DarkModeToggle: React.FC = () => {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Prevent hydration mismatch of just this component
	if (!mounted) return null;

	return (
		<button
			onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
			className="p-2 rounded-lg bg-primary-foreground hover:bg-gray-200 hover:dark:bg-zinc-800"
			aria-label="Toggle dark mode"
			type="button"
		>
			{resolvedTheme === "dark" ? (
				<Sun className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-300" />
			) : (
				<Moon className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-300" />
			)}
		</button>
	);
};

export default DarkModeToggle;
