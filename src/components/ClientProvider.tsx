"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Spinner } from "./Spinner";

export default function ClientProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { i18n } = useTranslation();
	const [isMounted, setIsMounted] = useState(false);
	const [storedLanguage, setStoredLanguage] = useState<string | null>(null);

	useEffect(() => {
		const lng =
			typeof window !== "undefined" ? localStorage.getItem("i18nextLng") : null;
		setStoredLanguage(lng);
		if (lng && i18n.language !== lng) {
			i18n.changeLanguage(lng);
		}
		setIsMounted(true);
	}, [i18n]);

	// Splash screen to prevent theme flash (unless we are using the default language)
	if (!isMounted && storedLanguage !== "sv") {
		return (
			<div
				className="
					fixed inset-0 z-[9999] flex items-center justify-center
				"
				aria-hidden="true"
			>
				<Spinner className="h-12 w-12 md:h-20 md:w-20" />
			</div>
		);
	}

	return <>{children}</>;
}
