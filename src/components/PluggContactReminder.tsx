"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function PluggContactReminder({
	className,
}: {
	className?: string;
}) {
	const { t } = useTranslation("plugg");
	const email = t("contact_reminder.email");

	return (
		<aside
			className={cn(
				"border-t border-dashed border-foreground/40 pt-6",
				className,
			)}
		>
			<div className="max-w-[60ch] space-y-1">
				<p className="font-semibold">{t("contact_reminder.title")}</p>
				<p className="text-muted-foreground">
					{t("contact_reminder.text_short")}{" "}
					<a
						href={`mailto:${email}`}
						className="font-medium text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:decoration-4"
					>
						{email}
					</a>
				</p>
			</div>
		</aside>
	);
}
