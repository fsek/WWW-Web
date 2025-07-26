"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function CookieConsent() {
	const { t } = useTranslation("main");
	const [showBanner, setShowBanner] = useState(false);

	useEffect(() => {
		const consent = localStorage.getItem("cookieConsent");
		if (!consent) {
			setShowBanner(true);
		}
	}, []);

	const handleAccept = () => {
		localStorage.setItem("cookieConsent", "accepted");
		setShowBanner(false);
	};

	if (!showBanner) return null;

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 dark:bg-background/80 backdrop-blur-md border-t border-border shadow-lg">
			<div className="max-w-7xl mx-auto px-4 py-3">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
					<div className="text-xs sm:text-sm text-muted-foreground flex-1 leading-relaxed">
						<p>
							{t(
								"cookieConsent.message",
								"We use cookies to improve your experience on our website.",
							)}
						</p>
					</div>
					<Button
						onClick={handleAccept}
						size="sm"
						className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground border-0 rounded-lg px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105"
					>
						{t("cookieConsent.accept", "OK")}
					</Button>
				</div>
			</div>
		</div>
	);
}
