"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function PluggContactReminder({
	className,
}: {
	className?: string;
}) {
	const { t } = useTranslation("plugg");
	const email = t("contact_reminder.email");

	return (
		<Link href={`mailto:${email}`} className="block no-underline">
			<Alert
				className={`border-red-200 bg-red-50 text-red-900 transition-colors hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100 dark:hover:bg-red-950/55 ${className ?? ""}`}
			>
				<AlertTitle className="mb-2 text-lg font-semibold">
					{t("contact_reminder.title")}
				</AlertTitle>
				<AlertDescription className="text-sm leading-relaxed">
					{t("contact_reminder.text")}
				</AlertDescription>
			</Alert>
		</Link>
	);
}
