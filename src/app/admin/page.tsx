"use client";
import { useTranslation } from "react-i18next";

export default function AdminLanding() {
	const { t } = useTranslation("admin");
	return (
		<div className="flex flex-col items-center h-screen w-[80%] mx-auto">
			<h1 className="text-5xl font-extrabold text-primary mb-4 tracking-tight">{t("welcome.title")}</h1>
			<p className="text-lg text-muted-foreground mb-2">{t("welcome.message")}</p>
		</div>
	);
}
