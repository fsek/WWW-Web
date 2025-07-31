import { useTranslation } from "react-i18next";
import Image from "next/image";

const LanguageSwitcher = () => {
	const { i18n } = useTranslation();
	const language = i18n.resolvedLanguage || "sv"; // Default to Swedish if not set

	const handleLanguageChange = (lng: string) => {
		if (language !== lng) {
			i18n.changeLanguage(lng);
		}
	};

	const languages = {
		en: { flag: "/flags/gb.svg", alt: "English" },
		sv: { flag: "/flags/se.svg", alt: "Svenska" },
	} as const;

	type LanguageKey = keyof typeof languages;

	// Hydration mismatch workaround
	if (!language) return null;

	// Determine the other language to toggle to
	const otherLanguage: LanguageKey = language === "sv" ? "en" : "sv";

	return (
		<div className="flex gap-2 flex-shrink-0">
			<button
				onClick={() => handleLanguageChange(otherLanguage)}
				className="p-1 transition-opacity opacity-80 hover:opacity-100 flex-shrink-0"
				type="button"
				aria-label={`Switch to ${languages[otherLanguage].alt}`}
			>
				<Image
					src={languages[otherLanguage].flag}
					alt={languages[otherLanguage].alt}
					width={24}
					height={16}
					className="h-6 w-8 flex-shrink-0"
				/>
			</button>
		</div>
	);
};

export default LanguageSwitcher;
