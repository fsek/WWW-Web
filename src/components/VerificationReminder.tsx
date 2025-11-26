"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function VerificationReminder({
	showBanner = false,
}: { showBanner?: boolean }) {
	const { t } = useTranslation("main");
	const router = useRouter();

	if (!showBanner) return null;

	return (
		<div className="bg-background/90 dark:bg-background/80 backdrop-blur-md border-t border-border shadow-lg">
			<div className="max-w-7xl mx-auto px-4 py-3">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
					<div className="text-xs sm:text-sm text-muted-foreground flex-1 leading-relaxed">
						<p>{t("verifyReminder.message")}</p>
					</div>
					<Button
						onClick={() => router.push("/verify")}
						size="sm"
						className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground border-0 rounded-lg px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105"
					>
						{t("verifyReminder.go")}
					</Button>
				</div>
			</div>
		</div>
	);
}
