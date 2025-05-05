import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";

// This component is very temporary. The process of loading the saved language is not properly implemented.

const LanguageSwitcher = () => {
	const { i18n } = useTranslation();
	const [language, setLanguage] = useState<string | null>(null);

	useEffect(() => {
		// Retrieve language from localStorage or use i18n's resolvedLanguage or default to 'sv'
		const storedLanguage = localStorage.getItem("i18nextLng");
		const initialLanguage = storedLanguage || i18n.resolvedLanguage || "sv";
		console.log("Initial language:", initialLanguage);
		setLanguage(initialLanguage);
	}, [i18n.resolvedLanguage]);

	// This does not work properly because we use static export
	const handleLanguageChange = (lng: string) => {
		if (language !== lng) {
			i18n.changeLanguage(lng).then(() => {
				// Update localStorage and cookie
				localStorage.setItem("i18nextLng", lng);
				// document.cookie = `i18next=${lng}; path=/`;
				setLanguage(lng);
			});
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
		<div className="flex gap-2">
			<button
				onClick={() => handleLanguageChange(otherLanguage)}
				className="p-1 transition-opacity opacity-80 hover:opacity-100"
				type="button"
			>
				<Image
					src={languages[otherLanguage].flag}
					alt={languages[otherLanguage].alt}
					width={24}
					height={16}
				/>
			</button>
		</div>
	);
};

export default LanguageSwitcher;
